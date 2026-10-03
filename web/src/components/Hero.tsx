import { forwardRef } from 'react';
import { Embers, Fire } from './Decor';
import { goTo } from '../lib/scroll';

export const BACK_ALT = 'Back of the black WAGMI Rengoku hoodie: Rengoku illustration framed by red flames beneath 煉獄 kanji, with flame artwork on both sleeves';

export const Hero = forwardRef<HTMLElement>(function Hero(_, ref) {
  return (
    <section id="top" ref={ref} aria-labelledby="hero-title" className="relative overflow-hidden bg-ink bg-[radial-gradient(ellipse_60%_70%_at_78%_45%,rgba(198,40,40,.22),transparent_70%)]">
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[35%] -left-[15%] h-[95%] w-3/4 animate-flicker bg-[radial-gradient(closest-side,rgba(198,40,40,.3),rgba(245,166,35,.07)_55%,transparent)]" />
      <Fire count={16} height="28%" opacity={0.6} seed={1} />
      <Embers count={16} seed={1} />
      <div className="relative mx-auto flex min-h-[calc(100vh-104px)] max-w-[1320px] flex-wrap-reverse items-center gap-[clamp(36px,5vw,80px)] px-[clamp(16px,4vw,40px)] pt-[clamp(28px,5vw,72px)] pb-[clamp(56px,7vw,104px)]">
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-7">
          <div className="flex items-center gap-3.5 text-xs font-semibold uppercase tracking-[.22em] text-muted">
            <span>WAGMI — Special Drop</span>
            <span aria-hidden="true" className="h-px flex-[0_0_48px] bg-flame" />
            <span aria-hidden="true" className="font-jp tracking-[.3em] text-soft">煉獄</span>
          </div>
          <h1 id="hero-title" className="m-0 font-display text-[clamp(68px,10.5vw,152px)] font-normal uppercase leading-[.9] tracking-[.005em]">The flame<br />never <span className="text-flame">fades.</span></h1>
          <p lang="ja" className="m-0 font-jp text-[clamp(18px,1.6vw,22px)] font-medium tracking-[.4em] text-gold">炎は、消えない。</p>
          <p className="m-0 max-w-[440px] text-[clamp(17px,1.4vw,19px)] leading-[1.55] text-pretty text-soft">Born from the spirit of the Flame Hashira. Designed for those who carry their fire everywhere.</p>
          <div className="flex max-w-[520px] flex-wrap items-baseline justify-between gap-x-5 gap-y-2 border-t border-off/12 pt-5">
            <span className="text-sm font-medium text-soft-2">WAGMI — Rengoku Special Drop Hoodie</span>
            <span className="font-display text-4xl leading-none tracking-[.02em] text-gold">3,800 DA</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={goTo('order')} className="min-h-14 whitespace-nowrap border-0 bg-flame px-[30px] text-sm font-bold uppercase tracking-[.16em] text-off transition-colors duration-200 hover:bg-flame-dark">Order your hoodie</button>
            <button type="button" onClick={goTo('gallery')} className="min-h-14 whitespace-nowrap border border-off/30 bg-ink/75 px-[26px] text-sm font-bold uppercase tracking-[.16em] text-off transition-colors duration-200 hover:border-off">Explore the drop</button>
          </div>
        </div>
        <div className="relative mx-auto min-w-0 max-w-[min(640px,calc(64vh*.78))] flex-[1_1_320px] px-[2%] pt-[4%]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center"><span className="whitespace-nowrap font-jp text-[clamp(150px,22vw,320px)] font-bold leading-none text-flame/17 [writing-mode:vertical-rl]">煉獄</span></div>
          <div aria-hidden="true" className="absolute inset-x-[8%] top-[14%] bottom-[4%] bg-[radial-gradient(closest-side,rgba(245,166,35,.32),rgba(198,40,40,.36)_45%,transparent_78%)] blur-[32px]" />
          <span aria-hidden="true" className="absolute top-0 left-0 size-9 border-t border-l border-off/50" />
          <span aria-hidden="true" className="absolute right-0 bottom-0 size-9 border-r border-b border-off/50" />
          <img src="/assets/cut-back.webp" alt={BACK_ALT} fetchPriority="high" width={1125} height={1500} className="relative block h-auto w-full drop-shadow-[0_28px_36px_rgba(0,0,0,.65)]" />
          <div aria-hidden="true" className="absolute top-[8%] right-[6%] grid size-[60px] -rotate-5 place-items-center whitespace-nowrap bg-flame font-jp text-[15px] font-bold leading-[1.05] text-off shadow-[inset_0_0_0_3px_#C62828,inset_0_0_0_4.5px_rgba(245,240,232,.85)] [writing-mode:vertical-rl]">炎柱</div>
          <div aria-hidden="true" className="absolute bottom-[12%] left-[2%] whitespace-nowrap font-jp text-[13px] tracking-[.5em] text-muted [writing-mode:vertical-rl]">スペシャル・ドロップ</div>
        </div>
      </div>
    </section>
  );
});
