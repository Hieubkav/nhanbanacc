"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Command({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className,
      )}
      {...props}
    />
  );
}

type CommandInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  onValueChange?: (value: string) => void;
};

export function CommandInput({ className, onValueChange, ...props }: CommandInputProps) {
  return (
    <div className="border-b px-3 py-2">
      <input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground h-10 w-full bg-transparent text-sm outline-hidden",
          className,
        )}
        onChange={(e) => onValueChange?.(e.target.value)}
        {...props}
      />
    </div>
  );
}

export function CommandList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="command-list"
      className={cn("max-h-80 overflow-y-auto overflow-x-hidden p-1", className)}
      {...props}
    />
  );
}

export function CommandEmpty({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="command-empty"
      className={cn("py-6 text-center text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function CommandGroup({ className, heading, ...props }: React.HTMLAttributes<HTMLDivElement> & { heading?: React.ReactNode }) {
  return (
    <div data-slot="command-group" className={cn("overflow-hidden p-1 text-foreground", className)} {...props}>
      {heading ? <div className="px-1.5 pb-1 text-xs font-medium text-muted-foreground">{heading}</div> : null}
      <div className="flex flex-col gap-1">{props.children}</div>
    </div>
  );
}

export function CommandSeparator({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return <hr data-slot="command-separator" className={cn("bg-border -mx-1 my-1 h-px border-0", className)} {...props} />;
}

type CommandItemProps = React.HTMLAttributes<HTMLDivElement> & {
  onSelect?: (value?: string) => void;
  value?: string;
};

export function CommandItem({ className, onSelect, value = "", ...props }: CommandItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect?.(value);
      }}
      data-slot="command-item"
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}
