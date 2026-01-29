import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../hook/store';
import { setSearchQuery, toggleSidebar } from '../../../store/slices/uiSlice';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import UserSection from '../UserSection/UserSection';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-empty-pattern
const TopBar = ({ }: { title?: string }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate=useNavigate()
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatch(setSearchQuery(value));
  

  if (value.trim().length > 0 && window.location.pathname !== '/search-results') {
      navigate('/search-results');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={() => dispatch(toggleSidebar())} className="lg:hidden text-gray-500">
          <Menu size={24} />
        </button>
         
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-64 focus-within:ring-2 ring-saffron-100 transition-all">
          <Search size={18} className="text-gray-400" />
          {/* Replaced hardcoded search placeholder */}
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleInputChange}
            placeholder={t("search_placeholder")} 
            className="bg-transparent border-none outline-none ml-2 text-sm w-full text-gray-700" 
          />
        </div>
        
        <LanguageSelector/>

        <button hidden className="relative p-2.5 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-saffron-600 hover:border-saffron-200 transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

         <UserSection/>
      </div>
    </header>
  );
};

export default TopBar;