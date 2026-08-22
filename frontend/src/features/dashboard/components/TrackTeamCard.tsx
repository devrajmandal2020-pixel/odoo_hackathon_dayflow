import { Card } from '@/components/ui/Card';
import { ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

interface TrackTeamCardProps {
  inOffice: number;
  wfh: number;
  onLeave: number;
  absent: number;
}

export function TrackTeamCard({ inOffice = 48, wfh = 27, onLeave = 18, absent = 27 }: Partial<TrackTeamCardProps>) {
  const teamData = [
    { name: 'In Office', value: inOffice, color: '#4A7C59' },
    { name: 'WFH', value: wfh, color: '#F59E0B' },
    { name: 'On Leave', value: onLeave, color: '#E5E7EB' },
    { name: 'Absent', value: absent, color: '#1E293B' },
  ];
  
  const total = inOffice + wfh + onLeave + absent;

  return (
    <Card className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Total employee</p>
          <Link to="/" className="text-xl font-bold text-text-heading flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
            Track your team
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-between gap-6">
        {/* Donut Chart */}
        <div className="relative w-36 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={teamData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {teamData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-text-heading">{total}</span>
            <span className="text-[10px] text-text-muted font-medium text-center leading-tight">Total<br/>members</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {teamData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium text-text-muted">{item.name}</span>
              </div>
              <span className="text-sm font-bold text-text-heading">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
