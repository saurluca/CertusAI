import React from 'react';
import { useNavigate } from 'react-router-dom';
import SwissWelcomePage from '../components/welcome/SwissWelcomePage';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    console.log('Welcome page completed, navigating to home');
    navigate('/home');
  };

  return <SwissWelcomePage onComplete={handleComplete} />;
};

export default WelcomePage;
