
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  APPOINTMENTS = 'APPOINTMENTS',
  LIVE_ASSISTANT = 'LIVE_ASSISTANT',
  PROFILE = 'PROFILE',
  ADMIN_PANEL = 'ADMIN_PANEL',
  AI_CHAT = 'AI_CHAT'
}

export interface HealthMetric {
  label: string;
  value: string | number;
  unit: string;
  change?: number; // percentage change
  trend: 'up' | 'down' | 'neutral';
  color: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
  sources?: { title: string; uri: string }[];
}

export interface Doctor {
  id: string | number;
  name: string;
  specialty: string;
  rating: number;
  image: string;
  match: number;
  price: number;
  about?: string;
  startTime?: string; // e.g. "09:00"
  endTime?: string;   // e.g. "17:00"
}

export interface Appointment {
  id: string;
  patientName?: string; // Added for Admin view
  patientMobile?: string; // Added for Admin view contact
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'pending' | 'upcoming' | 'completed' | 'cancelled';
  imageUrl: string;
  type: 'video' | 'in-person';
  location?: string;
  meetLink?: string; // Google Meet Link
}

export interface ChartDataPoint {
  day: string;
  value: number;
}

export interface HealthTip {
  id?: number | string; // Made optional/flexible to support both static and AI tips
  title: string;
  description?: string; // Made optional to support simple tips
  category: 'Wellness' | 'Fitness' | 'Nutrition' | 'Medical' | 'Lifestyle' | 'Mental';
  readTime?: string;
  image?: string;
  videoUrl?: string; // New field for Veo video URL
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  isTaken: boolean;
  reminderEnabled?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'alert' | 'success';
  read: boolean;
}
