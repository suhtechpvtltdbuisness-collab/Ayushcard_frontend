// ─── DATA STORE ──────────────────────────────────────────────────
// Functions now act simply as local caching or an empty state 
// since we are replacing dummy data with live API data.

export const getDonations = () => {
  const stored = localStorage.getItem("donations_data");
  // Assuming a migration away from dummy data:
  // if you want to keep previously entered items, you can parse them.
  // For now, returning empty array if it looks like dummy data.
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.length !== 14) return parsed; // 14 was the exact length of the initial dummy data
  }
  return [];
};

export const getHealthCards = () => {
  const stored = localStorage.getItem("health_cards_data");
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.length !== 16) return parsed; 
  }
  return [];
};

export const getPartners = () => {
  return [];
};

export const getEmployees = () => {
  const stored = localStorage.getItem("employees_data");
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.length !== 14) return parsed; 
  }
  return [];
};

export const getSalaries = () => {
  const stored = localStorage.getItem("salary_data");
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.length !== 14) return parsed;
  }
  return [];
};
