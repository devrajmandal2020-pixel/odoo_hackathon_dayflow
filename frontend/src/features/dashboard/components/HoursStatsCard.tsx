import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';

interface HoursStatsCardProps {
  total: number;
  trend: number;
  weeklyData: number[];
}

export function HoursStatsCard({ total = 46.5, trend = 0.5, weeklyData = [40, 30, 20, 27, 18, 23, 34] }: Partial<HoursStatsCardProps>) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const chartData = weeklyData.map((val, i) => ({ name: letters[i] || '', value: val }));
  const isPositive = trend >= 0;

  return (
    <Card className="flex flex-col h-full justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-primary-50 rounded-xl">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <Badge variant={isPositive ? "success" : "danger"} className={isPositive ? "bg-success/10 text-success font-bold text-xs" : "bg-danger/10 text-danger font-bold text-xs"}>
          {isPositive ? '+' : ''}{trend}%
        </Badge>
      </div>

      <div>
        <h3 className="text-3xl font-bold text-text-heading">{total.toLocaleString('en-US', { minimumFractionDigits: 1 })}</h3>
        <p className="text-xs text-text-muted font-medium uppercase mt-1">avg hours / weeks</p>
      </div>

      <div className="h-16 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <Bar dataKey="value" radius={[4, 4, 4, 4]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#4A7C59' : '#E5E7EB'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
