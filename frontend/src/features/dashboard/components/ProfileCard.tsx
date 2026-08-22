import { Card } from '@/components/ui/Card';
import { Camera, Edit2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function ProfileCard() {
  const { user } = useAuthStore();

  return (
    <Card className="p-0 overflow-hidden border-0 bg-transparent shadow-none relative">
      {/* Photo Area */}
      <div className="relative h-64 rounded-3xl bg-primary-100 overflow-hidden">
        {/* Placeholder for Photo - Using a gradient instead */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-primary-600" />
        
        {/* Top badges / Info */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/30">
            Design Dept
          </div>
          <div className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30 cursor-pointer hover:bg-white/30 transition-colors">
            <Camera className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Bottom Info Gradient */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <h2 className="text-white text-2xl font-bold">{user?.full_name || 'Chris Jonathan'}</h2>
          <p className="text-white/80 text-sm mt-1">{user?.role || 'General manager'}</p>
        </div>

        {/* Floating action button */}
        <div className="absolute bottom-5 right-5 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <Edit2 className="w-4 h-4 text-primary" />
        </div>
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
