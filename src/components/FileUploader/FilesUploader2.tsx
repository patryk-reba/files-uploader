import React from "react";
import { useMachine } from "@xstate/react";
import { createMachine, assign, send } from "xstate";
import DropZone from "react-dropzone";
import classNames from "classnames";
import uploadConfig from "./priceReq-upload-config.json";
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

export type Attachment = {
  id: string;
  size: number;
  name: string;
  error: string | undefined;
  uploadProgress: number;
};

const uploadMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QFcAOAbA9gQwgOgEsJ0wBiAVQAUAZAeQEEARAbQAYBdRUVTWAgFwKYAdlxAAPRACYprPKwBsUgKwBmVgHYNADlbKNARikAaEAE9EyhcrwrtATnsGDajTNUBfD6bRZchYjIAJQBRAFlaADUQtk4kEB4+QRExSQQZOUUVdS1dfSNTCwRtA3lDABZWcvspBXLlbQavHwwcfCISUkYg+gBxAH0okKDYsUSBIVF4tIz5JTVNHT1DE3NESptFZQaVQwMNJQVmkF82gM7uvv7qEPpo0fjx5KnQNPLVovqpPAVtKRzFk5yhpysdTv4IAAnbBQWgANzAkK6PQGNzuMQ4Y14ExS02ksjm2UWeRWhUQ6nseD+9XUv1UUkMqmUYNaEOhsIRSO6tEoD242OeqUselsekqCicrFUfzqZIQqkceHKfxUNQMrFqTmZ3hOrPw4IgBGEUFI9AAKmb6ABhAASYRCADkzf0mIwQixMY8BZMhQgFAo5FIDOUmXVtA4Sto5eVyqV7OU6r81FYpJVQTqDXgDUaTVQ6Ex+pQgrReqEAMplvkJb2416If0KPBuLTVRoh3RRtbyhNNsUGf3Awz2RQsvz6vU5ig0BiMfpl8hWq0hCtVp4+vF+tzyVg7lb2JkGBxyqT2RtaBTnjQNErKdMtMdZifGqf52fDYsjT38pLrut+up4PY2j+iUF6yNo0rHqwpTJm4yoaKwkohqOZzZs+oQRPcX7Vj+tYSIg4ZyAcGj2Po9TDsC9hyg0pTqu8t57PuGieBmep4JCYAALaYHCk4YUMc4LkuK7YWueFpOqAZ4MoVQNPGziqKoWjRvseBKVKJQ1CC9TaveZwcdxvHoeEAnvrQn5xN+OIvPhCDqreTaNNolHWPS2xyvS3xGPu6hSqR4oof4Bk8XxIRmkEACa-R5jOq41jZaSEU2F6kSCygUSR1GqLRV4KMGfzqIpRzHMImAQHAYgGliuEJYgAC0ChynVNiOK1IJGEG2UGPYgXtIE1XWb6eU-BqvyxvYbjBkm1HKN8NSKXJ1iaRovV4FCMLwoiA2Chu0qqHgRgyXl2x5cGKjRjIamzTemguDuUirWhUDbb+tm-NoSrvf8Sj1G4jVdreXnaFesjvEyJ6rcFRnPV6NW+uqOi2ClDhODoZ3Uapp0htKLhMlUXheEAA */
    id: "upload",
    initial: "idle",
    context: {
      attachments: [] as Attachment[],
      isDragOver: false,
    },
    states: {
      idle: {
        on: {
          UPLOAD: "uploading",
          REMOVE: "removing",
          DRAG_OVER: { actions: "setIsDragOver", target: "dragOver" },
          DRAG_LEAVE: { actions: "setIsDragOver", target: "idle" },
        },
      },

      dragOver: {
        on: {
          DRAG_LEAVE: { actions: "setIsDragOver", target: "idle" },
          DROP: { actions: "handleUpload", target: "uploading" },
        },
      },

      uploading: {
        invoke: {
          id: "upload",
          src: (context, event) => async (callback, onReceive) => {
            try {
              const nf = new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });

              if (event.files.length === 0) {
                return;
              }

              if (context.attachments.length + event.files.length > maxFiles) {
                const err = new Error(`Maximum files exceeded: ${maxFiles}`);
                throw err;
              }

              for (const file of event.files) {
                // validate file size
                if (file.size > maxFilesize) {
                  throw new Error(
                    `File too big: ${nf.format(
                      file.size / 1e6
                    )} MB, maximum allowed size: ${nf.format(
                      maxFilesize / 1e6
                    )} MB`
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

                let { id, url } = await getUploadURL();
                const newAttachment = {
                  id,
                  size: file.size,
                  name: file.name,
                  error: undefined,
                  uploadProgress: 0,
                };

                callback({
                  type: "ATTACHMENT_ADDED",
                  attachment: newAttachment,
                });

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
                    callback({
                      type: "UPLOAD_PROGRESS",
                      id,
                      progress: percentCompleted,
                    });
                  }
                );

                await notifyAPICompletion(id);
                callback({
                  type: "UPLOAD_SUCCESS",
                  id,
                });
                toast(`File ${file.name} upload success!`, { type: "success" });
              }
            } catch (err) {
              console.error("err", err);
              callback({
                type: "UPLOAD_ERROR",
                error: err.message,
              });
              toast(`File upload failed: ${err.message}`, { type: "error" });
            }
          },
        },
        on: {
          ATTACHMENT_ADDED: {
            actions: "addAttachment",
          },
          UPLOAD_PROGRESS: {
            actions: "updateUploadProgress",
          },
          UPLOAD_SUCCESS: "idle",
          UPLOAD_ERROR: {
            actions: "updateAttachmentError",
          },
          REMOVE: "removing",
        },
      },

      removing: {
        invoke: {
          id: "remove",

          src: (context, event) => async (callback, onReceive) => {
            try {
              await removeFile(event.id);
              callback({ type: "REMOVE_SUCCESS", id: event.id });
              const removedAttachmentName = context.attachments.find(
                (attachment) => attachment.id === event.id
              )?.name;
              toast(`Attachment ${removedAttachmentName} removed`, {
                type: "info",
              });
            } catch (err) {
              console.error("err", err);
              callback({ type: "REMOVE_ERROR", error: err.message });
              toast(`Attachment error: ${err.message}`, { type: "error" });
            }
          },
        },
        on: {
          REMOVE_SUCCESS: {
            actions: "removeAttachment",
          },
          REMOVE_ERROR: {
            actions: "updateAttachmentError",
          },
          RETRY_UPLOAD: "uploading",
        },
      },
    },
  },
  {
    actions: {
      setIsDragOver: assign((context, event) => ({
        isDragOver: event.type === "DRAG_OVER",
      })),
      addAttachment: assign((context, event) => ({
        attachments: [...context.attachments, event.attachment],
      })),
      updateUploadProgress: assign((context, event) => ({
        attachments: context.attachments.map((attachment) =>
          attachment.id === event.id
            ? { ...attachment, uploadProgress: event.progress }
            : attachment
        ),
      })),
      updateAttachmentError: assign((context, event) => ({
        attachments: context.attachments.map((attachment) =>
          attachment.id === event.id
            ? { ...attachment, error: event.error }
            : attachment
        ),
      })),
      removeAttachment: assign((context, event) => ({
        attachments: context.attachments.filter(
          (attachment) => attachment.id !== event.id
        ),
      })),
      handleUpload: (context, event) => {
        send({ type: "UPLOAD", files: event.files });
      },
    },
  }
);

export default function FilesUploader() {
  const [state, send] = useMachine(uploadMachine);
  const { attachments, isDragOver } = state.context;

  return (
    <div className="flex flex-col justify-center">
      {state.value}
      {attachments?.map((attachment) => (
        <FileAttached
          key={attachment.id}
          file={attachment}
          onRetry={() => send({ type: "RETRY_UPLOAD", id: attachment.id })}
          error={attachment.error}
          onRemoveAttachment={() => send({ type: "REMOVE", id: attachment.id })}
          progress={attachment.uploadProgress}
        />
      ))}
      <DropZone onDropAccepted={(files) => send({ type: "UPLOAD", files })}>
        {({ getInputProps, getRootProps }) => (
          <div {...getRootProps()} className="lg:w-[1000px]">
            <div
              className={classNames(
                "flex flex-col items-center justify-center border-slate-700/70 md:p-10 lg:border-2 lg:border-dashed",
                {
                  "bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30":
                    isDragOver,
                }
              )}
              onDragOver={() => send({ type: "DRAG_OVER" })}
              onDragLeave={() => send({ type: "DRAG_LEAVE" })}
              onDrop={() => send({ type: "DROP", files: [] })}
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
