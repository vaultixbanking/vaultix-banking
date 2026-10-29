import { useEffect, useRef, useState } from 'react';
import { X, Download, Loader2, Share2, AlertCircle } from 'lucide-react';
import { renderReceipt, exportReceipt, saveFile, type ReceiptData, type ReceiptFormat } from '../lib/receipt';

interface ReceiptModalProps {
  data: ReceiptData;
  onClose: () => void;
}

const FORMATS: { format: ReceiptFormat; label: string }[] = [
  { format: 'pdf', label: 'PDF' },
  { format: 'png', label: 'PNG' },
  { format: 'jpg', label: 'JPG' },
];

const ReceiptModal = ({ data, onClose }: ReceiptModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pngRef = useRef<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState<ReceiptFormat | 'share' | null>(null);
  const [error, setError] = useState('');
  const canShare = typeof navigator.canShare === 'function';

  // Draw once on open; the PNG is kept ready so Share can run inside the tap (iOS requires it)
  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;
    renderReceipt(data)
      .then(async canvas => {
        const png = await exportReceipt(canvas, 'png', data.reference);
        if (cancelled) return;
        canvasRef.current = canvas;
        pngRef.current = png;
        url = URL.createObjectURL(png);
        setPreview(url);
      })
      .catch(() => {
        if (!cancelled) setError('We couldn’t prepare this receipt. Please try again.');
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [data]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const handleDownload = async (format: ReceiptFormat) => {
    setError('');
    setBusy(format);
    try {
      if (format === 'png' && pngRef.current) {
        saveFile(pngRef.current);
      } else {
        const canvas = format === 'pdf' ? await renderReceipt(data, 'print') : canvasRef.current ?? await renderReceipt(data);
        saveFile(await exportReceipt(canvas, format, data.reference));
      }
    } catch {
      setError('Download failed. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    const file = pngRef.current;
    if (!file) return;
    setError('');
    if (!navigator.canShare({ files: [file] })) {
      saveFile(file);
      return;
    }
    setBusy('share');
    try {
      await navigator.share({ files: [file], title: `Vaultix receipt ${data.reference}` });
    } catch (err: unknown) {
      if (!(err instanceof Error && err.name === 'AbortError')) setError('Sharing failed. Try downloading instead.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-secondary-900/60 backdrop-blur-sm sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Transaction receipt"
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-secondary-100">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-secondary-900">Transaction Receipt</h3>
            <p className="text-xs text-secondary-500 font-mono truncate">{data.reference}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-secondary-400 hover:text-secondary-600 hover:bg-secondary-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-secondary-100">
          {preview ? (
            <img src={preview} alt={`Receipt for ${data.reference}`} className="w-full h-auto block" />
          ) : !error ? (
            <div className="flex flex-col items-center justify-center py-28 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <p className="text-sm text-secondary-400">Preparing your receipt...</p>
            </div>
          ) : null}
        </div>

        <div className="p-4 border-t border-secondary-100 space-y-3">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          <p className="text-xs font-medium text-secondary-500">Download as</p>
          <div className="grid grid-cols-3 gap-2">
            {FORMATS.map(({ format, label }) => (
              <button
                key={format}
                onClick={() => handleDownload(format)}
                disabled={!preview || busy !== null}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                  format === 'pdf'
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'border border-secondary-200 text-secondary-700 hover:bg-secondary-50'
                }`}
              >
                {busy === format ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {label}
              </button>
            ))}
          </div>
          {canShare && (
            <button
              onClick={handleShare}
              disabled={!preview || busy !== null}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors disabled:opacity-50"
            >
              {busy === 'share' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
              Share receipt
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
