import React from "react";

export default function QuestionTabs({ questions, currentIndex, onSelect }) {
  if (questions.length <= 1) return null;

  return (
    <div className="flex gap-1.5 mb-3 flex-wrap">
      {questions.map((q, i) => (
        <button
          key={q.id}
          onClick={() => onSelect(i)}
          className={`px-3 py-1.5 text-sm border ${
            i === currentIndex
              ? "bg-white border-slate-400 text-slate-900 font-medium"
              : "bg-slate-200 border-slate-200 text-slate-500 hover:bg-slate-300"
          }`}
        >
          {q.title}
        </button>
      ))}
    </div>
  );
}
