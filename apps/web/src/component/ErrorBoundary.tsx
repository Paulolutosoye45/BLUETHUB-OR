import * as React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: unknown;
  errorInfo: unknown;
}

interface ErrorBoundaryProps {
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
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-slate-800">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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

  // ✅ correct — renders children normally
  return this.props.children;
}
}

export { ErrorBoundary };