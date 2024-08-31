import { createHash } from "crypto";

export function generateReferralCode(userId: string) {
  const hash = createHash("sha256")
    .update(userId)
    .digest("hex")
    .substring(0, 6);
  return hash;
}

export function generateReferralUrl(
  referralCode?: string,
  contractId?: string,
  isChallenge?: boolean,
) {
  const baseUrl = `${window.location.origin}/`;
  let url = referralCode ? `${baseUrl}?referralCode=${referralCode}` : baseUrl;

  if (contractId) {
    const contractIdString = isChallenge ? "challengeId" : "contractId";
    url += referralCode
      ? `&${contractIdString}=${contractId}`
      : `?${contractIdString}=${contractId}`;
  }
  return url;
}
