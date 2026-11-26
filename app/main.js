// HomeLedger router — hash routes, one page per section, no page reloads.
// After each render it wires that page's forms and buttons, then marks the
// page ready so a screenshot script knows when to capture.
//
//   #/                Dashboard
//   #/transactions    Transactions
//   #/budgets         Budgets
//   #/goals           Savings goals
//   #/bills           Bills
//   #/reports         Reports
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { state, setMonth, addTransaction, deleteTransaction, updateBudget,
  addToGoal, toggleBillPaid, budgetProgress, formatMoney } from './store.js';
import { MONTH_LABELS } from './data.js';
import { dashboardView, bindDashboard, transactionsView, renderTxList,
  budgetsView, goalsView, billsView, reportsView, bindReports, notFoundView } from './views.js';

const app = document.getElementById('app');
const monthSelect = document.getElementById('monthSelect');

const ROUTES = {
  '': { view: dashboardView, bind: bindDashboard },
  transactions: { view: transactionsView, bind: bindTransactions },
  budgets: { view: budgetsView, bind: bindBudgets },
  goals: { view: goalsView, bind: bindGoals },
  bills: { view: billsView, bind: bindBills },
  reports: { view: reportsView, bind: bindReports },
};

function render() {
  window.__shotReady = false;
  const route = (location.hash.replace(/^#\/?/, '').split('/')[0] || '');
  const found = ROUTES[route];
  document.title = found ? `${route ? route[0].toUpperCase() + route.slice(1) : 'Dashboard'} | HomeLedger` : 'Not found | HomeLedger';
  app.innerHTML = found ? found.view() : notFoundView();
  document.querySelectorAll('.nav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === route);
  });
  if (monthSelect) monthSelect.value = state.month;
  if (found && found.bind) found.bind();
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function bindTransactions() {
  renderTxList();
  for (const id of ['txSearch', 'txCategory', 'txType']) {
    document.getElementById(id)?.addEventListener('input', renderTxList);
  }
  document.getElementById('txReset')?.addEventListener('click', () => {
    document.getElementById('txSearch').value = '';
    document.getElementById('txCategory').value = '';
    document.getElementById('txType').value = '';
    renderTxList();
  });
  document.getElementById('addTx')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    const amount = Number(form.amount.value);
    if (!Number.isFinite(amount) || amount <= 0) return;
    const tx = addTransaction({
      date: form.date.value || '2026-11-26',
      note: form.note.value,
      category: form.category.value,
      amount,
      type: form.type.value,
    });
    document.getElementById('addTxMsg').textContent =
      `Added ${formatMoney(tx.amount)} — ${tx.note}. Totals and charts updated.`;
    form.note.value = '';
    form.amount.value = '';
    renderTxList();
  });
  document.getElementById('txList')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-delete]');
    if (!button) return;
    if (deleteTransaction(button.dataset.delete)) renderTxList();
  });
}

function bindBudgets() {
  const form = document.getElementById('editBudget');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const limit = Number(form.limit.value);
    const category = form.category.value;
    if (!Number.isFinite(limit) || limit < 0) return;
    updateBudget(category, limit);
    render();
    const msg = document.getElementById('budgetMsg');
    if (msg) msg.textContent = `${category} limit saved at ${formatMoney(limit)}.`;
  });
  const current = budgetProgress().find((b) => b.category === form?.category.value);
  if (form && current) form.limit.value = String(current.limit);
  form?.category.addEventListener('change', () => {
    const row = budgetProgress().find((b) => b.category === form.category.value);
    if (row) form.limit.value = String(row.limit);
  });
}

function bindGoals() {
  document.querySelectorAll('.goal-add').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const amount = Number(form.amount.value);
      if (!Number.isFinite(amount) || amount <= 0) return;
      addToGoal(form.dataset.goal, amount);
      const goalName = form.dataset.goal;
      render();
      const msg = document.getElementById('goalMsg');
      if (msg) msg.textContent = `${formatMoney(amount)} added to ${goalName}.`;
    });
  });
}

function bindBills() {
  app.querySelectorAll('[data-bill]').forEach((button) => {
    button.addEventListener('click', () => {
      toggleBillPaid(button.dataset.bill);
      render();
    });
  });
}

monthSelect?.addEventListener('change', () => {
  setMonth(monthSelect.value);
  document.querySelector('.page-head h1')?.scrollIntoView();
  render();
});

window.addEventListener('hashchange', render);
render();
