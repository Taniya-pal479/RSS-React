export const useDownload = () => {
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
       
      const blobUrl = window.URL.createObjectURL(blob);
      
    
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename);  
      document.body.appendChild(link);
      link.click();
      
     
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed", error);
      window.open(url, "_blank");
    }
  };

  return {handleDownload };
};