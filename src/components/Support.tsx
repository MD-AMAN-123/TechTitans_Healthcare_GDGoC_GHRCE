import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, HelpCircle, ChevronRight, CheckCircle } from 'lucide-react';

const Support: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        setTimeout(() => {
            setIsSubmitted(false);
            setName('');
            setEmail('');
            setMessage('');
        }, 3000);
    };

    const faqs = [
        {
            question: "How do I book an appointment?",
            answer: "Go to the 'Book' tab, select a doctor, choose a date and time, and confirm your booking."
        },
        {
            question: "Can I cancel my appointment?",
            answer: "Yes, you can cancel appointments from the Appointments tab up to 24 hours before the scheduled time."
        },
        {
            question: "Is my medical data secure?",
            answer: "Absolutely. We use end-to-end encryption to ensure your personal health information is protected."
        },
        {
            question: "How acts the AI Chatbot?",
            answer: "Our AI chatbot uses advanced models to provide preliminary health advice and symptom checking. It is not a replacement for professional medical advice."
        }
    ];

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Customer Support</h1>
                <p className="text-slate-500 dark:text-slate-400">We're here to help you live healthier.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Form */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-fade-in">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-2xl text-teal-600 dark:text-teal-400">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Send us a message</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">We usually reply within 24 hours.</p>
                        </div>
                    </div>

                    {isSubmitted ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Message Sent!</h3>
                            <p className="text-slate-500 dark:text-slate-400">Thank you for contacting us. We'll be in touch shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all resize-none"
                                    placeholder="How can we help?"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Send size={18} />
                                Send Message
                            </button>
                        </form>
                    )}
                </div>

                {/* Contact Info & FAQ */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg animate-fade-in delay-75">
                        <h2 className="text-xl font-bold mb-6">Contact Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold opacity-90">Email</p>
                                    <p className="text-indigo-100 text-sm">support@medipulse.ai</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold opacity-90">Phone</p>
                                    <p className="text-indigo-100 text-sm">+91 9059089036</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold opacity-90">Office</p>
                                    <p className="text-indigo-100 text-sm">Hyderabad,Telangana</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Accordion */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-fade-in delay-100">
                        <div className="flex items-center gap-2 mb-4">
                            <HelpCircle className="text-teal-500" size={20} />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">FAQ</h2>
                        </div>
                        <div className="space-y-3">
                            {faqs.map((faq, index) => (
                                <details key={index} className="group p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl open:bg-white dark:open:bg-slate-800 transition-all cursor-pointer">
                                    <summary className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-300 list-none">
                                        {faq.question}
                                        <ChevronRight size={16} className="text-slate-400 transform group-open:rotate-90 transition-transform" />
                                    </summary>
                                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-1">
                                        {faq.answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
