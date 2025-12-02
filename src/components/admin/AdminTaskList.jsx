'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RealTimeNotifications } from './RealTimeNotifications';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export const AdminTaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllTasks();
      setTasks(response.data.data.tasks);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]); // Refresh only when trigger changes

  const handleManualRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Refreshing tasks...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
  };

  return (
    <div>
      {/* Notifications WITHOUT auto-refresh */}
      <RealTimeNotifications onTaskUpdate={handleManualRefresh} />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          All Tasks Dashboard
        </h2>
        <Button 
          onClick={handleManualRefresh}
          variant="secondary"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Tasks'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
        </Card>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No tasks available</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.taskId} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {task.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  <div className="flex items-center gap-3">
                    <Badge variant={task.completed ? 'success' : 'warning'}>
                      {task.completed ? 'Completed' : 'Pending'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      By: {task.user?.email}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(task.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// 'use client';

// import { useState, useEffect } from 'react';
// import { adminAPI } from '@/lib/api';
// import { Card } from '@/components/ui/Card';
// import { Badge } from '@/components/ui/Badge';
// import { RealTimeNotifications } from './RealTimeNotifications';
// import { formatDate } from '@/lib/utils';
// import toast from 'react-hot-toast';

// export const AdminTaskList = () => {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchTasks = async () => {
//     try {
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
//   }, []);

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
//       <RealTimeNotifications onTaskUpdate={fetchTasks} />

//       <h2 className="text-2xl font-bold text-gray-900 mb-6">
//         All Tasks Dashboard
//       </h2>

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