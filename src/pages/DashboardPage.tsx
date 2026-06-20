import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { MainLayout as Layout } from '@/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { estadisticasService, getIntentosPorDiaSemana } from '@/features/dashboard/services/estadisticas.service';
import { usuariosService } from '@/features/usuarios/services/usuarios.service';
import { useUserStore } from '@/core/store/userStore';
import type { IntentoReciente, RankingItem } from '@/features/dashboard/types/estadisticas.types';

const DIA_LABEL_CORTO: Record<string, string> = {
  Lunes: 'Lun', Martes: 'Mar', 'Miércoles': 'Mié', Jueves: 'Jue',
  Viernes: 'Vie', 'Sábado': 'Sáb', Domingo: 'Dom',
};

const TIPO_LABEL: Record<string, string> = {
  entonacion: 'Entonación',
  ritmo: 'Ritmo',
  dictado: 'Dictado',
  lectura_vista: 'Lectura a Vista',
  identificacion: 'Identificación',
};

const PARALELOS_OPCIONES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function formatFechaCorta(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function DashboardPage() {
  const user = useUserStore(s => s.user);
  const [paralelo, setParalelo] = useState<number>(user?.paralelo ?? 1);

  // Ranking del paralelo seleccionado
  const rankingQuery = useQuery({
    queryKey: ['dashboard', 'ranking', paralelo],
    queryFn: () => estadisticasService.getRanking(paralelo, 10),
    staleTime: 30_000,
  });

  // Último intento registrado (limite=1)
  const recientesQuery = useQuery({
    queryKey: ['dashboard', 'recientes', 1],
    queryFn: () => estadisticasService.getIntentosRecientes(1),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const ultimoIntento: IntentoReciente | undefined = recientesQuery.data?.[0];

  // Datos del estudiante del último intento (para mostrar nombre)
  const estudianteUltimoQuery = useQuery({
    queryKey: ['usuario', ultimoIntento?.estudiante_id],
    queryFn: () => usuariosService.getById(ultimoIntento!.estudiante_id!),
    enabled: !!ultimoIntento?.estudiante_id,
    staleTime: 5 * 60_000,
  });

  // Gráfico por día
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
        {/* Ranking */}
        <Card className="border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#d4a84b]" />
                <CardTitle className="text-primary">Ranking de Estudiantes</CardTitle>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <label className="text-muted-foreground">Paralelo:</label>
                <select
                  value={paralelo}
                  onChange={(e) => setParalelo(Number(e.target.value))}
                  className="px-2 py-1 border rounded-md bg-input-background text-foreground border-border"
                >
                  {PARALELOS_OPCIONES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RankingList
              data={rankingQuery.data ?? []}
              loading={rankingQuery.isLoading}
              error={rankingQuery.isError ? rankingQuery.error : null}
            />
          </CardContent>
        </Card>

        {/* Columna derecha: chart por día + último intento */}
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
              {recientesQuery.isLoading ? (
                <UltimoIntentoSkeleton />
              ) : !ultimoIntento ? (
                <p className="text-center py-6 text-sm text-muted-foreground italic">
                  Aún no hay intentos registrados.
                </p>
              ) : (
                <UltimoIntentoContenido
                  intento={ultimoIntento}
                  estudianteNombre={
                    estudianteUltimoQuery.data
                      ? `${estudianteUltimoQuery.data.nombre} ${estudianteUltimoQuery.data.apellido}`
                      : null
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function RankingList({
  data,
  loading,
  error,
}: {
  data: RankingItem[];
  loading: boolean;
  error: unknown;
}) {
  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-secondary rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-500 py-4 text-center">
        No se pudo cargar el ranking. Verificá si el paralelo tiene estudiantes.
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center italic">
        No hay estudiantes en este paralelo todavía.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.map(item => (
        <div
          key={item.usuario_id}
          className="flex items-center justify-between p-3 bg-secondary rounded-lg"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
              item.posicion === 1 ? 'bg-[#d4a84b] text-white' :
              item.posicion === 2 ? 'bg-[#a8a8a8] text-white' :
              item.posicion === 3 ? 'bg-[#cd7f32] text-white' :
              'bg-muted text-foreground'
            }`}>
              {item.posicion}
            </span>
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">
                {item.nombre} {item.apellido}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Nivel {item.nivel_actual} · {item.ejercicios_completados} ejercicios
              </p>
            </div>
          </div>
          <span className="font-bold text-primary shrink-0">
            {item.puntos_totales.toLocaleString('es-ES')} pts
          </span>
        </div>
      ))}
    </div>
  );
}

function UltimoIntentoSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-5 bg-secondary rounded w-3/4 mx-auto" />
      <div className="h-12 bg-secondary rounded w-1/2 mx-auto" />
      <div className="h-3 bg-secondary rounded w-1/3 mx-auto" />
    </div>
  );
}

function UltimoIntentoContenido({
  intento,
  estudianteNombre,
}: {
  intento: IntentoReciente;
  estudianteNombre: string | null;
}) {
  const tipoLbl = intento.ejercicio_tipo ? (TIPO_LABEL[intento.ejercicio_tipo] ?? intento.ejercicio_tipo) : null;
  return (
    <div className="text-center py-2 space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          {intento.ejercicio_titulo ?? 'Ejercicio sin título'}
        </h3>
        {tipoLbl && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {tipoLbl}
            {intento.ejercicio_compas && ` · ${intento.ejercicio_compas}`}
            {intento.ejercicio_bpm_referencia ? ` · ${intento.ejercicio_bpm_referencia} BPM` : ''}
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-6 text-muted-foreground">
        <div>
          <p className="text-3xl font-bold text-primary">{intento.puntuacion.toFixed(0)}</p>
          <p className="text-xs">puntos</p>
        </div>
        <div className="border-l border-border pl-6 text-left">
          <p className="text-sm font-medium text-foreground">
            {estudianteNombre ?? 'Cargando estudiante…'}
          </p>
          <p className="text-xs">{formatFechaCorta(intento.fecha_intento)}</p>
          <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded ${
            intento.aprobado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {intento.aprobado ? 'Aprobado' : 'No aprobado'}
          </span>
        </div>
      </div>
    </div>
  );
}
