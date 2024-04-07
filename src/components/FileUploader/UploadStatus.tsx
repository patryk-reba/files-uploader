import React from "react";

interface UploadStatusProps {
  error: string;
  progress: number;
  isRetrying: boolean;
}

function UploadStatus({ error, progress, isRetrying }: UploadStatusProps) {
  if (progress < 100) {
    return <progress id="file" value={progress} max="100"></progress>;
  }
  if (progress === 100 && !error && !isRetrying) {
    return <span className="text-green-400">Uploaded succesfuly</span>;
  }
  if (error) {
    return <span className="text-red-600">Error: {error}</span>;
  }

  return <span>waiting...</span>;
}

export default UploadStatus;
