import { GoogleGenAI, Chat, Type, Modality, LiveServerMessage, FunctionDeclaration } from "@google/genai";
import { HealthTip, Doctor } from "../types";

let chatSession: Chat | null = null;

// Helper to get a fresh client. 
// Important for Veo which might require a specific API key selected via UI.
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found via process.env.API_KEY");
    // Fallback to a throw to ensure we don't send garbage to the API which might cause 500s
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

export const initializeChat = async (): Promise<Chat> => {
  try {
    const ai = getClient();

    // Using gemini-3-pro-preview for advanced reasoning and symptom checking
    chatSession = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `You are "MediPulse", a warm, empathetic, and highly knowledgeable AI medical assistant. 
        
        Your Core Mission:
        To listen to patients, analyze their symptoms, provide basic answers about medical conditions, and offer clear, accurate, and comforting health information.
        
        Tone & Persona:
        - Friendly & Attractive: Use a conversational, caring tone. Use comforting emojis occasionally (e.g., 🩺, 💙, ✨) to make the user feel at ease.
        - Professional: Maintain medical accuracy while being accessible.
        - Empathetic: Acknowledge the user's feelings (e.g., "I'm sorry to hear you're feeling that way").

        Key Responsibilities:
        1. Basic Medical Answers: Provide straightforward, easy-to-understand explanations for common medical terms, conditions, and health questions.
        2. Symptom Analysis: Help users understand what their symptoms might mean without giving a definitive diagnosis.
        3. Wellness Guidance: Offer advice on healthy living, nutrition, and mental well-being.

        Guidelines:
        1. Symptom Analysis: Ask clarifying questions if the user's description is vague.
        2. Clarity: Explain medical terms in simple language.
        3. Safety First: If symptoms sound severe (chest pain, difficulty breathing, etc.), immediately advise calling emergency services.
        4. Disclaimer: ALWAYS include a disclaimer in your first response or when giving specific medical advice: "I am an AI assistant, not a doctor. Please consult a healthcare professional for a formal diagnosis."
        5. Innovation: Mention how modern monitoring (like heart rate tracking) can help manage their condition if relevant.
        `,
        temperature: 0.7,
        tools: [{ googleSearch: {} }],
      },
    });

    return chatSession;
  } catch (error) {
    console.error("Failed to initialize chat:", error);
    throw error;
  }
};

export interface StreamUpdate {
  text?: string;
  sources?: { title: string; uri: string }[];
}

export const sendMessageToGemini = async (message: string): Promise<AsyncIterable<StreamUpdate>> => {
  // Attempt to initialize if session doesn't exist
  if (!chatSession) {
    try {
      await initializeChat();
    } catch (e) {
      console.error("Chat init failed", e);
      async function* errorGen() {
        yield { text: "⚠️ **Connection Error**: I couldn't initialize the medical database. Please check your internet connection or API key." };
      }
      return errorGen();
    }
  }

  // Create a generator to yield chunks of text and metadata
  async function* streamGenerator() {
    try {
      const result = await chatSession!.sendMessageStream({ message });

      for await (const chunk of result) {
        const update: StreamUpdate = {};

        if (chunk.text) {
          update.text = chunk.text;
        }

        // Extract grounding metadata
        const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
          const sources = groundingChunks
            .map((c: any) => c.web)
            .filter((w: any) => w)
            .map((w: any) => ({ title: w.title, uri: w.uri }));

          if (sources.length > 0) {
            update.sources = sources;
          }
        }

        yield update;
      }
    } catch (error: any) {
      console.error("Error sending message to Gemini:", error);

      let errorMessage = "I'm having trouble connecting to the medical database right now. Please try again later.";

      // Robust error parsing to handle nested JSON error objects often returned by GenAI SDK
      let errString = "";
      try {
        errString = JSON.stringify(error);
        // Sometimes error is an object with a message property
        if (error?.message) errString += " " + error.message;
        // Sometimes deeply nested
        if (error?.error?.message) errString += " " + error.error.message;
      } catch {
        errString = String(error);
      }

      // Check specifically for 429 / Quota errors
      if (
        errString.includes("429") ||
        errString.includes("RESOURCE_EXHAUSTED") ||
        errString.includes("quota")
      ) {
        // Minified HTML to prevent layout issues with newline replacement in frontend
        errorMessage = `<div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 16px; margin-top: 8px;"><div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: bold; color: #dc2626;"><span style="font-size: 1.25rem;">⚠️</span><span>Service Limit Reached</span></div><p style="margin: 0; color: #7f1d1d; opacity: 0.9; font-size: 0.9rem; line-height: 1.4;">I've received too many requests recently and need a moment to cool down (Quota Exceeded).</p><p style="margin-top: 8px; font-size: 0.8rem; color: #991b1b; opacity: 0.8;">Please try asking your question again in a minute.</p></div>`;
      }

      yield { text: errorMessage };
    }
  }

  return streamGenerator();
};

export const generateHealthInsights = async (metrics: any[], mood?: string | null): Promise<HealthTip[]> => {
  try {
    const ai = getClient();
    // Format metrics for the prompt
    const metricsString = metrics.map(m => `${m.label}: ${m.value} ${m.unit} (${m.trend === 'up' ? 'increasing' : m.trend === 'down' ? 'decreasing' : 'stable'})`).join(', ');

    const moodContext = mood
      ? `The user reported their mood today is: "${mood}". Adjust your recommendations to fit this emotional state (e.g., if Terrible/Bad focus on mental relief/rest, if Good/Great focus on maintenance/challenge).`
      : '';

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an AI medical assistant. Analyze these user health metrics: [${metricsString}]. ${moodContext}
      Based on these, generate 3 personalized, specific, and actionable health tips or insights.
      Keep descriptions concise (under 15 words).`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['Wellness', 'Fitness', 'Nutrition', 'Medical', 'Mental'] }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as HealthTip[];
    }
    return [];
  } catch (error) {
    console.error("Error generating insights (likely quota):", error);
    // Silent Fallback data in case of API error or quota limits to keep dashboard beautiful
    return [
      { title: "Hydration Check", description: "Water intake is vital. Aim for 2L daily.", category: "Nutrition" },
      { title: "Sleep Consistency", description: "Try to go to bed at the same time tonight.", category: "Wellness" },
      { title: "Movement Break", description: "Take a 5-minute walk to boost circulation.", category: "Fitness" }
    ];
  }
}

export const generateVideoForTip = async (tip: HealthTip): Promise<string | null> => {
  const ai = getClient();

  try {
    // Construct a prompt based on the text description of the tip
    const textContext = tip.description ? tip.description : `A health tip about ${tip.title}`;
    const prompt = `A cinematic, realistic, high-quality video illustrating the following health concept: "${tip.title}". Context from text: "${textContext}". The video should be educational and visually demonstrate the advice in a ${tip.category} setting.`;

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Polling for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;

    // We append the key in the component when rendering, but returning the raw URI here.
    return videoUri || null;
  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
};

export const generateHealthImage = async (tip: HealthTip, size: '1K' | '2K' | '4K'): Promise<string | null> => {
  const ai = getClient();
  const textContext = tip.description ? tip.description : tip.title;
  const prompt = `A photorealistic, high-quality, inspirational health image representing: ${tip.title}. Context: ${textContext}. ${tip.category} style. Bright, clean, wellness aesthetic, professional photography.`;

  // Helper to extract image from response
  const extractImage = (response: any) => {
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    return null;
  };

  try {
    // Primary Model: gemini-3-pro-image-preview
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: size
        }
      }
    });

    return extractImage(response);

  } catch (error: any) {
    console.warn("Primary image model failed, attempting fallback...", error);

    // Fallback Model: gemini-2.5-flash-image
    // Note: This model might not support specific imageSize configs, so we omit them.
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          }
        }
      });
      return extractImage(response);
    } catch (fallbackError) {
      console.error("Fallback image generation also failed:", fallbackError);
      // Re-throw the original error to be handled by the UI (so 429s are visible)
      throw error;
    }
  }
};

// --- Audio Decoding Helpers for TTS & Live API ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// TTS Function
export const generateSpeech = async (text: string): Promise<AudioBuffer | null> => {
  if (!text) return null;
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'], // Using string literal "AUDIO" to avoid enum issues
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      console.warn("No audio data returned from Gemini TTS");
      return null;
    }

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );

    return audioBuffer;

  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

// --- LIVE API IMPLEMENTATION ---

let liveSession: any = null;
let inputAudioContext: AudioContext | null = null;
let outputAudioContext: AudioContext | null = null;
let inputSource: MediaStreamAudioSourceNode | null = null;
let processor: ScriptProcessorNode | null = null;
let nextStartTime = 0;
const sources = new Set<AudioBufferSourceNode>();

function createPcmBlob(data: Float32Array): { data: string, mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- TOOLS DEFINITIONS ---

const updateProfileTool: FunctionDeclaration = {
  name: "updateProfile",
  description: "Updates the user's profile details including name, email, or mobile number.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "The user's full name" },
      email: { type: Type.STRING, description: "The user's email address" },
      mobile: { type: Type.STRING, description: "The user's mobile number (10 digits)" }
    },
    required: []
  }
};

const bookAppointmentTool: FunctionDeclaration = {
  name: "bookAppointment",
  description: "Books a new medical appointment with a specific doctor.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      doctorName: { type: Type.STRING, description: "The name of the doctor" },
      specialty: { type: Type.STRING, description: "The doctor's specialty (e.g., Cardiologist, Dermatologist)" },
      date: { type: Type.STRING, description: "Date of appointment (e.g., 'Today', 'Tomorrow', 'Oct 28')" },
      time: { type: Type.STRING, description: "Time of appointment (e.g., '10:00', '14:30')" },
      type: { type: Type.STRING, enum: ["video", "in-person"], description: "Type of appointment" }
    },
    required: ["doctorName", "specialty", "date", "time", "type"]
  }
};

const addDoctorTool: FunctionDeclaration = {
  name: "addDoctor",
  description: "ADMIN ONLY: Adds a new doctor to the available specialists list.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Doctor's Full Name (e.g., Dr. Jane Doe)" },
      specialty: { type: Type.STRING, description: "Medical Specialty (e.g., Neurologist)" },
      price: { type: Type.NUMBER, description: "Consultation price in dollars" },
      rating: { type: Type.NUMBER, description: "Initial rating (0-5), default 4.8" }
    },
    required: ["name", "specialty"]
  }
};

const updateAppointmentTool: FunctionDeclaration = {
  name: "updateAppointment",
  description: "ADMIN ONLY: Updates an existing appointment details like date, time or status. Requires the appointmentId which is visible in the context.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      appointmentId: { type: Type.STRING, description: "The ID of the appointment to update" },
      date: { type: Type.STRING, description: "New date (e.g. 'Tomorrow', 'Oct 28')" },
      time: { type: Type.STRING, description: "New time (e.g. '10:00')" },
      status: { type: Type.STRING, enum: ['upcoming', 'cancelled', 'completed', 'pending'], description: "New status" }
    },
    required: ["appointmentId"]
  }
};

const deleteAppointmentTool: FunctionDeclaration = {
  name: "deleteAppointment",
  description: "ADMIN ONLY: Permanently deletes or cancels an appointment record using its ID.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      appointmentId: { type: Type.STRING, description: "The ID of the appointment to delete" }
    },
    required: ["appointmentId"]
  }
};


export interface LiveContext {
  userName: string;
  metrics: any[];
  appointments: any[];
  isAdmin: boolean;
  doctors: Doctor[];
}

export const connectLive = async (
  context: LiveContext,
  callbacks: {
    onStatusChange: (status: 'connected' | 'disconnected' | 'error' | 'permission_denied') => void;
    onVolume: (vol: number) => void;
    onUpdateProfile: (data: { name?: string; email?: string; mobile?: string }) => void;
    onBookAppointment: (data: { doctorName: string; specialty: string; date: string; time: string; type: 'video' | 'in-person' }) => void;
    onAddDoctor?: (data: { name: string; specialty: string; price?: number; rating?: number }) => void;
    onUpdateAppointment?: (data: { appointmentId: string; date?: string; time?: string; status?: string }) => void;
    onDeleteAppointment?: (data: { appointmentId: string }) => void;
  }
) => {
  // 1. Setup Audio Contexts
  inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

  // Ensure context is running (sometimes needed if created outside gesture, though here it is inside)
  if (inputAudioContext.state === 'suspended') await inputAudioContext.resume();
  if (outputAudioContext.state === 'suspended') await outputAudioContext.resume();

  const ai = getClient();

  // Prepare Context String for System Instruction
  const metricsStr = context.metrics.map(m => `${m.label}: ${m.value} ${m.unit}`).join(', ');

  // For Admin: Include IDs and Patient Names in the appointment context
  const aptsStr = context.appointments.map(a =>
    `[ID: ${a.id}] Patient: ${a.patientName || 'Guest'} | Dr. ${a.doctorName} (${a.specialty}) | Date: ${a.date} | Time: ${a.time} | Status: ${a.status}`
  ).join('\n');

  const doctorsStr = context.doctors.map(d => `${d.name} (${d.specialty})`).join(', ');

  let adminInstruction = "";
  let activeTools = [updateProfileTool, bookAppointmentTool];

  if (context.isAdmin) {
    adminInstruction = `
       5. ADMIN MODE ACTIVE: You are speaking to an Administrator.
          - You have FULL ACCESS to view and modify all appointment data.
          - The appointment list provided contains IDs (e.g., [ID: 1]). Use these IDs to perform updates or deletions.
          - You can:
             - ADD new doctors using 'addDoctor'.
             - UPDATE appointments (reschedule, change status) using 'updateAppointment'.
             - DELETE appointments using 'deleteAppointment'.
          - If the admin asks to "delete patient [Name]" or "remove [Name] from the list", FIND ALL appointment IDs associated with that patient name from the context and call 'deleteAppointment' for the relevant ID.
          - If the admin asks to "cancel the appointment for [Patient Name]", find the ID from the context and call 'deleteAppointment'.
          - If the admin asks to "change the time for [Patient Name]", call 'updateAppointment'.
       `;
    activeTools.push(addDoctorTool, updateAppointmentTool, deleteAppointmentTool);
  }

  const systemInstruction = `
    You are MediBot, the advanced AI voice assistant for the MediPulse AI app.
    
    Your Capabilities:
    1. APP INFORMATION: You can explain features like the Dashboard, Symptom Checker, Vitals Logging, and Appointment Booking.
    2. USER CONTEXT: You have access to the user's live data.
       - User Name: ${context.userName}
       - Current Health Vitals: ${metricsStr || 'No vitals logged yet'}
       - Appointments List: 
       ${aptsStr || 'No upcoming appointments'}
       
       - Available Doctors: ${doctorsStr}
    3. MEDICAL KNOWLEDGE: Provide general medical information, symptom analysis, and wellness advice.
    4. MULTILINGUAL: You MUST detect the language the user is speaking and respond in that SAME language.
    ${adminInstruction}
    5. ACTIONS: You can update profile details (name, email, mobile) and book appointments using the available tools.

    Rules:
    - Answer immediately and concisely. Speed is priority. Keep responses to 1-2 sentences unless asked for more detail.
    - Be warm and professional.
    - Do not diagnose. Always add a disclaimer for serious medical queries.
    - If user wants to change their name or book a doctor, CALL THE TOOL immediately.
    `;

  try {
    // 2. Get Microphone Stream
    // Wrapped in try-catch to explicitly handle permission errors
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: any) {
      console.error("Microphone permission failed:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDismissedError') {
        callbacks.onStatusChange('permission_denied');
      } else {
        callbacks.onStatusChange('error');
      }
      return;
    }

    // 3. Connect to Live API
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          callbacks.onStatusChange('connected');

          // Setup Input Processing
          if (!inputAudioContext) return;
          inputSource = inputAudioContext.createMediaStreamSource(stream);
          processor = inputAudioContext.createScriptProcessor(4096, 1, 1);

          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);

            // Calculate volume for visualizer
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
            callbacks.onVolume(Math.sqrt(sum / inputData.length));

            const pcmBlob = createPcmBlob(inputData);

            sessionPromise.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };

          inputSource.connect(processor);
          processor.connect(inputAudioContext.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          // Handle Tool Calls
          if (message.toolCall) {
            for (const fc of message.toolCall.functionCalls) {
              let result = { status: 'ok' };

              try {
                if (fc.name === 'updateProfile') {
                  callbacks.onUpdateProfile(fc.args as any);
                  result = { status: 'profile updated successfully' };
                } else if (fc.name === 'bookAppointment') {
                  callbacks.onBookAppointment(fc.args as any);
                  result = { status: 'appointment booked successfully' };
                } else if (fc.name === 'addDoctor' && context.isAdmin) {
                  if (callbacks.onAddDoctor) {
                    callbacks.onAddDoctor(fc.args as any);
                    result = { status: 'doctor added successfully' };
                  } else {
                    result = { status: 'error: capability not available' };
                  }
                } else if (fc.name === 'updateAppointment' && context.isAdmin) {
                  if (callbacks.onUpdateAppointment) {
                    callbacks.onUpdateAppointment(fc.args as any);
                    result = { status: 'appointment updated successfully' };
                  } else {
                    result = { status: 'error: capability not available' };
                  }
                } else if (fc.name === 'deleteAppointment' && context.isAdmin) {
                  if (callbacks.onDeleteAppointment) {
                    callbacks.onDeleteAppointment(fc.args as any);
                    result = { status: 'appointment deleted successfully' };
                  } else {
                    result = { status: 'error: capability not available' };
                  }
                }
              } catch (err) {
                console.error("Tool execution failed", err);
                result = { status: 'error executing action' };
              }

              // Send response back to model
              sessionPromise.then((session) => {
                session.sendToolResponse({
                  functionResponses: {
                    id: fc.id,
                    name: fc.name,
                    response: { result },
                  }
                });
              });
            }
          }

          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;

          if (base64Audio && outputAudioContext) {
            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);

            const audioBuffer = await decodeAudioData(
              decode(base64Audio),
              outputAudioContext,
              24000,
              1
            );

            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.destination);

            source.addEventListener('ended', () => {
              sources.delete(source);
            });

            source.start(nextStartTime);
            nextStartTime += audioBuffer.duration;
            sources.add(source);
          }

          if (message.serverContent?.interrupted) {
            sources.forEach(s => s.stop());
            sources.clear();
            nextStartTime = 0;
          }
        },
        onclose: () => {
          callbacks.onStatusChange('disconnected');
          disconnectLive();
        },
        onerror: (e) => {
          console.error("Live API Error:", e);
          callbacks.onStatusChange('error');
          disconnectLive();
        }
      },
      config: {
        responseModalities: [Modality.AUDIO], // Use Modality.AUDIO enum
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        },
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 0 },
        tools: [{ functionDeclarations: activeTools }]
      }
    });

    liveSession = sessionPromise;

  } catch (error) {
    console.error("Failed to connect live:", error);
    callbacks.onStatusChange('error');
  }
};

export const disconnectLive = () => {
  // Stop Microphone
  if (inputSource) {
    try {
      inputSource.mediaStream.getTracks().forEach(track => track.stop());
      inputSource.disconnect();
    } catch (e) { }
    inputSource = null;
  }
  if (processor) {
    try {
      processor.disconnect();
    } catch (e) { }
    processor = null;
  }
  if (inputAudioContext) {
    try {
      inputAudioContext.close();
    } catch (e) { }
    inputAudioContext = null;
  }

  // Stop Output
  sources.forEach(s => {
    try { s.stop(); } catch (e) { }
  });
  sources.clear();

  if (outputAudioContext) {
    try {
      outputAudioContext.close();
    } catch (e) { }
    outputAudioContext = null;
  }

  // Close Session
  // Note: session.close() is not explicitly in the promise if rejected, but let's try to close if existing
  if (liveSession) {
    liveSession.then((s: any) => {
      try { s.close(); } catch (e) { }
    }).catch(() => { });
    liveSession = null;
  }
};