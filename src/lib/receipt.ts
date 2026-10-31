/**
 * Transaction receipts. The receipt is drawn once on a canvas so the preview,
 * PNG, JPG and PDF all look identical in every browser (no HTML-to-image quirks
 * on iOS Safari). The PDF is a single page holding a high-resolution JPEG.
 */

export type ReceiptStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'DECLINED' | 'REVERSED';
export type ReceiptFormat = 'pdf' | 'png' | 'jpg';

export interface ReceiptParty {
  role: string;
  name: string;
  lines: string[];
}

export interface ReceiptRow {
  label: string;
  value: string;
  mono?: boolean;
}

export interface ReceiptData {
  title: string;
  amountLabel: string;
  amount: number;
  currency: string;
  status: ReceiptStatus;
  reference: string;
  date: Date;
  parties: ReceiptParty[];
  rows: ReceiptRow[];
  note?: string;
}

// ─── Design tokens (match the emails) ────────────────────────────────────────
const C = {
  blue: '#2563eb',
  blueDark: '#1e40af',
  tint: '#eff6ff',
  soft: '#dbeafe',
  border: '#bfdbfe',
  ink: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  faint: '#94a3b8',
  line: '#e2e8f0',
  hair: '#f1f5f9',
  page: '#f1f5f9',
};
const SANS = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const CARD_W = 560;
const MARGIN = 28;
const PAD = 36;
const HEADER_H = 104;
const RADIUS = 18;
const NOTCH = 11;
const TOOTH = 7;
const CONTENT_W = CARD_W - PAD * 2;
// iOS Safari refuses canvases above ~16.7M pixels
const MAX_PIXELS = 16_000_000;

const STATUS: Record<ReceiptStatus, { label: string; fg: string; bg: string }> = {
  SUCCESSFUL: { label: 'Completed', fg: C.blue, bg: C.tint },
  PENDING: { label: 'Processing', fg: C.blueDark, bg: C.tint },
  FAILED: { label: 'Not completed', fg: '#475569', bg: C.hair },
  DECLINED: { label: 'Declined', fg: '#475569', bg: C.hair },
  REVERSED: { label: 'Reversed', fg: C.blueDark, bg: C.tint },
};

// ─── Formatting ──────────────────────────────────────────────────────────────
export const maskAccount = (account: string) =>
  account.length > 4 ? `••••${account.slice(-4)}` : account;

export const formatReceiptDate = (date: Date) =>
  date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

const formatAmount = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(amount);
  } catch {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
};

// ─── Canvas helpers ──────────────────────────────────────────────────────────
type Ctx = CanvasRenderingContext2D;
type Op = (ctx: Ctx) => void;

const font = (size: number, weight = 400, family = SANS) => `${weight} ${size}px ${family}`;

// Baseline that vertically centres a line of text (cap height ≈ 0.72em) in its line box
const baseline = (top: number, lineHeight: number, size: number) => top + lineHeight / 2 + size * 0.36;

const setTracking = (ctx: Ctx, px: number) => {
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`;
};

interface TextStyle {
  size: number;
  weight?: number;
  color: string;
  align?: CanvasTextAlign;
  mono?: boolean;
  tracking?: number;
}

const drawText = (ctx: Ctx, text: string, x: number, y: number, s: TextStyle) => {
  ctx.font = font(s.size, s.weight, s.mono ? MONO : SANS);
  ctx.fillStyle = s.color;
  ctx.textAlign = s.align ?? 'left';
  ctx.textBaseline = 'alphabetic';
  setTracking(ctx, s.tracking ?? 0);
  ctx.fillText(text, x, y);
  setTracking(ctx, 0);
};

const wrap = (ctx: Ctx, text: string, maxWidth: number, s: TextStyle): string[] => {
  ctx.font = font(s.size, s.weight, s.mono ? MONO : SANS);
  const fits = (value: string) => ctx.measureText(value).width <= maxWidth;
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (fits(candidate)) { line = candidate; continue; }
    if (line) lines.push(line);
    if (fits(word)) { line = word; continue; }
    // A single word wider than the line (wallet addresses, IBANs): break it by character
    line = '';
    for (const ch of word) {
      if (line && !fits(line + ch)) { lines.push(line); line = ch; } else line += ch;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
};

const roundRect = (path: Path2D | Ctx, x: number, y: number, w: number, h: number, r: number) => {
  path.moveTo(x + r, y);
  path.arcTo(x + w, y, x + w, y + h, r);
  path.arcTo(x + w, y + h, x, y + h, r);
  path.arcTo(x, y + h, x, y, r);
  path.arcTo(x, y, x + w, y, r);
  path.closePath();
};

/** Card outline: rounded top, ticket notches at the divider, torn zig-zag bottom. */
const cardPath = (x: number, y: number, w: number, h: number, notchY: number) => {
  const p = new Path2D();
  const bottom = y + h - TOOTH;
  p.moveTo(x + RADIUS, y);
  p.arcTo(x + w, y, x + w, y + RADIUS, RADIUS);
  p.lineTo(x + w, notchY - NOTCH);
  p.arc(x + w, notchY, NOTCH, -Math.PI / 2, Math.PI / 2, true);
  p.lineTo(x + w, bottom);
  const teeth = Math.round(w / 14);
  const step = w / teeth;
  for (let i = 1; i <= teeth; i++) {
    p.lineTo(x + w - (i - 0.5) * step, bottom + TOOTH);
    p.lineTo(x + w - i * step, bottom);
  }
  p.lineTo(x, notchY + NOTCH);
  p.arc(x, notchY, NOTCH, Math.PI / 2, -Math.PI / 2, true);
  p.lineTo(x, y + RADIUS);
  p.arcTo(x, y, x + RADIUS, y, RADIUS);
  p.closePath();
  return p;
};

/** The Vault Dial mark, drawn from the same geometry as /brand/vaultix-mark.svg (64×64). */
const drawMark = (ctx: Ctx, x: number, y: number, size: number, stroke: string, tile?: 'brand' | 'white') => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 64, size / 64);
  if (tile) {
    let fill: string | CanvasGradient = '#ffffff';
    if (tile === 'brand') {
      fill = ctx.createLinearGradient(2, 2, 62, 62);
      fill.addColorStop(0, C.blue);
      fill.addColorStop(1, C.blueDark);
    }
    ctx.fillStyle = fill;
    ctx.beginPath();
    roundRect(ctx, 2, 2, 60, 60, 16);
    ctx.fill();
  }
  ctx.strokeStyle = stroke;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(32, 32, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2.6;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(32 + Math.sin(a) * 24.5, 32 - Math.cos(a) * 24.5);
    ctx.lineTo(32 + Math.sin(a) * 21.5, 32 - Math.cos(a) * 21.5);
    ctx.stroke();
  }
  ctx.lineWidth = 4.2;
  ctx.stroke(new Path2D('M24.5 25.5 L32 39.5 L39.5 25.5'));
  ctx.restore();
};

const drawStatusIcon = (ctx: Ctx, cx: number, cy: number, status: ReceiptStatus) => {
  const circle = (r: number, fill: string) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  };
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (status === 'SUCCESSFUL') {
    circle(34, C.tint);
    circle(25, C.blue);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(cx - 9.5, cy + 0.5);
    ctx.lineTo(cx - 3, cy + 7);
    ctx.lineTo(cx + 10, cy - 6.5);
    ctx.stroke();
  } else if (status === 'PENDING') {
    circle(34, C.tint);
    circle(25, C.soft);
    ctx.strokeStyle = C.blue;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(cx, cy, 11, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + 4.5, cy + 3);
    ctx.stroke();
  } else if (status === 'REVERSED') {
    // "Return" arrow: back along the top, around the right, and home along the bottom
    circle(34, C.tint);
    circle(25, C.soft);
    ctx.strokeStyle = C.blueDark;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 4);
    ctx.lineTo(cx + 3, cy - 4);
    ctx.arc(cx + 3, cy + 1.5, 5.5, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(cx - 3, cy + 7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 8);
    ctx.lineTo(cx - 8, cy - 4);
    ctx.lineTo(cx - 4, cy);
    ctx.stroke();
  } else {
    circle(34, C.hair);
    circle(25, C.line);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 6.5, cy - 6.5);
    ctx.lineTo(cx + 6.5, cy + 6.5);
    ctx.moveTo(cx + 6.5, cy - 6.5);
    ctx.lineTo(cx - 6.5, cy + 6.5);
    ctx.stroke();
  }
  ctx.restore();
};

const dashedLine = (ctx: Ctx, x1: number, x2: number, y: number, color: string, dash = [5, 5]) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.restore();
};

const hairline = (ctx: Ctx, x1: number, x2: number, y: number, color = C.hair) => {
  ctx.fillStyle = color;
  ctx.fillRect(x1, y, x2 - x1, 1);
};

// ─── Assets ──────────────────────────────────────────────────────────────────
let fontsReady: Promise<void> | null = null;
const loadFonts = () =>
  (fontsReady ??= Promise.all(
    [400, 500, 600, 700, 800].map(w => document.fonts?.load(`${w} 16px Inter`))
  ).then(() => undefined, () => undefined));

let logoReady: Promise<HTMLImageElement | null> | null = null;
const loadLogo = () =>
  (logoReady ??= new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => { logoReady = null; resolve(null); };
    img.src = '/brand/vaultix-logo-white.png';
  }));

// ─── Layout ──────────────────────────────────────────────────────────────────
interface Layout {
  ops: Op[];
  height: number;
  notchY: number;
  bodyTop: number;
}

const layout = (ctx: Ctx, data: ReceiptData, logo: HTMLImageElement | null, generatedAt: Date): Layout => {
  const ops: Op[] = [];
  const x0 = MARGIN;
  const left = x0 + PAD;
  const right = x0 + CARD_W - PAD;
  const center = x0 + CARD_W / 2;
  let y = MARGIN;

  // Header: logo on the left, receipt title on the right
  const logoTop = y + (HEADER_H - 36) / 2;
  const headerMid = y + HEADER_H / 2;
  ops.push(c => {
    if (logo) {
      c.drawImage(logo, left, logoTop, (logo.naturalWidth / logo.naturalHeight) * 36, 36);
    } else {
      drawMark(c, left, logoTop, 36, C.blue, 'white');
      drawText(c, 'Vaultix', left + 46, baseline(logoTop, 36, 22), { size: 22, weight: 800, color: '#ffffff' });
    }
    drawText(c, 'RECEIPT', right, headerMid - 6, { size: 11, weight: 600, color: 'rgba(255,255,255,0.72)', align: 'right', tracking: 1.6 });
    drawText(c, data.title, right, headerMid + 16, { size: 17, weight: 700, color: '#ffffff', align: 'right' });
  });
  y += HEADER_H;
  const bodyTop = y;

  // Hero: status icon, amount, status chip, date
  y += 36;
  const iconY = y + 34;
  ops.push(c => drawStatusIcon(c, center, iconY, data.status));
  y += 68 + 18;

  const labelTop = y;
  ops.push(c => drawText(c, data.amountLabel, center, baseline(labelTop, 20, 13), { size: 13, weight: 500, color: C.muted, align: 'center' }));
  y += 20 + 4;

  const amountTop = y;
  const amountText = formatAmount(data.amount, data.currency);
  ops.push(c => {
    const big: TextStyle = { size: 38, weight: 800, color: C.ink };
    const code: TextStyle = { size: 15, weight: 600, color: C.faint };
    c.font = font(big.size, big.weight);
    const bigW = c.measureText(amountText).width;
    c.font = font(code.size, code.weight);
    const codeW = c.measureText(data.currency).width;
    const start = center - (bigW + 8 + codeW) / 2;
    const base = baseline(amountTop, 46, 38);
    drawText(c, amountText, start, base, { ...big, tracking: -0.5 });
    drawText(c, data.currency, start + bigW + 8, base, code);
  });
  y += 46 + 14;

  const chipTop = y;
  const status = STATUS[data.status];
  ops.push(c => {
    c.font = font(12.5, 600);
    const textW = c.measureText(status.label).width;
    const w = textW + 24 + 14;
    const x = center - w / 2;
    c.beginPath();
    roundRect(c, x, chipTop, w, 28, 14);
    c.fillStyle = status.bg;
    c.fill();
    c.beginPath();
    c.arc(x + 15, chipTop + 14, 3.5, 0, Math.PI * 2);
    c.fillStyle = status.fg;
    c.fill();
    drawText(c, status.label, x + 24, baseline(chipTop, 28, 12.5), { size: 12.5, weight: 600, color: status.fg });
  });
  y += 28 + 12;

  const dateTop = y;
  ops.push(c => drawText(c, formatReceiptDate(data.date), center, baseline(dateTop, 20, 13), { size: 13, color: C.muted, align: 'center' }));
  y += 20 + 30;

  const notchY = y;
  ops.push(c => dashedLine(c, x0 + NOTCH + 10, x0 + CARD_W - NOTCH - 10, notchY + 0.5, C.border));
  y += 30;

  // Parties: a small timeline from sender to recipient
  if (data.parties.length) {
    const gutter = 26;
    const dots: number[] = [];
    data.parties.forEach((party, i) => {
      if (i > 0) y += 18;
      const roleTop = y;
      dots.push(roleTop + 8);
      ops.push(c => drawText(c, party.role.toUpperCase(), left + gutter, baseline(roleTop, 16, 11), { size: 11, weight: 700, color: C.blue, tracking: 1.4 }));
      y += 16 + 4;

      const nameStyle: TextStyle = { size: 15.5, weight: 600, color: C.ink };
      for (const line of wrap(ctx, party.name, CONTENT_W - gutter, nameStyle)) {
        const top = y;
        ops.push(c => drawText(c, line, left + gutter, baseline(top, 22, nameStyle.size), nameStyle));
        y += 22;
      }
      const lineStyle: TextStyle = { size: 13, color: C.muted };
      for (const text of party.lines) {
        for (const line of wrap(ctx, text, CONTENT_W - gutter, lineStyle)) {
          const top = y;
          ops.push(c => drawText(c, line, left + gutter, baseline(top, 19, 13), lineStyle));
          y += 19;
        }
      }
    });
    ops.push(c => {
      const dx = left + 6;
      if (dots.length > 1) {
        c.save();
        c.strokeStyle = C.border;
        c.lineWidth = 1.5;
        c.setLineDash([3, 4]);
        c.beginPath();
        c.moveTo(dx, dots[0] + 8);
        c.lineTo(dx, dots[dots.length - 1] - 8);
        c.stroke();
        c.restore();
      }
      dots.forEach((dy, i) => {
        c.beginPath();
        c.arc(dx, dy, 6, 0, Math.PI * 2);
        c.fillStyle = i === dots.length - 1 ? C.blue : '#ffffff';
        c.fill();
        c.strokeStyle = C.blue;
        c.lineWidth = 2;
        c.stroke();
      });
    });
    y += 28;
    const sepY = y;
    ops.push(c => hairline(c, left, right, sepY, C.line));
    y += 26;
  }

  // Details table
  const detailsTop = y;
  ops.push(c => drawText(c, 'TRANSACTION DETAILS', left, baseline(detailsTop, 16, 11), { size: 11, weight: 700, color: C.muted, tracking: 1.4 }));
  y += 16 + 8;

  const rows: ReceiptRow[] = [
    { label: 'Reference', value: data.reference, mono: true },
    { label: 'Date & time', value: formatReceiptDate(data.date) },
    ...data.rows.filter(row => row.value.trim()),
  ];
  const labelW = Math.round(CONTENT_W * 0.36);
  const valueW = CONTENT_W - labelW - 12;
  rows.forEach((row, i) => {
    const valueStyle: TextStyle = row.mono
      ? { size: 12.5, weight: 500, color: C.ink, mono: true, align: 'right' }
      : { size: 13, weight: 500, color: C.ink, align: 'right' };
    const lines = wrap(ctx, row.value, valueW, valueStyle);
    const rowTop = y;
    const rowH = lines.length * 19 + 22;
    ops.push(c => {
      if (i > 0) hairline(c, left, right, rowTop);
      drawText(c, row.label, left, baseline(rowTop + 11, 19, 13), { size: 13, color: C.muted });
      lines.forEach((line, j) => drawText(c, line, right, baseline(rowTop + 11 + j * 19, 19, valueStyle.size), valueStyle));
    });
    y += rowH;
  });

  // Note
  if (data.note) {
    y += 14;
    const noteStyle: TextStyle = { size: 12.5, weight: 500, color: C.blueDark };
    const lines = wrap(ctx, data.note, CONTENT_W - 32, noteStyle);
    const boxTop = y;
    const boxH = lines.length * 18 + 26;
    ops.push(c => {
      c.beginPath();
      roundRect(c, left, boxTop, CONTENT_W, boxH, 12);
      c.fillStyle = C.tint;
      c.fill();
      c.strokeStyle = C.soft;
      c.lineWidth = 1;
      c.stroke();
      lines.forEach((line, j) => drawText(c, line, left + 16, baseline(boxTop + 13 + j * 18, 18, 12.5), noteStyle));
    });
    y += boxH;
  }

  // Footer: brand line and small print
  y += 30;
  const footTop = y;
  ops.push(c => {
    hairline(c, left, right, footTop, C.line);
    drawMark(c, left, footTop + 22, 22, '#ffffff', 'brand');
    drawText(c, 'Vaultix Bank', left + 31, baseline(footTop + 22, 22, 13.5), { size: 13.5, weight: 700, color: C.ink });
    drawText(c, 'vaultixbank.org', right, baseline(footTop + 22, 22, 12.5), { size: 12.5, weight: 600, color: C.blue, align: 'right' });
  });
  y += 22 + 22 + 14;

  const smallStyle: TextStyle = { size: 11, color: C.faint };
  const smallPrint =
    `This receipt was generated electronically on ${formatReceiptDate(generatedAt)} and is valid without a signature. ` +
    `For questions about this transaction, contact support@vaultixbank.org and quote reference ${data.reference}.`;
  for (const line of wrap(ctx, smallPrint, CONTENT_W, smallStyle)) {
    const top = y;
    ops.push(c => drawText(c, line, left, baseline(top, 16, 11), smallStyle));
    y += 16;
  }
  y += PAD - 6 + TOOTH;

  return { ops, height: y - MARGIN, notchY, bodyTop };
};

// ─── Render ──────────────────────────────────────────────────────────────────
/**
 * 'screen' sits the card on the soft page background with a shadow (preview, PNG, JPG).
 * 'print' uses a white page and a thin outline so the PDF prints cleanly.
 */
export async function renderReceipt(data: ReceiptData, variant: 'screen' | 'print' = 'screen'): Promise<HTMLCanvasElement> {
  const [, logo] = await Promise.all([loadFonts(), loadLogo()]);
  const measure = document.createElement('canvas').getContext('2d');
  if (!measure) throw new Error('Canvas is not supported in this browser');
  const { ops, height, notchY, bodyTop } = layout(measure, data, logo, new Date());

  const width = CARD_W + MARGIN * 2;
  const fullHeight = height + MARGIN * 2;
  const scale = Math.min(3, Math.sqrt(MAX_PIXELS / (width * fullHeight)));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(fullHeight * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser');
  ctx.scale(scale, scale);

  ctx.fillStyle = variant === 'print' ? '#ffffff' : C.page;
  ctx.fillRect(0, 0, width, fullHeight);

  const card = cardPath(MARGIN, MARGIN, CARD_W, height, notchY);
  ctx.save();
  if (variant === 'screen') {
    // Shadow values are in device pixels, so they don't follow ctx.scale()
    ctx.shadowColor = 'rgba(15, 23, 42, 0.10)';
    ctx.shadowBlur = 32 * scale;
    ctx.shadowOffsetY = 10 * scale;
  }
  ctx.fillStyle = '#ffffff';
  ctx.fill(card);
  ctx.restore();

  ctx.save();
  ctx.clip(card);

  // Blue header band with a faint dial echoing the logo
  const band = ctx.createLinearGradient(MARGIN, MARGIN, MARGIN + CARD_W, MARGIN + HEADER_H);
  band.addColorStop(0, C.blue);
  band.addColorStop(1, C.blueDark);
  ctx.fillStyle = band;
  ctx.fillRect(MARGIN, MARGIN, CARD_W, HEADER_H);
  ctx.globalAlpha = 0.09;
  drawMark(ctx, MARGIN + CARD_W - 150, MARGIN - 40, 190, '#ffffff');
  ctx.globalAlpha = 1;

  // Watermark behind the details
  ctx.globalAlpha = 0.035;
  const markSize = 300;
  drawMark(ctx, MARGIN + (CARD_W - markSize) / 2, bodyTop + (height - (bodyTop - MARGIN) - markSize) / 2 + 60, markSize, C.blue);
  ctx.globalAlpha = 1;

  for (const op of ops) op(ctx);
  ctx.restore();

  if (variant === 'print') {
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.stroke(card);
  }
  return canvas;
}

// ─── Export ──────────────────────────────────────────────────────────────────
const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Could not create the image'))), type, quality)
  );

/** Wraps a JPEG in a minimal one-page PDF (A4 width, height follows the receipt). */
const jpegToPdf = (jpeg: Uint8Array<ArrayBuffer>, pxWidth: number, pxHeight: number, title: string) => {
  const pageW = 595.28;
  const pageH = Number(((pageW * pxHeight) / pxWidth).toFixed(2));
  const encoder = new TextEncoder();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (part: string | Uint8Array<ArrayBuffer>) => {
    const bytes = typeof part === 'string' ? encoder.encode(part) : part;
    chunks.push(bytes);
    length += bytes.length;
  };
  const object = (id: number, body: string) => {
    offsets[id] = length;
    push(`${id} 0 obj\n${body}\nendobj\n`);
  };

  const content = `q ${pageW} 0 0 ${pageH} 0 0 cm /Im0 Do Q`;
  const safeTitle = title.replace(/[\\()]/g, '\\$&');
  const now = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

  push('%PDF-1.4\n%âãÏÓ\n');
  object(1, '<< /Type /Catalog /Pages 2 0 R >>');
  object(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  object(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  offsets[4] = length;
  push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pxWidth} /Height ${pxHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
  push(jpeg);
  push('\nendstream\nendobj\n');
  object(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  object(6, `<< /Title (${safeTitle}) /Producer (Vaultix) /CreationDate (D:${now}Z) >>`);

  const xref = length;
  push(`xref\n0 7\n0000000000 65535 f \n${offsets.slice(1).map(o => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`);
  push(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(chunks, { type: 'application/pdf' });
};

export async function exportReceipt(canvas: HTMLCanvasElement, format: ReceiptFormat, reference: string): Promise<File> {
  const name = `Vaultix-Receipt-${reference.replace(/[^A-Za-z0-9_-]/g, '')}`;
  if (format === 'png') {
    return new File([await toBlob(canvas, 'image/png')], `${name}.png`, { type: 'image/png' });
  }
  const jpeg = await toBlob(canvas, 'image/jpeg', 0.95);
  if (format === 'jpg') return new File([jpeg], `${name}.jpg`, { type: 'image/jpeg' });
  const pdf = jpegToPdf(new Uint8Array(await jpeg.arrayBuffer()), canvas.width, canvas.height, `Vaultix Receipt ${reference}`);
  return new File([pdf], `${name}.pdf`, { type: 'application/pdf' });
}

export function saveFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
