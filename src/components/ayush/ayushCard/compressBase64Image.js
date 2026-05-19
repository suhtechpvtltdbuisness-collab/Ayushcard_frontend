export function compressBase64Image(
    base64Src,
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    applyOcrFilter = false,
  ) {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          if (applyOcrFilter) {
            try {
              const imageData = ctx.getImageData(0, 0, width, height);
              const data = imageData.data;
              
              // Find average brightness to use as adaptive threshold baseline
              let totalLuma = 0;
              for (let i = 0; i < data.length; i += 4) {
                totalLuma += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
              }
              const avgLuma = totalLuma / (width * height);
              const threshold = Math.max(100, Math.min(160, avgLuma * 0.95)); 

              // Binary Extraction (Binarization): everything below threshold becomes black, else white
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i],
                  g = data[i + 1],
                  b = data[i + 2];
                // Luma formula for grayscale
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                
                // True binary conversion
                const val = gray < threshold ? 0 : 255;

                data[i] = val;     // R
                data[i + 1] = val; // G
                data[i + 2] = val; // B
              }
              ctx.putImageData(imageData, 0, 0);
            } catch (err) {
              console.warn(
                "Binary OCR Filter failed, continuing with original colors",
                err,
              );
            }
          }

          const outputBase64 = canvas.toDataURL("image/jpeg", quality);
          resolve(outputBase64);
        };
        img.onerror = (e) => reject(e);
        img.src = base64Src;
      } catch (e) {
        reject(e);
      }
    });
  };
