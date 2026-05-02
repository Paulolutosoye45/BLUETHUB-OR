import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfScrollViewerProps {
  fileUrl: string;
  mode: 'live' | 'replay';
  preferIframe?: boolean;
  className?: string;
  controlledPage?: number;
  controlledScrollRatio?: number;
  onPageChange?: (page: number) => void;
  onScrollRatioChange?: (ratio: number) => void;
}

const PAGE_CHUNK = 3;

export default function PdfScrollViewer({
  fileUrl,
  mode,
  preferIframe,
  className,
  controlledPage,
  controlledScrollRatio,
  onPageChange,
  onScrollRatioChange,
}: PdfScrollViewerProps) {
  const preferIframeResolved = preferIframe ?? (mode === 'live');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resizeRef = useRef<ResizeObserver | null>(null);
  const lastPageRef = useRef(1);

  const [numPages, setNumPages] = useState(0);
  const [renderedPages, setRenderedPages] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [useIframeFallback, setUseIframeFallback] = useState(preferIframeResolved);

  const pageNumbers = useMemo(
    () => Array.from({ length: renderedPages }, (_, i) => i + 1),
    [renderedPages],
  );

  const fallbackSrc = useMemo(() => {
    const hashParts: string[] = [];
    if (controlledPage && controlledPage > 0) hashParts.push(`page=${controlledPage}`);
    hashParts.push('zoom=page-width', 'view=FitH', 'pagemode=none');
    return `${fileUrl}#${hashParts.join('&')}`;
  }, [controlledPage, fileUrl]);

  const resolveCurrentPage = useCallback((container: HTMLDivElement): number => {
    const pages = container.querySelectorAll<HTMLElement>('[data-pdf-page]');
    if (pages.length === 0) return 1;

    const probe = container.scrollTop + 24;
    let current = 1;
    for (const page of pages) {
      const pageNumber = Number(page.dataset.pdfPage || '1');
      if (page.offsetTop <= probe) current = pageNumber;
      else break;
    }
    return current;
  }, []);

  const updatePageIfChanged = useCallback(() => {
    const container = containerRef.current;
    if (!container || !onPageChange) return;

    const page = resolveCurrentPage(container);
    if (page !== lastPageRef.current) {
      lastPageRef.current = page;
      onPageChange(page);
    }
  }, [onPageChange, resolveCurrentPage]);

  const onScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Progressive rendering: append pages as user approaches the bottom.
    if (
      renderedPages < numPages &&
      container.scrollTop + container.clientHeight >= container.scrollHeight - 600
    ) {
      setRenderedPages((prev) => Math.min(numPages, prev + PAGE_CHUNK));
    }

    // Update page indicator on scroll
    updatePageIfChanged();

    if (onScrollRatioChange) {
      const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
      const ratio = maxScroll > 0 ? container.scrollTop / maxScroll : 0;
      onScrollRatioChange(Math.max(0, Math.min(1, ratio)));
    }
  }, [onScrollRatioChange, updatePageIfChanged, numPages, renderedPages]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      setContainerWidth(Math.max(300, Math.floor(container.clientWidth - 20)));
    };

    measure();
    resizeRef.current = new ResizeObserver(measure);
    resizeRef.current.observe(container);

    return () => {
      resizeRef.current?.disconnect();
      resizeRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mode !== 'replay') return;
    if (!controlledPage) return;

    const container = containerRef.current;
    if (!container) return;

    const target = container.querySelector<HTMLElement>(`[data-pdf-page="${controlledPage}"]`);
    if (target) {
      container.scrollTop = target.offsetTop;
    }
  }, [controlledPage, mode, numPages]);

  useEffect(() => {
    if (mode !== 'replay') return;
    if (controlledScrollRatio === undefined) return;

    const container = containerRef.current;
    if (!container) return;

    const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
    const target = Math.max(0, Math.min(1, controlledScrollRatio)) * maxScroll;
    if (Math.abs(container.scrollTop - target) > 3) {
      container.scrollTop = target;
    }
  }, [controlledScrollRatio, mode, renderedPages]);

  useEffect(() => {
    setNumPages(0);
    setRenderedPages(0);
    setUseIframeFallback(preferIframeResolved);
    lastPageRef.current = 1;
  }, [fileUrl, preferIframeResolved]);



  if (useIframeFallback) {
    return (
      <div className={`h-full w-full bg-white ${className ?? ''}`}>
        <iframe
          src={fallbackSrc}
          title="PDF Viewer"
          className="h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className={`h-full w-full overflow-y-auto bg-white ${className ?? ''}`}
    >
      <Document
        file={fileUrl}
        loading={<div className="p-4 text-sm text-gray-500">Loading PDF...</div>}
        error={<div className="p-4 text-sm text-gray-500">Opening quick PDF viewer...</div>}
        onLoadSuccess={({ numPages: loaded }) => {
          setNumPages(loaded);
          setRenderedPages(Math.min(loaded, PAGE_CHUNK));
        }}
        onLoadError={() => {
          setUseIframeFallback(true);
        }}
      >
        <div className="space-y-3 p-2">
          {pageNumbers.map((page) => (
            <div
              key={page}
              data-pdf-page={page}
              className="rounded border border-slate-200 bg-white shadow-sm"
            >
              <Page
                pageNumber={page}
                width={containerWidth > 0 ? containerWidth : undefined}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </div>
          ))}
        </div>
      </Document>
    </div>
  );
}

