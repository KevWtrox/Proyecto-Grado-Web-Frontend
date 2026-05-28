import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EstudiantesPage } from '@/pages/EstudiantesPage';
import { EjerciciosPage } from '@/pages/EjerciciosPage';
import { RitmicaPage } from '@/pages/RitmicaPage';
import { PracticasPage } from '@/pages/PracticasPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/estudiantes" element={<ProtectedRoute><EstudiantesPage /></ProtectedRoute>} />
      <Route path="/ejercicios" element={<ProtectedRoute><EjerciciosPage /></ProtectedRoute>} />
      <Route path="/ejercicios/ritmica" element={<ProtectedRoute><RitmicaPage /></ProtectedRoute>} />
      <Route path="/practicas" element={<ProtectedRoute><PracticasPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
