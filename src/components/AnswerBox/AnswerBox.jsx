import React from "react";
import { Pause, Copy, Check } from "lucide-react";
import { useAnswerEditor } from "./useAnswerEditor";

export default function AnswerBox({ initialValue, wordLimit, disabled, paused, onChange }) {
  const {
    value,
    copied,
    taRef,
    wordCount,
    atLimit,
    handleKeyDown,
    handlePaste,
    blockMouse,
    handleCopy,
  } = useAnswerEditor({ initialValue, wordLimit, disabled, onChange });

  return (
    <div>
      <div className="relative">
        <textarea
          ref={taRef}
          value={value}
          onChange={() => {}}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onMouseDown={blockMouse}
          onDoubleClick={blockMouse}
          onContextMenu={blockMouse}
          onDragStart={blockMouse}
          disabled={disabled}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          placeholder={disabled ? "" : "Start typing your answer here..."}
          className={`w-full resize-none outline-none p-3 border border-slate-300 text-[15px] leading-relaxed text-slate-800 disabled:bg-slate-50 disabled:text-slate-400 ${
            !disabled ? "select-none cursor-default" : ""
          }`}
          style={{ minHeight: "320px", fontFamily: "Arial, Helvetica, sans-serif" }}
        />
        {paused && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/70 pointer-events-none">
            <span className="flex items-center gap-1.5 bg-slate-800 text-white text-xs font-medium px-3 py-1.5">
              <Pause size={13} />
              Test paused — answer preserved
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-1 pt-1.5">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[13px] text-slate-600 border border-slate-300 px-2.5 py-1 hover:bg-slate-100"
        >
          {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy answer"}
        </button>
        <span
          className={
            atLimit
              ? "text-[13px] font-semibold text-red-600"
              : "text-[13px] text-slate-500"
          }
        >
          Words: {Math.max(wordLimit - wordCount, 0)}
        </span>
      </div>
    </div>
  );
}
