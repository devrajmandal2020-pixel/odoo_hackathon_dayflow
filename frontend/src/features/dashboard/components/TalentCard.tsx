import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

interface TalentCardProps {
  totalEmployees: number;
  newHires: number;
}

export function TalentCard({ totalEmployees = 120, newHires = 80 }: Partial<TalentCardProps>) {
  // Generate dot matrix data
  // 10 columns x 5 rows = 50 dots
  const totalDots = 50;
  const matchPercentage = newHires / Math.max(totalEmployees, 1);
  const activeDots = Math.floor(totalDots * matchPercentage);

  return (
    <Card className="flex flex-col h-full bg-primary text-white">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs font-medium text-primary-100 uppercase tracking-wider mb-1">Hiring statistics</p>
          <h3 className="text-xl font-bold flex items-center gap-2 cursor-pointer hover:text-white/80 transition-colors">
            Talent recruitment
            <ArrowRight className="w-4 h-4" />
          </h3>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white/10 rounded-2xl p-3 mb-6 backdrop-blur-sm">
        <div className="flex -space-x-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary-100 flex items-center justify-center overflow-hidden">
            <span className="text-primary text-xs font-bold">SM</span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-primary bg-accent-blue/20 flex items-center justify-center overflow-hidden">
            <span className="text-white text-xs font-bold">JD</span>
          </div>
        </div>
        <Button size="sm" variant="secondary" className="bg-white text-primary hover:bg-gray-100 h-9 rounded-full px-4 text-xs font-bold shadow-sm">
          Join call
        </Button>
      </div>

      <div className="flex gap-8 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span className="text-sm text-white/90 font-medium">{totalEmployees} Talent</span>
          </div>
          <p className="text-xs text-primary-200 mt-1 pl-4">Candidates</p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-orange" />
            <span className="text-sm text-white/90 font-medium">{newHires} Talent</span>
          </div>
          <p className="text-xs text-primary-200 mt-1 pl-4">Matched</p>
        </div>
      </div>

      {/* Dot matrix visualization */}
      <div className="mt-auto grid grid-cols-10 gap-1.5 opacity-90">
        {Array.from({ length: totalDots }).map((_, i) => (
          <div 
            key={i} 
            className={`w-full aspect-square rounded-sm ${i < activeDots ? 'bg-accent-orange' : 'bg-white/20'}`}
          />
        ))}
      </div>
    </Card>
  );
}
