import { useEffect, useState } from "react";

// Countdown, driven off a single interval per "started" session. Pausing
// just skips (re)creating the interval — timeLeft stays exactly where it
// was and resumes from there.
export function useCountdownTimer({ started, finished, paused, onExpire, initialSeconds = 0 }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (!started || finished || paused) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          onExpire();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, finished, paused]);

  return [timeLeft, setTimeLeft];
}
