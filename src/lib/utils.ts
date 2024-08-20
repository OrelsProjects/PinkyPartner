import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const MAX_PARTICIPANTS_IN_CONTRACT = 999;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
