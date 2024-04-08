import { createMachine, assign } from "xstate";

export const machine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QDMCWAbMBVADug9gIYQB0AkhJgMRYAKAMgPICCAIgNoAMAuoqDvlioALqnwA7PiAAeiACwA2AMwlOatQE4ATAA4tCuVoDsAGhABPRAEYtnElasbOcnQ4CscpW70BfH2bRMXAJiEgBxMGFRcShgoggsACd0KggJMBJUcQA3fABrDJhhOOIk9C5eJBABIVEJKVkERRV1TV19Q1MLRC0rNxIlBU4rJTkjHWUPHR0-AIxsPHjwyOjYxdLkqjBExPxEkjxCYWQ9gFsSIpKE5IqpGpExSSrGq04DEmUlDSMXORsFLRyMyWBBafQkQGvIzjBQ6P7GJSzECBBYhUgRKJZNZospUADCzAAcniAKL0W5Ve51J6gF5vOQfJRfH5w-6A4GIVyqIxWTwjLRub7OGb+ZHzK4kK5Y1LpTI5fIZACu6wgADF5hT+IIHvVnvJlKpWto9AZjByEG5BQNOF4NHI5BpTRokSiJVKYlsdnsDugjidEudlWj1ZhNdVtdSGvqWkb2qauiCvnY3FZxmmdINHMYXeKVZKVdKCcSyWGqY8o00Da1OMaOmbuggjAKSN5tApeUYvn8c0E8ySvYkqAAlEkAFSHAE1SxHy3qEA4FEYSHaFB5ODywW5YeaRlZDWpXsYa65EaLXX2B-iiaTyTw7jPdbTrEZFwMjCmBZxBXC9OalHoISGJtoS8KwFFXHtUSWQl8FEZBzCxPF8FOPBIkeGVxAyLJcgKEhxFg1B4KQlDMGpadalnJ953pRlmV+NkgQbbw9x0DRpiZN5O1XIxIIlGC4IQmJiNQ6lPV2fZDmOM48IIojkJEx5yJ1GkZGsGjPm+ej9HZJjRmXIxOC0L43EGXobD8UV8IgOApHPNF7wox9VIQABaBRzRc-oNG8nzfJ8gw3F4vMKEwBzlIrRwGVY3RwLcaErFcVcd1sZcTImaY4XAh0RTmXs0WWTEYiuMowsjOdVxUDTV0tCZHB0HcDQ0Di-lcMY3gUIL8rxQhxAAYzATAIFKyjnISjQ90tJRoQ0Nx2ihP8rTG4xDDtBFO06pZ3SgYanMaQxzUmFtHTkYYbXfNMNtCftxJ2lSXiURwSAMzQbXtP5PD-IYSE8bQfim7x20u0h+MIwSoGE0iRrLXbEAq2jHUtAG6vNNwa2+vQ+l0byVqaoGSAAZUVXr+tgeBKQfO7rCx1QTOUPRMyZJQUbigY1odNj2wdCyfCAA */
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
