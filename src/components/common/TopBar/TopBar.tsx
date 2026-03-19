import { useEffect, useRef,useState } from 'react';
import { Search, Bell} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../hook/store';
import { setSearchQuery} from '../../../store/slices/uiSlice';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import UserSection from '../UserSection/UserSection';
 
import GlobalSearchDropdown from '../GlobalSearchDropdown';
 
const TopBar = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
 
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);

  const [isDropdownOpen,setIsDropdownOpen]=useState<boolean>(false)
  const searchContainerRef=useRef<HTMLDivElement>(null);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatch(setSearchQuery(value));
  

  if (value.trim().length > 0 ) {
     setIsDropdownOpen(true)
    }
   else{
    setIsDropdownOpen(false)
   }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        
         
      </div>

      <div className="flex items-center gap-4">
        <div ref={searchContainerRef} className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-64 focus-within:ring-2 ring-saffron-100 transition-all">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleInputChange}
            placeholder={t("search_placeholder")} 
            className="bg-transparent border-none outline-none ml-2 text-sm w-full text-gray-700" 
          />
        </div>
        {isDropdownOpen && searchQuery.trim().length > 0 && (
            <div className="absolute top-20 left-200 right-0 w-112.5 mt-2 shadow-2xl z-60">
               <GlobalSearchDropdown />
            </div>
          )}
        
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