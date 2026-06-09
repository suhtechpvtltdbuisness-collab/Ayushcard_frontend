import { PENALTY_AMOUNT } from "./vitranUtils";

export const SETTLEMENT_RATES = [160, 200, 240, 280];

const RATE_BY_MEMBERS = { 1: 160, 2: 160, 3: 160, 4: 160, 5: 200, 6: 240, 7: 280 };

export function memberCountForCard(card) {
  const explicit = Number(card?.totalMembers ?? card?.totalMember);
  if (!Number.isNaN(explicit) && explicit > 0) return Math.min(7, explicit);
  const fromMembers = Array.isArray(card?.members) ? card.members.length + 1 : 1;
  return Math.min(7, Math.max(1, fromMembers));
}

/** Fee tier from member count: 1–4 → 160, 5 → 200, 6 → 240, 7 → 280 */
export function rateFromMemberCount(memberCount) {
  const n = Math.min(7, Math.max(1, Number(memberCount) || 1));
  return RATE_BY_MEMBERS[n] || 160;
}

export function resolveCardRate(card) {
  const paid = Number(
    card?.totalAmount ?? card?.payment?.totalAmount ?? card?.payment?.totalPaid ?? 0,
  );
  if (SETTLEMENT_RATES.includes(paid)) return paid;
  return rateFromMemberCount(memberCountForCard(card));
}

export function isOnlinePaymentCard(card) {
  const method = String(
    card?.payment?.method ?? card?.paymentMethod ?? card?.paymentMode ?? "",
  ).toLowerCase();
  return (
    method === "online" ||
    method.includes("cashfree") ||
    method.includes("upi") ||
    method.includes("netbank")
  );
}

export function isPenaltyOnline(penalty) {
  const method = String(penalty?.paymentMethod ?? "").toLowerCase();
  return method === "online";
}

function emptyBuckets() {
  return { 160: { off: 0, on: 0 }, 200: { off: 0, on: 0 }, 240: { off: 0, on: 0 }, 280: { off: 0, on: 0 } };
}

export function calculateSettlementFromCards(cards = [], penalties = []) {
  const buckets = emptyBuckets();

  (Array.isArray(cards) ? cards : []).forEach((card) => {
    const rate = resolveCardRate(card);
    const channel = isOnlinePaymentCard(card) ? "on" : "off";
    if (buckets[rate]) buckets[rate][channel] += 1;
  });

  const off160 = buckets[160].off;
  const off200 = buckets[200].off;
  const off240 = buckets[240].off;
  const off280 = buckets[280].off;
  const on160 = buckets[160].on;
  const on200 = buckets[200].on;
  const on240 = buckets[240].on;
  const on280 = buckets[280].on;

  const amt160 = off160 * 160;
  const amt200 = off200 * 200;
  const amt240 = off240 * 240;
  const amt280 = off280 * 280;
  const onAmt160 = on160 * 160;
  const onAmt200 = on200 * 200;
  const onAmt240 = on240 * 240;
  const onAmt280 = on280 * 280;

  let penaltyCount = 0;
  let onPenaltyCount = 0;
  let penaltyAmount = 0;
  let onPenaltyAmount = 0;
  (Array.isArray(penalties) ? penalties : []).forEach((p) => {
    const amount = Number(p?.penaltyAmount) || PENALTY_AMOUNT;
    if (isPenaltyOnline(p)) {
      onPenaltyCount += 1;
      onPenaltyAmount += amount;
    } else {
      penaltyCount += 1;
      penaltyAmount += amount;
    }
  });

  const offlineCount = off160 + off200 + off240 + off280;
  const onlineCount = on160 + on200 + on240 + on280;
  const offlineBaseTotal = amt160 + amt200 + amt240 + amt280;
  const onlineBaseTotal = onAmt160 + onAmt200 + onAmt240 + onAmt280;
  const offlineTotalWithPenalty = offlineBaseTotal + penaltyAmount;
  const onlineTotalWithPenalty = onlineBaseTotal + onPenaltyAmount;
  const grandTotal = offlineBaseTotal + onlineBaseTotal + penaltyAmount + onPenaltyAmount;

  return {
    off160,
    off200,
    off240,
    off280,
    on160,
    on200,
    on240,
    on280,
    amt160,
    amt200,
    amt240,
    amt280,
    onAmt160,
    onAmt200,
    onAmt240,
    onAmt280,
    offlineCount,
    onlineCount,
    offlineBaseTotal,
    onlineBaseTotal,
    penaltyCount,
    penaltyAmount,
    onPenaltyCount,
    onPenaltyAmount,
    offlineTotalWithPenalty,
    onlineTotalWithPenalty,
    grandTotal,
    totalCards: offlineCount + onlineCount,
  };
}

export const EMPTY_SETTLEMENT = calculateSettlementFromCards([], []);
