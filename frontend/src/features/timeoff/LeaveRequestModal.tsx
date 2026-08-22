import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api-client';
import { getErrorMessage } from '@/utils/error';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeaveRequestModal({ isOpen, onClose }: LeaveRequestModalProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    leave_type: 'casual',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date || !formData.reason) {
      toast.error('Please fill all fields');
      return;
    }

    if (formData.leave_type === 'sick' && !file) {
      toast.error('Medical certificate is required for sick leave');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('leave_type', formData.leave_type);
      data.append('start_date', formData.start_date);
      data.append('end_date', formData.end_date);
      data.append('reason', formData.reason);
      if (file) {
        data.append('medical_certificate', file);
      }

      await apiClient.post('/leave/request', data);
      
      toast.success('Leave request submitted successfully');
      setFormData({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });
      setFile(null);
      onClose();
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to submit request'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-bg-card rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-heading flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Request Time Off
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-text-muted hover:bg-bg-main rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-heading">Leave Type</label>
                <select
                  value={formData.leave_type}
                  onChange={(e) => {
                    setFormData({ ...formData, leave_type: e.target.value });
                    if (e.target.value !== 'sick') setFile(null);
                  }}
                  className="w-full px-4 py-2.5 bg-bg-main border border-border rounded-xl text-text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="paid">Paid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-heading">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  rows={3}
                  placeholder="Please provide a brief reason for your leave..."
                  className="w-full px-4 py-2.5 bg-bg-main border border-border rounded-xl text-text-heading placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none"
                />
              </div>

              {formData.leave_type === 'sick' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-heading">Medical Certificate <span className="text-danger">*</span></label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-4 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-bg-main"
                  >
                    <Upload className="w-6 h-6 text-text-muted mb-2" />
                    <span className="text-sm text-text-muted">
                      {file ? file.name : "Click to upload your medical certificate"}
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      accept="image/*,.pdf"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={loading}>
                  Submit Request
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
