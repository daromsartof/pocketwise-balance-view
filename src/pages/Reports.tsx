
import React from 'react';
import { FinanceProvider } from '../context/FinanceContext';
import MainLayout from '../components/MainLayout';
import ReportsContent from '../components/Reports/ReportsContent';

const Reports: React.FC = () => {
  return (
    <FinanceProvider>
      <MainLayout>
        <ReportsContent />
      </MainLayout>
    </FinanceProvider>
  );
};

export default Reports;
