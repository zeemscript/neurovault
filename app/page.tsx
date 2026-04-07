import HeroPage from './(pages)/Hero';
import TrustedBy from './(pages)/TrustedBy';
import Bento from './(pages)/Bento';
import LandingPage from './(pages)/LandingPage';
import Footer from './(pages)/Footer';
import Faq from './(pages)/Faq';
import Stats from './(pages)/Stats';

export default function Home() {
  return (
    <>
      <LandingPage />
      <HeroPage />
      <Stats />
      <Bento /> 
      <TrustedBy />
      <Faq />
      <Footer />
    </>
  );
}