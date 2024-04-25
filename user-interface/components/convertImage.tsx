/**
 * Converts an image file to a Base64-encoded string.
 * @param file - The image file to be converted.
 * @returns A promise that resolves to the Base64-encoded string of the image.
 */
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String: string = reader.result as string;
      // Remove the prefix that includes the MIME type
      const base64Data = base64String.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};
