import {
  isFulfilled,
  isRejected,
  isPending,
  type Middleware,
} from "@reduxjs/toolkit";

export const rtkQueryLogger: Middleware = () => (next) => (action: any) => {
  if (isPending(action)) {
    console.groupCollapsed(
      `API Request: ${action.meta.arg.endpointName}`,
      "color: #3b82f6; font-weight: bold;",
    );
    console.log("Payload/Params:", action.meta.arg.originalArgs);
    console.groupEnd();
  }

  if (isFulfilled(action)) {
    console.groupCollapsed(
      `API Success: ${action.meta.arg.endpointName}`,
      "color: #10b981; font-weight: bold;",
    );
    console.log("Status:", "200 OK");
    console.log("Response Data (Backend Res):", action.payload);
    console.groupEnd();
  }

  if (isRejected(action)) {
    console.groupCollapsed(
      `API Error: ${action.meta.arg.endpointName}`,
      "color: #ef4444; font-weight: bold;",
    );
    console.log("Status:", action.payload?.status);
    console.log("Error Data:", action.payload?.data);
    console.log("Full Error:", action.payload);
    console.groupEnd();
  }

  return next(action);
};
