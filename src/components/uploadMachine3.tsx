import { createMachine, assign, actions } from "xstate";

export const uploadMachine = createMachine(
  {
    id: "fileUpload",
    initial: "Idle",
    states: {
      Idle: {
        on: {
          UPLOAD: {
            target: "GettingUploadUrl",
          },
        },
        description: "Waiting for a file to be uploaded.",
      },
      GettingUploadUrl: {
        on: {
          "get upload URL": {
            target: "Uploading",
            actions: "getUploadUrl",
          },
        },
      },
      Uploading: {},
    },
  },
  {
    actions: {
      getUploadUrl: (context, event) => alert(JSON.stringify(event)),
    },
  }
);
