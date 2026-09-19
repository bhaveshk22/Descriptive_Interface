import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BLOCKED_NAV_KEYS, countWords } from "../../utils/textUtils";

// ---------------------------------------------------------------------------
// useAnswerEditor: every keystroke is intercepted and applied manually,
// rather than letting the browser's native textarea editing run. That's what
// makes the specific quirks possible to reproduce exactly:
//   - no spellcheck / autocapitalize / autocorrect (native attributes, set
//     on the <textarea> itself in AnswerBox.jsx)
//   - Enter does nothing if the char before the cursor is a space or a
//     newline (blocks "double enter" and "enter right after a space")
//   - a space does nothing if the char immediately before the cursor is
//     already a space — no stacked/repeated spaces, a new (non-space)
//     character has to be typed before another space is allowed
//   - deleting a space character with Backspace throws the cursor to the
//     very end of the text, no matter where in the text you were editing
//   - once the word limit is hit, no further character (letter or space)
//     can be typed — deleting still works normally
//   - no key combinations at all: Ctrl/Cmd/Alt+anything (word-delete,
//     select-all, copy/paste, etc.), Home/End/PageUp/PageDown, and
//     Shift+Arrow selection are all swallowed — plain arrow keys are the
//     only way to move the caret
//   - the mouse does nothing inside the box while the test is actively
//     running (no click-to-place-cursor, no drag-select, no right-click
//     menu) — it's keyboard-only, same as the real portal
// ---------------------------------------------------------------------------
function scrollCaretIntoView(textarea, caretPos) {
  const style = window.getComputedStyle(textarea);
  const mirror = document.createElement("div");
  const propsToCopy = [
    "boxSizing", "width", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
    "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
    "fontFamily", "fontSize", "fontWeight", "fontStyle", "lineHeight",
    "letterSpacing", "wordSpacing", "textIndent",
  ];
  propsToCopy.forEach((p) => (mirror.style[p] = style[p]));
  Object.assign(mirror.style, {
    position: "absolute",
    top: "0",
    left: "-9999px",
    visibility: "hidden",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    height: "auto",
  });
 
  const marker = document.createElement("span");
  marker.textContent = "|";
  mirror.textContent = textarea.value.slice(0, caretPos);
  mirror.appendChild(marker);
  document.body.appendChild(mirror);
 
  const markerTop = marker.offsetTop;
  const markerHeight = marker.offsetHeight || parseFloat(style.lineHeight) || 20;
  document.body.removeChild(mirror);
 
  const visibleTop = textarea.scrollTop;
  const visibleBottom = visibleTop + textarea.clientHeight;
 
  if (markerTop < visibleTop) {
    textarea.scrollTop = markerTop;
  } else if (markerTop + markerHeight > visibleBottom) {
    textarea.scrollTop = markerTop + markerHeight - textarea.clientHeight;
  }
}

export function useAnswerEditor({ initialValue, wordLimit, disabled, onChange }) {
  const [value, setValue] = useState(initialValue || "");
  const [copied, setCopied] = useState(false);
  const taRef = useRef(null);
  const desiredCursorRef = useRef(null);

  // After any manually-applied edit, force the caret to where our logic
  // says it should be (this is what lets us reproduce the "jumps to end" bug).
  useLayoutEffect(() => {
    if (desiredCursorRef.current !== null && taRef.current) {
      const pos = desiredCursorRef.current;
      taRef.current.setSelectionRange(pos, pos);
      scrollCaretIntoView(taRef.current, pos);
      desiredCursorRef.current = null;
    }
  }, [value]);

  // Auto-focus whenever the box becomes typable (test start / resume from
  // pause) — the mouse can't be used to click into it, so it has to happen
  // programmatically.
  useEffect(() => {
    if (!disabled && taRef.current) {
      taRef.current.focus();
    }
  }, [disabled]);

  const wordCount = countWords(value);
  const atLimit = wordCount >= wordLimit;

  const commit = (nextValue, cursorPos) => {
    desiredCursorRef.current = cursorPos;
    setValue(nextValue);
    onChange(nextValue);
  };

  const handleKeyDown = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    const ta = taRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const key = e.key;

    // Any modifier-key combination is swallowed outright — this is what
    // kills Ctrl/Cmd+Backspace word-delete, Ctrl/Cmd+A select-all,
    // Ctrl/Cmd+C/V, Alt-based shortcuts, etc. None of that exists on the
    // real portal.
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      return;
    }

    // Home / End / PageUp / PageDown — blocked, no cursor-jumping shortcuts.
    if (BLOCKED_NAV_KEYS.includes(key)) {
      e.preventDefault();
      return;
    }

    // Shift+Arrow keyboard text selection — blocked too.
    if (e.shiftKey && key.startsWith("Arrow")) {
      e.preventDefault();
      return;
    }
    if (key === "Tab") {
      e.preventDefault();
      return;
    }

    // ENTER — blocked right after a space, and blocked right after a
    // newline (so you can never get a blank line / "double enter").
    if (key === "Enter") {
      e.preventDefault();
      if (atLimit) return;
      const charBefore = start > 0 ? value[start - 1] : "";
      if (charBefore === " " || charBefore === "\n") return;
      const next = value.slice(0, start) + "\n" + value.slice(end);
      commit(next, start + 1);
      return;
    }

    // BACKSPACE — the signature bug: deleting a lone space character
    // sends the cursor to the very end of the whole answer.
    if (key === "Backspace") {
      e.preventDefault();
      if (start !== end) {
        const next = value.slice(0, start) + value.slice(end);
        commit(next, start);
        return;
      }
      if (start === 0) return;
      const deletedChar = value[start - 1];
      const next = value.slice(0, start - 1) + value.slice(start);
      const cursor = deletedChar === " " ? next.length : start - 1;
      commit(next, cursor);
      return;
    }

    // DELETE (forward delete) — behaves normally, no jump bug specified for this key.
    if (key === "Delete") {
      e.preventDefault();
      if (start !== end) {
        const next = value.slice(0, start) + value.slice(end);
        commit(next, start);
        return;
      }
      if (start >= value.length) return;
      const next = value.slice(0, start) + value.slice(start + 1);
      commit(next, start);
      return;
    }

    // Regular typed characters (letters, space, punctuation, digits).
    const isPrintable = key.length === 1;
    if (isPrintable) {
      e.preventDefault();
      if (atLimit) return; // hard stop once the word limit is reached

      // No stacked spaces: if a space is already sitting immediately
      // before the caret (and nothing is selected to replace), typing
      // another space is a no-op. A new, non-space character has to be
      // typed before a space is accepted again.
      if (key === " " && start === end && start > 0 && value[start - 1] === " ") {
        return;
      }

      const next = value.slice(0, start) + key + value.slice(end);
      commit(next, start + key.length);
      return;
    }

    // Everything else (plain arrow keys) is left to default browser
    // behaviour — pure caret navigation, not editing, and the only way to
    // move around since the mouse is off.
  };

  const handlePaste = (e) => {
    // Pasting is disabled, matching the locked-down feel of the real portal.
    e.preventDefault();
  };

  // Mouse lockdown — these handlers only ever fire while the textarea is
  // enabled (a native `disabled` textarea doesn't dispatch them at all), so
  // they only bite during an actively running test, exactly as requested.
  const blockMouse = (e) => {
    e.preventDefault();
  };

  const handleCopy = async () => {
    const ta = taRef.current;
    // Remember exactly where the caret/selection was so we can put it back —
    // the fallback path below has to select() the whole box to copy it.
    const prevStart = ta ? ta.selectionStart : null;
    const prevEnd = ta ? ta.selectionEnd : null;
    let succeeded = false;

    try {
      await navigator.clipboard.writeText(value);
      succeeded = true;
    } catch (err) {
      // Fallback for environments without Clipboard API permission.
      try {
        if (disabled) ta.removeAttribute("disabled");
        ta.focus();
        ta.select();
        succeeded = document.execCommand("copy");
      } catch (err2) {
        succeeded = false;
      }
    }

    // Always collapse the selection back to where it was (or the end, if we
    // had no prior position) so the next keystroke doesn't overwrite the
    // whole answer instead of continuing where you left off.
    if (ta) {
      const pos = prevStart !== null ? prevStart : ta.value.length;
      const endPos = prevEnd !== null ? prevEnd : pos;
      ta.setSelectionRange(pos, endPos);
      if (disabled) {
        ta.setAttribute("disabled", "true");
      } else {
        ta.focus();
      }
    }

    if (succeeded) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return {
    value,
    copied,
    taRef,
    wordCount,
    atLimit,
    handleKeyDown,
    handlePaste,
    blockMouse,
    handleCopy,
  };
}
