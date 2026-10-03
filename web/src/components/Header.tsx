import { goTo, scrollToTop } from '../lib/scroll';

export function AnnouncementBar() {
  return (
    <div role="region" aria-label="Announcement" className="border-b border-off/8 bg-charcoal">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-center gap-x-[18px] gap-y-1.5 px-[clamp(16px,4vw,40px)] py-2.5 text-center text-[11.5px] font-semibold uppercase tracking-[.2em]">
        <span className="flex items-center gap-2.5"><span aria-hidden="true" className="size-1.5 rounded-full bg-flame shadow-[0_0_10px_#C62828]" />Rengoku Special Drop — Available now</span>
        <span className="tracking-[.12em] text-muted">Delivery available across Algeria.</span>
      </div>
    </div>
  );
}

const NAV = [['gallery', 'The drop'], ['story', 'Story'], ['details', 'Details']] as const;

export function Header({ showNav }: { showNav: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-off/8 bg-ink/86 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-6 px-[clamp(16px,4vw,40px)]">
        <a href="#top" onClick={e => { e.preventDefault(); scrollToTop(); }} aria-label="WAGMI, back to top" className="flex items-center gap-2.5 text-off no-underline hover:text-off">
          <span className="font-display text-[26px] leading-none tracking-[.08em]">WAGMI</span>
          <span aria-hidden="true" className="rounded-[2px] bg-flame px-[5px] py-1 font-jp text-xs font-bold leading-none text-off shadow-[inset_0_0_0_1.5px_#C62828,inset_0_0_0_2.5px_rgba(245,240,232,.75)]">炎</span>
        </a>
        {showNav && (
          <nav aria-label="Sections" className="flex gap-8 text-xs font-semibold uppercase tracking-[.18em]">
            {NAV.map(([id, label]) => <a key={id} href={'#' + id} onClick={goTo(id)} className="text-soft no-underline hover:text-off">{label}</a>)}
          </nav>
        )}
        <button type="button" onClick={goTo('order')} className="min-h-10 flex-none whitespace-nowrap border border-off/40 bg-transparent px-[18px] text-xs font-bold uppercase tracking-[.16em] text-off transition-all duration-200 hover:border-off hover:bg-off hover:text-ink">Order · 3,800 DA</button>
      </div>
    </header>
  );
}
