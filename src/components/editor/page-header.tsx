"use client";

import { useState, useRef, useEffect } from "react";
import { PAGE_ICONS, UI } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";

interface PageHeaderProps {
  pageId: string;
  title: string;
  icon: string;
  updatedAt: string;
  onUpdate: (updates: { title?: string; icon?: string }) => void;
}

export default function PageHeader({
  pageId,
  title,
  icon,
  updatedAt,
  onUpdate,
}: PageHeaderProps) {
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentIcon, setCurrentIcon] = useState(icon);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentTitle(title);
    setCurrentIcon(icon);
  }, [title, icon]);

  const handleTitleBlur = () => {
    if (currentTitle !== title) {
      onUpdate({ title: currentTitle || UI.untitledPage });
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      titleRef.current?.blur();
    }
  };

  const handleIconSelect = (newIcon: string) => {
    setCurrentIcon(newIcon);
    setShowIconPicker(false);
    onUpdate({ icon: newIcon });
  };

  return (
    <div className="page-header px-4 py-6 max-w-3xl mx-auto">
      {/* Icon */}
      <div className="relative inline-block mb-3">
        <button
          onClick={() => setShowIconPicker(!showIconPicker)}
          className="text-4xl hover:opacity-80 transition-opacity cursor-pointer p-1 rounded-lg hover:bg-white/5"
          title="Đổi biểu tượng"
        >
          {currentIcon}
        </button>

        {showIconPicker && (
          <div
            className="absolute top-full left-0 mt-1 p-2 rounded-lg shadow-xl z-20 grid grid-cols-8 gap-1 w-[272px]"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
            }}
          >
            {PAGE_ICONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleIconSelect(emoji)}
                className="p-1.5 text-xl rounded-md hover:bg-white/10 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Title */}
      <input
        ref={titleRef}
        type="text"
        value={currentTitle}
        onChange={(e) => setCurrentTitle(e.target.value)}
        onBlur={handleTitleBlur}
        onKeyDown={handleTitleKeyDown}
        className="block w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-[var(--text-muted)]"
        style={{ color: 'var(--text-primary)' }}
        placeholder={UI.untitledPage}
      />

      {/* Last updated */}
      <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        Cập nhật {formatRelativeTime(updatedAt)}
      </p>
    </div>
  );
}
