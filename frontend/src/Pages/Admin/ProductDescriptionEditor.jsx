import { useEffect, useRef } from "react";
import { sanitizeDescriptionHtml } from "../Products/productDescription";

export default function ProductDescriptionEditor({ value, onChange, label }) {
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
      : sanitizeDescriptionHtml(plain.replace(/&/g, "&amp;").replace(/</g, "&lt;")
          .replace(/>/g, "&gt;").replace(/\n/g, "<br>"));
    document.execCommand("insertHTML", false, safe);
    update();
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-1 border border-gray-300 border-b-0 p-2" onMouseDown={(event) => event.preventDefault()}>
        <button type="button" className="px-2 py-1 border" onClick={() => format("bold")} aria-label="Bold">B</button>
        <button type="button" className="px-2 py-1 border italic" onClick={() => format("italic")} aria-label="Italic">I</button>
        <button type="button" className="px-2 py-1 border" onClick={() => format("formatBlock", "h3")}>Heading</button>
        <button type="button" className="px-2 py-1 border" onClick={() => format("formatBlock", "p")}>Paragraph</button>
        <button type="button" className="px-2 py-1 border" onClick={() => format("insertUnorderedList")}>Bullets</button>
        <button type="button" className="px-2 py-1 border" onClick={() => format("insertOrderedList")}>Numbers</button>
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
        className="product-description min-h-64 max-h-[420px] overflow-y-auto border border-gray-300 p-3 outline-none focus:border-[#2096D8]"
      />
    </div>
  );
}
