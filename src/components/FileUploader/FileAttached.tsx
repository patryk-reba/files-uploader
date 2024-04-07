import React, { useState } from "react";
import UploadStatus from "./UploadStatus";

interface FileAttachedProps {
  file: File;
  onRetry: (file: File, retry: boolean) => any;
  error: string;
  onRemoveAttachment: (attachmentName: string) => any;
  progress: number;
}

export function FileAttached({
  file,
  onRetry,
  error,
  onRemoveAttachment,
  progress,
}: FileAttachedProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await onRetry(file, true); // Passing true to indicate it's a retry
    setIsRetrying(false);
  };
  return (
    <div>
      <div className="md:flex md:items-center justify-between">
        <div className="flex gap-x-3">
          <a
            title="File Download"
            target="_blank"
            className="link-2-desktop truncate lg:w-[320px]"
          >
            {file.name}
          </a>
        </div>
        <UploadStatus
          error={error}
          progress={progress}
          isRetrying={isRetrying}
        />
        <div className="lg:w-72 flex justify-end">
          {error && (
            <button onClick={handleRetry} disabled={isRetrying}>
              {isRetrying ? "Retrying..." : "Retry"}
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemoveAttachment(file.name)}
            title={"remove file"}
          >
            <div className="flex">
              <span>X</span>
            </div>
          </button>
        </div>
      </div>
      <hr className="my-2" />
    </div>
  );
}
