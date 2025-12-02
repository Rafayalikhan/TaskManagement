'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RealTimeNotifications } from './RealTimeNotifications';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export const AdminTaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const response = await adminAPI.getAllTasks();
      console.log(' Tasks fetched:', response.data.data.tasks?.length || 0);
      setTasks(response.data.data.tasks || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle real-time updates
  const handleRealTimeUpdate = useCallback(() => {
    console.log('Real-time update triggered');
    fetchTasks();
  }, [fetchTasks]);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Never';
    return lastUpdate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm text-gray-600">
              Real-time task monitoring
            </p>
            <span className="text-xs text-gray-500">
              Last update: {formatLastUpdate()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Real-time Notifications with auto-update */}
          <RealTimeNotifications onTaskUpdate={handleRealTimeUpdate} />
          
          <div className="flex gap-2">
            <Button 
              onClick={fetchTasks} 
              variant="secondary"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Refreshing...
                </span>
              ) : 'Refresh Tasks'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Tasks</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Completed</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
            </div>
            <div className="text-green-400">
              <CheckCircle className="w-8 h-8" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <div className="text-yellow-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            All Tasks ({tasks.length})
          </h2>
          <span className="text-sm text-gray-500">
            Real-time updates enabled
          </span>
        </div>
        
        <div className="p-6">
          {loading && tasks.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4"></div>
              <p className="text-gray-500 text-lg">No tasks found</p>
              <p className="text-gray-400 mt-2">Tasks will appear here when users create them</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task._id || task.taskId} className="p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {task.title}
                        </h3>
                        <Badge variant={task.completed ? 'success' : 'warning'}>
                          {task.completed ? '✅ Completed' : '⏳ Pending'}
                        </Badge>
                        {task.completed && (
                          <span className="text-xs text-green-600 font-medium">
                            ✓ Real-time update
                          </span>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-4">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {task.user?.email || 'Unknown User'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(task.createdAt)}
                        </span>
                        {task.updatedAt !== task.createdAt && (
                          <>
                            <span>•</span>
                            <span className="text-xs text-blue-600">
                              Updated: {formatDate(task.updatedAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add CheckCircle import at the top
import { CheckCircle } from 'lucide-react';

// 'use client';

// import { useState, useEffect } from 'react';
// import { adminAPI } from '@/lib/api';
// import { Card } from '@/components/ui/Card';
// import { Badge } from '@/components/ui/Badge';
// import { Button } from '@/components/ui/Button';
// import { RealTimeNotifications } from './RealTimeNotifications';
// import { formatDate } from '@/lib/utils';
// import toast from 'react-hot-toast';

// export const AdminTaskList = () => {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   const fetchTasks = async () => {
//     try {
//       setLoading(true);
//       const response = await adminAPI.getAllTasks();
//       setTasks(response.data.data.tasks);
//     } catch (error) {
//       toast.error('Failed to fetch tasks');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTasks();
//   }, [refreshTrigger]); // Refresh only when trigger changes

//   const handleManualRefresh = () => {
//     setRefreshTrigger(prev => prev + 1);
//     toast.success('Refreshing tasks...');
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   const stats = {
//     total: tasks.length,
//     completed: tasks.filter(t => t.completed).length,
//     pending: tasks.filter(t => !t.completed).length,
//   };

//   return (
//     <div>
//       {/* Notifications WITHOUT auto-refresh */}
//       <RealTimeNotifications onTaskUpdate={handleManualRefresh} />

//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-gray-900">
//           All Tasks Dashboard
//         </h2>
//         <Button 
//           onClick={handleManualRefresh}
//           variant="secondary"
//           disabled={loading}
//         >
//           {loading ? 'Refreshing...' : 'Refresh Tasks'}
//         </Button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <Card>
//           <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
//           <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
//         </Card>
//         <Card>
//           <h3 className="text-sm font-medium text-gray-500">Completed</h3>
//           <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
//         </Card>
//         <Card>
//           <h3 className="text-sm font-medium text-gray-500">Pending</h3>
//           <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
//         </Card>
//       </div>

//       {tasks.length === 0 ? (
//         <div className="text-center py-12">
//           <p className="text-gray-500">No tasks available</p>
//         </div>
//       ) : (
//         <div className="grid gap-4">
//           {tasks.map((task) => (
//             <Card key={task.taskId} className="hover:shadow-lg transition-shadow">
//               <div className="flex items-start justify-between">
//                 <div className="flex-1">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-1">
//                     {task.title}
//                   </h3>
//                   <p className="text-gray-600 mb-3">{task.description}</p>
//                   <div className="flex items-center gap-3">
//                     <Badge variant={task.completed ? 'success' : 'warning'}>
//                       {task.completed ? 'Completed' : 'Pending'}
//                     </Badge>
//                     <span className="text-sm text-gray-500">
//                       By: {task.user?.email}
//                     </span>
//                     <span className="text-xs text-gray-400">
//                       {formatDate(task.createdAt)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

