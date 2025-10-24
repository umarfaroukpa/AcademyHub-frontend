'use client';

import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import ApiErrorBoundary from './ApiErrorBoundary';
import ChunkErrorBoundary from './ChunkErrorBoundary';

interface Props {
  children: ReactNode;
  showDetails?: boolean;
}

/**
 * Composite Error Boundary that combines all error handling strategies
 * Use this as the main error boundary in your app
 */
const AppErrorBoundary: React.FC<Props> = ({ children, showDetails = false }) => {
  return (
    <ErrorBoundary showDetails={showDetails}>
      <ChunkErrorBoundary>
        <ApiErrorBoundary>
          {children}
        </ApiErrorBoundary>
      </ChunkErrorBoundary>
    </ErrorBoundary>
  );
};

export default AppErrorBoundary;