import { setup, assign } from "xstate";

export const machine = setup({
  types: {
    context: {} as { retries: number; progress: number },
    events: {} as { type: "UPLOAD" } | { type: "CANCEL" } | { type: "RETRY" },
  },
  actors: {},
  schemas: {
    events: {
      UPLOAD: {
        type: "object",
        properties: {},
      },
      CANCEL: {
        type: "object",
        properties: {},
      },
      RETRY: {
        type: "object",
        properties: {},
      },
    },
    context: {
      retries: {
        type: "number",
        description:
          'Generated automatically based on the key: "retries" in initial context values',
      },
      progress: {
        type: "number",
        description:
          'Generated automatically based on the key: "progress" in initial context values',
      },
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QDMCWAbMBVADug9gIYQB0AkhJgMRYAKAMgPICCAIgNoAMAuoqDvlioALqnwA7PiAAeiACwA2AMwlOazkoDs2gByKAnEoA0IAJ6IAjACZOJCxf2cArDv1ylOtfqcBfHybRMXAJiEgBxMGFRcShgoggsACd0KggJMBJUcQA3fABrDJhhOOIk9C5eJBABIVEJKVkERRV1DW1NPQVDE3MEKwsnEiUFTgs5K2GdJ04rfR0-AIxsPHjwyOjYldLkqjBExPxEkjxCYWRDgFsSIpKE5IqpGpExSSrGi04FORJlORmlJyaGZyJw9RBWKwKEhWOQfQz6fQKTRyHRWBYgQLLEKkCJRLKbbFlKgAYWYADliQBRegPKpPOqvUDvT7fX7-QHA0FmRA6CyqTRjJRKZwQsZWTTozG3Ei3fGpdKZHL5DIAVy2EAAYktafxBM96m95MpVOotLoDMZuQgnE59EMNDalIirE4PhL-BiltLZTFdvtDsd0KdzokrmrsVrMDrqnqGQ0jS1Te1Ot0rU7bK6OjodAoBnpOO7FkF1TL1XLSRTqdH6S9401ja0zR0LWCEJoXSQXPoIbCEQC5JKvSXKf7ElQAEqUgAq44AmtXY7XDQh7EiSG4FE5xpou1uFK2LEo+a0PoCbIoLApB8XsSQRwcxxWqTSeI9FwamZZNGutK6cwKHHFORWw8KxoRGHct30bQlDkHdryxVYyXwURkFMfFiXwC48EiF55XEDIslyAoSHEFDUDQzDsMwBkF1qJdPxXFkflg9kgRhLlehcPlXB0bRATkODYLRD0pRLZDUPQmIqJwhk-QfQNg0uUjyMorDZJeOj9UZGRLGYtkJg5DjWycWD1yBCxs0EkEbXdD0yIgOApDE7E33oj9dIQABafcrS8wYEUCoKgvbBDpQoTA3O0usHG+VwrD4hQIMMQSDxsddTJzXN9AcLcdCUMKS1xDZbjKKK42XTcVGUJ0pk0HL+P0A9jUMYVNFg7RDwmArRKHW9iUIcQAGMwEwCByoYzzLJyztTO-QxswGTcQNtOxXABIUbVMiEr16m9Vh9KAJo8xpxlbZRBltZQYIS1dCtve9DmOnT3iPO0gVGBL6s8Q9LV6YZbHcQwt36BQXTg+6kNUqSoBkmjJprE7ECqljasBBqdyaq1pjtFF+lRSFbVmRFIdCABlFUhpG2B4Dpd8XssBK7WcYZEUUG0FD4kzASGcUma+AUZl2vwgA */
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
        input: {},
        onDone: {
          target: "Uploading",
          actions: assign({
            fileId: ({ event }) => event.data.fileId,
            uploadUrl: ({ event }) => event.data.uploadUrl,
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
        input: {},
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
          actions: assign({ retries: ({ context }) => context.retries + 1 }),
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
        input: {},
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
});
