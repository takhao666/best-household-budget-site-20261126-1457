// HomeLedger seed data — the Alvarez family's own November 2026 records.
// Realistic household figures for a family of four. Categories carry a colour
// used by charts, chips and budget bars across the site.

export const FAMILY = 'The Alvarez family';
export const MONTHS = ['2026-09', '2026-10', '2026-11'];
export const MONTH_LABELS = {
  '2026-09': 'September 2026',
  '2026-10': 'October 2026',
  '2026-11': 'November 2026',
};

export const CATEGORIES = {
  Housing: '#0f766e',
  Groceries: '#65a30d',
  Transport: '#1d4ed8',
  Utilities: '#7c3aed',
  Dining: '#d97706',
  Entertainment: '#db2777',
  Health: '#0891b2',
  Kids: '#ea580c',
  Shopping: '#4d7c0f',
  Income: '#15803d',
  Savings: '#0f766e',
  Other: '#6b7280',
};
export const CATEGORY_LIST = Object.keys(CATEGORIES);

export const INCOME_SOURCES = [
  { source: 'Salary — Maya (nurse)', amount: 3400 },
  { source: 'Salary — Daniel (teacher)', amount: 2150 },
  { source: 'Freelance design — Daniel', amount: 950 },
  { source: 'Child benefit', amount: 350 },
];

export const BUDGETS = [
  { category: 'Housing', limit: 1450 },
  { category: 'Groceries', limit: 720 },
  { category: 'Transport', limit: 380 },
  { category: 'Utilities', limit: 310 },
  { category: 'Dining', limit: 260 },
  { category: 'Entertainment', limit: 180 },
  { category: 'Health', limit: 220 },
  { category: 'Kids', limit: 300 },
  { category: 'Shopping', limit: 250 },
];

export const GOALS = [
  { name: 'Emergency fund', target: 9000, saved: 6840, note: 'Six months of essentials, kept in a separate savings account.' },
  { name: 'Summer holiday — coast trip', target: 2400, saved: 1750, note: 'Two weeks by the coast in July, flights already priced.' },
  { name: 'Replace the family car', target: 12000, saved: 4310, note: 'Saving toward a reliable used estate car next year.' },
  { name: 'Kitchen refresh', target: 1800, saved: 620, note: 'New worktops and a dishwasher, planned for spring.' },
];

export const BILLS = [
  { name: 'Mortgage — First City Bank', amount: 1180, due: '2026-12-01', auto: true, paid: false },
  { name: 'Electricity — NorthGrid', amount: 96, due: '2026-11-28', auto: true, paid: true },
  { name: 'Water — City Water', amount: 54, due: '2026-12-05', auto: true, paid: false },
  { name: 'Internet & TV — FiberHome', amount: 79, due: '2026-12-03', auto: true, paid: false },
  { name: 'Mobile — two lines', amount: 68, due: '2026-12-10', auto: true, paid: false },
  { name: 'Car insurance — SafeDrive', amount: 112, due: '2026-12-15', auto: false, paid: false },
  { name: 'Home insurance', amount: 47, due: '2026-12-20', auto: false, paid: false },
  { name: 'Gym — Riverside Fitness', amount: 39, due: '2026-12-01', auto: true, paid: false },
];

// November 2026 transactions, newest first. Amounts are spending (positive);
// income rows carry type 'income'. Dates are within the month shown.
export const TRANSACTIONS = [
  { id: 't01', date: '2026-11-26', note: 'Weekly shop — GreenMart', category: 'Groceries', amount: 86.40, type: 'expense' },
  { id: 't02', date: '2026-11-25', note: 'Petrol — Shell Station', category: 'Transport', amount: 52.00, type: 'expense' },
  { id: 't03', date: '2026-11-25', note: 'Pizza night — Tony’s', category: 'Dining', amount: 34.50, type: 'expense' },
  { id: 't04', date: '2026-11-24', note: 'Freelance design — logo job', category: 'Income', amount: 950.00, type: 'income' },
  { id: 't05', date: '2026-11-23', note: 'School lunches — Leo & Ana', category: 'Kids', amount: 28.75, type: 'expense' },
  { id: 't06', date: '2026-11-22', note: 'Cinema — family film', category: 'Entertainment', amount: 41.00, type: 'expense' },
  { id: 't07', date: '2026-11-21', note: 'Weekly shop — GreenMart', category: 'Groceries', amount: 112.30, type: 'expense' },
  { id: 't08', date: '2026-11-21', note: 'Pharmacy — cold medicine', category: 'Health', amount: 18.90, type: 'expense' },
  { id: 't09', date: '2026-11-20', note: 'Dinner out — Bistro Verde', category: 'Dining', amount: 68.20, type: 'expense' },
  { id: 't10', date: '2026-11-19', note: 'Bus passes — monthly', category: 'Transport', amount: 74.00, type: 'expense' },
  { id: 't11', date: '2026-11-18', note: 'Electricity — NorthGrid', category: 'Utilities', amount: 96.40, type: 'expense' },
  { id: 't12', date: '2026-11-17', note: 'Kids’ shoes — SportsDirect', category: 'Kids', amount: 59.99, type: 'expense' },
  { id: 't13', date: '2026-11-16', note: 'Weekly shop — GreenMart', category: 'Groceries', amount: 94.15, type: 'expense' },
  { id: 't14', date: '2026-11-15', note: 'Salary — Maya (nurse)', category: 'Income', amount: 3400.00, type: 'income' },
  { id: 't15', date: '2026-11-15', note: 'Salary — Daniel (teacher)', category: 'Income', amount: 2150.00, type: 'income' },
  { id: 't16', date: '2026-11-14', note: 'Streaming — movies & music', category: 'Entertainment', amount: 24.98, type: 'expense' },
  { id: 't17', date: '2026-11-13', note: 'Takeaway — Thai Garden', category: 'Dining', amount: 42.80, type: 'expense' },
  { id: 't18', date: '2026-11-12', note: 'Dentist check-up — Ana', category: 'Health', amount: 65.00, type: 'expense' },
  { id: 't19', date: '2026-11-11', note: 'Weekly shop — GreenMart', category: 'Groceries', amount: 103.60, type: 'expense' },
  { id: 't20', date: '2026-11-10', note: 'Petrol — Shell Station', category: 'Transport', amount: 48.50, type: 'expense' },
  { id: 't21', date: '2026-11-09', note: 'School trip — Leo', category: 'Kids', amount: 35.00, type: 'expense' },
  { id: 't22', date: '2026-11-08', note: 'Books & stationery', category: 'Shopping', amount: 46.20, type: 'expense' },
  { id: 't23', date: '2026-11-07', note: 'Weekly shop — GreenMart', category: 'Groceries', amount: 98.75, type: 'expense' },
  { id: 't24', date: '2026-11-06', note: 'Internet & TV — FiberHome', category: 'Utilities', amount: 79.00, type: 'expense' },
  { id: 't25', date: '2026-11-05', note: 'Coffee with friends', category: 'Dining', amount: 16.40, type: 'expense' },
  { id: 't26', date: '2026-11-04', note: 'Winter coats — Leo & Ana', category: 'Shopping', amount: 129.00, type: 'expense' },
  { id: 't27', date: '2026-11-03', note: 'Child benefit', category: 'Income', amount: 350.00, type: 'income' },
  { id: 't28', date: '2026-11-02', note: 'Weekly shop — GreenMart', category: 'Groceries', amount: 88.90, type: 'expense' },
  { id: 't29', date: '2026-11-02', note: 'Gym — Riverside Fitness', category: 'Entertainment', amount: 39.00, type: 'expense' },
  { id: 't30', date: '2026-11-01', note: 'Mortgage — First City Bank', category: 'Housing', amount: 1180.00, type: 'expense' },
  { id: 't31', date: '2026-11-01', note: 'Mobile — two lines', category: 'Utilities', amount: 68.00, type: 'expense' },
  { id: 't32', date: '2026-11-01', note: 'Home insurance', category: 'Utilities', amount: 47.00, type: 'expense' },
  { id: 't33', date: '2026-10-28', note: 'Weekly shop — GreenMart', category: 'Groceries', amount: 91.20, type: 'expense' },
  { id: 't34', date: '2026-10-15', note: 'Salary — Maya (nurse)', category: 'Income', amount: 3400.00, type: 'income' },
];

// Past months, for the trend chart and reports.
export const MONTH_HISTORY = [
  { month: '2026-09', income: 6720, spending: 3985 },
  { month: '2026-10', income: 6850, spending: 4210 },
  { month: '2026-11', income: 6850, spending: 0 }, // November spending is computed live
];
