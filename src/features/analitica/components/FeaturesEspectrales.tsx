import type { SpectralFeatures } from '@/features/analitica/types/analitica.types';

interface Props {
  features: SpectralFeatures;
}

export function FeaturesEspectrales({ features }: Props) {
  const max = Math.max(1, ...features.mel_band_energies);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-4">
      <h3 className="text-base font-semibold text-foreground">Características espectrales</h3>
      <p className="text-xs text-muted-foreground">
        Estadísticos calculados sobre la señal pre-procesada (post-bandpass, post-HPSS, post-noise-reduce)
        usando <code className="bg-secondary px-1 rounded">librosa.feature</code>.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Centroide espectral" value={`${features.centroid_hz.toFixed(2)} Hz`} desc="Frecuencia 'centro de masa' de la energía." />
        <Stat label="Rolloff 85%" value={`${features.rolloff_85_hz.toFixed(2)} Hz`} desc="Frecuencia bajo la cual hay 85% de la energía." />
        <Stat label="Ancho de banda" value={`${features.bandwidth_hz.toFixed(2)} Hz`} desc="Dispersión espectral en torno al centroide." />
        <Stat label="Frecuencia dominante" value={`${features.dominant_freq_hz.toFixed(2)} Hz`} desc="Bin con máxima energía." />
        <Stat label="ZCR" value={features.zero_crossing_rate.toFixed(4)} desc="Tasa de cruces por cero — proxy de ruido." />
        <Stat label="RMS energy" value={features.rms_energy.toFixed(4)} desc="Amplitud RMS (volumen efectivo)." />
        <Stat label="Flatness" value={features.flatness.toFixed(4)} desc="Spectral flatness: 0=tono puro, 1=ruido blanco." />
        <Stat label="SNR estimado" value={`${features.snr_db.toFixed(2)} dB`} desc="Relación señal/ruido tras el pipeline." />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">
          Distribución de energía en 128 bandas Mel
        </h4>
        <div className="flex items-end gap-px h-24 bg-secondary/20 rounded p-2">
          {features.mel_band_energies.map((v, i) => (
            <div
              key={i}
              title={`Banda ${i + 1}: ${v.toFixed(4)}`}
              className="flex-1 bg-gradient-to-t from-[#2d5a3d] to-[#5ba373] rounded-t"
              style={{ height: `${(v / max) * 100}%` }}
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Bandas Mel triangulares de 80 Hz (izquierda) a 8 kHz (derecha). Picos típicos: fundamental F0 + armónicos.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, desc }: { label: string; value: string; desc: string }) {
  return (
    <div className="rounded-md bg-secondary/40 border border-border px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground font-mono mt-0.5">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{desc}</p>
    </div>
  );
}
