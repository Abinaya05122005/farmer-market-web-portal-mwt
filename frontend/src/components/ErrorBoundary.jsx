import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#fcfbf7] dark:bg-stone-950 text-stone-900 dark:text-stone-100">
          <div className="max-w-lg w-full bg-white dark:bg-stone-900 rounded-3xl p-8 border border-rose-200 dark:border-rose-900 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <h2 className="text-xl font-bold font-display text-rose-700 dark:text-rose-400">
              Something went wrong loading this view
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              An unexpected error occurred while rendering the page:
            </p>
            <pre className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs text-rose-600 dark:text-rose-300 overflow-x-auto whitespace-pre-wrap">
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-farm-700 hover:bg-farm-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/';
                }}
                className="px-5 py-2.5 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
