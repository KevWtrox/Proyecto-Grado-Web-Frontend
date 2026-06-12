import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { buildMediaUrl, deriveAudioCandidates } from '@/features/practicas/services/practicas.service';
import type { GradCAMReport, NoteAnalysis } from '@/features/analitica/types/analitica.types';

interface Props {
  audioUrl: string | null;
  spectrogramUrl?: string | null;
  gradCam: GradCAMReport;
  notes?: NoteAnalysis[];
  bpmReferencia?: number;
}

function heatRgb(value: number): { r: number; g: number; b: number; a: number } {
  const v = Math.max(0, Math.min(1, value));
  let r: number, g: number, b: number;
  if (v < 0.25) {
    r = 0; g = Math.round(255 * (v / 0.25)); b = 255;
  } else if (v < 0.5) {
    r = 0; g = 255; b = Math.round(255 * (1 - (v - 0.25) / 0.25));
  } else if (v < 0.75) {
    r = Math.round(255 * ((v - 0.5) / 0.25)); g = 255; b = 0;
  } else {
    r = 255; g = Math.round(255 * (1 - (v - 0.75) / 0.25)); b = 0;
  }
  return { r, g, b, a: Math.round((0.45 * v + 0.12) * 255) };
}

// Devuelve { spectrogramSrc, audioSources } a partir de las URLs disponibles.
function resolveMedia(audioUrl: string | null, spectrogramUrl?: string | null) {
  const isImage = (u: string | null) =>
    !!u && /\/static\/spectrograms\/|\.png$|\.jpg$/i.test(u);
  const isAudio = (u: string | null) =>
    !!u && /\/static\/audio\/|\.(wav|ogg|mp3|m4a|flac|webm)$/i.test(u);

  let spectrogramSrc: string | null = null;
  if (spectrogramUrl) {
    spectrogramSrc = buildMediaUrl(spectrogramUrl);
  } else if (isImage(audioUrl)) {
    spectrogramSrc = buildMediaUrl(audioUrl);
  }

  let audioSources: { src: string; type: string }[] = [];
  if (isAudio(audioUrl)) {
    const built = buildMediaUrl(audioUrl);
    if (built) {
      const ext = (audioUrl ?? '').split('.').pop()?.toLowerCase();
      const mime: Record<string, string> = {
        wav: 'audio/wav', ogg: 'audio/ogg', mp3: 'audio/mpeg',
        m4a: 'audio/mp4', flac: 'audio/flac', webm: 'audio/webm',
      };
      audioSources = [{ src: built, type: mime[ext ?? ''] ?? 'audio/wav' }];
    }
  } else if (isImage(audioUrl) || spectrogramUrl) {
    // El audio_url apunta a un PNG (registros viejos) → derivar candidatos por extensión.
    const ref = audioUrl ?? spectrogramUrl ?? '';
    if (ref) audioSources = deriveAudioCandidates(ref);
  }

  return { spectrogramSrc, audioSources };
}

function formatTime(secs: number): string {
  if (!isFinite(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function EspectrogramaConGradCam({
  audioUrl,
  spectrogramUrl,
  gradCam,
  notes = [],
  bpmReferencia,
}: Props) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [showSegments, setShowSegments] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const perNoteCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { spectrogramSrc, audioSources } = resolveMedia(audioUrl, spectrogramUrl);

  const perNoteHeatmaps = useMemo(
    () => gradCam.per_note_heatmaps ?? [],
    [gradCam.per_note_heatmaps],
  );

  // Duración teórica del ejercicio según BPM (negra a BPM_referencia).
  // Si tenemos audio cargado, preferimos su duración real.
  const theoreticalDurationMs = bpmReferencia
    ? notes.length * (60_000 / bpmReferencia)
    : 0;
  const effectiveDurationMs = duration > 0 ? duration * 1000 : theoreticalDurationMs;
  const noteWidthPct = notes.length > 0 ? 100 / notes.length : 0;

  // Sincroniza el estado de play/pause cuando el usuario usa los controles nativos.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);
    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
    };
  }, []);

  // Renderiza el Grad-CAM per-note al canvas (interpolación bilineal del navegador).
  useEffect(() => {
    if (!showOverlay) return;
    const canvas = perNoteCanvasRef.current;
    if (!canvas || perNoteHeatmaps.length === 0) return;
    const N = perNoteHeatmaps.length;
    const RES = perNoteHeatmaps[0]?.length ?? 0;
    if (RES === 0) return;
    canvas.width = N * RES;
    canvas.height = RES;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(N * RES, RES);
    for (let noteIdx = 0; noteIdx < N; noteIdx++) {
      const heat = perNoteHeatmaps[noteIdx];
      for (let r = 0; r < RES; r++) {
        const row = heat[r] ?? [];
        for (let c = 0; c < RES; c++) {
          const v = row[c] ?? 0;
          const { r: red, g: green, b: blue, a } = heatRgb(v);
          const x = noteIdx * RES + c;
          const idx = (r * N * RES + x) * 4;
          img.data[idx] = red;
          img.data[idx + 1] = green;
          img.data[idx + 2] = blue;
          img.data[idx + 3] = a;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [perNoteHeatmaps, showOverlay]);

  const hasAudio = audioSources.length > 0;
  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => setAudioError(true));
    else el.pause();
  };

  const restart = () => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => setAudioError(true));
  };

  const seekFromClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !duration || !hasAudio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    el.currentTime = pct * duration;
    setCurrentTime(el.currentTime);
  };

  const seekToNote = (noteIndex: number) => {
    const el = audioRef.current;
    if (!el || notes.length === 0) return;
    if (duration > 0) {
      el.currentTime = (noteIndex / notes.length) * duration;
    } else if (theoreticalDurationMs > 0) {
      el.currentTime = (noteIndex * theoreticalDurationMs) / notes.length / 1000;
    }
    setCurrentTime(el.currentTime);
  };

  // Índice de la nota actualmente bajo el playhead (para resaltarla).
  const activeNoteIdx =
    notes.length > 0 && effectiveDurationMs > 0
      ? Math.min(notes.length - 1, Math.floor((currentTime * 1000 / effectiveDurationMs) * notes.length))
      : -1;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">Espectrograma + Grad-CAM</h3>
          <p className="text-xs text-muted-foreground">
            Mapa de saliencia de la última capa convolucional (<code className="bg-secondary px-1 rounded">{gradCam.target_layer}</code>).
            Clase objetivo: <strong className="text-foreground">{gradCam.target_class}</strong>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {notes.length > 0 && (
            <button
              onClick={() => setShowSegments(v => !v)}
              className="text-xs px-3 py-1.5 rounded-md border border-border bg-secondary/40 hover:bg-secondary"
            >
              {showSegments ? 'Ocultar segmentos' : 'Mostrar segmentos'}
            </button>
          )}
          <button
            onClick={() => setShowOverlay(v => !v)}
            className="text-xs px-3 py-1.5 rounded-md border border-border bg-secondary/40 hover:bg-secondary"
          >
            {showOverlay ? 'Ocultar Grad-CAM' : 'Mostrar Grad-CAM'}
          </button>
        </div>
      </div>

      {notes.length > 0 && (
        <p className="text-xs text-muted-foreground border-l-2 border-[#2d5a3d]/60 pl-2">
          El ejercicio se divide en <strong className="text-foreground">{notes.length} sub-segmentos</strong> de
          ancho <code className="bg-secondary px-1 rounded">T = 60/BPM</code> = {bpmReferencia
            ? `${(60_000 / bpmReferencia).toFixed(0)} ms`
            : '—'} por nota. La CNN clasifica cada sub-imagen 224×224 y PYIN verifica la F0 dominante para emitir
          el veredicto por nota.
        </p>
      )}

      {/* Espectrograma con playhead + Grad-CAM overlay */}
      <div
        className={`relative inline-block max-w-full ${hasAudio ? 'cursor-pointer' : ''}`}
        onClick={hasAudio ? seekFromClick : undefined}
        title={hasAudio ? 'Click para saltar a esta posición' : undefined}
      >
        {spectrogramSrc ? (
          <img
            src={spectrogramSrc}
            alt="Espectrograma"
            className="block max-w-full rounded border border-border bg-zinc-900 select-none"
            draggable={false}
          />
        ) : (
          <div className="w-full h-48 rounded border border-border bg-zinc-900 flex items-center justify-center text-xs text-muted-foreground">
            Sin espectrograma — sintetizado a partir de los datos del intento
          </div>
        )}

        {showOverlay && perNoteHeatmaps.length > 0 && (
          <canvas
            ref={perNoteCanvasRef}
            className="absolute inset-0 w-full h-full rounded pointer-events-none"
            style={{ imageRendering: 'auto', mixBlendMode: 'screen' }}
            aria-label="Mapa Grad-CAM por nota"
          />
        )}

        {/* Divisores verticales por cada nota analizada (16 = 4 compases × 4) */}
        {showSegments && notes.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {notes.map((n, i) => {
              const isCompasBoundary = i > 0 && i % 4 === 0;
              return (
                <div
                  key={`div-${i}`}
                  className={
                    isCompasBoundary
                      ? 'absolute top-0 bottom-0 w-[2px] bg-yellow-300/70'
                      : 'absolute top-0 bottom-0 w-px bg-white/30'
                  }
                  style={{ left: `${i * noteWidthPct}%` }}
                  title={`Nota #${i + 1} · ${n.nota_objetivo} → ${n.nota_predicha}`}
                />
              );
            })}
          </div>
        )}

        {/* Playhead vertical sincronizado con la reproducción */}
        {hasAudio && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none transition-[left] duration-75 ease-linear"
            style={{ left: `${playheadPercent}%` }}
          >
            <div className="w-[2px] h-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
          </div>
        )}
      </div>

      {/* Timeline de las 16 (o N) notas analizadas */}
      {notes.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Timeline de notas analizadas</span>
            <span className="font-mono">
              {notes.filter(n => n.correcta).length}/{notes.length} aciertos
            </span>
          </div>
          <div className="flex w-full h-12 rounded-md overflow-hidden border border-border bg-zinc-900">
            {notes.map((n, i) => {
              const isActive = i === activeNoteIdx;
              const isCompasStart = i % 4 === 0;
              const bg = n.correcta
                ? 'bg-green-500/40 hover:bg-green-500/60'
                : 'bg-red-500/40 hover:bg-red-500/60';
              return (
                <button
                  key={`note-${i}`}
                  onClick={() => seekToNote(i)}
                  disabled={!hasAudio}
                  title={`Nota #${i + 1} · objetivo ${n.nota_objetivo} · predicha ${n.nota_predicha} · ${n.cents_deviation > 0 ? '+' : ''}${n.cents_deviation.toFixed(0)} cents · conf ${(n.confianza * 100).toFixed(0)}%`}
                  className={`flex-1 flex flex-col items-center justify-center transition-colors ${bg} ${
                    isCompasStart ? 'border-l-2 border-yellow-300/70' : 'border-l border-white/10'
                  } ${isActive ? 'ring-2 ring-inset ring-red-400' : ''} ${hasAudio ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <span className="text-[10px] font-mono text-white/90 leading-none">
                    {n.pitch_class_predicha}
                  </span>
                  <span className="text-[9px] text-white/60 leading-tight mt-0.5">
                    {i + 1}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500/60" /> nota correcta
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500/60" /> nota incorrecta
            </span>
            <span className="flex items-center gap-1">
              <span className="w-0.5 h-2.5 bg-yellow-300" /> límite de compás
            </span>
            {hasAudio && (
              <span className="ml-auto italic">Click en una nota para saltar a su posición temporal.</span>
            )}
          </div>
        </div>
      )}

      {/* Reproductor de audio */}
      {hasAudio ? (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              disabled={audioError}
              className="w-10 h-10 rounded-full bg-[#2d5a3d] text-white flex items-center justify-center hover:bg-[#3a6e4d] transition-colors disabled:opacity-40"
              aria-label={playing ? 'Pausar' : 'Reproducir'}
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              onClick={restart}
              disabled={audioError}
              className="w-9 h-9 rounded-full border border-border text-foreground flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
              aria-label="Reiniciar"
              title="Reiniciar desde el principio"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono text-muted-foreground tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <div className="flex-1">
              <audio
                ref={audioRef}
                preload="metadata"
                controls
                className="w-full h-9"
                onLoadedMetadata={e => setDuration(e.currentTarget.duration || 0)}
                onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
                onError={() => setAudioError(true)}
              >
                {audioSources.map(s => (
                  <source key={s.src} src={s.src} type={s.type} />
                ))}
                Tu navegador no soporta la reproducción de audio.
              </audio>
            </div>
          </div>
          {audioError && (
            <p className="text-xs text-red-400">
              No se pudo cargar el audio en ningún formato disponible.
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            La línea roja indica la posición temporal actual sobre el espectrograma.
            Click en cualquier punto del espectrograma para saltar a esa posición.
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          Sin audio disponible para este intento — solo se muestra el espectrograma estático.
        </p>
      )}

      {/* Top regiones */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Top regiones atendidas por la CNN</h4>
        <div className="space-y-2">
          {gradCam.top_regions.map(reg => (
            <div key={reg.rank} className="rounded-lg border border-border bg-secondary/30 p-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-mono">
                  #{reg.rank} · activación{' '}
                  <strong className="text-foreground">{reg.activation.toFixed(3)}</strong>
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {reg.freq_band_hz_low.toFixed(0)}–{reg.freq_band_hz_high.toFixed(0)} Hz ·{' '}
                  {reg.time_start_ms.toFixed(0)}–{reg.time_end_ms.toFixed(0)} ms
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{reg.interpretation}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground border-l-2 border-[#2d5a3d]/60 pl-3 italic">
        El mapa de calor (rojo/amarillo) indica <strong className="text-foreground not-italic">dónde miró
        la red</strong> dentro de cada sub-imagen para tomar su decisión. Las zonas brillantes coinciden con
        los armónicos (F0, 2·F0, 3·F0, ...) — es decir, la CNN se enfoca exactamente donde está la energía
        musical del tono cantado.
      </p>
    </div>
  );
}
