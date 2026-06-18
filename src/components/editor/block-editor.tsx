"use client";

import { useCallback, useState, useRef, useMemo } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { Block } from "@blocknote/core";
import { useAutoSave } from "@/hooks";
import { useTheme } from "@/components/providers/theme-provider";

interface BlockEditorProps {
  pageId: string;
  initialContent?: Block[];
  editable?: boolean;
}

export default function BlockEditor({
  pageId,
  initialContent,
  editable = true,
}: BlockEditorProps) {
  const { theme } = useTheme();
  const [content, setContent] = useState<Block[] | undefined>(initialContent);

  const editor = useCreateBlockNote({
    initialContent: initialContent && initialContent.length > 0 ? initialContent : undefined,
  });

  const saveContent = useCallback(
    async (blocks: Block[]) => {
      try {
        await fetch(`/api/pages/${pageId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: blocks }),
        });
      } catch (error) {
        console.error("Failed to save:", error);
      }
    },
    [pageId]
  );

  const { isSaving, lastSaved } = useAutoSave(content, saveContent as (content: Block[] | undefined) => Promise<void>, 1500);

  const handleChange = useCallback(() => {
    const blocks = editor.document;
    setContent(blocks as Block[]);
  }, [editor]);

  return (
    <div className="block-editor-wrapper">
      {/* Save indicator */}
      <div className="flex items-center justify-end px-4 py-1 text-xs" style={{ color: 'var(--text-muted)' }}>
        {isSaving ? (
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Đang lưu...
          </span>
        ) : lastSaved ? (
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
            Đã lưu
          </span>
        ) : null}
      </div>

      {/* Editor */}
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={handleChange}
        theme={theme}
        data-theming-css-variables-demo
      />
    </div>
  );
}
