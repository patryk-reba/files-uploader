// import { setup, assign } from "xstate";

// export const machine = setup({
//   types: {
//     context: {} as { retries: number; progress: number },
//     events: {} as { type: "UPLOAD" } | { type: "CANCEL" } | { type: "RETRY" },
//   },
//   actors: {},
//   schemas: {
//     events: {
//       UPLOAD: {
//         type: "object",
//         properties: {},
//       },
//       CANCEL: {
//         type: "object",
//         properties: {},
//       },
//       RETRY: {
//         type: "object",
//         properties: {},
//       },
//     },
//     context: {
//       retries: {
//         type: "number",
//         description:
//           'Generated automatically based on the key: "retries" in initial context values',
//       },
//       progress: {
//         type: "number",
//         description:
//           'Generated automatically based on the key: "progress" in initial context values',
//       },
//     },
//   },
// }).createMachine({
//   context: {
//     retries: 0,
//     progress: 0,
//   },
//   id: "fileUpload",
//   initial: "Idle",
//   states: {
//     Idle: {
//       on: {
//         UPLOAD: {
//           target: "GettingUploadUrl",
//           actions: assign({ progress: (_context) => 0 }),
//         },
//       },
//       description: "Waiting for a file to be uploaded.",
//     },
//     GettingUploadUrl: {
//       on: {
//         CANCEL: {
//           target: "Canceled",
//         },
//       },
//       invoke: {
//         id: "getUploadUrl",
//         input: {},
//         onDone: {
//           target: "Uploading",
//           actions: assign({
//             fileId: ({ event }) => event.data.fileId,
//             uploadUrl: ({ event }) => event.data.uploadUrl,
//           }),
//         },
//         onError: {
//           target: "Error",
//           actions: assign({ progress: (_context) => 0 }),
//         },
//         src: "inline:fileUpload.GettingUploadUrl#actor[0]",
//       },
//       description: "Getting a unique URL for the file upload.",
//     },
//     Canceled: {
//       type: "final",
//       description: "The upload has been canceled by the user.",
//     },
//     Uploading: {
//       on: {
//         CANCEL: {
//           target: "Canceled",
//         },
//       },
//       invoke: {
//         id: "uploadFile",
//         input: {},
//         onDone: {
//           target: "NotifyingCompletion",
//         },
//         onError: {
//           target: "Error",
//         },
//         src: "inline:fileUpload.Uploading#actor[0]",
//       },
//       description: "Uploading the file to the server.",
//     },
//     Error: {
//       on: {
//         RETRY: {
//           target: "GettingUploadUrl",
//           actions: assign({ retries: ({ context }) => context.retries + 1 }),
//         },
//         CANCEL: {
//           target: "Canceled",
//         },
//       },
//       description: "An error occurred during the upload process.",
//     },
//     NotifyingCompletion: {
//       invoke: {
//         id: "notifyCompletion",
//         input: {},
//         onDone: {
//           target: "Success",
//         },
//         onError: {
//           target: "Error",
//         },
//         src: "inline:fileUpload.NotifyingCompletion#actor[0]",
//       },
//       description: "Notifying the API about the upload completion.",
//     },
//     Success: {
//       type: "final",
//       description:
//         "The file has been successfully uploaded and the API has been notified.",
//     },
//   },
// });
