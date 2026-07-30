import React, { useRef, useEffect } from "react";
import { 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, 
  AlignRight, List, ListOrdered, Heading1, Heading2, Link, Unlink, Eraser
} from "lucide-react";

export default function RichTextEditor({ value, onChange, placeholder, colors }) {
  const editorRef = useRef(null);

  // Sync value from prop (initial or external change)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command, argument = null) => {
    document.execCommand(command, false, argument);
    handleInput();
  };

  const addLink = () => {
    const url = prompt("Enter the URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  return (
    <div 
      className="border rounded-md overflow-hidden flex flex-col"
      style={{ borderColor: colors.accent + "30", backgroundColor: colors.background }}
    >
      {/* Toolbar */}
      <div 
        className="flex flex-wrap items-center gap-1 p-2 border-b text-slate-700 dark:text-slate-300"
        style={{ borderColor: colors.accent + "20", backgroundColor: colors.sidebar || colors.background }}
      >
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Underline"
        >
          <Underline size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("strikeThrough")}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        
        <span className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></span>

        <button
          type="button"
          onClick={() => execCommand("formatBlock", "<h1>")}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("formatBlock", "<h2>")}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        
        <span className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></span>

        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>

        <span className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></span>

        <button
          type="button"
          onClick={() => execCommand("justifyLeft")}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyCenter")}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyRight")}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>

        <span className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></span>

        <button
          type="button"
          onClick={addLink}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Add Link"
        >
          <Link size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("unlink")}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Remove Link"
        >
          <Unlink size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("removeFormat")}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Clear Formatting"
        >
          <Eraser size={16} />
        </button>
      </div>

      {/* Editor Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="w-full p-4 min-h-[250px] outline-none text-sm leading-relaxed overflow-auto prose max-w-none focus:ring-1 focus:ring-purple-500/20"
        style={{
          color: colors.text,
          backgroundColor: colors.background,
        }}
        placeholder={placeholder}
      />
    </div>
  );
}
