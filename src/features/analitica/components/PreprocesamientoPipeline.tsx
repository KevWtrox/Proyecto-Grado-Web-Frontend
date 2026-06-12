import { useState } from 'react';
import { ChevronDown, ChevronUp, AudioLines } from 'lucide-react';
import type { PreprocessingParams } from '@/features/analitica/types/analitica.types';
import { EcuacionBlock } from './EcuacionLatex';

interface Props {
  params: PreprocessingParams;
  defaultOpen?: boolean;
}

export function PreprocesamientoPipeline({ params, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2d5a3d]/10 text-[#2d5a3d] flex items-center justify-center">
            <AudioLines className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Pipeline de preprocesamiento</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Audio bruto → bandpass → HPSS → noise-reduce → STFT → Mel → log → norm → 224×224
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-border pt-4">
          {/* Paso 1: Limpieza de audio */}
          <Step
            num={1}
            title="Limpiar el audio"
            description={`Se elimina lo que no es voz: ruido eléctrico, golpes y ambiente. Solo se conservan las frecuencias del rango vocal (${params.bandpass_low_hz}–${params.bandpass_high_hz} Hz).`}
          >
            <p className="text-xs text-muted-foreground">
              Es equivalente a aplicar un "ecualizador" que apaga lo agudo y lo grave fuera del rango de la voz,
              y luego restar el ruido de fondo que se mantiene constante (zumbidos del ambiente).
            </p>
          </Step>

          {/* Paso 2: Espectrograma Mel */}
          <Step
            num={2}
            title="Convertir el sonido en imagen (espectrograma Mel)"
            description={`Cada instante de audio se descompone en ${params.n_mels} bandas de frecuencia entre ${params.fmin_hz} y ${params.fmax_hz} Hz. El resultado es una imagen donde el eje X es tiempo y el eje Y es frecuencia.`}
          >
            <p className="text-xs text-muted-foreground mb-1">
              La escala <strong className="text-foreground">Mel</strong> imita cómo el oído humano percibe el tono:
              somos más sensibles a diferencias entre notas graves que entre notas agudas. Esto comprime las
              frecuencias altas:
            </p>
            <EcuacionBlock
              expr={String.raw`f_{\text{mel}} = 2595 \cdot \log_{10}\!\left(1 + \dfrac{f}{700}\right)`}
              caption="Convertir Hz a Mel. Por eso en el espectrograma los armónicos graves se ven apretados abajo y los agudos separados arriba."
            />
          </Step>

          {/* Paso 3: Escala log */}
          <Step
            num={3}
            title="Pasar la energía a decibelios"
            description="La diferencia entre un sonido fuerte y uno suave es enorme. Aplicar logaritmo deja todas las energías en una escala manejable."
          >
            <EcuacionBlock
              expr={String.raw`\text{dB} = 10 \cdot \log_{10}(\text{energía})`}
              caption="Después de este paso, la imagen tiene contraste — los armónicos se ven como rayas brillantes sobre fondo oscuro."
            />
          </Step>

          {/* Paso 4: Adaptar a la red */}
          <Step
            num={4}
            title="Adaptar la imagen para la red"
            description={`La imagen se redimensiona a ${params.img_width}×${params.img_height} píxeles (el tamaño que espera EfficientNetB0) y se normalizan los valores al mismo rango con el que la red fue pre-entrenada en ImageNet.`}
          >
            <p className="text-xs text-muted-foreground">
              No hay matemática nueva acá: solo escalado y centrado de los píxeles para que la red reciba los
              datos en el formato que aprendió a procesar.
            </p>
          </Step>
        </div>
      )}
    </div>
  );
}

function Step({
  num,
  title,
  description,
  children,
}: {
  num: number;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-[#2d5a3d] text-white flex items-center justify-center text-sm font-bold shrink-0">
        {num}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        {children}
      </div>
    </div>
  );
}
