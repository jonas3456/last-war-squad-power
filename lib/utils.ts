import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPower(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function isStale(submittedAt: string | null, hours = 48): boolean {
  if (!submittedAt) return true;
  const diff = Date.now() - new Date(submittedAt).getTime();
  return diff > hours * 60 * 60 * 1000;
}

export function getBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
