import React from 'react';
import { Navigate } from 'react-router-dom';
import MobileFooter from './layout/MobileFooter.jsx';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return (
    <>
      {children}
      {/* Global mobile footer */}
      <MobileFooter />
      {/* Spacer so content above isn't hidden by footer */}
      <div className="h-14 md:hidden" />
    </>
  );
}
