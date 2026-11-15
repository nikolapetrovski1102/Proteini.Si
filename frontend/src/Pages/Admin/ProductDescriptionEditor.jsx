import { useEffect, useRef } from "react";
import { FiBold, FiItalic, FiList } from "react-icons/fi";
import { sanitizeDescriptionHtml } from "../Products/productDescription";

const toolClass =
  "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md px-2 text-[13px] font-semibold text-gray-700 transition hover:bg-black/[0.06] hover:text-gray-900";

export default function ProductDescriptionEditor({ value, onChange, label, hint }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.innerHTML = sanitizeDescriptionHtml(value);
    }
  }, [value]);

  const update = () => onChange(sanitizeDescriptionHtml(editorRef.current?.innerHTML));
  const format = (command, argument) => {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    update();
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    const plain = event.clipboardData.getData("text/plain");
    const safe = html
      ? sanitizeDescriptionHtml(html)
      : sanitizeDescriptionHtml(plain.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"));
    document.execCommand("insertHTML", false, safe);
    update();
  };

  return (
    <div>
      {label && <p className="mb-1.5 text-[13px] font-semibold text-gray-800">{label}</p>}
      <div className="overflow-hidden rounded-xl border border-black/[0.12] bg-white focus-within:border-[#141409] focus-within:ring-2 focus-within:ring-[#141409]/10">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-black/[0.08] bg-[#f6f5f1] px-1.5 py-1" onMouseDown={(event) => event.preventDefault()}>
          <button type="button" className={toolClass} onClick={() => format("bold")} aria-label="Bold" title="Bold">
            <FiBold size={14} aria-hidden="true" />
          </button>
          <button type="button" className={toolClass} onClick={() => format("italic")} aria-label="Italic" title="Italic">
            <FiItalic size={14} aria-hidden="true" />
          </button>
          <span className="mx-1 h-5 w-px bg-black/10" aria-hidden="true" />
          <button type="button" className={toolClass} onClick={() => format("formatBlock", "h3")}>
            Heading
          </button>
          <button type="button" className={toolClass} onClick={() => format("formatBlock", "p")}>
            Text
          </button>
          <span className="mx-1 h-5 w-px bg-black/10" aria-hidden="true" />
          <button type="button" className={toolClass} onClick={() => format("insertUnorderedList")} title="Bullet list">
            <FiList size={14} aria-hidden="true" /> Bullets
          </button>
          <button type="button" className={toolClass} onClick={() => format("insertOrderedList")} title="Numbered list">
            1. Numbers
          </button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          role="textbox"
          aria-label={label}
          aria-multiline="true"
          suppressContentEditableWarning
          onInput={update}
          onPaste={handlePaste}
          onBlur={() => {
            const safe = sanitizeDescriptionHtml(editorRef.current?.innerHTML);
            editorRef.current.innerHTML = safe;
            onChange(safe);
          }}
          className="product-description min-h-56 max-h-[420px] overflow-y-auto px-4 py-3 text-[15px] outline-none"
        />
      </div>
      {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
