const HEADER_OFFSET = 64;

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
}

export const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

// onClick handler for in-page anchor links and buttons.
export const goTo = (id: string) => (e?: { preventDefault(): void }) => { e?.preventDefault(); scrollToId(id); };
