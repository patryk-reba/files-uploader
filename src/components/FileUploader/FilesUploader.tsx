import React, { useCallback, useState } from "react";
import DropZone from "react-dropzone";
import classNames from "classnames";
import uploadConfig from "../priceReq-upload-config.json";
import { v4 as uuidv4 } from "uuid";
import { FileAttached } from "./FileAttached";
import { toast } from "react-toastify";
import {
  getUploadURL,
  notifyAPICompletion,
  removeFile,
  uploadFileToURL,
} from "./mock-api";

const { maxFiles, maxFilesize, acceptedFileTypes, minFilesize } =
  uploadConfig.upload;

export default function FilesUploader() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});

  // console.log("uploadErrors", uploadErrors);
  // console.log("uploadProgress", uploadProgress);

  async function onUpload(file: File, retry = false) {
    let { id, url } = await getUploadURL();
    console.log("file", file);

    try {
      if (retry) {
        id = file.id;
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[id];
          return newProgress;
        });
        setUploadErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
      } else {
        const newAttachment = {
          id,
          size: file.size,
          name: file.name,
        };
        // Add the file to attachments if it's not a retry
        setAttachments((prevAttatchedFiles) => [
          ...prevAttatchedFiles,
          newAttachment,
        ]);
      }
      await uploadFileToURL(
        file,
        id,
        url,
        (
          progressEvent:
            | ProgressEvent<FileReader>
            | { loaded: number; total: number }
        ) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress((prev) => ({
            ...prev,
            [id]: percentCompleted,
          }));
        }
      );

      await notifyAPICompletion(id);
      toast(`File ${file.name} upload success!`, { type: "success" });
    } catch (err) {
      console.error("err", err);
      setUploadErrors((prev) => ({ ...prev, [id]: err.message }));
      toast(`File ${file.name} upload failed!`, { type: "error" });
    } finally {
      // setUploadProgress((prev) => {
      //   const newProgress = { ...prev };
      //   delete newProgress[id];
      //   return newProgress;
      // });
    }
  }

  async function onRemoveAttachment(attachmentId: string) {
    try {
      await removeFile(attachmentId);

      setAttachments(
        attachments.filter((attachment) => attachment.id !== attachmentId)
      );
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[attachmentId];
        return newProgress;
      });
      const removedAttachmentName = attachments.find(
        (attachment) => attachment.id === attachmentId
      )?.name;

      toast(`Attachment ${removedAttachmentName} removed`, { type: "info" });
    } catch (err) {
      console.error("err", err);
      toast(`Attachment error: ${err.message}`, { type: "error" });
    }
  }

  const handleUpload = useCallback(
    async (files: File[]) => {
      const nf = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      try {
        if (files.length === 0) {
          return;
        }

        if (attachments.length + files.length > maxFiles) {
          const err = new Error(`Maximum files exceeded: ${maxFiles}`);
          throw err;
        }

        // setAttachments((prevAttatchedFiles) => [
        //   ...prevAttatchedFiles,
        //   ...files,
        // ]);

        for (const file of files) {
          // validate file size
          if (file.size > maxFilesize) {
            throw new Error(
              `File too big: ${nf.format(
                file.size / 1e6
              )} MB, maximum allowed size: ${nf.format(maxFilesize / 1e6)} MB`
            );
          }

          if (file.size < minFilesize) {
            throw new Error(
              `File too small: ${nf.format(
                file.size / 1e6
              )} MB, minimum size: ${minFilesize} B`
            );
          }

          // validate file types
          if (!Object.keys(acceptedFileTypes).includes(file.type)) {
            throw new Error("Invalid file type.");
          }
          console.log("uploaded");
          await onUpload(file);
        }
      } catch (err) {
        console.error("err", err);
        toast(`Attachment error: ${err.message}`, { type: "error" });
      }
    },
    [attachments.length, onUpload]
  );

  return (
    <div className="flex flex-col justify-center">
      {attachments?.map((file, index) => (
        <FileAttached
          key={file.id}
          file={file}
          onRetry={onUpload}
          error={uploadErrors[file.id]}
          onRemoveAttachment={onRemoveAttachment}
          progress={uploadProgress[file.id]}
        />
      ))}
      <DropZone
        onDropAccepted={handleUpload}
        accept={uploadConfig.upload.acceptedFileTypes}
      >
        {({ getInputProps, getRootProps }) => (
          <div {...getRootProps()} className="lg:w-[1000px]">
            <div
              className={classNames(
                "flex flex-col items-center justify-center border-slate-700/70 md:p-10 lg:border-2 lg:border-dashed  ",
                {
                  "bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30":
                    isDragOver,
                }
              )}
              onDragOver={() => {
                setIsDragOver(true);
              }}
              onDragLeave={() => {
                setIsDragOver(false);
              }}
              onDrop={() => {
                setIsDragOver(false);
              }}
            >
              <p className="m-2 hidden lg:block">Drop your files here or</p>
              <button
                type="button"
                className="flex items-center gap-x-3  transition ease-in-out hover:scale-110"
                title="add files"
              >
                Upload files
                <span className="voi-cloud-upload" />
              </button>
            </div>
            <input {...getInputProps()} />
          </div>
        )}
      </DropZone>
    </div>
  );
}
