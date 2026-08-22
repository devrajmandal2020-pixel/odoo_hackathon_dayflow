import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import type { PayrollRecord } from '@/types/api';
import { DollarSign, FileText, CheckCircle, X, Plus, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { fadeIn, slideUp } from '@/lib/motion';

export function PayrollPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchPayroll = async () => {
    try {
      setIsLoading(true);
      const url = isAdmin ? '/payroll/all' : '/payroll/my-slips';
      const { data } = await apiClient.get<PayrollRecord[]>(url);
      setRecords(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load payroll data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [isAdmin]);

  const handleGenerate = async () => {
    if (!user) return;
    try {
      setIsGenerating(true);
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01'; // YYYY-MM-01
      await apiClient.post('/payroll/generate', {
        user_id: user.id,
        month: currentMonth,
      });
      toast.success('Payslip generated successfully');
      fetchPayroll();
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate payslip');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePay = async (id: string) => {
    try {
      await apiClient.put(`/payroll/${id}/pay`);
      toast.success('Salary marked as paid');
      fetchPayroll();
    } catch (error) {
      console.error(error);
      toast.error('Failed to process payment');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="p-8 max-w-7xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-heading">Payroll Management</h1>
          <p className="text-text-muted mt-1">Manage and view employee payslips</p>
        </div>

        {isAdmin && (
          <div className="flex gap-3">
            <button
              onClick={async () => {
                try {
                  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
                  const response = await apiClient.get(`/reports/payroll/csv?month=${currentMonth}`, {
                    responseType: 'blob'
                  });
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `payroll_${currentMonth}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  toast.success('CSV Exported successfully');
                } catch (error) {
                  console.error(error);
                  toast.error('Failed to export CSV');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-text-heading rounded-xl hover:bg-gray-100 transition-colors border border-border"
            >
              <FileText className="w-5 h-5" />
              Export CSV
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              Generate My Payslip (Test)
            </button>
          </div>
        )}
      </div>

      <div className="bg-bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-bg-main/50 border-b border-border">
              <tr>
                {isAdmin && (
                  <th className="px-6 py-4 text-sm font-semibold text-text-heading">Employee</th>
                )}
                <th className="px-6 py-4 text-sm font-semibold text-text-heading">Month</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-heading">Gross Pay</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-heading">Net Pay</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-heading">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-heading text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-8 text-center text-text-muted">
                    Loading payroll data...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-8 text-center text-text-muted">
                    No payroll records found.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-bg-main/30 transition-colors">
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="font-medium text-text-heading">
                          {record.user?.full_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-text-muted">
                          {record.user?.employee_id || 'N/A'}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-text-body">{record.month}</td>
                    <td className="px-6 py-4 font-medium text-text-heading">
                      {formatCurrency(record.gross_salary)}
                    </td>
                    <td className="px-6 py-4 font-medium text-primary">
                      {formatCurrency(record.net_salary)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          record.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {record.status === 'paid' ? 'Paid' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin && record.status === 'draft' && (
                          <button
                            onClick={() => handlePay(record.id)}
                            className="p-2 text-primary hover:bg-primary-50 rounded-lg transition-colors"
                            title="Mark as Paid"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedSlip(record)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-body hover:bg-bg-main rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      <AnimatePresence>
        {selectedSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-bg-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-border bg-bg-main/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-heading">Payslip</h2>
                    <p className="text-sm text-text-muted">{selectedSlip.month}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="p-2 text-text-muted hover:bg-bg-main rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="flex justify-between items-start mb-8 pb-8 border-b border-border">
                  <div>
                    <h3 className="text-sm font-semibold text-text-muted mb-1">Employee Details</h3>
                    <p className="font-medium text-text-heading">{selectedSlip.user?.full_name}</p>
                    <p className="text-sm text-text-muted">ID: {selectedSlip.user?.employee_id}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-semibold text-text-muted mb-1">Payment Status</h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                        selectedSlip.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {selectedSlip.status === 'paid' ? (
                        <>
                          <CheckCircle className="w-4 h-4" /> Paid
                        </>
                      ) : (
                        'Draft'
                      )}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Earnings */}
                  <div>
                    <h3 className="text-lg font-bold text-text-heading mb-4 border-b border-border pb-2">Earnings</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-body">Basic Wage</span>
                        <span className="font-medium text-text-heading">{formatCurrency(selectedSlip.basic_wage)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-body">House Rent Allowance</span>
                        <span className="font-medium text-text-heading">{formatCurrency(selectedSlip.house_rent_allowance)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-body">Medical Allowance</span>
                        <span className="font-medium text-text-heading">{formatCurrency(selectedSlip.medical_allowance)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-body">Special Allowance</span>
                        <span className="font-medium text-text-heading">{formatCurrency(selectedSlip.special_allowance)}</span>
                      </div>
                      <div className="pt-3 mt-3 border-t border-border flex justify-between">
                        <span className="font-semibold text-text-heading">Gross Earnings</span>
                        <span className="font-semibold text-text-heading">{formatCurrency(selectedSlip.gross_salary)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h3 className="text-lg font-bold text-text-heading mb-4 border-b border-border pb-2">Deductions</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-body">Provident Fund (PF)</span>
                        <span className="font-medium text-text-heading">{formatCurrency(selectedSlip.provident_fund)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-body">Tax</span>
                        <span className="font-medium text-text-heading">{formatCurrency(selectedSlip.tax)}</span>
                      </div>
                      <div className="pt-3 mt-3 border-t border-border flex justify-between">
                        <span className="font-semibold text-text-heading">Total Deductions</span>
                        <span className="font-semibold text-text-heading">{formatCurrency(selectedSlip.provident_fund + selectedSlip.tax)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Pay */}
                <div className="mt-8 p-6 bg-primary-50 rounded-xl flex items-center justify-between border border-primary-100">
                  <div>
                    <h3 className="text-lg font-bold text-primary-900">Net Salary Payable</h3>
                    <p className="text-sm text-primary-700">Gross Earnings - Total Deductions</p>
                  </div>
                  <div className="text-3xl font-black text-primary">
                    {formatCurrency(selectedSlip.net_salary)}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
