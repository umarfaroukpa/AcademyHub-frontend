'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service (e.g., Sentry, LogRocket)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Example: Send to external logging service
    try {
      // Uncomment and configure for your logging service
      
      if (typeof window !== 'undefined') {
        // Sentry example
        // Sentry.captureException(error, { extra: errorInfo });
        
        // LogRocket example
        // LogRocket.captureException(error, { extra: errorInfo });
        
        // Custom API example
        fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: {
              message: error.message,
              stack: error.stack,
              name: error.name,
            },
            errorInfo: {
              componentStack: errorInfo.componentStack,
            },
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
          }),
        }).catch(console.error);
      }
      
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Oops! Something went wrong</h1>
                  <p className="text-red-100 mt-1">
                    We encountered an unexpected error
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Error Message */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  What happened?
                </h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-mono text-sm">
                    {this.state.error?.message || 'An unknown error occurred'}
                  </p>
                </div>
              </div>

              {/* Error Count Warning */}
              {this.state.errorCount > 1 && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ This error has occurred {this.state.errorCount} times. 
                    Consider refreshing the page or returning home.
                  </p>
                </div>
              )}

              {/* Error Details (Development/Debug Mode) */}
              {this.props.showDetails && this.state.error && (
                <details className="mb-6">
                  <summary className="cursor-pointer text-gray-700 font-medium mb-2 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Technical Details
                  </summary>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">
                        Error Stack:
                      </h3>
                      <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">
                          Component Stack:
                        </h3>
                        <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Suggestions */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  What can you do?
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Try reloading the page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Clear your browser cache and cookies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Return to the home page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Contact support if the problem persists</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Error ID: {Date.now()}  If this problem persists, please contact support
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
