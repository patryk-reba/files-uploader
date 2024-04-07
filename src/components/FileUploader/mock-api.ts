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
export const uploadFileToURL = async (file, id, url, onUploadProgress) => {
  return new Promise((resolve, reject) => {
    console.log(`PUT ${url}/${id}`); // Log the URL for debugging
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
      console.log(`POST https://example.com/complete/${id}`); // Log the URL for debugging
      resolve({ success: true });
    }, 200); // Simulate network delay
  });
};

// Mock function to remove a file
export const removeFile = async (id: string): Promise<{ success: boolean }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.2) {
        // Simulate a success rate of 80%
        console.log(`DELETE https://example.com/files/${id}`); // Log the URL for debugging
        resolve({ success: true });
      } else {
        reject(new Error("Failed to remove file."));
      }
    }, 200); // Simulate network delay
  });
};
