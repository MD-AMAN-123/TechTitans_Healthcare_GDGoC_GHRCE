import React, { useState, useEffect } from 'react';
import { X, CreditCard, Lock, CheckCircle, ShieldCheck, Zap, Loader2, Smartphone, ArrowRight, Mail, MapPin } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    zip: ''
  });

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setFormData({ 
        email: '', 
        name: '', 
        cardNumber: '', 
        expiry: '', 
        cvc: '',
        zip: '' 
      });
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Format card number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const fillTestCard = () => {
    setFormData({
      email: 'alex.johnson@example.com',
      name: 'Dr. Alex Johnson',
      cardNumber: '4242 4242 4242 4242',
      expiry: '12/28',
      cvc: '123',
      zip: '90210'
    });
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if fields are filled
    const isFilled = formData.email.trim() !== '' &&
                     formData.name.trim() !== '' && 
                     formData.cardNumber.trim() !== '' && 
                     formData.expiry.trim() !== '' && 
                     formData.cvc.trim() !== '' &&
                     formData.zip.trim() !== '';

    if (!isFilled) {
      // If payment details not filled, simply get back to home page (Close without success)
      onClose();
      return;
    }

    // If filled, proceed with payment simulation
    setStep('processing');
    
    // Simulate API Transaction
    setTimeout(() => {
      setStep('success');
    }, 2500);
  };

  const handleFinalize = () => {
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        
        {/* Left Side: Order Summary */}
        <div className="bg-slate-50 p-6 md:w-2/5 border-r border-slate-100 flex flex-col justify-between hidden md:flex">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <Zap size={24} fill="currentColor" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Premium Plan</h2>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-600">Unlimited AI Health Analysis</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-600">Veo Video Generation Models</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-600">Advanced Trend Analytics</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-600">Priority Doctor Support</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-600">Family Health Sharing</p>
              </div>
            </div>
          </div>

          <div>
             <div className="flex justify-between items-end mb-2">
                <span className="text-slate-500 font-medium text-sm">Total due today</span>
                <span className="text-3xl font-bold text-slate-800">$19.99<span className="text-sm text-slate-400 font-normal">/mo</span></span>
             </div>
             <div className="bg-indigo-50 text-indigo-700 text-xs px-3 py-2 rounded-lg flex items-center gap-2 font-medium">
               <ShieldCheck size={14} />
               <span>100% Secure Payment. Cancel anytime.</span>
             </div>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="p-6 md:w-3/5 bg-white relative flex flex-col overflow-y-auto">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors z-10"
          >
            <X size={20} />
          </button>

          {step === 'form' && (
            <div className="animate-fade-in flex flex-col h-full">
              <div className="flex justify-between items-center mb-6 pr-10">
                <h3 className="text-xl font-bold text-slate-800">Payment Details</h3>
                <span className="md:hidden font-bold text-indigo-600">$19.99</span>
              </div>
              
              <button 
                type="button" 
                onClick={fillTestCard}
                className="mb-6 text-xs bg-slate-100 text-slate-500 py-1.5 px-3 rounded-md hover:bg-slate-200 w-fit transition-colors self-start"
              >
                Use Test Card Data
              </button>

              <form onSubmit={handlePay} className="space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cardholder Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="0000 0000 0000 0000"
                      className="w-full pl-10 pr-4 p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      maxLength={19}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expiry</label>
                    <input 
                      type="text" 
                      name="expiry"
                      value={formData.expiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      maxLength={5}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">CVC</label>
                    <div className="relative">
                       <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                       <input 
                        type="password" 
                        name="cvc"
                        value={formData.cvc}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full pl-9 pr-4 p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        maxLength={3}
                      />
                    </div>
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Billing ZIP / Postal Code</label>
                   <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        placeholder="12345"
                        className="w-full pl-10 pr-4 p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      />
                   </div>
                </div>

                <div className="pt-4 pb-2">
                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <Lock size={18} />
                    Confirm Payment
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'processing' && (
            <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in space-y-4 py-10">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-100 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">Processing Payment</h3>
                <p className="text-slate-500 text-sm">Securely contacting your bank...</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in space-y-4 py-10">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2 animate-bounce">
                <CheckCircle className="text-emerald-500 w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Payment Approved!</h3>
                <p className="text-slate-500 max-w-xs mx-auto mb-6 text-sm">Your transaction was successful. Please confirm to unlock your premium features.</p>
                
                <button 
                  onClick={handleFinalize}
                  className="bg-emerald-500 text-white py-3 px-6 rounded-xl font-bold text-base shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 w-full max-w-xs mx-auto"
                >
                  <span>Confirm & Unlock Features</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};