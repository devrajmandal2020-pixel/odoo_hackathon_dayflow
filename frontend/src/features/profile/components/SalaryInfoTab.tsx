import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

export function SalaryInfoTab() {
  const { user } = useAuthStore();

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        <form className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {/* Left Column */}
            <div className="space-y-5">
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Date of Birth</label>
                <Input type="date" className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Residing Address</label>
                <Input className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Nationality</label>
                <Input className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Personal Email</label>
                <Input type="email" className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Gender</label>
                <Input className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Marital Status</label>
                <Input className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Date of Joining</label>
                <Input type="date" className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-text-heading mb-6 border-b border-border pb-2">Bank Details</h3>
              
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Account Number</label>
                <Input className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Bank Name</label>
                <Input className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">IFSC Code</label>
                <Input className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">PAN No</label>
                <Input className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">UAN NO</label>
                <Input className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Emp Code</label>
                <Input defaultValue={user?.employee_id} className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" readOnly />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-8">
            <Button variant="outline" type="button" className="px-8 border-border text-text-body hover:bg-bg-main">Cancel</Button>
            <Button type="button" className="px-8">Save</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
