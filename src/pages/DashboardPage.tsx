import { MainLayout as Layout } from '@/layouts/MainLayout';
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
  const maxPractica = Math.max(...mockPracticasPorDia.map(p => p.cantidad));

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-primary">Ranking de Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockEstudiantes.map((estudiante, index) => (
                <div
                  key={estudiante.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === 0 ? 'bg-[#d4a84b] text-white' :
                      index === 1 ? 'bg-[#a8a8a8] text-white' :
                      index === 2 ? 'bg-[#cd7f32] text-white' :
                      'bg-muted text-foreground'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">{estudiante.nombre}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-primary">{estudiante.puntuacion}pts</span>
                    <span className="text-sm text-muted-foreground ml-2">({estudiante.ejercicios} ejer.)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-primary">Prácticas por Día de la Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-40 gap-2">
                {mockPracticasPorDia.map((practica) => (
                  <div key={practica.dia} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t transition-all"
                      style={{
                        background: 'linear-gradient(to top, var(--sidebar-primary), var(--accent))',
                        height: `${(practica.cantidad / maxPractica) * 100}%`,
                        minHeight: practica.cantidad > 0 ? '8px' : '2px',
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{practica.dia}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-primary">Último Ejercicio Realizado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {mockUltimoEjercicio.nombre}
                </h3>
                <div className="flex items-center justify-center gap-6 text-muted-foreground">
                  <div>
                    <p className="text-3xl font-bold text-primary">{mockUltimoEjercicio.puntuacion}</p>
                    <p className="text-sm">puntos</p>
                  </div>
                  <div className="border-l border-border pl-6">
                    <p className="text-lg text-foreground">{mockUltimoEjercicio.fecha}</p>
                    <p className="text-sm">fecha</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
