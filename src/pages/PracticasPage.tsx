import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout as Layout } from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { usuariosService } from '@/features/usuarios/services/usuarios.service';
import { practicasService, buildMediaUrl, deriveAudioCandidates } from '@/features/practicas/services/practicas.service';
import type { Usuario } from '@/features/usuarios/types/usuarios.types';
import type { EjercicioConIntentos, IntentoDetalle } from '@/features/practicas/types/practicas.types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIPO_LABEL: Record<string, string> = {
  entonacion: 'Entonación',
  ritmo: 'Ritmo',
  dictado: 'Dictado',
  lectura_vista: 'Lectura a Vista',
  identificacion: 'Identificación',
};

function initiales(u: Usuario) {
  return `${u.nombre[0] ?? ''}${u.apellido[0] ?? ''}`.toUpperCase();
}

function scoreColor(score: number) {
  if (score >= 80) return 'bg-green-100 text-green-700';
  if (score >= 60) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

function avatarColor(name: string) {
  const colors = [
    'bg-[#2d5a3d]/20 text-[#2d5a3d]',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-orange-100 text-orange-700',
    'bg-rose-100 text-rose-700',
    'bg-teal-100 text-teal-700',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// Distingue si la URL es un archivo de audio reproducible o una imagen de espectrograma.
// Los resultados históricos almacenaban la URL del espectrograma PNG en lugar del audio.
function getMediaType(url: string | null): 'audio' | 'spectrogram' | null {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.includes('/static/spectrograms/') || lower.endsWith('.png') || lower.endsWith('.jpg')) {
    return 'spectrogram';
  }
  if (
    lower.includes('/static/audio/') ||
    lower.endsWith('.ogg') ||
    lower.endsWith('.wav') ||
    lower.endsWith('.mp3') ||
    lower.endsWith('.m4a') ||
    lower.endsWith('.flac')
  ) {
    return 'audio';
  }
  return null;
}

// ── Componente: card de estudiante ────────────────────────────────────────────

function EstudianteCard({ usuario, onClick }: { usuario: Usuario; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left w-full rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-[#2d5a3d]/40 transition-all p-4 flex flex-col gap-3"
    >
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor(usuario.nombre)}`}>
          {initiales(usuario)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{usuario.nombre} {usuario.apellido}</p>
          <p className="text-xs text-muted-foreground truncate">{usuario.correo}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {usuario.mencion && (
          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded truncate max-w-[120px]">
            {usuario.mencion}
          </span>
        )}
        {usuario.paralelo != null && (
          <span className="text-xs text-muted-foreground">Paralelo {usuario.paralelo}</span>
        )}
        <span className={`ml-auto text-xs px-2 py-0.5 rounded ${usuario.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {usuario.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>
    </button>
  );
}

// ── Componente: fila de intento ───────────────────────────────────────────────

function IntentoRow({ intento }: { intento: IntentoDetalle }) {
  const [expanded, setExpanded] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const mediaSrc = buildMediaUrl(intento.audio_url);
  const mediaType = getMediaType(intento.audio_url);
  const derivedAudioCandidates = mediaType === 'spectrogram' && intento.audio_url
    ? deriveAudioCandidates(intento.audio_url)
    : [];
  const retro = intento.retroalimentacion;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
      >
        <span className="text-xs font-mono text-muted-foreground w-14 shrink-0">
          #{intento.numero_intento}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          {new Date(intento.fecha_intento).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'short', year: 'numeric',
          })}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${scoreColor(intento.puntuacion)}`}>
          {intento.puntuacion.toFixed(1)} pts
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          {intento.precision_porcentaje.toFixed(0)}% precisión
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          {formatDuration(intento.duracion_segundos)}
        </span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded shrink-0 ${intento.aprobado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {intento.aprobado ? 'Aprobado' : 'No aprobado'}
        </span>
        <span className="text-muted-foreground text-xs shrink-0">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 bg-secondary/20">
          {/* Audio o espectrograma */}
          {mediaType === 'audio' && mediaSrc && (
            <div>
              <p className="text-xs font-medium text-foreground mb-1">Audio del intento</p>
              <audio
                controls
                src={mediaSrc}
                className="w-full h-9"
                onError={() => setAudioError(true)}
              >
                Tu navegador no soporta la reproducción de audio.
              </audio>
              {audioError && (
                <p className="text-xs text-red-500 mt-1">
                  ⚠ El navegador no pudo cargar el audio. Verifica la URL:
                </p>
              )}
              <a
                href={mediaSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-muted-foreground hover:text-foreground break-all block mt-1 font-mono"
                title="Abrir URL del audio en una pestaña nueva para verificar"
              >
                {mediaSrc}
              </a>
            </div>
          )}
          {mediaType === 'spectrogram' && (
            <div className="space-y-2">
              {derivedAudioCandidates.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Audio del intento</p>
                  <audio controls className="w-full h-9">
                    {derivedAudioCandidates.map(({ src, type }) => (
                      <source key={src} src={src} type={type} />
                    ))}
                    Tu navegador no soporta la reproducción de audio.
                  </audio>
                </div>
              )}
              {mediaSrc && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Espectrograma</p>
                  <img
                    src={mediaSrc}
                    alt="Espectrograma del intento"
                    className="w-full rounded border border-border bg-white"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
              {derivedAudioCandidates.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  Audio no disponible — solo espectrograma (registro anterior a la actualización)
                </p>
              )}
            </div>
          )}
          {!mediaType && (
            <p className="text-xs text-muted-foreground italic">Sin audio registrado</p>
          )}

          {/* Retroalimentación */}
          {retro.mensaje_principal && (
            <div>
              <p className="text-xs font-medium text-foreground mb-1">Retroalimentación</p>
              <p className="text-sm text-foreground bg-card rounded px-3 py-2 border border-border">
                {retro.mensaje_principal}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {retro.errores && retro.errores.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-600 mb-1">Errores</p>
                <ul className="space-y-1">
                  {retro.errores.map((e, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-1">
                      <span className="text-red-400 shrink-0">•</span>{e}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {retro.sugerencias && retro.sugerencias.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#2d5a3d] mb-1">Sugerencias</p>
                <ul className="space-y-1">
                  {retro.sugerencias.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-1">
                      <span className="text-[#2d5a3d] shrink-0">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Notas detectadas */}
          {intento.notas_detectadas && intento.notas_detectadas.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground mb-1">Notas detectadas</p>
              <div className="flex flex-wrap gap-1">
                {intento.notas_detectadas.map((n, i) => (
                  <span key={i} className="text-xs bg-card border border-border px-2 py-0.5 rounded font-mono">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Componente: card de ejercicio con intentos ────────────────────────────────

function EjercicioCard({ ejercicio }: { ejercicio: EjercicioConIntentos }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-0">
        {/* Header del ejercicio */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-start gap-4 p-4 hover:bg-secondary/30 transition-colors text-left"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-foreground truncate">{ejercicio.titulo}</span>
              <span className="text-xs bg-[#2d5a3d]/10 text-[#2d5a3d] px-2 py-0.5 rounded shrink-0">
                {TIPO_LABEL[ejercicio.tipo] ?? ejercicio.tipo}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${ejercicio.aprobado ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {ejercicio.aprobado ? 'Aprobado' : 'En progreso'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {ejercicio.compas} · {ejercicio.bpm_referencia} BPM
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 shrink-0 text-sm">
            <div className="text-center">
              <p className="font-bold text-foreground">{ejercicio.total_intentos}</p>
              <p className="text-xs text-muted-foreground">intentos</p>
            </div>
            <div className="text-center">
              <p className={`font-bold px-2 py-0.5 rounded ${scoreColor(ejercicio.mejor_puntuacion)}`}>
                {ejercicio.mejor_puntuacion.toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">mejor</p>
            </div>
            <span className="text-muted-foreground text-sm">{expanded ? '▲' : '▼'}</span>
          </div>
        </button>

        {/* Lista de intentos */}
        {expanded && (
          <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {ejercicio.intentos.length} intento{ejercicio.intentos.length !== 1 ? 's' : ''} registrado{ejercicio.intentos.length !== 1 ? 's' : ''}
            </p>
            {ejercicio.intentos.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Sin intentos registrados</p>
            ) : (
              [...ejercicio.intentos]
                .sort((a, b) => new Date(b.fecha_intento).getTime() - new Date(a.fecha_intento).getTime())
                .map((intento) => (
                  <IntentoRow key={intento.resultado_id} intento={intento} />
                ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Componente: vista de detalle del estudiante ───────────────────────────────

function DetalleEstudiante({ estudiante, onVolver }: { estudiante: Usuario; onVolver: () => void }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['practicas-estudiante', estudiante.id],
    queryFn: () => practicasService.getEjerciciosEstudiante(estudiante.id),
  });

  return (
    <Layout>
      <div className="mb-6">
        <button
          onClick={onVolver}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          ← Volver a estudiantes
        </button>

        {/* Banner estudiante */}
        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl shadow-sm">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${avatarColor(estudiante.nombre)}`}>
            {initiales(estudiante)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">{estudiante.nombre} {estudiante.apellido}</h1>
            <p className="text-sm text-muted-foreground">{estudiante.correo}</p>
            <div className="flex gap-3 mt-1 flex-wrap">
              {estudiante.mencion && (
                <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">
                  {estudiante.mencion}
                </span>
              )}
              {estudiante.paralelo != null && (
                <span className="text-xs text-muted-foreground">Paralelo {estudiante.paralelo}</span>
              )}
            </div>
          </div>
          {data && (
            <div className="flex gap-6 shrink-0 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{data.total_ejercicios}</p>
                <p className="text-xs text-muted-foreground">ejercicios</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {data.ejercicios.reduce((acc, e) => acc + e.total_intentos, 0)}
                </p>
                <p className="text-xs text-muted-foreground">intentos</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-16 text-muted-foreground">
          No se pudieron cargar las prácticas de este estudiante.
        </div>
      )}

      {data && data.ejercicios.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          Este estudiante no tiene ejercicios registrados.
        </div>
      )}

      {data && data.ejercicios.length > 0 && (
        <div className="space-y-3">
          {data.ejercicios.map((ej) => (
            <EjercicioCard key={ej.ejercicio_id} ejercicio={ej} />
          ))}
        </div>
      )}
    </Layout>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export function PracticasPage() {
  const [estudianteSel, setEstudianteSel] = useState<Usuario | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activos' | 'inactivos'>('activos');
  const [pagina, setPagina] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['estudiantes-practicas', pagina, filtroActivo],
    queryFn: () =>
      usuariosService.getAll(
        pagina,
        20,
        'estudiante',
        filtroActivo === 'todos' ? null : filtroActivo === 'activos',
      ),
  });

  if (estudianteSel) {
    return <DetalleEstudiante estudiante={estudianteSel} onVolver={() => setEstudianteSel(null)} />;
  }

  const estudiantes = data?.datos ?? [];
  const filtrados = busqueda.trim()
    ? estudiantes.filter(u =>
        `${u.nombre} ${u.apellido} ${u.correo}`.toLowerCase().includes(busqueda.toLowerCase()),
      )
    : estudiantes;

  const totalPag = data ? Math.ceil(data.total / 20) : 1;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Prácticas</h1>
        <span className="text-sm text-muted-foreground">
          {data?.total ?? 0} estudiante{(data?.total ?? 0) !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        <Input
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="max-w-sm"
        />
        <select
          className="px-3 py-2 border rounded-md text-sm bg-input-background text-foreground border-border"
          value={filtroActivo}
          onChange={(e) => { setFiltroActivo(e.target.value as typeof filtroActivo); setPagina(1); }}
        >
          <option value="activos">Solo activos</option>
          <option value="inactivos">Solo inactivos</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {/* Grid de estudiantes */}
      {isLoading ? (
        <div className="grid grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card animate-pulse p-4 space-y-3">
              <div className="flex gap-3 items-center">
                <div className="w-11 h-11 rounded-full bg-secondary shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-secondary rounded w-3/4" />
                  <div className="h-2.5 bg-secondary rounded w-full" />
                </div>
              </div>
              <div className="h-5 bg-secondary rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {busqueda ? 'Sin resultados para la búsqueda.' : 'No hay estudiantes registrados.'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-5 gap-4">
            {filtrados.map((u) => (
              <EstudianteCard key={u.id} usuario={u} onClick={() => setEstudianteSel(u)} />
            ))}
          </div>

          {!busqueda && totalPag > 1 && (
            <div className="flex items-center justify-between mt-6">
              <span className="text-sm text-muted-foreground">
                Página {pagina} de {totalPag}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" disabled={pagina <= 1} onClick={() => setPagina(p => p - 1)} className="border-[#2d5a3d] text-[#2d5a3d]">
                  Anterior
                </Button>
                <Button variant="outline" disabled={pagina >= totalPag} onClick={() => setPagina(p => p + 1)} className="border-[#2d5a3d] text-[#2d5a3d]">
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
