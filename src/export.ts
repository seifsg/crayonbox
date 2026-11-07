const PNG_SIZE = 2048;

/** Rasterizes the page SVG on white. Fills are attributes, so the serialized copy carries the child's colors. */
const toPng = async (svg: SVGSVGElement): Promise<Blob> => {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.setAttribute('width', String(PNG_SIZE));
  copy.setAttribute('height', String(PNG_SIZE));
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copy))}`;
  await img.decode();
  const canvas = Object.assign(document.createElement('canvas'), { width: PNG_SIZE, height: PNG_SIZE });
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('save: no 2d canvas');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, PNG_SIZE, PNG_SIZE);
  ctx.drawImage(img, 0, 0, PNG_SIZE, PNG_SIZE);
  return new Promise((done, fail) => canvas.toBlob((b) => (b ? done(b) : fail(new Error('save: PNG encode failed'))), 'image/png'));
};

/** Phones and tablets get the share sheet (Save Image → Photos). False = not shared, so the caller downloads instead. */
const share = async (file: File): Promise<boolean> => {
  if (!matchMedia('(pointer: coarse)').matches || !navigator.canShare?.({ files: [file] })) return false;
  try {
    await navigator.share({ files: [file] });
    return true;
  } catch (e) {
    // AbortError = the child closed the sheet. Anything else (e.g. tap activation expired) falls back to download.
    if ((e as Error).name === 'AbortError') return true;
    console.warn('crayonbox: share failed, downloading instead', e);
    return false;
  }
};

/** Saves the file through a temporary link; the URL is freed once the browser has it. */
const download = (file: File): void => {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(file), download: file.name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
};

/** Saves the page as `<name>.png`. */
export const savePng = async (svg: SVGSVGElement, name: string): Promise<void> => {
  const file = new File([await toPng(svg)], `${name}.png`, { type: 'image/png' });
  if (!(await share(file))) download(file);
};

/** Opens the print dialog; print CSS leaves only the page art. */
export const printPage = (): void => window.print();
