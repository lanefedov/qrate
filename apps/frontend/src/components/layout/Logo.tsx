import { Rocket } from 'lucide-react';

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2 px-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <Rocket className="h-4 w-4 text-primary-foreground" />
      </div>
      {!collapsed && (
        <span className="text-lg font-bold tracking-tight">QRate</span>
      )}
    </div>
  );
}
