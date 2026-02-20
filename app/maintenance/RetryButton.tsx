"use client";

export default function RetryButton() {
  return (
    <button
      type="button"
      className="btn-primary"
      onClick={() => window.location.reload()}
    >
      Retry
    </button>
  );
}
