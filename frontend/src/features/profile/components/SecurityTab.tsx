import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function SecurityTab() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <Input label="Current Password" type="password" />
          <Input label="New Password" type="password" />
          <Input label="Confirm New Password" type="password" />
          
          <div className="pt-4">
            <Button type="button" className="w-full sm:w-auto">Update Password</Button>
          </div>
        </form>

        <div className="mt-10 pt-6 border-t border-neutral-200">
          <h3 className="text-lg font-medium text-text-main mb-2">Two-Factor Authentication</h3>
          <p className="text-sm text-text-secondary mb-4">
            Add an extra layer of security to your account by enabling two-factor authentication.
          </p>
          <Button variant="outline">Enable 2FA</Button>
        </div>
      </CardContent>
    </Card>
  );
}
