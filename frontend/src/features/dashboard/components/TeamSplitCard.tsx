import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Monitor } from 'lucide-react';

interface TeamSplitCardProps {
  onsitePercent: number;
  onsiteTrend: number;
  remotePercent: number;
  remoteTrend: number;
}

export function TeamSplitCard({ onsitePercent = 80, onsiteTrend = 2.6, remotePercent = 20, remoteTrend = 2.6 }: Partial<TeamSplitCardProps>) {
  const isOnsitePositive = onsiteTrend >= 0;
  const isRemotePositive = remoteTrend >= 0;

  return (
    <Card className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm font-semibold text-text-heading">Team split</p>
      </div>
      
      <div className="space-y-6 flex-1 flex flex-col justify-center">
        {/* Onsite Team */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-50 rounded-md">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-text-heading">Onsite team</span>
            </div>
            <Badge variant={isOnsitePositive ? "success" : "danger"} className={isOnsitePositive ? "bg-success/10 text-success text-xs font-bold py-0.5" : "bg-danger/10 text-danger text-xs font-bold py-0.5"}>
              {isOnsitePositive ? '+' : ''}{onsiteTrend}%
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-text-heading">{onsitePercent}%</span>
            <div className="flex-1 h-2 bg-primary-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${onsitePercent}%` }} />
            </div>
          </div>
        </div>

        {/* Remote Team */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-accent-blue/10 rounded-md">
                <Monitor className="w-4 h-4 text-accent-blue" />
              </div>
              <span className="text-sm font-semibold text-text-heading">Remote team</span>
            </div>
            <Badge variant={isRemotePositive ? "success" : "danger"} className={isRemotePositive ? "bg-success/10 text-success text-xs font-bold py-0.5" : "bg-danger/10 text-danger text-xs font-bold py-0.5"}>
              {isRemotePositive ? '+' : ''}{remoteTrend}%
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-text-heading">{remotePercent}%</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-accent-blue rounded-full" style={{ width: `${remotePercent}%` }} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
