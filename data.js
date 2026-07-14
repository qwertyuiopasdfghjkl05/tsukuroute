'use strict';
/* =========================================================================
   つくルート — data.js
   ストレージ層（localStorage / IndexedDB）・日付ユーティリティ・
   スケジュール逆算ロジック・金額計算・CSV/JSONエクスポートを担当する。
   画面描画・イベント処理は app.js が担当する。
   ========================================================================= */

/* ===================== 定数 ===================== */
const IS_DEMO_MODE = (()=>{
  const params=new URLSearchParams(location.search||'');
  return params.get('demo')==='1'||String(location.hash||'').replace(/^#/,'')==='demo';
})();
const STORAGE_KEY = IS_DEMO_MODE ? 'taskcanvas-v2-demo' : 'taskcanvas-v2';
const CURRENT_DATA_VERSION = 3;
const APP_NAME = 'つくルート';
const PROJECT_COLORS = ['#FF5252', '#FF9800', '#FFD600', '#4CAF50', '#00BCD4', '#2979FF', '#AB47BC'];
const LEGACY_PROJECT_COLOR_MAP = {
  '#039be5':'#00BCD4', '#7986cb':'#687EE7', '#33b679':'#4CAF50', '#8e24aa':'#AB47BC',
  '#e67c73':'#FF5252', '#f6bf26':'#FFD600', '#f4511e':'#FF9800', '#0b8043':'#4CAF50', '#616161':'#687EE7',
};
const DB_NAME = IS_DEMO_MODE ? 'taskcanvas-images-demo' : 'taskcanvas-images';
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
  'ソフトウェア・サブスク', '消耗品費', '通信費', '取材費', '資料・書籍費', '外注費', '支払手数料', '交際費', '旅費交通費', '雑費',
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
    version: CURRENT_DATA_VERSION,
    projects: [],
    clients: [],
    expenses: [],
    recurringExpenses: [],
    invoices: [],
    quotes: [],
    galleryExtras: [],
    settings: {
      onboardingDone: false,
      accentColor: '#687EE7',
      appearance: 'system',
      avatarImageId: null,
      calendarView: 'month',
      calendarDate: null,
      platforms: [{ id:'platform-coconala', name:'ココナラ', feeRate:0.22 }],
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

function seedDemoContent() {
  if(!IS_DEMO_MODE)throw new Error('Demo seed is only available in demo mode');
  const demo=defaultData(),today=todayStr(),nowIso=new Date().toISOString();
  demo.settings.onboardingDone=true;
  demo.settings.demoSeeded=true;
  demo.settings.demoImagesSeeded=false;
  demo.settings.issuer={
    name:'アトリエ・ソラ　水無瀬 詩織',businessName:'アトリエ・ソラ',address:'〒150-0001 東京都渋谷区神宮前1-2-3 ソラハイツ401',
    tel:'03-1234-5678',email:'shiori.minase@example.com',invoiceRegNo:'',bankName:'そら銀行',bankBranch:'青空支店',
    bankAccountType:'普通',bankAccountNumber:'1234567',bankAccountHolder:'ミナセ シオリ',
  };
  demo.clients=[
    {id:'demo-client-pub',name:'星月出版株式会社',templateOverride:null},
    {id:'demo-client-game',name:'株式会社ルミナスゲームズ',templateOverride:null},
    {id:'demo-client-ad',name:'青葉クリエイティブ合同会社',templateOverride:null},
    {id:'demo-client-fashion',name:'Lueur Apparel',templateOverride:null},
    {id:'demo-client-vtuber',name:'天羽こはね（VTuber）',templateOverride:null},
  ];
  const clientById=new Map(demo.clients.map((client)=>[client.id,client]));
  const makeProject=(values)=>{
    const dueDate=addDays(today,values.dueOffset),steps=generateSteps(DEFAULT_TEMPLATE,dueDate).steps;
    const doneCount=values.complete?steps.length:Math.max(0,Math.min(steps.length,values.doneCount||0));
    steps.forEach((step,index)=>{step.done=index<doneCount;step.doneAt=step.done?addDays(today,-Math.max(1,doneCount-index+2))+'T09:00:00.000Z':null;});
    const deliveredDate=values.complete?addDays(today,values.deliveredOffset):null;
    const client=clientById.get(values.clientId);
    return {id:values.id,title:values.title,clientId:values.clientId,clientName:client?client.name:'',orderedDate:addDays(dueDate,values.complete?-45:-30),dueDate,
      fee:values.fee,hasWithholding:!!values.hasWithholding,platformId:values.platformId||null,isCoconala:false,memo:values.memo||'',status:values.complete?'done':'in_progress',steps,
      color:values.color,paymentStatus:values.paymentStatus||'unbilled',paidDate:values.paymentStatus==='paid'?addDays(deliveredDate,21):null,deliveredDate,imageIds:[],createdAt:nowIso,updatedAt:nowIso};
  };
  demo.projects=[
    makeProject({id:'demo-project-vtuber',title:'VTuberお披露目イラスト',clientId:'demo-client-vtuber',dueOffset:24,fee:65000,doneCount:2,color:'#AB47BC'}),
    makeProject({id:'demo-project-ebook',title:'電子書籍カバーイラスト',clientId:'demo-client-pub',dueOffset:42,fee:48000,doneCount:1,color:'#2979FF'}),
    makeProject({id:'demo-project-apparel',title:'アパレルEC商品カット',clientId:'demo-client-fashion',dueOffset:61,fee:36000,doneCount:3,color:'#FF9800',paymentStatus:'unbilled'}),
    makeProject({id:'demo-project-vi',title:'企業VIキャラクターデザイン',clientId:'demo-client-ad',dueOffset:83,fee:120000,doneCount:1,color:'#00BCD4',hasWithholding:true}),
    makeProject({id:'demo-project-game',title:'ゲーム内イベント限定カードイラスト',clientId:'demo-client-game',dueOffset:32,fee:90000,doneCount:2,color:'#4CAF50'}),
    makeProject({id:'demo-project-doujin',title:'同人誌表紙イラスト',clientId:'demo-client-vtuber',dueOffset:-28,deliveredOffset:-31,fee:35000,complete:true,color:'#FF5252',paymentStatus:'unbilled'}),
    makeProject({id:'demo-project-magazine',title:'季刊誌春号 扉絵イラスト',clientId:'demo-client-pub',dueOffset:-67,deliveredOffset:-70,fee:52000,complete:true,color:'#2979FF',paymentStatus:'billed',hasWithholding:true}),
    makeProject({id:'demo-project-campaign',title:'夏キャンペーンSNS広告イラスト',clientId:'demo-client-ad',dueOffset:-105,deliveredOffset:-108,fee:78000,complete:true,color:'#FFD600',paymentStatus:'paid',hasWithholding:true}),
    makeProject({id:'demo-project-costume',title:'VTuber新衣装立ち絵デザイン',clientId:'demo-client-vtuber',dueOffset:-145,deliveredOffset:-148,fee:85000,complete:true,color:'#AB47BC',paymentStatus:'paid'}),
  ];
  const expenseRows=[
    ['ソフトウェア・サブスク',980,'CLIP STUDIO PAINT EX',-6],['ソフトウェア・サブスク',6480,'Adobe Creative Cloud',-13],
    ['資料・書籍費',3960,'衣装デザイン資料集',-19],['消耗品費',2840,'スケッチブック・替芯',-27],['旅費交通費',1240,'打ち合わせ交通費',-35],
    ['通信費',3200,'制作資料用クラウドストレージ',-48],['資料・書籍費',2420,'背景パース資料',-62],['取材費',1850,'企画展 入場料',-79],
    ['消耗品費',5680,'ペンタブレット替え芯・保護シート',-108],['交際費',3600,'クライアント打ち合わせ',-137],
  ];
  demo.expenses=expenseRows.map((row,index)=>({id:`demo-expense-${index+1}`,date:addDays(today,row[3]),category:row[0],amount:row[1],memo:row[2],receiptImageId:null,autoProjectId:null,autoRecurringId:null,createdAt:nowIso}));
  demo.recurringExpenses=[
    {id:'demo-recurring-clip',name:'CLIP STUDIO PAINT EX',category:'ソフトウェア・サブスク',amount:980,frequency:'monthly',monthOfYear:1,dayOfMonth:5,memo:'制作ソフト',startMonth:today.slice(0,7),active:true},
    {id:'demo-recurring-adobe',name:'Adobe Creative Cloud',category:'ソフトウェア・サブスク',amount:6480,frequency:'monthly',monthOfYear:1,dayOfMonth:12,memo:'デザイン制作ソフト',startMonth:today.slice(0,7),active:true},
    {id:'demo-recurring-cloud',name:'クラウドストレージ',category:'通信費',amount:1300,frequency:'monthly',monthOfYear:1,dayOfMonth:20,memo:'納品データ保管',startMonth:today.slice(0,7),active:true},
  ];
  const issuerSnapshot=JSON.parse(JSON.stringify(demo.settings.issuer));
  demo.invoices=[
    {id:'demo-invoice-magazine',number:`${today.slice(0,4)}-001`,projectId:'demo-project-magazine',issueDate:addDays(today,-66),dueDate:addDays(today,-36),clientName:'星月出版株式会社',honorific:'御中',subject:'季刊誌春号 扉絵イラスト制作費',items:[{name:'扉絵イラスト制作',qty:1,unit:'式',unitPrice:52000}],taxRate:.1,hasWithholding:true,notes:'お振込み手数料はご負担ください。',status:'issued',issuerSnapshot,createdAt:nowIso},
    {id:'demo-invoice-campaign',number:`${today.slice(0,4)}-002`,projectId:'demo-project-campaign',issueDate:addDays(today,-104),dueDate:addDays(today,-74),clientName:'青葉クリエイティブ合同会社',honorific:'御中',subject:'夏キャンペーンSNS広告イラスト制作費',items:[{name:'広告イラスト制作',qty:3,unit:'点',unitPrice:26000}],taxRate:.1,hasWithholding:true,notes:'ご入金ありがとうございました。',status:'paid',issuerSnapshot,createdAt:nowIso},
    {id:'demo-invoice-costume',number:`${today.slice(0,4)}-003`,projectId:'demo-project-costume',issueDate:addDays(today,-144),dueDate:addDays(today,-114),clientName:'天羽こはね（VTuber）',honorific:'様',subject:'新衣装立ち絵デザイン制作費',items:[{name:'新衣装立ち絵デザイン',qty:1,unit:'式',unitPrice:85000}],taxRate:0,hasWithholding:false,notes:'ご入金ありがとうございました。',status:'paid',issuerSnapshot,createdAt:nowIso},
  ];
  demo.quotes=[
    {id:'demo-quote-vi',number:`Q${today.slice(0,4)}-001`,issueDate:addDays(today,-8),validUntil:addDays(today,22),clientId:'demo-client-ad',clientName:'青葉クリエイティブ合同会社',honorific:'御中',subject:'企業VIキャラクターデザイン',items:[{name:'キャラクターデザイン',qty:1,unit:'式',unitPrice:80000},{name:'表情差分',qty:4,unit:'点',unitPrice:5000}],rushEnabled:false,rushRate:.3,taxRate:.1,notes:'修正はラフ段階で2回まで含みます。',status:'sent',issuerSnapshot,createdAt:nowIso},
    {id:'demo-quote-stream',number:`Q${today.slice(0,4)}-002`,issueDate:today,validUntil:addDays(today,14),clientId:'demo-client-vtuber',clientName:'天羽こはね（VTuber）',honorific:'様',subject:'配信用キービジュアル',items:[{name:'全身イラスト',qty:1,unit:'式',unitPrice:45000},{name:'背景デザイン',qty:1,unit:'式',unitPrice:15000}],rushEnabled:false,rushRate:.3,taxRate:0,notes:'商用利用料を含みます。',status:'draft',issuerSnapshot:null,createdAt:nowIso},
  ];
  return demo;
}

function leastUsedProjectColor(projects) {
  const counts = Object.fromEntries(PROJECT_COLORS.map((color) => [color, 0]));
  (projects || []).forEach((p) => { if (counts[p.color] !== undefined) counts[p.color] += 1; });
  return PROJECT_COLORS.reduce((best, color) => counts[color] < counts[best] ? color : best, PROJECT_COLORS[0]);
}

function deliveryLast(items) {
  const list=Array.isArray(items)?items.slice():[];
  return list.filter((item)=>!String(item&&item.name||'').includes('納品')).concat(list.filter((item)=>String(item&&item.name||'').includes('納品')));
}

const pendingHeaderImageDeletes = new Set();
function migrateData(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid data');
  const base = defaultData();
  const merged = Object.assign({}, base, parsed || {});

  // --- settings ---
  merged.settings = Object.assign({}, base.settings, (parsed && parsed.settings) || {});
  if(merged.settings.headerImageId)pendingHeaderImageDeletes.add(merged.settings.headerImageId);
  if(Array.isArray(merged.settings.headerImages))merged.settings.headerImages.filter(Boolean).forEach((id)=>pendingHeaderImageDeletes.add(id));
  delete merged.settings.headerImageId;
  delete merged.settings.headerImages;
  merged.settings.avatarImageId=merged.settings.avatarImageId||null;
  if (!/^#[0-9a-f]{6}$/i.test(merged.settings.accentColor || '')) merged.settings.accentColor = '#687EE7';
  if (!['light', 'dark', 'system'].includes(merged.settings.appearance)) merged.settings.appearance = 'system';
  if (!['today', 'month', 'week', 'schedule'].includes(merged.settings.calendarView)) merged.settings.calendarView = 'month';
  if (merged.settings.calendarDate && !/^\d{4}-\d{2}-\d{2}$/.test(merged.settings.calendarDate)) merged.settings.calendarDate = null;
  const platformFeeRate = Number(merged.settings.platformFeeRate);
  merged.settings.platformFeeRate = Number.isFinite(platformFeeRate) && platformFeeRate >= 0 && platformFeeRate <= 1 ? platformFeeRate : 0.22;
  const savedPlatforms=parsed&&parsed.settings&&parsed.settings.platforms;
  merged.settings.platforms=Array.isArray(savedPlatforms)&&savedPlatforms.length?savedPlatforms.map((platform)=>Object.assign({id:uuid(),name:'',feeRate:0},platform,{feeRate:Math.max(0,Math.min(1,Number(platform.feeRate)||0))})):[{id:'platform-coconala',name:'ココナラ',feeRate:merged.settings.platformFeeRate}];
  const coconalaPlatform=merged.settings.platforms.find((platform)=>platform.name==='ココナラ')||merged.settings.platforms[0];
  if (merged.settings.lastBackupAt && !/^\d{4}-\d{2}-\d{2}$/.test(merged.settings.lastBackupAt)) merged.settings.lastBackupAt = null;
  merged.settings.issuer = Object.assign({}, base.settings.issuer, ((parsed && parsed.settings) && parsed.settings.issuer) || {});
  merged.settings.defaultTemplate = deliveryLast(((parsed && parsed.settings) && Array.isArray(parsed.settings.defaultTemplate))
    ? parsed.settings.defaultTemplate : base.settings.defaultTemplate);
  merged.settings.priceList = ((parsed && parsed.settings) && Array.isArray(parsed.settings.priceList)) ? parsed.settings.priceList.map((item)=>Object.assign({ id:uuid(), category:'基本料金', name:'', price:0, type:'fixed' },item)) : base.settings.priceList;

  // --- clients ---
  merged.clients = Array.isArray(parsed && parsed.clients) ? parsed.clients.map((c) => {const client=Object.assign({ id:uuid(),name:'',templateOverride:null },c);if(Array.isArray(client.templateOverride))client.templateOverride=deliveryLast(client.templateOverride);return client;}) : [];

  // --- expenses / recurring ---
  merged.expenses = Array.isArray(parsed && parsed.expenses) ? parsed.expenses.map((e) => Object.assign({ id: uuid(), date: '', category: '雑費', amount: 0, memo: '', receiptImageId: null, autoProjectId: null, autoRecurringId: null, platformFeeRateSnapshot:null, platformNameSnapshot:'', platformIdSnapshot:null, createdAt: new Date().toISOString() }, e)) : [];
  merged.recurringExpenses = Array.isArray(parsed && parsed.recurringExpenses) ? parsed.recurringExpenses.map((item) => Object.assign({ id:uuid(), name:'', category:'ソフトウェア・サブスク', amount:0, frequency:'monthly', monthOfYear:1, dayOfMonth:1, memo:'', startMonth:todayStr().slice(0,7), active:true }, item)) : [];

  // --- invoices / quotes ---
  const issuerAtMigration = JSON.parse(JSON.stringify(merged.settings.issuer));
  merged.invoices = Array.isArray(parsed && parsed.invoices) ? parsed.invoices.map((iv) => {
    const invoice = Object.assign({ id: uuid(), number: '', projectId: null, issueDate: '', dueDate: '', clientName: '', honorific: '御中', subject: '', items: [], taxRate: DEFAULT_TAX_RATE, hasWithholding: false, notes: '', status: 'issued', issuerSnapshot:null, createdAt: new Date().toISOString() }, iv, { items:Array.isArray(iv.items)?iv.items.map((item)=>Object.assign({name:'',qty:1,unit:'式',unitPrice:0},item,{unit:item.unit||'式'})):[] });
    if (!invoice.issuerSnapshot && ['issued','paid'].includes(invoice.status)) invoice.issuerSnapshot = JSON.parse(JSON.stringify(issuerAtMigration));
    return invoice;
  }) : [];
  merged.quotes = Array.isArray(parsed && parsed.quotes) ? parsed.quotes.map((q) => {
    const quote = Object.assign({ id:uuid(), number:'', issueDate:'', validUntil:'', clientId:'', clientName:'', honorific:'御中', subject:'', items:[], rushEnabled:false, rushRate:0.3, taxRate:0, notes:'', status:'draft', issuerSnapshot:null, createdAt:new Date().toISOString() },q,{ items:Array.isArray(q.items)?q.items.map((item)=>Object.assign({name:'',qty:1,unit:'式',unitPrice:0},item,{unit:item.unit||'式'})):[] });
    if (!quote.issuerSnapshot && ['sent','accepted'].includes(quote.status)) quote.issuerSnapshot = JSON.parse(JSON.stringify(issuerAtMigration));
    return quote;
  }) : [];

  // --- gallery ---
  merged.galleryExtras = Array.isArray(parsed && parsed.galleryExtras) ? parsed.galleryExtras.map((g) => Object.assign({ id: uuid(), imageId: null, title: '', clientName: '', orderedDate: g.createdAt ? toDateStr(new Date(g.createdAt)) : null, deliveredDate: null, fee: 0, createdAt: new Date().toISOString() }, g, { orderedDate: g.orderedDate || (g.createdAt ? toDateStr(new Date(g.createdAt)) : null) })) : [];

  // --- projects (color/steps/platform) ---
  merged.projects = [];
  (Array.isArray(parsed && parsed.projects) ? parsed.projects : []).forEach((raw) => {
    const legacyColor = LEGACY_PROJECT_COLOR_MAP[String(raw.color || '').toLowerCase()];
    const validCustomColor = /^#[0-9a-f]{6}$/i.test(raw.color || '') ? String(raw.color).toUpperCase() : null;
    const color = legacyColor || validCustomColor || leastUsedProjectColor(merged.projects);
    const steps = deliveryLast(Array.isArray(raw.steps) ? raw.steps.map((step) => {
      const dueDate = step.dueDate || raw.dueDate || '';
      return Object.assign({
        id: uuid(), name: '', startDate: dueDate, dueDate, days: 1, done: false, doneAt: null,
      }, step, { startDate: step.startDate || dueDate });
    }) : []);
    merged.projects.push(Object.assign({
      id: uuid(), title: '', clientId: '', clientName: '', dueDate: '', fee: 0,
      hasWithholding: false, isCoconala: false, platformId:null, memo: '', status: 'in_progress', steps: [], color,
      paymentStatus: 'unbilled', paidDate: null, deliveredDate: null, imageIds: [],
      orderedDate: raw.createdAt ? toDateStr(new Date(raw.createdAt)) : null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }, raw, { platformId:raw.platformId||((raw.isCoconala||raw.hasCoconala||raw.coconala)?coconalaPlatform.id:null),color, orderedDate: raw.orderedDate || (raw.createdAt ? toDateStr(new Date(raw.createdAt)) : null), steps, imageIds: Array.isArray(raw.imageIds) ? raw.imageIds : [] }));
  });

  // --- platform fee snapshots (v3) ---
  const projectById=new Map(merged.projects.map((project)=>[project.id,project]));
  merged.expenses.forEach((expense)=>{
    if(!expense.autoProjectId)return;
    const project=projectById.get(expense.autoProjectId)||null;
    const memoName=String(expense.memo||'').match(/^(.*?)手数料(?:（|$)/);
    const memoPlatform=(merged.settings.platforms||[]).find((platform)=>platform.name&&String(expense.memo||'').includes(platform.name));
    const projectPlatform=project&&(merged.settings.platforms||[]).find((platform)=>platform.id===project.platformId);
    const identifiedPlatform=projectPlatform||memoPlatform||null;
    const savedRate=Number(expense.platformFeeRateSnapshot);
    if(expense.platformFeeRateSnapshot===null||expense.platformFeeRateSnapshot===undefined||!Number.isFinite(savedRate)||savedRate<0||savedRate>1){
      const projectFee=Number(project&&project.fee)||0;
      const recordedAmount=Number(expense.amount)||0;
      const fallbackRate=Number(identifiedPlatform&&identifiedPlatform.feeRate);
      expense.platformFeeRateSnapshot=projectFee>0?recordedAmount/projectFee:(identifiedPlatform&&Number.isFinite(fallbackRate)?fallbackRate:0.22);
    }
    if(!expense.platformNameSnapshot)expense.platformNameSnapshot=(memoName&&memoName[1])||(identifiedPlatform&&identifiedPlatform.name)||'';
    if(!expense.platformIdSnapshot)expense.platformIdSnapshot=(project&&project.platformId)||(identifiedPlatform&&identifiedPlatform.id)||null;
  });

  merged.version = CURRENT_DATA_VERSION;
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

let state;
if(IS_DEMO_MODE&&localStorage.getItem(STORAGE_KEY)===null){shouldPersistLoadedState=true;state=seedDemoContent();}
else state=loadData();

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

async function cleanupObsoleteHeaderImages() {
  const ids=Array.from(pendingHeaderImageDeletes);if(!ids.length)return;
  await Promise.all(ids.map((id)=>imageDelete(id)));
  ids.forEach((id)=>pendingHeaderImageDeletes.delete(id));
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
  const platform=(state.settings.platforms||[]).find((item)=>item.id===(project&&project.platformId));
  const rate = Number(platform&&platform.feeRate);
  return Math.floor((Number(project && project.fee) || 0) * (Number.isFinite(rate) ? rate : 0));
}

function syncAutoExpenseForProject(project) {
  if (!project || !Array.isArray(state.expenses)) return;
  let matches = state.expenses.filter((expense) => expense.autoProjectId === project.id);
  const platform=(state.settings.platforms||[]).find((item)=>item.id===project.platformId);
  if (!platform || !project.deliveredDate) {
    if (matches.length) state.expenses = state.expenses.filter((expense) => expense.autoProjectId !== project.id);
    return;
  }
  if(matches.some((expense)=>expense.platformIdSnapshot!==project.platformId)){
    state.expenses=state.expenses.filter((expense)=>expense.autoProjectId!==project.id);
    matches=[];
  }
  const isNew=!matches.length;
  const expense = matches[0] || {
    id: uuid(), receiptImageId: null, autoProjectId: project.id,
    platformFeeRateSnapshot:Number(platform.feeRate)||0,
    platformNameSnapshot:platform.name||'', platformIdSnapshot:platform.id,
    createdAt: new Date().toISOString(),
  };
  const snapshotRate=Number(expense.platformFeeRateSnapshot);
  const rate=Number.isFinite(snapshotRate)?snapshotRate:0;
  const platformName=expense.platformNameSnapshot||'';
  Object.assign(expense, {
    date: project.deliveredDate,
    category: '支払手数料',
    amount: Math.floor((Number(project.fee)||0)*rate),
    memo: `${platformName}手数料（${project.title}）`,
    autoProjectId: project.id,
    updatedAt: new Date().toISOString(),
  });
  if (isNew) state.expenses.push(expense);
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

function generateRecurringExpensesThroughCurrentMonth() {
  if (!Array.isArray(state.recurringExpenses) || !Array.isArray(state.expenses)) return 0;
  const currentMonth = todayStr().slice(0, 7);
  let createdCount = 0;
  state.recurringExpenses.forEach((recurring) => {
    if (!recurring.active || !/^\d{4}-\d{2}$/.test(recurring.startMonth || '') || recurring.startMonth > currentMonth) return;
    const startParts = recurring.startMonth.split('-').map(Number);
    const cursor = new Date(startParts[0], startParts[1] - 1, 1);
    const currentParts = currentMonth.split('-').map(Number);
    const end = new Date(currentParts[0], currentParts[1] - 1, 1);
    while (cursor <= end) {
      const month = `${cursor.getFullYear()}-${pad2(cursor.getMonth() + 1)}`;
      const isYearly = recurring.frequency === 'yearly';
      const scheduledMonth = Math.max(1, Math.min(12, Number(recurring.monthOfYear) || 1));
      if (isYearly && cursor.getMonth() + 1 !== scheduledMonth) { cursor.setMonth(cursor.getMonth() + 1); continue; }
      const exists = state.expenses.some((expense) => expense.autoRecurringId === recurring.id && String(expense.date || '').slice(0, 7) === month);
      if (!exists) {
        const lastDay = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
        const day = Math.min(lastDay, Math.max(1, Number(recurring.dayOfMonth) || 1));
        state.expenses.push({
          id:uuid(), date:`${month}-${pad2(day)}`, category:recurring.category || '雑費', amount:Number(recurring.amount) || 0,
          memo:`${recurring.memo || recurring.name || ''}（定期）`, receiptImageId:null, autoProjectId:null,
          autoRecurringId:recurring.id, createdAt:new Date().toISOString(),
        });
        createdCount += 1;
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
  });
  return createdCount;
}

function copyCurrentIssuer() { return JSON.parse(JSON.stringify(state.settings.issuer || {})); }
function ensureQuoteIssuerSnapshot(quote) {
  if (quote && !quote.issuerSnapshot && ['sent','accepted'].includes(quote.status)) quote.issuerSnapshot = copyCurrentIssuer();
}
function ensureInvoiceIssuerSnapshot(invoice) {
  if (invoice && !invoice.issuerSnapshot && ['issued','paid'].includes(invoice.status)) invoice.issuerSnapshot = copyCurrentIssuer();
}
function issuerForDocument(documentData) { return (documentData && documentData.issuerSnapshot) || state.settings.issuer; }

function setProjectPaymentStatus(project,status) {
  if(!project)return;
  const previousStatus=project.paymentStatus;
  project.paymentStatus=status;
  const linkedInvoices=state.invoices.filter((invoice)=>invoice.projectId===project.id);
  if(status==='paid'){
    if(!project.paidDate)project.paidDate=todayStr();
    linkedInvoices.forEach((invoice)=>{invoice.status='paid';ensureInvoiceIssuerSnapshot(invoice);});
  }else if(previousStatus==='paid'){
    linkedInvoices.forEach((invoice)=>{invoice.status='issued';});
  }
}

function deleteInvoiceRecord(invoiceId) {
  const invoice=state.invoices.find((item)=>item.id===invoiceId);
  if(!invoice)return false;
  const linkedInvoices=invoice.projectId?state.invoices.filter((item)=>item.projectId===invoice.projectId):[];
  const project=invoice.projectId?state.projects.find((item)=>item.id===invoice.projectId):null;
  const shouldResetProject=!!project&&linkedInvoices.length===1&&(
    (project.paymentStatus==='billed'&&invoice.status==='issued')||
    (project.paymentStatus==='paid'&&invoice.status==='paid')
  );
  state.invoices=state.invoices.filter((item)=>item.id!==invoiceId);
  if(shouldResetProject)project.paymentStatus='unbilled';
  return true;
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
