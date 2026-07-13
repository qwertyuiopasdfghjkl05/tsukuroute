'use strict';
/* =========================================================================
   つくルート — data.js
   ストレージ層（localStorage / IndexedDB）・日付ユーティリティ・
   スケジュール逆算ロジック・金額計算・CSV/JSONエクスポートを担当する。
   画面描画・イベント処理は app.js が担当する。
   ========================================================================= */

/* ===================== 定数 ===================== */
const STORAGE_KEY = 'taskcanvas-v2';
const APP_NAME = 'つくルート';
const PROJECT_COLORS = ['#FF5252', '#FF9800', '#FFD600', '#4CAF50', '#00BCD4', '#2979FF', '#AB47BC'];
const LEGACY_PROJECT_COLOR_MAP = {
  '#039be5':'#00BCD4', '#7986cb':'#687EE7', '#33b679':'#4CAF50', '#8e24aa':'#AB47BC',
  '#e67c73':'#FF5252', '#f6bf26':'#FFD600', '#f4511e':'#FF9800', '#0b8043':'#4CAF50', '#616161':'#687EE7',
};
const DB_NAME = 'taskcanvas-images';
const DB_VERSION = 1;
const DB_STORE = 'images';

const DEFAULT_TEMPLATE = [
  { name: 'ラフ作成', days: 3 },
  { name: 'ラフ提出', days: 1 },
  { name: 'クライアント確認待ち', days: 4 },
  { name: '本制作', days: 5 },
  { name: '納品', days: 1 },
];
const DEFAULT_PRICE_LIST = [
  ['基本料金','胸上・腰上イラスト（5〜9頭身）',16000],['基本料金','全身イラスト（5〜9頭身）',20000],['基本料金','ミニキャラ／SD 全身',13000],['基本料金','キャラクターデザイン＋衣装1着',5000],['基本料金','キャラクターデザイン＋衣装2着',10000],['基本料金','パネル・文字のみのデザイン調整',3000],
  ['オプション','衣装作り込み（胸上）',3000],['オプション','衣装作り込み（全身・アイドル衣装など）',5000],['オプション','衣装追加（ミニキャラ）',2000],['オプション','背景（色替え・ごく簡単）',1000],['オプション','背景（標準デザイン）',3000],['オプション','背景（装飾パネル・モチーフ多め）',5000],['オプション','小物（簡単）',1000],['オプション','小物（大きめ・詳細）',2000],['オプション','ロゴデザイン',3000],['オプション','文字入れ（シンプル）',1000],
].map((item)=>({ id:uuid(), category:item[0], name:item[1], price:item[2], type:'fixed' }));
DEFAULT_PRICE_LIST.push({ id:uuid(), category:'特殊', name:'特急対応（10日以内）', type:'rate', rate:0.3, price:30 });

const EXPENSE_CATEGORIES = [
  '消耗品費', '通信費', '取材費', '資料・書籍費', '外注費', '支払手数料', '交際費', '旅費交通費', '雑費',
];

const WITHHOLDING_RATE = 0.1021;
const DEFAULT_TAX_RATE = 0.1;

const PAYMENT_STATUS_LABEL = {
  unbilled: '未請求',
  billed: '請求済み',
  paid: '入金済み',
};
const PAYMENT_STATUS_ORDER = ['unbilled', 'billed', 'paid'];

/* ===================== 汎用ユーティリティ ===================== */
function uuid() {
  if (window.crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function pad2(n) { return String(n).padStart(2, '0'); }
function pad3(n) { return String(n).padStart(3, '0'); }

/* ===================== 日付ユーティリティ（YYYY-MM-DD文字列で保持） ===================== */
function toDateStr(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseDateStr(str) {
  if (!str) return null;
  const parts = str.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function todayStr() {
  return toDateStr(new Date());
}

function addDays(dateStr, days) {
  const d = parseDateStr(dateStr);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

/** dateStrA - dateStrB を日数で返す */
function diffDays(dateStrA, dateStrB) {
  const a = parseDateStr(dateStrA);
  const b = parseDateStr(dateStrB);
  return Math.round((a - b) / 86400000);
}

function formatJP(dateStr, opts = {}) {
  if (!dateStr) return '';
  const d = parseDateStr(dateStr);
  if (!d || isNaN(d.getTime())) return '';
  let s = opts.withYear ? `${d.getFullYear()}年` : '';
  s += `${d.getMonth() + 1}月${d.getDate()}日`;
  if (opts.withWeekday) {
    const w = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
    s += `(${w})`;
  }
  return s;
}

function formatJPSlash(dateStr) {
  if (!dateStr) return '';
  const d = parseDateStr(dateStr);
  if (!d || isNaN(d.getTime())) return '';
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
}

function formatMoney(n) {
  n = Math.round(n || 0);
  return '¥' + n.toLocaleString('ja-JP');
}

function floorYen(n) { return Math.floor(n); }

function calcWithholding(amount) { return floorYen((amount || 0) * WITHHOLDING_RATE); }

/* ===================== データモデル ===================== */
function defaultData() {
  return {
    version: 2,
    projects: [],
    clients: [],
    expenses: [],
    invoices: [],
    quotes: [],
    galleryExtras: [],
    settings: {
      onboardingDone: false,
      accentColor: '#687EE7',
      calendarView: 'month',
      calendarDate: null,
      platformFeeRate: 0.22,
      lastBackupAt: null,
      priceList: DEFAULT_PRICE_LIST.map((item)=>({ ...item })),
      defaultTemplate: DEFAULT_TEMPLATE.map((t) => ({ ...t })),
      issuer: {
        name: '', address: '', tel: '', email: '', invoiceRegNo: '',
        bankName: '', bankBranch: '', bankAccountType: '普通',
        bankAccountNumber: '', bankAccountHolder: '',
      },
    },
  };
}

function leastUsedProjectColor(projects) {
  const counts = Object.fromEntries(PROJECT_COLORS.map((color) => [color, 0]));
  (projects || []).forEach((p) => { if (counts[p.color] !== undefined) counts[p.color] += 1; });
  return PROJECT_COLORS.reduce((best, color) => counts[color] < counts[best] ? color : best, PROJECT_COLORS[0]);
}

function migrateData(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid data');
  const base = defaultData();
  const merged = Object.assign({}, base, parsed || {});
  merged.settings = Object.assign({}, base.settings, (parsed && parsed.settings) || {});
  if (!/^#[0-9a-f]{6}$/i.test(merged.settings.accentColor || '')) merged.settings.accentColor = '#687EE7';
  if (!['today', 'month', 'week', 'schedule'].includes(merged.settings.calendarView)) merged.settings.calendarView = 'month';
  if (merged.settings.calendarDate && !/^\d{4}-\d{2}-\d{2}$/.test(merged.settings.calendarDate)) merged.settings.calendarDate = null;
  const platformFeeRate = Number(merged.settings.platformFeeRate);
  merged.settings.platformFeeRate = Number.isFinite(platformFeeRate) && platformFeeRate >= 0 && platformFeeRate <= 1 ? platformFeeRate : base.settings.platformFeeRate;
  if (merged.settings.lastBackupAt && !/^\d{4}-\d{2}-\d{2}$/.test(merged.settings.lastBackupAt)) merged.settings.lastBackupAt = null;
  merged.settings.issuer = Object.assign({}, base.settings.issuer, ((parsed && parsed.settings) && parsed.settings.issuer) || {});
  merged.settings.defaultTemplate = ((parsed && parsed.settings) && Array.isArray(parsed.settings.defaultTemplate))
    ? parsed.settings.defaultTemplate : base.settings.defaultTemplate;
  merged.settings.priceList = ((parsed && parsed.settings) && Array.isArray(parsed.settings.priceList)) ? parsed.settings.priceList.map((item)=>Object.assign({ id:uuid(), category:'基本料金', name:'', price:0, type:'fixed' },item)) : base.settings.priceList;
  merged.clients = Array.isArray(parsed && parsed.clients) ? parsed.clients.map((c) => Object.assign({ id: uuid(), name: '', templateOverride: null }, c)) : [];
  merged.expenses = Array.isArray(parsed && parsed.expenses) ? parsed.expenses.map((e) => Object.assign({ id: uuid(), date: '', category: '雑費', amount: 0, memo: '', receiptImageId: null, autoProjectId: null, createdAt: new Date().toISOString() }, e)) : [];
  merged.invoices = Array.isArray(parsed && parsed.invoices) ? parsed.invoices.map((iv) => Object.assign({ id: uuid(), number: '', projectId: null, issueDate: '', dueDate: '', clientName: '', honorific: '御中', subject: '', items: [], taxRate: DEFAULT_TAX_RATE, hasWithholding: false, notes: '', status: 'issued', createdAt: new Date().toISOString() }, iv, { items:Array.isArray(iv.items)?iv.items.map((item)=>Object.assign({name:'',qty:1,unit:'式',unitPrice:0},item,{unit:item.unit||'式'})):[] })) : [];
  merged.quotes = Array.isArray(parsed && parsed.quotes) ? parsed.quotes.map((q)=>Object.assign({ id:uuid(), number:'', issueDate:'', validUntil:'', clientId:'', clientName:'', honorific:'御中', subject:'', items:[], rushEnabled:false, rushRate:0.3, taxRate:0, notes:'', status:'draft', createdAt:new Date().toISOString() },q,{ items:Array.isArray(q.items)?q.items.map((item)=>Object.assign({name:'',qty:1,unit:'式',unitPrice:0},item,{unit:item.unit||'式'})):[] })) : [];
  merged.galleryExtras = Array.isArray(parsed && parsed.galleryExtras) ? parsed.galleryExtras.map((g) => Object.assign({ id: uuid(), imageId: null, title: '', clientName: '', orderedDate: g.createdAt ? toDateStr(new Date(g.createdAt)) : null, deliveredDate: null, fee: 0, createdAt: new Date().toISOString() }, g, { orderedDate: g.orderedDate || (g.createdAt ? toDateStr(new Date(g.createdAt)) : null) })) : [];
  merged.projects = [];
  (Array.isArray(parsed && parsed.projects) ? parsed.projects : []).forEach((raw) => {
    const legacyColor = LEGACY_PROJECT_COLOR_MAP[String(raw.color || '').toLowerCase()];
    const validCustomColor = /^#[0-9a-f]{6}$/i.test(raw.color || '') ? String(raw.color).toUpperCase() : null;
    const color = legacyColor || validCustomColor || leastUsedProjectColor(merged.projects);
    const steps = Array.isArray(raw.steps) ? raw.steps.map((step) => {
      const dueDate = step.dueDate || raw.dueDate || '';
      return Object.assign({
        id: uuid(), name: '', startDate: dueDate, dueDate, days: 1, done: false, doneAt: null,
      }, step, { startDate: step.startDate || dueDate });
    }) : [];
    merged.projects.push(Object.assign({
      id: uuid(), title: '', clientId: '', clientName: '', dueDate: '', fee: 0,
      hasWithholding: false, isCoconala: false, memo: '', status: 'in_progress', steps: [], color,
      paymentStatus: 'unbilled', paidDate: null, deliveredDate: null, imageIds: [],
      orderedDate: raw.createdAt ? toDateStr(new Date(raw.createdAt)) : null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }, raw, { color, orderedDate: raw.orderedDate || (raw.createdAt ? toDateStr(new Date(raw.createdAt)) : null), steps, imageIds: Array.isArray(raw.imageIds) ? raw.imageIds : [] }));
  });
  return merged;
}

let shouldPersistLoadedState = false;
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { shouldPersistLoadedState = true; return defaultData(); }
    const parsed = JSON.parse(raw);
    try {
      const migrated = migrateData(parsed);
      shouldPersistLoadedState = true;
      return migrated;
    } catch (migrationError) {
      shouldPersistLoadedState = false;
      console.error('データ移行に失敗しました。保存済みデータは変更しません。', migrationError);
      return parsed;
    }
  } catch (e) {
    shouldPersistLoadedState = false;
    console.error('データ読み込みに失敗しました。保存済みデータは変更しません。', e);
    return defaultData();
  }
}

let state = loadData();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('保存に失敗しました', e);
    if (typeof showToast === 'function') showToast('保存に失敗しました（ストレージ容量が不足している可能性があります）', 'error');
  }
}

// 正常に読み込めた場合だけ移行結果を保存する。失敗時は元の保存文字列を保持する。
if (shouldPersistLoadedState) saveState();

/* ===================== IndexedDB（画像） ===================== */
let _dbPromise = null;
function dbOpen() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) { reject(new Error('IndexedDB not supported')); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _dbPromise;
}

async function imageSave(blob) {
  const db = await dbOpen();
  const id = uuid();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return id;
}

async function imageGet(id) {
  if (!id) return null;
  const db = await dbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const req = tx.objectStore(DB_STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function imageDelete(id) {
  if (!id) return;
  const db = await dbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function imageGetAll() {
  const db=await dbOpen(); return new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readonly');const store=tx.objectStore(DB_STORE);const req=store.openCursor();const rows=[];req.onsuccess=()=>{const cursor=req.result;if(cursor){rows.push({id:cursor.key,blob:cursor.value});cursor.continue();}else resolve(rows);};req.onerror=()=>reject(req.error);});
}
async function imageReplaceAll(rows) {
  const db=await dbOpen(); return new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readwrite');const store=tx.objectStore(DB_STORE);store.clear();(rows||[]).forEach((row)=>store.put(row.blob,row.id));tx.oncomplete=()=>{_imageUrlCache.forEach((url)=>URL.revokeObjectURL(url));_imageUrlCache.clear();resolve();};tx.onerror=()=>reject(tx.error);});
}

const _imageUrlCache = new Map();
async function imageUrl(id) {
  if (!id) return null;
  if (_imageUrlCache.has(id)) return _imageUrlCache.get(id);
  try {
    const blob = await imageGet(id);
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    _imageUrlCache.set(id, url);
    return url;
  } catch (e) {
    console.error('画像の読み込みに失敗しました', e);
    return null;
  }
}

/* ===================== クライアント／工程テンプレート ===================== */
function getClientById(id) {
  return state.clients.find((c) => c.id === id) || null;
}

function getTemplateForClient(clientId) {
  const client = getClientById(clientId);
  if (client && Array.isArray(client.templateOverride) && client.templateOverride.length) {
    return client.templateOverride.map((t) => ({ ...t }));
  }
  return (state.settings.defaultTemplate || DEFAULT_TEMPLATE).map((t) => ({ ...t }));
}

/**
 * 工程テンプレートと納期から、各工程の開始日・終了日を逆算する。
 * @returns {{steps: Array, startDate: string, isTight: boolean}}
 */
function generateSteps(template, dueDateStr) {
  const list = template && template.length ? template : DEFAULT_TEMPLATE;
  const n = list.length;
  const baseDays = list.reduce((sum, item) => sum + Math.max(1, Number(item.days) || 1), 0);
  const availableDays = Math.max(0, diffDays(dueDateStr, todayStr()));
  const canFitMinimums = availableDays + 1 >= n;
  const targetDays = Math.max(n, availableDays + 1);
  const factor = targetDays / baseDays;
  const durations = list.map((item) => Math.max(1, Math.round(Math.max(1, Number(item.days) || 1) * factor)));
  let delta = targetDays - durations.reduce((sum, days) => sum + days, 0);
  let guard = Math.abs(delta) * Math.max(1, n) + n;
  for (let i = n - 2; delta !== 0 && i >= 0 && guard > 0; i = i > 0 ? i - 1 : n - 2, guard -= 1) {
    if (delta > 0) { durations[i] += 1; delta -= 1; }
    else if (durations[i] > 1) { durations[i] -= 1; delta += 1; }
    else if (durations.slice(0, -1).every((days) => days === 1)) break;
  }
  if (delta !== 0) durations[n - 1] = Math.max(1, durations[n - 1] + delta);
  const starts = new Array(n);
  const dues = new Array(n);
  let cursor = dueDateStr;
  for (let i = n - 1; i >= 0; i -= 1) {
    dues[i] = cursor;
    starts[i] = addDays(cursor, -(durations[i] - 1));
    cursor = addDays(starts[i], -1);
  }
  const steps = list.map((t, i) => ({
    id: uuid(), name: t.name, startDate: starts[i], dueDate: dues[i], days: durations[i], done: false, doneAt: null,
  }));
  const isTight = !canFitMinimums || availableDays + 1 < baseDays;
  const isRelaxed = availableDays + 1 > baseDays;
  return { steps, startDate: starts[0], isTight, isRelaxed, factor, baseDays, availableDays };
}

/* ===================== 案件の計算ヘルパー ===================== */
function projectProgress(project) {
  if (!project.steps || !project.steps.length) return 0;
  const done = project.steps.filter((s) => s.done).length;
  return Math.round((done / project.steps.length) * 100);
}

function projectNextStep(project) {
  if (!project.steps) return null;
  return project.steps.find((s) => !s.done) || null;
}

function recomputeProjectStatus(project) {
  const allDone = project.steps && project.steps.length > 0 && project.steps.every((s) => s.done);
  project.status = allDone ? 'done' : 'in_progress';
}

function toggleStep(project, stepId, done) {
  const step = project.steps.find((s) => s.id === stepId);
  if (!step) return;
  step.done = done;
  step.doneAt = done ? new Date().toISOString() : null;
  if (done && step.name.indexOf('納品') !== -1 && !project.deliveredDate) {
    project.deliveredDate = todayStr();
  }
  recomputeProjectStatus(project);
  syncAutoExpenseForProject(project);
  project.updatedAt = new Date().toISOString();
}

function platformFeeAmount(project) {
  const rate = Number(state.settings.platformFeeRate);
  return Math.floor((Number(project && project.fee) || 0) * (Number.isFinite(rate) ? rate : 0.22));
}

function syncAutoExpenseForProject(project) {
  if (!project || !Array.isArray(state.expenses)) return;
  const matches = state.expenses.filter((expense) => expense.autoProjectId === project.id);
  if (!project.isCoconala || !project.deliveredDate) {
    if (matches.length) state.expenses = state.expenses.filter((expense) => expense.autoProjectId !== project.id);
    return;
  }
  const expense = matches[0] || {
    id: uuid(), receiptImageId: null, autoProjectId: project.id, createdAt: new Date().toISOString(),
  };
  Object.assign(expense, {
    date: project.deliveredDate,
    category: '支払手数料',
    amount: platformFeeAmount(project),
    memo: `ココナラ手数料（${project.title}）`,
    autoProjectId: project.id,
    updatedAt: new Date().toISOString(),
  });
  if (!matches.length) state.expenses.push(expense);
  if (matches.length > 1) {
    const keepId = expense.id;
    state.expenses = state.expenses.filter((item) => item.autoProjectId !== project.id || item.id === keepId);
  }
}

function syncAllAutoProjectExpenses() {
  state.projects.forEach(syncAutoExpenseForProject);
  const projectIds = new Set(state.projects.map((project) => project.id));
  state.expenses = state.expenses.filter((expense) => !expense.autoProjectId || projectIds.has(expense.autoProjectId));
}

function withholdingAmount(project) {
  return project.hasWithholding ? calcWithholding(project.fee) : 0;
}

function netAmount(project) {
  return (project.fee || 0) - withholdingAmount(project);
}

function projectsDeliveredInYear(year) {
  return state.projects.filter((p) => {
    if (!p.deliveredDate) return false;
    const d = parseDateStr(p.deliveredDate);
    return d.getFullYear() === year;
  });
}

function availableYears() {
  const years = new Set([new Date().getFullYear()]);
  state.projects.forEach((p) => {
    if (p.deliveredDate) years.add(parseDateStr(p.deliveredDate).getFullYear());
    if (p.dueDate) years.add(parseDateStr(p.dueDate).getFullYear());
  });
  state.expenses.forEach((e) => { if (e.date) years.add(parseDateStr(e.date).getFullYear()); });
  state.invoices.forEach((iv) => { if (iv.issueDate) years.add(parseDateStr(iv.issueDate).getFullYear()); });
  return Array.from(years).sort((a, b) => b - a);
}

/* ===================== 請求書 ===================== */
function nextInvoiceNumber(year) {
  const yearStr = String(year);
  const nums = state.invoices
    .filter((inv) => inv.number && inv.number.startsWith(yearStr + '-'))
    .map((inv) => parseInt(inv.number.split('-')[1], 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `${yearStr}-${pad3(max + 1)}`;
}

function nextQuoteNumber(year) {
  const prefix=`Q${year}-`; const nums=state.quotes.filter((q)=>String(q.number||'').startsWith(prefix)).map((q)=>parseInt(q.number.slice(prefix.length),10)).filter((n)=>!isNaN(n));
  return `${prefix}${pad3(nums.length?Math.max(...nums)+1:1)}`;
}
function quoteSubtotal(q) { return (q.items||[]).reduce((sum,item)=>sum+(Number(item.qty)||0)*(Number(item.unitPrice)||0),0); }
function quoteRush(q) { return q.rushEnabled ? floorYen(quoteSubtotal(q)*(Number(q.rushRate)||0)) : 0; }
function quoteTax(q) { return q.taxRate ? floorYen((quoteSubtotal(q)+quoteRush(q))*q.taxRate) : 0; }
function quoteTotal(q) { return quoteSubtotal(q)+quoteRush(q)+quoteTax(q); }

function invoiceSubtotal(inv) {
  return (inv.items || []).reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
}
function invoiceTax(inv) {
  return inv.taxRate ? floorYen(invoiceSubtotal(inv) * inv.taxRate) : 0;
}
function invoiceWithholding(inv) {
  return inv.hasWithholding ? calcWithholding(invoiceSubtotal(inv)) : 0;
}
function invoiceTotal(inv) {
  return invoiceSubtotal(inv) + invoiceTax(inv) - invoiceWithholding(inv);
}

/* ===================== CSV / JSON エクスポート ===================== */
function csvEscape(v) {
  const s = v === null || v === undefined ? '' : String(v);
  if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function exportBackupJson() {
  state.settings.lastBackupAt = todayStr();
  saveState();
  const data = JSON.parse(JSON.stringify(state));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `taskcanvas-backup-${todayStr()}.json`);
}

function importBackupJson(jsonStr) {
  const parsed = JSON.parse(jsonStr);
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.projects)) {
    throw new Error('不正なバックアップファイルです');
  }
  state = migrateData(parsed);
  saveState();
}
