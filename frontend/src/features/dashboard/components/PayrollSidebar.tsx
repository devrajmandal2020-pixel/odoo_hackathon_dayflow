import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';

const salaryList = [
  { name: 'Syafanah san', amount: 2540, date: 'Today', status: 'waiting', initials: 'SS' },
  { name: 'Devon Lane', amount: 2540, date: 'Today', status: 'done', initials: 'DL' },
  { name: 'Marvin McKinney', amount: 2540, date: 'Yesterday', status: 'done', initials: 'MM' },
  { name: 'Devon Lane', amount: 2540, date: 'Yesterday', status: 'done', initials: 'DL' },
  { name: 'Eleanor Pena', amount: 2540, date: 'Yesterday', status: 'rejected', initials: 'EP' },
];

interface PayrollSidebarProps {
  totalProcessed?: number;
  pendingApprovals?: number;
  nextPayDate?: string;
}

export function PayrollSidebar({ totalProcessed = 125000, pendingApprovals = 3, nextPayDate = '24 Aug 2026' }: Partial<PayrollSidebarProps>) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-accent-orange/10 text-accent-orange border-accent-orange/20';
      case 'done': return 'bg-success/10 text-success border-success/20';
      case 'rejected': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <Card className="flex flex-col h-full sticky top-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Payout monthly</p>
          <h3 className="text-xl font-bold text-text-heading">Salaries and incentive</h3>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Next Pay Date</p>
          <p className="text-sm font-semibold text-text-heading">{nextPayDate}</p>
        </div>
      </div>

      <div className="space-y-4 mb-8 flex-1">
        {salaryList.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={item.name} size="sm" />
              <div>
                <p className="text-sm font-semibold text-text-heading">{item.name}</p>
                <p className="text-xs text-text-muted font-medium">{item.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} • {item.date}</p>
              </div>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
              {item.status}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-bg-main rounded-2xl p-5 border border-border">
        <div className="flex gap-4">
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-text-heading">Total Processed</span>
                <span className="text-sm font-bold text-text-heading">₹{(totalProcessed / 1000).toFixed(1)}k</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full w-[100%]" />
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 bg-white rounded-lg p-2 border border-border text-center">
                <span className="block text-[10px] text-text-muted font-medium mb-0.5">Pending Approvals</span>
                <span className="block text-sm font-bold text-accent-orange">{pendingApprovals}</span>
              </div>
            </div>
          </div>

          <div className="w-20 flex flex-col items-center justify-center">
            {/* Circular Progress Ring */}
            <div className="relative w-16 h-16 mb-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-200" />
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={176} strokeDashoffset={0} className="text-primary" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-medium text-text-muted">Status</span>
                <span className="text-xs font-bold text-text-heading">100%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-border flex justify-between items-end">
          <span className="text-sm font-medium text-text-muted">Total Processed</span>
          <span className="text-2xl font-bold text-text-heading">{totalProcessed.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
        </div>
      </div>
    </Card>
  );
}
