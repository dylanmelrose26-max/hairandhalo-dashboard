// ─── TYPES ───────────────────────────────────────────────────────────────

export interface StaffMember {
  id: number;
  name: string;
  role: string;
  commission_type: 'qualified' | 'apprentice' | 'none';
  is_active: boolean;
  weekly_net_wage: number;
  weekly_gross_wage: number;
  threshold_3_2x: number;
  threshold_3_5x: number;
  threshold_4x: number;
}

export interface MonthlyFinancials {
  month: string;
  total_revenue: number;
  gross_profit: number;
  net_profit: number;
  paris_drawings: number;
  service_revenue: number;
  retail_revenue: number;
  extension_revenue: number;
  treatment_revenue: number;
  notes: string | null;
}

export interface StaffPerformance {
  id?: number;
  month: string;
  staff_id: number;
  total_sales: number;
  retail_sales: number;
  treatment_count: number;
  treatment_value: number;
  total_clients: number;
  new_clients: number;
  returning_clients: number;
  notes: string | null;
}

export interface WeeklySales {
  id?: number;
  staff_id: number;
  week_number: number;
  month: string;
  sales_excl_extensions: number;
}

export interface WeeklyScorecard {
  id?: number;
  month: string;
  week_number: number;
  week_label: string;
  total_sales: number;
  retail: number;
  treatments: number;
  clients: number;
  new_clients: number;
  retention: number;
  avg_spend: number;
}

// ─── QUARTERLY TARGETS ──────────────────────────────────────────────────

export const TARGETS: Record<string, {
  sales: number; retail: number; treatments: number; avgSpend: number;
  retention: number; clients: number; newClients: number;
}> = {
  Q1: { sales: 15000, retail: 1250, treatments: 18, avgSpend: 210, retention: 65, clients: 72, newClients: 20 },
  Q2: { sales: 16500, retail: 1500, treatments: 22, avgSpend: 210, retention: 65, clients: 75, newClients: 20 },
  Q3: { sales: 16500, retail: 1500, treatments: 22, avgSpend: 210, retention: 65, clients: 75, newClients: 20 },
  Q4: { sales: 16500, retail: 1500, treatments: 22, avgSpend: 210, retention: 65, clients: 75, newClients: 20 },
};

export function getQuarter(month: string): string {
  const m = parseInt(month.split('-')[1]);
  if (m <= 3) return 'Q1';
  if (m <= 6) return 'Q2';
  if (m <= 9) return 'Q3';
  return 'Q4';
}

// ─── STAFF COLORS ────────────────────────────────────────────────────────

export const STAFF_COLORS: Record<number, string> = {
  1: '#6366f1', // Chelsea
  2: '#e8b4b8', // Paris
  3: '#ec4899', // Teagan
  4: '#10b981', // Leila
  5: '#f59e0b', // Lily
  6: '#8b5cf6', // Demi
};

// ─── COMMISSION CALCULATIONS ─────────────────────────────────────────────

export interface WeeklyCommResult {
  wk: number;
  sales: number;
  mult: number;
  pct: number;
  label: string;
  over: number;
  bonus: number;
}

export function calcWeeklyWageBonus(sales: number, weeklyNet: number): WeeklyCommResult {
  const mult = weeklyNet > 0 ? sales / weeklyNet : 0;
  const t32 = weeklyNet * 3.2;
  let pct = 0, label = 'Below 3.2×';
  if (mult >= 4) { pct = 25; label = '4×+'; }
  else if (mult >= 3.5) { pct = 20; label = '3.5–4×'; }
  else if (mult >= 3.2) { pct = 10; label = '3.2–3.5×'; }
  const over = sales > t32 ? sales - t32 : 0;
  return { wk: 0, sales, mult, pct, label, over, bonus: over * (pct / 100) };
}

export function calcRetailBonus(total: number, type: string) {
  if (type === 'none') return { tier: '-', pct: 0, bonus: 0 };
  const t = type === 'apprentice' ? [500, 650, 900] : [600, 750, 1000];
  if (total >= t[2]) return { tier: `$${t[2]}+`, pct: 15, bonus: total * 0.15 };
  if (total >= t[1]) return { tier: `$${t[1]}-$${t[2]}`, pct: 10, bonus: total * 0.10 };
  if (total >= t[0]) return { tier: `$${t[0]}-$${t[1]}`, pct: 5, bonus: total * 0.05 };
  return { tier: `< $${t[0]}`, pct: 0, bonus: 0 };
}

export function calcTreatmentBonus(count: number, type: string) {
  if (type === 'none') return { tgt: 0, hit: false, bonus: 0 };
  const tgt = type === 'apprentice' ? 12 : 14;
  return { tgt, hit: count >= tgt, bonus: 0 };
}

// ─── FORMAT HELPERS ──────────────────────────────────────────────────────

export const fmt = (v: number) => '$' + Math.round(v).toLocaleString('en-AU');
export const fmtPct = (v: number) => v.toFixed(1) + '%';
export const fmtMth = (m: string) => {
  const [y, mo] = m.split('-');
  return new Date(+y, +mo - 1).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });
};
