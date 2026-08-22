import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

export function PrivateInfoTab() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date_of_birth: '',
    nationality: '',
    gender: '',
    marital_status: '',
    bank_details: '',
    bank_account: '',
    branch_number: '',
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
          bank_account: data.bank_account || '',
          bank_details: data.bank_details || '',
          branch_number: data.branch_number || '',
          uan_no: data.uan_no || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...formData };
      if (!payload.date_of_birth) payload.date_of_birth = null as any;
      
      await apiClient.put('/profile/me', payload);
      toast.success('Private information updated successfully');
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
    <Card>
      <CardHeader>
        <CardTitle>Private Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-text-main">Personal Details</h3>
              <Input name="date_of_birth" label="Date of Birth" type="date" value={formData.date_of_birth} onChange={handleChange} />
              <Input name="nationality" label="Nationality" placeholder="e.g. American" value={formData.nationality} onChange={handleChange} />
              <Input name="gender" label="Gender" placeholder="e.g. Female" value={formData.gender} onChange={handleChange} />
              <Input name="marital_status" label="Marital Status" placeholder="e.g. Single" value={formData.marital_status} onChange={handleChange} />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-text-main">Bank & Statutory Details</h3>
              <Input name="bank_details" label="Bank Name" placeholder="e.g. Chase Bank" value={formData.bank_details} onChange={handleChange} />
              <Input name="bank_account" label="Account Number" type="password" value={formData.bank_account} onChange={handleChange} />
              <Input name="branch_number" label="Routing/IFSC Code" value={formData.branch_number} onChange={handleChange} />
              <Input name="uan_no" label="UAN Number" value={formData.uan_no} onChange={handleChange} />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
            <Button variant="outline" type="button" onClick={() => window.location.reload()}>Cancel</Button>
            <Button type="submit" isLoading={loading}>Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
