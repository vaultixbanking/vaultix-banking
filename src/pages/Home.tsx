import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import BankingNeeds from '../components/BankingNeeds';
import LoanSection from '../components/LoanSection';
import Services from '../components/Services';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import CardSection from '../components/CardSection';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <BankingNeeds />
      <LoanSection />
      <Services />
      <WhyChooseUs />
      <Testimonials />
      <CardSection />
      <Footer />
    </div>
  );
};

export default Home;