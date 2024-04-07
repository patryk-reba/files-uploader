import { createMachine, assign } from "xstate";

export const machine = createMachine({
  context: {
    retries: 0,
    progress: 0,
  },
  id: "fileUpload",
  initial: "Idle",
  states: {
    Idle: {
      on: {
        UPLOAD: {
          target: "GettingUploadUrl",
          actions: assign({ progress: (_context) => 0 }),
        },
      },
      description: "Waiting for a file to be uploaded.",
    },
    GettingUploadUrl: {
      on: {
        CANCEL: {
          target: "Canceled",
        },
      },
      invoke: {
        id: "getUploadUrl",
        onDone: {
          target: "Uploading",
          actions: assign({
            fileId: (_context, event) => event.data.fileId,
            uploadUrl: (_context, event) => event.data.uploadUrl,
          }),
        },
        onError: {
          target: "Error",
          actions: assign({ progress: (_context) => 0 }),
        },
        src: "inline:fileUpload.GettingUploadUrl#actor[0]",
      },
      description: "Getting a unique URL for the file upload.",
    },
    Canceled: {
      type: "final",
      description: "The upload has been canceled by the user.",
    },
    Uploading: {
      on: {
        CANCEL: {
          target: "Canceled",
        },
      },
      invoke: {
        id: "uploadFile",
        onDone: {
          target: "NotifyingCompletion",
        },
        onError: {
          target: "Error",
        },
        src: "inline:fileUpload.Uploading#actor[0]",
      },
      description: "Uploading the file to the server.",
    },
    Error: {
      on: {
        RETRY: {
          target: "GettingUploadUrl",
          actions: assign({ retries: (context) => context.retries + 1 }),
        },
        CANCEL: {
          target: "Canceled",
        },
      },
      description: "An error occurred during the upload process.",
    },
    NotifyingCompletion: {
      invoke: {
        id: "notifyCompletion",
        onDone: {
          target: "Success",
        },
        onError: {
          target: "Error",
        },
        src: "inline:fileUpload.NotifyingCompletion#actor[0]",
      },
      description: "Notifying the API about the upload completion.",
    },
    Success: {
      type: "final",
      description:
        "The file has been successfully uploaded and the API has been notified.",
    },
  },
}).withConfig({
  services: {
    "inline:fileUpload.GettingUploadUrl#actor[0]": createMachine({
      /* ... */
    }),
    "inline:fileUpload.Uploading#actor[0]": createMachine({
      /* ... */
    }),
    "inline:fileUpload.NotifyingCompletion#actor[0]": createMachine({
      /* ... */
    }),
  },
});
