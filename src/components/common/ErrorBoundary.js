import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback';
import { logger } from '../../services/logger';

const ErrorBoundary = ({ children }) => {
  const handleError = (error, errorInfo) => {
    logger.error('React Error Boundary caught', { error, errorInfo });
  };

  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;