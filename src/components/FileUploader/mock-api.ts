import { v4 as uuidv4 } from "uuid";

export const getUploadURL = async (): Promise<{ id: string; url: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: uuidv4(), // Generate a UUID for each function call
        url: "https://example.com/upload",
      });
    }, 10); // Simulate network delay
  });
};

// Mock function to upload a file to a URL
export const uploadFileToURL = async (file, url, onUploadProgress) => {
  return new Promise((resolve, reject) => {
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10; // increment progress by 10% every 200ms
      onUploadProgress({ loaded: progress, total: 100 });
      if (progress >= 100) {
        clearInterval(progressInterval);
        if (Math.random() > 0.4) {
          // Simulate a success rate
          resolve({ success: true });
        } else {
          reject(new Error("Failed to upload file."));
        }
      }
    }, 200); // Simulate upload time
  });
};

// Mock function to notify the API upon upload completion
export const notifyAPICompletion = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 200); // Simulate network delay
  });
};
