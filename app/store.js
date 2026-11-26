// HomeLedger store — the single place that owns the family's money data.
// Loads the seed records from data.js, persists every edit in localStorage,
// and answers every question the views ask (totals, per-category spending,
// budget progress, bills due). No network, no other storage.

import { TRANSACTIONS, BUDGETS, GOALS, BILLS, INCOME_SOURCES, MONTH_HISTORY } from './data.js';

const KEY = 'homeledger-v1';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultState() {
  return {
    transactions: clone(TRANSACTIONS),
    budgets: clone(BUDGETS),
    goals: clone(GOALS),
    bills: clone(BILLS),
    month: '2026-11',
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.transactions) || !Array.isArray(parsed.budgets)) return defaultState();
    return parsed;
  } catch {
    return defaultState();
  }
}

export const state = loadState();

export function saveState() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked: keep working in memory */ }
}

export function resetState() {
  const fresh = defaultState();
  state.transactions = fresh.transactions;
  state.budgets = fresh.budgets;
  state.goals = fresh.goals;
  state.bills = fresh.bills;
  state.month = fresh.month;
  saveState();
}

export function setMonth(month) {
  state.month = month;
  saveState();
}

export function monthTransactions(month = state.month) {
  return state.transactions
    .filter((t) => t.date.startsWith(month))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function monthTotals(month = state.month) {
  let income = 0;
  let spending = 0;
  for (const t of state.transactions) {
    if (!t.date.startsWith(month)) continue;
    if (t.type === 'income') income += t.amount;
    else spending += t.amount;
  }
  return { income, spending, balance: income - spending };
}

export function spendingByCategory(month = state.month) {
  const totals = {};
  for (const t of state.transactions) {
    if (t.type !== 'expense' || !t.date.startsWith(month)) continue;
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  }
  return Object.entries(totals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function budgetProgress(month = state.month) {
  const spent = spendingByCategory(month);
  const byCat = Object.fromEntries(spent.map((s) => [s.category, s.amount]));
  return state.budgets.map((b) => {
    const used = byCat[b.category] || 0;
    return {
      ...b,
      used,
      remaining: b.limit - used,
      pct: b.limit > 0 ? Math.round((used / b.limit) * 100) : 0,
    };
  });
}

export function totalBudgeted() {
  return state.budgets.reduce((sum, b) => sum + b.limit, 0);
}

export function addTransaction({ date, note, category, amount, type }) {
  const id = `u${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
  const tx = { id, date, note: note.trim(), category, amount: Math.round(amount * 100) / 100, type };
  state.transactions.push(tx);
  saveState();
  return tx;
}

export function deleteTransaction(id) {
  const i = state.transactions.findIndex((t) => t.id === id);
  if (i === -1) return false;
  state.transactions.splice(i, 1);
  saveState();
  return true;
}

export function updateBudget(category, limit) {
  const b = state.budgets.find((x) => x.category === category);
  if (!b) return false;
  b.limit = Math.max(0, Math.round(limit));
  saveState();
  return true;
}

export function addToGoal(name, amount) {
  const g = state.goals.find((x) => x.name === name);
  if (!g) return false;
  g.saved = Math.min(g.target, Math.round((g.saved + amount) * 100) / 100);
  saveState();
  return true;
}

export function toggleBillPaid(name) {
  const b = state.bills.find((x) => x.name === name);
  if (!b) return false;
  b.paid = !b.paid;
  saveState();
  return true;
}

export function incomeBreakdown() {
  return clone(INCOME_SOURCES);
}

export function trendHistory() {
  const live = monthTotals('2026-11');
  return MONTH_HISTORY.map((m) => ({
    month: m.month,
    income: m.income,
    spending: m.month === '2026-11' ? live.spending : m.spending,
  }));
}

export function upcomingBills() {
  return [...state.bills].sort((a, b) => (a.due < b.due ? -1 : 1));
}

export function formatMoney(amount) {
  const sign = amount < 0 ? '−' : '';
  return `${sign}$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(iso) {
  const [, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[m - 1]} ${d}`;
}
