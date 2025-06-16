import React from 'react';
import Hero from '../components/home/Hero';
import ProcessSteps from '../components/home/ProcessSteps';
import Testimonials from '../components/home/Testimonials';
import FeaturedRooms from '../components/home/FeaturedRooms';
import TrustedBrands from '../components/home/TrustedBrands';

const Home: React.FC = () => {
  return (
    <div>
      <Hero />
      <ProcessSteps />
      <Testimonials />
      {/*<FeaturedRooms />*/}
      <TrustedBrands />
    </div>
  );
};

export default Home;