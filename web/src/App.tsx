import { useRef, useState } from 'react';
import { Marquee } from './components/Decor';
import { Gallery } from './components/Gallery';
import { AnnouncementBar, Header } from './components/Header';
import { Hero } from './components/Hero';
import { OrderSection } from './components/Order';
import { Details, FinalCta, Footer, Intro, StickyCta, Story } from './components/Sections';
import { INSTAGRAM_URL } from './config';
import { useInView, useMediaQuery } from './lib/hooks';

export default function App() {
  const isMobile = useMediaQuery('(max-width: 820px)');
  const heroRef = useRef<HTMLElement>(null);
  const orderRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const heroVisible = useInView(heroRef, true);
  const orderVisible = useInView(orderRef);
  const footerVisible = useInView(footerRef);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Sticky mobile CTA hides over the hero, the order form and the footer so it never covers them.
  const showSticky = isMobile && !heroVisible && !orderVisible && !footerVisible && !lightboxOpen;

  return (
    <div className="min-h-screen overflow-x-clip bg-ink text-off">
      <AnnouncementBar />
      <Header showNav={!isMobile} />
      <main>
        <Hero ref={heroRef} />
        <Marquee />
        <Intro />
        <Gallery onLightboxChange={setLightboxOpen} />
        <Story />
        <Details />
        <OrderSection ref={orderRef} />
        <FinalCta />
      </main>
      <Footer ref={footerRef} instagramUrl={INSTAGRAM_URL} />
      {showSticky && <StickyCta />}
    </div>
  );
}
