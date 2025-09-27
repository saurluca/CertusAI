import React from 'react';
import SwissMainLayout from '../components/layout/SwissMainLayout';

interface HomePageProps {
  onWelcomeComplete?: (showHeader: boolean) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onWelcomeComplete }) => {
  return <SwissMainLayout />;
};

export default HomePage;
