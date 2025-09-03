import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  if (!input) return "";
  let s = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  // Vietnamese specific
  s = s.replace(/đ/g, "d");
  // Replace non-alphanumeric with hyphen
  s = s.replace(/[^a-z0-9]+/g, "-");
  // Trim hyphens
  s = s.replace(/^-+|-+$/g, "");
  // Collapse multiple hyphens
  s = s.replace(/-+/g, "-");
  return s;
}
