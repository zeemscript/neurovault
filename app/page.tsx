import HeroPage from './(pages)/Hero';
import TrustedBy from './(pages)/TrustedBy';
import Bento from './(pages)/Bento';
import LandingPage from './(pages)/LandingPage';
import Footer from './(pages)/Footer';
import Faq from './(pages)/Faq';

export default function Home() {
  return (
    <>
      <LandingPage />
      <HeroPage />
      <Bento /> 
      <TrustedBy />
      <Faq />
    <Footer />
    </>
  );
}