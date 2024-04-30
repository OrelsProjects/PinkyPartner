import { createHash } from "crypto";

export function generateReferalCode(userId: string) {
  const hash = createHash("sha256")
    .update(userId)
    .digest("hex")
    .substring(0, 6);
  return hash;
}