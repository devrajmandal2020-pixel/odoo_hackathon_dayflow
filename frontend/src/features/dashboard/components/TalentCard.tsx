import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

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
          <Link to="/" className="text-xl font-bold flex items-center gap-2 cursor-pointer hover:text-white/80 transition-colors">
            Talent recruitment
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
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
