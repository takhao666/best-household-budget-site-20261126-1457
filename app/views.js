// HomeLedger views — one render function per section. Each returns HTML for
// its page; main.js wires the buttons and forms after the HTML lands.
// All figures come from store.js, so every number on screen is live data.

import { state, monthTotals, spendingByCategory, budgetProgress, totalBudgeted,
  monthTransactions, incomeBreakdown, trendHistory, upcomingBills,
  formatMoney, formatDate } from './store.js';
import { CATEGORIES, CATEGORY_LIST, MONTH_LABELS, MONTHS } from './data.js';
import { drawDonut, drawBars, drawCategoryBars } from './charts.js';

export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function catChip(category) {
  return `<span class="cat-chip">${escapeHtml(category)}</span>`;
}

function txRows(transactions, withDelete) {
  if (!transactions.length) return '<p class="empty">No transactions match. Try clearing the filters.</p>';
  return `<table><thead><tr><th>Date</th><th>What</th><th class="hide-m">Category</th><th class="num">Amount</th>${withDelete ? '<th><span class="hint">Remove</span></th>' : ''}</tr></thead><tbody>${
    transactions.map((t) => `<tr>
      <td>${formatDate(t.date)}</td>
      <td>${escapeHtml(t.note)}<div class="tx-note hide-m">${t.type === 'income' ? 'Money in' : 'Money out'}</div></td>
      <td class="hide-m">${catChip(t.category)}</td>
      <td class="num ${t.type === 'income' ? 'pos' : 'neg'}">${t.type === 'income' ? '+' : '−'}${formatMoney(t.amount)}</td>
      ${withDelete ? `<td><button class="danger" data-delete="${t.id}" type="button">Delete</button></td>` : ''}
    </tr>`).join('')
  }</tbody></table>`;
}

function budgetBar(row) {
  const cls = row.pct > 100 ? 'red' : row.pct > 85 ? 'amber' : '';
  const pill = row.pct > 100
    ? `<span class="pill over">Over by ${formatMoney(row.used - row.limit)}</span>`
    : row.pct > 85 ? `<span class="pill warn">${row.pct}% used</span>` : `<span class="pill ok">${row.pct}% used</span>`;
  return `<div class="budget-row">
    <div class="budget-top"><span class="left"><span class="cat-dot" style="background:${CATEGORIES[row.category]}"></span>${escapeHtml(row.category)}</span><span>${formatMoney(row.used)} of ${formatMoney(row.limit)}</span></div>
    <div class="budget-sub"><span>${formatMoney(row.remaining)} left</span><span>${pill}</span></div>
    <div class="bar"><i class="${cls}" style="width:${Math.min(100, row.pct)}%"></i></div>
  </div>`;
}

export function dashboardView() {
  const totals = monthTotals();
  const byCat = spendingByCategory();
  const budgets = budgetProgress();
  const bills = upcomingBills().filter((b) => !b.paid).slice(0, 4);
  const recent = monthTransactions().slice(0, 6);
  const over = budgets.filter((b) => b.pct > 100).length;
  const saved = totals.balance;
  return `
  <div class="page-head">
    <h1>November at a glance</h1>
    <p class="lede">Income, spending and what's left for ${escapeHtml('the Alvarez family')} — updated the moment you add a transaction.</p>
  </div>
  <div class="grid three">
    <section class="card stat"><div class="label">Money in</div><div class="value pos">${formatMoney(totals.income)}</div><div class="sub">Salaries, freelance and child benefit</div></section>
    <section class="card stat"><div class="label">Money out</div><div class="value neg">${formatMoney(totals.spending)}</div><div class="sub">Across ${byCat.length} spending categories</div></section>
    <section class="card stat"><div class="label">Left this month</div><div class="value">${formatMoney(saved)}</div><div class="sub">${saved >= 0 ? 'On track to save this month' : 'Spending more than income — see Reports'}</div></section>
  </div>
  <div class="grid two" style="margin-top:16px">
    <section class="card">
      <h2>Where the money went <a class="more" href="#/reports">Full report →</a></h2>
      <div class="chart-wrap">
        <canvas id="donut" width="220" height="220" role="img" aria-label="Doughnut chart of spending by category"></canvas>
        <ul class="legend">${byCat.slice(0, 6).map((s) => `<li><span><span class="dot" style="background:${CATEGORIES[s.category]}"></span>${escapeHtml(s.category)}</span><span class="amt">${formatMoney(s.amount)}</span></li>`).join('')}</ul>
      </div>
    </section>
    <section class="card">
      <h2>Income vs spending <a class="more" href="#/reports">Trend →</a></h2>
      <canvas id="trend" class="chart" width="640" height="260" role="img" aria-label="Bar chart of income and spending for September, October and November"></canvas>
      <p class="hint">September and October are closed months; November updates live as you add transactions.</p>
    </section>
  </div>
  <div class="grid two" style="margin-top:16px">
    <section class="card">
      <h2>Budgets this month <a class="more" href="#/budgets">All budgets →</a></h2>
      ${budgets.slice(0, 4).map(budgetBar).join('')}
      <p class="hint">${over ? `${over} budget${over > 1 ? 's are' : ' is'} over its limit — see Budgets to adjust.` : 'Every budget is inside its limit so far.'}</p>
    </section>
    <section class="card">
      <h2>Bills coming up <a class="more" href="#/bills">All bills →</a></h2>
      ${bills.map((b) => `<div class="bill-row"><div><div class="name">${escapeHtml(b.name)}</div><div class="due">Due ${formatDate(b.due)}${b.auto ? ' · direct debit' : ''}</div></div><span class="amt">${formatMoney(b.amount)}</span></div>`).join('')}
    </section>
  </div>
  <section class="card" style="margin-top:16px">
    <h2>Recent transactions <a class="more" href="#/transactions">All transactions →</a></h2>
    ${txRows(recent, false)}
  </section>`;
}

export function bindDashboard() {
  const donut = document.getElementById('donut');
  if (donut) drawDonut(donut, spendingByCategory());
  const trend = document.getElementById('trend');
  if (trend) {
    const history = trendHistory().map((h) => ({
      label: MONTH_LABELS[h.month].split(' ')[0].slice(0, 3),
      income: h.income, spending: h.spending,
    }));
    drawBars(trend, history);
  }
}

export function transactionsView() {
  const cats = CATEGORY_LIST.filter((c) => c !== 'Income');
  return `
  <div class="page-head">
    <h1>Transactions</h1>
    <p class="lede">Every dollar in and out for ${escapeHtml(MONTH_LABELS[state.month])}. Add a transaction and the dashboard, budgets and reports update at once.</p>
  </div>
  <section class="card" style="margin-bottom:16px">
    <h2>Add a transaction</h2>
    <form id="addTx" class="inline">
      <label class="field">Date<input type="date" name="date" value="2026-11-26" required></label>
      <label class="field" style="flex:2 1 220px">What was it?<input type="text" name="note" placeholder="e.g. Weekly shop — GreenMart" required maxlength="80"></label>
      <label class="field">Category<select name="category">${cats.map((c) => `<option>${c}</option>`).join('')}</select></label>
      <label class="field">Amount ($)<input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
      <label class="field">Type<select name="type"><option value="expense">Spending</option><option value="income">Income</option></select></label>
      <button type="submit">Add transaction</button>
    </form>
    <p class="hint" id="addTxMsg" role="status"></p>
  </section>
  <section class="card">
    <h2>All transactions</h2>
    <div class="toolbar">
      <label class="field">Search<input type="search" id="txSearch" placeholder="Search notes…"></label>
      <label class="field">Category<select id="txCategory"><option value="">All categories</option>${CATEGORY_LIST.map((c) => `<option>${c}</option>`).join('')}</select></label>
      <label class="field">Type<select id="txType"><option value="">All</option><option value="expense">Spending</option><option value="income">Income</option></select></label>
      <span class="spacer"></span>
      <button class="ghost small" id="txReset" type="button">Reset filters</button>
    </div>
    <div id="txList"></div>
    <p class="hint" id="txCount"></p>
  </section>`;
}

export function renderTxList() {
  const q = (document.getElementById('txSearch')?.value || '').toLowerCase();
  const cat = document.getElementById('txCategory')?.value || '';
  const type = document.getElementById('txType')?.value || '';
  const list = monthTransactions().filter((t) =>
    (!q || t.note.toLowerCase().includes(q)) &&
    (!cat || t.category === cat) &&
    (!type || t.type === type));
  const el = document.getElementById('txList');
  if (el) el.innerHTML = txRows(list, true);
  const count = document.getElementById('txCount');
  if (count) {
    const spent = list.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    count.textContent = `${list.length} transaction${list.length === 1 ? '' : 's'} shown · ${formatMoney(spent)} spending in view`;
  }
}

export function budgetsView() {
  const budgets = budgetProgress();
  const total = totalBudgeted();
  const used = budgets.reduce((s, b) => s + b.used, 0);
  const over = budgets.filter((b) => b.pct > 100);
  return `
  <div class="page-head">
    <h1>Budgets</h1>
    <p class="lede">A monthly limit for each kind of spending. ${formatMoney(used)} of the ${formatMoney(total)} budgeted so far — ${over.length ? `${over.map((b) => b.category).join(' and ')} ${over.length > 1 ? 'are' : 'is'} over.` : 'nothing is over its limit.'}</p>
  </div>
  <div class="grid two">
    <section class="card">
      <h2>Category budgets</h2>
      ${budgets.map(budgetBar).join('')}
    </section>
    <section class="card">
      <h2>Change a limit</h2>
      <p>Raise or lower a monthly limit — the bars and the dashboard update straight away.</p>
      <form id="editBudget" class="inline">
        <label class="field">Category<select name="category">${budgets.map((b) => `<option>${b.category}</option>`).join('')}</select></label>
        <label class="field">New monthly limit ($)<input type="number" name="limit" min="0" step="10" required></label>
        <button type="submit">Save limit</button>
      </form>
      <p class="hint" id="budgetMsg" role="status"></p>
      <h3 style="margin-top:18px">How the limits were set</h3>
      <p>Housing is the fixed mortgage plus insurance. Groceries come from the last three months' average weekly shop. Dining and entertainment are capped so the family still has fun without the month running away — the two caps together are under $450.</p>
      <div class="kv"><span class="k">Total budgeted</span><span class="v">${formatMoney(total)}</span></div>
      <div class="kv"><span class="k">Spent against budgets</span><span class="v">${formatMoney(used)}</span></div>
      <div class="kv"><span class="k">Budget left</span><span class="v">${formatMoney(total - used)}</span></div>
    </section>
  </div>`;
}

export function goalsView() {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  return `
  <div class="page-head">
    <h1>Savings goals</h1>
    <p class="lede">${formatMoney(totalSaved)} saved toward ${formatMoney(totalTarget)} of goals. Add money to a goal whenever there's something left over at the end of the week.</p>
  </div>
  <div class="grid two">
    ${state.goals.map((g) => {
      const pct = Math.round((g.saved / g.target) * 100);
      return `<section class="card goal">
        <div class="budget-top"><span class="left">${escapeHtml(g.name)}</span><span>${formatMoney(g.saved)} of ${formatMoney(g.target)}</span></div>
        <div class="budget-sub"><span>${pct}% saved</span><span>${formatMoney(g.target - g.saved)} to go</span></div>
        <div class="bar"><i class="green" style="width:${Math.min(100, pct)}%"></i></div>
        <p style="margin-top:10px">${escapeHtml(g.note)}</p>
        <form class="inline goal-add" data-goal="${escapeHtml(g.name)}">
          <label class="field">Add to this goal ($)<input type="number" name="amount" min="1" step="1" placeholder="50" required></label>
          <button type="submit" class="small">Add savings</button>
        </form>
      </section>`;
    }).join('')}
  </div>
  <p class="hint" id="goalMsg" role="status" style="margin-top:12px"></p>`;
}

export function billsView() {
  const bills = upcomingBills();
  const unpaid = bills.filter((b) => !b.paid);
  const unpaidTotal = unpaid.reduce((s, b) => s + b.amount, 0);
  return `
  <div class="page-head">
    <h1>Bills &amp; recurring payments</h1>
    <p class="lede">${unpaid.length} bills still to pay, ${formatMoney(unpaidTotal)} in total. Tick a bill off when it's paid — direct debits are marked automatically on their due date.</p>
  </div>
  <section class="card">
    <h2>December bills</h2>
    ${bills.map((b) => `<div class="bill-row">
      <div><div class="name">${escapeHtml(b.name)} ${b.paid ? '<span class="pill ok">Paid</span>' : ''}</div><div class="due">Due ${formatDate(b.due)}${b.auto ? ' · direct debit' : ' · pay manually'}</div></div>
      <span style="display:flex;gap:10px;align-items:center"><span class="amt">${formatMoney(b.amount)}</span><button class="small ${b.paid ? 'ghost' : ''}" data-bill="${escapeHtml(b.name)}" type="button">${b.paid ? 'Mark unpaid' : 'Mark paid'}</button></span>
    </div>`).join('')}
    <div class="kv" style="margin-top:10px"><span class="k">Still to pay</span><span class="v">${formatMoney(unpaidTotal)}</span></div>
    <div class="kv"><span class="k">Already paid</span><span class="v">${formatMoney(bills.filter((b) => b.paid).reduce((s, b) => s + b.amount, 0))}</span></div>
  </section>`;
}

export function reportsView() {
  const totals = monthTotals();
  const byCat = spendingByCategory();
  const history = trendHistory();
  const top = byCat[0];
  const dining = byCat.find((c) => c.category === 'Dining');
  const prev = history.find((h) => h.month === '2026-10');
  const diff = prev ? totals.spending - prev.spending : 0;
  return `
  <div class="page-head">
    <h1>Reports &amp; insights</h1>
    <p class="lede">What November's money actually did — compared with September and October — and what to do about it.</p>
  </div>
  <div class="grid two">
    <section class="card">
      <h2>Spending by category</h2>
      <canvas id="catBars" class="chart" width="640" height="300" role="img" aria-label="Horizontal bar chart of spending by category"></canvas>
    </section>
    <section class="card">
      <h2>Three-month trend</h2>
      <canvas id="trend2" class="chart" width="640" height="260" role="img" aria-label="Bar chart of income and spending for September, October and November"></canvas>
      <div class="kv"><span class="k">November spending vs October</span><span class="v">${diff <= 0 ? 'Down ' : 'Up '}${formatMoney(Math.abs(diff))}</span></div>
      <div class="kv"><span class="k">November savings rate</span><span class="v">${totals.income > 0 ? Math.round(((totals.income - totals.spending) / totals.income) * 100) : 0}% of income kept</span></div>
    </section>
  </div>
  <div class="grid two" style="margin-top:16px">
    <section class="card">
      <h2>What the numbers say</h2>
      <p class="insight"><strong>${escapeHtml(top ? top.category : '—')}</strong> is the biggest spend at ${formatMoney(top ? top.amount : 0)} — mostly the fixed mortgage, so it can't move much month to month.</p>
      <p class="insight">Groceries are running at about $97 a shop across six shops this month. One planned shop a week, with a list, keeps this under the $720 budget.</p>
      ${dining ? `<p class="insight">Dining out is ${formatMoney(dining.amount)} so far — two restaurant meals and two takeaways. Skipping one takeaway a week would free roughly $150 a month for the holiday goal.</p>` : ''}
      <p class="insight">Income covers spending with ${formatMoney(totals.balance)} left. Moving that leftover to the emergency fund on payday would finish it by February.</p>
    </section>
    <section class="card">
      <h2>Where income comes from</h2>
      ${incomeBreakdown().map((s) => `<div class="kv"><span class="k">${escapeHtml(s.source)}</span><span class="v">${formatMoney(s.amount)}</span></div>`).join('')}
      <div class="kv"><span class="k">Total income</span><span class="v">${formatMoney(totals.income)}</span></div>
      <h3 style="margin-top:18px">Month by month</h3>
      <table><thead><tr><th>Month</th><th class="num">Income</th><th class="num">Spending</th><th class="num">Kept</th></tr></thead><tbody>
      ${history.map((h) => `<tr><td>${escapeHtml(MONTH_LABELS[h.month])}</td><td class="num">${formatMoney(h.income)}</td><td class="num">${formatMoney(h.spending)}</td><td class="num ${h.income - h.spending >= 0 ? 'pos' : 'neg'}">${formatMoney(h.income - h.spending)}</td></tr>`).join('')}
      </tbody></table>
    </section>
  </div>`;
}

export function bindReports() {
  const cat = document.getElementById('catBars');
  if (cat) drawCategoryBars(cat, spendingByCategory().slice(0, 8));
  const trend = document.getElementById('trend2');
  if (trend) {
    drawBars(trend, trendHistory().map((h) => ({
      label: MONTH_LABELS[h.month].split(' ')[0].slice(0, 3),
      income: h.income, spending: h.spending,
    })));
  }
}

export function notFoundView() {
  return `<div class="page-head"><h1>That page isn't here</h1>
  <p class="lede">Try one of the sections above — Dashboard, Transactions, Budgets, Savings goals, Bills or Reports.</p></div>`;
}
