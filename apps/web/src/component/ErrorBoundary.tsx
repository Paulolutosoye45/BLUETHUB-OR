import * as React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: unknown;
  errorInfo: unknown;
}

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  fallbackMessage?: string;
  children?: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-slate-800">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path className="stroke-width-2" strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 20v2M4.93 4.93l2.83 2.83m2.17-4.22l2.83 2.83m0 0l-2.83 2.83m2.17-4.22L15 12m-2.17 4.22L9 12M4.93 15.07l2.83-2.83m2.17 4.22l2.83-2.83m0 0l-2.83-2.83m2.17 4.22L4.16 9m5.66 0l2.83 2.83M9 15H5m4 0h5m4 0l2.83-2.83m-2.17-4.22l-2.83-2.83M15 12h2m0 0l2.83 2.83m-2.17 4.22L21 12m-2.17-4.22l-2.83 2.83" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            {this.props.fallbackMessage && (
              <p className="text-slate-300 mb-8 max-w-md mx-auto">{this.props.fallbackMessage}</p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="inline-block px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export { ErrorBoundary };