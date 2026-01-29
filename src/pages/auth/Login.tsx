import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLoginMutation } from '../../services/rssApi';
import { useAppDispatch } from '../../hook/store';
import { setCredentials } from '../../store/slices/authSlice';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import flagIcon1 from "../../../src/assets/flagIcon1.png";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation State (Key-Pair Errors)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    const newErrors: typeof errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Basic Validation logic using translation keys
    if (!email.trim()) {
      newErrors.email = t('email_blank_error');
    }
    else if (!emailPattern.test(email)) {
    newErrors.email = t('email_invalid_error');  
  }
    if (!password.trim()) {
      newErrors.password = t('password_blank_error');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({}); // Clear UI errors before API call

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials(result));
      navigate('/dashboard');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      setErrors({ general: t('invalid_credentials_msg') });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="max-w-[450px] w-full bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <img src={flagIcon1} alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-[20px] font-bold text-rose-800">{t('sidebarHeading')}</h1>
          <h1 className="text-[20px] font-bold text-[#1a1a1a] m-5">{t('archives')}</h1>
        </div>

        {/* General Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex gap-2 animate-in fade-in zoom-in duration-300">
            <AlertCircle size={18} /> {errors.general}
          </div>
        )}

        <form onSubmit={handleLogin} noValidate className="space-y-6">
          
          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-[13px] font-bold text-gray-400 ml-1 uppercase tracking-wider">{t('email_label')}</label>
            <div className="relative">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.email ? 'text-red-500' : 'text-gray-400'}`} size={20} />
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className={`w-full pl-12 pr-12 py-4 bg-[#f9fafb] border rounded-[16px] outline-none transition-all ${
                  errors.email ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-200 focus:border-[#f97316]'
                }`}
              />
              {errors.email && <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />}
            </div>
            {errors.email && <p className="text-red-500 text-xs font-medium ml-1 mt-1">{errors.email}</p>}
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-[13px] font-bold text-gray-400 ml-1 uppercase tracking-wider">{t('password_label')}</label>
            <div className="relative">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.password ? 'text-red-500' : 'text-gray-400'}`} size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                className={`w-full pl-12 pr-12 py-4 bg-[#f9fafb] border rounded-[16px] outline-none transition-all ${
                  errors.password ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-200 focus:border-[#f97316]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {/* If error exists, show error icon, otherwise show eye toggle */}
                {errors.password ? <AlertCircle className="text-red-500" size={20} /> : (showPassword ? <EyeOff size={20} /> : <Eye size={20} />)}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs font-medium ml-1 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#f97316] text-white font-bold rounded-[16px] hover:bg-[#ea580c] transition-all shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={22} /> : t('sign_in')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;