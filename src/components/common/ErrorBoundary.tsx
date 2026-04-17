import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { t } from "i18next";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });

    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    console.error("Production error logged:", {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {t("error_boundary.title", "Something went wrong")}
              </h2>
              <p className="text-slate-500 text-sm">
                {t(
                  "error_boundary.message",
                  "An unexpected error occurred. We apologize for the inconvenience.",
                )}
              </p>
            </div>

            <div className="px-6 pb-4">
              {import.meta.env.DEV && this.state.error && (
                <details className="rounded-lg bg-slate-100 p-4 border border-slate-200 overflow-hidden">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                    {t(
                      "error_boundary.details_title",
                      "Error Details (Development Only)",
                    )}
                  </summary>
                  <div className="mt-3 text-[10px] font-mono text-red-700 bg-white p-2 rounded border border-slate-200 max-h-40 overflow-auto">
                    <p className="font-bold mb-1 underline">
                      {t("error_boundary.error_label", "Error")}:
                    </p>
                    <p className="mb-3">{this.state.error.toString()}</p>

                    {this.state.error.stack && (
                      <>
                        <p className="font-bold mb-1 underline">
                          {t("error_boundary.stack_label", "Stack Trace")}:
                        </p>
                        <pre className="whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="p-6 pt-2 flex flex-col gap-3">
              <button
                onClick={this.handleRetry}
                className="flex items-center justify-center w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("error_boundary.retry_button", "Try Again")}
              </button>

              <div className="flex gap-3 w-full">
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2 rounded-lg transition-colors"
                >
                  <Home className="mr-2 h-4 w-4" />
                  {t("error_boundary.home_button", "Home")}
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2 rounded-lg transition-colors"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t("error_boundary.reload_button", "Reload")}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
