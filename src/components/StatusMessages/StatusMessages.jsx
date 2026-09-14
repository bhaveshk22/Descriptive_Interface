import React from "react";

export default function StatusMessages({ started, finished }) {
  if (!started && !finished) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        Select a pattern above and press "Start Test" to begin the timer.
      </p>
    );
  }

  if (finished) {
    return (
      <p className="mt-4 text-sm font-medium text-red-600">
        Time's up. The test has been locked, same as the real portal
        auto-submitting. Use "Copy answer" below the box to pull your text out
        for review.
      </p>
    );
  }

  return null;
}
