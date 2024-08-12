import { RcFile } from "antd/es/upload";

export const normFile = (e: unknown) => {
    if (Array.isArray(e)) {
      return e;
    }
    return( e as {fileList:unknown} )?.fileList;
  };

  
 export const compressImage = (file: RcFile, maxSize: number): Promise<string> => {
    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        img.src = e.target?.result as string;
        img.onload = () => {
          let quality = 0.9;
          let width = img.width;
          let height = img.height;
          
          const ctx = canvas.getContext('2d');
          
          const compress = () => {
            canvas.width = width;
            canvas.height = height;
            ctx?.clearRect(0, 0, width, height);
            ctx?.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL(file.type, quality);
            const base64 = dataUrl.split(',')[1];
            return { base64, size: base64.length * 0.75 };
          };

          let { base64, size } = compress();

          while (size > maxSize && quality > 0.1) {
            quality -= 0.1;
            ({ base64, size } = compress());
          }

          while (size > maxSize && (width > 50 || height > 50)) {
            width *= 0.9;
            height *= 0.9;
            ({ base64, size } = compress());
          }
          resolve(base64);
        };
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };