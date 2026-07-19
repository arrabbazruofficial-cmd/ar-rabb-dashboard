import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Phase {
  id: number;
  label: string;
}

interface PhaseNavigationProps {
  phases: Phase[];
  currentPhase: number;
  highestReachedPhase: number;
  onPhaseClick: (phaseId: number) => void;
}

export function PhaseNavigation({ phases, currentPhase, highestReachedPhase, onPhaseClick }: PhaseNavigationProps) {
  const progressPercent = Math.min(100, Math.max(0, ((currentPhase - 1) / (phases.length - 1)) * 100));

  return (
    <div className="w-full bg-card rounded-2xl p-6 shadow-sm border border-border mb-8 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">
          Phase {currentPhase} of {phases.length}
        </h3>
        <span className="text-sm font-semibold text-primary">{Math.round(progressPercent)}% Complete</span>
      </div>

      <div className="w-full h-2 bg-secondary/10 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-in-out" 
          style={{ width: `${progressPercent}%` }} 
        />
      </div>

      <div className="relative">
        {/* Background connector line */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-secondary/10 -z-10" />
        
        {/* Active connector line */}
        <div 
          className="absolute top-5 left-0 h-[2px] bg-accent transition-all duration-500 ease-in-out -z-10"
          style={{ width: `${progressPercent}%` }}
        />

        <div className="flex justify-between items-start w-full overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
          {phases.map((phase) => {
            const isCompleted = phase.id < currentPhase;
            const isCurrent = phase.id === currentPhase;
            const isClickable = phase.id <= highestReachedPhase;

            return (
              <button
                key={phase.id}
                onClick={() => isClickable && onPhaseClick(phase.id)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center flex-1 min-w-[100px] snap-center group transition-all duration-300",
                  !isClickable && "opacity-50 cursor-not-allowed"
                )}
              >
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 shadow-sm",
                    isCompleted ? "bg-green-500 border-green-500 text-white scale-95" :
                    isCurrent ? "bg-gradient-to-br from-accent to-orange-400 border-transparent text-white shadow-lg shadow-accent/30 scale-110" :
                    "bg-card border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5 animate-in zoom-in" /> : phase.id}
                </div>
                <span 
                  className={cn(
                    "mt-3 text-xs font-semibold text-center transition-colors duration-300 px-2",
                    isCurrent ? "text-accent" :
                    isCompleted ? "text-foreground" :
                    "text-muted-foreground"
                  )}
                >
                  {phase.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
