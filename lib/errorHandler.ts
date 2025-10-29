export interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string | number;
  additionalData?: Record<string, unknown>;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLog[] = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      // Listen for unhandled promise rejections
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
      
      // Listen for global errors
      window.addEventListener('error', this.handleGlobalError);
    }
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    this.logError(event.reason, { type: 'unhandledRejection' });
  };

  private handleGlobalError = (event: ErrorEvent) => {
    console.error('Global Error:', event.error);
    this.logError(event.error, { type: 'globalError' });
  };

  logError(error: Error | string, additionalData?: Record<string, unknown>): void {
    const errorLog: ErrorLog = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      additionalData,
    };

    // Add user ID if available
    if (typeof window !== 'undefined') {
      try {
        const user = localStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          errorLog.userId = userData.id;
        }
      } catch {
        // Ignore parsing errors
      }
    }

    this.logs.push(errorLog);
    console.error('Error logged:', errorLog);

    // Send to backend or external service
    this.sendToBackend(errorLog);
  }

  private async sendToBackend(errorLog: ErrorLog): Promise<void> {
    try {
      // Only send in production
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorLog),
        });
      }
    } catch (e) {
      console.error('Failed to send error to backend:', e);
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

// Initialize the error logger
if (typeof window !== 'undefined') {
  ErrorLogger.getInstance();
}

export const logError = (error: Error | string, additionalData?: Record<string, unknown>) => {
  ErrorLogger.getInstance().logError(error, additionalData);
};