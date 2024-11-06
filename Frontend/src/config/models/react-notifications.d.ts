declare module 'react-notifications' {
    import * as React from 'react';
  
    export interface NotificationManager {
      info: (message: string, title?: string, timeOut?: number, callback?: () => void) => void;
      success: (message: string, title?: string, timeOut?: number, callback?: () => void) => void;
      warning: (message: string, title?: string, timeOut?: number, callback?: () => void) => void;
      error: (message: string, title?: string, timeOut?: number, callback?: () => void) => void;
    }
  
    export const NotificationContainer: React.FC;
    export const NotificationManager: NotificationManager;
  }
  