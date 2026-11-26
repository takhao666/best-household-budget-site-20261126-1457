// HomeLedger charts — small canvas drawings, no library. Two shapes only:
// a doughnut for spending by category and grouped bars for the monthly
// trend. Everything is drawn with the 2D context, so the site stays light.

import { CATEGORIES } from './data.js';

function setupCanvas(canvas, width, height) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);
  return ctx;
}

export function drawDonut(canvas, slices, size = 220) {
  const ctx = setupCanvas(canvas, size, size);
  const total = slices.reduce((sum, s) => sum + s.amount, 0);
  if (total <= 0) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No spending yet', size / 2, size / 2);
    return;
  }
  const cx = size / 2;
  const cy = size / 2;
  const outer = size / 2 - 6;
  const inner = outer * 0.62;
  let angle = -Math.PI / 2;
  for (const slice of slices) {
    const sweep = (slice.amount / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.fillStyle = CATEGORIES[slice.category] || '#6b7280';
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, angle, angle + sweep);
    ctx.closePath();
    ctx.fill();
    angle += sweep;
  }
  ctx.beginPath();
  ctx.fillStyle = '#ffffff';
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`$${Math.round(total).toLocaleString('en-US')}`, cx, cy - 2);
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px sans-serif';
  ctx.fillText('spent this month', cx, cy + 16);
}

export function drawBars(canvas, groups, width = 640, height = 260) {
  const ctx = setupCanvas(canvas, width, height);
  const padL = 52;
  const padB = 30;
  const padT = 14;
  const plotW = width - padL - 16;
  const plotH = height - padT - padB;
  const max = Math.max(1, ...groups.flatMap((g) => [g.income, g.spending]));
  const niceMax = Math.ceil(max / 1000) * 1000;
  ctx.strokeStyle = '#e5ddd0';
  ctx.fillStyle = '#6b7280';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const value = (niceMax * i) / 4;
    const y = padT + plotH - (plotH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(width - 16, y);
    ctx.stroke();
    ctx.fillText(`$${value.toLocaleString('en-US')}`, padL - 8, y + 4);
  }
  const groupW = plotW / groups.length;
  const barW = Math.min(34, groupW / 3);
  groups.forEach((g, gi) => {
    const x0 = padL + gi * groupW + (groupW - barW * 2 - 8) / 2;
    const incomeH = (g.income / niceMax) * plotH;
    const spendH = (g.spending / niceMax) * plotH;
    ctx.fillStyle = '#0f766e';
    ctx.fillRect(x0, padT + plotH - incomeH, barW, incomeH);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x0 + barW + 8, padT + plotH - spendH, barW, spendH);
    ctx.fillStyle = '#1f2937';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(g.label, padL + gi * groupW + groupW / 2, height - 10);
  });
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f766e';
  ctx.fillRect(padL, 0, 10, 10);
  ctx.fillStyle = '#1f2937';
  ctx.fillText('Income', padL + 14, 10);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(padL + 78, 0, 10, 10);
  ctx.fillStyle = '#1f2937';
  ctx.fillText('Spending', padL + 92, 10);
}

export function drawCategoryBars(canvas, rows, width = 640, height = 300) {
  const ctx = setupCanvas(canvas, width, height);
  const max = Math.max(1, ...rows.map((r) => r.amount));
  const rowH = height / rows.length;
  const barH = 18;
  ctx.font = '12px sans-serif';
  rows.forEach((row, i) => {
    const y = i * rowH + (rowH - barH) / 2;
    const w = Math.max(2, ((width - 220) * row.amount) / max);
    ctx.fillStyle = CATEGORIES[row.category] || '#6b7280';
    ctx.fillRect(150, y, w, barH);
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'right';
    ctx.fillText(row.category, 142, y + 14);
    ctx.textAlign = 'left';
    ctx.fillText(`$${row.amount.toFixed(2)}`, 150 + w + 8, y + 14);
  });
}
