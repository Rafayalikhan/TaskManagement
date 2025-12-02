'use client';

import { useAuth } from '@/hooks/useAuth';
import { RealTimeNotifications } from '@/components/admin/RealTimeNotifications';
import { Button } from '@/components/ui/Button';

export const Navbar = () => {
  const { user, logout } = useAuth();

  const handleTaskUpdate = () => {
    // Refresh data if needed
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Task Management</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Real-time notifications for admin */}
            {user?.role === 'admin' && (
              <RealTimeNotifications onTaskUpdate={handleTaskUpdate} />
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name || user?.email}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user?.role}
              </span>
            </div>
            
            <Button variant="secondary" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

