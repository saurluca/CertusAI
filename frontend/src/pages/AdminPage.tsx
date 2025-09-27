import React, { useEffect } from 'react';
import AdminDashboard from '../components/admin/AdminDashboard';
import { useAppStore } from '../store';

const AdminPage: React.FC = () => {
  const { analytics, loadAnalytics } = useAppStore();

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleBatchAnalysis = (documentIds: string[]) => {
    console.log('Batch analysis requested for:', documentIds);
    // Additional logic here if needed
  };

  return (
    <AdminDashboard 
      analytics={analytics}
      onBatchAnalysis={handleBatchAnalysis}
    />
  );
};

export default AdminPage;
