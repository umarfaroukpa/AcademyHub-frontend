'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isNetworkError: boolean;
  isAuthError: boolean;
  statusCode?: number;
}

class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isNetworkError: false,
      isAuthError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if it's a network error
    const isNetworkError = 
      error.message.includes('Network') ||
      error.message.includes('fetch') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ERR_CONNECTION');

    // Check if it's an auth error
    const isAuthError = 
      error.message.includes('401') ||
      error.message.includes('403') ||
      error.message.includes('Unauthorized') ||
      error.message.includes('Authentication');

    // Extract status code if available
    const statusCodeMatch = error.message.match(/status (\d+)/);
    const statusCode = statusCodeMatch ? parseInt(statusCodeMatch[1]) : undefined;

    return {
      hasError: true,
      error,
      isNetworkError,
      isAuthError,
      statusCode,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ApiErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      isNetworkError: false,
      isAuthError: false,
      statusCode: undefined,
    });

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleRelogin = () => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      // Network Error UI
      if (this.state.isNetworkError) {
        return (
          <div className="flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <WifiOff className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connection Problem
              </h3>
              <p className="text-gray-600 mb-6">
                We couldn't connect to the server. Please check your internet connection.
              </p>
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        );
      }

      // Auth Error UI
      if (this.state.isAuthError) {
        return (
          <div className="flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Required
              </h3>
              <p className="text-gray-600 mb-6">
                Your session has expired. Please log in again to continue.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={this.handleRelogin}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Generic API Error UI
      return (
        <div className="flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wifi className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Something Went Wrong
            </h3>
            <p className="text-gray-600 mb-2">
              We encountered a problem while loading this data.
            </p>
            {this.state.statusCode && (
              <p className="text-sm text-gray-500 mb-6">
                Error code: {this.state.statusCode}
              </p>
            )}
            <button
              onClick={this.handleRetry}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ApiErrorBoundary;