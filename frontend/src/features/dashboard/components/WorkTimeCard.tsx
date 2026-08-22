import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface WorkTimeCardProps {
  totalHours: number;
  trend: number;
  data: number[];
}

export function WorkTimeCard({ totalHours = 46, trend = 0.5, data = [8.5, 7.2, 9.1, 8.0, 6.5, 3.0, 0] }: Partial<WorkTimeCardProps>) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const workTimeData = data.map((hours, index) => ({ day: days[index] || '', hours }));
  const isPositive = trend >= 0;

  return (
    <Card className="flex flex-col h-full justify-between">
      <div>
        <p className="text-sm font-medium text-text-muted mb-1">Average work time</p>
        <div className="flex items-center gap-3">
          <h3 className="text-3xl font-bold text-text-heading">{totalHours} hours</h3>
          <Badge variant={isPositive ? "success" : "danger"} className={isPositive ? "bg-success/10 text-success text-xs font-bold" : "bg-danger/10 text-danger text-xs font-bold"}>
            {isPositive ? '+' : ''}{trend}%
          </Badge>
        </div>
      </div>

      <div className="h-32 mt-4 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={workTimeData}>
            <defs>
              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4A7C59" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4A7C59" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="hours" 
              stroke="#4A7C59" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorHours)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-xs text-text-muted mt-2 border-t border-border pt-3">
        Total work hours include extra hours
      </p>
    </Card>
  );
}
