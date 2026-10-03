import type { CSSProperties, ReactNode } from 'react';

// Seeded RNG so flames and embers render identically on every load.
function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function Fire({ count, height, opacity, seed = 1 }: { count: number; height: string; opacity: number; seed?: number }) {
  const rng = seeded(20261003 + seed);
  const tongues = Array.from({ length: count }, (_, i) => {
    const w = 10 + rng() * 14, left = (i / (count - 1)) * 100 - w / 2 + (rng() - 0.5) * 6, ht = 45 + rng() * 55;
    const style: CSSProperties = {
      left: left + '%', width: w + '%', height: ht + '%',
      animation: `wg-lick ${(1.8 + rng() * 1.8).toFixed(2)}s ease-in-out ${(-rng() * 3).toFixed(2)}s infinite alternate`
    };
    return <span key={i} style={style} className="absolute bottom-[-12%] origin-bottom rounded-[50%_50%_42%_42%/72%_72%_28%_28%] bg-[radial-gradient(ellipse_farthest-side_at_50%_100%,rgba(255,220,140,.95),rgba(245,166,35,.85)_25%,rgba(198,40,40,.7)_55%,rgba(198,40,40,0)_100%)] mix-blend-screen blur-[16px]" />;
  });
  return <div aria-hidden="true" className="pointer-events-none absolute -inset-x-[5%] bottom-0 overflow-hidden" style={{ height, opacity }}>{tongues}</div>;
}

export function Embers({ count, seed = 1 }: { count: number; seed?: number }) {
  const rng = seeded(7 + seed * 131);
  const sparks = Array.from({ length: count }, (_, i) => {
    const sz = 2 + rng() * 3;
    const style = {
      left: (rng() * 100).toFixed(1) + '%', width: sz, height: sz,
      background: rng() > 0.5 ? '#FFC56B' : '#F5A623',
      '--dx': ((rng() - 0.5) * 160).toFixed(0) + 'px',
      animation: `wg-rise ${(6 + rng() * 8).toFixed(2)}s linear ${(-rng() * 14).toFixed(2)}s infinite`
    } as CSSProperties;
    return <span key={i} style={style} className="absolute -bottom-2.5 rounded-full shadow-[0_0_8px_2px_rgba(245,166,35,.7)]" />;
  });
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">{sparks}</div>;
}

const MARQUEE = ['煉獄', 'Rengoku Special Drop', '炎柱', '心を燃やせ', 'Set your heart ablaze', 'ワグミ', 'WAGMI'];
const isJp = (s: string) => /[　-鿿]/.test(s);

export function Marquee() {
  const run = (k: number) => (
    <div key={k} className="flex flex-none items-center gap-9 pr-9">
      {MARQUEE.map(x => (
        <span key={x} className="contents">
          <span className={isJp(x) ? 'whitespace-nowrap font-jp text-xl font-bold tracking-[.2em]' : 'whitespace-nowrap font-display text-[22px] uppercase tracking-[.08em]'}>{x}</span>
          <span className="size-[7px] flex-none rotate-45 bg-gold" />
        </span>
      ))}
    </div>
  );
  return (
    <div aria-hidden="true" className="overflow-hidden border-y border-ink bg-flame py-3.5 text-off">
      <div className="flex w-max animate-marquee">{[run(0), run(1)]}</div>
    </div>
  );
}

// Section eyebrow with a kanji numeral (壱, 弐, 参…).
export function Eyebrow({ kanji, children }: { kanji: string; children: ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-[.22em] text-muted">
      <span className="mr-2.5 font-jp text-base font-bold tracking-normal text-flame">{kanji}</span>{children}
    </span>
  );
}
