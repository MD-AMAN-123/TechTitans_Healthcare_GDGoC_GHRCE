import React, { useState } from 'react';
import { ArrowRight, Loader2, User, Shield, X, KeyRound, Lock, AlertTriangle, Phone } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const MediPulseLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heartGradientLogin" x1="10" y1="10" x2="90" y2="90">
        <stop offset="0%" stopColor="#1e3a8a" /> {/* Brand Blue */}
        <stop offset="50%" stopColor="#2dd4bf" /> {/* Teal */}
        <stop offset="100%" stopColor="#84cc16" /> {/* Brand Lime */}
      </linearGradient>
      <linearGradient id="ringGradientLogin" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#84cc16" stopOpacity="0.8" />
      </linearGradient>
    </defs>

    {/* Outer Ring */}
    <circle cx="50" cy="50" r="46" stroke="url(#ringGradientLogin)" strokeWidth="3" />

    {/* Heart Shape */}
    <path
      d="M50 88C50 88 18 65 18 38C18 25 28 18 38 18C45 18 50 24 50 24C50 24 55 18 62 18C72 18 82 25 82 38C82 65 50 88 50 88Z"
      fill="url(#heartGradientLogin)"
    />

    {/* ECG Pulse Line (White) */}
    <path
      d="M28 50H38L44 32L54 68L62 44L68 50H76"
      stroke="white"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="76" cy="50" r="3" fill="white" />
  </svg>
);

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin Auth State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [inputPassword, setInputPassword] = useState('');

  // Guest Auth State
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestMobile, setGuestMobile] = useState('');
  const [guestName, setGuestName] = useState('');

  // Real-time Google Login Implementation
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch user details using the access token
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        // Pass the user data to the parent component
        onLogin(userInfo.data);
      } catch (err) {
        console.error("Google Login Error:", err);
        setError("Failed to retrieve user information. Please try Guest Mode.");
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error("Google Login Failed:", errorResponse);
      // Detailed error message for the user
      setError("Sign-In failed. This often happens if the 'Authorized Origin' is missing in Google Cloud Console. Please try Guest Mode.");
      setIsLoading(false);
    },
  });

  const handleGoogleLogin = () => {
    setError(null);
    try {
      googleLogin();
    } catch (e) {
      console.error("Failed to initiate Google Login:", e);
      setError("Login initialization failed. Please use Guest Mode.");
    }
  };

  const handleGuestLoginClick = () => {
    setGuestMobile('');
    setGuestName('');
    setError(null);
    setIsGuestModalOpen(true);
  };

  const submitGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Mobile Number: Must be exactly 10 digits
    if (!guestMobile || guestMobile.length !== 10 || !/^\d+$/.test(guestMobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsGuestModalOpen(false);
    setIsLoading(true);

    setTimeout(() => {
      onLogin({
        name: guestName || "Guest User",
        given_name: guestName ? guestName.split(' ')[0] : "Guest",
        email: "guest@medipulse.ai",
        picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (guestName || "Guest"),
        mobile: guestMobile
      });
    }, 800);
  };

  // 1. Open Admin Modal
  const handleAdminClick = () => {
    setInputPassword('');
    setError(null);
    setIsAdminModalOpen(true);
  };

  // 2. Verify Static Password
  const verifyAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Check against the default password: "admin@123"
    if (inputPassword === 'admin@123') {
      setIsAdminModalOpen(false);
      setIsLoading(true);

      setTimeout(() => {
        onLogin({
          name: "Administrator",
          given_name: "Admin",
          email: "admin@medipulse.ai",
          picture: "",
          role: "admin"
        });
      }, 800);
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-sans transition-colors duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl p-8 w-full max-w-md text-center animate-fade-in border border-slate-100 dark:border-slate-800 transition-all">
        {/* Attractive Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="mb-4">
            <MediPulseLogo className="w-24 h-24 animate-heartbeat" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-[#1e3a8a] dark:text-blue-500">Medi</span>
            <span className="text-[#84cc16] dark:text-lime-400">pulse</span>
          </h1>
        </div>

        <p className="text-slate-500 dark:text-slate-400 mb-8 px-4 font-medium leading-relaxed">
          Your personal health assistant powered by advanced artificial intelligence.
        </p>

        {error && !isAdminModalOpen && !isGuestModalOpen && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-xs text-left flex gap-2 items-start">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group relative overflow-hidden shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin text-slate-400" size={20} />
            ) : (
              <>
                {/* Google Icon SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="font-bold text-slate-700 dark:text-slate-200">Sign in with Google</span>
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full absolute"></div>
            <span className="bg-slate-50 dark:bg-slate-900 px-3 text-xs text-slate-400 relative z-10 font-bold tracking-wide">OR</span>
          </div>

          <button
            onClick={handleGuestLoginClick}
            disabled={isLoading}
            className="w-full bg-[#1e3a8a] dark:bg-blue-600 text-white border border-transparent rounded-2xl p-4 flex items-center justify-center gap-3 hover:bg-blue-900 dark:hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin text-white/80" size={20} />
            ) : (
              <>
                <User size={20} />
                <span className="font-bold">Continue as Guest</span>
                <ArrowRight className="ml-auto opacity-80" size={20} />
              </>
            )}
          </button>

          {/* Admin Login Button (Discrete) */}
          <button
            onClick={handleAdminClick}
            disabled={isLoading}
            className="w-full mt-2 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-transparent rounded-2xl p-3 flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin text-slate-400" size={16} />
            ) : (
              <>
                <Shield size={16} />
                <span className="font-semibold text-xs">Admin Access</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 text-xs font-medium text-slate-400">
          <a href="#" className="hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-colors">Terms of Service</a>
        </div>
      </div>

      {/* Guest Details Modal */}
      {isGuestModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-8 relative overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsGuestModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-4">
                <User className="text-teal-600 dark:text-teal-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Guest Details</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Please provide your details to continue.</p>
            </div>

            <form onSubmit={submitGuestLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Name (Optional)</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Guest User"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-800 dark:text-white"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Mobile Number (Mandatory)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="tel"
                    value={guestMobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setGuestMobile(val);
                      setError(null);
                    }}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center flex items-center justify-center gap-1">
                  <AlertTriangle size={12} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-all"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Verification Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-8 relative overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsAdminModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                <KeyRound className="text-indigo-600 dark:text-indigo-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Admin Authentication</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Enter your administrator credentials.</p>
            </div>

            <form onSubmit={verifyAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={inputPassword}
                    onChange={(e) => {
                      setInputPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all"
              >
                Verify & Access
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;