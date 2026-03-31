import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/lib/userStore';
import { logout } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockEstudiantes = [
  { id: '1', nombre: 'Kevin Torrez', puntuacion: 95, ejercicios: 24 },
  { id: '2', nombre: 'Maria Garcia', puntuacion: 88, ejercicios: 20 },
  { id: '3', nombre: 'Juan Perez', puntuacion: 82, ejercicios: 18 },
  { id: '4', nombre: 'Ana Lopez', puntuacion: 78, ejercicios: 15 },
  { id: '5', nombre: 'Carlos Ruiz', puntuacion: 75, ejercicios: 12 },
];

const mockPracticasPorDia = [
  { dia: 'Lun', cantidad: 12 },
  { dia: 'Mar', cantidad: 8 },
  { dia: 'Mié', cantidad: 15 },
  { dia: 'Jue', cantidad: 6 },
  { dia: 'Vie', cantidad: 20 },
  { dia: 'Sáb', cantidad: 3 },
  { dia: 'Dom', cantidad: 0 },
];

const mockUltimoEjercicio = {
  nombre: 'Patrón de batería - Rock Básico',
  puntuacion: 85,
  fecha: '27/03/2026',
};

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const maxPractica = Math.max(...mockPracticasPorDia.map(p => p.cantidad));

  return (
    <div className="min-h-screen flex bg-[#f5f0e6]">
      <aside className="w-64 bg-[#2d5a3d] text-[#f5f0e6] flex flex-col shadow-xl">
        <div className="p-4 border-b border-[#3d7a52]">
          <h1 className="text-xl font-bold">AudioLearn</h1>
          <p className="text-xs text-[#a8c4b0]">Panel Admin</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => {
              setActiveMenu('dashboard');
              navigate('/dashboard');
            }}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeMenu === 'dashboard'
                ? 'bg-[#3d7a52] text-[#f5f0e6]'
                : 'text-[#a8c4b0] hover:bg-[#3d7a52]/50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveMenu('estudiantes');
              navigate('/estudiantes');
            }}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeMenu === 'estudiantes'
                ? 'bg-[#3d7a52] text-[#f5f0e6]'
                : 'text-[#a8c4b0] hover:bg-[#3d7a52]/50'
            }`}
          >
            Lista de Estudiantes
          </button>
        </nav>

        <div className="p-4 border-t border-[#3d7a52]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#f5f0e6] text-[#2d5a3d] flex items-center justify-center font-bold">
              {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {user?.nombre} {user?.apellido}
              </p>
              <p className="text-xs text-[#a8c4b0] truncate">{user?.correo}</p>
            </div>
          </div>
          <Button 
            onClick={logout} 
            variant="outline" 
            className="w-full border-[#c4b896] text-[#2d5a3d] hover:bg-[#c4b896]/30 bg-transparent"
          >
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#2d5a3d] mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#2d5a3d]">Ranking de Estudiantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockEstudiantes.map((estudiante, index) => (
                  <div 
                    key={estudiante.id} 
                    className="flex items-center justify-between p-3 bg-[#f5f0e6] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === 0 ? 'bg-[#d4a84b] text-white' :
                        index === 1 ? 'bg-[#a8a8a8] text-white' :
                        index === 2 ? 'bg-[#cd7f32] text-white' :
                        'bg-[#2d5a3d] text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-[#2d5a3d]">{estudiante.nombre}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#2d5a3d]">{estudiante.puntuacion}pts</span>
                      <span className="text-sm text-muted-foreground ml-2">({estudiante.ejercicios} ejer.)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#2d5a3d]">Prácticas por Día de la Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between h-40 gap-2">
                  {mockPracticasPorDia.map((practica) => (
                    <div key={practica.dia} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-[#2d5a3d] rounded-t transition-all"
                        style={{ 
                          height: `${(practica.cantidad / maxPractica) * 100}%`,
                          minHeight: practica.cantidad > 0 ? '8px' : '2px'
                        }}
                      />
                      <span className="text-xs text-muted-foreground">{practica.dia}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#2d5a3d]">Último Ejercicio Realizado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <h3 className="text-lg font-semibold text-[#2d5a3d] mb-2">
                    {mockUltimoEjercicio.nombre}
                  </h3>
                  <div className="flex items-center justify-center gap-6 text-muted-foreground">
                    <div>
                      <p className="text-3xl font-bold text-[#2d5a3d]">{mockUltimoEjercicio.puntuacion}</p>
                      <p className="text-sm">puntos</p>
                    </div>
                    <div className="border-l border-[#c4b896] pl-6">
                      <p className="text-lg">{mockUltimoEjercicio.fecha}</p>
                      <p className="text-sm">fecha</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
