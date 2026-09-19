import React from 'react';
import { Navigate } from 'react-router-dom';

export function Partners() {
  // All public media kit content is unified at root (Tier 1) to eliminate duplicate grids and sections
  return <Navigate to="/" replace />;
}
