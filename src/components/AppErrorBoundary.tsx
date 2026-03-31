import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("AppErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="min-h-screen bg-background flex items-center justify-center p-8"
          role="alert"
        >
          <div className="max-w-lg w-full rounded-lg border border-destructive/50 bg-destructive/5 p-6">
            <h1 className="text-lg font-semibold text-destructive mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground font-mono mb-4 break-all">
              {this.state.error.message}
            </p>
            <pre className="text-xs text-muted-foreground overflow-auto max-h-48 bg-muted/50 p-3 rounded">
              {this.state.error.stack}
            </pre>
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
