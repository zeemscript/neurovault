import LandingPage from "./(pages)/LandingPage";
import HeroPage from "./(pages)/Hero";
import TrustedBy from "./(pages)/TrustedBy";
import Stats from "./(pages)/Stats";
import HowItWorks from "./(pages)/HowItWorks";
import Bento from "./(pages)/Bento";
import Testimonials from "./(pages)/Testimonials";
import Faq from "./(pages)/Faq";
import FinalCTA from "./(pages)/FinalCTA";
import Footer from "./(pages)/Footer";

export default function Home() {
  return (
    <>
      <LandingPage />
      <TrustedBy />
      <HeroPage />
      <Stats />
      <Bento />
      <HowItWorks />
      <Testimonials />
      <Faq />
      <FinalCTA />
      <Footer />
    </>
  );
}
