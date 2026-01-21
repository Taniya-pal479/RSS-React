import React, { useState } from 'react';
import {  Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus, Mail, Lock, User, ShieldCheck } from 'lucide-react';

const RegisterPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Mutation temporarily removed to fix export error
    console.log("Form Data:", formData);
    alert("Registration functionality is temporarily disabled.");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="max-w-[450px] w-full bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-[#f97316]" size={32} />
          </div>
          <h1 className="text-[28px] font-bold text-[#1a1a1a]">
            {t('create_account')}
          </h1>
          <p className="text-gray-400 mt-2 font-medium">
            {t('auth_subtext_register')}
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Full Name Field */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('full_name')}
              className="w-full pl-12 pr-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-[16px] outline-none focus:border-[#f97316] focus:ring-4 focus:ring-orange-50 transition-all"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          {/* Email Field */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              placeholder={t('email_label')}
              className="w-full pl-12 pr-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-[16px] outline-none focus:border-[#f97316] focus:ring-4 focus:ring-orange-50 transition-all"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              placeholder={t('password_label')}
              className="w-full pl-12 pr-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-[16px] outline-none focus:border-[#f97316] focus:ring-4 focus:ring-orange-50 transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-400 ml-1 uppercase tracking-wider">
              {t('role_label')}
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select 
                className="w-full pl-12 pr-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-[16px] outline-none appearance-none focus:border-[#f97316]"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="user">{t('user_role')}</option>
                <option value="admin">{t('admin_role')}</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#f97316] text-white font-bold rounded-[16px] hover:bg-[#ea580c] transition-all shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 mt-4"
          >
            {t('sign_up')}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500 font-medium">
          {t('have_account')}{' '}
          <Link to="/login" className="text-[#f97316] font-bold hover:underline">
            {t('sign_in')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;