import { Card } from '@/components/ui/Card';
import { Camera, Edit2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRef, useState } from 'react';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

export function ProfileCard() {
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const { data } = await apiClient.put('/auth/me', {
            profile_picture: base64String
          });
          setUser(data);
          toast.success('Profile picture updated successfully');
        } catch (error) {
          toast.error('Failed to update profile picture');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Error reading file');
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-0 overflow-hidden border-0 bg-transparent shadow-none relative h-full flex flex-col">
      {/* Photo Area */}
      <div className="relative h-64 rounded-3xl bg-primary-100 overflow-hidden flex-shrink-0 group">
        {user?.profile_picture ? (
          <img src={user.profile_picture} alt="Profile" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-primary-600" />
        )}
        
        {/* Top badges / Info */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/30 shadow-sm">
            {user?.department || 'Design Dept'}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/30 cursor-pointer hover:bg-black/60 transition-colors shadow-sm disabled:opacity-50 group-hover:scale-105"
            title="Change photo"
          >
            {isUploading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Bottom Info Gradient */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12">
          <h2 className="text-white text-2xl font-bold truncate">{user?.full_name || 'User'}</h2>
          <p className="text-white/80 text-sm mt-1 truncate">{user?.position || user?.role || 'General manager'}</p>
        </div>

        {/* Floating action button */}
        <button 
          onClick={() => window.location.href = '/profile'}
          className="absolute bottom-5 right-5 bg-white p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors group-hover:-translate-y-1"
        >
          <Edit2 className="w-4 h-4 text-primary" />
        </button>
      </div>
      
      {/* Experience Badge overlay */}
      <div className="absolute -bottom-3 left-6">
        <div className="bg-success text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md border-2 border-white">
          4+ years experience
        </div>
      </div>
    </Card>
  );
}
