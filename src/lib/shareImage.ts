import QRCode from 'qrcode';

const MAX_BYTES = 1_000_000;
const BG_LIGHT = '#FFFBF2';
const FG_LIGHT = '#2D0A00';
const BG_DARK = '#1a1a1a';
const FG_DARK = '#ffffff';
const ACCENT = '#14B8A6'; // piri menta (brand)
const JPEG_QUALITY_DEFAULT = 0.92;

export type ShareImageTheme = 'light' | 'dark';
// layout tuned at 1080; other sizes scale proportionally
const BASE = 1080;
const FONT_DISPLAY = 'Fredoka One';
const FONT_BODY = 'Nunito';

function loadImage(src: string, cors = false): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (cors) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('failed to load qr image'));
    img.src = src;
  });
}

function payeeInitials(displayName: string): string {
  const t = displayName.trim();
  if (!t) return '?';
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return t.slice(0, 2).toUpperCase();
}

function drawAvatarCoverCircle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  diameter: number,
  strokeStyle: string,
  lineW: number
) {
  const r = diameter / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(diameter / iw, diameter / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineW;
  ctx.stroke();
}

function drawInitialsAvatar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  diameter: number,
  initials: string,
  fillBg: string,
  fillFg: string,
  strokeStyle: string,
  lineW: number
) {
  const r = diameter / 2;
  ctx.save();
  ctx.fillStyle = fillBg;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineW;
  ctx.stroke();
  ctx.fillStyle = fillFg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${Math.max(16, Math.round(diameter * 0.38))}px "${FONT_BODY}", sans-serif`;
  ctx.fillText(initials, cx, cy);
  ctx.restore();
}

function fitCenteredTitle(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number, fontFamily: string): string {
  ctx.font = `bold ${fontSize}px "${fontFamily}", cursive`;
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  const ell = '…';
  while (t.length > 1 && ctx.measureText(t + ell).width > maxWidth) t = t.slice(0, -1);
  return t + ell;
}

export type ShareImageBranding = {
  displayName?: string;
  avatarUrl?: string;
};

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('could not create image blob'));
        else resolve(blob);
      },
      type,
      quality
    );
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** presets users pick before format; smaller = smaller files, still scannable */
export const SHARE_IMAGE_PRESETS = [
  { id: '1080', size: 1080, label: '1080 × 1080', hint: 'social / high quality' },
  { id: '1024', size: 1024, label: '1024 × 1024', hint: 'power of two' },
  { id: '768', size: 768, label: '768 × 768', hint: 'balanced' },
  { id: '512', size: 512, label: '512 × 512', hint: 'smallest file' },
] as const;

export type ShareImagePresetId = (typeof SHARE_IMAGE_PRESETS)[number]['id'];

function scale(size: number, n: number) {
  return Math.max(1, Math.round((n * size) / BASE));
}

// logo paths for mascot (above QR) and branded QR center
const LOGO_URLS = ['/logo/piri.png', '/logo/piri-heart.png'];

async function buildShareCanvas(
  tipUrl: string,
  size: number,
  theme: ShareImageTheme,
  branding?: ShareImageBranding
): Promise<HTMLCanvasElement> {
  // qr with high error correction so logo in center stays scannable (linktree-style)
  const qrDataUrl = await QRCode.toDataURL(tipUrl, {
    width: Math.floor(size * 0.62),
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: '#2D0A00', light: '#ffffff' },
  });
  const qrImg = await loadImage(qrDataUrl);
  let mascotImg: HTMLImageElement | null = null;
  let logoImg: HTMLImageElement | null = null;
  for (const url of LOGO_URLS) {
    try {
      const img = await loadImage(url);
      mascotImg = img;
      logoImg = img;
      break;
    } catch {
      /* try next */
    }
  }

  const isDark = theme === 'dark';
  const bg = isDark ? BG_DARK : BG_LIGHT;
  const fg = isDark ? FG_DARK : FG_LIGHT;
  const borderStroke = isDark ? 'rgba(255, 255, 255, 0.25)' : `${ACCENT}40`;
  const taglineFill = isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(45, 10, 0, 0.75)';
  const footerFill = isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(45, 10, 0, 0.6)';
  const qrCardStroke = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(45, 10, 0, 0.12)';

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas not supported');

  const inset = scale(size, 14);
  const lineWide = scale(size, 4);
  const titleSize = Math.max(22, scale(size, 50));
  const taglineSize = Math.max(14, scale(size, 32));
  const footerSize = Math.max(12, scale(size, 26));
  const pad = scale(size, 28);
  const r = scale(size, 20);
  const strokeNarrow = Math.max(1, scale(size, 2));
  const mascotSize = scale(size, 220);
  const displayName = branding?.displayName?.trim() ?? '';
  const avatarUrl = branding?.avatarUrl?.trim() ?? '';
  const hasPersona = Boolean(displayName || avatarUrl);

  let payeeAvatarImg: HTMLImageElement | null = null;
  if (avatarUrl) {
    try {
      payeeAvatarImg = await loadImage(avatarUrl, true);
    } catch {
      payeeAvatarImg = null;
    }
  }

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = borderStroke;
  ctx.lineWidth = lineWide;
  ctx.strokeRect(inset, inset, size - inset * 2, size - inset * 2);

  let y = scale(size, 70);
  const avatarCx = size / 2;
  const avatarCy = y + mascotSize / 2;

  if (hasPersona) {
    if (payeeAvatarImg) {
      drawAvatarCoverCircle(ctx, payeeAvatarImg, avatarCx, avatarCy, mascotSize, qrCardStroke, strokeNarrow);
    } else {
      drawInitialsAvatar(
        ctx,
        avatarCx,
        avatarCy,
        mascotSize,
        payeeInitials(displayName),
        isDark ? 'rgba(255,255,255,0.12)' : 'rgba(20, 184, 166, 0.15)',
        fg,
        qrCardStroke,
        strokeNarrow
      );
    }
    // fillText uses alphabetic baseline — caps extend above y, so leave headroom
    y += mascotSize + scale(size, 28) + Math.round(titleSize * 0.5);
  } else if (mascotImg) {
    const mascotX = (size - mascotSize) / 2;
    ctx.drawImage(mascotImg, mascotX, y, mascotSize, mascotSize);
    y += mascotSize + scale(size, 24);
  }

  const titleMaxW = size - pad * 4;
  const headline =
    hasPersona && displayName ? fitCenteredTitle(ctx, displayName, titleMaxW, titleSize, FONT_DISPLAY) : 'Piri';

  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.font = `bold ${titleSize}px "${FONT_DISPLAY}", cursive`;
  ctx.fillText(headline, size / 2, y);
  y += titleSize + scale(size, hasPersona && displayName ? 12 : 22);

  if (hasPersona) {
    ctx.fillStyle = taglineFill;
    ctx.font = `600 ${Math.max(12, scale(size, 24))}px "${FONT_BODY}", sans-serif`;
    ctx.fillText('Powered by Piri', size / 2, y);
    y += scale(size, 26);
  }

  ctx.fillStyle = taglineFill;
  ctx.font = `600 ${taglineSize}px "${FONT_BODY}", sans-serif`;
  ctx.fillText('Scan to send love', size / 2, y);
  y += scale(size, 46);

  const qrDrawSize = Math.floor(size * 0.44);
  const qrX = (size - qrDrawSize) / 2;
  const qrY = y;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  const x0 = qrX - pad;
  const y0 = qrY - pad;
  const w = qrDrawSize + pad * 2;
  const h = qrDrawSize + pad * 2;
  ctx.roundRect(x0, y0, w, h, r);
  ctx.fill();
  ctx.strokeStyle = qrCardStroke;
  ctx.lineWidth = strokeNarrow;
  ctx.stroke();
  ctx.drawImage(qrImg, qrX, qrY, qrDrawSize, qrDrawSize);

  // branded QR: payee avatar or piri logo in center, ~18% of QR size, white bg for scanability
  const qrCenterImg = payeeAvatarImg ?? logoImg;
  if (qrCenterImg) {
    const logoSize = Math.floor(qrDrawSize * 0.18);
    const logoX = qrX + (qrDrawSize - logoSize) / 2;
    const logoY = qrY + (qrDrawSize - logoSize) / 2;
    const logoPad = Math.max(2, Math.floor(logoSize * 0.08));
    const logoBgSize = logoSize + logoPad * 2;
    const logoBgX = qrX + (qrDrawSize - logoBgSize) / 2;
    const logoBgY = qrY + (qrDrawSize - logoBgSize) / 2;
    const qrCx = qrX + qrDrawSize / 2;
    const qrCy = qrY + qrDrawSize / 2;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(logoBgX, logoBgY, logoBgSize, logoBgSize, logoPad);
    ctx.fill();
    if (payeeAvatarImg) {
      drawAvatarCoverCircle(ctx, payeeAvatarImg, qrCx, qrCy, logoSize, qrCardStroke, strokeNarrow);
    } else {
      ctx.drawImage(logoImg!, logoX, logoY, logoSize, logoSize);
    }
  }

  const qrBoxBottom = qrY + qrDrawSize + pad;
  const footerY = qrBoxBottom + scale(size, 40);
  ctx.fillStyle = footerFill;
  ctx.font = `600 ${footerSize}px "${FONT_BODY}", sans-serif`;
  ctx.fillText('🌈 One scan, every flavor', size / 2, footerY);

  return canvas;
}

async function jpegBlobUnderCap(canvas: HTMLCanvasElement): Promise<Blob> {
  let blob = await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY_DEFAULT);
  if (blob.size <= MAX_BYTES) return blob;
  const qualities = [0.88, 0.85, 0.82, 0.78, 0.72];
  for (const q of qualities) {
    blob = await canvasToBlob(canvas, 'image/jpeg', q);
    if (blob.size <= MAX_BYTES) return blob;
  }
  return blob;
}

export type ShareImageVariant = {
  blob: Blob;
  bytes: number;
  filename: string;
  overRecommendedMax: boolean;
};

export type ShareImageExport = {
  dimension: number;
  theme: ShareImageTheme;
  png: ShareImageVariant;
  jpeg: ShareImageVariant;
};

/**
 * build at chosen dimension and theme; png + jpeg with sizes for ui.
 */
export async function prepareShareImageExport(
  tipUrl: string,
  dimension: number,
  theme: ShareImageTheme = 'light',
  branding?: ShareImageBranding
): Promise<ShareImageExport> {
  const canvas = await buildShareCanvas(tipUrl, dimension, theme, branding);
  const pngBlob = await canvasToBlob(canvas, 'image/png');
  const jpegBlob = await jpegBlobUnderCap(canvas);
  const themeSuffix = theme === 'dark' ? '-dark' : '';
  const suffix = `${themeSuffix}-${dimension}`;

  return {
    dimension,
    theme,
    png: {
      blob: pngBlob,
      bytes: pngBlob.size,
      filename: `piri-qr${suffix}.png`,
      overRecommendedMax: pngBlob.size > MAX_BYTES,
    },
    jpeg: {
      blob: jpegBlob,
      bytes: jpegBlob.size,
      filename: `piri-qr${suffix}.jpg`,
      overRecommendedMax: jpegBlob.size > MAX_BYTES,
    },
  };
}

export function downloadShareBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** one-click: walk presets until jpeg under 1mb, else download smallest jpeg anyway */
export async function downloadPiriShareImage(
  tipUrl: string,
  theme: ShareImageTheme = 'light',
  branding?: ShareImageBranding
) {
  for (let i = 0; i < SHARE_IMAGE_PRESETS.length; i++) {
    const { size } = SHARE_IMAGE_PRESETS[i];
    const exp = await prepareShareImageExport(tipUrl, size, theme, branding);
    if (!exp.jpeg.overRecommendedMax) {
      downloadShareBlob(exp.jpeg.blob, exp.jpeg.filename);
      return;
    }
  }
  const smallest = SHARE_IMAGE_PRESETS[SHARE_IMAGE_PRESETS.length - 1];
  const exp = await prepareShareImageExport(tipUrl, smallest.size, theme, branding);
  downloadShareBlob(exp.jpeg.blob, exp.jpeg.filename);
}
