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

// 'use client';

// import { useAuth } from '@/hooks/useAuth';
// import { Button } from '@/components/ui/Button';
// import { LogOut, User } from 'lucide-react';
// import Link from 'next/link';

// export const Navbar = () => {
//   const { user, logout } = useAuth();

//   return (
//     <nav className="bg-white shadow-md border-b border-gray-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           <Link href={user?.role === 'admin' ? '/admin/tasks' : '/tasks'}>
//             <h1 className="text-2xl font-bold text-blue-600">TaskManager</h1>
//           </Link>
          
//           <div className="flex items-center gap-4">
//             {user && (
//               <>
//                 <div className="flex items-center gap-2">
//                   <User size={20} className="text-gray-600" />
//                   <span className="text-sm text-gray-700">{user.email}</span>
//                   <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
//                     {user.role}
//                   </span>
//                 </div>
//                 <Button variant="secondary" size="sm" onClick={logout}>
//                   <LogOut size={16} className="mr-2" />
//                   Logout
//                 </Button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };