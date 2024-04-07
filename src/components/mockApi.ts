const mockApi = {
  getUploadUrl: async (): Promise<{ uploadUrl: string; uploadId: string }> => {
    // Simulate an API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          uploadUrl: "https://example.com/upload",
          uploadId: "uuid-1234",
        });
      }, 1000);
    });
  },
  uploadFile: async (
    file: File,
    uploadUrl: string,
    onProgress: (progress: number) => void
  ): Promise<void> => {
    // Simulate an API call with progress
    return new Promise((resolve, reject) => {
      const total = 100; // Mock total size in chunks
      let loaded = 0;

      const interval = setInterval(() => {
        if (loaded >= total) {
          clearInterval(interval);
          resolve();
        } else {
          loaded += 10; // Mock upload progress
          onProgress((loaded / total) * 100);
        }
      }, 100);
    });
  },
};
