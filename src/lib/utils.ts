import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const MAX_PARTICIPANTS_IN_CONTRACT_PREMIUM = 999;
export const MAX_PARTICIPANTS_IN_CONTRACT_FREE = 1;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
