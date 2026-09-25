import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleGoHome = () => {
    window.location.href = '/home';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[500px] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl border border-[#E5E0D6] p-8 max-w-lg w-full text-center space-y-5 shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-[#E96B7A]/10 text-[#E96B7A] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-mono tracking-widest text-[#E96B7A] uppercase font-bold">
                SYSTEM ANOMALY DETECTED
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#181924]">
                Something unexpected occurred.
              </h2>
              <p className="text-xs text-[#555768] leading-relaxed">
                {this.state.error?.message || 'An error interrupted this view. Your session data is intact.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 bg-[#181924] hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RELOAD VIEW</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 bg-[#F7F4EE] hover:bg-white text-[#181924] border border-[#E5E0D6] px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all"
              >
                <Home className="w-3.5 h-3.5 text-[#5577E6]" />
                <span>RETURN HOME</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
