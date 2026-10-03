import { useEffect, useRef, useState, type MouseEvent, type TouchEvent } from 'react';
import { Eyebrow } from './Decor';
import { BACK_ALT } from './Hero';
import { pad2 } from '../lib/order';

const SLIDES = [
  { src: '/assets/hoodie-worn.jpg', label: 'Worn', flat: false, alt: 'Model wearing the WAGMI Rengoku hoodie with the hood up, back print and sleeve artwork visible', desc: 'The back print and sleeve artwork, worn.' },
  { src: '/assets/cut-back.webp', label: 'Back', flat: true, alt: BACK_ALT, desc: 'Rengoku framed by red flames beneath the 煉獄 kanji, with flame artwork running down both sleeves.' },
  { src: '/assets/cut-front.webp', label: 'Front', flat: true, alt: 'Front of the black WAGMI Rengoku hoodie: red and gold flame dragon chest print with vertical kanji, kangaroo pocket and sleeve prints', desc: 'A red and gold flame dragon on the chest, topped with vertical kanji, above the kangaroo pocket.' },
  { src: '/assets/cut-side.webp', label: 'Side', flat: true, alt: 'Side view of the WAGMI Rengoku hoodie showing the 炎柱 sleeve label and the flame sleeve artwork', desc: 'The 炎柱 label on the upper sleeve and the full flame artwork along the arm.' }
];
const N = SLIDES.length;

// Flat product cut-outs sit inside padding on the glow; the worn photo fills the frame.
const imgFit = (flat: boolean) => flat ? 'object-contain p-[7%]' : 'object-cover p-0';

const roundBtn = 'size-12 rounded-full text-lg text-off';

export function Gallery({ onLightboxChange }: { onLightboxChange: (open: boolean) => void }) {
  const [slide, setSlide] = useState(0);
  const [lb, setLb] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const touchX = useRef<number | null>(null);
  const swiped = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const cur = SLIDES[slide];

  const go = (d: number) => { setSlide(s => (s + d + N) % N); setZoom(false); };
  const step = (d: number) => (e: MouseEvent) => { e.stopPropagation(); go(d); };

  const onTouchStart = (e: TouchEvent) => { touchX.current = e.touches[0].clientX; swiped.current = false; };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) { swiped.current = true; go(dx < 0 ? 1 : -1); }
  };
  const consumeSwipe = () => { if (!swiped.current) return false; swiped.current = false; return true; };

  const open = () => { if (consumeSwipe()) return; setLb(true); setZoom(false); };
  const close = () => { setLb(false); setZoom(false); };
  const toggleZoom = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (consumeSwipe()) return;
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width * 100).toFixed(1)}% ${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`);
    setZoom(z => !z);
  };

  useEffect(() => {
    onLightboxChange(lb);
    if (!lb) return;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [lb, onLightboxChange]);

  const counter = `${pad2(slide + 1)} / ${pad2(N)} · ${cur.label}`;

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="border-t border-off/6 bg-panel">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-[clamp(28px,3vw,44px)] px-[clamp(16px,4vw,40px)] py-[clamp(72px,9vw,128px)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-[18px]">
            <Eyebrow kanji="弐">The piece</Eyebrow>
            <h2 id="gallery-title" className="m-0 font-display text-[clamp(40px,5vw,72px)] font-normal uppercase leading-[.95]">Every angle.</h2>
          </div>
          <span className="text-[13px] tracking-[.06em] text-muted">Tap the image to view full screen</span>
        </div>
        <div className="flex flex-wrap items-start gap-[clamp(16px,2.4vw,36px)]">
          <div className="min-w-0 flex-[3_1_520px]">
            <div role="region" aria-roledescription="carousel" aria-label="Rengoku hoodie images" onClick={open} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
              className="relative mx-auto aspect-[4/5] w-full max-w-[calc(84vh*.8)] cursor-zoom-in touch-pan-y overflow-hidden bg-tile bg-[radial-gradient(ellipse_70%_60%_at_50%_58%,rgba(198,40,40,.34),rgba(245,166,35,.05)_60%,transparent_80%)]">
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center whitespace-nowrap font-jp text-[clamp(160px,24vw,340px)] font-bold leading-none text-off/4 [writing-mode:vertical-rl]">炎柱</span>
              <span aria-hidden="true" className="absolute top-3.5 left-3.5 z-[1] size-7 border-t border-l border-off/45" />
              <span aria-hidden="true" className="absolute top-3.5 right-3.5 z-[1] size-7 border-t border-r border-off/45" />
              {SLIDES.map((sl, i) => (
                <img key={sl.src} src={sl.src} alt={sl.alt} aria-hidden={i !== slide} loading={i === 0 ? 'eager' : 'lazy'} decoding="async"
                  className={`absolute inset-0 size-full transition-opacity duration-500 ease-in-out ${imgFit(sl.flat)} ${i === slide ? 'opacity-100' : 'opacity-0'}`} />
              ))}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4">
                <span aria-live="polite" className="bg-ink/82 px-3 py-2 text-xs font-bold uppercase tracking-[.18em] text-off">{counter}</span>
                <div className="pointer-events-auto flex gap-2">
                  <button type="button" onClick={step(-1)} aria-label="Previous image" className={`${roundBtn} border-0 bg-ink/82 hover:bg-flame`}>←</button>
                  <button type="button" onClick={step(1)} aria-label="Next image" className={`${roundBtn} border-0 bg-ink/82 hover:bg-flame`}>→</button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-6">
            <div role="tablist" aria-label="Choose an image" className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2.5">
              {SLIDES.map((sl, i) => {
                const on = i === slide;
                return (
                  <button key={sl.src} type="button" role="tab" aria-selected={on} aria-label={`Show ${sl.label.toLowerCase()} view`} onClick={() => setSlide(i)}
                    className={`flex flex-col gap-2 border-0 bg-transparent p-0 text-left text-off transition-opacity duration-200 ${on ? 'opacity-100' : 'opacity-55'}`}>
                    <span className={`block aspect-[4/5] w-full overflow-hidden bg-charcoal bg-[radial-gradient(ellipse_at_50%_60%,rgba(198,40,40,.3),transparent_75%)] outline-2 outline-offset-2 ${on ? 'outline-gold' : 'outline-transparent'}`}>
                      <img src={sl.src} alt="" loading="lazy" className={`block size-full ${sl.flat ? 'object-contain p-[3%]' : 'object-cover'}`} />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[.18em]">{pad2(i + 1)} {sl.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col gap-2.5 border-t border-off/12 pt-5">
              <span className="font-display text-[26px] uppercase tracking-[.02em]">{cur.label}</span>
              <p className="m-0 text-base leading-[1.6] text-pretty text-soft">{cur.desc}</p>
            </div>
          </div>
        </div>
      </div>

      {lb && (
        <div role="dialog" aria-modal="true" aria-label="Product image viewer" onClick={close} onTouchStart={onTouchStart} onTouchEnd={e => { if (!zoom) onTouchEnd(e); }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(6,6,6,.97)] px-3 pt-16 pb-[72px]">
          <div onClick={toggleZoom} className={`relative aspect-[4/5] w-[min(100%,calc((100vh-136px)*.8))] overflow-hidden bg-tile bg-[radial-gradient(ellipse_70%_60%_at_50%_58%,rgba(198,40,40,.3),transparent_80%)] ${zoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
            <img src={cur.src} alt={cur.alt} className={`block size-full transition-transform duration-[350ms] ease-in-out ${imgFit(cur.flat)}`}
              style={{ transform: zoom ? 'scale(2.2)' : 'none', transformOrigin: origin }} />
          </div>
          <button type="button" ref={closeRef} onClick={close} aria-label="Close image viewer" className={`${roundBtn} absolute top-3 right-3 border border-off/30 bg-ink`}>✕</button>
          <button type="button" onClick={step(-1)} aria-label="Previous image" className={`${roundBtn} absolute top-1/2 left-3 -translate-y-1/2 border border-off/30 bg-ink`}>←</button>
          <button type="button" onClick={step(1)} aria-label="Next image" className={`${roundBtn} absolute top-1/2 right-3 -translate-y-1/2 border border-off/30 bg-ink`}>→</button>
          <span className="absolute inset-x-0 bottom-6 text-center text-xs font-semibold uppercase tracking-[.18em] text-soft">{counter} · Tap to zoom</span>
        </div>
      )}
    </section>
  );
}
