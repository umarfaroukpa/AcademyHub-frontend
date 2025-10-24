'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Package, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isChunkError: boolean;
}

class ChunkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      isChunkError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if it's a chunk loading error
    const isChunkError = 
      error.message.includes('Loading chunk') ||
      error.message.includes('Failed to load chunk') ||
      error.name === 'ChunkLoadError';

    return {
      hasError: true,
      isChunkError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ChunkErrorBoundary caught an error:', error, errorInfo);

    // Auto-reload once for chunk errors
    if (this.state.isChunkError) {
      const reloadCount = sessionStorage.getItem('chunkErrorReloadCount') || '0';
      const count = parseInt(reloadCount);

      if (count < 1) {
        sessionStorage.setItem('chunkErrorReloadCount', (count + 1).toString());
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  }

  handleReload = () => {
    sessionStorage.removeItem('chunkErrorReloadCount');
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.isChunkError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Update Available
            </h3>
            <p className="text-gray-600 mb-6">
              We've released a new version. Please reload the page to get the latest updates.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;