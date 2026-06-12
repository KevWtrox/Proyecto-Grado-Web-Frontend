import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ModelArchitectureInfo } from '@/features/analitica/types/analitica.types';

interface Props {
  info: ModelArchitectureInfo;
  defaultOpen?: boolean;
}

const fmt = (n: number) => n.toLocaleString('es-ES');

export function ModeloEfficientNetCard({ info, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const hp = info.training_hyperparams;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors text-left"
      >
        <div>
          <h2 className="text-lg font-bold text-foreground">{info.name}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {info.paper} · {fmt(info.total_params)} params · {info.flops_g} GFLOPs
          </p>
        </div>
        {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
          {/* Stats principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Parámetros totales" value={fmt(info.total_params)} />
            <Stat label="Entrenables" value={fmt(info.trainable_params)} />
            <Stat label="Backbone params" value={fmt(info.backbone_params)} />
            <Stat label="GFLOPs" value={info.flops_g.toString()} />
            <Stat label="Bloques MBConv" value={info.num_mbconv_blocks.toString()} />
            <Stat label="Clases salida" value={info.output_classes.toString()} />
            <Stat label="Input shape" value={`${info.input_shape.join('×')}`} />
            <Stat label="Activación" value={info.activation} />
          </div>

          {/* Compound scaling */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">¿Por qué EfficientNetB0?</h3>
            <p className="text-xs text-muted-foreground">
              Es una red liviana ({fmt(info.total_params)} parámetros, {info.flops_g} GFLOPs) que en
              ImageNet logra ~77% de accuracy — un buen equilibrio entre precisión y velocidad. Se compone de{' '}
              {info.num_mbconv_blocks} bloques <strong className="text-foreground">MBConv</strong>{' '}
              (convoluciones separables livianas) que detectan patrones visuales jerárquicos: primero bordes
              y texturas, luego formas más complejas como las "rayas armónicas" del espectrograma.
            </p>
          </div>

          {/* Bloque MBConv */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Bloque MBConv (Mobile Inverted Bottleneck)</h3>
            <p className="text-xs text-muted-foreground">
              <code className="bg-secondary px-1 rounded">Expansion 1×1 → Depthwise k×k → Squeeze-Excitation → Projection 1×1 + skip</code>.
              SE-ratio = 0.25 (8 canales reducidos por cada 32) — recalibra canales según relevancia.
              {' '}{info.final_pooling} antes del clasificador.
            </p>
          </div>

          {/* Clasificador */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Cabeza clasificadora (fine-tune)</h3>
            <pre className="text-xs bg-secondary/50 rounded p-3 font-mono overflow-x-auto">
              {info.classifier_head.map((l) => `  ${l}`).join('\n')}
            </pre>
          </div>

          {/* Hiperparámetros */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Hiperparámetros del fine-tuning</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Stat label="Optimizer" value={hp.optimizer} />
              <Stat label="LR head" value={hp.learning_rate_head.toExponential(0)} />
              <Stat label="LR fine-tune" value={hp.learning_rate_finetune.toExponential(0)} />
              <Stat label="Weight decay" value={hp.weight_decay.toString()} />
              <Stat label="Batch size" value={hp.batch_size.toString()} />
              <Stat label="Epochs fase 1+2" value={`${hp.epochs_phase1} + ${hp.epochs_phase2}`} />
              <Stat label="Label smoothing" value={hp.label_smoothing.toString()} />
              <Stat label="Loss" value={hp.loss_function} />
              <Stat label="Scheduler" value={hp.lr_scheduler} />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              <strong className="text-foreground">Data augmentation aplicado:</strong>{' '}
              {hp.data_augmentation.join(' · ')}
            </p>
          </div>

          {/* Pretraining */}
          <p className="text-xs text-muted-foreground italic border-l-2 border-[#2d5a3d]/60 pl-3">
            Pre-entrenado en <strong>{info.pretrained_on}</strong> · Fine-tuneado en{' '}
            <strong>{info.fine_tuned_on}</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary/40 border border-border px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground font-mono">{value}</p>
    </div>
  );
}
