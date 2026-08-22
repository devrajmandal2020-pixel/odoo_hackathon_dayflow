import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function PrivateInfoTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Private Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-text-main">Personal Details</h3>
              <Input label="Date of Birth" type="date" />
              <Input label="Nationality" placeholder="e.g. American" />
              <Input label="Gender" placeholder="e.g. Female" />
              <Input label="Marital Status" placeholder="e.g. Single" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-text-main">Bank & Statutory Details</h3>
              <Input label="Bank Name" placeholder="e.g. Chase Bank" />
              <Input label="Account Number" type="password" />
              <Input label="Routing/IFSC Code" />
              <Input label="UAN Number" />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
            <Button variant="outline" type="button">Cancel</Button>
            <Button type="button">Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
