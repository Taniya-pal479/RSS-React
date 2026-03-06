import { isFulfilled, isRejected, isPending,type Middleware } from '@reduxjs/toolkit';

export const rtkQueryLogger: Middleware = () => (next) => (action: any) => {
  // 1. Jab Request Start ho (Pending)
  if (isPending(action)) {
    console.groupCollapsed(`API Request: ${action.meta.arg.endpointName}`, 'color: #3b82f6; font-weight: bold;');
    console.log('Payload/Params:', action.meta.arg.originalArgs);
    console.groupEnd();
  }

  // 2. Jab Response Success ho (Fulfilled) - YE AAPKO CHAHIYE
  if (isFulfilled(action)) {
    console.groupCollapsed(`API Success: ${action.meta.arg.endpointName}`, 'color: #10b981; font-weight: bold;');
    console.log('Status:', '200 OK');
    console.log('Response Data (Backend Res):', action.payload); // 
    console.groupEnd();
  }

  // 3. Jab Error aaye (Rejected)
  if (isRejected(action)) {
    console.groupCollapsed(`API Error: ${action.meta.arg.endpointName}`, 'color: #ef4444; font-weight: bold;');
    console.log('Status:', action.payload?.status);
    console.log('Error Data:', action.payload?.data); // Backend ka error message
    console.log('Full Error:', action.payload);
    console.groupEnd();
  }

  return next(action);
};