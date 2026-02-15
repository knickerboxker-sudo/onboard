"use client";

import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Trading terminal crashed", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#05070b] p-6 text-slate-100">
          <div className="max-w-lg rounded-xl border border-rose-500/40 bg-rose-950/30 p-6">
            <h1 className="text-xl font-semibold">Something went wrong.</h1>
            <p className="mt-2 text-sm text-rose-100/80">
              Refresh the page and verify your stock API key is configured.
            </p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
