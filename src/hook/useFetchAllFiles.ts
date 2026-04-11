import { useState, useEffect } from "react";
import { useLazyGetAllFilesQuery } from "../services/rssApi";
import type { FileObject } from "../types";

export const useFetchAllFiles = (lang: string) => {
  const [allData, setAllData] = useState<FileObject[]>([]);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [trigger, result] = useLazyGetAllFilesQuery();

  const PAGE_SIZE = 1000;

  useEffect(() => {
    trigger({ lang, skip: 0, take: PAGE_SIZE });
  }, [lang, trigger]);

  useEffect(() => {
    if (result.isSuccess && result.data) {
      const { data, total } = result.data;

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllData((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const uniqueNew = data.filter((item) => !existingIds.has(item.id));
        return [...prev, ...uniqueNew];
      });

      const nextSkip = allData.length + data.length;

      if (nextSkip < total) {
        trigger({
          lang,
          skip: nextSkip,
          take: PAGE_SIZE,
          sortBy: "updatedAt",
          order: "desc",
        });
      } else {
        setIsFullyLoaded(true);
      }
    }
  }, [result.isSuccess, result.data, lang, trigger]);

  return {
    data: allData,
    isLoading: result.isLoading && allData.length === 0,
    isFetchingMore: !isFullyLoaded && allData.length > 0,
    isFullyLoaded,
    error: result.error,
  };
};
