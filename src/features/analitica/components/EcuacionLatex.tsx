import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface EcuacionProps {
  expr: string;
  caption?: string;
}

export function EcuacionBlock({ expr, caption }: EcuacionProps) {
  return (
    <div className="my-3 px-4 py-3 rounded-lg bg-secondary/40 border border-border overflow-x-auto">
      <div className="text-foreground">
        <BlockMath math={expr} />
      </div>
      {caption && (
        <p className="text-xs text-muted-foreground mt-2 italic">{caption}</p>
      )}
    </div>
  );
}

export function EcuacionInline({ expr }: { expr: string }) {
  return (
    <span className="text-foreground">
      <InlineMath math={expr} />
    </span>
  );
}
