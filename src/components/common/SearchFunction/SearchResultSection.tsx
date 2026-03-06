import {ChevronRight} from 'lucide-react';
import { t } from 'i18next';
import type { SearchItem, SearchResultSectionProps } from '../../../types';

export const SearchResultSection = <T extends SearchItem>({
  title,
  icon: Icon,
  items,
  onSelect,
  renderItem,
}: SearchResultSectionProps<T>) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="border-b border-slate-50 max-h-50 overflow-y-auto custom-scrollbar relative">
      <header className="sticky top-0 z-10 bg-slate-100 px-4 py-2 text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <Icon size={12} /> {t(title)}
      </header>
      {items.map((item) => (
        <div 
          key={item.id} 
          onClick={() => onSelect(item)}
          className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer group transition-all"
        >
          {renderItem ? renderItem(item) : (
            <span   onClick={() => onSelect(item)}  className="text-sm font-bold text-slate-700 group-hover:text-orange-600">
              {item.name}
            </span>
          )}
          <ChevronRight size={14} className="text-slate-200 group-hover:text-orange-500 transition-colors" />
        </div>
      ))}
    </section>
  );
};