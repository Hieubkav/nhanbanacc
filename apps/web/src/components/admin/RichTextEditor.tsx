"use client";

import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerHTML !== (value || "")) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const exec = (cmd: string, arg?: string) => {
    if (typeof document === "undefined") return;
    document.execCommand(cmd, false, arg);
    // trigger change
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const onInput = () => {
    if (!ref.current) return;
    onChange(ref.current.innerHTML);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-1">
        <Button type="button" variant="ghost" size="sm" onClick={() => exec("bold")}>B</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec("italic")}><span className="italic">I</span></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec("underline")}>U</Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button type="button" variant="ghost" size="sm" onClick={() => exec("formatBlock", "H1")}>H1</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec("formatBlock", "H2")}>H2</Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button type="button" variant="ghost" size="sm" onClick={() => exec("insertUnorderedList")}>• List</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec("insertOrderedList")}>1. List</Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = prompt("Nhập URL:")?.trim();
            if (url) exec("createLink", url);
          }}
        >
          Link
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec("removeFormat")}>Xoá định dạng</Button>
      </div>
      <div
        ref={ref}
        className="min-h-[180px] w-full bg-background px-3 py-2 text-sm outline-none prose prose-sm max-w-none dark:prose-invert"
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        data-placeholder={placeholder || "Nhập nội dung..."}
      />
      <style jsx>{`
        [contenteditable="true"][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
        }
      `}</style>
    </div>
  );
}

