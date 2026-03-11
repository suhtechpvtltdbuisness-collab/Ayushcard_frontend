// ─── DATA STORE ──────────────────────────────────────────────────
// Functions now act simply as local caching or an empty state 
// since we are replacing dummy data with live API data.

export const getDonations = () => {
  const stored = localStorage.getItem("donations_data");
  if (stored) {
    const parsed = JSON.parse(stored);
    return parsed;
  }
  // Fallback mock data
  return [
    { id: "ENQ-001", name: "Ravi Shankar", contact: "9876543210", date: "20-02-2026", time: "10:30 AM", location: "Kanpur,UP" },
    { id: "ENQ-002", name: "Priya Gupta", contact: "9123456789", date: "18-02-2026", time: "02:15 PM", location: "Lucknow,UP" },
    { id: "ENQ-003", name: "Amit Verma", contact: "9988776655", date: "15-02-2026", time: "11:00 AM", location: "Noida,UP" },
    { id: "ENQ-004", name: "Sunita Devi", contact: "8877665544", date: "14-02-2026", time: "04:45 PM", location: "Delhi" },
    { id: "ENQ-005", name: "Rakesh Sharma", contact: "9001122334", date: "12-02-2026", time: "09:00 AM", location: "Kanpur,UP" },
    { id: "ENQ-006", name: "Kavita Singh", contact: "9900112233", date: "10-02-2026", time: "03:30 PM", location: "Lucknow,UP" },
    { id: "ENQ-007", name: "Manoj Tiwari", contact: "8899001122", date: "08-02-2026", time: "01:00 PM", location: "Noida,UP" },
    { id: "ENQ-008", name: "Geeta Patel", contact: "7788990011", date: "06-02-2026", time: "11:45 AM", location: "Delhi" },
    { id: "ENQ-009", name: "Suresh Kumar", contact: "9090909090", date: "04-02-2026", time: "10:00 AM", location: "Kanpur,UP" },
    { id: "ENQ-010", name: "Anita Mishra", contact: "8080808080", date: "02-02-2026", time: "05:00 PM", location: "Lucknow,UP" },
  ];
};

export const getHealthCards = () => {
  const stored = localStorage.getItem("employee_mock_healthcards");
  if (stored) return JSON.parse(stored);

  // Fallback 8 mock items if nothing is created yet
  return [
    {
      id: "MH-2026-0001",
      applicationId: "MH-2026-0001",
      dateApplied: "10-02-2026",
      status: "pending",
      firstName: "Rajesh",
      lastName: "Kumar",
      contact: "9876543210",
      totalMember: 4,
      members: [
        { name: "Priya", relation: "Spouse", age: "32" },
        { name: "Aarav", relation: "Child", age: "8" },
        { name: "Diya", relation: "Child", age: "5" }
      ],
      totalAmount: 150
    },
    {
      id: "MH-2026-0002",
      applicationId: "MH-2026-0002",
      dateApplied: "12-02-2026",
      status: "approved",
      firstName: "Sneha",
      lastName: "Sharma",
      contact: "9123456780",
      totalMember: 1,
      members: [],
      totalAmount: 120
    },
    {
      id: "MH-2026-0003",
      applicationId: "MH-2026-0003",
      dateApplied: "14-02-2026",
      status: "rejected",
      firstName: "Vikram",
      lastName: "Singh",
      contact: "9988776655",
      totalMember: 3,
      members: [
        { name: "Anita", relation: "Spouse", age: "28" },
        { name: "Ravi", relation: "Child", age: "4" }
      ],
      totalAmount: 140
    },
    {
      id: "MH-2026-0004",
      applicationId: "MH-2026-0004",
      dateApplied: "15-02-2026",
      status: "active",
      firstName: "Pooja",
      lastName: "Patel",
      contact: "9001122334",
      totalMember: 2,
      members: [
        { name: "Rahul", relation: "Spouse", age: "30" }
      ],
      totalAmount: 130
    },
    {
      id: "MH-2026-0005",
      applicationId: "MH-2026-0005",
      dateApplied: "18-02-2026",
      status: "expired",
      firstName: "Amit",
      lastName: "Verma",
      contact: "8899001122",
      totalMember: 5,
      members: [
        { name: "Sunita", relation: "Spouse", age: "35" },
        { name: "Kunal", relation: "Child", age: "12" },
        { name: "Neha", relation: "Child", age: "10" },
        { name: "Rohan", relation: "Child", age: "7" }
      ],
      totalAmount: 160
    },
    {
      id: "MH-2026-0006",
      applicationId: "MH-2026-0006",
      dateApplied: "20-02-2026",
      status: "pending",
      firstName: "Anita",
      lastName: "Desai",
      contact: "7788990011",
      totalMember: 1,
      members: [],
      totalAmount: 120
    },
    {
      id: "MH-2026-0007",
      applicationId: "MH-2026-0007",
      dateApplied: "21-02-2026",
      status: "approved",
      firstName: "Karan",
      lastName: "Mehta",
      contact: "9900112233",
      totalMember: 3,
      members: [
        { name: "Simran", relation: "Spouse", age: "29" },
        { name: "Kabir", relation: "Child", age: "2" }
      ],
      totalAmount: 140
    },
    {
      id: "MH-2026-0008",
      applicationId: "MH-2026-0008",
      dateApplied: "25-02-2026",
      status: "pending",
      firstName: "Manoj",
      lastName: "Tiwari",
      contact: "8877665544",
      totalMember: 2,
      members: [
        { name: "Gita", relation: "Spouse", age: "40" }
      ],
      totalAmount: 130
    }
  ];
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

export const markCardsAsExported = (ids) => {
  const cards = getHealthCards();
  const updatedCards = cards.map((c) => {
    if (ids.includes(c.id) || ids.includes(c._id) || ids.includes(c.applicationId)) {
      return { ...c, status: "exported" };
    }
    return c;
  });
  localStorage.setItem("employee_mock_healthcards", JSON.stringify(updatedCards));
};
