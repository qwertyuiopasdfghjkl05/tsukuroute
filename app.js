'use strict';
/* =========================================================================
   つくルート — app.js
   画面描画・イベント処理を担当する（データ層は data.js）。
   ========================================================================= */

/* ===================== DOMヘルパー ===================== */
function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

/* ===================== アイコン(インラインSVG) ===================== */
const ICONS = {
  close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 4 2 20h20L12 4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 10v4.2M12 17.2h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  check: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 13l5 5 9-11" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  image: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="4.5" width="17" height="15" rx="2" stroke="currentColor" stroke-width="1.4"/><circle cx="8.5" cy="9.5" r="1.5" stroke="currentColor" stroke-width="1.3"/><path d="m4 16.5 4.5-4.5 3 3 4-4.5 5 6" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  folder: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M4 8a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  listCheck: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m4 7 1.8 1.8L9 5.5M12 7h8M4 13h5M12 13h8M4 19h5M12 19h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bell: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  galleryImage: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="4.5" width="17" height="15" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="8.5" cy="9.5" r="1.5" stroke="currentColor" stroke-width="1.5"/><path d="m4.5 17 5-5 3.2 3.2 2.6-2.7 4.2 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  sectionFolder: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  gauge: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5.6 18a8 8 0 1 1 12.8 0M12 12l4-3M7.5 15h.01M16.5 15h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  invoice: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-4 2-4-2-3 2V5a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 8h6M9 12h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  wallet: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H18v16H6.5A2.5 2.5 0 0 1 4 17.5v-11Z" stroke="currentColor" stroke-width="1.7"/><path d="M15 10h5v5h-5a2.5 2.5 0 0 1 0-5Z" stroke="currentColor" stroke-width="1.7"/><path d="M4 7h14" stroke="currentColor" stroke-width="1.7"/></svg>',
  chart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 20V11h4v9M10 20V5h4v15M15 20v-7h4v7M3 20h18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  receipt: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
};

function arrowLeftSvg() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
function arrowRightSvg() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }

/* ===================== トースト ===================== */
function showToast(message, type) {
  const root = $('#toastRoot');
  if (!root) return;
  const t = document.createElement('div');
  t.className = 'toast' + (type === 'error' ? ' is-error' : '');
  t.textContent = message;
  root.appendChild(t);
  requestAnimationFrame(() => t.classList.add('is-visible'));
  setTimeout(() => {
    t.classList.remove('is-visible');
    setTimeout(() => t.remove(), 250);
  }, 2400);
}
async function copyTextToClipboard(text) { if(navigator.clipboard&&navigator.clipboard.writeText){try{await navigator.clipboard.writeText(text);return true;}catch(error){}}const textarea=document.createElement('textarea');textarea.value=text;textarea.setAttribute('readonly','');textarea.style.cssText='position:fixed;left:-9999px;top:0';document.body.appendChild(textarea);textarea.select();let copied=false;try{copied=document.execCommand('copy');}catch(error){}textarea.remove();return copied; }

/* ===================== モーダル ===================== */
function openModal(innerHtml, opts) {
  opts = opts || {};
  const root = document.getElementById('modalRoot');
  if (!opts.stack) closeModal(true);
  else {
    const current = document.getElementById('activeModalOverlay');
    if (current) {
      current.removeAttribute('id');
      current.classList.add('modal-overlay--background');
      current.setAttribute('aria-hidden', 'true');
    }
  }
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'activeModalOverlay';
  const modalClass = 'modal' + (opts.wide ? ' modal--wide' : '') + (opts.narrow ? ' modal--narrow' : '');
  overlay.innerHTML = `<div class="${modalClass}">${innerHtml}</div>`;
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) closeModal(); });
  $all('button', overlay).forEach((button) => { if (!button.hasAttribute('type')) button.type = 'button'; });
  root.appendChild(overlay);
  document.addEventListener('keydown', modalEscHandler);
  return overlay;
}
function modalEscHandler(e) { if (e.key === 'Escape') closeModal(); }
function closeModal(all) {
  const root = document.getElementById('modalRoot');
  if (!root) return;
  if (all) root.innerHTML = '';
  else {
    const current = document.getElementById('activeModalOverlay');
    if (current) current.remove();
    const previous = root.lastElementChild;
    if (previous) {
      previous.id = 'activeModalOverlay';
      previous.classList.remove('modal-overlay--background');
      previous.removeAttribute('aria-hidden');
      previous.dispatchEvent(new Event('modalrestored'));
    }
  }
  if (!root.children.length) {document.removeEventListener('keydown', modalEscHandler);$all('.tabbar__btn').forEach((b)=>b.classList.toggle('is-active',b.dataset.tab===currentTab));}
}

function closeMoreSheet() { const root=$('#sheetRoot'); if(root) root.innerHTML=''; }
function currentDetailProjectId(overlayEl) {
  return overlayEl ? overlayEl.dataset.projectId : null;
}

/* ===================== 画像の遅延読み込み ===================== */
async function hydrateImages(root) {
  const imgs = $all('img[data-image-id]', root);
  await Promise.all(imgs.map(async (img) => {
    const id = img.dataset.imageId;
    if (!id) return;
    const url = await imageUrl(id);
    if (url) img.src = url;
  }));
}

async function openImageLightbox(imageId) {
  const overlay = openModal(`
    <div class="modal__header"><h2 class="modal__title">画像</h2><button type="button" class="icon-btn" data-action="close-modal">${ICONS.close}</button></div>
    <div class="modal__body"><img id="lightbox-img" style="width:100%; border-radius:8px; display:block;" alt=""></div>
  `, { wide: true });
  const url = await imageUrl(imageId);
  const img = $('#lightbox-img', overlay);
  if (img) img.src = url || '';
}

/* ===================== 共通UIパーツ ===================== */
function emptyStateHtml(icon, title, desc, action, actionLabel) {
  return `
  <div class="empty-state">
    <div class="empty-state__icon">${ICONS[icon] || ''}</div>
    <h3 style="margin-bottom:8px;">${escapeHtml(title)}</h3>
    <p>${escapeHtml(desc)}</p>
    ${action ? `<button type="button" class="text-link" data-action="${action}">${escapeHtml(actionLabel)}</button>` : ''}
  </div>`;
}

function compactEmptyHtml(icon, message, action, actionLabel) {
  return `<div class="empty-state empty-state--compact"><div class="empty-state__icon">${ICONS[icon]||ICONS.folder}</div><p>${escapeHtml(message)}</p>${action?`<button type="button" class="text-link" data-action="${escapeHtml(action)}">${escapeHtml(actionLabel)}</button>`:''}</div>`;
}

function warningBoxHtml(text) {
  return `<div class="warning-box">${ICONS.warning}<div>${escapeHtml(text)}</div></div>`;
}

function colorSwatchesHtml(selected, inputName) {
  const custom = !PROJECT_COLORS.includes(String(selected).toUpperCase());
  return `<div class="color-swatches" role="radiogroup" aria-label="案件カラー">${PROJECT_COLORS.map((color) => `<button type="button" class="color-swatch ${String(selected).toUpperCase() === color ? 'is-selected' : ''}" style="background:${color};color:${colorText(color)}" data-color="${color}" data-color-input="${inputName}" role="radio" aria-checked="${String(selected).toUpperCase() === color}">${String(selected).toUpperCase() === color ? ICONS.check : ''}</button>`).join('')}${custom ? `<button type="button" class="color-swatch is-selected" style="background:${escapeHtml(selected)};color:${colorText(selected)}" data-color="${escapeHtml(selected)}" role="radio" aria-checked="true">${ICONS.check}</button>` : ''}<button type="button" class="color-swatch-add" data-color-picker="${escapeHtml(inputName)}" aria-label="カスタムカラーを選ぶ">＋</button></div>`;
}

function normalizeHex(value) { const hex = String(value || '').trim(); return /^#[0-9a-f]{6}$/i.test(hex) ? hex.toUpperCase() : null; }
function hexRgb(hex) { const safe=normalizeHex(hex)||'#687EE7'; const v = parseInt(safe.slice(1), 16); return { r:(v>>16)&255, g:(v>>8)&255, b:v&255 }; }
function rgbHex(r,g,b) { return '#' + [r,g,b].map((v) => Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('').toUpperCase(); }
function colorText(hex) { const c = hexRgb(normalizeHex(hex) || '#687EE7'); return (c.r*299 + c.g*587 + c.b*114) / 1000 > 155 ? '#182842' : '#FFFFFF'; }
function rgbToHsl(hex) {
  const c=hexRgb(hex); let r=c.r/255,g=c.g/255,b=c.b/255; const max=Math.max(r,g,b),min=Math.min(r,g,b); let h=0,s=0; const l=(max+min)/2;
  if(max!==min){const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}h*=60;} return {h:Math.round(h),s:Math.round(s*100),l:Math.round(l*100)};
}
function hslToHex(h,s,l) { s/=100;l/=100;const k=(n)=>(n+h/30)%12;const a=s*Math.min(l,1-l);const f=(n)=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return rgbHex(f(0)*255,f(8)*255,f(4)*255); }
function darkenHex(hex, amount) { const hsl=rgbToHsl(hex); return hslToHex(hsl.h,hsl.s,Math.max(0,hsl.l-amount)); }
function accentGradient(hex) { const hsl=rgbToHsl(hex);return `linear-gradient(135deg,${hex} 0%,${hslToHex((hsl.h+18)%360,hsl.s,Math.min(100,hsl.l+8))} 100%)`; }
function mixHex(base, tint, ratio) { const a=hexRgb(base),b=hexRgb(tint),r=Math.max(0,Math.min(1,ratio));return rgbHex(a.r+(b.r-a.r)*r,a.g+(b.g-a.g)*r,a.b+(b.b-a.b)*r); }
function projectGradient(color) { const hex=normalizeHex(color)||'#687EE7';return accentGradient(hex); }
function relativeLuminance(hex) {
  const rgb=hexRgb(hex); const channel=(value)=>{const v=value/255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};
  return .2126*channel(rgb.r)+.7152*channel(rgb.g)+.0722*channel(rgb.b);
}
function applyAccentTheme(color) {
  const hex = normalizeHex(color) || '#687EE7'; const root=document.documentElement;
  root.style.setProperty('--accent',hex); root.style.setProperty('--accent-hover',darkenHex(hex,9));
  const sourceHsl=rgbToHsl(hex),isDark=root.dataset.theme==='dark';
  const gradStart=isDark?hslToHex(sourceHsl.h,Math.min(100,sourceHsl.s*.9),Math.max(0,sourceHsl.l-5)):hex;
  const gradHsl=rgbToHsl(gradStart),gradEnd=hslToHex((gradHsl.h+18)%360,gradHsl.s,Math.min(100,gradHsl.l+8));
  const rgb=hexRgb(gradStart),shiftedRgb=hexRgb(gradEnd),softFactor=isDark?.8:1;
  const tileStart=mixHex(gradStart,'#FFFFFF',.08),tileEnd=mixHex(gradEnd,'#FFFFFF',.18);
  root.style.setProperty('--accent-soft',`rgba(${rgb.r},${rgb.g},${rgb.b},${isDark?.12:.15})`);
  root.style.setProperty('--accent-grad',`linear-gradient(135deg,${gradStart} 0%,${gradEnd} 100%)`);
  root.style.setProperty('--accent-grad-soft',`linear-gradient(135deg,rgba(${rgb.r},${rgb.g},${rgb.b},${(.20*softFactor).toFixed(3)}) 0%,rgba(${shiftedRgb.r},${shiftedRgb.g},${shiftedRgb.b},${(.12*softFactor).toFixed(3)}) 100%)`);
  root.style.setProperty('--accent-tile-grad',`linear-gradient(135deg,${tileStart} 0%,${tileEnd} 100%)`);
  const tileInk=isDark?(colorText(tileStart)==='#182842'||colorText(tileEnd)==='#182842'?'#182842':'#FFFFFF'):'#FFFFFF';
  root.style.setProperty('--accent-tile-ink',tileInk);
  root.style.setProperty('--bg',isDark?'#14171D':mixHex('#FAF9F6',hex,.04));
  const gradientText=isDark?(colorText(gradStart)==='#182842'||colorText(gradEnd)==='#182842'?'#182842':'#FFFFFF'):'#FFFFFF';
  root.style.setProperty('--accent-contrast',gradientText);
  root.style.setProperty('--greeting-text',gradientText);
  root.style.setProperty('--nav-accent',root.dataset.theme==='dark'?hex:(colorText(hex)==='#182842'?'#182842':hex));
}
const appearanceMedia=window.matchMedia('(prefers-color-scheme: dark)');
function resolvedAppearance() { const value=state.settings.appearance||'system'; return value==='system'?(appearanceMedia.matches?'dark':'light'):value; }
function applyAppearance() { const theme=resolvedAppearance();document.documentElement.dataset.theme=theme;const meta=$('#themeColorMeta');if(meta)meta.content=theme==='dark'?'#14171D':'#FAF9F6';applyAccentTheme(state.settings.accentColor); }
function openColorPicker(anchor, initialColor, onChange) {
  const old=$('#activeColorPicker'); if(old) old.remove(); let current=normalizeHex(initialColor)||'#687EE7'; const hsl=rgbToHsl(current);
  const pop=document.createElement('div'); pop.id='activeColorPicker'; pop.className='color-picker-popover';
  pop.innerHTML=`<div class="color-picker-head"><strong>カスタム</strong><button type="button" class="icon-btn" id="cp-close">${ICONS.close}</button></div><div class="color-picker-main"><input type="color" id="cp-native" value="${current}"><div><label for="cp-hex">HEXコード</label><input class="input" id="cp-hex" value="${current}" maxlength="7"><span class="field__error" id="cp-error"></span></div></div><label>色相 <output id="cp-h-out">${hsl.h}</output><input type="range" id="cp-h" min="0" max="360" value="${hsl.h}"></label><label>彩度 <output id="cp-s-out">${hsl.s}</output><input type="range" id="cp-s" min="0" max="100" value="${hsl.s}"></label><label>明度 <output id="cp-l-out">${hsl.l}</output><input type="range" id="cp-l" min="0" max="100" value="${hsl.l}"></label>`;
  document.body.appendChild(pop); const rect=anchor.getBoundingClientRect(); pop.style.left=`${Math.max(12,Math.min(window.innerWidth-300,rect.left))}px`; pop.style.top=`${Math.max(12,Math.min(window.innerHeight-390,rect.bottom+8))}px`;
  const sync=(hex, source)=>{current=normalizeHex(hex)||current;const values=rgbToHsl(current);if(source!=='native')$('#cp-native',pop).value=current.toLowerCase();if(source!=='hex')$('#cp-hex',pop).value=current;['h','s','l'].forEach((key)=>{if(source!==key)$(`#cp-${key}`,pop).value=values[key];$(`#cp-${key}-out`,pop).textContent=values[key];});$('#cp-error',pop).textContent='';onChange(current);};
  $('#cp-native',pop).addEventListener('input',(e)=>sync(e.target.value,'native'));
  $('#cp-hex',pop).addEventListener('change',(e)=>{const valid=normalizeHex(e.target.value);if(valid)sync(valid,'hex');else $('#cp-error',pop).textContent='例: #687EE7 の形式で入力してください';});
  ['h','s','l'].forEach((key)=>$('#cp-'+key,pop).addEventListener('input',()=>{const hex=hslToHex(Number($('#cp-h',pop).value),Number($('#cp-s',pop).value),Number($('#cp-l',pop).value));sync(hex,key);}));
  $('#cp-close',pop).addEventListener('click',()=>pop.remove());
}

function statusBadgeHtml(p) {
  if (p.status === 'done') return `<span class="badge badge--done">完了</span>`;
  const next = projectNextStep(p);
  if (next && diffDays(next.dueDate, todayStr()) < 0) return `<span class="badge badge--overdue">超過</span>`;
  return `<span class="badge badge--progress">進行中</span>`;
}

function stepStartDate(step) { return step.startDate || step.dueDate || ''; }
function stepIncludesDate(step, dateStr) {
  const start = stepStartDate(step);
  return !!(start && step.dueDate && diffDays(dateStr, start) >= 0 && diffDays(step.dueDate, dateStr) >= 0);
}
function stepPeriodLabel(step, withYear) {
  const start = stepStartDate(step); const end = step.dueDate || start;
  if (!start) return '';
  if (start === end) return formatJP(end, { withYear:!!withYear });
  return `${formatJP(start, { withYear:!!withYear })}〜${formatJP(end, { withYear:!!withYear })}`;
}
function formatShortDate(dateStr) {
  const date=parseDateStr(dateStr); return date && !isNaN(date.getTime()) ? `${date.getMonth()+1}/${date.getDate()}` : '—';
}
function projectKeyDates(project) {
  const steps=project.steps||[];
  const rough=steps.find((step)=>String(step.name||'').includes('ラフ提出')) || steps.find((step)=>String(step.name||'').includes('ラフ'));
  const delivery=steps.find((step)=>String(step.name||'').includes('納品'));
  return { rough, delivery, deliveryDate:(delivery&&delivery.dueDate)||project.dueDate||'' };
}
function sortProjectStepsByStartDate(project) {
  project.steps = (project.steps || []).map((step,index)=>({step,index})).sort((a,b)=>{
    const aDate=stepStartDate(a.step)||'9999-12-31'; const bDate=stepStartDate(b.step)||'9999-12-31';
    return aDate.localeCompare(bDate) || String(a.step.dueDate||'').localeCompare(String(b.step.dueDate||'')) || a.index-b.index;
  }).map((item)=>item.step);
}
function projectStepsForDate(dateStr, includeOverdue) {
  const items = [];
  state.projects.forEach((project) => (project.steps || []).forEach((step) => {
    if (step.done || !step.dueDate) return;
    const overdue = diffDays(step.dueDate, dateStr) < 0;
    if (stepIncludesDate(step, dateStr) || (includeOverdue && overdue)) items.push({ project, step, overdue });
  }));
  return items.sort((a, b) => Number(b.overdue) - Number(a.overdue) || diffDays(a.step.dueDate, b.step.dueDate));
}

/* ===================== タブ切替 ===================== */
let currentTab = 'home';
let projectsStatusFilter = 'in_progress';
let projectsSectionMode = 'projects';

function parseMoneyInput(value) { const normalized=String(value == null ? '' : value).replace(/,/g,'').trim(); return normalized === '' ? NaN : Number(normalized); }
function formatMoneyInput(value) { const number=parseMoneyInput(value); return Number.isFinite(number) ? Math.max(0,Math.trunc(number)).toLocaleString('ja-JP') : ''; }
function wireMoneyInputs(root) { $all('[data-money-input]',root||document).forEach((input)=>{ input.value=formatMoneyInput(input.value); input.addEventListener('input',()=>{const start=input.selectionStart;const oldLength=input.value.length;input.value=formatMoneyInput(input.value.replace(/[^0-9]/g,''));const next=Math.max(0,(start||0)+input.value.length-oldLength);try{input.setSelectionRange(next,next);}catch(e){}}); }); }
function canShareFiles() { try { return !!(navigator.share && navigator.canShare && navigator.canShare({files:[new File(['x'],'x.jpg',{type:'image/jpeg'})]})); } catch(e) { return false; } }
function outputJpgCanvas(canvas, filename, share) { if(share){canvas.toBlob(async(blob)=>{if(!blob)return;const file=new File([blob],filename,{type:'image/jpeg'});try{await navigator.share({files:[file],title:filename.replace(/\.jpg$/,'')});}catch(error){if(error&&error.name!=='AbortError')showToast('共有できませんでした','error');}},'image/jpeg',.92);return;}const a=document.createElement('a');a.href=canvas.toDataURL('image/jpeg',.92);a.download=filename;document.body.appendChild(a);a.click();a.remove(); }
const dragHandleSvg='<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12M4 10h12M4 14h12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
function wirePointerReorder(container,rowSelector,onDrop){
  if(!container)return;
  $all('.drag-handle',container).forEach((handle)=>handle.addEventListener('pointerdown',(event)=>{
    if(event.button!==undefined&&event.button!==0)return;
    const row=handle.closest(rowSelector);if(!row||row.dataset.deliveryStep==='true')return;
    event.preventDefault();
    const rows=$all(rowSelector,container),fromIndex=rows.indexOf(row),rects=rows.map((item)=>item.getBoundingClientRect());if(fromIndex<0)return;
    const deliveryIndex=rows.findIndex((item)=>item.dataset.deliveryStep==='true');
    const maxIndex=deliveryIndex<0?rows.length-1:deliveryIndex-1;
    const pointerId=event.pointerId,startY=event.clientY;
    let latestY=startY,targetIndex=Math.min(fromIndex,maxIndex),frame=0,finished=false;
    row.classList.add('is-dragging');document.body.classList.add('is-reordering');
    const paint=()=>{frame=0;let next=rects.slice(0,maxIndex+1).findIndex((rect)=>latestY<rect.top+rect.height/2);if(next<0)next=maxIndex;targetIndex=Math.max(0,Math.min(maxIndex,next));const preview=rows.slice();preview.splice(fromIndex,1);preview.splice(targetIndex,0,row);rows.forEach((item,index)=>{item.style.transform=item===row?`translateY(${latestY-startY}px)`:`translateY(${rects[preview.indexOf(item)].top-rects[index].top}px)`;});};
    const move=(e)=>{if(e.pointerId!==pointerId)return;e.preventDefault();latestY=e.clientY;if(!frame)frame=requestAnimationFrame(paint);};
    const finish=(e)=>{if(finished||(e.pointerId!==undefined&&e.pointerId!==pointerId))return;finished=true;document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',finish);document.removeEventListener('pointercancel',finish);if(frame){cancelAnimationFrame(frame);frame=0;paint();}const finalRows=rows.slice();finalRows.splice(fromIndex,1);finalRows.splice(targetIndex,0,row);finalRows.forEach((item)=>{item.style.transform='';container.appendChild(item);});row.classList.remove('is-dragging');document.body.classList.remove('is-reordering');onDrop(finalRows);};
    document.addEventListener('pointermove',move,{passive:false});document.addEventListener('pointerup',finish);document.addEventListener('pointercancel',finish);
  }));
}
let homeMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

function switchTab(tab) {
  if(tab==='gallery'){tab='projects';projectsSectionMode='gallery';}
  currentTab = tab;
  $all('.view').forEach((v) => v.classList.remove('is-active'));
  const view = $(`#view-${tab}`);
  if (view) view.classList.add('is-active');
  $all('.tab-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.tab === tab));
  $all('.tabbar__btn').forEach((b) => b.classList.toggle('is-active', b.dataset.tab === tab));
  const settingsButton=$('#openSettingsBtn');
  if(settingsButton)settingsButton.classList.toggle('is-active',tab==='settings');
  renderCurrentTab();
  const main=$('.app-main');if(main)main.scrollTo(0,0);window.scrollTo(0, 0);
}

function renderCurrentTab() {
  if (currentTab === 'home') renderHome();
  else if (currentTab === 'calendar') renderCalendar();
  else if (currentTab === 'projects') renderProjectsTab();
  else if (currentTab === 'money') renderMoneyTab();
  else if (currentTab === 'settings') renderSettingsView();
}

/* ===================== カレンダー ===================== */
const CALENDAR_WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function calendarEvents() {
  const events = [];
  state.projects.forEach((project) => {
    (project.steps || []).forEach((step) => {
      if (!step.dueDate) return;
      const start = stepStartDate(step) || step.dueDate;
      const span = Math.max(0, diffDays(step.dueDate, start));
      for (let day = 0; day <= span; day += 1) {
        events.push({ date:addDays(start, day), project, step, type:'step', title:step.name, done:!!step.done });
      }
    });
    if (project.dueDate) events.push({ date:project.dueDate, project, step:null, type:'deadline', title:`◆納品 ${project.title}`, done:project.status === 'done' });
  });
  return events.sort((a, b) => diffDays(a.date, b.date) || (a.type === 'deadline' ? 1 : -1));
}

function calendarEventsOn(dateStr, events) { return events.filter((event) => event.date === dateStr); }

function calendarChipHtml(event) {
  const overdue = event.type === 'step' && !event.done && diffDays(event.step.dueDate, todayStr()) < 0;
  const period = event.step ? `（${stepPeriodLabel(event.step)}）` : '';
  return `<button type="button" class="calendar-chip ${event.done ? 'is-done' : ''} ${event.type === 'deadline' ? 'is-deadline' : ''} ${overdue ? 'is-overdue' : ''}" style="--event-color:${event.project.color};--event-text:${colorText(event.project.color)}" data-action="open-project" data-project-id="${escapeHtml(event.project.id)}" title="${escapeHtml(event.title)} ${escapeHtml(period)}・${escapeHtml(event.project.title)}"><span>${escapeHtml(event.title)}</span></button>`;
}

function calendarDateNumberHtml(dateStr, className) {
  const date = parseDateStr(dateStr);
  return `<span class="${className || 'calendar-date-number'} ${dateStr === todayStr() ? 'is-today' : ''}">${date.getDate()}</span>`;
}

function calendarPeriodTitle(view, anchor) {
  const date = parseDateStr(anchor);
  if (view === 'today') return formatJP(anchor, { withYear:true, withWeekday:true });
  if (view === 'week') {
    const start = addDays(anchor, -date.getDay()); const end = addDays(start, 6);
    const startDate = parseDateStr(start); const endDate = parseDateStr(end);
    return startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() === endDate.getMonth()
      ? `${startDate.getFullYear()}年${startDate.getMonth()+1}月`
      : `${formatJP(start, { withYear:true })} – ${formatJP(end, { withYear:true })}`;
  }
  if (view === 'schedule') return `${formatJP(anchor, { withYear:true })}から30日間`;
  return `${date.getFullYear()}年${date.getMonth()+1}月`;
}

function calendarToolbarHtml(view, anchor, mobile) {
  const anchorDate=parseDateStr(anchor); const title=mobile&&view!=='today'?`${anchorDate.getFullYear()}年${anchorDate.getMonth()+1}月`:calendarPeriodTitle(view,anchor);
  const views=[['today','リスト'],['month','月'],['week','週'],['schedule','予定']];
  const navigation=view==='today'?'':`<button type="button" class="icon-btn" data-action="calendar-prev" aria-label="前の期間">${arrowLeftSvg()}</button><button type="button" class="icon-btn" data-action="calendar-next" aria-label="次の期間">${arrowRightSvg()}</button>`;
  return `<div class="calendar-toolbar"><div class="calendar-toolbar__left"><button type="button" class="btn calendar-today-btn" data-action="calendar-today">今日</button>${navigation}<h1 class="calendar-period-title">${escapeHtml(title)}</h1></div><select class="select calendar-view-select" id="calendarViewSelect" aria-label="カレンダー表示">${views.map(([value,label])=>`<option value="${value}" ${view===value?'selected':''}>${label}</option>`).join('')}</select><div class="calendar-mobile-segment" role="group" aria-label="カレンダー表示">${views.map(([value,label])=>`<button type="button" class="${view===value?'is-active':''}" data-action="calendar-set-view" data-view="${value}">${label}</button>`).join('')}</div></div>`;
}

function calendarMobileMarks(events) {
  const limit=window.innerHeight<720?2:3; const shown=events.slice(0,limit); const extra=events.length-shown.length;
  return `<div class="calendar-mobile-marks">${shown.map((event)=>`<span class="calendar-mini-chip" style="--event-color:${event.project.color};--event-text:${colorText(event.project.color)}" title="${escapeHtml(event.title)}">${escapeHtml(event.type==='deadline'?'納品':event.title)}</span>`).join('')}${extra>0?`<small>+${extra}</small>`:''}</div>`;
}

function calendarMonthHtml(anchor, events, mobile) {
  const date = parseDateStr(anchor);
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const gridStart = toDateStr(new Date(date.getFullYear(), date.getMonth(), 1 - first.getDay()));
  const cells = Array.from({ length:42 }, (_, i) => addDays(gridStart, i));
  return `<div class="calendar-month"><div class="calendar-weekdays">${CALENDAR_WEEKDAYS.map((day) => `<div>${day}</div>`).join('')}</div><div class="calendar-month-grid">${cells.map((dateStr) => {
    const cellEvents = calendarEventsOn(dateStr, events); const visible = cellEvents.slice(0, 3); const hidden = cellEvents.length - visible.length;
    const outside = parseDateStr(dateStr).getMonth() !== date.getMonth();
    return `<div class="calendar-month-cell ${outside ? 'is-outside' : ''}" data-date="${dateStr}" ${mobile?`data-action="calendar-open-day"`:''}><div class="calendar-month-cell__date">${calendarDateNumberHtml(dateStr)}</div>${mobile?calendarMobileMarks(cellEvents):`<div class="calendar-cell-events">${visible.map(calendarChipHtml).join('')}${hidden > 0 ? `<button type="button" class="calendar-more" data-action="calendar-show-day" data-date="${dateStr}">他${hidden}件</button>` : ''}</div>`}</div>`;
  }).join('')}</div></div>`;
}

function calendarWeekHtml(anchor, events, mobile) {
  const date = parseDateStr(anchor); const start = addDays(anchor, -date.getDay());
  const days = Array.from({ length:7 }, (_, i) => addDays(start, i));
  return `<div class="calendar-week"><div class="calendar-week-grid">${days.map((dateStr, i) => {const dayEvents=calendarEventsOn(dateStr,events);return `<div class="calendar-week-column" ${mobile?`data-action="calendar-open-day" data-date="${dateStr}"`:''}><div class="calendar-week-header"><span>${CALENDAR_WEEKDAYS[i]}${mobile?'':'曜日'}</span>${calendarDateNumberHtml(dateStr, 'calendar-week-number')}</div><div class="calendar-week-events">${mobile?calendarMobileMarks(dayEvents):(dayEvents.map(calendarChipHtml).join('') || '<span class="calendar-no-events">予定なし</span>')}</div></div>`;}).join('')}</div></div>`;
}

function calendarTodayHtml(anchor) {
  const items = projectStepsForDate(anchor, true);
  if (!items.length) return compactEmptyHtml('listCheck','今日の予定はありません');
  return `<div class="calendar-today-list">${items.map(({ project, step, overdue }) => `
    <div class="calendar-today-item ${overdue ? 'is-overdue' : ''}" style="--task-color:${project.color}" data-action="open-project" data-project-id="${escapeHtml(project.id)}">
      <button type="button" class="checkbox" data-action="toggle-calendar-step" data-project-id="${escapeHtml(project.id)}" data-step-id="${escapeHtml(step.id)}" aria-label="完了にする"></button>
      <span class="project-color-dot" style="background:${project.color}"></span>
      <button type="button" class="calendar-today-link" data-action="open-project" data-project-id="${escapeHtml(project.id)}">
        <strong>${escapeHtml(step.name)}</strong><span>${escapeHtml(project.title)}</span><small>${escapeHtml(stepPeriodLabel(step))}</small>
      </button>
      ${overdue ? `<em>${Math.abs(diffDays(step.dueDate, anchor))}日超過</em>` : ''}
    </div>`).join('')}</div>`;
}

function calendarScheduleHtml(anchor, events) {
  const end = addDays(anchor, 29);
  const overdue = events.filter((event) => event.type === 'step' && !event.done && event.date === event.step.dueDate && diffDays(event.step.dueDate, anchor) < 0);
  const ranged = events.filter((event) => diffDays(event.date, anchor) >= 0 && diffDays(event.date, end) <= 0);
  const visible = [...overdue, ...ranged];
  const dates = Array.from(new Set(visible.map((event) => event.date))).sort((a, b) => diffDays(a, b));
  if (!dates.length) return compactEmptyHtml('listCheck','この期間にタスクはありません。');
  return `<div class="calendar-schedule">${dates.map((dateStr) => {
    const date = parseDateStr(dateStr); const items = calendarEventsOn(dateStr, visible);
    return `<section class="calendar-schedule-day"><div class="calendar-schedule-date">${calendarDateNumberHtml(dateStr, 'calendar-schedule-number')}<span>${date.getMonth()+1}月 ${CALENDAR_WEEKDAYS[date.getDay()]}曜日</span></div><div class="calendar-schedule-tasks">${items.map((event) => {
      const overdueClass = event.type === 'step' && !event.done && diffDays(event.date, todayStr()) < 0 ? ' is-overdue' : '';
      const progress=projectProgress(event.project); const dueDiff=event.project.dueDate?diffDays(event.project.dueDate,todayStr()):null; const dueLabel=dueDiff===null?'':dueDiff<0?`${Math.abs(dueDiff)}日超過`:dueDiff===0?'納期は今日':`納期まで残り${dueDiff}日`;
      const periodLabel=event.step?stepPeriodLabel(event.step):'';
      return `<div class="calendar-schedule-task${overdueClass}" style="--task-color:${event.project.color};--task-grad:${projectGradient(event.project.color)}">${event.type === 'step' ? `<button type="button" class="checkbox ${event.done ? 'is-checked' : ''}" data-action="toggle-calendar-step" data-project-id="${escapeHtml(event.project.id)}" data-step-id="${escapeHtml(event.step.id)}" aria-label="${event.done ? '未完了に戻す' : '完了にする'}">${event.done ? ICONS.check : ''}</button>` : '<span class="calendar-deadline-mark">◆</span>'}<span class="project-color-dot" style="background:${event.project.color}"></span><button type="button" class="calendar-task-link" data-action="open-project" data-project-id="${escapeHtml(event.project.id)}"><span class="calendar-task-copy"><strong>${escapeHtml(event.type === 'deadline' ? '納品' : event.title)}</strong><span>${escapeHtml(event.project.title)}${periodLabel?` ・ ${escapeHtml(periodLabel)}`:''}</span></span><span class="calendar-task-progress"><span><i style="width:${progress}%"></i></span><small>${progress}%</small></span><em class="calendar-task-due ${dueDiff!==null&&dueDiff<0?'is-overdue':''}">${escapeHtml(dueLabel)}</em></button></div>`;
    }).join('')}</div></section>`;
  }).join('')}</div>`;
}

function renderCalendar() {
  const container = $('#calendarContent'); if (!container) return;
  const view = state.settings.calendarView || 'month';
  const anchor = view === 'today' ? todayStr() : (state.settings.calendarDate || todayStr());
  const events = calendarEvents();
  const mobile=window.matchMedia('(max-width: 767px)').matches;
  let content = view === 'today' ? calendarTodayHtml(anchor) : view === 'week' ? calendarWeekHtml(anchor, events, mobile) : view === 'schedule' ? calendarScheduleHtml(anchor, events) : calendarMonthHtml(anchor, events, mobile);
  container.innerHTML = `${calendarToolbarHtml(view, anchor, mobile)}${content}`;
  $('#calendarViewSelect', container).addEventListener('change', (e) => { state.settings.calendarView = e.target.value; saveState(); renderCalendar(); });
}

function openCalendarDaySheet(dateStr) {
  const root=$('#sheetRoot'); if(!root)return; const events=calendarEventsOn(dateStr,calendarEvents());
  root.innerHTML=`<div class="sheet-overlay calendar-day-overlay" data-action="close-more-sheet"><section class="calendar-day-sheet" role="dialog" aria-label="${escapeHtml(formatJP(dateStr,{withYear:true,withWeekday:true}))}の予定"><div class="sheet-handle"></div><div class="calendar-day-sheet__head"><div><span>${escapeHtml(formatJP(dateStr,{withYear:true,withWeekday:true}))}</span><h2>この日の予定</h2></div><button type="button" class="icon-btn" data-action="close-calendar-day">${ICONS.close}</button></div><div class="calendar-day-sheet__list">${events.length?events.map((event)=>`<div class="calendar-day-item">${event.type==='step'?`<button type="button" class="checkbox ${event.done?'is-checked':''}" data-action="toggle-calendar-sheet-step" data-project-id="${escapeHtml(event.project.id)}" data-step-id="${escapeHtml(event.step.id)}" data-date="${dateStr}" aria-label="${event.done?'未完了に戻す':'完了にする'}">${event.done?ICONS.check:''}</button>`:'<span class="calendar-deadline-mark">◆</span>'}<span class="project-color-dot" style="background:${event.project.color}"></span><button type="button" data-action="calendar-sheet-project" data-project-id="${escapeHtml(event.project.id)}"><strong>${escapeHtml(event.type==='deadline'?'納品':event.title)}</strong><span>${escapeHtml(event.project.title)}${event.step?` ・ ${escapeHtml(stepPeriodLabel(event.step))}`:''}</span></button></div>`).join(''):compactEmptyHtml('listCheck','予定はありません。')}</div></section></div>`;
}

/* ===================== ホーム ===================== */
function renderHome() {
  const container = $('#homeContent');
  if (!container) return;
  const projects = state.projects;
  const todayS = todayStr();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 11 ? 'おはようございます' : hour < 18 ? 'こんにちは' : 'こんばんは';
  const mondayOffset = (now.getDay() + 6) % 7;
  const weekStart = addDays(todayS, -mondayOffset);
  const weekEnd = addDays(weekStart, 6);
  const weekSteps = [];
  const todayItems = [];
  projects.forEach((p) => {
    (p.steps || []).forEach((s) => {
      const startsBeforeWeekEnds = stepStartDate(s) && diffDays(stepStartDate(s), weekEnd) <= 0;
      const endsAfterWeekStarts = s.dueDate && diffDays(s.dueDate, weekStart) >= 0;
      if (startsBeforeWeekEnds && endsAfterWeekStarts) weekSteps.push({ project:p, step:s });
      if (s.done) return;
      const d = diffDays(s.dueDate, todayS);
      if (stepIncludesDate(s, todayS) || d < 0) todayItems.push({ project:p, step:s, diff:d });
    });
  });
  todayItems.sort((a, b) => diffDays(a.step.dueDate, b.step.dueDate));
  const nextFive = todayItems.slice(0, 5);
  const todoHtml = nextFive.length ? nextFive.map((u) => {
    const overdue = u.diff < 0;
    const overdueText = overdue ? `${Math.abs(u.diff)}日超過` : stepPeriodLabel(u.step);
    return `
    <div class="todo-item ${overdue ? 'is-overdue' : ''}" data-action="open-project" data-project-id="${escapeHtml(u.project.id)}">
      <span class="project-color-dot" style="background:${u.project.color}"></span>
      <button type="button" class="checkbox" data-action="toggle-step" data-project-id="${u.project.id}" data-step-id="${u.step.id}" aria-label="完了にする"></button>
      <div class="todo-item__body">
        <div class="todo-item__title">${escapeHtml(u.step.name)}</div>
        <div class="todo-item__meta">${escapeHtml(u.project.title)}${u.project.clientName ? ' ・ ' + escapeHtml(u.project.clientName) : ''}</div>
      </div>
      <div class="todo-item__due">${overdueText}</div>
    </div>`;
  }).join('') : compactEmptyHtml('listCheck','今日の予定はありません。');
  const weekDone = weekSteps.filter((item) => item.step.done).length;
  const weekPercent = weekSteps.length ? Math.round(weekDone / weekSteps.length * 100) : 0;
  const deadlineAlerts = projects.filter((p) => p.status !== 'done' && p.dueDate && diffDays(p.dueDate, todayS) <= 3).sort((a,b) => diffDays(a.dueDate,b.dueDate));
  const alertHtml = deadlineAlerts.length ? deadlineAlerts.map((p) => {
    const days = diffDays(p.dueDate, todayS); const overdue = days < 0;
    const label = overdue ? `${Math.abs(days)}日超過` : days === 0 ? '納期は今日' : `納期まで${days}日`;
    return `<button type="button" class="deadline-alert ${overdue ? 'is-overdue' : 'is-near'}" data-action="open-project" data-project-id="${escapeHtml(p.id)}"><span class="deadline-alert__icon" aria-hidden="true">⚠</span><span><strong>${label}</strong> ${escapeHtml(p.title)}</span><time>${formatJP(p.dueDate, { withWeekday:true })}</time></button>`;
  }).join('') : compactEmptyHtml('bell','3日以内の納期アラートはありません。');
  const unpaidProjects = projects.filter((p) => p.paymentStatus !== 'paid');
  const unbilledTotal = unpaidProjects.reduce((sum, p) => sum + (p.fee || 0), 0);
  const unbilledCount = projects.filter((p) => p.paymentStatus === 'unbilled').length;
  const thisMonthTotal = projects.filter((p) => p.deliveredDate && parseDateStr(p.deliveredDate).getFullYear() === now.getFullYear() && parseDateStr(p.deliveredDate).getMonth() === now.getMonth()).reduce((s,p) => s+(p.fee||0),0);
  const monthExpenses = state.expenses.filter((e) => e.date && parseDateStr(e.date).getFullYear() === now.getFullYear() && parseDateStr(e.date).getMonth() === now.getMonth()).length;
  const todayTasks=todayItems.length;
  const seed=Number(todayS.replace(/-/g,''));
  const encouragements=['今日も一日がんばりましょう','無理しないでくださいね','休憩も仕事のうちです','小さな一歩を積み重ねましょう','焦らず、あなたのペースで進めましょう','できたことにも目を向けてみましょう','ひとつずつ片づければ大丈夫です','今日のひらめきを大切にしましょう','深呼吸して、肩の力を抜きましょう','完璧より、前に進むことを大切に','自分の作品を信じて進みましょう','今日も創作を楽しめますように'];
  const healthTips=['目の疲れには20-20-20ルール。20分ごとに20秒、遠くを見ましょう','疲労回復にはビタミンB1を含む豚肉や大豆がおすすめです','ブルーベリーやほうれん草は目にやさしい食材です','肩こりにはゆっくり肩甲骨を回してみましょう','水分補給は少しずつ、こまめに取りましょう','1時間に一度は立って背中を伸ばしましょう','手首をやさしく回して、描く手をいたわりましょう','足首を動かすと座りっぱなしの血流改善に役立ちます','画面の明るさを部屋に合わせると目の負担を減らせます','昼食後の短い散歩は気分転換になります','寝る前は画面から少し離れて目と頭を休めましょう','深い呼吸を3回すると緊張をゆるめやすくなります'];
  const taskMessage=todayTasks===0?'今日は予定なし。ゆっくり充電してくださいね':`今日のタスクは${todayTasks}件。今週の進捗${weekPercent}%${weekPercent>=80?'、あと少し！':'。ひとつずつ進めましょう'}`;
  const encouragement=encouragements[seed%encouragements.length];
  const healthTip=healthTips[(seed*7+3)%healthTips.length];
  container.innerHTML = `
    <section class="home-greeting"><div class="home-greeting__top"><div class="home-greeting__main"><span>${escapeHtml(APP_NAME)}</span><h1>${greeting}</h1><p class="home-task-message">${escapeHtml(taskMessage)}</p></div><button type="button" class="home-avatar" data-action="edit-avatar" aria-label="アバターを変更"><img id="homeAvatar" src="assets/logo.png" onerror="this.onerror=null;this.src='assets/logo.svg'" alt=""></button></div><div class="home-message__bubble"><p>${escapeHtml(encouragement)}</p><p>☕ ${escapeHtml(healthTip)}</p></div></section>
    <div class="home-dashboard-grid">
      <section class="creative-card weekly-progress-card"><div><span class="home-kicker">${ICONS.gauge}今週の進捗</span><h2>制作のペース</h2><p>${weekSteps.length ? '今週が期限の工程を集計しています。' : '今週の工程はありません'}</p></div><div class="progress-ring" style="--progress:${weekPercent}%"><div><strong>${weekPercent}%</strong><span>${weekDone} / ${weekSteps.length}件</span></div></div></section>
      <section class="creative-card home-today-card"><h2 class="home-section-title">${ICONS.listCheck}<span>今日の予定</span></h2><div class="todo-list">${todoHtml}</div></section>
      <section class="creative-card home-alert-card"><h2 class="home-section-title">${ICONS.bell}<span>納期アラート</span></h2><div class="deadline-alerts">${alertHtml}</div></section>
      ${recentWorksHtml()}
      <section class="home-business-grid">
        <button type="button" class="business-card" data-action="home-money-card" data-subtab="ledger"><i class="business-card__icon">${ICONS.invoice}</i><span>未請求</span><strong>${unbilledCount}件</strong></button>
        <button type="button" class="business-card" data-action="home-money-card" data-subtab="ledger"><i class="business-card__icon">${ICONS.wallet}</i><span>未入金</span><strong>${formatMoney(unbilledTotal)}</strong></button>
        <button type="button" class="business-card" data-action="home-money-card" data-subtab="ledger"><i class="business-card__icon">${ICONS.chart}</i><span>今月の売上</span><strong>${formatMoney(thisMonthTotal)}</strong></button>
        <button type="button" class="business-card" data-action="home-money-card" data-subtab="expenses"><i class="business-card__icon">${ICONS.receipt}</i><span>経費・領収書</span><strong>${monthExpenses}件</strong></button>
        <button type="button" class="business-card business-card--shortcut" data-action="quick-add-expense"><i class="business-card__icon">${ICONS.plus}</i><span>日常ショートカット</span><strong>経費を追加</strong></button>
      </section>
    </div>
  `;
  if(state.settings.avatarImageId)imageUrl(state.settings.avatarImageId).then((url)=>{const avatar=$('#homeAvatar');if(avatar&&url){avatar.src=url;avatar.classList.add('is-custom');}});
  hydrateImages(container);
}

function recentWorksHtml(){const items=collectGalleryItems().slice(0,6);if(!items.length)return '';return `<section class="creative-card home-recent-works"><div class="home-recent-head"><h2 class="home-section-title">${ICONS.galleryImage}<span>最近の作品</span></h2><button type="button" class="text-link" data-action="show-all-works">すべて見る ›</button></div><div class="home-recent-scroll">${items.map((item)=>`<button type="button" class="home-work-card" data-action="open-gallery-item" data-key="${escapeHtml(galleryItemKey(item))}"><img data-image-id="${escapeHtml(item.imageId)}" alt=""><span>${escapeHtml(item.title||'無題')}</span></button>`).join('')}</div></section>`;}

function openAvatarModal(){const has=!!state.settings.avatarImageId;const overlay=openModal(`<div class="modal__header"><h2 class="modal__title">アバター</h2><button type="button" class="icon-btn" data-action="close-modal">${ICONS.close}</button></div><div class="modal__body"><input type="file" id="avatar-file" accept="image/*" hidden><button type="button" class="btn btn--primary" id="choose-avatar">画像を選ぶ</button>${has?'<button type="button" class="btn" data-action="reset-avatar">初期に戻す</button>':''}</div>`);$('#choose-avatar',overlay).addEventListener('click',()=>$('#avatar-file',overlay).click());$('#avatar-file',overlay).addEventListener('change',(e)=>{const file=e.target.files[0];if(file)openAvatarCropModal(file);});}

function openAvatarCropModal(file){
  const sourceUrl=URL.createObjectURL(file);
  const overlay=openModal(`<div class="modal__header"><h2 class="modal__title">画像を調整</h2><button type="button" class="icon-btn" id="avatar-crop-cancel" aria-label="キャンセル">${ICONS.close}</button></div><div class="modal__body"><p class="field__hint">画像をドラッグして位置を調整できます。</p><div class="avatar-crop-stage"><img id="avatar-crop-image" alt="トリミングする画像"><div class="avatar-crop-mask" aria-hidden="true"></div></div><label class="avatar-crop-zoom">拡大・縮小<input type="range" id="avatar-crop-range" min="1" max="3" step="0.01" value="1"></label><div class="modal__footer"><button type="button" class="btn" id="avatar-crop-back">キャンセル</button><button type="button" class="btn btn--primary" id="avatar-crop-save">決定</button></div></div>`,{narrow:true});
  const stage=$('.avatar-crop-stage',overlay),image=$('#avatar-crop-image',overlay),range=$('#avatar-crop-range',overlay);
  let offsetX=0,offsetY=0,zoom=1,baseScale=1,displaySize=0,cleaned=false,drag=null;
  const cleanup=()=>{if(cleaned)return;cleaned=true;URL.revokeObjectURL(sourceUrl);};
  new MutationObserver((records,observer)=>{if(!overlay.isConnected){cleanup();observer.disconnect();}}).observe(document.getElementById('modalRoot'),{childList:true});
  const metrics=()=>{const size=stage.clientWidth,diameter=size*.72,left=(size-diameter)/2;return {size,diameter,left};};
  const render=()=>{if(!image.naturalWidth)return;const m=metrics();baseScale=Math.max(m.diameter/image.naturalWidth,m.diameter/image.naturalHeight);const width=image.naturalWidth*baseScale*zoom,height=image.naturalHeight*baseScale*zoom;const limitX=Math.max(0,(width-m.diameter)/2),limitY=Math.max(0,(height-m.diameter)/2);offsetX=Math.max(-limitX,Math.min(limitX,offsetX));offsetY=Math.max(-limitY,Math.min(limitY,offsetY));image.style.width=`${width}px`;image.style.height=`${height}px`;image.style.left=`${(m.size-width)/2+offsetX}px`;image.style.top=`${(m.size-height)/2+offsetY}px`;displaySize=m.size;};
  image.onload=render;image.src=sourceUrl;
  range.addEventListener('input',()=>{zoom=Number(range.value);render();});
  stage.addEventListener('pointerdown',(event)=>{event.preventDefault();drag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:offsetX,startY:offsetY};stage.setPointerCapture(event.pointerId);});
  stage.addEventListener('pointermove',(event)=>{if(!drag||event.pointerId!==drag.id)return;event.preventDefault();offsetX=drag.startX+event.clientX-drag.x;offsetY=drag.startY+event.clientY-drag.y;render();});
  const endDrag=(event)=>{if(drag&&event.pointerId===drag.id)drag=null;};stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);
  const cancel=()=>{cleanup();closeModal();};$('#avatar-crop-cancel',overlay).addEventListener('click',cancel);$('#avatar-crop-back',overlay).addEventListener('click',cancel);
  $('#avatar-crop-save',overlay).addEventListener('click',()=>{if(!image.naturalWidth)return;const button=$('#avatar-crop-save',overlay);button.disabled=true;const m=metrics();if(displaySize!==m.size)render();const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ratio=512/m.diameter,ctx=canvas.getContext('2d');ctx.fillStyle='#FFFFFF';ctx.fillRect(0,0,512,512);ctx.drawImage(image,(parseFloat(image.style.left)-m.left)*ratio,(parseFloat(image.style.top)-m.left)*ratio,parseFloat(image.style.width)*ratio,parseFloat(image.style.height)*ratio);canvas.toBlob(async(blob)=>{if(!blob){button.disabled=false;showToast('画像を切り出せませんでした','error');return;}try{const old=state.settings.avatarImageId,newId=await imageSave(blob);state.settings.avatarImageId=newId;saveState();if(old)await imageDelete(old);cleanup();closeModal();renderHome();showToast('アバターを変更しました');}catch(error){console.error(error);button.disabled=false;showToast('画像を保存できませんでした','error');}},'image/jpeg',.9);});
}

function demoPlaceholderBlob(title,index) {
  return new Promise((resolve,reject)=>{
    const canvas=document.createElement('canvas');canvas.width=960;canvas.height=720;const ctx=canvas.getContext('2d');
    const palettes=[['#687EE7','#F6A1C4'],['#00B8D9','#6FD6A7'],['#FF8A00','#FFC400'],['#7C4DFF','#7DDCF0'],['#FF4D8D','#FFB080'],['#2979FF','#B8A4F5']];
    const colors=palettes[index%palettes.length],gradient=ctx.createLinearGradient(0,0,960,720);gradient.addColorStop(0,colors[0]);gradient.addColorStop(1,colors[1]);ctx.fillStyle=gradient;ctx.fillRect(0,0,960,720);
    ctx.globalAlpha=.22;ctx.fillStyle='#FFFFFF';ctx.beginPath();ctx.arc(760,130,190,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(150,650,260,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=.18;ctx.save();ctx.translate(480,360);ctx.rotate(-.18);ctx.fillRect(-250,-155,500,310);ctx.restore();ctx.globalAlpha=1;
    ctx.fillStyle='#FFFFFF';ctx.font='700 42px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(title,480,340,760);
    ctx.font='600 20px sans-serif';ctx.fillText('TSUKUROUTE  DEMO WORK',480,400);
    canvas.toBlob((blob)=>blob?resolve(blob):reject(new Error('デモ画像を生成できませんでした')),'image/jpeg',.88);
  });
}

async function seedDemoImages() {
  if(!IS_DEMO_MODE||state.settings.demoImagesSeeded)return;
  const targets=['demo-project-vtuber','demo-project-ebook','demo-project-apparel','demo-project-vi','demo-project-game','demo-project-doujin'];
  const created=[];
  for(let index=0;index<targets.length;index+=1){
    const project=state.projects.find((item)=>item.id===targets[index]);if(!project)continue;
    const imageId=await imageSave(await demoPlaceholderBlob(project.title,index));project.imageIds=[imageId];created.push(imageId);
  }
  state.settings.demoImagesSeeded=true;saveState();renderCurrentTab();
  return created;
}

async function resetDemoData() {
  if(!IS_DEMO_MODE)throw new Error('Demo reset is only available in demo mode');
  if(!confirm('デモで入力した内容を消去し、最初のサンプルデータに戻します。よろしいですか？'))return;
  localStorage.removeItem(STORAGE_KEY);
  await imageReplaceAll([]);
  state=seedDemoContent();
  generateRecurringExpensesThroughCurrentMonth();
  syncAllAutoProjectExpenses();
  saveState();
  await seedDemoImages();
  currentTab='home';moneySubTab='ledger';switchTab('home');
  showToast('デモデータを初期状態に戻しました');
}

function projectCardHtml(p) {
  const progress = projectProgress(p);
  const next = projectNextStep(p);
  const overdue = next && diffDays(next.dueDate, todayStr()) < 0;
  const keyDates = projectKeyDates(p);
  return `
  <div class="card project-card" style="border-left-color:${p.color}" data-action="open-project" data-project-id="${p.id}">
    <div class="project-card__top">
      <div>
        <div class="project-card__title"><span class="project-color-dot" style="background:${p.color}"></span>${escapeHtml(p.title)}</div>
        <div class="project-card__client">${escapeHtml(p.clientName || 'クライアント未設定')}</div>
      </div>
      ${statusBadgeHtml(p)}
    </div>
    <div class="progress-bar"><div class="progress-bar__fill" style="width:${progress}%;background:${projectGradient(p.color)}"></div></div>
    <div class="project-card__foot project-card__foot--milestones">
      <strong class="project-next-step ${overdue ? 'is-overdue' : ''}">次やること: ${next ? `${escapeHtml(next.name)} ${formatShortDate(stepStartDate(next))}` : '全工程完了'}</strong>
      <span>ラフ提出: ${formatShortDate(keyDates.rough&&keyDates.rough.dueDate)}</span>
      <span class="project-delivery-date">⚑ 納品: ${formatShortDate(keyDates.deliveryDate)}</span>
    </div>
  </div>`;
}

/* ===================== 案件タブ：一覧／タイムライン ===================== */
function renderProjectsTab() {
  const listWrap = $('#projectsListWrap');
  if (!listWrap) return;
  const projectContent=$('#projectsSectionContent'),galleryContent=$('#galleryContent');
  $all('#projectsSectionToggle .segmented__btn').forEach((button)=>button.classList.toggle('is-active',button.dataset.section===projectsSectionMode));
  projectContent.style.display=projectsSectionMode==='projects'?'':'none';galleryContent.style.display=projectsSectionMode==='gallery'?'':'none';
  if(projectsSectionMode==='gallery'){renderGalleryTab();return;}

  if (state.projects.length === 0) {
    projectSelectionMode=false;selectedProjectIds.clear();
    listWrap.style.display = '';
    listWrap.innerHTML = emptyStateHtml('folder', '案件がまだありません', '「案件を追加」から最初の案件を登録しましょう。', 'open-new-project', '案件を追加');
    return;
  }

  listWrap.style.display = '';

  const statusToggle=$('#projectsStatusToggle');
  const inProgress = state.projects.filter((p) => p.status !== 'done').sort((a, b) => diffDays(a.dueDate, b.dueDate));
  const done = state.projects.filter((p) => p.status === 'done').sort((a, b) => diffDays(b.dueDate, a.dueDate));
  if(statusToggle) statusToggle.innerHTML=`<button class="segmented__btn ${projectsStatusFilter==='in_progress'?'is-active':''}" data-action="filter-project-status" data-status="in_progress" type="button">進行中 ${inProgress.length}</button><button class="segmented__btn ${projectsStatusFilter==='done'?'is-active':''}" data-action="filter-project-status" data-status="done" type="button">完了 ${done.length}</button>`;
  { const shown=projectsStatusFilter==='done'?done:inProgress;
    const shownIds=new Set(shown.map((project)=>project.id));
    selectedProjectIds.forEach((id)=>{if(!shownIds.has(id))selectedProjectIds.delete(id);});
    listWrap.innerHTML = `
      <div class="home-block">
        <div class="selection-toolbar"><button type="button" class="btn btn--sm ${projectSelectionMode?'is-active':''}" data-action="toggle-project-select-mode">${projectSelectionMode?'選択を終了':'選択'}</button>${projectSelectionMode?`<span>${selectedProjectIds.size}件選択中</span>`:''}</div>
        ${projectSelectionMode&&selectedProjectIds.size?`<div class="bulk-action-bar"><strong>${selectedProjectIds.size}件を一括変更</strong><div><button type="button" class="btn btn--sm" data-action="bulk-project-billed">請求済みにする</button><button type="button" class="btn btn--sm btn--primary" data-action="bulk-project-paid">入金済みにする</button></div></div>`:''}
        ${shown.length ? `<div class="project-list">${shown.map(projectRowHtml).join('')}</div>` : compactEmptyHtml('sectionFolder',`${projectsStatusFilter==='done'?'完了した':'進行中の'}案件はありません。`)}
      </div>
    `;
  }
}

function projectRowHtml(p) {
  const progress = projectProgress(p);
  const next = projectNextStep(p);
  const overdue = next && diffDays(next.dueDate, todayStr()) < 0;
  const keyDates = projectKeyDates(p);
  return `
  <div class="project-row" style="border-left-color:${p.color}" data-action="open-project" data-project-id="${p.id}">
    ${projectSelectionMode?`<input class="bulk-check" type="checkbox" data-action="toggle-project-selection" data-project-id="${escapeHtml(p.id)}" ${selectedProjectIds.has(p.id)?'checked':''} aria-label="${escapeHtml(p.title)}を選択">`:''}
    <div class="project-row__main">
      <div class="project-row__title-line">
        <span class="project-color-dot" style="background:${p.color}"></span><span class="project-row__title">${escapeHtml(p.title)}</span>
        ${statusBadgeHtml(p)}
        <span class="badge badge--${p.paymentStatus}">${PAYMENT_STATUS_LABEL[p.paymentStatus]}</span>
      </div>
      <div class="project-row__client">${escapeHtml(p.clientName || 'クライアント未設定')}</div>
      <div class="project-row__rough">ラフ提出: ${formatShortDate(keyDates.rough&&keyDates.rough.dueDate)}</div>
    </div>
    <div class="project-row__progress">
      <div class="project-row__progress-label"><strong>${next ? `次やること: ${escapeHtml(next.name)} ${formatShortDate(stepStartDate(next))}` : '全工程完了'}</strong><span>${progress}%</span></div>
      <div class="progress-bar"><div class="progress-bar__fill" style="width:${progress}%;background:${projectGradient(p.color)}"></div></div>
    </div>
    <div class="project-row__due ${overdue ? 'is-overdue' : ''}">⚑ 納品: ${formatShortDate(keyDates.deliveryDate)}</div>
  </div>`;
}

/* ===================== 案件：新規作成モーダル ===================== */
function openNewProjectModal() {
  const clientsOptions = state.clients.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  let selectedColor = leastUsedProjectColor(state.projects);
  let draftSteps = [];
  const bodyHtml = `
    <div class="modal__header">
      <h2 class="modal__title">案件を追加</h2>
      <button type="button" class="icon-btn" data-action="close-modal">${ICONS.close}</button>
    </div>
    <div class="modal__body">
      <form id="projectForm">
        <div class="field">
          <label class="field__label">案件タイトル<span class="req">必須</span></label>
          <input class="input" id="pf-title" required placeholder="例: 〇〇社 バナー広告制作">
        </div>
        <div class="field-row">
          <div class="field">
            <label class="field__label">クライアント</label>
            <select class="select" id="pf-client">
              <option value="">選択してください</option>
              ${clientsOptions}
              <option value="__new__">＋ 新しいクライアントを追加</option>
            </select>
            <input class="input" id="pf-client-new" placeholder="新しいクライアント名" style="display:none; margin-top:8px;">
          </div>
          <div class="field">
            <label class="field__label">納期<span class="req">必須</span></label>
            <input class="input" type="date" id="pf-due" required>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label class="field__label">報酬額（円）<span class="req">必須</span></label>
            <input class="input" type="text" inputmode="numeric" data-money-input id="pf-fee" required placeholder="例: 80,000">
          </div>
          <div class="field project-flags-field">
            <div class="checkbox-row withholding-help-wrap">
              <input type="checkbox" id="pf-withholding">
              <label for="pf-withholding">源泉徴収あり</label>
              <button type="button" class="help-icon" data-action="toggle-withholding-help" aria-label="源泉徴収の説明">?</button>
              <div class="field-help-popover" hidden>法人のクライアントから直接お仕事を受け、報酬から源泉徴収税10.21%が差し引かれて振り込まれる場合にONにします。ココナラなどのサイト経由や、個人のお客様との取引では通常引かれないためOFFのままにします。</div>
            </div>
            <label class="field__label" for="pf-platform">経由プラットフォーム</label><select class="select" id="pf-platform"><option value="">なし</option>${(state.settings.platforms||[]).map((platform)=>`<option value="${escapeHtml(platform.id)}">${escapeHtml(platform.name)}</option>`).join('')}</select>
          </div>
        </div>
        <div class="platform-fee-preview" id="pf-platform-fee" hidden></div>
        <div class="field">
          <label class="field__label">案件カラー</label>
          <div id="pf-color-swatches">${colorSwatchesHtml(selectedColor, 'new-project')}</div>
        </div>
        <div class="field">
          <label class="field__label">メモ</label>
          <textarea class="textarea" id="pf-memo" placeholder="任意"></textarea>
        </div>
        <div id="pf-warning"></div>
        <div class="field">
          <label class="field__label">工程プレビュー</label>
          <div id="pf-steps-preview" class="info-box">納期を入力すると工程が自動生成されます。</div>
          <button type="button" class="text-link" data-action="open-template-settings">工程テンプレートを編集</button>
        </div>
      </form>
    </div>
    <div class="modal__footer">
      <button type="button" class="btn" data-action="close-modal">キャンセル</button>
      <button type="button" class="btn btn--primary" id="pf-submit">作成する</button>
    </div>
  `;
  const overlay = openModal(bodyHtml);

  const clientSel = $('#pf-client', overlay);
  const clientNewInput = $('#pf-client-new', overlay);
  const dueInput = $('#pf-due', overlay);
  const feeInput = $('#pf-fee', overlay);
  wireMoneyInputs(overlay);
  const platformInput = $('#pf-platform', overlay);
  $('#pf-color-swatches', overlay).addEventListener('click', (e) => {
    const add = e.target.closest('.color-swatch-add');
    if (add) { openColorPicker(add, selectedColor, (color) => { selectedColor=color; $('#pf-color-swatches',overlay).innerHTML=colorSwatchesHtml(selectedColor,'new-project'); }); return; }
    const swatch = e.target.closest('.color-swatch'); if (!swatch) return;
    selectedColor = swatch.dataset.color;
    $('#pf-color-swatches', overlay).innerHTML = colorSwatchesHtml(selectedColor, 'new-project');
  });

  function renderDraftStepsPreview() {
    const previewEl = $('#pf-steps-preview', overlay);
    previewEl.innerHTML = draftSteps.map((s, index) => {const isDelivery=String(s.name||'').includes('納品');return `<div class="step-preview-row" data-draft-index="${index}" data-delivery-step="${isDelivery}">${isDelivery?'<span class="drag-handle-spacer"></span>':`<button type="button" class="drag-handle" aria-label="${escapeHtml(s.name)}を並び替え">${dragHandleSvg}</button>`}<strong>${escapeHtml(s.name)}</strong><div class="step-preview-dates"><input class="input" aria-label="${escapeHtml(s.name)}の開始日" type="date" data-pf-step-start="${index}" value="${s.startDate}"><span>〜</span><input class="input" aria-label="${escapeHtml(s.name)}の終了日" type="date" data-pf-step-due="${index}" value="${s.dueDate}"></div><small>（${diffDays(s.dueDate,s.startDate)+1}日）</small></div>`;}).join('');
    wirePointerReorder(previewEl,'.step-preview-row',(rows)=>{draftSteps=rows.map((row)=>draftSteps[Number(row.dataset.draftIndex)]);renderDraftStepsPreview();});
  }

  function updatePreview() {
    const due = dueInput.value;
    const previewEl = $('#pf-steps-preview', overlay);
    const warnEl = $('#pf-warning', overlay);
    if (!due) {
      draftSteps = [];
      previewEl.textContent = '納期を入力すると工程が自動生成されます。';
      warnEl.innerHTML = '';
      return;
    }
    const clientId = clientSel.value === '__new__' ? '' : clientSel.value;
    const template = getTemplateForClient(clientId);
    const { steps, isTight, isRelaxed } = generateSteps(template, due);
    draftSteps = steps;
    renderDraftStepsPreview();
    warnEl.innerHTML = isTight ? warningBoxHtml('納期までの日数が基準日程より短いため、工程を圧縮しました。スケジュールがタイトです。') : (isRelaxed ? `<div class="relaxed-box">納期まで余裕があるため、ゆとりを持たせた日程を自動設定しました</div>` : '');
  }

  function updatePlatformFeePreview() {
    const preview = $('#pf-platform-fee', overlay);
    const fee = Math.max(0, parseMoneyInput(feeInput.value) || 0);
    const platform=(state.settings.platforms||[]).find((item)=>item.id===platformInput.value);const rate=Number(platform&&platform.feeRate)||0;
    const amount = Math.floor(fee * rate);
    preview.hidden = !platform;
    preview.textContent = `手数料 ${formatMoney(amount)}（${(rate * 100).toFixed(2).replace(/\.00$/, '')}%）／振込額 ${formatMoney(fee - amount)}`;
  }

  clientSel.addEventListener('change', () => {
    clientNewInput.style.display = clientSel.value === '__new__' ? '' : 'none';
    updatePreview();
  });
  dueInput.addEventListener('input', updatePreview);
  feeInput.addEventListener('input', updatePlatformFeePreview);
  platformInput.addEventListener('change', updatePlatformFeePreview);
  $('#pf-steps-preview', overlay).addEventListener('change', (e) => {
    const startIndex = e.target.dataset.pfStepStart;
    const dueIndex = e.target.dataset.pfStepDue;
    const index = Number(startIndex !== undefined ? startIndex : dueIndex);
    const step = draftSteps[index];
    if (!step) return;
    const nextStart = startIndex !== undefined ? e.target.value : step.startDate;
    const nextDue = dueIndex !== undefined ? e.target.value : step.dueDate;
    if (!nextStart || !nextDue || diffDays(nextStart, nextDue) > 0) {
      showToast('工程の開始日は終了日以前にしてください', 'error');
      e.target.value = startIndex !== undefined ? step.startDate : step.dueDate;
      return;
    }
    step.startDate = nextStart; step.dueDate = nextDue; step.days = diffDays(nextDue, nextStart) + 1;
    draftSteps = draftSteps.map((item,index)=>({item,index})).sort((a,b)=>String(a.item.startDate||'9999-12-31').localeCompare(String(b.item.startDate||'9999-12-31'))||a.index-b.index).map((entry)=>entry.item);
    renderDraftStepsPreview();
  });
  overlay.addEventListener('modalrestored', updatePreview);

  $('#pf-submit', overlay).addEventListener('click', () => {
    const title = $('#pf-title', overlay).value.trim();
    const due = dueInput.value;
    const feeRaw = $('#pf-fee', overlay).value;
    const fee = parseMoneyInput(feeRaw);
    if (!title) { showToast('案件タイトルを入力してください', 'error'); return; }
    if (!due) { showToast('納期を選択してください', 'error'); return; }
    if (feeRaw === '' || isNaN(fee) || fee < 0) { showToast('報酬額を正しく入力してください', 'error'); return; }

    let clientId = '';
    let clientName = '';
    if (clientSel.value === '__new__') {
      const newName = clientNewInput.value.trim();
      if (!newName) { showToast('クライアント名を入力してください', 'error'); return; }
      const newClient = { id: uuid(), name: newName, templateOverride: null };
      state.clients.push(newClient);
      clientId = newClient.id;
      clientName = newClient.name;
    } else if (clientSel.value) {
      clientId = clientSel.value;
      const c = getClientById(clientId);
      clientName = c ? c.name : '';
    }

    const steps = draftSteps.length ? draftSteps.map((step) => ({ ...step })) : generateSteps(getTemplateForClient(clientId), due).steps;
    if (steps.some((step) => !step.startDate || !step.dueDate || diffDays(step.startDate, step.dueDate) > 0)) { showToast('工程の開始日と終了日を確認してください', 'error'); return; }

    const project = {
      id: uuid(), title, clientId, clientName, orderedDate: todayStr(), dueDate: due,
      fee, hasWithholding: $('#pf-withholding', overlay).checked, platformId:platformInput.value||null,isCoconala:false,
      memo: $('#pf-memo', overlay).value.trim(),
      status: 'in_progress', steps, color: selectedColor,
      paymentStatus: 'unbilled', paidDate: null, deliveredDate: null,
      imageIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    state.projects.push(project);
    saveState();
    closeModal();
    renderCurrentTab();
    showToast('案件を追加しました');
  });
}

/* ===================== 案件：詳細モーダル ===================== */
function openProjectDetailModal(id) {
  const project = state.projects.find((p) => p.id === id);
  if (!project) return;
  const overlay = openModal(projectDetailHtml(project), { wide: true });
  overlay.dataset.projectId = id;
  hydrateImages(overlay);
  wireProjectDetailEvents(overlay, project.id);
}

function projectDetailHtml(p) {
  const progress = projectProgress(p);
  return `
  <div class="modal__header">
    <h2 class="modal__title">${escapeHtml(p.title)}</h2>
    <button type="button" class="icon-btn" data-action="close-modal">${ICONS.close}</button>
  </div>
  <div class="modal__body">
    <div class="field-row">
      <div class="field">
        <label class="field__label">クライアント</label>
        <div>${escapeHtml(p.clientName || '未設定')}</div>
      </div>
      <div class="field">
        <label class="field__label">納期</label>
        <input class="input" type="date" id="pd-due" value="${p.dueDate || ''}">
      </div>
    </div>
    <div class="field">
      <label class="field__label">案件カラー</label>
      <div id="pd-color-swatches">${colorSwatchesHtml(p.color, 'project-detail')}</div>
    </div>
    <div class="field-row">
      <div class="field">
        <label class="field__label">報酬額（円）</label>
        <input class="input" type="text" inputmode="numeric" data-money-input id="pd-fee" value="${p.fee}">
      </div>
      <div class="field" style="display:flex;align-items:flex-end;">
        <div class="project-flags-field">
          <div class="checkbox-row withholding-help-wrap">
            <input type="checkbox" id="pd-withholding" ${p.hasWithholding ? 'checked' : ''}>
            <label for="pd-withholding">源泉徴収あり（${formatMoney(withholdingAmount(p))}）</label>
            <button type="button" class="help-icon" data-action="toggle-withholding-help" aria-label="源泉徴収の説明">?</button>
            <div class="field-help-popover" hidden>法人のクライアントから直接お仕事を受け、報酬から源泉徴収税10.21%が差し引かれて振り込まれる場合にONにします。ココナラなどのサイト経由や、個人のお客様との取引では通常引かれないためOFFのままにします。</div>
          </div>
          <label class="field__label" for="pd-platform">経由プラットフォーム</label><select class="select" id="pd-platform"><option value="">なし</option>${(state.settings.platforms||[]).map((platform)=>`<option value="${escapeHtml(platform.id)}" ${p.platformId===platform.id?'selected':''}>${escapeHtml(platform.name)}</option>`).join('')}</select>
        </div>
      </div>
    </div>
    ${p.platformId ? `<div class="platform-fee-preview">手数料 ${formatMoney(platformFeeAmount(p))}（${((Number(((state.settings.platforms||[]).find((item)=>item.id===p.platformId)||{}).feeRate)||0)*100).toFixed(2).replace(/\.00$/, '')}%）／振込額 ${formatMoney((p.fee || 0) - platformFeeAmount(p))}</div>` : ''}
    <div class="field">
      <label class="field__label">メモ</label>
      <textarea class="textarea" id="pd-memo">${escapeHtml(p.memo || '')}</textarea>
    </div>

    <div class="field">
      <label class="field__label">進捗 ${progress}%</label>
      <div class="progress-bar"><div class="progress-bar__fill" style="width:${progress}%;background:${projectGradient(p.color)}"></div></div>
    </div>

    <div class="field">
      <label class="field__label">工程</label>
      <div class="step-checklist" id="pd-steps">
        ${(p.steps || []).map(stepRowHtml).join('')}
      </div>
      <button class="btn btn--sm" style="margin-top:8px;" type="button" data-action="add-step" data-project-id="${p.id}">${ICONS.plus}工程を追加</button>
    </div>

    <div class="field-row">
      <div class="field">
        <label class="field__label">支払いステータス</label>
        <div class="payment-toggle" id="pd-payment-toggle">
          ${PAYMENT_STATUS_ORDER.map((st) => `<button type="button" class="payment-toggle__btn ${st} ${p.paymentStatus === st ? 'is-active' : ''}" data-action="set-payment-status" data-project-id="${p.id}" data-status="${st}">${PAYMENT_STATUS_LABEL[st]}</button>`).join('')}
        </div>
      </div>
      <div class="field">
        <label class="field__label">入金日</label>
        <input class="input" type="date" id="pd-paid-date" value="${p.paidDate || ''}" ${p.paymentStatus !== 'paid' ? 'disabled' : ''}>
      </div>
    </div>
    <div class="field">
      <label class="field__label">納品日</label>
      <input class="input" type="date" id="pd-delivered-date" value="${p.deliveredDate || ''}">
      <div class="field__hint">「納品」工程を完了すると自動で入りますが、手動で修正できます。</div>
      <div class="field__hint">納品日＝実際に納品した日（売上はこの日に計上されます）／納期＝クライアントと約束した期限</div>
    </div>

    <div class="field">
      <label class="field__label">作品画像</label>
      <div class="image-drop" id="pd-image-drop">クリックして画像を追加</div>
      <input type="file" id="pd-image-input" accept="image/*" multiple style="display:none;">
      <div class="image-thumbs" id="pd-image-thumbs">
        ${(p.imageIds || []).map((imgId) => imageThumbHtml(imgId, p.id)).join('')}
      </div>
    </div>
  </div>
  <div class="modal__footer project-detail-footer">
    <button type="button" class="btn btn--danger" data-action="delete-project" data-project-id="${p.id}">${ICONS.trash}削除</button>
    <div class="project-detail-actions">
      <button type="button" class="btn" data-action="compose-project-message" data-project-id="${p.id}">メッセージ作成</button>
      <button type="button" class="btn" data-action="create-invoice-from-project" data-project-id="${p.id}">請求書を作成</button>
      <button type="button" class="btn btn--primary" data-action="save-close-project" data-project-id="${p.id}">保存する</button>
    </div>
  </div>`;
}

function stepRowHtml(s) {
  const overdue = !s.done && diffDays(s.dueDate, todayStr()) < 0;
  const isDelivery = String(s.name || '').includes('納品');
  return `
  <div class="step-check-row ${s.done ? 'is-done' : ''} ${overdue ? 'is-overdue' : ''}" data-step-id="${s.id}" data-delivery-step="${isDelivery}">
    ${isDelivery?'<span class="drag-handle-spacer"></span>':`<button type="button" class="drag-handle" aria-label="${escapeHtml(s.name)}を並び替え">${dragHandleSvg}</button>`}
    <button class="checkbox ${s.done ? 'is-checked' : ''}" type="button" data-action="toggle-step-detail" data-step-id="${s.id}">${s.done ? ICONS.check : ''}</button>
    <div class="step-check-row__name">${isDelivery ? '<span class="delivery-step-marker" aria-label="納品工程">⚑</span>' : ''}${escapeHtml(s.name)}</div>
    <div class="step-check-row__dates"><label>開始<input type="date" value="${stepStartDate(s)}" data-action="edit-step-date" data-step-date-field="startDate" data-step-id="${s.id}"></label><span>〜</span><label>終了<input type="date" value="${s.dueDate}" data-action="edit-step-date" data-step-date-field="dueDate" data-step-id="${s.id}"></label></div>
    <button class="icon-btn step-check-row__remove btn--sm" type="button" data-action="remove-step" data-step-id="${s.id}" title="削除">${ICONS.trash}</button>
  </div>`;
}

function imageThumbHtml(imgId, projectId) {
  return `<div class="image-thumb"><img data-image-id="${imgId}" data-action="view-image" data-image-view-id="${imgId}" alt=""><button class="image-thumb__remove" type="button" data-action="remove-project-image" data-project-id="${projectId}" data-image-id="${imgId}" title="削除">×</button></div>`;
}

function wireProjectDetailEvents(overlay, projectId) {
  wireMoneyInputs(overlay);
  wirePointerReorder($('#pd-steps',overlay),'.step-check-row',(rows)=>{const project=state.projects.find((item)=>item.id===projectId);if(!project)return;const byId=new Map(project.steps.map((step)=>[step.id,step]));project.steps=rows.map((row)=>byId.get(row.dataset.stepId)).filter(Boolean);project.updatedAt=new Date().toISOString();saveState();renderCurrentTab();});
  const getProject = () => state.projects.find((p) => p.id === projectId);
  $('#pd-color-swatches', overlay).addEventListener('click', (e) => {
    const add = e.target.closest('.color-swatch-add');
    if (add) { const current=getProject(); if(current) openColorPicker(add,current.color,(color)=>{current.color=color;current.updatedAt=new Date().toISOString();saveState();renderCurrentTab();$('#pd-color-swatches',overlay).innerHTML=colorSwatchesHtml(color,'project-detail');}); return; }
    const swatch = e.target.closest('.color-swatch'); if (!swatch) return;
    const p = getProject(); if (!p) return;
    p.color = swatch.dataset.color; p.updatedAt = new Date().toISOString(); saveState(); renderCurrentTab(); refreshProjectDetail(overlay, projectId);
  });

  $('#pd-due', overlay).addEventListener('change', (e) => {
    const p = getProject(); if (!p) return;
    p.dueDate = e.target.value; p.updatedAt = new Date().toISOString();
    saveState(); renderCurrentTab();
  });
  $('#pd-fee', overlay).addEventListener('change', (e) => {
    const p = getProject(); if (!p) return;
    const v = parseMoneyInput(e.target.value);
    if (isNaN(v) || v < 0) { showToast('報酬額が不正です', 'error'); e.target.value = p.fee; return; }
    p.fee = v; p.updatedAt = new Date().toISOString(); syncAutoExpenseForProject(p);
    saveState(); renderCurrentTab();
    refreshProjectDetail(overlay, projectId);
  });
  $('#pd-withholding', overlay).addEventListener('change', (e) => {
    const p = getProject(); if (!p) return;
    p.hasWithholding = e.target.checked; p.updatedAt = new Date().toISOString();
    saveState(); renderCurrentTab();
    refreshProjectDetail(overlay, projectId);
  });
  $('#pd-platform', overlay).addEventListener('change', (e) => {
    const p = getProject(); if (!p) return;
    p.platformId = e.target.value||null;p.isCoconala=false; p.updatedAt = new Date().toISOString();
    syncAutoExpenseForProject(p); saveState(); renderCurrentTab(); refreshProjectDetail(overlay, projectId);
  });
  $('#pd-memo', overlay).addEventListener('change', (e) => {
    const p = getProject(); if (!p) return;
    p.memo = e.target.value; p.updatedAt = new Date().toISOString();
    saveState();
  });
  $('#pd-paid-date', overlay).addEventListener('change', (e) => {
    const p = getProject(); if (!p) return;
    p.paidDate = e.target.value || null;
    saveState(); renderCurrentTab();
  });
  $('#pd-delivered-date', overlay).addEventListener('change', (e) => {
    const p = getProject(); if (!p) return;
    p.deliveredDate = e.target.value || null;
    syncAutoExpenseForProject(p); saveState(); renderCurrentTab();
  });

  $all('[data-action="edit-step-date"]', overlay).forEach((input) => {
    input.addEventListener('change', (e) => {
      const p = getProject(); if (!p) return;
      const step = p.steps.find((s) => s.id === input.dataset.stepId);
      if (!step) return;
      const field = input.dataset.stepDateField;
      const nextStart = field === 'startDate' ? e.target.value : stepStartDate(step);
      const nextDue = field === 'dueDate' ? e.target.value : step.dueDate;
      if (!nextStart || !nextDue || diffDays(nextStart, nextDue) > 0) {
        showToast('工程の開始日は終了日以前にしてください', 'error');
        e.target.value = field === 'startDate' ? stepStartDate(step) : step.dueDate;
        return;
      }
      step.startDate = nextStart; step.dueDate = nextDue; step.days = diffDays(nextDue, nextStart) + 1;
      sortProjectStepsByStartDate(p);
      p.updatedAt = new Date().toISOString();
      saveState(); renderCurrentTab();
      refreshProjectDetail(overlay, projectId);
    });
  });

  const dropZone = $('#pd-image-drop', overlay);
  const fileInput = $('#pd-image-input', overlay);
  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const p = getProject(); if (!p) return;
    const files = Array.from(fileInput.files || []);
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const id = await imageSave(file);
        p.imageIds.push(id);
      } catch (err) { console.error(err); showToast('画像の保存に失敗しました', 'error'); }
    }
    fileInput.value = '';
    saveState();
    refreshProjectDetail(overlay, projectId);
    renderCurrentTab();
  });
}

function refreshProjectDetail(overlay, projectId) {
  const p = state.projects.find((x) => x.id === projectId);
  if (!p) { closeModal(); return; }
  const previousBody = $('.modal__body', overlay);
  const scrollTop = previousBody ? previousBody.scrollTop : 0;
  overlay.querySelector('.modal').innerHTML = projectDetailHtml(p);
  $all('button', overlay).forEach((button) => { if (!button.hasAttribute('type')) button.type = 'button'; });
  hydrateImages(overlay);
  wireProjectDetailEvents(overlay, projectId);
  const nextBody = $('.modal__body', overlay);
  if (nextBody) requestAnimationFrame(() => { nextBody.scrollTop = scrollTop; });
}

/* ===================== お金タブ ===================== */
let moneySubTab = 'ledger';
let moneyYear = new Date().getFullYear();
let ledgerMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let expenseCategoryFilter = '__all__';
let editingExpenseId = null;
let expenseSelectionMode = false;
const selectedExpenseIds = new Set();
let projectSelectionMode = false;
const selectedProjectIds = new Set();

function renderMoneyTab() {
  const container = $('#moneyContent');
  if (!container) return;
  const subtabs = ['ledger', 'expenses', 'quotes', 'invoices', 'summary'];
  const subtabLabels = { ledger: '売上', expenses: '経費', quotes:'見積', invoices: '請求書', summary: '確定申告' };

  container.innerHTML = `
    <div class="view-toolbar">
      <h1 class="view-title">お金</h1>
    </div>
    <div class="year-switch">
      <button type="button" class="icon-btn" data-action="money-year-prev">${arrowLeftSvg()}</button>
      <div class="year-switch__label">${moneyYear}年</div>
      <button type="button" class="icon-btn" data-action="money-year-next">${arrowRightSvg()}</button>
    </div>
    <div class="money-subtabs" aria-label="お金の機能">
      <div class="money-subtab-group"><span>日々のお金</span>${subtabs.slice(0,2).map((t) => `<button type="button" class="money-subtab-btn ${moneySubTab === t ? 'is-active' : ''}" data-action="switch-money-subtab" data-subtab="${t}">${subtabLabels[t]}</button>`).join('')}</div>
      <div class="money-subtab-group"><span>書類</span>${subtabs.slice(2,4).map((t) => `<button type="button" class="money-subtab-btn ${moneySubTab === t ? 'is-active' : ''}" data-action="switch-money-subtab" data-subtab="${t}">${subtabLabels[t]}</button>`).join('')}</div>
      <div class="money-subtab-group"><span>年次</span>${subtabs.slice(4).map((t) => `<button type="button" class="money-subtab-btn ${moneySubTab === t ? 'is-active' : ''}" data-action="switch-money-subtab" data-subtab="${t}">${subtabLabels[t]}</button>`).join('')}</div>
    </div>
    <div id="moneySubContent"></div>
  `;

  const sub = $('#moneySubContent');
  if (moneySubTab === 'ledger') sub.innerHTML = ledgerHtml(moneyYear);
  else if (moneySubTab === 'expenses') { sub.innerHTML = expensesHtml(moneyYear); wireExpenseForm(sub); }
  else if (moneySubTab === 'quotes') sub.innerHTML = quotesListHtml(moneyYear);
  else if (moneySubTab === 'invoices') sub.innerHTML = invoicesListHtml(moneyYear);
  else if (moneySubTab === 'summary') sub.innerHTML = summaryHtml(moneyYear);

  hydrateImages(sub);
  requestAnimationFrame(()=>fitDocumentMiniatures(sub));
}

function fitDocumentMiniatures(root) {
  $all('.invoice-miniature',root||document).forEach((frame)=>{
    const page=$('.invoice-preview',frame);if(!page)return;page.style.transform='none';
    const width=page.offsetWidth;if(!width)return;page.style.transform=`scale(${frame.clientWidth/width})`;page.style.transformOrigin='top left';
  });
}

function ledgerHtml(year) {
  const projects = projectsDeliveredInYear(year).sort((a, b) => diffDays(b.deliveredDate, a.deliveredDate));
  const monthly = Array.from({ length: 12 }, (_, month) => projects.filter((p) => parseDateStr(p.deliveredDate).getMonth() === month).reduce((sum, p) => sum + (p.fee || 0), 0));
  const max = Math.max(1, ...monthly);
  const total = monthly.reduce((sum, value) => sum + value, 0);
  const selectedYear=ledgerMonth.getFullYear(); const selectedMonth=ledgerMonth.getMonth();
  const selectedTotal=state.projects.filter((p)=>p.deliveredDate&&parseDateStr(p.deliveredDate).getFullYear()===selectedYear&&parseDateStr(p.deliveredDate).getMonth()===selectedMonth).reduce((sum,p)=>sum+(p.fee||0),0);
  return `
    <section class="ledger-month-hero"><button type="button" class="icon-btn" data-action="ledger-month-prev" aria-label="前月">${arrowLeftSvg()}</button><div><span>${selectedYear}年${selectedMonth+1}月の売上</span><strong>${formatMoney(selectedTotal)}</strong></div><button type="button" class="icon-btn" data-action="ledger-month-next" aria-label="次月">${arrowRightSvg()}</button></section>
    <div class="summary-tile annual-total"><div class="summary-tile__label">${year}年の売上合計</div><div class="summary-tile__value">${formatMoney(total)}</div></div>
    <div class="sales-chart sales-chart--12">${monthly.map((value, month) => `<button type="button" class="sales-chart__col ${selectedYear===year&&selectedMonth===month?'is-selected':''}" data-action="select-ledger-month" data-year="${year}" data-month="${month}"><div class="sales-chart__bar-wrap"><div class="sales-chart__bar" style="height:${Math.max(3, value / max * 100)}%" data-tooltip="${formatMoney(value)}"></div></div><div class="sales-chart__label">${month + 1}月</div></button>`).join('')}</div>
    <div class="info-box">確定申告では売上は入金日ではなく「納品日（役務提供完了日）」に計上します（発生主義）。納期より早く納めた場合は、実際の納品日の月の売上になります。ココナラ等の手数料は売上から差し引かず、「支払手数料」として経費に計上します（総額主義）。</div>
    ${projects.length === 0 ? compactEmptyHtml('chart','この年に計上された売上はありません。') : `
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>計上日</th><th>案件名</th><th>クライアント</th><th class="num-cell">金額</th><th class="num-cell">源泉徴収額</th><th class="num-cell">手取り</th><th>入金状況</th></tr></thead>
      <tbody>
      ${projects.map((p) => `<tr>
        <td>${formatJPSlash(p.deliveredDate)}</td>
        <td>${escapeHtml(p.title)}</td>
        <td>${escapeHtml(p.clientName || '')}</td>
        <td class="num-cell">${formatMoney(p.fee)}</td>
        <td class="num-cell">${formatMoney(withholdingAmount(p))}</td>
        <td class="num-cell">${formatMoney(netAmount(p))}</td>
        <td><span class="badge badge--${p.paymentStatus}">${PAYMENT_STATUS_LABEL[p.paymentStatus]}</span></td>
      </tr>`).join('')}
      </tbody>
    </table></div>`}
  `;
}

function exportLedgerCsv(year) {
  const projects = projectsDeliveredInYear(year).sort((a, b) => diffDays(a.deliveredDate, b.deliveredDate));
  const rows = [['計上日', '案件名', 'クライアント', '金額', '源泉徴収額', '手取り', '入金状況']];
  projects.forEach((p) => rows.push([formatJPSlash(p.deliveredDate), p.title, p.clientName || '', p.fee, withholdingAmount(p), netAmount(p), PAYMENT_STATUS_LABEL[p.paymentStatus]]));
  downloadCsv(`売上台帳_${year}.csv`, rows);
}

function expensesHtml(year) {
  const all = state.expenses.filter((e) => e.date && parseDateStr(e.date).getFullYear() === year);
  const filtered = expenseCategoryFilter === '__all__' ? all : all.filter((e) => e.category === expenseCategoryFilter);
  const sorted = filtered.slice().sort((a, b) => diffDays(b.date, a.date));
  const extraCats = Array.from(new Set(all.map((e) => e.category).filter((c) => !EXPENSE_CATEGORIES.includes(c))));
  const categories = ['__all__', ...EXPENSE_CATEGORIES, ...extraCats];
  const editing = state.expenses.find((e) => e.id === editingExpenseId) || null;
  const total = all.reduce((sum, e) => sum + (e.amount || 0), 0);
  const byCategory = {};
  all.forEach((e) => { byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount || 0); });
  const maxCat = Math.max(1, ...Object.values(byCategory));
  const editCategoryKnown = editing && EXPENSE_CATEGORIES.includes(editing.category);
  const editingRecurring = !!(editing && editing.autoRecurringId);
  const selectableIds=new Set(sorted.filter((expense)=>!expense.autoProjectId&&!expense.autoRecurringId).map((expense)=>expense.id));
  selectedExpenseIds.forEach((id)=>{if(!selectableIds.has(id))selectedExpenseIds.delete(id);});

  return `
    <div class="expense-overview">
      <div class="summary-tile"><div class="summary-tile__label">${year}年の経費合計</div><div class="summary-tile__value">${formatMoney(total)}</div></div>
      <div><h2 class="section-title money-section-title">${ICONS.receipt}<span>カテゴリ別内訳</span></h2><div class="summary-bars">${Object.entries(byCategory).sort((a,b) => b[1]-a[1]).map(([cat, amount]) => `<div class="summary-bar-row"><div class="summary-bar-row__label">${escapeHtml(cat)}</div><div class="summary-bar-row__track"><div class="summary-bar-row__fill" style="width:${amount/maxCat*100}%"></div></div><div class="summary-bar-row__value">${formatMoney(amount)}</div></div>`).join('') || compactEmptyHtml('receipt','経費の記録はありません。')}</div></div>
    </div>
    <form id="expenseForm" class="expense-form">
      <div class="field" style="margin-bottom:0;">
        <label class="field__label">日付</label>
        <input class="input" type="date" id="ef-date" value="${editing ? editing.date : todayStr()}" ${editingRecurring?'disabled':''} required>
      </div>
      <div class="field" style="margin-bottom:0;">
        <label class="field__label">カテゴリ</label>
        <select class="select" id="ef-category" ${editingRecurring?'disabled':''}>
          ${EXPENSE_CATEGORIES.map((c) => `<option value="${c}" ${editing && editCategoryKnown && editing.category === c ? 'selected' : ''}>${c}</option>`).join('')}
          <option value="__custom__" ${editing && !editCategoryKnown ? 'selected' : ''}>自由入力…</option>
        </select>
        <input class="input" id="ef-category-custom" value="${editing && !editCategoryKnown ? escapeHtml(editing.category) : ''}" placeholder="カテゴリ名" style="display:${editing && !editCategoryKnown ? '' : 'none'}; margin-top:8px;">
      </div>
      <div class="field" style="margin-bottom:0;">
        <label class="field__label">金額（円）</label>
        <input class="input" type="text" inputmode="numeric" data-money-input id="ef-amount" value="${editing ? escapeHtml(editing.amount) : ''}" required placeholder="例: 3,000">
      </div>
      <div class="field" style="margin-bottom:0;">
        <label class="field__label">メモ</label>
        <input class="input" id="ef-memo" value="${editing ? escapeHtml(editing.memo || '') : ''}" placeholder="任意">
      </div>
      <div class="field" style="margin-bottom:0;">
        <label class="field__label">領収書</label>
        <input type="file" id="ef-receipt" accept="image/*">
        ${editing && editing.receiptImageId ? `<label class="checkbox-row receipt-remove"><input type="checkbox" id="ef-remove-receipt">領収書を削除</label>` : ''}
      </div>
      <div class="expense-form__actions"><button type="submit" class="btn btn--primary">${editing ? '更新' : ICONS.plus + '追加'}</button>${editing ? '<button type="button" class="btn" data-action="cancel-edit-expense">キャンセル</button>' : ''}</div>
      ${editingRecurring?'<div class="field__hint recurring-edit-note">この月の金額・メモだけ変更できます。日付とカテゴリは定期経費の設定から管理します。</div>':''}
    </form>
    <button type="button" class="text-link expense-guide-link" data-action="go-expense-guide">何が経費になる？</button>

    <div class="chip-filter">
      ${categories.map((c) => `<button type="button" class="chip ${expenseCategoryFilter === c ? 'is-active' : ''}" data-action="filter-expense-category" data-category="${escapeHtml(c)}">${c === '__all__' ? 'すべて' : escapeHtml(c)}</button>`).join('')}
    </div>

    <div class="selection-toolbar"><button type="button" class="btn btn--sm ${expenseSelectionMode?'is-active':''}" data-action="toggle-expense-select-mode">${expenseSelectionMode?'選択を終了':'選択'}</button>${expenseSelectionMode?`<span>${selectedExpenseIds.size}件選択中</span>`:''}</div>
    ${expenseSelectionMode&&selectedExpenseIds.size?`<div class="bulk-action-bar"><strong>${selectedExpenseIds.size}件を一括変更</strong><div><select class="select bulk-category-select" id="bulkExpenseCategory">${EXPENSE_CATEGORIES.map((category)=>`<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('')}${extraCats.map((category)=>`<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('')}</select><button type="button" class="btn btn--sm" data-action="bulk-expense-category">カテゴリを変更</button><button type="button" class="btn btn--sm btn--danger" data-action="bulk-delete-expenses">削除</button></div></div>`:''}

    ${sorted.length === 0 ? compactEmptyHtml('receipt','経費の記録がありません。') : `
    <div class="table-wrap"><table class="data-table">
      <thead><tr>${expenseSelectionMode?'<th class="bulk-check-cell">選択</th>':''}<th>経費</th><th class="num-cell">金額</th><th>領収書</th><th></th></tr></thead>
      <tbody>
      ${sorted.map((e) => `<tr>
        ${expenseSelectionMode?`<td class="bulk-check-cell"><input class="bulk-check" type="checkbox" data-action="toggle-expense-selection" data-expense-id="${escapeHtml(e.id)}" ${selectedExpenseIds.has(e.id)?'checked':''} ${e.autoProjectId||e.autoRecurringId?'disabled':''} aria-label="${escapeHtml((e.memo||'').trim()||e.category)}を選択"></td>`:''}
        <td><strong class="expense-name">${escapeHtml((e.memo||'').trim() || e.category)}</strong><small class="expense-meta">${formatJPSlash(e.date)} ・ ${escapeHtml(e.category)}</small>${e.autoProjectId ? '<span class="badge badge--auto">自動</span>' : ''}${e.autoRecurringId ? '<span class="badge badge--recurring">定期</span>' : ''}</td>
        <td class="num-cell">${formatMoney(e.amount)}</td>
        <td>${e.receiptImageId ? `<img class="receipt-thumb" data-image-id="${e.receiptImageId}" data-action="view-image" data-image-view-id="${e.receiptImageId}" alt="領収書">` : ''}</td>
        <td>${e.autoProjectId ? '<span class="auto-expense-note">案件側で自動管理されています</span>' : e.autoRecurringId ? `<div class="row-actions recurring-expense-actions"><button type="button" class="btn btn--sm" data-action="edit-expense" data-expense-id="${e.id}">この月を編集</button><span class="auto-expense-note">定期経費から自動生成</span></div>` : `<div class="row-actions"><button type="button" class="btn btn--sm" data-action="edit-expense" data-expense-id="${e.id}">編集</button><button type="button" class="icon-btn btn--sm" data-action="delete-expense" data-expense-id="${e.id}">${ICONS.trash}</button></div>`}</td>
      </tr>`).join('')}
      </tbody>
    </table></div>
    `}
  `;
}

function openQuickExpenseModal() {
  editingExpenseId=null;
  const overlay=openModal(`<div class="modal__header"><h2 class="modal__title">経費を追加</h2><button type="button" class="icon-btn" data-action="close-modal">${ICONS.close}</button></div><div class="modal__body"><form id="expenseForm" class="expense-form expense-form--modal"><div class="field"><label class="field__label">日付</label><input class="input" type="date" id="ef-date" value="${todayStr()}" required></div><div class="field"><label class="field__label">カテゴリ</label><select class="select" id="ef-category">${EXPENSE_CATEGORIES.map((category)=>`<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('')}<option value="__custom__">自由入力…</option></select><input class="input" id="ef-category-custom" placeholder="カテゴリ名" style="display:none;margin-top:8px"></div><div class="field"><label class="field__label">金額（円）</label><input class="input" type="text" inputmode="numeric" data-money-input id="ef-amount" required placeholder="例: 3,000"></div><div class="field"><label class="field__label">メモ</label><input class="input" id="ef-memo" placeholder="任意"></div><div class="field"><label class="field__label">領収書</label><input type="file" id="ef-receipt" accept="image/*"></div><div class="expense-form__actions"><button type="submit" class="btn btn--primary">${ICONS.plus}追加</button></div></form></div>`,{narrow:true});
  wireExpenseForm(overlay,{closeOnSave:true});
}

function wireExpenseForm(root,options) {
  options=options||{};
  const catSel = $('#ef-category', root);
  if (!catSel) return;
  const catCustom = $('#ef-category-custom', root);
  wireMoneyInputs(root);
  catSel.addEventListener('change', () => {
    catCustom.style.display = catSel.value === '__custom__' ? '' : 'none';
  });
  $('#expenseForm', root).addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = $('#ef-date', root).value;
    const category = catSel.value === '__custom__' ? catCustom.value.trim() : catSel.value;
    const amount = parseMoneyInput($('#ef-amount', root).value);
    const memo = $('#ef-memo', root).value.trim();
    const fileInput = $('#ef-receipt', root);
    if (!date) { showToast('日付を入力してください', 'error'); return; }
    if (!category) { showToast('カテゴリを入力してください', 'error'); return; }
    if (isNaN(amount) || amount < 0) { showToast('金額を正しく入力してください', 'error'); return; }
    const editing = state.expenses.find((item) => item.id === editingExpenseId);
    let receiptImageId = editing ? editing.receiptImageId : null;
    if (editing && $('#ef-remove-receipt', root) && $('#ef-remove-receipt', root).checked && receiptImageId) { imageDelete(receiptImageId); receiptImageId = null; }
    const file = fileInput.files && fileInput.files[0];
    if (file) {
      try { if (receiptImageId) imageDelete(receiptImageId); receiptImageId = await imageSave(file); } catch (err) { console.error(err); showToast('領収書画像の保存に失敗しました', 'error'); }
    }
    if (editing) Object.assign(editing, { date, category, amount, memo, receiptImageId, updatedAt: new Date().toISOString() });
    else state.expenses.push({ id: uuid(), date, category, amount, memo, receiptImageId, createdAt: new Date().toISOString() });
    editingExpenseId = null;
    saveState();
    if(options.closeOnSave){moneySubTab='expenses';moneyYear=parseDateStr(date).getFullYear();closeModal();}
    renderCurrentTab();
    showToast(editing ? '経費を更新しました' : '経費を追加しました');
  });
}

function exportExpensesCsv(year) {
  const all = state.expenses.filter((e) => e.date && parseDateStr(e.date).getFullYear() === year).sort((a, b) => diffDays(a.date, b.date));
  const rows = [['日付', 'カテゴリ', '金額', 'メモ']];
  all.forEach((e) => rows.push([formatJPSlash(e.date), e.category, e.amount, e.memo || '']));
  downloadCsv(`経費一覧_${year}.csv`, rows);
}

function summaryHtml(year) {
  const projects = projectsDeliveredInYear(year);
  const revenueTotal = projects.reduce((s, p) => s + (p.fee || 0), 0);
  const withholdingTotal = projects.reduce((s, p) => s + withholdingAmount(p), 0);
  const expenses = state.expenses.filter((e) => e.date && parseDateStr(e.date).getFullYear() === year);
  const expenseTotal = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const diff = revenueTotal - expenseTotal;

  const byCategory = {};
  expenses.forEach((e) => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
  const maxCat = Math.max(1, ...Object.values(byCategory));
  const catRows = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => `
    <div class="summary-bar-row">
      <div class="summary-bar-row__label">${escapeHtml(cat)}</div>
      <div class="summary-bar-row__track"><div class="summary-bar-row__fill" style="width:${(amt / maxCat * 100).toFixed(1)}%"></div></div>
      <div class="summary-bar-row__value">${formatMoney(amt)}</div>
    </div>`).join('');

  const months = Array.from({ length: 12 }, (_, i) => i);
  const monthlyRevenue = months.map((m) => projects.filter((p) => parseDateStr(p.deliveredDate).getMonth() === m).reduce((s, p) => s + (p.fee || 0), 0));
  const monthlyExpense = months.map((m) => expenses.filter((e) => parseDateStr(e.date).getMonth() === m).reduce((s, e) => s + (e.amount || 0), 0));

  return `
  <div class="money-summary tax-summary" style="margin-bottom:12px;">
    <div class="summary-tile"><div class="summary-tile__label">売上合計</div><div class="summary-tile__value">${formatMoney(revenueTotal)}</div></div>
    <div class="summary-tile"><div class="summary-tile__label">経費合計</div><div class="summary-tile__value">${formatMoney(expenseTotal)}</div></div>
    <div class="summary-tile"><div class="summary-tile__label">源泉徴収合計</div><div class="summary-tile__value">${formatMoney(withholdingTotal)}</div></div>
    <div class="summary-tile"><div class="summary-tile__label">差引所得（売上 − 経費）</div><div class="summary-tile__value">${formatMoney(diff)}</div></div>
  </div>
  <p class="tax-note">源泉徴収された金額は、確定申告で戻ってくる可能性があります。</p>
  <h2 class="section-title money-section-title">${ICONS.chart}<span>月別 売上・経費</span></h2>
  <div class="table-wrap"><table class="data-table">
    <thead><tr><th>月</th><th class="num-cell">売上</th><th class="num-cell">経費</th></tr></thead>
    <tbody>
    ${months.map((m) => `<tr><td>${m + 1}月</td><td class="num-cell">${formatMoney(monthlyRevenue[m])}</td><td class="num-cell">${formatMoney(monthlyExpense[m])}</td></tr>`).join('')}
    </tbody>
  </table></div>
  <div class="view-toolbar__actions tax-export-actions"><button type="button" class="btn btn--sm" data-action="export-ledger-csv" data-year="${year}">売上をCSV出力</button><button type="button" class="btn btn--sm" data-action="export-expenses-csv" data-year="${year}">経費をCSV出力</button></div>
  <section class="tax-guide">
    <h2 class="section-title money-section-title">${ICONS.listCheck}<span>確定申告ガイド</span></h2>
    <details class="guide-accordion"><summary>確定申告のきほんの流れ</summary><div><ol><li>日々の帳簿づけ。このアプリの売上・経費記録がそのまま使えます。</li><li>1〜3月に前年分の書類を作成します。</li><li>原則3月15日までに提出・納税します。</li></ol><p><strong>売上は入金日ではなく納品日で計上</strong>します（発生主義）。</p></div></details>
    <details class="guide-accordion" id="expenseGuide"><summary>何が経費になる？</summary><div><ul><li>画材・印刷用紙など：消耗品費</li><li>制作ソフト・クラウドサービス・サブスク：通信費または消耗品費</li><li>書籍・ポーズ資料：資料・書籍費</li><li>パソコン・液晶タブレット・カメラなどの機材：消耗品費（高額品は減価償却の場合あり）</li><li>取材やクライアントとの打ち合わせ費：取材費・交際費</li><li>インターネット・スマートフォン：通信費</li><li>外注やアシスタントへの支払い：外注費</li><li>移動交通費：旅費交通費</li></ul><h3>家事按分</h3><p>自宅で仕事をしている場合、家賃・電気代・通信費は「仕事で使っている割合」だけ経費にできます。たとえば家賃10万円で、自宅の1/4を仕事部屋として使う場合は、月2.5万円を経費として計上します。</p></div></details>
    <details class="guide-accordion"><summary>注意すること</summary><div><ul><li>源泉徴収された分は、申告で還付される場合があります。</li><li>青色申告は最大65万円の控除があります。事前に開業届と青色申告承認申請書の提出が必要です。</li><li>領収書や帳簿は原則7年間保存しましょう。</li></ul></div></details>
    <button type="button" class="btn expense-guide-back" data-action="back-to-expenses">‹ 経費に戻る</button>
  </section>
  <section class="official-links"><h2 class="section-title money-section-title">${ICONS.sectionFolder}<span>公式リンク集</span></h2><a href="https://www.nta.go.jp/taxes/shiraberu/shinkoku/tokushu/index.htm" target="_blank" rel="noopener">国税庁 確定申告特集 <span aria-hidden="true">↗</span></a><a href="https://www.keisan.nta.go.jp/" target="_blank" rel="noopener">確定申告書等作成コーナー（e-Tax） <span aria-hidden="true">↗</span></a><a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2210.htm" target="_blank" rel="noopener">タックスアンサー No.2210 やさしい必要経費の知識 <span aria-hidden="true">↗</span></a></section>
  <p class="tax-disclaimer">本アプリの情報は一般的な参考情報です。個別の税務判断は税務署や税理士にご確認ください。</p>
  `;
}

/* ===================== 見積書 ===================== */
const QUOTE_STATUS_LABEL={draft:'下書き',sent:'送付済み',accepted:'成約'};
const UNIT_OPTIONS=['式','点','件','枚','体','カット','ページ','時間','日','か月','部','セット'];
function unitDatalistHtml(){return `<datalist id="unit-options">${UNIT_OPTIONS.map((unit)=>`<option value="${unit}"></option>`).join('')}</datalist>`;}
function quotesListHtml(year) {
  const quotes=state.quotes.filter((q)=>q.issueDate&&parseDateStr(q.issueDate).getFullYear()===year).sort((a,b)=>diffDays(b.issueDate,a.issueDate));
  return `<div class="invoice-toolbar"><button type="button" class="text-link" data-action="open-price-list-settings">単価表を編集</button><div class="invoice-toolbar__actions"><button type="button" class="btn" data-action="open-easy-estimate">かんたん見積もり</button><button type="button" class="btn btn--primary" data-action="new-quote">${ICONS.plus}新規作成</button></div></div>${quotes.length?`<div class="invoice-grid quote-grid">${quotes.map((q)=>`<article class="invoice-card" data-action="open-quote" data-quote-id="${escapeHtml(q.id)}"><div class="invoice-miniature"><div class="invoice-miniature__page">${quotePreviewInnerHtml(q)}</div></div><div class="invoice-card__info"><div class="invoice-card__line"><strong>${escapeHtml(q.number)}</strong><span class="badge quote-status--${q.status}">${QUOTE_STATUS_LABEL[q.status]||'下書き'}</span></div><div>${escapeHtml(q.clientName)}${escapeHtml(q.honorific||'')}</div><div class="invoice-card__line"><strong>${formatMoney(quoteTotal(q))}</strong><button type="button" class="icon-btn btn--sm" data-action="delete-quote" data-quote-id="${escapeHtml(q.id)}">${ICONS.trash}</button></div></div></article>`).join('')}</div>`:compactEmptyHtml('invoice','この年の見積書はまだありません。')}`;
}
function newQuoteDraft() { const year=new Date().getFullYear();return {id:uuid(),number:nextQuoteNumber(year),issueDate:todayStr(),validUntil:addDays(todayStr(),14),clientId:'',clientName:'',honorific:'御中',subject:'',items:[],rushEnabled:false,rushRate:(state.settings.priceList.find((p)=>p.type==='rate')||{rate:.3}).rate||.3,taxRate:0,notes:'本見積の有効期限は発行日より14日間です。',status:'draft',issuerSnapshot:null,createdAt:new Date().toISOString()}; }
function openEasyEstimateModal() {
  const basics=state.settings.priceList.filter((item)=>item.category==='基本料金'&&item.type!=='rate'),options=state.settings.priceList.filter((item)=>item.category==='オプション'&&item.type!=='rate'),rateItem=state.settings.priceList.find((item)=>item.type==='rate');
  if(!basics.length){showToast('単価表に「基本料金」の項目を追加してください','error');return;}
  const draft={characters:[{priceId:basics[0].id,qty:1}],options:options.map((item)=>({priceId:item.id,enabled:false,qty:1})),rushEnabled:false,rushRate:Math.max(0,Number(rateItem&&rateItem.rate)||.3),taxRate:0},stats=projectRevenueStats(state.projects);
  const overlay=openModal(`<div class="modal__header"><h2 class="modal__title">かんたん見積もり</h2><button type="button" class="icon-btn" data-action="close-modal">${ICONS.close}</button></div><div class="modal__body easy-estimate"><section class="easy-estimate__section"><div class="field-label-line"><h3>キャラクター</h3><button type="button" class="btn btn--sm" data-action="easy-add-character">＋キャラ追加</button></div><div id="easy-character-rows"></div></section><section class="easy-estimate__section"><h3>オプション</h3><div>${options.length?options.map((item,idx)=>`<div class="easy-option-row" data-option-idx="${idx}"><label class="checkbox-row"><input type="checkbox" data-field="enabled"><span>${escapeHtml(item.name)} <strong>${formatMoney(item.price)}</strong></span></label><label>数量 <input class="input easy-qty" type="number" min="1" value="1" data-field="qty" disabled></label></div>`).join(''):'<p class="field__hint">単価表に「オプション」の項目がありません。</p>'}</div></section><section class="easy-estimate__section easy-estimate__settings"><label class="checkbox-row"><input type="checkbox" id="easy-rush">特急対応（+<input class="rate-inline" id="easy-rush-rate" type="number" min="0" value="${Math.round(draft.rushRate*100)}">%）</label><div class="radio-row"><span>消費税</span><label><input type="radio" name="easy-tax" value="0" checked>なし</label><label><input type="radio" name="easy-tax" value="0.1">10%</label></div></section><section class="easy-estimate__result" id="easy-result"></section><aside class="easy-estimate__history"><h3>参考: 過去の実績</h3>${stats?`<div><span>${stats.count}件</span><span>平均 ${formatMoney(stats.average)}</span><span>最低〜最高 ${formatMoney(stats.min)}〜${formatMoney(stats.max)}</span></div>`:'<p>まだ実績データがありません</p>'}</aside></div><div class="modal__footer"><button type="button" class="btn" data-action="close-modal">キャンセル</button><div class="easy-estimate__footer-actions"><button type="button" class="btn" data-action="easy-copy-text">テキストをコピー</button><button type="button" class="btn btn--primary" data-action="easy-create-quote">この内容で見積書を作成</button></div></div>`,{wide:true});
  const buildItems=()=>{const items=[];draft.characters.forEach((row)=>{const item=state.settings.priceList.find((entry)=>entry.id===row.priceId);if(item)items.push({priceId:item.id,name:item.name,qty:row.qty,unit:'人',unitPrice:item.price});});draft.options.filter((row)=>row.enabled).forEach((row)=>{const item=state.settings.priceList.find((entry)=>entry.id===row.priceId);if(item)items.push({priceId:item.id,name:item.name,qty:row.qty,unit:'式',unitPrice:item.price});});return items;};
  const update=()=>{const result=calculateEasyEstimate(buildItems(),draft.rushEnabled,draft.rushRate,draft.taxRate);$('#easy-result',overlay).innerHTML=`<h3>内訳</h3><div class="easy-breakdown">${result.items.map((item)=>`<div><span>${escapeHtml(item.name)} × ${item.qty} × ${formatMoney(item.unitPrice)}</span><strong>${formatMoney(item.qty*item.unitPrice)}</strong></div>`).join('')}</div><div class="easy-totals"><div><span>小計</span><strong>${formatMoney(result.subtotal)}</strong></div><div><span>特急</span><strong>${formatMoney(result.rush)}</strong></div><div><span>消費税</span><strong>${formatMoney(result.tax)}</strong></div><div class="grand"><span>合計</span><strong>${formatMoney(result.total)}</strong></div></div>`;return result;};
  const renderCharacters=()=>{const box=$('#easy-character-rows',overlay),choices=basics.map((item)=>`<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)} ${formatMoney(item.price)}</option>`).join('');box.innerHTML=draft.characters.map((row,idx)=>`<div class="easy-character-row" data-character-idx="${idx}"><select class="select" data-field="priceId">${choices}</select><label>人数 <input class="input easy-qty" type="number" min="1" value="${row.qty}" data-field="qty"></label><button type="button" class="icon-btn" data-action="easy-remove-character" data-character-idx="${idx}" aria-label="キャラクター行を削除" ${draft.characters.length===1?'disabled':''}>${ICONS.trash}</button></div>`).join('');draft.characters.forEach((row,idx)=>{$(`[data-character-idx="${idx}"] [data-field="priceId"]`,box).value=row.priceId;});};
  overlay.addEventListener('input',(event)=>{const row=event.target.closest('[data-character-idx]');if(row&&event.target.dataset.field){const item=draft.characters[Number(row.dataset.characterIdx)],field=event.target.dataset.field;item[field]=field==='qty'?Math.max(1,Number(event.target.value)||1):event.target.value;update();}if(event.target.id==='easy-rush-rate'){draft.rushRate=Math.max(0,Number(event.target.value)||0)/100;update();}const option=event.target.closest('[data-option-idx]');if(option&&event.target.dataset.field==='qty'){draft.options[Number(option.dataset.optionIdx)].qty=Math.max(1,Number(event.target.value)||1);update();}});
  overlay.addEventListener('change',(event)=>{const character=event.target.closest('[data-character-idx]');if(character&&event.target.dataset.field==='priceId'){draft.characters[Number(character.dataset.characterIdx)].priceId=event.target.value;update();}if(event.target.id==='easy-rush'){draft.rushEnabled=event.target.checked;update();}if(event.target.name==='easy-tax'){draft.taxRate=Number(event.target.value);update();}const option=event.target.closest('[data-option-idx]');if(option&&event.target.dataset.field==='enabled'){const item=draft.options[Number(option.dataset.optionIdx)];item.enabled=event.target.checked;$('[data-field="qty"]',option).disabled=!item.enabled;update();}});
  overlay.addEventListener('click',async(event)=>{const button=event.target.closest('[data-action]');if(!button)return;if(button.dataset.action==='easy-add-character'){draft.characters.push({priceId:basics[0].id,qty:1});renderCharacters();update();}else if(button.dataset.action==='easy-remove-character'&&draft.characters.length>1){draft.characters.splice(Number(button.dataset.characterIdx),1);renderCharacters();update();}else if(button.dataset.action==='easy-copy-text'){const result=update();if(!result.items.length){showToast('明細がありません','error');return;}if(await copyTextToClipboard(easyEstimateText(result,draft.rushEnabled,draft.rushRate,draft.taxRate)))showToast('コピーしました');else showToast('コピーできませんでした','error');}else if(button.dataset.action==='easy-create-quote'){const result=update(),quote=newQuoteDraft();Object.assign(quote,{items:result.items,rushEnabled:draft.rushEnabled,rushRate:draft.rushRate,taxRate:draft.taxRate});closeModal();openQuoteFormModal(null,quote);}});
  renderCharacters();update();
}
function quoteItemRowHtml(item,idx) { return `<div class="invoice-item-row quote-item-row" data-idx="${idx}"><label class="invoice-item-field invoice-item-field--name"><span>品目</span><input class="input input--name" data-field="name" value="${escapeHtml(item.name)}" placeholder="品目"></label><label class="invoice-item-field invoice-item-field--qty"><span>数量</span><input class="input input--qty" type="number" min="1" data-field="qty" value="${Number(item.qty)||1}"></label><label class="invoice-item-field invoice-item-field--unit"><span>単位</span><input class="input input--unit" list="unit-options" data-field="unit" value="${escapeHtml(item.unit||'式')}"></label><label class="invoice-item-field invoice-item-field--price"><span>単価</span><span class="currency-input"><i>¥</i><input class="input input--price" type="text" inputmode="numeric" data-money-input data-field="unitPrice" value="${Number(item.unitPrice)||0}"></span></label><div class="invoice-item-row__amount"><span>金額</span><strong>${formatMoney((Number(item.qty)||0)*(Number(item.unitPrice)||0))}</strong></div><button type="button" class="icon-btn btn--sm invoice-item-remove" data-action="remove-quote-item" data-idx="${idx}">${ICONS.trash}</button></div>`; }
function quoteFormHtml(q) {
  const categories=Array.from(new Set(state.settings.priceList.filter((p)=>p.type!=='rate').map((p)=>p.category)));
  const clientOptions=state.clients.map((c)=>`<option value="${escapeHtml(c.id)}" ${q.clientId===c.id?'selected':''}>${escapeHtml(c.name)}</option>`).join('');
  return `<div class="modal__header"><h2 class="modal__title">見積書 ${escapeHtml(q.number)}</h2><button type="button" class="icon-btn" data-action="close-modal">${ICONS.close}</button></div><div class="modal__body"><div class="field-row"><div class="field"><label class="field__label">番号</label><input class="input" id="qf-number" value="${escapeHtml(q.number)}"></div><div class="field"><label class="field__label">発行日</label><input class="input" type="date" id="qf-issue" value="${escapeHtml(q.issueDate)}"></div><div class="field"><label class="field__label">有効期限</label><input class="input" type="date" id="qf-valid" value="${escapeHtml(q.validUntil)}"></div></div><div class="field-row"><div class="field"><label class="field__label">クライアント</label><select class="select" id="qf-client"><option value="">直接入力</option>${clientOptions}<option value="__new__">＋新規クライアント</option></select><input class="input" id="qf-client-name" value="${escapeHtml(q.clientName)}" placeholder="宛先名" style="margin-top:8px"></div><div class="field"><label class="field__label">敬称</label><select class="select" id="qf-honorific"><option ${q.honorific==='御中'?'selected':''}>御中</option><option ${q.honorific==='様'?'selected':''}>様</option></select></div><div class="field"><label class="field__label">件名</label><input class="input" id="qf-subject" value="${escapeHtml(q.subject)}"></div></div><div class="quote-price-picker"><div class="quote-price-picker__head"><h3>単価表から追加</h3><button type="button" class="text-link" data-action="open-price-list-settings">単価表を編集</button></div>${categories.map((cat)=>`<section><h4>${escapeHtml(cat)}</h4><div>${state.settings.priceList.filter((p)=>p.type!=='rate'&&p.category===cat).map((p)=>`<button type="button" class="price-pick-btn" data-action="pick-price-item" data-price-id="${escapeHtml(p.id)}"><span>${escapeHtml(p.name)}</span><strong>${formatMoney(p.price)}</strong></button>`).join('')}</div></section>`).join('')}</div><div class="field"><div class="field-label-line"><label class="field__label">明細</label><button type="button" class="btn btn--sm" data-action="add-free-quote-item">自由入力行を追加</button></div><div id="qf-items" class="invoice-items-editor">${q.items.map(quoteItemRowHtml).join('')}</div></div><div class="quote-options"><label class="checkbox-row"><input type="checkbox" id="qf-rush" ${q.rushEnabled?'checked':''}>特急対応（+<input class="rate-inline" id="qf-rush-rate" type="number" min="0" value="${Math.round((q.rushRate||.3)*100)}">%）</label><div class="radio-row"><span>消費税</span><label><input type="radio" name="qf-tax" value="0" ${!q.taxRate?'checked':''}>なし</label><label><input type="radio" name="qf-tax" value="0.1" ${q.taxRate===.1?'checked':''}>10%</label></div></div><div class="field"><label class="field__label">メモ・備考</label><textarea class="textarea" id="qf-notes">${escapeHtml(q.notes)}</textarea></div><div class="quote-live-total" id="qf-total"></div></div><div class="modal__footer"><button type="button" class="btn" data-action="close-modal">キャンセル</button><button type="button" class="btn btn--primary" id="qf-save">保存してプレビュー</button></div>`;
}
function openQuoteFormModal(id,prefill) { const original=id?state.quotes.find((q)=>q.id===id):(prefill||newQuoteDraft());if(!original)return;const isNew=!id;const overlay=openModal(quoteFormHtml(original),{wide:true});overlay.insertAdjacentHTML('beforeend',unitDatalistHtml());wireQuoteForm(overlay,original,isNew); }
function wireQuoteForm(overlay,original,isNew) {
  const q=JSON.parse(JSON.stringify(original));
  const renderItems=()=>{const box=$('#qf-items',overlay);box.innerHTML=q.items.map(quoteItemRowHtml).join('');wireMoneyInputs(box);$all('.quote-item-row',box).forEach((row)=>{$all('[data-field]',row).forEach((input)=>input.addEventListener('input',()=>{const field=input.dataset.field;const item=q.items[Number(row.dataset.idx)];item[field]=field==='name'||field==='unit'?input.value:field==='unitPrice'?parseMoneyInput(input.value):Number(input.value);$('.invoice-item-row__amount strong',row).textContent=formatMoney((Number(item.qty)||0)*(Number(item.unitPrice)||0));updateTotal();}));});};
  const updateTotal=()=>{$('#qf-total',overlay).innerHTML=`<span>小計 ${formatMoney(quoteSubtotal(q))}</span><span>特急 ${formatMoney(quoteRush(q))}</span><span>消費税 ${formatMoney(quoteTax(q))}</span><strong>合計 ${formatMoney(quoteTotal(q))}</strong>`;};
  $('#qf-client',overlay).addEventListener('change',(e)=>{if(e.target.value&&e.target.value!=='__new__'){const c=getClientById(e.target.value);q.clientId=c.id;q.clientName=c.name;$('#qf-client-name',overlay).value=c.name;}else q.clientId='';});
  [['qf-number','number'],['qf-issue','issueDate'],['qf-valid','validUntil'],['qf-client-name','clientName'],['qf-honorific','honorific'],['qf-subject','subject'],['qf-notes','notes']].forEach(([id,key])=>$('#'+id,overlay).addEventListener('input',(e)=>q[key]=e.target.value));
  $('#qf-rush',overlay).addEventListener('change',(e)=>{q.rushEnabled=e.target.checked;updateTotal();});$('#qf-rush-rate',overlay).addEventListener('input',(e)=>{q.rushRate=Math.max(0,Number(e.target.value)||0)/100;updateTotal();});$all('[name="qf-tax"]',overlay).forEach((r)=>r.addEventListener('change',(e)=>{if(e.target.checked){q.taxRate=Number(e.target.value);updateTotal();}}));
  overlay.addEventListener('click',(e)=>{const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;if(a==='pick-price-item'){const p=state.settings.priceList.find((x)=>x.id===b.dataset.priceId);if(p){const existing=q.items.find((x)=>x.priceId===p.id);if(existing)existing.qty+=1;else q.items.push({priceId:p.id,name:p.name,qty:1,unit:'式',unitPrice:p.price});renderItems();updateTotal();}}else if(a==='add-free-quote-item'){q.items.push({name:'',qty:1,unit:'式',unitPrice:0});renderItems();updateTotal();}else if(a==='remove-quote-item'){q.items.splice(Number(b.dataset.idx),1);renderItems();updateTotal();}});
  $('#qf-save',overlay).addEventListener('click',()=>{if(!q.number.trim()||!q.clientName.trim()||!q.issueDate){showToast('番号・宛先・発行日を入力してください','error');return;}if(!q.items.length){showToast('明細を追加してください','error');return;}if($('#qf-client',overlay).value==='__new__'){const client={id:uuid(),name:q.clientName.trim(),templateOverride:null};state.clients.push(client);q.clientId=client.id;}if(isNew)state.quotes.push(q);else state.quotes[state.quotes.findIndex((x)=>x.id===q.id)]=q;saveState();renderMoneyTab();openQuotePreviewModal(q.id);showToast('見積書を保存しました');});
  renderItems();updateTotal();
}
function quotePreviewInnerHtml(q) {
  const issuer=issuerForDocument(q); const rush=quoteRush(q); const total=quoteTotal(q);
  return `<div class="invoice-preview quote-preview"><div class="invoice-preview__title">お見積書</div><div class="invoice-preview__meta">見積番号: ${escapeHtml(q.number)}　発行日: ${formatJPSlash(q.issueDate)}</div><div class="invoice-preview__top"><div class="invoice-preview__to">${escapeHtml(q.clientName)} ${escapeHtml(q.honorific||'')}</div><div class="invoice-preview__issuer">${escapeHtml(issuer.name||'')}<br>${escapeHtml(issuer.address||'')}<br>${issuer.tel?'TEL: '+escapeHtml(issuer.tel)+'<br>':''}${issuer.email?escapeHtml(issuer.email):''}</div></div><div class="invoice-preview__subject">件名: ${escapeHtml(q.subject||'')}　有効期限: ${formatJPSlash(q.validUntil)}</div><div class="invoice-preview__total-box"><span class="invoice-preview__total-label">お見積金額（税込）</span><span class="invoice-preview__total-value">${formatMoney(total)}</span></div><table class="invoice-table"><thead><tr><th>品目</th><th style="width:60px">数量</th><th style="width:65px">単位</th><th style="width:105px">単価</th><th style="width:115px">金額</th></tr></thead><tbody>${q.items.map((it)=>`<tr><td>${escapeHtml(it.name)}</td><td class="num">${Number(it.qty)||0}</td><td>${escapeHtml(it.unit||'式')}</td><td class="num">${formatMoney(it.unitPrice)}</td><td class="num">${formatMoney((Number(it.qty)||0)*(Number(it.unitPrice)||0))}</td></tr>`).join('')}${rush?`<tr><td>特急対応（+${Math.round(q.rushRate*100)}%）</td><td class="num">1</td><td>式</td><td class="num">${formatMoney(rush)}</td><td class="num">${formatMoney(rush)}</td></tr>`:''}</tbody></table><div class="invoice-preview__totals"><div class="invoice-preview__totals-row"><span>小計</span><span>${formatMoney(quoteSubtotal(q))}</span></div>${rush?`<div class="invoice-preview__totals-row"><span>特急対応</span><span>${formatMoney(rush)}</span></div>`:''}<div class="invoice-preview__totals-row"><span>消費税${q.taxRate?'（10%）':''}</span><span>${formatMoney(quoteTax(q))}</span></div><div class="invoice-preview__totals-row grand"><span>合計</span><span>${formatMoney(total)}</span></div></div><div class="invoice-preview__bottom"><div class="invoice-preview__notes"><h4>備考</h4>${escapeHtml(q.notes||'本見積の有効期限は発行日より14日間です。').replace(/\n/g,'<br>')}</div></div></div>`;
}
function openQuotePreviewModal(id) { const q=state.quotes.find((x)=>x.id===id);if(!q)return;const safeId=escapeHtml(q.id);const overlay=openModal(`<div class="modal__header"><h2 class="modal__title">見積書プレビュー</h2><button type="button" class="icon-btn" data-action="close-modal">${ICONS.close}</button></div><div class="modal__body"><div class="invoice-toolbar"><div><button type="button" class="btn btn--sm" data-action="edit-quote" data-quote-id="${safeId}">編集</button><button type="button" class="btn btn--sm" data-action="print-invoice">印刷 / PDF保存</button><button type="button" class="btn btn--sm" data-action="save-quote-jpg" data-quote-id="${safeId}">JPGで保存</button>${canShareFiles()?`<button type="button" class="btn btn--sm" data-action="share-quote-jpg" data-quote-id="${safeId}">共有</button>`:''}<button type="button" class="btn btn--sm" data-action="export-quote-csv" data-quote-id="${safeId}">CSV</button><button type="button" class="btn btn--sm" data-action="convert-quote-invoice" data-quote-id="${safeId}">この見積から請求書を作成</button><select class="select quote-status-select" data-quote-id="${safeId}">${Object.entries(QUOTE_STATUS_LABEL).map(([value,label])=>`<option value="${value}" ${q.status===value?'selected':''}>${label}</option>`).join('')}</select></div></div><div class="invoice-preview-wrap a4-fit-preview">${quotePreviewInnerHtml(q)}</div></div>`,{wide:true});$('.quote-status-select',overlay).addEventListener('change',(e)=>{q.status=e.target.value;ensureQuoteIssuerSnapshot(q);saveState();renderMoneyTab();openQuotePreviewModal(q.id);});requestAnimationFrame(()=>fitA4Preview(overlay)); }
function deleteQuote(id){if(!confirm('この見積書を削除します。よろしいですか？'))return;state.quotes=state.quotes.filter((q)=>q.id!==id);saveState();closeModal();renderMoneyTab();}
function saveQuoteAsJpg(id,share){
  const q=state.quotes.find((x)=>x.id===id);if(!q)return;const W=1240,H=1754,margin=90;
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const c=canvas.getContext('2d');
  c.fillStyle='#fff';c.fillRect(0,0,W,H);c.fillStyle='#222';c.textAlign='center';c.font='700 42px sans-serif';c.fillText('お見積書',W/2,110);
  c.textAlign='right';c.font='14px sans-serif';c.fillText(`見積番号: ${q.number}　発行日: ${formatJPSlash(q.issueDate)}`,W-margin,160);
  c.textAlign='left';c.font='700 25px sans-serif';c.fillText(`${q.clientName} ${q.honorific||''}`,margin,240);c.font='14px sans-serif';c.fillText(`件名: ${q.subject||''}　有効期限: ${formatJPSlash(q.validUntil)}`,margin,300);
  c.strokeStyle='#222';c.lineWidth=2;c.strokeRect(margin,330,W-margin*2,70);c.font='700 18px sans-serif';c.fillText('お見積金額（税込）',margin+18,373);c.textAlign='right';c.font='700 30px sans-serif';c.fillText(formatMoney(quoteTotal(q)),W-margin-18,378);c.textAlign='left';
  let y=450;const columns=[margin,690,785,875,1010,W-margin];const line=(yy,height)=>{c.strokeRect(margin,yy,W-margin*2,height);columns.slice(1,-1).forEach((x)=>{c.beginPath();c.moveTo(x,yy);c.lineTo(x,yy+height);c.stroke();});};
  c.strokeStyle='#8A8A8A';c.lineWidth=1;line(y,36);c.font='700 14px sans-serif';['品目','数量','単位','単価','金額'].forEach((label,i)=>c.fillText(label,columns[i]+10,y+24));y+=36;c.font='14px sans-serif';
  const rows=q.items.map((it)=>({name:it.name,qty:it.qty,unit:it.unit||'式',price:it.unitPrice,amount:(Number(it.qty)||0)*(Number(it.unitPrice)||0)}));
  if(q.rushEnabled)rows.push({name:`特急対応（+${Math.round(q.rushRate*100)}%）`,qty:1,unit:'式',price:quoteRush(q),amount:quoteRush(q)});
  rows.forEach((it)=>{line(y,34);c.textAlign='left';c.fillText(String(it.name||''),columns[0]+10,y+22);c.textAlign='right';c.fillText(String(it.qty||0),columns[2]-10,y+22);c.textAlign='left';c.fillText(String(it.unit||'式'),columns[2]+10,y+22);c.textAlign='right';c.fillText(formatMoney(it.price),columns[4]-10,y+22);c.fillText(formatMoney(it.amount),columns[5]-10,y+22);y+=34;});
  y+=35;c.strokeStyle='#222';c.strokeRect(760,y-25,W-margin-760,55);c.font='700 18px sans-serif';c.textAlign='left';c.fillText('合計',780,y+10);c.textAlign='right';c.fillText(formatMoney(quoteTotal(q)),W-margin-15,y+10);y+=80;c.textAlign='left';c.font='14px sans-serif';wrapText(c,q.notes||'',margin,y,950,22);
  outputJpgCanvas(canvas,`見積書_${q.number}.jpg`,share);
}

function exportDocumentItemsCsv(kind,id){
  const isQuote=kind==='quote'; const doc=(isQuote?state.quotes:state.invoices).find((item)=>item.id===id);if(!doc)return;
  const rows=[['品目','数量','単位','単価','金額'],...(doc.items||[]).map((item)=>[item.name,Number(item.qty)||0,item.unit||'式',Number(item.unitPrice)||0,(Number(item.qty)||0)*(Number(item.unitPrice)||0)])];
  if(isQuote&&doc.rushEnabled)rows.push([`特急対応（+${Math.round(doc.rushRate*100)}%）`,1,'式',quoteRush(doc),quoteRush(doc)]);
  downloadCsv(`${isQuote?'見積書':'請求書'}_${doc.number}_明細.csv`,rows);
}

/* ===================== 請求書：一覧 ===================== */
function invoicesListHtml(year) {
  const invoices = state.invoices.filter((iv) => iv.issueDate && parseDateStr(iv.issueDate).getFullYear() === year).sort((a, b) => diffDays(b.issueDate, a.issueDate));
  return `
    <div class="invoice-toolbar">
      <div></div>
      <button type="button" class="btn btn--primary" data-action="new-invoice">${ICONS.plus}新規作成</button>
    </div>
    ${invoices.length === 0 ? compactEmptyHtml('invoice','この年の請求書はまだありません。') : `
    <div class="invoice-grid">${invoices.map((iv) => `<article class="invoice-card" data-action="open-invoice" data-invoice-id="${iv.id}" tabindex="0" role="button"><div class="invoice-miniature"><div class="invoice-miniature__page">${invoicePreviewInnerHtml(iv)}</div></div><div class="invoice-card__info"><div class="invoice-card__line"><strong>${escapeHtml(iv.number)}</strong><span class="badge badge--${iv.status === 'paid' ? 'paid' : 'billed'}">${iv.status === 'paid' ? '入金済み' : '発行済み'}</span></div><div>${escapeHtml(iv.clientName)}${escapeHtml(iv.honorific || '')}</div><div class="invoice-card__line"><strong>${formatMoney(invoiceTotal(iv))}</strong><button type="button" class="icon-btn btn--sm" data-action="delete-invoice" data-invoice-id="${iv.id}" aria-label="削除">${ICONS.trash}</button></div></div></article>`).join('')}</div>`}
  `;
}

/* ===================== 請求書：作成／編集フォーム ===================== */
function openInvoiceFormModal(opts) {
  opts = opts || {};
  let invoice;
  let isNew = false;
  if (opts.invoiceId) {
    invoice = state.invoices.find((iv) => iv.id === opts.invoiceId);
    if (!invoice) return;
  } else {
    isNew = true;
    const year = new Date().getFullYear();
    let clientName = '';
    let items = [{ name: '', qty: 1, unit: '式', unitPrice: 0 }];
    let subject = '';
    let hasWithholding = false;
    const projectId = opts.projectId || null;
    if (opts.prefill) {
      clientName=opts.prefill.clientName||''; items=(opts.prefill.items||[]).map((it)=>({name:it.name,qty:it.qty,unit:it.unit||'式',unitPrice:it.unitPrice})); subject=opts.prefill.subject||'';
    }
    if (projectId) {
      const p = state.projects.find((x) => x.id === projectId);
      if (p) {
        clientName = p.clientName || '';
        items = [{ name: p.title, qty: 1, unit: '式', unitPrice: p.fee || 0 }];
        subject = p.title;
        hasWithholding = !!p.hasWithholding;
      }
    }
    invoice = {
      id: uuid(), number: nextInvoiceNumber(year), projectId,
      issueDate: todayStr(), dueDate: '', clientName, honorific: '御中',
      subject, items, taxRate: DEFAULT_TAX_RATE, hasWithholding, notes: '',
      status: 'issued', issuerSnapshot:null, createdAt: new Date().toISOString(),
    };
  }
  const overlay = openModal(invoiceFormHtml(invoice, isNew), { wide: true });
  overlay.insertAdjacentHTML('beforeend',unitDatalistHtml());
  wireInvoiceForm(overlay, invoice, isNew);
}

function invoiceFormHtml(inv, isNew) {
  return `
  <div class="modal__header">
    <h2 class="modal__title">請求書 ${inv.number ? escapeHtml(inv.number) : ''}</h2>
    <button type="button" class="icon-btn" data-action="close-modal">${ICONS.close}</button>
  </div>
  <div class="modal__body">
    <div class="field-row">
      <div class="field"><label class="field__label">請求書番号</label><input class="input" id="if-number" value="${escapeHtml(inv.number)}"></div>
      <div class="field"><label class="field__label">発行日</label><input class="input" type="date" id="if-issue-date" value="${inv.issueDate || ''}"></div>
      <div class="field"><label class="field__label">支払期限</label><input class="input" type="date" id="if-due-date" value="${inv.dueDate || ''}"></div>
    </div>
    <div class="field-row">
      <div class="field">
        <label class="field__label">宛先</label>
        <div style="display:flex; gap:8px;">
          <input class="input" id="if-client-name" value="${escapeHtml(inv.clientName)}" placeholder="クライアント名" style="flex:1;">
          <select class="select" id="if-honorific" style="flex:0 0 90px;">
            <option value="御中" ${inv.honorific === '御中' ? 'selected' : ''}>御中</option>
            <option value="様" ${inv.honorific === '様' ? 'selected' : ''}>様</option>
          </select>
        </div>
      </div>
      <div class="field"><label class="field__label">件名</label><input class="input" id="if-subject" value="${escapeHtml(inv.subject || '')}"></div>
    </div>

    <div class="field">
      <label class="field__label">明細</label>
      <div class="invoice-items-editor" id="if-items">
        ${inv.items.map((it, idx) => invoiceItemRowHtml(it, idx)).join('')}
      </div>
      <button type="button" class="btn btn--sm" style="margin-top:8px;" data-action="add-invoice-item">${ICONS.plus}明細行を追加</button>
    </div>

    <div class="field-row">
      <div class="field">
        <label class="field__label">消費税</label>
        <div class="radio-row">
          <label><input type="radio" name="if-tax" value="0.1" ${inv.taxRate === 0.1 ? 'checked' : ''}> 10%</label>
          <label><input type="radio" name="if-tax" value="0" ${!inv.taxRate ? 'checked' : ''}> なし</label>
        </div>
      </div>
      <div class="field" style="display:flex; align-items:flex-end;">
        <div class="checkbox-row"><input type="checkbox" id="if-withholding" ${inv.hasWithholding ? 'checked' : ''}><label for="if-withholding">源泉徴収あり（10.21%控除）</label></div>
      </div>
    </div>

    <div class="field"><label class="field__label">備考</label><textarea class="textarea" id="if-notes">${escapeHtml(inv.notes || '')}</textarea></div>

    <div class="info-box" id="if-total-preview"></div>
  </div>
  <div class="modal__footer">
    <button type="button" class="btn" data-action="close-modal">キャンセル</button>
    <button class="btn btn--primary" id="if-save" type="button">保存してプレビュー</button>
  </div>`;
}

function invoiceItemRowHtml(it, idx) {
  const amount = (Number(it.qty) || 0) * (Number(it.unitPrice) || 0);
  return `
  <div class="invoice-item-row" data-idx="${idx}">
    <label class="invoice-item-field invoice-item-field--name"><span>品目</span><input class="input input--name" placeholder="品目" value="${escapeHtml(it.name)}" data-field="name"></label>
    <label class="invoice-item-field invoice-item-field--qty"><span>数量</span><input class="input input--qty" type="number" min="0" value="${it.qty}" data-field="qty"></label>
    <label class="invoice-item-field invoice-item-field--unit"><span>単位</span><input class="input input--unit" list="unit-options" value="${escapeHtml(it.unit||'式')}" data-field="unit"></label>
    <label class="invoice-item-field invoice-item-field--price"><span>単価</span><span class="currency-input"><i>¥</i><input class="input input--price" type="text" inputmode="numeric" data-money-input value="${it.unitPrice}" data-field="unitPrice"></span></label>
    <div class="invoice-item-row__amount"><span>金額</span><strong>${formatMoney(amount)}</strong></div>
    <button type="button" class="icon-btn btn--sm invoice-item-remove" data-action="remove-invoice-item" data-idx="${idx}">${ICONS.trash}</button>
  </div>`;
}

function wireInvoiceForm(overlay, invoiceOriginal, isNew) {
  const draft = JSON.parse(JSON.stringify(invoiceOriginal));

  function updateTotalsPreview() {
    const subtotal = invoiceSubtotal(draft);
    const tax = invoiceTax(draft);
    const wh = invoiceWithholding(draft);
    const total = invoiceTotal(draft);
    $('#if-total-preview', overlay).innerHTML =
      `小計 ${formatMoney(subtotal)}　消費税 ${formatMoney(tax)}　源泉徴収 -${formatMoney(wh)}　<strong>合計 ${formatMoney(total)}</strong>`;
  }

  function bindItemRows() {
    wireMoneyInputs(overlay);
    $all('.invoice-item-row', overlay).forEach((row) => {
      const idx = Number(row.dataset.idx);
      $all('input[data-field]', row).forEach((inp) => {
        inp.addEventListener('input', () => {
          const field = inp.dataset.field;
          draft.items[idx][field] = field === 'name' || field === 'unit' ? inp.value : field === 'unitPrice' ? parseMoneyInput(inp.value) : Number(inp.value);
          row.querySelector('.invoice-item-row__amount strong').textContent = formatMoney((Number(draft.items[idx].qty) || 0) * (Number(draft.items[idx].unitPrice) || 0));
          updateTotalsPreview();
        });
      });
    });
  }

  $('#if-number', overlay).addEventListener('input', (e) => { draft.number = e.target.value.trim(); });
  $('#if-issue-date', overlay).addEventListener('change', (e) => { draft.issueDate = e.target.value; });
  $('#if-due-date', overlay).addEventListener('change', (e) => { draft.dueDate = e.target.value; });
  $('#if-client-name', overlay).addEventListener('input', (e) => { draft.clientName = e.target.value; });
  $('#if-honorific', overlay).addEventListener('change', (e) => { draft.honorific = e.target.value; });
  $('#if-subject', overlay).addEventListener('input', (e) => { draft.subject = e.target.value; });
  $all('input[name="if-tax"]', overlay).forEach((r) => r.addEventListener('change', (e) => { if (e.target.checked) { draft.taxRate = Number(e.target.value); updateTotalsPreview(); } }));
  $('#if-withholding', overlay).addEventListener('change', (e) => { draft.hasWithholding = e.target.checked; updateTotalsPreview(); });
  $('#if-notes', overlay).addEventListener('input', (e) => { draft.notes = e.target.value; });

  bindItemRows();
  updateTotalsPreview();

  overlay.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-action="add-invoice-item"]');
    if (addBtn) {
      draft.items.push({ name: '', qty: 1, unit: '式', unitPrice: 0 });
      $('#if-items', overlay).innerHTML = draft.items.map((it, idx) => invoiceItemRowHtml(it, idx)).join('');
      bindItemRows();
      updateTotalsPreview();
      return;
    }
    const rmBtn = e.target.closest('[data-action="remove-invoice-item"]');
    if (rmBtn) {
      const idx = Number(rmBtn.dataset.idx);
      if (draft.items.length <= 1) { showToast('明細は1行以上必要です', 'error'); return; }
      draft.items.splice(idx, 1);
      $('#if-items', overlay).innerHTML = draft.items.map((it, idx2) => invoiceItemRowHtml(it, idx2)).join('');
      bindItemRows();
      updateTotalsPreview();
      return;
    }
    const saveBtn = e.target.closest('#if-save');
    if (saveBtn) {
      if (!draft.number.trim()) { showToast('請求書番号を入力してください', 'error'); return; }
      if (!draft.clientName.trim()) { showToast('宛先を入力してください', 'error'); return; }
      if (!draft.issueDate) { showToast('発行日を入力してください', 'error'); return; }
      if (!draft.items.length || draft.items.every((it) => !it.name.trim())) { showToast('明細を1行以上入力してください', 'error'); return; }
      ensureInvoiceIssuerSnapshot(draft);

      if (isNew) {
        state.invoices.push(draft);
      } else {
        const idx = state.invoices.findIndex((iv) => iv.id === draft.id);
        if (idx !== -1) state.invoices[idx] = draft;
      }
      if (draft.projectId) {
        const p = state.projects.find((x) => x.id === draft.projectId);
        if (p && p.paymentStatus === 'unbilled') p.paymentStatus = 'billed';
      }
      saveState();
      renderCurrentTab();
      openInvoicePreviewModal(draft.id);
      showToast('請求書を保存しました');
    }
  });
}

/* ===================== 請求書：プレビュー／印刷／JPG保存 ===================== */
function openInvoicePreviewModal(invoiceId) {
  const inv = state.invoices.find((iv) => iv.id === invoiceId);
  if (!inv) return;
  const overlay=openModal(invoicePreviewModalHtml(inv), { wide: true });
  requestAnimationFrame(()=>fitA4Preview(overlay));
}

function fitA4Preview(root) {
  const wrap=$('.a4-fit-preview',root); const page=wrap&&$('.invoice-preview',wrap); if(!wrap||!page)return;
  page.style.transform='none'; const naturalWidth=page.offsetWidth; const naturalHeight=page.offsetHeight;
  const available=Math.max(280,wrap.clientWidth-16); const scale=Math.min(1,available/naturalWidth);
  page.style.transform=`scale(${scale})`; page.style.transformOrigin='top left'; wrap.style.setProperty('--a4-scale',scale); wrap.style.height=`${naturalHeight*scale+16}px`;
}

function invoicePreviewModalHtml(inv) {
  return `
  <div class="modal__header">
    <h2 class="modal__title">請求書プレビュー</h2>
    <button type="button" class="icon-btn" data-action="close-modal">${ICONS.close}</button>
  </div>
  <div class="modal__body">
    <div class="invoice-toolbar">
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button type="button" class="btn btn--sm" data-action="edit-invoice" data-invoice-id="${inv.id}">編集</button>
        <button type="button" class="btn btn--sm" data-action="print-invoice">印刷 / PDF保存</button>
        <button type="button" class="btn btn--sm" data-action="save-invoice-jpg" data-invoice-id="${inv.id}">JPGで保存</button>
        ${canShareFiles()?`<button type="button" class="btn btn--sm" data-action="share-invoice-jpg" data-invoice-id="${inv.id}">共有</button>`:''}
        <button type="button" class="btn btn--sm" data-action="export-invoice-csv" data-invoice-id="${inv.id}">CSV</button>
        <button type="button" class="btn btn--sm" data-action="compose-invoice-reminder" data-invoice-id="${inv.id}">催促メッセージ</button>
        ${inv.status !== 'paid' ? `<button type="button" class="btn btn--sm" data-action="mark-invoice-paid" data-invoice-id="${inv.id}">入金済みにする</button>` : `<span class="badge badge--paid">入金済み</span>`}
        <button type="button" class="btn btn--sm btn--danger" data-action="delete-invoice" data-invoice-id="${inv.id}">削除</button>
      </div>
    </div>
    <div class="field__hint" style="margin-bottom:12px;">PDFで保存するには、印刷ダイアログで「PDFとして保存」を選んでください。</div>
    <div class="invoice-preview-wrap a4-fit-preview">
      ${invoicePreviewInnerHtml(inv)}
    </div>
  </div>`;
}

function invoicePreviewInnerHtml(inv) {
  const issuer = issuerForDocument(inv);
  const subtotal = invoiceSubtotal(inv);
  const tax = invoiceTax(inv);
  const wh = invoiceWithholding(inv);
  const total = invoiceTotal(inv);
  return `
  <div class="invoice-preview">
    <div class="invoice-preview__title">請求書</div>
    <div class="invoice-preview__meta">請求書番号: ${escapeHtml(inv.number)}　発行日: ${formatJPSlash(inv.issueDate)}</div>
    <div class="invoice-preview__top">
      <div class="invoice-preview__to">${escapeHtml(inv.clientName)} ${escapeHtml(inv.honorific || '')}</div>
      <div class="invoice-preview__issuer">
        ${escapeHtml(issuer.name || '')}<br>
        ${escapeHtml(issuer.address || '')}<br>
        ${issuer.tel ? 'TEL: ' + escapeHtml(issuer.tel) + '<br>' : ''}
        ${issuer.email ? escapeHtml(issuer.email) + '<br>' : ''}
        ${issuer.invoiceRegNo ? '登録番号: ' + escapeHtml(issuer.invoiceRegNo) : ''}
      </div>
    </div>
    <div class="invoice-preview__subject">件名: ${escapeHtml(inv.subject || '')}　支払期限: ${formatJPSlash(inv.dueDate)}</div>
    <div class="invoice-preview__total-box">
      <span class="invoice-preview__total-label">ご請求金額（税込）</span>
      <span class="invoice-preview__total-value">${formatMoney(total)}</span>
    </div>
    <table class="invoice-table">
      <thead><tr><th>品目</th><th style="width:60px;">数量</th><th style="width:65px;">単位</th><th style="width:105px;">単価</th><th style="width:115px;">金額</th></tr></thead>
      <tbody>
      ${inv.items.map((it) => `<tr><td>${escapeHtml(it.name)}</td><td class="num">${it.qty}</td><td>${escapeHtml(it.unit||'式')}</td><td class="num">${formatMoney(it.unitPrice)}</td><td class="num">${formatMoney((Number(it.qty) || 0) * (Number(it.unitPrice) || 0))}</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="invoice-preview__totals">
      <div class="invoice-preview__totals-row"><span>小計</span><span>${formatMoney(subtotal)}</span></div>
      <div class="invoice-preview__totals-row"><span>消費税${inv.taxRate ? '（10%）' : ''}</span><span>${formatMoney(tax)}</span></div>
      ${inv.hasWithholding ? `<div class="invoice-preview__totals-row"><span>源泉徴収</span><span>-${formatMoney(wh)}</span></div>` : ''}
      <div class="invoice-preview__totals-row grand"><span>合計</span><span>${formatMoney(total)}</span></div>
    </div>
    <div class="invoice-preview__bottom">
      <div class="invoice-preview__bank">
        <h4>お振込先</h4>
        ${issuer.bankName ? `${escapeHtml(issuer.bankName)} ${escapeHtml(issuer.bankBranch || '')}<br>${escapeHtml(issuer.bankAccountType || '')} ${escapeHtml(issuer.bankAccountNumber || '')}<br>${escapeHtml(issuer.bankAccountHolder || '')}` : '未設定（設定画面から登録できます）'}
      </div>
      <div class="invoice-preview__notes">
        <h4>備考</h4>
        ${escapeHtml(inv.notes || '').replace(/\n/g, '<br>') || '—'}
      </div>
    </div>
  </div>`;
}

function markInvoicePaid(invoiceId) {
  const inv = state.invoices.find((iv) => iv.id === invoiceId);
  if (!inv) return;
  inv.status = 'paid';
  ensureInvoiceIssuerSnapshot(inv);
  if (inv.projectId) {
    const p = state.projects.find((x) => x.id === inv.projectId);
    if (p) { p.paymentStatus = 'paid'; if (!p.paidDate) p.paidDate = todayStr(); }
  }
  saveState();
  renderCurrentTab();
  openInvoicePreviewModal(invoiceId);
  showToast('入金済みにしました');
}

function deleteInvoice(invoiceId) {
  const invoice=state.invoices.find((iv)=>iv.id===invoiceId);
  if(!invoice)return;
  if (!confirm('この請求書を削除します。よろしいですか？')) return;
  deleteInvoiceRecord(invoiceId);
  saveState();
  closeModal();
  renderCurrentTab();
  showToast('請求書を削除しました');
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const lines = String(text).split('\n');
  let cy = y;
  lines.forEach((lineText) => {
    let line = '';
    for (const ch of lineText) {
      const test = line + ch;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, cy);
        line = ch;
        cy += lineHeight;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, x, cy);
    cy += lineHeight;
  });
}

function saveInvoiceAsJpg(invoiceId, share) {
  const inv = state.invoices.find((iv) => iv.id === invoiceId);
  if (!inv) return;
  const issuer = issuerForDocument(inv);
  const W = 1240, H = 1754;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#222222';

  const marginX = 90;
  let y = 110;

  ctx.font = '700 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('請求書', W / 2, y);

  ctx.font = '13px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`請求書番号: ${inv.number}　発行日: ${formatJPSlash(inv.issueDate)}`, W - marginX, y + 40);
  y += 100;

  ctx.textAlign = 'left';
  ctx.font = '700 24px sans-serif';
  ctx.fillText(`${inv.clientName} ${inv.honorific || ''}`, marginX, y);
  ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(marginX, y + 12); ctx.lineTo(marginX + 340, y + 12); ctx.stroke();

  ctx.font = '13px sans-serif';
  const issuerLines = [issuer.name, issuer.address, issuer.tel ? 'TEL: ' + issuer.tel : '', issuer.email, issuer.invoiceRegNo ? '登録番号: ' + issuer.invoiceRegNo : ''].filter(Boolean);
  issuerLines.forEach((line, i) => ctx.fillText(line, W - marginX - 300, y - 70 + i * 20));

  y += 60;
  ctx.font = '13px sans-serif';
  ctx.fillText(`件名: ${inv.subject || ''}　支払期限: ${formatJPSlash(inv.dueDate)}`, marginX, y);
  y += 40;

  const total = invoiceTotal(inv);
  ctx.strokeRect(marginX, y, W - marginX * 2, 70);
  ctx.font = '700 16px sans-serif';
  ctx.fillText('ご請求金額（税込）', marginX + 20, y + 44);
  ctx.font = '700 32px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(formatMoney(total), W - marginX - 20, y + 48);
  ctx.textAlign = 'left';
  y += 110;

  const colX = [marginX, marginX + 600, marginX + 695, marginX + 785, marginX + 920, W - marginX];
  const drawTableGrid=(top,height)=>{ctx.strokeRect(marginX,top,W-marginX*2,height);colX.slice(1,-1).forEach((x)=>{ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,top+height);ctx.stroke();});};
  ctx.font = '700 13px sans-serif';
  ctx.strokeStyle = '#999'; ctx.lineWidth = 1;
  drawTableGrid(y,34);
  ctx.fillText('品目', colX[0] + 10, y + 22);
  ctx.fillText('数量', colX[1] + 10, y + 22);
  ctx.fillText('単位', colX[2] + 10, y + 22);
  ctx.fillText('単価', colX[3] + 10, y + 22);
  ctx.fillText('金額', colX[4] + 10, y + 22);
  y += 34;
  ctx.font = '13px sans-serif';
  inv.items.forEach((it) => {
    drawTableGrid(y,32);
    ctx.fillText(String(it.name || ''), colX[0] + 10, y + 21);
    ctx.textAlign = 'right';
    ctx.fillText(String(it.qty), colX[2] - 10, y + 21);
    ctx.textAlign = 'left';
    ctx.fillText(String(it.unit||'式'), colX[2] + 10, y + 21);
    ctx.textAlign = 'right';
    ctx.fillText(formatMoney(it.unitPrice), colX[4] - 10, y + 21);
    ctx.fillText(formatMoney((Number(it.qty) || 0) * (Number(it.unitPrice) || 0)), colX[5] - 10, y + 21);
    ctx.textAlign = 'left';
    y += 32;
  });
  y += 20;

  const subtotal = invoiceSubtotal(inv);
  const tax = invoiceTax(inv);
  const wh = invoiceWithholding(inv);
  const totalsX = W - marginX - 320;
  ctx.font = '13px sans-serif';
  const totalsLines = [
    ['小計', formatMoney(subtotal)],
    [inv.taxRate ? '消費税（10%）' : '消費税', formatMoney(tax)],
  ];
  if (inv.hasWithholding) totalsLines.push(['源泉徴収', '-' + formatMoney(wh)]);
  totalsLines.forEach(([label, val], i) => {
    ctx.textAlign = 'left'; ctx.fillText(label, totalsX, y + i * 26);
    ctx.textAlign = 'right'; ctx.fillText(val, W - marginX, y + i * 26);
  });
  y += totalsLines.length * 26 + 6;
  ctx.font = '700 16px sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('合計', totalsX, y);
  ctx.textAlign = 'right'; ctx.fillText(formatMoney(total), W - marginX, y);
  ctx.textAlign = 'left';
  y += 60;

  ctx.font = '700 13px sans-serif';
  ctx.fillText('お振込先', marginX, y);
  ctx.font = '13px sans-serif';
  const bankLines = issuer.bankName ? [`${issuer.bankName} ${issuer.bankBranch || ''}`, `${issuer.bankAccountType || ''} ${issuer.bankAccountNumber || ''}`, issuer.bankAccountHolder || ''] : ['未設定'];
  bankLines.forEach((line, i) => ctx.fillText(line, marginX, y + 24 + i * 20));

  ctx.font = '700 13px sans-serif';
  ctx.fillText('備考', marginX + 420, y);
  ctx.font = '13px sans-serif';
  wrapText(ctx, inv.notes || '—', marginX + 420, y + 24, 460, 20);

  outputJpgCanvas(canvas, `請求書_${inv.number}.jpg`, share);
}

/* ===================== 作品タブ ===================== */
let galleryYear = '__all__';
let galleryMonth = '__all__';

function collectGalleryItems() {
  const items = [];
  state.projects.forEach((p) => {
    (p.imageIds || []).forEach((imgId) => {
      items.push({
        imageId: imgId, title: p.title, clientName: p.clientName,
        orderedDate: p.orderedDate || (p.createdAt ? toDateStr(new Date(p.createdAt)) : null), deliveredDate: p.deliveredDate, fee: p.fee,
        year: p.deliveredDate ? parseDateStr(p.deliveredDate).getFullYear() : null,
        source: 'project', projectId: p.id, color: p.color,
      });
    });
  });
  (state.galleryExtras || []).forEach((g) => {
    items.push({
      imageId: g.imageId, title: g.title, clientName: g.clientName,
      orderedDate: g.orderedDate || (g.createdAt ? toDateStr(new Date(g.createdAt)) : null), deliveredDate: g.deliveredDate, fee: g.fee,
      year: g.deliveredDate ? parseDateStr(g.deliveredDate).getFullYear() : null,
      source: 'extra', extraId: g.id, color: '#616161',
    });
  });
  items.sort((a, b) => {
    if (!a.deliveredDate) return 1;
    if (!b.deliveredDate) return -1;
    return diffDays(b.deliveredDate, a.deliveredDate);
  });
  return items;
}

function galleryItemKey(item) {
  return item.source === 'project' ? `p:${item.projectId}:${item.imageId}` : `e:${item.extraId}`;
}

function renderGalleryTab() {
  const container = $('#galleryContent');
  if (!container) return;
  const items = collectGalleryItems();
  const years = Array.from(new Set(items.map((i) => i.year).filter(Boolean))).sort((a, b) => b - a);
  const filtered = items.filter((i) => (galleryYear==='__all__'||i.year===Number(galleryYear)) && (galleryMonth==='__all__'||(i.deliveredDate&&parseDateStr(i.deliveredDate).getMonth()+1===Number(galleryMonth))));

  container.innerHTML = `
    <div class="view-toolbar">
      <h1 class="view-title">作品</h1>
      <div class="view-toolbar__actions">
        <select class="select" id="gallery-year-select" style="width:auto;">
          <option value="__all__">すべての年</option>
          ${years.map((y) => `<option value="${y}" ${String(galleryYear) === String(y) ? 'selected' : ''}>${y}年</option>`).join('')}
        </select>
        <select class="select" id="gallery-month-select" style="width:auto;">
          <option value="__all__">すべての月</option>
          ${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${String(galleryMonth)===String(i+1)?'selected':''}>${i+1}月</option>`).join('')}
        </select>
        <button type="button" class="btn btn--primary" data-action="add-gallery-item">${ICONS.plus}作品を追加</button>
      </div>
    </div>
    ${filtered.length === 0 ? emptyStateHtml('image', '作品がまだありません', '案件に画像を添付するか、ここから直接追加できます。', 'add-gallery-item', '作品を追加') : `
    <div class="gallery-grid">
      ${filtered.map(galleryCardHtml).join('')}
    </div>`}
  `;
  const sel = $('#gallery-year-select', container);
  if (sel) sel.addEventListener('change', (e) => { galleryYear = e.target.value; renderGalleryTab(); });
  const monthSel=$('#gallery-month-select',container);
  if(monthSel)monthSel.addEventListener('change',(e)=>{galleryMonth=e.target.value;renderGalleryTab();});
  hydrateImages(container);
}

function galleryCardHtml(item) {
  const key = galleryItemKey(item);
  const productionDays = item.orderedDate && item.deliveredDate ? Math.max(0, diffDays(item.deliveredDate, item.orderedDate)) : null;
  return `
  <div class="gallery-card" style="border-bottom-color:${item.color || '#616161'}" data-action="open-gallery-item" data-key="${escapeHtml(key)}">
    <img class="gallery-card__img" data-image-id="${item.imageId}" alt="">
    <div class="gallery-card__body">
      <div class="gallery-card__title">${escapeHtml(item.title || '無題')}</div>
      <div class="gallery-card__meta">${escapeHtml(item.clientName || '')}</div>
      <div class="gallery-card__meta">${item.orderedDate ? formatJP(item.orderedDate, { withYear: true }) : '—'} → ${item.deliveredDate ? formatJP(item.deliveredDate, { withYear: true }) : '—'}${productionDays !== null ? `（制作期間 ${productionDays}日）` : ''}</div>
      <div class="gallery-card__meta">${item.fee ? formatMoney(item.fee) : ''}</div>
    </div>
  </div>`;
}

function openGalleryItemModal(key) {
  const items = collectGalleryItems();
  const item = items.find((i) => galleryItemKey(i) === key);
  if (!item) return;
  const overlay = openModal(`
    <div class="modal__header">
      <h2 class="modal__title">${escapeHtml(item.title || '無題')}</h2>
      <button type="button" class="icon-btn" data-action="close-modal">${ICONS.close}</button>
    </div>
    <div class="modal__body">
      <img data-image-id="${item.imageId}" style="width:100%; border-radius:8px; margin-bottom:16px; display:block;" alt="">
      <div class="field-row">
        <div class="field"><label class="field__label">クライアント</label><div>${escapeHtml(item.clientName || '—')}</div></div>
        <div class="field"><label class="field__label">受注日</label><input class="input" type="date" id="gallery-ordered-date" value="${escapeHtml(item.orderedDate || '')}"></div>
        <div class="field"><label class="field__label">納品日</label><div>${item.deliveredDate ? formatJP(item.deliveredDate, { withYear: true }) : '—'}</div></div>
        <div class="field"><label class="field__label">金額</label><div>${item.fee ? formatMoney(item.fee) : '—'}</div></div>
      </div>
      ${item.source === 'extra' ? `<button type="button" class="btn btn--danger" data-action="delete-gallery-extra" data-extra-id="${item.extraId}">${ICONS.trash}削除</button>` : ''}
    </div>
  `, { wide: true });
  hydrateImages(overlay);
  $('#gallery-ordered-date', overlay).addEventListener('change', (e) => {
    if (item.source === 'project') { const p = state.projects.find((x) => x.id === item.projectId); if (p) p.orderedDate = e.target.value || null; }
    else { const g = state.galleryExtras.find((x) => x.id === item.extraId); if (g) g.orderedDate = e.target.value || null; }
    saveState(); renderGalleryTab(); showToast('受注日を更新しました');
  });
}

function openAddGalleryItemModal() {
  const overlay = openModal(`
    <div class="modal__header"><h2 class="modal__title">作品を追加</h2><button type="button" class="icon-btn" data-action="close-modal">${ICONS.close}</button></div>
    <div class="modal__body">
      <div class="field"><label class="field__label">画像<span class="req">必須</span></label><input type="file" id="gi-file" accept="image/*"></div>
      <div class="field"><label class="field__label">タイトル</label><input class="input" id="gi-title"></div>
      <div class="field"><label class="field__label">クライアント</label><input class="input" id="gi-client"></div>
      <div class="field"><label class="field__label">受注日</label><input class="input" type="date" id="gi-ordered-date" value="${todayStr()}"></div>
      <div class="field"><label class="field__label">納品日</label><input class="input" type="date" id="gi-date" value="${todayStr()}"></div>
      <div class="field"><label class="field__label">金額（円）</label><input class="input" type="text" inputmode="numeric" data-money-input id="gi-fee"></div>
    </div>
    <div class="modal__footer">
      <button type="button" class="btn" data-action="close-modal">キャンセル</button>
      <button class="btn btn--primary" id="gi-save" type="button">追加する</button>
    </div>
  `);
  wireMoneyInputs(overlay);
  $('#gi-save', overlay).addEventListener('click', async () => {
    const file = $('#gi-file', overlay).files[0];
    if (!file) { showToast('画像を選択してください', 'error'); return; }
    let imageId;
    try { imageId = await imageSave(file); } catch (e) { showToast('画像の保存に失敗しました', 'error'); return; }
    state.galleryExtras.push({
      id: uuid(), imageId,
      title: $('#gi-title', overlay).value.trim(),
      clientName: $('#gi-client', overlay).value.trim(),
      orderedDate: $('#gi-ordered-date', overlay).value || null,
      deliveredDate: $('#gi-date', overlay).value || null,
      fee: parseMoneyInput($('#gi-fee', overlay).value) || 0,
      createdAt: new Date().toISOString(),
    });
    saveState();
    closeModal();
    renderCurrentTab();
    showToast('作品を追加しました');
  });
}

function deleteGalleryExtra(extraId) {
  if (!confirm('この作品を削除します。よろしいですか？')) return;
  state.galleryExtras = state.galleryExtras.filter((g) => g.id !== extraId);
  saveState(); closeModal(); renderCurrentTab();
}

/* ===================== メッセージテンプレート ===================== */
function projectMessageVars(project) { const vars={'金額':formatMoney(project.fee)},name=state.settings.issuer&&state.settings.issuer.name;if(project.clientName)vars['クライアント名']=project.clientName;if(project.title)vars['案件名']=project.title;if(project.dueDate)vars['納期']=formatJP(project.dueDate,{withYear:true});if(name)vars['自分の名前']=name;return vars; }
function invoiceMessageVars(invoice) { const project=invoice.projectId?state.projects.find((item)=>item.id===invoice.projectId):null,vars={'金額':formatMoney(invoiceTotal(invoice))},name=state.settings.issuer&&state.settings.issuer.name,subject=project?project.title:invoice.subject;if(invoice.clientName)vars['クライアント名']=invoice.clientName;if(subject)vars['案件名']=subject;if(project&&project.dueDate)vars['納期']=formatJP(project.dueDate,{withYear:true});if(invoice.number)vars['請求書番号']=invoice.number;if(invoice.dueDate)vars['支払期日']=formatJP(invoice.dueDate,{withYear:true});if(name)vars['自分の名前']=name;return vars; }
function openMessageComposeModal(vars,initialName) {
  const templates=state.settings.messageTemplates||[];if(!templates.length){showToast('メッセージテンプレートがありません','error');return;}
  let selected=templates.find((item)=>item.name===initialName)||templates[0],text=renderMessageTemplate(selected.body,vars),categories=Array.from(new Set(templates.map((item)=>item.category)));
  const overlay=openModal(`<div class="modal__header"><h2 class="modal__title">メッセージ作成</h2><button type="button" class="icon-btn" data-action="close-modal">${ICONS.close}</button></div><div class="modal__body message-compose"><nav class="message-template-nav">${categories.map((category)=>`<section><h3>${escapeHtml(category)}</h3>${templates.filter((item)=>item.category===category).map((item)=>`<button type="button" data-action="select-message-template" data-template-id="${escapeHtml(item.id)}">${escapeHtml(item.name)}</button>`).join('')}</section>`).join('')}</nav><div class="message-compose__editor"><label class="field__label" id="message-compose-name">${escapeHtml(selected.name)}</label><textarea class="textarea" id="message-compose-body"></textarea><p class="message-compose__warning" id="message-compose-warning"></p></div></div><div class="modal__footer"><button type="button" class="btn" data-action="close-modal">閉じる</button><button type="button" class="btn btn--primary" data-action="copy-composed-message">コピー</button></div>`,{wide:true});
  const textarea=$('#message-compose-body',overlay),warning=$('#message-compose-warning',overlay),sync=()=>{textarea.value=text;$('#message-compose-name',overlay).textContent=selected.name;$all('[data-template-id]',overlay).forEach((button)=>button.classList.toggle('is-active',button.dataset.templateId===selected.id));warning.textContent=/\{[^{}]+\}/.test(text)?'未入力の差し込み項目があります。必要に応じて本文を編集してください。':'';};
  textarea.addEventListener('input',()=>{text=textarea.value;warning.textContent=/\{[^{}]+\}/.test(text)?'未入力の差し込み項目があります。必要に応じて本文を編集してください。':'';});
  overlay.addEventListener('click',async(event)=>{const button=event.target.closest('[data-action]');if(!button)return;if(button.dataset.action==='select-message-template'){const next=templates.find((item)=>item.id===button.dataset.templateId);if(next){selected=next;text=renderMessageTemplate(selected.body,vars);sync();}}else if(button.dataset.action==='copy-composed-message'){if(await copyTextToClipboard(text))showToast('コピーしました');else showToast('コピーできませんでした','error');}});sync();
}

/* ===================== 設定モーダル ===================== */
let settingsTab = null;
let settingsSelectedClientId = '';
let settingsReturnToProject = false;
let settingsEditingRecurringId = null;
let settingsModalFromView = false;

const SETTINGS_DETAIL_TITLES = {
  theme:'テーマカラー', issuer:'発行者情報', template:'工程テンプレート', clients:'クライアント管理',
  priceList:'単価表', messageTemplates:'メッセージテンプレート', recurring:'定期経費', platformFee:'プラットフォーム',
  backup:'バックアップと復元', usage:'使い方ツアー', about:'アプリについて',
};

function openSettingsModal(options) {
  options = options || {};
  settingsTab = options.initialTab || null;
  settingsSelectedClientId = '';
  settingsEditingRecurringId = null;
  settingsReturnToProject = !!options.returnToProject;
  settingsModalFromView = !!options.fromSettingsView;
  const overlay = openModal(settingsModalHtml(), { wide: true, stack:!!options.stack });
  wireSettingsModal(overlay);
}

function renderSettingsView() {
  const content=$('#settingsViewContent');
  if(!content)return;
  content.innerHTML=`<div class="view-toolbar"><h1 class="view-title">設定</h1></div>${settingsHomeHtml()}`;
}

function settingsModalHtml() {
  const isDetail=!!settingsTab;
  return `
  <div class="modal__header settings-modal-header">
    ${isDetail?'<button type="button" class="settings-back-link" data-action="settings-back">‹ 設定</button>':'<span class="settings-header-spacer"></span>'}
    <h2 class="modal__title">${isDetail?escapeHtml(SETTINGS_DETAIL_TITLES[settingsTab]||'設定'):'設定'}</h2>
    <button type="button" class="icon-btn" data-action="close-modal">${ICONS.close}</button>
  </div>
  <div class="modal__body settings-modal-body ${isDetail?'settings-detail-body':'settings-home-body'}">
    ${!isDetail&&settingsReturnToProject?'<button type="button" class="settings-project-return" data-action="close-modal">‹ 案件入力に戻る</button>':''}
    ${isDetail?'<div id="settingsSubContent" class="settings-detail-content"></div>':settingsHomeHtml()}
  </div>`;
}

function settingsIconSvg(name) {
  const paths={
    theme:'<path d="M12 3a9 9 0 1 0 0 18h1.4a1.7 1.7 0 0 0 0-3.4h-.7a1.5 1.5 0 0 1 0-3H15a6 6 0 0 0 0-12h-3Z"/><circle cx="7.5" cy="10" r="1"/><circle cx="10" cy="6.8" r="1"/><circle cx="15" cy="7" r="1"/>',
    issuer:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"/>',
    template:'<path d="M7 4h10M7 12h10M7 20h10"/><circle cx="4" cy="4" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="20" r="1"/>',
    clients:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6M14 15c3.6-.7 6 1 7 4"/>',
    priceList:'<path d="M4 7h16v12H4zM7 4h10v3M8 12h8M8 16h5"/>',
    messageTemplates:'<path d="M4 5h16v12H8l-4 4V5Z"/><path d="M8 9h8M8 13h5"/>',
    recurring:'<path d="M19 8a7 7 0 1 0 0 8M19 4v4h-4"/><path d="M12 8v4l3 2"/>',
    platformFee:'<circle cx="8" cy="8" r="3"/><circle cx="16" cy="16" r="3"/><path d="m7 18 10-12"/>',
    backup:'<path d="M5 17a4 4 0 0 1 1-7.9A6 6 0 0 1 17.5 8 4.5 4.5 0 0 1 18 17h-3M12 20V11m-3 3 3-3 3 3"/>',
    usage:'<path d="M9.5 9a2.7 2.7 0 1 1 4.2 2.2c-1.2.8-1.7 1.4-1.7 2.8"/><circle cx="12" cy="18" r=".8"/><circle cx="12" cy="12" r="9"/>',
    about:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r=".8"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.about}</svg>`;
}

function settingsRowHtml(key,label,valueHtml,valueClass) {
  return `<button type="button" class="settings-list-row" data-action="open-settings-detail" data-setting="${key}"><span class="settings-row-icon">${settingsIconSvg(key)}</span><span class="settings-row-label">${escapeHtml(label)}</span>${valueHtml?`<span class="settings-row-value ${valueClass||''}">${valueHtml}</span>`:''}<span class="settings-row-chevron" aria-hidden="true">›</span></button>`;
}

function settingsGroupHtml(label,rows) {
  return `<section class="settings-group"><h3>${escapeHtml(label)}</h3><div class="settings-group-card">${rows.join('')}</div></section>`;
}

function settingsHomeHtml() {
  const issuerName=(state.settings.issuer&&state.settings.issuer.name||'').trim();
  const backupDays=state.settings.lastBackupAt?Math.max(0,diffDays(todayStr(),state.settings.lastBackupAt)):null;
  const platformCount=(state.settings.platforms||[]).length;
  return `<div class="settings-home">
    ${settingsGroupHtml('一般',[
      settingsRowHtml('theme','テーマカラー',`<span class="settings-current-swatch" style="background:${escapeHtml(state.settings.accentColor||'#687EE7')}"></span>`),
      settingsRowHtml('issuer','発行者情報',escapeHtml(issuerName||'未設定'),issuerName?'':'is-muted'),
    ])}
    ${settingsGroupHtml('制作',[
      settingsRowHtml('template','工程テンプレート',`${state.settings.defaultTemplate.length}工程`),
      settingsRowHtml('clients','クライアント管理',`${state.clients.length}社`),
      settingsRowHtml('priceList','単価表',`${state.settings.priceList.length}項目`),
      settingsRowHtml('messageTemplates','メッセージテンプレート',`${state.settings.messageTemplates.length}件`),
    ])}
    ${settingsGroupHtml('お金',[
      settingsRowHtml('recurring','定期経費',`${state.recurringExpenses.length}件`),
      settingsRowHtml('platformFee','プラットフォーム',`${platformCount}件`),
    ])}
    ${settingsGroupHtml('バックアップ',[
      settingsRowHtml('backup','バックアップと復元',backupDays===null?'未実施':`最終: ${backupDays}日前`,backupDays===null?'is-warning':''),
    ])}
    ${settingsGroupHtml('ヘルプ',[
      settingsRowHtml('usage','使い方ツアー',''),
      settingsRowHtml('about','アプリについて','v1.0'),
    ])}
  </div>`;
}

function renderSettingsModal(overlay) {
  const modal=$('.modal',overlay); if(!modal)return;
  modal.innerHTML=settingsModalHtml();
  wireSettingsModal(overlay);
}

function wireSettingsModal(overlay) {
  const sub = $('#settingsSubContent', overlay);
  if (!sub) return;
  if (settingsTab === 'template') { sub.innerHTML = templateSettingsHtml(); wireTemplateSettings(overlay); }
  else if (settingsTab === 'clients') { sub.innerHTML = clientSettingsHtml(); wireClientSettings(overlay); }
  else if (settingsTab === 'issuer') { sub.innerHTML = issuerSettingsHtml(); wireIssuerSettings(overlay); }
  else if (settingsTab === 'recurring') { sub.innerHTML = recurringExpenseSettingsHtml(); wireRecurringExpenseSettings(overlay); }
  else if (settingsTab === 'backup') { sub.innerHTML = backupSettingsHtml(); wireBackupSettings(overlay); }
  else if (settingsTab === 'theme') { sub.innerHTML = themeSettingsHtml(); wireThemeSettings(overlay); }
  else if (settingsTab === 'priceList') { sub.innerHTML=priceListSettingsHtml();wirePriceListSettings(overlay); }
  else if (settingsTab === 'messageTemplates') { sub.innerHTML=messageTemplateSettingsHtml();wireMessageTemplateSettings(overlay); }
  else if (settingsTab === 'platformFee') { sub.innerHTML=platformFeeSettingsHtml();wirePlatformFeeSettings(overlay); }
  else if (settingsTab === 'usage') sub.innerHTML = usageSettingsHtml();
  else if (settingsTab === 'about') sub.innerHTML = aboutSettingsHtml();
}

const ACCENT_PRESETS = [['赤','#FF3B30'],['ピンク','#FF4D8D'],['ブルー','#2979FF'],['水色','#00B8D9'],['ミント','#00C48C'],['オレンジ','#FF8A00'],['イエロー','#FFC400'],['バイオレット','#7C4DFF']];
function themeSettingsHtml() {
  const selected=normalizeHex(state.settings.accentColor)||'#687EE7';
  const appearance=state.settings.appearance||'system';
  const isCustom=!ACCENT_PRESETS.some((item)=>item[1]===selected);
  return `<h3 class="section-title">外観</h3><p class="field__hint">端末の設定に合わせるか、外観を固定できます。</p><div class="segmented appearance-segment" role="group" aria-label="外観">${[['light','ライト'],['dark','ダーク'],['system','システム']].map(([value,label])=>`<button type="button" class="segmented__btn ${appearance===value?'is-active':''}" data-action="set-appearance" data-appearance="${value}">${label}</button>`).join('')}</div><h3 class="section-title theme-color-heading">テーマカラー</h3><p class="field__hint">ボタン、リンク、選択中の表示に使う色を選べます。状態を表す色は変わりません。</p><div class="theme-presets">${ACCENT_PRESETS.map(([name,color])=>`<button type="button" class="theme-preset ${selected===color?'is-selected':''}" data-action="set-accent-color" data-color="${color}"><span style="background:${color}"></span>${name}</button>`).join('')}<button type="button" class="theme-preset theme-custom ${isCustom?'is-selected':''}" id="themeCustomPicker"><span class="custom-color-swatch" style="--current-color:${selected}"></span>カスタム</button></div><div class="theme-current"><span>現在のカラー</span><code>${selected}</code></div>`;
}
function wireThemeSettings(overlay) {
  const custom=$('#themeCustomPicker',overlay); if(!custom)return;
  custom.addEventListener('click',()=>openColorPicker(custom,state.settings.accentColor,(color)=>{state.settings.accentColor=color;saveState();applyAccentTheme(color);const preset=$(`.theme-preset[data-color="${color}"]`,overlay);$all('.theme-preset',overlay).forEach((item)=>item.classList.remove('is-selected'));(preset||custom).classList.add('is-selected');const dot=$('.custom-color-swatch',custom);if(dot)dot.style.setProperty('--current-color',color);const code=$('.theme-current code',overlay);if(code)code.textContent=color;}));
}

function recurringExpenseSettingsHtml() {
  const editing=state.recurringExpenses.find((item)=>item.id===settingsEditingRecurringId)||null;
  const frequency=editing&&editing.frequency==='yearly'?'yearly':'monthly';
  return `<h3 class="section-title">定期経費（サブスク）</h3><p class="field__hint">開始月から毎月または毎年、自動で経費を作成します。過去に作成された経費は削除後も残ります。</p>
    <form id="recurringExpenseForm" class="recurring-expense-form">
      <div class="field"><label class="field__label">名前</label><input class="input" id="ref-name" value="${escapeHtml(editing&&editing.name||'')}" placeholder="例: クリップスタジオペイント／AIサブスク／スマホ通信費" required></div>
      <div class="field"><label class="field__label">カテゴリ</label><select class="select" id="ref-category">${EXPENSE_CATEGORIES.map((category)=>`<option value="${escapeHtml(category)}" ${editing?editing.category===category:category==='ソフトウェア・サブスク'?'selected':''}>${escapeHtml(category)}</option>`).join('')}</select></div>
      <div class="field"><label class="field__label">金額（円）</label><input class="input" id="ref-amount" type="text" inputmode="numeric" data-money-input value="${editing?Number(editing.amount)||0:''}" required></div>
      <div class="field"><label class="field__label">周期</label><select class="select" id="ref-frequency"><option value="monthly" ${frequency==='monthly'?'selected':''}>毎月</option><option value="yearly" ${frequency==='yearly'?'selected':''}>毎年</option></select></div>
      <div class="field" id="ref-month-field" ${frequency==='monthly'?'hidden':''}><label class="field__label">毎年の月</label><select class="select" id="ref-month">${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${Number(editing&&editing.monthOfYear||1)===i+1?'selected':''}>${i+1}月</option>`).join('')}</select></div>
      <div class="field"><label class="field__label" id="ref-day-label">${frequency==='yearly'?'毎年の日':'毎月の日'}</label><input class="input" id="ref-day" type="number" min="1" max="31" value="${editing?Number(editing.dayOfMonth)||1:1}" required></div>
      <div class="field"><label class="field__label">開始月</label><input class="input" id="ref-start" type="month" value="${escapeHtml(editing&&editing.startMonth||todayStr().slice(0,7))}" required></div>
      <div class="field"><label class="field__label">メモ</label><input class="input" id="ref-memo" value="${escapeHtml(editing&&editing.memo||'')}" placeholder="例: 制作ソフト月額プラン"></div>
      <label class="checkbox-row"><input type="checkbox" id="ref-active" ${!editing||editing.active?'checked':''}>自動計上を有効にする</label>
      <div class="recurring-expense-form__actions"><button type="submit" class="btn btn--primary">${editing?'更新する':'追加する'}</button>${editing?'<button type="button" class="btn" data-action="cancel-recurring-expense-edit">キャンセル</button>':''}</div>
    </form>
    <div class="recurring-expense-list">${state.recurringExpenses.length?state.recurringExpenses.map((item)=>`<div class="recurring-expense-row ${item.active?'':'is-paused'}"><div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.category)}・${formatMoney(item.amount)}・${item.frequency==='yearly'?`毎年${Number(item.monthOfYear)||1}月${Number(item.dayOfMonth)||1}日`:`毎月${Number(item.dayOfMonth)||1}日`}・${escapeHtml(item.startMonth)}開始</span><small>${item.active?'自動計上中':'一時停止中'}</small></div><div><button type="button" class="btn btn--sm" data-action="toggle-recurring-expense" data-recurring-id="${item.id}">${item.active?'一時停止':'再開'}</button><button type="button" class="btn btn--sm" data-action="edit-recurring-expense" data-recurring-id="${item.id}">編集</button><button type="button" class="icon-btn btn--sm" data-action="delete-recurring-expense" data-recurring-id="${item.id}">${ICONS.trash}</button></div></div>`).join(''):'<p class="field__hint">定期経費はまだ登録されていません。</p>'}</div>`;
}

function wireRecurringExpenseSettings(overlay) {
  const form=$('#recurringExpenseForm',overlay); if(!form)return;
  wireMoneyInputs(overlay); const frequency=$('#ref-frequency',overlay); const syncFrequency=()=>{const yearly=frequency.value==='yearly';$('#ref-month-field',overlay).hidden=!yearly;$('#ref-day-label',overlay).textContent=yearly?'毎年の日':'毎月の日';};frequency.addEventListener('change',syncFrequency);syncFrequency();
  form.addEventListener('submit',(event)=>{event.preventDefault();const name=$('#ref-name',overlay).value.trim();const amount=parseMoneyInput($('#ref-amount',overlay).value);const day=Math.max(1,Math.min(31,Number($('#ref-day',overlay).value)||1));const startMonth=$('#ref-start',overlay).value; if(!name||!Number.isFinite(amount)||amount<0||!/^\d{4}-\d{2}$/.test(startMonth)){showToast('定期経費の入力内容を確認してください','error');return;}const values={name,category:$('#ref-category',overlay).value,amount,frequency:frequency.value,monthOfYear:Number($('#ref-month',overlay).value)||1,dayOfMonth:day,memo:$('#ref-memo',overlay).value.trim(),startMonth,active:$('#ref-active',overlay).checked};const editing=state.recurringExpenses.find((item)=>item.id===settingsEditingRecurringId);if(editing)Object.assign(editing,values);else state.recurringExpenses.push(Object.assign({id:uuid()},values));settingsEditingRecurringId=null;generateRecurringExpensesThroughCurrentMonth();saveState();wireSettingsModal(overlay);renderCurrentTab();showToast(editing?'定期経費を更新しました':'定期経費を追加しました');});
}

function usageSettingsHtml() {
  return `<h3 class="section-title">使い方</h3><p class="field__hint">画面の主な機能をいつでも確認できます。</p><div class="settings-actions"><button type="button" class="btn btn--primary" data-action="restart-tour">使い方ツアーをもう一度見る</button></div>`;
}

function aboutSettingsHtml() {
  return `<div class="settings-about"><img src="assets/logo.png" onerror="this.onerror=null;this.src='assets/logo.svg'" alt="つくルート"><h3>つくルート</h3><span>バージョン v1.0</span><p>フリーランスの制作進行とお金を、ひとつの場所で管理するアプリです。</p></div>`;
}

function platformFeeSettingsHtml(){return `<h3 class="section-title">プラットフォーム</h3><p class="field__hint">仲介サービス名と手数料率を登録します。</p><div id="platform-editor">${(state.settings.platforms||[]).map((platform)=>`<div class="platform-editor-row" data-id="${escapeHtml(platform.id)}"><input class="input" data-field="name" value="${escapeHtml(platform.name)}" aria-label="名前"><label><input class="input" data-field="rate" type="number" min="0" max="100" step="0.01" value="${Number(platform.feeRate)*100}">%</label><button type="button" class="icon-btn" data-action="delete-platform" data-platform-id="${escapeHtml(platform.id)}">${ICONS.trash}</button></div>`).join('')}</div><div class="settings-actions"><button type="button" class="btn" data-action="add-platform">追加</button><button type="button" class="btn btn--primary" id="save-platforms">保存</button></div>`;}
function wirePlatformFeeSettings(overlay){const editor=$('#platform-editor',overlay);if(!editor)return;$('#save-platforms',overlay).addEventListener('click',()=>{let valid=true;$all('.platform-editor-row',editor).forEach((row)=>{const platform=state.settings.platforms.find((item)=>item.id===row.dataset.id);const name=$('[data-field="name"]',row).value.trim();const percent=Number($('[data-field="rate"]',row).value);if(!platform||!name||!Number.isFinite(percent)||percent<0||percent>100){valid=false;return;}platform.name=name;platform.feeRate=percent/100;});if(!valid){showToast('名前と0〜100%の手数料率を確認してください','error');return;}syncAllAutoProjectExpenses();saveState();renderCurrentTab();showToast('プラットフォームを保存しました');});}

function priceListSettingsHtml(){return `<h3 class="section-title">単価表</h3><p class="field__hint">見積作成時の選択肢です。金額やカテゴリはいつでも変更できます。</p><div class="price-list-editor" id="priceListEditor">${state.settings.priceList.map((item,idx)=>`<div class="price-list-row" data-idx="${idx}"><input class="input" data-field="category" value="${escapeHtml(item.category)}" aria-label="カテゴリ"><input class="input" data-field="name" value="${escapeHtml(item.name)}" aria-label="項目名"><select class="select" data-field="type"><option value="fixed" ${item.type!=='rate'?'selected':''}>金額</option><option value="rate" ${item.type==='rate'?'selected':''}>率（%）</option></select><input class="input" type="number" min="0" data-field="value" value="${item.type==='rate'?Math.round((item.rate||0)*100):Number(item.price)||0}" aria-label="金額または率"><button type="button" class="icon-btn" data-action="delete-price-item" data-idx="${idx}">${ICONS.trash}</button></div>`).join('')}</div><button type="button" class="btn btn--primary" data-action="add-price-item">${ICONS.plus}項目を追加</button>`;}
function wirePriceListSettings(overlay){const editor=$('#priceListEditor',overlay);$all('.price-list-row',editor).forEach((row)=>{$all('[data-field]',row).forEach((input)=>input.addEventListener('change',()=>{const item=state.settings.priceList[Number(row.dataset.idx)];const field=input.dataset.field;if(field==='value'){if(item.type==='rate')item.rate=(Number(input.value)||0)/100;else item.price=Number(input.value)||0;}else item[field]=input.value;saveState();}));});}
function messageTemplateSettingsHtml(){return `<h3 class="section-title">メッセージテンプレート</h3><p class="field__hint">本文では {クライアント名} {案件名} {納期} {金額} {請求書番号} {支払期日} {自分の名前} などを差し込み項目として使えます。</p><div class="message-template-editor" id="messageTemplateEditor">${state.settings.messageTemplates.map((item,idx)=>`<div class="message-template-edit-row" data-idx="${idx}"><div><input class="input" data-field="category" value="${escapeHtml(item.category)}" aria-label="カテゴリ"><input class="input" data-field="name" value="${escapeHtml(item.name)}" aria-label="テンプレート名"><button type="button" class="icon-btn" data-action="delete-message-template" data-idx="${idx}">${ICONS.trash}</button></div><textarea class="textarea" data-field="body" aria-label="本文">${escapeHtml(item.body)}</textarea></div>`).join('')}</div><div class="settings-actions"><button type="button" class="btn" data-action="add-message-template">${ICONS.plus}追加</button><button type="button" class="btn btn--primary" id="saveMessageTemplates">保存</button></div>`;}
function wireMessageTemplateSettings(overlay){const editor=$('#messageTemplateEditor',overlay);if(!editor)return;$('#saveMessageTemplates',overlay).addEventListener('click',()=>{let valid=true;$all('.message-template-edit-row',editor).forEach((row)=>{const item=state.settings.messageTemplates[Number(row.dataset.idx)],category=$('[data-field="category"]',row).value.trim(),name=$('[data-field="name"]',row).value.trim();if(!item||!category||!name){valid=false;return;}item.category=category;item.name=name;item.body=$('[data-field="body"]',row).value;});if(!valid){showToast('カテゴリと名前を入力してください','error');return;}saveState();showToast('メッセージテンプレートを保存しました');});}

/* ---- 工程テンプレート ---- */
function templateSettingsHtml() {
  return `
    <h3 class="section-title">デフォルトの工程テンプレート</h3>
    <p class="field__hint" style="margin-bottom:10px;">案件作成時、納期からこの順番・日数で逆算してスケジュールを自動生成します。</p>
    <div class="step-editor" id="template-editor">
      ${state.settings.defaultTemplate.map((t, idx) => templateRowHtml(t, idx, 'tpl')).join('')}
    </div>
    <button class="btn btn--sm" style="margin-top:10px;" type="button" data-action="add-template-row" data-prefix="tpl">${ICONS.plus}工程を追加</button>

    <h3 class="section-title" style="margin-top:28px;">クライアント別の上書き</h3>
    <div class="field">
      <label class="field__label">クライアントを選択</label>
      <select class="select" id="template-client-select">
        <option value="">— 選択してください —</option>
        ${state.clients.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}
      </select>
    </div>
    <div id="client-template-editor"></div>
  `;
}

function templateRowHtml(t, idx, prefix) {
  return `
  <div class="step-editor-row" data-idx="${idx}">
    <div class="step-num">${idx + 1}</div>
    <input class="input" data-field="name" value="${escapeHtml(t.name)}" placeholder="工程名">
    <input class="input input--days" type="number" min="0" data-field="days" value="${t.days}" placeholder="日数">
    <button type="button" class="icon-btn btn--sm" data-action="remove-template-row" data-prefix="${prefix}" data-idx="${idx}">${ICONS.trash}</button>
  </div>`;
}

function bindTemplateRows(overlay, containerSel, templateArray) {
  $all(`${containerSel} .step-editor-row`, overlay).forEach((row) => {
    const idx = Number(row.dataset.idx);
    $all('input[data-field]', row).forEach((input) => {
      input.addEventListener('change', () => {
        const field = input.dataset.field;
        templateArray[idx][field] = field === 'days' ? Math.max(0, Number(input.value) || 0) : input.value;
        saveState();
      });
    });
  });
}

function wireTemplateSettings(overlay) {
  bindTemplateRows(overlay, '#template-editor', state.settings.defaultTemplate);
  const sel = $('#template-client-select', overlay);
  sel.value = settingsSelectedClientId;
  sel.addEventListener('change', (e) => renderClientTemplateEditor(overlay, e.target.value));
  if (settingsSelectedClientId) renderClientTemplateEditor(overlay, settingsSelectedClientId);
}

function renderClientTemplateEditor(overlay, clientId) {
  settingsSelectedClientId = clientId;
  const container = $('#client-template-editor', overlay);
  if (!clientId) { container.innerHTML = ''; return; }
  const client = getClientById(clientId);
  if (!client) { container.innerHTML = ''; return; }
  const usesOverride = Array.isArray(client.templateOverride) && client.templateOverride.length > 0;
  container.innerHTML = `
    <div class="checkbox-row" style="margin:12px 0;">
      <input type="checkbox" id="client-tpl-toggle" ${usesOverride ? 'checked' : ''}>
      <label for="client-tpl-toggle">このクライアント専用のテンプレートを使う</label>
    </div>
    <div id="client-tpl-rows" style="${usesOverride ? '' : 'display:none;'}">
      <div class="step-editor" id="client-template-editor-rows">
        ${(usesOverride ? client.templateOverride : state.settings.defaultTemplate).map((t, idx) => templateRowHtml(t, idx, 'client')).join('')}
      </div>
      <button class="btn btn--sm" style="margin-top:10px;" type="button" data-action="add-template-row" data-prefix="client">${ICONS.plus}工程を追加</button>
    </div>
  `;
  $('#client-tpl-toggle', container).addEventListener('change', (e) => {
    if (e.target.checked) {
      client.templateOverride = (client.templateOverride && client.templateOverride.length) ? client.templateOverride : state.settings.defaultTemplate.map((t) => ({ ...t }));
    } else {
      client.templateOverride = null;
    }
    saveState();
    renderClientTemplateEditor(overlay, clientId);
  });
  bindTemplateRows(overlay, '#client-template-editor-rows', client.templateOverride || []);
}

/* ---- クライアント管理 ---- */
function clientSettingsHtml() {
  return `
    <h3 class="section-title">クライアント</h3>
    <div class="field-row">
      <div class="field" style="flex:1;">
        <input class="input" id="new-client-name" placeholder="新しいクライアント名">
      </div>
      <button class="btn btn--primary" type="button" data-action="add-client">${ICONS.plus}追加</button>
    </div>
    ${state.clients.length === 0 ? `<p class="field__hint">クライアントが登録されていません。</p>` : `
    <div class="step-editor">
      ${state.clients.map((c) => `
      <div class="step-editor-row">
        <input class="input" value="${escapeHtml(c.name)}" data-action="rename-client" data-client-id="${c.id}">
        <button class="icon-btn btn--sm" type="button" data-action="delete-client" data-client-id="${c.id}">${ICONS.trash}</button>
      </div>`).join('')}
    </div>`}
  `;
}

function wireClientSettings(overlay) {
  $all('[data-action="rename-client"]', overlay).forEach((input) => {
    input.addEventListener('change', () => {
      const client = getClientById(input.dataset.clientId);
      if (!client) return;
      const name = input.value.trim();
      if (!name) { showToast('クライアント名を入力してください', 'error'); input.value = client.name; return; }
      client.name = name;
      state.projects.forEach((p) => { if (p.clientId === client.id) p.clientName = name; });
      saveState();
      renderCurrentTab();
    });
  });
}

/* ---- 発行者情報 ---- */
function issuerSettingsHtml() {
  const iss = state.settings.issuer;
  return `
    <h3 class="section-title">発行者情報（請求書に反映されます）</h3>
    <div class="field-row">
      <div class="field"><label class="field__label">氏名 / 屋号</label><input class="input" id="is-name" value="${escapeHtml(iss.name)}"></div>
      <div class="field"><label class="field__label">電話番号</label><input class="input" id="is-tel" value="${escapeHtml(iss.tel)}"></div>
    </div>
    <div class="field"><label class="field__label">住所</label><input class="input" id="is-address" value="${escapeHtml(iss.address)}"></div>
    <div class="field-row">
      <div class="field"><label class="field__label">メールアドレス</label><input class="input" id="is-email" value="${escapeHtml(iss.email)}"></div>
      <div class="field"><label class="field__label">インボイス登録番号（任意）</label><input class="input" id="is-invoice-reg" value="${escapeHtml(iss.invoiceRegNo)}" placeholder="T + 13桁"></div>
    </div>
    <h3 class="section-title" style="margin-top:22px;">振込先</h3>
    <div class="field-row">
      <div class="field"><label class="field__label">銀行名</label><input class="input" id="is-bank-name" value="${escapeHtml(iss.bankName)}"></div>
      <div class="field"><label class="field__label">支店名</label><input class="input" id="is-bank-branch" value="${escapeHtml(iss.bankBranch)}"></div>
    </div>
    <div class="field-row">
      <div class="field">
        <label class="field__label">口座種別</label>
        <select class="select" id="is-bank-type">
          <option value="普通" ${iss.bankAccountType === '普通' ? 'selected' : ''}>普通</option>
          <option value="当座" ${iss.bankAccountType === '当座' ? 'selected' : ''}>当座</option>
        </select>
      </div>
      <div class="field"><label class="field__label">口座番号</label><input class="input" id="is-bank-number" value="${escapeHtml(iss.bankAccountNumber)}"></div>
    </div>
    <div class="field"><label class="field__label">口座名義</label><input class="input" id="is-bank-holder" value="${escapeHtml(iss.bankAccountHolder)}"></div>
    <div class="field__hint" id="is-validation"></div>
  `;
}

function wireIssuerSettings(overlay) {
  const fieldMap = {
    'is-name': 'name', 'is-tel': 'tel', 'is-address': 'address', 'is-email': 'email',
    'is-invoice-reg': 'invoiceRegNo', 'is-bank-name': 'bankName', 'is-bank-branch': 'bankBranch',
    'is-bank-type': 'bankAccountType', 'is-bank-number': 'bankAccountNumber', 'is-bank-holder': 'bankAccountHolder',
  };
  Object.entries(fieldMap).forEach(([elId, field]) => {
    const node = $('#' + elId, overlay);
    if (!node) return;
    node.addEventListener('change', () => {
      const val = node.value.trim();
      if (field === 'invoiceRegNo' && val && !/^T\d{13}$/.test(val)) {
        $('#is-validation', overlay).textContent = 'インボイス登録番号はTから始まる13桁の数字で入力してください（例: T1234567890123）。';
      } else {
        $('#is-validation', overlay).textContent = '';
      }
      state.settings.issuer[field] = val;
      saveState();
    });
  });
}

/* ---- バックアップ ---- */
function backupSettingsHtml() {
  return `
    <h3 class="section-title">データのバックアップ</h3>
    <p class="field__hint" style="margin-bottom:14px;">案件・クライアント・経費・請求書などのデータをJSONファイルとして書き出せます。※作品画像・領収書画像は含まれません。</p>
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <button class="btn btn--primary" type="button" data-action="export-backup">JSONを書き出す</button>
      <button class="btn" type="button" id="import-backup-btn">JSONを読み込む</button>
      <input type="file" id="import-backup-file" accept="application/json" style="display:none;">
    </div>
    <h3 class="section-title" style="margin-top:28px">完全バックアップ</h3>
    <p class="field__hint" style="margin-bottom:14px">作品・領収書画像も含めて1つのJSONに保存します。画像数によってファイルサイズが大きくなります。</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn btn--primary" data-action="export-full-backup">完全バックアップを書き出す（画像込み）</button><button type="button" class="btn" id="import-full-backup-btn">完全バックアップを読み込む</button><input type="file" id="import-full-backup-file" accept="application/json" style="display:none"></div>
  `;
}

function blobToDataUrl(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});}
function dataUrlToBlob(url){const parts=String(url).split(',');const mime=(parts[0].match(/data:([^;]+)/)||[])[1]||'application/octet-stream';const bytes=atob(parts[1]||'');const arr=new Uint8Array(bytes.length);for(let i=0;i<bytes.length;i++)arr[i]=bytes.charCodeAt(i);return new Blob([arr],{type:mime});}
async function exportFullBackup(){const images=await imageGetAll();const encoded=[];for(const row of images)encoded.push({id:row.id,dataUrl:await blobToDataUrl(row.blob)});state.settings.lastBackupAt=todayStr();saveState();const payload={format:'tsukuroute-full-backup',version:1,exportedAt:new Date().toISOString(),data:JSON.parse(JSON.stringify(state)),images:encoded};downloadBlob(new Blob([JSON.stringify(payload)],{type:'application/json'}),`tsukuroute-backup-${todayStr()}.json`);}
async function importFullBackup(text){const payload=JSON.parse(text);if(!payload||payload.format!=='tsukuroute-full-backup'||!payload.data||!Array.isArray(payload.images))throw new Error('invalid backup');state=migrateData(payload.data);const obsolete=new Set(pendingHeaderImageDeletes);await imageReplaceAll(payload.images.filter((row)=>!obsolete.has(row.id)).map((row)=>({id:row.id,blob:dataUrlToBlob(row.dataUrl)})));obsolete.forEach((id)=>pendingHeaderImageDeletes.delete(id));saveState();applyAccentTheme(state.settings.accentColor);}

function wireBackupSettings(overlay) {
  $('#import-backup-btn', overlay).addEventListener('click', () => $('#import-backup-file', overlay).click());
  $('#import-backup-file', overlay).addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!confirm('現在のデータはすべて上書きされます（画像データは影響を受けません）。よろしいですか？')) { e.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importBackupJson(reader.result);
        showToast('バックアップを読み込みました');
        closeModal();
        renderCurrentTab();
      } catch (err) {
        console.error(err);
        showToast('読み込みに失敗しました: 不正なファイルです', 'error');
      }
    };
    reader.readAsText(file);
  });
  $('#import-full-backup-btn',overlay).addEventListener('click',()=>$('#import-full-backup-file',overlay).click());
  $('#import-full-backup-file',overlay).addEventListener('change',(e)=>{const file=e.target.files[0];if(!file)return;if(!confirm('現在のデータと画像を完全バックアップの内容で上書きします。よろしいですか？')){e.target.value='';return;}const reader=new FileReader();reader.onload=async()=>{try{await importFullBackup(reader.result);showToast('完全バックアップを復元しました');closeModal();renderCurrentTab();}catch(err){console.error(err);showToast('完全バックアップの読み込みに失敗しました','error');}};reader.readAsText(file);});
}

/* ===================== オンボーディング ===================== */

function openWelcomeModal() {
  const overlay = openModal(`<div class="welcome-modal"><div class="welcome-mark">${ICONS.check}</div><h2>${escapeHtml(APP_NAME)}へようこそ</h2><p>案件と納期から、工程をかんたんに自動計画。</p><p>売上・経費・請求書をひとつに整理。</p><p>納品作品は、そのままポートフォリオの記録に。</p><div class="welcome-actions"><button type="button" class="btn" id="welcome-empty">最初から使う</button></div></div>`, { narrow:true });
  $('#welcome-empty', overlay).addEventListener('click', () => { state.settings.onboardingDone = true; saveState(); closeModal(); startTour(); });
}

const TOUR_STEPS = [
  { tab:'home', selector:'.tab-btn[data-tab="home"]', title:'ホーム', text:'売上と直近のタスクを、ひと目で確認できます。' },
  { tab:'calendar', selector:'.tab-btn[data-tab="calendar"]', title:'カレンダー', text:'すべての案件の工程期限と納期を、リスト・月・週・予定で確認できます。' },
  { tab:'projects', selector:'.tab-btn[data-tab="projects"]', title:'案件と作品', text:'案件の進行管理と、納品作品のアルバムを切り替えて確認できます。' },
  { tab:'money', selector:'.tab-btn[data-tab="money"]', title:'お金', text:'請求書の作成と、確定申告に使う売上・経費を記録できます。' },
  { tab:null, selector:'#openSettingsBtn', title:'設定', text:'工程テンプレートの日数を、自分の作業ペースに合わせて編集できます。' },
];
let tourIndex = 0;
function startTour() { closeModal(); tourIndex = 0; showTourStep(); }
function endTour() { const root = $('#tourRoot'); if (root) root.remove(); state.settings.onboardingDone = true; saveState(); }
function showTourStep() {
  const step = TOUR_STEPS[tourIndex]; if (!step) { endTour(); return; }
  if (step.tab) switchTab(step.tab);
  let target = $(step.selector);
  if (!target || getComputedStyle(target).display === 'none') target = $(`.tabbar__btn[data-tab="${step.tab||'settings'}"]`) || target;
  const rect = target ? target.getBoundingClientRect() : { left:20, top:20, width:40, height:40, bottom:60 };
  let root = $('#tourRoot'); if (root) root.remove(); root = document.createElement('div'); root.id = 'tourRoot'; root.className = 'tour-overlay';
  const margin=16, gap=14, popWidth=Math.min(310,window.innerWidth-margin*2), popHeight=210;
  const isBottomNav=!!(target&&target.closest('.tabbar')); const showAbove=isBottomNav||rect.top>window.innerHeight/2;
  const top=Math.max(margin,Math.min(window.innerHeight-popHeight-margin,showAbove?rect.top-popHeight-gap:rect.bottom+gap));
  const left=Math.max(margin,Math.min(window.innerWidth-popWidth-margin,rect.left+rect.width/2-popWidth/2));
  root.innerHTML = `<div class="tour-highlight" style="left:${rect.left-6}px;top:${rect.top-6}px;width:${rect.width+12}px;height:${rect.height+12}px"></div><div class="tour-popover" style="left:${left}px;top:${top}px"><div class="tour-step">${tourIndex+1} / ${TOUR_STEPS.length}</div><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p><div><button type="button" class="text-link" data-action="skip-tour">スキップ</button><button type="button" class="btn btn--primary" data-action="next-tour">${tourIndex === TOUR_STEPS.length-1 ? '完了' : '次へ'}</button></div></div>`;
  document.body.appendChild(root);
}

/* ===================== グローバル委譲クリックハンドラ ===================== */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  if (btn.tagName === 'BUTTON' && !btn.hasAttribute('type')) btn.type = 'button';
  const action = btn.dataset.action;

  switch (action) {
    case 'reset-demo-data':
      if(IS_DEMO_MODE)resetDemoData().catch((error)=>{console.error(error);showToast('デモデータをリセットできませんでした','error');});
      break;

    case 'close-modal':
      closeModal();
      break;

    case 'close-more-sheet':
      if (e.target.classList.contains('sheet-overlay')) closeMoreSheet();
      break;

    case 'open-new-project':
      openNewProjectModal();
      break;

    case 'set-projects-section':
      projectsSectionMode=btn.dataset.section==='gallery'?'gallery':'projects';renderProjectsTab();break;

    case 'show-all-works':
      projectsSectionMode='gallery';switchTab('projects');break;

    case 'edit-avatar': openAvatarModal();break;
    case 'reset-avatar': {const id=state.settings.avatarImageId;state.settings.avatarImageId=null;saveState();if(id)imageDelete(id);closeModal();renderHome();break;}

    case 'filter-project-status':
      projectsStatusFilter=btn.dataset.status==='done'?'done':'in_progress'; renderProjectsTab(); break;

    case 'back-to-expenses':
      moneySubTab='expenses'; renderMoneyTab(); break;

    case 'home-month-prev':
      homeMonth = new Date(homeMonth.getFullYear(), homeMonth.getMonth() - 1, 1);
      renderHome();
      break;

    case 'home-month-next':
      homeMonth = new Date(homeMonth.getFullYear(), homeMonth.getMonth() + 1, 1);
      renderHome();
      break;

    case 'home-money-card':
      moneySubTab=btn.dataset.subtab||'ledger'; switchTab('money');
      break;

    case 'quick-add-expense':
      openQuickExpenseModal();
      break;

    case 'calendar-today':
      state.settings.calendarDate = todayStr();
      saveState(); renderCalendar();
      break;

    case 'calendar-prev':
    case 'calendar-next': {
      const direction = action === 'calendar-next' ? 1 : -1;
      const anchor = parseDateStr(state.settings.calendarDate || todayStr());
      if (state.settings.calendarView === 'month') { anchor.setDate(1); anchor.setMonth(anchor.getMonth() + direction); }
      else anchor.setDate(anchor.getDate() + direction * (state.settings.calendarView === 'today' ? 1 : state.settings.calendarView === 'week' ? 7 : 30));
      state.settings.calendarDate = toDateStr(anchor);
      saveState(); renderCalendar();
      break;
    }

    case 'calendar-show-day':
      state.settings.calendarView = 'schedule';
      state.settings.calendarDate = btn.dataset.date;
      saveState(); renderCalendar();
      break;

    case 'calendar-set-view':
      state.settings.calendarView=btn.dataset.view;
      if (state.settings.calendarView === 'today') state.settings.calendarDate = todayStr();
      saveState(); renderCalendar();
      break;

    case 'calendar-open-day':
      openCalendarDaySheet(btn.dataset.date);
      break;

    case 'close-calendar-day':
      closeMoreSheet();
      break;

    case 'calendar-sheet-project':
      closeMoreSheet(); openProjectDetailModal(btn.dataset.projectId);
      break;

    case 'toggle-calendar-sheet-step': {
      const p=state.projects.find((project)=>project.id===btn.dataset.projectId); if(!p)break;
      const step=p.steps.find((item)=>item.id===btn.dataset.stepId); if(!step)break;
      toggleStep(p,step.id,!step.done); saveState(); renderCalendar(); openCalendarDaySheet(btn.dataset.date);
      break;
    }

    case 'toggle-calendar-step': {
      const p = state.projects.find((project) => project.id === btn.dataset.projectId);
      if (!p) break;
      const step = p.steps.find((item) => item.id === btn.dataset.stepId);
      if (!step) break;
      toggleStep(p, step.id, !step.done);
      saveState(); renderCalendar();
      break;
    }

    case 'open-template-settings':
      openSettingsModal({ initialTab:'template', stack:true, returnToProject:true });
      break;

    case 'open-backup-settings':
      openSettingsModal({ initialTab:'backup' });
      break;

    case 'toggle-withholding-help': {
      const popover = $('.field-help-popover', btn.closest('.withholding-help-wrap'));
      if (popover) popover.hidden = !popover.hidden;
      break;
    }

    case 'open-project':
      if(projectSelectionMode)break;
      openProjectDetailModal(btn.dataset.projectId);
      break;

    case 'toggle-project-select-mode':
      projectSelectionMode=!projectSelectionMode;selectedProjectIds.clear();renderProjectsTab();break;

    case 'toggle-project-selection':
      if(selectedProjectIds.has(btn.dataset.projectId))selectedProjectIds.delete(btn.dataset.projectId);else selectedProjectIds.add(btn.dataset.projectId);renderProjectsTab();break;

    case 'bulk-project-billed':
    case 'bulk-project-paid': {
      const status=action==='bulk-project-paid'?'paid':'billed';
      state.projects.filter((project)=>selectedProjectIds.has(project.id)).forEach((project)=>setProjectPaymentStatus(project,status));
      selectedProjectIds.clear();saveState();renderCurrentTab();showToast(status==='paid'?'選択した案件を入金済みにしました':'選択した案件を請求済みにしました');break;
    }

    case 'delete-project': {
      if (!confirm('この案件を削除します。関連する画像も削除されます。よろしいですか？')) break;
      const id = btn.dataset.projectId;
      const p = state.projects.find((x) => x.id === id);
      if (p) (p.imageIds || []).forEach((imgId) => imageDelete(imgId));
      state.invoices = state.invoices.filter((iv) => iv.projectId !== id);
      state.expenses = state.expenses.filter((expense) => expense.autoProjectId !== id);
      state.projects = state.projects.filter((x) => x.id !== id);
      saveState();
      closeModal();
      renderCurrentTab();
      showToast('案件を削除しました');
      break;
    }

    case 'toggle-step': {
      const p = state.projects.find((x) => x.id === btn.dataset.projectId);
      if (!p) break;
      toggleStep(p, btn.dataset.stepId, true);
      saveState();
      renderCurrentTab();
      showToast('工程を完了しました');
      break;
    }

    case 'toggle-step-detail': {
      const overlayEl = document.getElementById('activeModalOverlay');
      const projectId = currentDetailProjectId(overlayEl);
      const p = state.projects.find((x) => x.id === projectId);
      if (!p) break;
      const step = p.steps.find((s) => s.id === btn.dataset.stepId);
      if (!step) break;
      toggleStep(p, step.id, !step.done);
      saveState();
      refreshProjectDetail(overlayEl, projectId);
      renderCurrentTab();
      break;
    }

    case 'save-close-project':
      saveState(); closeModal(); renderCurrentTab(); showToast('保存しました');
      break;

    case 'add-step': {
      const p = state.projects.find((x) => x.id === btn.dataset.projectId);
      if (!p) break;
      const name = (window.prompt('工程名を入力してください', '新しい工程') || '').trim();
      if (!name) break;
      const lastDue = p.steps.length ? p.steps[p.steps.length - 1].dueDate : p.dueDate;
      p.steps.push({ id: uuid(), name, startDate: lastDue || todayStr(), dueDate: lastDue || todayStr(), days:1, done: false, doneAt: null });
      recomputeProjectStatus(p);
      saveState();
      refreshProjectDetail(document.getElementById('activeModalOverlay'), p.id);
      renderCurrentTab();
      break;
    }

    case 'remove-step': {
      const overlayEl = document.getElementById('activeModalOverlay');
      const projectId = currentDetailProjectId(overlayEl);
      const p = state.projects.find((x) => x.id === projectId);
      if (!p) break;
      if (p.steps.length <= 1) { showToast('工程は1つ以上必要です', 'error'); break; }
      if (!confirm('この工程を削除します。よろしいですか？')) break;
      p.steps = p.steps.filter((s) => s.id !== btn.dataset.stepId);
      recomputeProjectStatus(p);
      saveState();
      refreshProjectDetail(overlayEl, projectId);
      renderCurrentTab();
      break;
    }

    case 'set-payment-status': {
      const p = state.projects.find((x) => x.id === btn.dataset.projectId);
      if (!p) break;
      setProjectPaymentStatus(p,btn.dataset.status);
      saveState();
      refreshProjectDetail(document.getElementById('activeModalOverlay'), p.id);
      renderCurrentTab();
      break;
    }

    case 'remove-project-image': {
      const p = state.projects.find((x) => x.id === btn.dataset.projectId);
      if (!p) break;
      if (!confirm('この画像を削除します。よろしいですか？')) break;
      const imgId = btn.dataset.imageId;
      p.imageIds = p.imageIds.filter((x) => x !== imgId);
      imageDelete(imgId);
      saveState();
      refreshProjectDetail(document.getElementById('activeModalOverlay'), p.id);
      renderCurrentTab();
      break;
    }

    case 'view-image':
      openImageLightbox(btn.dataset.imageViewId || btn.dataset.imageId);
      break;

    case 'create-invoice-from-project': {
      const projectId = btn.dataset.projectId;
      closeModal();
      openInvoiceFormModal({ projectId });
      break;
    }

    case 'compose-project-message': {
      const project=state.projects.find((item)=>item.id===btn.dataset.projectId);if(!project)break;openMessageComposeModal(projectMessageVars(project));break;
    }

    case 'open-settings':
      openSettingsModal();
      break;

    case 'open-settings-detail': {
      const overlayEl = document.getElementById('activeModalOverlay');
      if (overlayEl) {
        settingsTab = btn.dataset.setting;
        if (settingsTab !== 'recurring') settingsEditingRecurringId = null;
        renderSettingsModal(overlayEl);
      } else {
        openSettingsModal({ initialTab:btn.dataset.setting, fromSettingsView:true });
      }
      break;
    }

    case 'settings-back': {
      settingsTab = null;
      settingsEditingRecurringId = null;
      const overlayEl = document.getElementById('activeModalOverlay');
      if (settingsModalFromView) {
        settingsModalFromView = false;
        closeModal();
        renderSettingsView();
      } else if (overlayEl) renderSettingsModal(overlayEl);
      break;
    }

    case 'edit-recurring-expense':
      settingsEditingRecurringId=btn.dataset.recurringId;
      {const overlayEl=document.getElementById('activeModalOverlay');if(overlayEl)wireSettingsModal(overlayEl);}
      break;

    case 'cancel-recurring-expense-edit':
      settingsEditingRecurringId=null;
      {const overlayEl=document.getElementById('activeModalOverlay');if(overlayEl)wireSettingsModal(overlayEl);}
      break;

    case 'toggle-recurring-expense': {
      const recurring=state.recurringExpenses.find((item)=>item.id===btn.dataset.recurringId);if(!recurring)break;
      recurring.active=!recurring.active;if(recurring.active)generateRecurringExpensesThroughCurrentMonth();saveState();
      {const overlayEl=document.getElementById('activeModalOverlay');if(overlayEl)wireSettingsModal(overlayEl);}renderCurrentTab();
      break;
    }

    case 'delete-recurring-expense': {
      if(!confirm('この定期経費を削除しますか？過去に作成された経費は残ります。'))break;
      state.recurringExpenses=state.recurringExpenses.filter((item)=>item.id!==btn.dataset.recurringId);settingsEditingRecurringId=null;saveState();
      {const overlayEl=document.getElementById('activeModalOverlay');if(overlayEl)wireSettingsModal(overlayEl);}renderCurrentTab();
      break;
    }

    case 'set-accent-color':
      state.settings.accentColor=normalizeHex(btn.dataset.color)||'#687EE7'; saveState(); applyAccentTheme(state.settings.accentColor);
      { const overlayEl=document.getElementById('activeModalOverlay'); if(overlayEl) wireSettingsModal(overlayEl); }
      break;

    case 'set-appearance':
      if(!['light','dark','system'].includes(btn.dataset.appearance))break;state.settings.appearance=btn.dataset.appearance;saveState();applyAppearance();{const overlayEl=document.getElementById('activeModalOverlay');if(overlayEl)wireSettingsModal(overlayEl);}break;

    case 'add-price-item':
      state.settings.priceList.push({id:uuid(),category:'基本料金',name:'新しい項目',price:0,type:'fixed'});saveState();{const overlayEl=document.getElementById('activeModalOverlay');if(overlayEl)wireSettingsModal(overlayEl);}break;

    case 'delete-price-item':
      if(!confirm('この単価項目を削除しますか？'))break;state.settings.priceList.splice(Number(btn.dataset.idx),1);saveState();{const overlayEl=document.getElementById('activeModalOverlay');if(overlayEl)wireSettingsModal(overlayEl);}break;

    case 'add-message-template':
      state.settings.messageTemplates.push({id:uuid(),category:'その他',name:'新しいテンプレート',body:''});saveState();{const overlayEl=document.getElementById('activeModalOverlay');if(overlayEl)wireSettingsModal(overlayEl);}break;

    case 'delete-message-template':
      if(!confirm('このメッセージテンプレートを削除しますか？'))break;state.settings.messageTemplates.splice(Number(btn.dataset.idx),1);saveState();{const overlayEl=document.getElementById('activeModalOverlay');if(overlayEl)wireSettingsModal(overlayEl);}break;

    case 'add-platform': state.settings.platforms.push({id:uuid(),name:'新しいプラットフォーム',feeRate:0});saveState();{const overlayEl=document.getElementById('activeModalOverlay');if(overlayEl)wireSettingsModal(overlayEl);}break;
    case 'delete-platform': {if(state.projects.some((project)=>project.platformId===btn.dataset.platformId)){showToast('使用中のプラットフォームは削除できません','error');break;}state.settings.platforms=state.settings.platforms.filter((item)=>item.id!==btn.dataset.platformId);saveState();{const overlayEl=document.getElementById('activeModalOverlay');if(overlayEl)wireSettingsModal(overlayEl);}break;}

    case 'add-template-row': {
      const prefix = btn.dataset.prefix || 'tpl';
      if (prefix === 'tpl') {
        state.settings.defaultTemplate.push({ name: '新しい工程', days: 1 });
      } else {
        const c = getClientById(settingsSelectedClientId);
        if (c) { if (!c.templateOverride) c.templateOverride = []; c.templateOverride.push({ name: '新しい工程', days: 1 }); }
      }
      saveState();
      { const overlayEl = document.getElementById('activeModalOverlay'); if (overlayEl) wireSettingsModal(overlayEl); }
      break;
    }

    case 'remove-template-row': {
      const prefix = btn.dataset.prefix || 'tpl';
      const idx = Number(btn.dataset.idx);
      const arr = prefix === 'tpl' ? state.settings.defaultTemplate : ((getClientById(settingsSelectedClientId) || {}).templateOverride);
      if (arr && arr.length > 1) { arr.splice(idx, 1); saveState(); }
      else showToast('工程は1つ以上必要です', 'error');
      { const overlayEl = document.getElementById('activeModalOverlay'); if (overlayEl) wireSettingsModal(overlayEl); }
      break;
    }

    case 'add-client': {
      const input = document.getElementById('new-client-name');
      const name = input.value.trim();
      if (!name) { showToast('クライアント名を入力してください', 'error'); break; }
      state.clients.push({ id: uuid(), name, templateOverride: null });
      saveState();
      { const overlayEl = document.getElementById('activeModalOverlay'); if (overlayEl) wireSettingsModal(overlayEl); }
      break;
    }

    case 'delete-client': {
      const clientId = btn.dataset.clientId;
      const used = state.projects.some((p) => p.clientId === clientId);
      const msg = used ? 'このクライアントは案件で使用されています。削除しても案件側のクライアント名表示は残ります。削除しますか？' : 'このクライアントを削除します。よろしいですか？';
      if (!confirm(msg)) break;
      state.clients = state.clients.filter((c) => c.id !== clientId);
      saveState();
      { const overlayEl = document.getElementById('activeModalOverlay'); if (overlayEl) wireSettingsModal(overlayEl); }
      renderCurrentTab();
      break;
    }

    case 'export-backup':
      exportBackupJson();
      showToast('バックアップを書き出しました');
      break;

    case 'export-full-backup':
      exportFullBackup().then(()=>showToast('完全バックアップを書き出しました')).catch((err)=>{console.error(err);showToast('完全バックアップの書き出しに失敗しました','error');});
      break;

    case 'switch-money-subtab':
      moneySubTab = btn.dataset.subtab;
      editingExpenseId = null;
      renderMoneyTab();
      break;

    case 'edit-expense':
      if ((state.expenses.find((expense)=>expense.id===btn.dataset.expenseId)||{}).autoProjectId) { showToast('案件側で自動管理されています', 'error'); break; }
      editingExpenseId = btn.dataset.expenseId;
      renderMoneyTab();
      break;

    case 'cancel-edit-expense':
      editingExpenseId = null;
      renderMoneyTab();
      break;

    case 'go-expense-guide':
      moneySubTab = 'summary'; renderMoneyTab();
      requestAnimationFrame(() => { const guide = $('#expenseGuide'); if (guide) { guide.open = true; guide.scrollIntoView({ behavior:'smooth', block:'start' }); } });
      break;

    case 'restart-tour':
      closeModal(); closeMoreSheet(); startTour();
      break;

    case 'next-tour':
      tourIndex += 1; showTourStep();
      break;

    case 'skip-tour':
      endTour();
      break;

    case 'money-year-prev':
      moneyYear -= 1;
      if(moneySubTab==='ledger')ledgerMonth=new Date(moneyYear,ledgerMonth.getMonth(),1);
      renderMoneyTab();
      break;

    case 'money-year-next':
      moneyYear += 1;
      if(moneySubTab==='ledger')ledgerMonth=new Date(moneyYear,ledgerMonth.getMonth(),1);
      renderMoneyTab();
      break;

    case 'ledger-month-prev':
    case 'ledger-month-next': {
      const direction=action==='ledger-month-next'?1:-1;ledgerMonth=new Date(ledgerMonth.getFullYear(),ledgerMonth.getMonth()+direction,1);moneyYear=ledgerMonth.getFullYear();renderMoneyTab();break;
    }

    case 'select-ledger-month':
      ledgerMonth=new Date(Number(btn.dataset.year),Number(btn.dataset.month),1);moneyYear=ledgerMonth.getFullYear();renderMoneyTab();
      break;

    case 'export-ledger-csv':
      exportLedgerCsv(Number(btn.dataset.year));
      break;

    case 'export-expenses-csv':
      exportExpensesCsv(Number(btn.dataset.year));
      break;

    case 'filter-expense-category':
      expenseCategoryFilter = btn.dataset.category;
      selectedExpenseIds.clear();
      renderMoneyTab();
      break;

    case 'toggle-expense-select-mode':
      expenseSelectionMode=!expenseSelectionMode;selectedExpenseIds.clear();renderMoneyTab();break;

    case 'toggle-expense-selection': {
      const expense=state.expenses.find((item)=>item.id===btn.dataset.expenseId);
      if(!expense||expense.autoProjectId||expense.autoRecurringId)break;
      if(selectedExpenseIds.has(expense.id))selectedExpenseIds.delete(expense.id);else selectedExpenseIds.add(expense.id);
      renderMoneyTab();break;
    }

    case 'bulk-expense-category': {
      const select=$('#bulkExpenseCategory');const category=select&&select.value;
      if(!category)break;
      state.expenses.filter((expense)=>selectedExpenseIds.has(expense.id)&&!expense.autoProjectId&&!expense.autoRecurringId).forEach((expense)=>{expense.category=category;expense.updatedAt=new Date().toISOString();});
      selectedExpenseIds.clear();saveState();renderMoneyTab();showToast('選択した経費のカテゴリを変更しました');break;
    }

    case 'bulk-delete-expenses': {
      const targets=state.expenses.filter((expense)=>selectedExpenseIds.has(expense.id)&&!expense.autoProjectId&&!expense.autoRecurringId);
      if(!targets.length||!confirm(`${targets.length}件の経費を削除します。よろしいですか？`))break;
      targets.forEach((expense)=>{if(expense.receiptImageId)imageDelete(expense.receiptImageId);});
      const ids=new Set(targets.map((expense)=>expense.id));state.expenses=state.expenses.filter((expense)=>!ids.has(expense.id));selectedExpenseIds.clear();saveState();renderMoneyTab();showToast('選択した経費を削除しました');break;
    }

    case 'delete-expense': {
      if (!confirm('この経費を削除します。よろしいですか？')) break;
      const exp = state.expenses.find((x) => x.id === btn.dataset.expenseId);
      if (exp && exp.autoProjectId) { showToast('案件側で自動管理されています', 'error'); break; }
      if (exp && exp.autoRecurringId) { showToast('定期経費から自動生成された経費は、この月を編集できます', 'error'); break; }
      if (exp && exp.receiptImageId) imageDelete(exp.receiptImageId);
      state.expenses = state.expenses.filter((x) => x.id !== btn.dataset.expenseId);
      if (editingExpenseId === btn.dataset.expenseId) editingExpenseId = null;
      saveState();
      renderMoneyTab();
      break;
    }

    case 'new-invoice':
      openInvoiceFormModal({});
      break;

    case 'new-quote':
      openQuoteFormModal();
      break;

    case 'open-easy-estimate':
      openEasyEstimateModal();
      break;

    case 'open-quote':
      openQuotePreviewModal(btn.dataset.quoteId);
      break;

    case 'edit-quote':
      closeModal(); openQuoteFormModal(btn.dataset.quoteId);
      break;

    case 'delete-quote':
      deleteQuote(btn.dataset.quoteId);
      break;

    case 'save-quote-jpg':
      saveQuoteAsJpg(btn.dataset.quoteId);
      break;

    case 'share-quote-jpg':
      saveQuoteAsJpg(btn.dataset.quoteId,true);
      break;

    case 'export-quote-csv':
      exportDocumentItemsCsv('quote',btn.dataset.quoteId);
      break;

    case 'convert-quote-invoice': {
      const q=state.quotes.find((item)=>item.id===btn.dataset.quoteId);if(!q)break;q.status='accepted';ensureQuoteIssuerSnapshot(q);
      const items=q.items.map((item)=>({name:item.name,qty:item.qty,unit:item.unit||'式',unitPrice:item.unitPrice}));if(q.rushEnabled)items.push({name:`特急対応（+${Math.round(q.rushRate*100)}%）`,qty:1,unit:'式',unitPrice:quoteRush(q)});saveState();closeModal();openInvoiceFormModal({prefill:{clientName:q.clientName,subject:q.subject,items}});break;
    }

    case 'open-price-list-settings': {
      closeModal();openSettingsModal({initialTab:'priceList'});break;
    }

    case 'open-invoice':
      openInvoicePreviewModal(btn.dataset.invoiceId);
      break;

    case 'edit-invoice': {
      const invId = btn.dataset.invoiceId;
      closeModal();
      openInvoiceFormModal({ invoiceId: invId });
      break;
    }

    case 'delete-invoice':
      deleteInvoice(btn.dataset.invoiceId);
      break;

    case 'mark-invoice-paid':
      markInvoicePaid(btn.dataset.invoiceId);
      break;

    case 'compose-invoice-reminder': {
      const invoice=state.invoices.find((item)=>item.id===btn.dataset.invoiceId);if(!invoice)break;openMessageComposeModal(invoiceMessageVars(invoice),'入金のお願い（催促）');break;
    }

    case 'print-invoice':
      window.print();
      break;

    case 'save-invoice-jpg':
      saveInvoiceAsJpg(btn.dataset.invoiceId);
      break;

    case 'share-invoice-jpg':
      saveInvoiceAsJpg(btn.dataset.invoiceId,true);
      break;

    case 'export-invoice-csv':
      exportDocumentItemsCsv('invoice',btn.dataset.invoiceId);
      break;

    case 'add-gallery-item':
      openAddGalleryItemModal();
      break;

    case 'open-gallery-item':
      openGalleryItemModal(btn.dataset.key);
      break;

    case 'delete-gallery-extra':
      deleteGalleryExtra(btn.dataset.extraId);
      break;

    default:
      break;
  }
});

/* ===================== 初期化 ===================== */
function initTabsNav() {
  $all('.tab-btn').forEach((btn) => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
  $all('.tabbar__btn').forEach((btn) => btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
  }));
  const settingsBtn = $('#openSettingsBtn');
  if (settingsBtn) settingsBtn.addEventListener('click', () => switchTab('settings'));
  const newProjectBtn = $('#newProjectBtn');
  if (newProjectBtn) newProjectBtn.addEventListener('click', openNewProjectModal);
}

function init() {
  document.title = `${APP_NAME} — 案件管理`;
  if(IS_DEMO_MODE){document.documentElement.classList.add('demo-mode');const banner=$('#demoBanner');if(banner)banner.hidden=false;}
  const appTitle = $('.app-header__title');
  if (appTitle) appTitle.textContent = APP_NAME;
  if (shouldPersistLoadedState) { syncAllAutoProjectExpenses(); generateRecurringExpensesThroughCurrentMonth(); saveState(); }
  cleanupObsoleteHeaderImages().catch((error)=>console.warn('旧バナー画像の削除に失敗しました',error));
  applyAppearance();
  initTabsNav();
  const onSystemAppearanceChange=()=>{if(state.settings.appearance==='system')applyAppearance();};
  if(appearanceMedia.addEventListener)appearanceMedia.addEventListener('change',onSystemAppearanceChange);else appearanceMedia.addListener(onSystemAppearanceChange);
  renderCurrentTab();
  if(IS_DEMO_MODE)seedDemoImages().catch((error)=>console.error('デモ画像の生成に失敗しました',error));
  let wasMobile=window.matchMedia('(max-width: 767px)').matches;
  window.addEventListener('resize',()=>{const isMobile=window.matchMedia('(max-width: 767px)').matches;if(isMobile!==wasMobile){wasMobile=isMobile;if(currentTab==='calendar')renderCalendar();}const modal=document.getElementById('activeModalOverlay');if(modal)fitA4Preview(modal);fitDocumentMiniatures(document);});
  const hasExistingData = state.projects.length || state.clients.length || state.expenses.length || state.recurringExpenses.length || state.invoices.length || state.galleryExtras.length;
  if (!state.settings.onboardingDone) {
    if (hasExistingData) { state.settings.onboardingDone = true; saveState(); }
    else setTimeout(openWelcomeModal, 150);
  }
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch((error)=>console.warn('Service Worker registration failed',error));
  }
}

document.addEventListener('DOMContentLoaded', init);
