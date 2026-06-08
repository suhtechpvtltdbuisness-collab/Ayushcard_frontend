/** Printed Card ID + QR payload — cardNo is authoritative when present. */
export function getCardVerifyId(card = {}) {
  return String(
    card.cardNo ||
      card.cardNumber ||
      card.applicationId ||
      card.id ||
      card._id ||
      "",
  ).trim();
}

export function getCardDisplayId(card = {}) {
  return getCardVerifyId(card) || "—";
}

export function buildCardVerifyUrl(card = {}) {
  const id = getCardVerifyId(card);
  if (!id) return "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/verify/${encodeURIComponent(id)}`;
}

function unwrapCardPayload(data) {
  if (!data) return null;
  if (Array.isArray(data?.data)) return data.data[0] || null;
  return data?.data?.card || data?.data || data?.card || data;
}

export function cardMatchesVerifyParam(card, param) {
  if (!card || param == null || param === "") return false;
  const p = String(param).trim().toLowerCase();
  return [card.cardNo, card.cardNumber, card.applicationId, card.id, card._id]
    .filter(Boolean)
    .some((v) => String(v).trim().toLowerCase() === p);
}

export async function fetchPublicCardByVerifyId(apiClient, verifyId) {
  const param = decodeURIComponent(String(verifyId || "").trim());
  if (!param) return null;

  const pickMatch = (payload) => {
    if (!payload) return null;
    if (Array.isArray(payload)) {
      return payload.find((c) => cardMatchesVerifyParam(c, param)) || null;
    }
    return cardMatchesVerifyParam(payload, param) ? payload : null;
  };

  const attempts = [
    () => apiClient.get(`/api/cards/card/${encodeURIComponent(param)}`),
    () => apiClient.get(`/api/cards/${encodeURIComponent(param)}`),
    () => apiClient.get("/api/cards", { params: { cardNo: param } }),
    () => apiClient.get("/api/cards", { params: { applicationId: param } }),
  ];

  for (const attempt of attempts) {
    try {
      const res = await attempt();
      const raw = unwrapCardPayload(res.data);
      if (Array.isArray(raw)) {
        const match = pickMatch(raw);
        if (match) return match;
      } else {
        const match = pickMatch(raw);
        if (match) return match;
      }
    } catch {
      // try next lookup strategy
    }
  }

  return null;
}
