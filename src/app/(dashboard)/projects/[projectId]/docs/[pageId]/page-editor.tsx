"use client";

import { useCallback, useRef, useState } from "react";
import { PAGE_ICONS } from "@/lib/constants";

interface PageEditorProps {
  pageId: string;
  projectId: string;
  initialTitle: string;
  initialContent: unknown;
  initialIcon: string;
}

export default function PageEditor({
  pageId,
  projectId: _projectId,
  initialTitle,
  initialContent,
  initialIcon,
}: PageEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [icon, setIcon] = useState(initialIcon);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">(
    "idle"
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef(initialContent);

  const save = useCallback(
    async (data: { title?: string; content?: unknown; icon?: string }) => {
      setSaveStatus("saving");
      try {
        await fetch(`/api/pages/${pageId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("idle");
      }
    },
    [pageId]
  );

  const debouncedSave = useCallback(
    (data: { title?: string; content?: unknown; icon?: string }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => save(data), 800);
    },
    [save]
  );

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedSave({ title: newTitle });
  };

  const handleIconChange = (newIcon: string) => {
    setIcon(newIcon);
    setShowIconPicker(false);
    save({ icon: newIcon });
  };

  const handleContentChange = (newContent: unknown) => {
    contentRef.current = newContent;
    debouncedSave({ content: newContent });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Save status indicator */}
      <div className="flex justify-end mb-4">
        {saveStatus === "saving" && (
          <span className="text-xs text-neutral-400">Đang lưu...</span>
        )}
        {saveStatus === "saved" && (
          <span className="text-xs text-emerald-500">✓ Đã lưu</span>
        )}
      </div>

      {/* Icon + Title */}
      <div className="flex items-start gap-3 mb-8">
        {/* Icon picker */}
        <div className="relative">
          <button
            onClick={() => setShowIconPicker(!showIconPicker)}
            className="text-4xl hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg p-1 transition-colors"
            title="Đổi biểu tượng"
          >
            {icon}
          </button>
          {showIconPicker && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg p-3 grid grid-cols-8 gap-1 w-72">
              {PAGE_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleIconChange(emoji)}
                  className="text-xl p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editable title */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Trang mới"
          className="flex-1 text-3xl font-bold text-neutral-900 dark:text-neutral-100 bg-transparent border-none outline-none placeholder-neutral-300 dark:placeholder-neutral-600"
        />
      </div>

      {/* Content editor area */}
      <div className="prose dark:prose-invert max-w-none min-h-[400px]">
        <ContentEditor
          initialContent={initialContent}
          onChange={handleContentChange}
        />
      </div>
    </div>
  );
}

function ContentEditor({
  initialContent,
  onChange,
}: {
  initialContent: unknown;
  onChange: (content: unknown) => void;
}) {
  const [content, setContent] = useState<string>(() => {
    if (!initialContent) return "";
    if (typeof initialContent === "string") return initialContent;
    // Render BlockNote JSON as simple text for now
    try {
      return extractTextFromBlocks(initialContent as Block[]);
    } catch {
      return JSON.stringify(initialContent);
    }
  });

  const handleChange = (value: string) => {
    setContent(value);
    onChange(value);
  };

  return (
    <textarea
      value={content}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="Nhập '/' để xem lệnh..."
      className="w-full min-h-[400px] bg-transparent border-none outline-none resize-none text-neutral-700 dark:text-neutral-300 text-base leading-relaxed placeholder-neutral-300 dark:placeholder-neutral-600"
    />
  );
}

interface Block {
  type: string;
  content?: Array<{ type: string; text?: string }>;
  props?: Record<string, unknown>;
}

function extractTextFromBlocks(blocks: Block[]): string {
  return blocks
    .map((block) => {
      if (block.content && Array.isArray(block.content)) {
        return block.content
          .map((c) => c.text || "")
          .filter(Boolean)
          .join("");
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}
