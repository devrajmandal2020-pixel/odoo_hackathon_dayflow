import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

export function SalaryInfoTab() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date_of_birth: '',
    nationality: '',
    gender: '',
    marital_status: '',
    date_of_joining: '',
    bank_account: '',
    bank_details: '', // Bank Name
    branch_number: '', // IFSC
    key_code: '', // PAN
    uan_no: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get('/profile/me');
        setFormData({
          date_of_birth: data.date_of_birth || '',
          nationality: data.nationality || '',
          gender: data.gender || '',
          marital_status: data.marital_status || '',
          date_of_joining: data.date_of_joining || '',
          bank_account: data.bank_account || '',
          bank_details: data.bank_details || '',
          branch_number: data.branch_number || '',
          key_code: data.key_code || '',
          uan_no: data.uan_no || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      // Clean up empty date strings to null for backend
      const payload = { ...formData };
      if (!payload.date_of_birth) payload.date_of_birth = null as any;
      if (!payload.date_of_joining) payload.date_of_joining = null as any;
      
      await apiClient.put('/profile/me', payload);
      toast.success('Salary & Bank info updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update information');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {/* Left Column */}
            <div className="space-y-5">
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Date of Birth</label>
                <Input name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Nationality</label>
                <Input name="nationality" value={formData.nationality} onChange={handleChange} className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Gender</label>
                <Input name="gender" value={formData.gender} onChange={handleChange} className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Marital Status</label>
                <Input name="marital_status" value={formData.marital_status} onChange={handleChange} className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Date of Joining</label>
                <Input name="date_of_joining" type="date" value={formData.date_of_joining} onChange={handleChange} className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-text-heading mb-6 border-b border-border pb-2">Bank Details</h3>
              
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Account Number</label>
                <Input name="bank_account" value={formData.bank_account} onChange={handleChange} className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Bank Name</label>
                <Input name="bank_details" value={formData.bank_details} onChange={handleChange} className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">IFSC Code</label>
                <Input name="branch_number" value={formData.branch_number} onChange={handleChange} className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">PAN No</label>
                <Input name="key_code" value={formData.key_code} onChange={handleChange} className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">UAN NO</label>
                <Input name="uan_no" value={formData.uan_no} onChange={handleChange} className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Emp Code</label>
                <Input defaultValue={user?.employee_id} className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" readOnly />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-8">
            <Button variant="outline" type="button" className="px-8 border-border text-text-body hover:bg-bg-main" onClick={() => window.location.reload()}>Cancel</Button>
            <Button type="submit" isLoading={loading} className="px-8">Save</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
