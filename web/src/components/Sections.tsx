import { forwardRef } from 'react';
import { Embers, Eyebrow, Fire } from './Decor';
import { goTo } from '../lib/scroll';

export function Intro() {
  return (
    <section aria-labelledby="intro-title" className="border-t border-off/8">
      <div className="mx-auto grid max-w-[1320px] grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-end gap-[clamp(32px,5vw,96px)] px-[clamp(16px,4vw,40px)] py-[clamp(80px,11vw,150px)]">
        <div className="flex flex-col gap-[22px]">
          <Eyebrow kanji="壱">The drop</Eyebrow>
          <h2 id="intro-title" className="m-0 font-display text-[clamp(46px,6.2vw,92px)] font-normal uppercase leading-[.94]">More than a hoodie.<br /><span className="text-gold">A state of mind.</span></h2>
        </div>
        <p className="m-0 max-w-[560px] text-[clamp(18px,1.6vw,21px)] leading-[1.6] text-pretty text-soft">Inspired by the unwavering spirit of Rengoku, this special WAGMI drop brings anime culture into everyday streetwear. A design made for those who stand by their passion, carry their identity with confidence, and never let their flame fade.</p>
      </div>
    </section>
  );
}

export function Story() {
  return (
    <section id="story" aria-labelledby="story-title" className="relative overflow-hidden bg-ink bg-[radial-gradient(ellipse_55%_60%_at_22%_40%,rgba(198,40,40,.28),transparent_70%),radial-gradient(ellipse_40%_40%_at_85%_90%,rgba(245,166,35,.08),transparent_70%)]">
      <Embers count={12} seed={2} />
      <div aria-hidden="true" className="pointer-events-none absolute top-[clamp(40px,6vw,96px)] right-[clamp(8px,3vw,40px)] font-jp text-[clamp(56px,9vw,140px)] font-bold leading-none tracking-[.1em] text-flame/20 [writing-mode:vertical-rl]">心を燃やせ</div>
      <div className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,40px)] py-[clamp(80px,11vw,160px)]">
        <div className="flex min-w-0 max-w-[820px] flex-col gap-7">
          <Eyebrow kanji="参">The spirit</Eyebrow>
          <h2 id="story-title" className="m-0 font-display text-[clamp(52px,7vw,108px)] font-normal uppercase leading-[.9]">Set your heart <span className="text-flame">ablaze.</span></h2>
          <div className="flex max-w-[520px] flex-col gap-[18px] text-[clamp(17px,1.4vw,19px)] leading-[1.65] text-soft">
            <p className="m-0 text-pretty">Some flames are born to illuminate the path for others. Rengoku's spirit represents courage, conviction, and the strength to keep moving forward, even when the world grows dark.</p>
            <p className="m-0 text-pretty">WAGMI brings that spirit into a special streetwear release, designed for those who refuse to let their passion fade.</p>
          </div>
          <p className="m-0 font-display text-[clamp(28px,3vw,40px)] uppercase leading-[1.05] text-gold">Wear the flame.<br />Carry the legacy.</p>
          <div className="mt-1 flex flex-col gap-2.5">
            <div className="flex gap-2.5">
              <img src="/assets/art-rengoku.jpg" alt="Sleeve artwork: Rengoku in a fighting stance with his sword, surrounded by red flames" loading="lazy" width={1080} height={1350} className="block h-[120px] w-24 border border-off/14 object-cover" />
              <img src="/assets/art-akaza.jpg" alt="Sleeve artwork: Akaza leaping through red flames" loading="lazy" width={1080} height={1350} className="block h-[120px] w-24 border border-off/14 object-cover" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[.2em] text-muted">Sleeve artwork</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const DETAILS: [string, string, string?][] = [
  ['Product', 'Rengoku Special Drop Hoodie'],
  ['Brand', 'WAGMI'],
  ['Price', '3,800 DA', 'font-bold text-gold'],
  ['Category', 'Japanese-inspired streetwear'],
  ['Collection', 'Special Drop'],
  ['Sizes', 'S · M · L · XL · XXL']
];

export function Details() {
  return (
    <section id="details" aria-labelledby="details-title" className="border-t border-off/8">
      <div className="mx-auto grid max-w-[1320px] grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-center gap-[clamp(36px,6vw,96px)] px-[clamp(16px,4vw,40px)] py-[clamp(72px,9vw,128px)]">
        <div className="relative aspect-[4/5] w-full max-w-[520px] overflow-hidden bg-[#101010] bg-[radial-gradient(ellipse_65%_55%_at_50%_55%,rgba(198,40,40,.32),rgba(245,166,35,.05)_60%,transparent_80%)]">
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center whitespace-nowrap font-jp text-[clamp(140px,20vw,280px)] font-bold leading-none text-off/4 [writing-mode:vertical-rl]">煉獄</span>
          <img src="/assets/cut-front.webp" alt="Front of the black WAGMI Rengoku hoodie with the red and gold flame dragon chest print" loading="lazy" width={1064} height={1417} className="relative block size-full object-contain p-[7%] drop-shadow-[0_24px_30px_rgba(0,0,0,.6)]" />
          <span aria-hidden="true" className="absolute bottom-4 left-4 text-[11px] font-bold uppercase tracking-[.2em] text-muted">Front · 正面</span>
        </div>
        <div className="flex flex-col gap-7">
          <Eyebrow kanji="肆">Details</Eyebrow>
          <h2 id="details-title" className="m-0 font-display text-[clamp(40px,5vw,72px)] font-normal uppercase leading-[.95]">The details.</h2>
          <dl className="m-0 flex flex-col border-b border-off/12">
            {DETAILS.map(([k, v, cls]) => (
              <div key={k} className="grid grid-cols-[minmax(110px,1fr)_2fr] gap-4 border-t border-off/12 py-4">
                <dt className="pt-[3px] text-xs font-semibold uppercase tracking-[.18em] text-muted">{k}</dt>
                <dd className={`m-0 text-[17px] ${cls ?? 'font-semibold'}`}>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="m-0 text-[15px] leading-[1.6] text-soft-2">Not sure which size to choose? <a href="https://wa.me/213556011290" target="_blank" rel="noopener">Message us on WhatsApp</a> before you order.</p>
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section aria-labelledby="final-title" className="relative overflow-hidden border-t border-off/6 bg-ink bg-[radial-gradient(ellipse_60%_70%_at_50%_110%,rgba(198,40,40,.38),rgba(245,166,35,.06)_55%,transparent_75%)] text-center">
      <Fire count={14} height="50%" opacity={0.85} seed={3} />
      <Embers count={14} seed={3} />
      <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-jp text-[clamp(160px,30vw,420px)] font-bold leading-none text-off/[.035]">煉獄</div>
      <div className="relative mx-auto flex max-w-[900px] flex-col items-center gap-7 px-[clamp(16px,4vw,40px)] py-[clamp(96px,14vw,190px)]">
        <span className="text-xs font-semibold uppercase tracking-[.22em] text-muted">Rengoku Special Drop — Available now</span>
        <h2 id="final-title" className="m-0 font-display text-[clamp(56px,9vw,128px)] font-normal uppercase leading-[.9]">Carry your <span className="text-flame">fire.</span></h2>
        <p lang="ja" className="m-0 -mt-1.5 font-jp text-xl tracking-[.4em] text-gold">炎を纏え。</p>
        <p className="m-0 text-lg text-soft"><span className="font-bold text-gold">3,800 DA</span> · Delivery across Algeria</p>
        <button type="button" onClick={goTo('order')} className="min-h-14 border-0 bg-flame px-8 text-sm font-bold uppercase tracking-[.16em] text-off transition-colors duration-200 hover:bg-flame-dark">Order your hoodie</button>
      </div>
    </section>
  );
}

export const Footer = forwardRef<HTMLElement, { instagramUrl: string }>(function Footer({ instagramUrl }, ref) {
  return (
    <footer ref={ref} className="border-t border-off/8 bg-ink">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-[clamp(48px,6vw,80px)] px-[clamp(16px,4vw,40px)] pt-[clamp(56px,7vw,96px)] pb-8">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-10">
          <div className="flex flex-col gap-3.5">
            <span className="font-display text-[52px] leading-none tracking-[.08em]">WAGMI</span>
            <span lang="ja" className="font-jp text-sm tracking-[.5em] text-flame">ワグミ</span>
            <p className="m-0 max-w-[320px] text-[15px] leading-[1.6] text-soft-2">Japanese-inspired streetwear from Algeria.</p>
          </div>
          <div className="flex flex-col gap-3 text-[15px]">
            <span className="text-xs font-semibold uppercase tracking-[.2em] text-muted">Contact</span>
            <a href="https://wa.me/213556011290" target="_blank" rel="noopener" className="no-underline">WhatsApp · +213 556 01 12 90</a>
            {instagramUrl && <a href={instagramUrl} target="_blank" rel="noopener" className="no-underline">Instagram</a>}
            <span className="text-soft-2">Delivery across Algeria</span>
          </div>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-5 border-t border-off/10 pt-7">
          <p className="m-0 font-display text-[clamp(32px,5vw,64px)] uppercase leading-[.95]">Keep your flame <span className="text-flame">alive.</span></p>
          <span className="text-[13px] text-dim">© 2026 WAGMI. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
});

export function StickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-4 border-t border-off/12 bg-[rgba(17,17,17,.96)] px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] backdrop-blur-[10px]">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-xs font-semibold uppercase tracking-[.14em] text-soft">Rengoku Hoodie</span>
        <span className="font-display text-xl leading-none text-gold">3,800 DA</span>
      </div>
      <button type="button" onClick={goTo('order')} className="min-h-12 flex-none border-0 bg-flame px-6 text-[13px] font-extrabold uppercase tracking-[.16em] text-off">Order now</button>
    </div>
  );
}
