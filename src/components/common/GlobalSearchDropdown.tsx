import { useMemo, useState, useRef, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  FileText,
  Folder,
  ChevronRight,
  Tags,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { useAppSelector } from "../../hook/store";
import {
  useGetAllFilesQuery,
  useGlobalSearchQuery,
} from "../../services/rssApi";
import { t } from "i18next";
import { useDebounce } from "../../hook/useDebounce";
import type {
  CategoryResult,
  ContentResult,
  GlobalSearchResult,
  SubCategoryResult,
} from "../../types/index";
import i18n from "../../i18n";

// --- TYPES ---
interface SearchResultItem {
  id: string | number;
  title?: string;
  type?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface SearchResultSectionProps<T> {
  title: string;
  icon: LucideIcon;
  items: T[];
  renderItem: (item: T) => ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const SearchResultSection = <T extends SearchResultItem>({
  title,
  icon: Icon,
  items,
  renderItem,
  onLoadMore,
  hasMore,
}: SearchResultSectionProps<T>) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52, // Expected height of each row
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Trigger Load More when the user scrolls near the end of this specific section
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (
      lastItem &&
      lastItem.index >= items.length - 1 &&
      hasMore &&
      onLoadMore
    ) {
      onLoadMore();
    }
  }, [virtualItems, items.length, hasMore, onLoadMore]);

  if (items.length === 0) return null;

  return (
    <section className="border-b border-slate-50">
      <header className="sticky top-0 z-20 bg-slate-100 px-4 py-2 text-[13px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <Icon size={12} /> {title}
      </header>
      <div
        ref={parentRef}
        className="max-h-[250px] overflow-y-auto custom-scrollbar relative"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map((virtualRow) => (
            <div
              key={items[virtualRow.index].id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(items[virtualRow.index])}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const GlobalSearchDropdown = () => {
  const navigate = useNavigate();
  const [skip, setSkip] = useState(0);
  const take = 20;

  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const isNewSearch = useMemo(() => {
    return searchQuery !== debouncedSearch;
  }, [searchQuery, debouncedSearch]);

  const { data: searchData, isFetching } = useGlobalSearchQuery(
    {
      search: debouncedSearch,
      languageCode: i18n.language,
      skip: isNewSearch ? 0 : skip,
      take,
    },
    { skip: !debouncedSearch || debouncedSearch.trim().length < 2 },
  );

 const { data: filesData  } = useGetAllFilesQuery(
    {
      lang: i18n.language,
      skip: 0,
      take: 999,
    },
    
  );

   const allFiles = useMemo(() => {
      return filesData?.data || [];
    }, [filesData]);
  console.log("allFiles", allFiles);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSkip(0);
  }, [debouncedSearch]);
  const handleLoadMore = () => {
    if (
      !isFetching &&
      searchData?.data &&
      searchData.data.length < (searchData.total ?? 0)
    ) {
      setSkip((prev) => prev + take);
    }
  };
  console.log("searchData", searchData);
  const filteredData = useMemo(() => {
    const results = (searchData ?? []) as GlobalSearchResult[];

    const nameMatches = results.filter((i) => i.type === "file");
    const yearMatches = results.filter(
      (i) => i.type === "file" && i.year?.toString() === debouncedSearch,
    );

    console.log("filteredData results", results);
    return {
      categories: results.filter(
        (i): i is CategoryResult => i.type === "category",
      ),
      subCategories: results.filter(
        (i): i is SubCategoryResult => i.type === "subcategory",
      ),
      contentTypes: results.filter(
        (i): i is ContentResult => i.type === "content",
      ),
      files: nameMatches,
      YearWiseFiles: yearMatches,
    };
  }, [searchData, debouncedSearch]);

  const hasResults = Object.values(filteredData).some((arr) => arr.length > 0);
  const hasMoreGlobal =
    (searchData?.data?.length ?? 0) < (searchData?.total ?? 0);

  if (!searchQuery || searchQuery.trim() === "") return null;

  const handleNavigation = (
    e: React.MouseEvent,
    path: string,
    external = false,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (external) window.open(path, "_blank");
    else navigate(path);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col w-full animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="max-h-[550px] overflow-y-auto custom-scrollbar">
        {isFetching && skip === 0 ? (
          <div className="p-10 text-center flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
            <p className="text-slate-400 text-xs italic">{t("searching")}...</p>
          </div>
        ) : !hasResults ? (
          <div className="p-10 text-center">
            <p className="text-slate-400 text-sm italic font-medium">
              {t("no_results_found")}
            </p>
          </div>
        ) : (
          <>
            <SearchResultSection
              title={t("category")}
              icon={Folder}
              items={filteredData.categories}
              hasMore={hasMoreGlobal}
              onLoadMore={handleLoadMore}
              renderItem={(item) => (
                <div
                  onMouseDown={(e) =>
                    handleNavigation(e, `/category/${item.id}`)
                  }
                  className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 cursor-pointer group transition-colors h-[52px]"
                >
                  <span className="text-sm font-bold text-slate-700 group-hover:text-orange-600">
                    {item.title || item.slug}
                  </span>
                </div>
              )}
            />

            <SearchResultSection
              title={t("subcategory")}
              icon={Tags}
              items={filteredData.subCategories}
              hasMore={hasMoreGlobal}
              onLoadMore={handleLoadMore}
              renderItem={(item) => (
                <div
                  onMouseDown={(e) =>
                    handleNavigation(
                      e,
                      `/category/${item.categoryId}/sub/${item.id}`,
                    )
                  }
                  className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer group h-[52px]"
                >
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600">
                    {item.title}
                  </span>
                </div>
              )}
            />

            <SearchResultSection
              title={t("content_type")}
              icon={Layers}
              items={filteredData.contentTypes}
              hasMore={hasMoreGlobal}
              onLoadMore={handleLoadMore}
              renderItem={(item) => (
                <div
                  onMouseDown={(e) =>
                    handleNavigation(
                      e,
                      `/category/${item.categoryId}/content-type/${item.id}`,
                    )
                  }
                  className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 cursor-pointer group h-[52px]"
                >
                  <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600">
                    {item.displayName || item.title || item.slug}
                  </span>
                </div>
              )}
            />

            {filteredData.files.length > 0 &&
              !/^\d{4}$/.test(debouncedSearch) && (
                <SearchResultSection
                  title={t("files")}
                  icon={FileText}
                  items={filteredData.files}
                  hasMore={hasMoreGlobal}
                  onLoadMore={handleLoadMore}
                  renderItem={(item) => (
                    <div
                      onMouseDown={(e) =>
                        handleNavigation(e, `/year/${item.year}`)
                      }
                      className="flex items-center justify-between px-4 py-3 hover:bg-emerald-50 cursor-pointer group h-[62px]"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 truncate">
                          {item.title || item.slug || `File #${item.id}`}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase font-black">
                          {item.mimeType || "FILE"}{" "}
                          {item.year ? `• ${item.year}` : ""}
                        </span>
                      </div>
                      <ChevronRight size={14} className="text-slate-200" />
                    </div>
                  )}
                />
              )}

            {filteredData.YearWiseFiles.length > 0 && (
              <SearchResultSection
                title={t("results_for_year", { year: debouncedSearch })}
                icon={FileText}
                items={filteredData.YearWiseFiles}
                hasMore={hasMoreGlobal}
                onLoadMore={handleLoadMore}
                renderItem={(item) => (
                  <div
                    onMouseDown={(e) =>
                      handleNavigation(e, `/year/${item.year}`)
                    }
                    className="flex items-center justify-between px-4 py-3 hover:bg-orange-50 cursor-pointer group h-[52px]"
                  >
                    <span className="text-sm font-bold text-slate-700">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-orange-500 font-black uppercase">
                      {item.year}
                    </span>
                  </div>
                )}
              />
            )}
          </>
        )}
      </div>

      {hasResults && (
        <div className="p-3 bg-white border-t border-slate-100">
          <button
            onMouseDown={(e) => handleNavigation(e, "/search-results")}
            className="w-full bg-orange-600 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-700 transition-all"
          >
            {t("view_all_results")}
          </button>
        </div>
      )}
    </div>
  );
};

export default GlobalSearchDropdown;
