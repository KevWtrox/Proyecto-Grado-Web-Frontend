import { useQuery } from '@tanstack/react-query';
import { MainLayout as Layout } from '@/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getIntentosPorDiaSemana } from '@/features/dashboard/services/estadisticas.service';

const mockEstudiantes = [
  { id: '1', nombre: 'Kevin Torrez', puntuacion: 95, ejercicios: 24 },
  { id: '2', nombre: 'Maria Garcia', puntuacion: 88, ejercicios: 20 },
  { id: '3', nombre: 'Juan Perez', puntuacion: 82, ejercicios: 18 },
  { id: '4', nombre: 'Ana Lopez', puntuacion: 78, ejercicios: 15 },
  { id: '5', nombre: 'Carlos Ruiz', puntuacion: 75, ejercicios: 12 },
];

const mockUltimoEjercicio = {
  nombre: 'Patrón de batería - Rock Básico',
  puntuacion: 85,
  fecha: '27/03/2026',
};

const DIA_LABEL_CORTO: Record<string, string> = {
  Lunes: 'Lun', Martes: 'Mar', 'Miércoles': 'Mié', Jueves: 'Jue',
  Viernes: 'Vie', 'Sábado': 'Sáb', Domingo: 'Dom',
};

export function DashboardPage() {
  const { data: intentosData, isLoading: loadingIntentos } = useQuery({
    queryKey: ['estadisticas', 'intentos-por-dia-semana'],
    queryFn: getIntentosPorDiaSemana,
    staleTime: 60_000,
  });

  const dias = intentosData?.dias ?? [];
  const maxIntentos = dias.length > 0 ? Math.max(...dias.map(d => d.intentos), 1) : 1;
  const totalIntentos = intentosData?.total ?? 0;

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
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-primary">Intentos por Día de la Semana</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Últimos 30 días · solo ejercicios completados
                  </p>
                </div>
                {!loadingIntentos && (
                  <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary shrink-0">
                    {totalIntentos} {totalIntentos === 1 ? 'intento' : 'intentos'}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingIntentos ? (
                <div className="flex items-end justify-between h-40 gap-2 animate-pulse">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-secondary rounded-t" style={{ height: `${30 + (i * 10) % 70}%` }} />
                      <div className="w-8 h-3 bg-secondary rounded" />
                    </div>
                  ))}
                </div>
              ) : totalIntentos === 0 ? (
                <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
                  Sin intentos registrados en este periodo
                </div>
              ) : (
                <div className="flex items-end justify-between h-40 gap-2">
                  {dias.map((d) => {
                    const label = DIA_LABEL_CORTO[d.dia_nombre] ?? d.dia_nombre.slice(0, 3);
                    const heightPct = (d.intentos / maxIntentos) * 100;
                    return (
                      <div key={d.dia_num} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <div className="absolute -top-5 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-foreground pointer-events-none">
                          {d.intentos}
                        </div>
                        <div
                          className="w-full rounded-t transition-all"
                          style={{
                            background: 'linear-gradient(to top, var(--sidebar-primary), var(--accent))',
                            height: `${heightPct}%`,
                            minHeight: d.intentos > 0 ? '8px' : '2px',
                          }}
                          title={`${d.dia_nombre}: ${d.intentos}`}
                        />
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
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
