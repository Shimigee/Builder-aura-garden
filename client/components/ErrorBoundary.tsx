import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleClearData = () => {
    try {
      localStorage.removeItem("parkmaster_lots");
      localStorage.removeItem("parkmaster_permits");
      window.location.reload();
    } catch (error) {
      console.error("Failed to clear data:", error);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                The application encountered an error. This might be caused by
                corrupted data.
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={this.handleReset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>

              <Button
                variant="outline"
                onClick={this.handleClearData}
                className="w-full"
              >
                Clear Data & Reload
              </Button>
            </div>

            <details className="text-left">
              <summary className="text-sm text-muted-foreground cursor-pointer">
                Error Details
              </summary>
              <pre className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
