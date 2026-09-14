import React from "react";
import { Clock, RotateCcw, Play, Pause } from "lucide-react";
import { formatTime } from "../../utils/textUtils";

export default function ExamHeader({
  profiles,
  profileId,
  onProfileChange,
  started,
  finished,
  paused,
  timeLeft,
  lowTime,
  onStart,
  onReset,
  onTogglePause,
}) {
  return (
    <header className="flex items-center justify-between gap-4 bg-[#0b2545] px-4 sm:px-6 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <select
          value={profileId}
          onChange={onProfileChange}
          disabled={started}
          className="bg-[#12345f] text-white text-sm border border-[#2a4d78] px-2.5 py-1.5 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id} className="bg-[#0b2545]">
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {!started && (
          <button
            onClick={onStart}
            className="flex items-center gap-1.5 bg-white text-[#0b2545] text-sm font-medium px-3 py-1.5 hover:bg-slate-100"
          >
            <Play size={14} />
            Start Test
          </button>
        )}
        {started && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 bg-[#12345f] text-white text-sm px-3 py-1.5 border border-[#2a4d78] hover:bg-[#1a4272]"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}
        {started && !finished && (
          <button
            onClick={onTogglePause}
            className="flex items-center gap-1.5 bg-[#12345f] text-white text-sm px-3 py-1.5 border border-[#2a4d78] hover:bg-[#1a4272]"
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
            {paused ? "Resume" : "Pause"}
          </button>
        )}
        <div
          className={`flex items-center gap-1.5 font-mono text-base tabular-nums px-3 py-1.5 border ${
            lowTime ? "border-red-400 text-red-300" : "border-[#2a4d78] text-white"
          }`}
        >
          <Clock size={15} />
          {formatTime(timeLeft)}
        </div>
      </div>
    </header>
  );
}
