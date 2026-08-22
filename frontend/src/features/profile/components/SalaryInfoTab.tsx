import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

export function SalaryInfoTab({ userId }: { userId?: string }) {
  const { user: currentUser } = useAuthStore();
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

  const [salaryData, setSalaryData] = useState({
    monthly_wage: 0,
    yearly_wage: 0,
    working_days_per_week: 5,
    break_time_hours: 1.0,
    basic_percent: 50,
    hra_percent: 20,
    medical_allowance_fixed: 500,
    professional_tax: 200,
  });

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'hr';
  const profileEndpoint = userId ? `/profile/${userId}` : '/profile/me';
  const salaryEndpoint = userId ? `/salary/${userId}` : '/salary/me';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await apiClient.get(profileEndpoint);
        setFormData({
          date_of_birth: profileRes.data.date_of_birth || '',
          nationality: profileRes.data.nationality || '',
          gender: profileRes.data.gender || '',
          marital_status: profileRes.data.marital_status || '',
          date_of_joining: profileRes.data.date_of_joining || '',
          bank_account: profileRes.data.bank_account || '',
          bank_details: profileRes.data.bank_details || '',
          branch_number: profileRes.data.branch_number || '',
          key_code: profileRes.data.key_code || '',
          uan_no: profileRes.data.uan_no || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }

      try {
        const salaryRes = await apiClient.get(salaryEndpoint);
        setSalaryData({
          monthly_wage: salaryRes.data.monthly_wage || 0,
          yearly_wage: salaryRes.data.yearly_wage || 0,
          working_days_per_week: salaryRes.data.working_days_per_week || 5,
          break_time_hours: salaryRes.data.break_time_hours || 1.0,
          basic_percent: salaryRes.data.basic_percent || 50,
          hra_percent: salaryRes.data.hra_percent || 20,
          medical_allowance_fixed: salaryRes.data.medical_allowance_fixed || 500,
          professional_tax: salaryRes.data.professional_tax || 200,
        });
      } catch (error) {
        console.error('Failed to fetch salary data', error);
      }
    };
    fetchData();
  }, [profileEndpoint, salaryEndpoint]);

  const handleSave = async () => {
    try {
      setLoading(true);
      // Save Profile details
      const profilePayload = { ...formData };
      if (!profilePayload.date_of_birth) profilePayload.date_of_birth = null as any;
      if (!profilePayload.date_of_joining) profilePayload.date_of_joining = null as any;
      await apiClient.put(profileEndpoint, profilePayload);

      // Save Salary structure (Admin only)
      if (isAdmin) {
        await apiClient.put(salaryEndpoint, salaryData);
      }

      toast.success('Salary, Bank, & Structure updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update information');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    const updatedSalary = { ...salaryData, [e.target.name]: val };
    
    // Automatically update yearly wage if monthly wage is changed
    if (e.target.name === 'monthly_wage') {
      updatedSalary.yearly_wage = (val as number) * 12;
    }
    
    setSalaryData(updatedSalary);
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          {/* Bank Details */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-text-heading mb-6 border-b border-border pb-2">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Account Number</label>
                <Input name="bank_account" value={formData.bank_account} onChange={handleProfileChange} className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">Bank Name</label>
                <Input name="bank_details" value={formData.bank_details} onChange={handleProfileChange} className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">IFSC Code</label>
                <Input name="branch_number" value={formData.branch_number} onChange={handleProfileChange} className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">PAN No</label>
                <Input name="key_code" value={formData.key_code} onChange={handleProfileChange} className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-text-muted">UAN NO</label>
                <Input name="uan_no" value={formData.uan_no} onChange={handleProfileChange} className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" />
              </div>
            </div>
          </div>

          {/* Salary Structure section */}
          <div className="border-t border-border pt-8 mt-8">
            <h3 className="text-sm font-semibold text-text-heading mb-6 border-b border-border pb-2">
              Salary Structure & Compensation {!isAdmin && <span className="text-xs text-text-muted font-normal">(Read-only)</span>}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Left Column: Basic, HRA, Medical, Professional Tax */}
              <div className="space-y-5">
                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-sm font-medium text-text-muted">Basic Salary (%)</label>
                  <Input 
                    name="basic_percent" 
                    type="number" 
                    value={salaryData.basic_percent} 
                    onChange={handleSalaryChange} 
                    disabled={!isAdmin}
                    className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" 
                  />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-sm font-medium text-text-muted">HRA (%)</label>
                  <Input 
                    name="hra_percent" 
                    type="number" 
                    value={salaryData.hra_percent} 
                    onChange={handleSalaryChange} 
                    disabled={!isAdmin}
                    className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" 
                  />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-sm font-medium text-text-muted">Medical Fixed (₹)</label>
                  <Input 
                    name="medical_allowance_fixed" 
                    type="number" 
                    value={salaryData.medical_allowance_fixed} 
                    onChange={handleSalaryChange} 
                    disabled={!isAdmin}
                    className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" 
                  />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-sm font-medium text-text-muted">Professional Tax (₹)</label>
                  <Input 
                    name="professional_tax" 
                    type="number" 
                    value={salaryData.professional_tax} 
                    onChange={handleSalaryChange} 
                    disabled={!isAdmin}
                    className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" 
                  />
                </div>
              </div>

              {/* Right Column: Working Days, Break Hours, Monthly Wage, Yearly Wage */}
              <div className="space-y-5">
                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-sm font-medium text-text-muted">Working Days / Week</label>
                  <Input 
                    name="working_days_per_week" 
                    type="number" 
                    value={salaryData.working_days_per_week} 
                    onChange={handleSalaryChange} 
                    disabled={!isAdmin}
                    className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" 
                  />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-sm font-medium text-text-muted">Break Hours / Day</label>
                  <Input 
                    name="break_time_hours" 
                    type="number" 
                    step="0.5"
                    value={salaryData.break_time_hours} 
                    onChange={handleSalaryChange} 
                    disabled={!isAdmin}
                    className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" 
                  />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-sm font-medium text-text-muted">Monthly Wage (₹)</label>
                  <Input 
                    name="monthly_wage" 
                    type="number" 
                    value={salaryData.monthly_wage} 
                    onChange={handleSalaryChange} 
                    disabled={!isAdmin}
                    className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" 
                  />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-sm font-medium text-text-muted">Yearly Wage (₹)</label>
                  <Input 
                    name="yearly_wage" 
                    type="number" 
                    value={salaryData.yearly_wage} 
                    onChange={handleSalaryChange} 
                    disabled={!isAdmin}
                    className="bg-transparent border-b border-border border-x-0 border-t-0 rounded-none focus:ring-0 px-0" 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-8 border-t border-border">
            <Button variant="outline" type="button" className="px-8 border-border text-text-body hover:bg-bg-main" onClick={() => window.location.reload()}>Cancel</Button>
            <Button type="submit" isLoading={loading} className="px-8">Save</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
