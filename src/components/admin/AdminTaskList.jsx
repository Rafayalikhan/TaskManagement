'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { adminAPI } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RealTimeNotifications } from './RealTimeNotifications';
import { formatDate } from '@/lib/utils';
import { CheckCircle, AlertCircle, Loader2, Clock, Zap, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminTaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());
  const realTimeUpdateCount = useRef(0);
  const lastRealTimeEvent = useRef(null);

  // Initial fetch - ONLY ONCE
  useEffect(() => {
    const fetchInitialTasks = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getAllTasks();
        setTasks(response.data.data.tasks || []);
        setLastSync(new Date());
        console.log('✅ Initial tasks loaded:', response.data.data.tasks?.length || 0);
      } catch (error) {
        console.error('❌ Failed to load tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialTasks();
  }, []); // ✅ Empty dependency array - runs only once

  // **DIRECT LOCAL UPDATES - NO API CALLS**
  const handleRealTimeUpdate = useCallback((eventData) => {
    if (!eventData || !eventData.type) {
      console.log('⚠️ Invalid event data:', eventData);
      return;
    }

    console.log('🎯 Direct local update received:', eventData);
    realTimeUpdateCount.current++;
    lastRealTimeEvent.current = { ...eventData, receivedAt: new Date() };

    setTasks(prevTasks => {
      let updatedTasks = [...prevTasks];
      
      switch (eventData.type) {
        case 'created':
          // Add new task
          const newTask = {
            _id: eventData.taskId,
            taskId: eventData.taskId,
            title: eventData.title,
            description: eventData.description || '',
            completed: false,
            user: eventData.user || { email: eventData.userId || 'Unknown User' },
            createdAt: new Date(eventData.createdAt || new Date()),
            updatedAt: new Date()
          };
          console.log('📝 Adding new task:', newTask.title);
          return [newTask, ...updatedTasks];

        case 'updated':
          // Update existing task
          const updateIndex = updatedTasks.findIndex(task => 
            task._id === eventData.taskId || task.taskId === eventData.taskId
          );
          
          if (updateIndex !== -1) {
            console.log('✏️ Updating task:', eventData.title);
            updatedTasks[updateIndex] = {
              ...updatedTasks[updateIndex],
              title: eventData.title || updatedTasks[updateIndex].title,
              description: eventData.description !== undefined 
                ? eventData.description 
                : updatedTasks[updateIndex].description,
              completed: eventData.completed !== undefined 
                ? eventData.completed 
                : updatedTasks[updateIndex].completed,
              user: eventData.user || updatedTasks[updateIndex].user,
              updatedAt: new Date()
            };
          }
          return updatedTasks;

        case 'completed':
          // Mark task as completed
          const completeIndex = updatedTasks.findIndex(task => 
            task._id === eventData.taskId || task.taskId === eventData.taskId
          );
          
          if (completeIndex !== -1) {
            console.log('✅ Completing task:', eventData.title);
            updatedTasks[completeIndex] = {
              ...updatedTasks[completeIndex],
              completed: true,
              updatedAt: new Date()
            };
          }
          return updatedTasks;

        default:
          return prevTasks;
      }
    });

    // Show subtle success message
    toast.success(`Live update: ${eventData.title}`, {
      duration: 2000,
      icon: <Zap className="w-4 h-4 text-yellow-500" />,
      position: 'bottom-right'
    });
  }, []);

  const handleManualRefresh = useCallback(async () => {
    try {
      setLoading(true);
      toast.loading('Syncing with server...', { id: 'sync-tasks' });
      
      const response = await adminAPI.getAllTasks();
      setTasks(response.data.data.tasks || []);
      setLastSync(new Date());
      
      toast.success(`Synced ${response.data.data.tasks?.length || 0} tasks`, {
        id: 'sync-tasks'
      });
    } catch (error) {
      console.error('❌ Sync failed:', error);
      toast.error('Sync failed', { id: 'sync-tasks' });
    } finally {
      setLoading(false);
    }
  }, []);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    uniqueUsers: [...new Set(tasks.map(t => t.user?.email).filter(Boolean))].length
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString('en-US');
  };

  const getLastRealTimeUpdate = () => {
    if (!lastRealTimeEvent.current) return 'No live updates yet';
    return `${formatTimeAgo(lastRealTimeEvent.current.receivedAt)}`;
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">
                Last sync: {formatTimeAgo(lastSync)}
              </span>
            </div>
            
            {realTimeUpdateCount.current > 0 && (
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
                <Zap className="w-4 h-4 text-green-600 animate-pulse" />
                <span className="text-sm text-green-700 font-medium">
                  {realTimeUpdateCount.current} live updates
                </span>
                <span className="text-xs text-green-600">
                  (Last: {getLastRealTimeUpdate()})
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Real-time Notifications */}
          <RealTimeNotifications onTaskUpdate={handleRealTimeUpdate} />
          
          <Button 
            onClick={handleManualRefresh}
            variant="secondary"
            disabled={loading}
            className="min-w-[140px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Syncing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync Now
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Total Tasks</h3>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.total}</p>
            </div>
            <div className="text-gray-400">
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Completed</h3>
              <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1 md:mt-2">{stats.completed}</p>
            </div>
            <div className="text-green-400">
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Pending</h3>
              <p className="text-2xl md:text-3xl font-bold text-yellow-600 mt-1 md:mt-2">{stats.pending}</p>
            </div>
            <div className="text-yellow-400">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Users</h3>
              <p className="text-2xl md:text-3xl font-bold text-purple-600 mt-1 md:mt-2">{stats.uniqueUsers}</p>
            </div>
            <div className="text-purple-400">
              <Users className="w-6 h-6 md:w-8 md:h-8" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tasks List */}
      <Card className="overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              All Tasks
            </h2>
            <Badge variant="secondary">
              {tasks.length} tasks
            </Badge>
            {realTimeUpdateCount.current > 0 && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                <Zap className="w-3 h-3 mr-1" />
                {realTimeUpdateCount.current} live
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${realTimeUpdateCount.current > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-500">
              {realTimeUpdateCount.current > 0 ? 'Live updates active' : 'Ready for updates'}
            </span>
          </div>
        </div>
        
        <div className="p-4 md:p-6">
          {loading && tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">No tasks yet</p>
              <p className="text-gray-400 mt-2">Tasks will appear here as users create them</p>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span>Waiting for real-time updates...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card 
                  key={task._id || task.taskId} 
                  className="p-4 md:p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 hover:border-l-green-500 hover:translate-x-1"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">
                          {task.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={task.completed ? 'success' : 'warning'}>
                            {task.completed ? '✅ Completed' : '⏳ Pending'}
                          </Badge>
                          {task.updatedAt && task.createdAt !== task.updatedAt && (
                            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                              <Zap className="w-3 h-3 mr-1" />
                              Updated
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-4 text-sm md:text-base">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {task.user?.email || 'Unknown User'}
                        </span>
                        <span className="text-gray-300 hidden md:inline">•</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(task.createdAt)}
                        </span>
                        {task.updatedAt && task.updatedAt !== task.createdAt && (
                          <>
                            <span className="text-gray-300 hidden md:inline">•</span>
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              Updated: {formatDate(task.updatedAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex md:flex-col items-center md:items-end gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.completed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.completed ? 'Completed' : 'In Progress'}
                      </span>
                      {task.updatedAt && task.createdAt !== task.updatedAt && (
                        <span className="text-xs text-gray-500">
                          Updated recently
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};


// 'use client';

// import { useState, useEffect, useCallback, useRef } from 'react';
// import { adminAPI } from '@/lib/api';
// import { Card } from '@/components/ui/Card';
// import { Badge } from '@/components/ui/Badge';
// import { Button } from '@/components/ui/Button';
// import { RealTimeNotifications } from './RealTimeNotifications';
// import { formatDate } from '@/lib/utils';
// import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
// import toast from 'react-hot-toast';

// export const AdminTaskList = () => {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [lastUpdate, setLastUpdate] = useState(null);
//   const isMounted = useRef(true);
//   const updateInProgress = useRef(false);

//   const fetchTasks = useCallback(async (showToast = false) => {
//     // Prevent multiple simultaneous calls
//     if (updateInProgress.current) {
//       console.log('⚠️ Update already in progress, skipping...');
//       return;
//     }

//     try {
//       updateInProgress.current = true;
//       setLoading(true);
      
//       if (showToast) {
//         toast.loading('Refreshing tasks...', { id: 'refresh-tasks' });
//       }

//       console.log('🔄 Fetching tasks from API...');
//       const response = await adminAPI.getAllTasks();
      
//       if (isMounted.current) {
//         console.log('✅ Tasks fetched:', response.data.data.tasks?.length || 0);
//         setTasks(response.data.data.tasks || []);
//         setLastUpdate(new Date());
        
//         if (showToast) {
//           toast.success(`Updated ${response.data.data.tasks?.length || 0} tasks`, {
//             id: 'refresh-tasks'
//           });
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error fetching tasks:', error);
      
//       if (isMounted.current) {
//         if (showToast) {
//           toast.error('Failed to fetch tasks', {
//             id: 'refresh-tasks'
//           });
//         } else {
//           toast.error('Failed to fetch tasks');
//         }
//       }
//     } finally {
//       if (isMounted.current) {
//         setLoading(false);
//         updateInProgress.current = false;
//       }
//     }
//   }, []); // ✅ EMPTY dependency array

//   // Initial fetch - only once on mount
//   useEffect(() => {
//     isMounted.current = true;
//     console.log('🚀 AdminTaskList mounted, fetching initial tasks...');
//     fetchTasks(false);

//     return () => {
//       isMounted.current = false;
//       console.log('🧹 AdminTaskList unmounting...');
//     };
//   }, [fetchTasks]); // ✅ Only depends on fetchTasks

//   // Handle real-time updates
//   const handleRealTimeUpdate = useCallback(() => {
//     console.log('🎯 Real-time update triggered');
    
//     // Debounce real-time updates
//     if (updateInProgress.current) {
//       console.log('⏸️ Update in progress, queuing real-time update...');
//       return;
//     }

//     // Small delay to batch rapid updates
//     const timeoutId = setTimeout(() => {
//       fetchTasks(false);
//     }, 500);

//     return () => clearTimeout(timeoutId);
//   }, [fetchTasks]);

//   const stats = {
//     total: tasks.length,
//     completed: tasks.filter(t => t.completed).length,
//     pending: tasks.filter(t => !t.completed).length,
//   };

//   const formatLastUpdate = () => {
//     if (!lastUpdate) return 'Never';
//     const now = new Date();
//     const diff = Math.floor((now - lastUpdate) / 1000);
    
//     if (diff < 60) return `${diff} seconds ago`;
//     if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
//     return lastUpdate.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const handleManualRefresh = () => {
//     console.log('🔄 Manual refresh triggered');
//     fetchTasks(true);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
//           <div className="flex items-center gap-4 mt-2">
//             <p className="text-sm text-gray-600">
//               Real-time task monitoring
//             </p>
//             <div className="flex items-center gap-2">
//               <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
//               <span className="text-xs text-gray-500">
//                 {loading ? 'Updating...' : `Last update: ${formatLastUpdate()}`}
//               </span>
//             </div>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-4">
//           {/* Real-time Notifications */}
//           {/* <RealTimeNotifications onTaskUpdate={handleRealTimeUpdate} /> */}
          
//           <Button 
//             onClick={handleManualRefresh}
//             variant="secondary"
//             disabled={loading}
//             className="min-w-[140px]"
//           >
//             {loading ? (
//               <span className="flex items-center gap-2">
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 Refreshing...
//               </span>
//             ) : (
//               <span className="flex items-center gap-2">
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                 </svg>
//                 Refresh Tasks
//               </span>
//             )}
//           </Button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <Card className="p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Tasks</h3>
//               <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
//             </div>
//             <div className="text-gray-400">
//               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//               </svg>
//             </div>
//           </div>
//         </Card>
        
//         <Card className="p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Completed</h3>
//               <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
//             </div>
//             <div className="text-green-400">
//               <CheckCircle className="w-8 h-8" />
//             </div>
//           </div>
//         </Card>
        
//         <Card className="p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pending</h3>
//               <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
//             </div>
//             <div className="text-yellow-400">
//               <AlertCircle className="w-8 h-8" />
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* Tasks List */}
//       <div className="bg-white rounded-lg shadow">
//         <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//           <div className="flex items-center gap-3">
//             <h2 className="text-lg font-semibold text-gray-900">
//               All Tasks
//             </h2>
//             <Badge variant="secondary">
//               {tasks.length} tasks
//             </Badge>
//             {loading && (
//               <span className="text-sm text-yellow-600 flex items-center gap-1">
//                 <Loader2 className="w-3 h-3 animate-spin" />
//                 Updating...
//               </span>
//             )}
//           </div>
//           <span className="text-sm text-gray-500">
//             Real-time updates {loading ? 'in progress...' : 'active'}
//           </span>
//         </div>
        
//         <div className="p-6">
//           {loading && tasks.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-12">
//               <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
//               <p className="text-gray-600">Loading tasks...</p>
//             </div>
//           ) : tasks.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="text-gray-400 text-6xl mb-4">📝</div>
//               <p className="text-gray-500 text-lg">No tasks found</p>
//               <p className="text-gray-400 mt-2">Tasks will appear here when users create them</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {tasks.map((task) => (
//                 <Card key={task._id} className="p-6 hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-3">
//                         <h3 className="text-lg font-semibold text-gray-900">
//                           {task.title}
//                         </h3>
//                         <Badge variant={task.completed ? 'success' : 'warning'}>
//                           {task.completed ? '✅ Completed' : '⏳ Pending'}
//                         </Badge>
//                       </div>
                      
//                       {task.description && (
//                         <p className="text-gray-600 mb-4">{task.description}</p>
//                       )}
                      
//                       <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
//                         <span className="flex items-center gap-1">
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                           </svg>
//                           {task.user?.email || 'Unknown User'}
//                         </span>
//                         <span className="text-gray-300">•</span>
//                         <span className="flex items-center gap-1">
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                           </svg>
//                           {formatDate(task.createdAt)}
//                         </span>
//                         {task.updatedAt && task.updatedAt !== task.createdAt && (
//                           <>
//                             <span className="text-gray-300">•</span>
//                             <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
//                               Updated
//                             </span>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// 'use client';
// import { CheckCircle } from 'lucide-react';
// import { useState, useEffect, useCallback } from 'react';
// import { adminAPI } from '@/lib/api';
// import { Card } from '@/components/ui/Card';
// import { Badge } from '@/components/ui/Badge';
// import { Button } from '@/components/ui/Button';
// import { RealTimeNotifications } from './RealTimeNotifications';
// import { formatDate } from '@/lib/utils';
// import toast from 'react-hot-toast';

// export const AdminTaskList = () => {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [lastUpdate, setLastUpdate] = useState(null);

//   const fetchTasks = useCallback(async () => {
//     if (loading) return;
    
//     try {
//       setLoading(true);
//       const response = await adminAPI.getAllTasks();
//       console.log(' Tasks fetched:', response.data.data.tasks?.length || 0);
//       setTasks(response.data.data.tasks || []);
//       setLastUpdate(new Date());
//     } catch (error) {
//       console.error('Error fetching tasks:', error);
//       toast.error('Failed to fetch tasks');
//     } finally {
//       setLoading(false);
//     }
//   }, [loading]);

//   // Initial fetch
//   useEffect(() => {
//     fetchTasks();
//   }, [fetchTasks]);

//   // Handle real-time updates
//   const handleRealTimeUpdate = useCallback(() => {
//     console.log('Real-time update triggered');
//     fetchTasks();
//   }, [fetchTasks]);

//   const stats = {
//     total: tasks.length,
//     completed: tasks.filter(t => t.completed).length,
//     pending: tasks.filter(t => !t.completed).length,
//   };

//   const formatLastUpdate = () => {
//     if (!lastUpdate) return 'Never';
//     return lastUpdate.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit'
//     });
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
//           <div className="flex items-center gap-4 mt-2">
//             <p className="text-sm text-gray-600">
//               Real-time task monitoring
//             </p>
//             <span className="text-xs text-gray-500">
//               Last update: {formatLastUpdate()}
//             </span>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-4">
//           {/* Real-time Notifications with auto-update */}
//           <RealTimeNotifications onTaskUpdate={handleRealTimeUpdate} />
          
//           <div className="flex gap-2">
//             <Button 
//               onClick={fetchTasks} 
//               variant="secondary"
//               disabled={loading}
//               className="min-w-[120px]"
//             >
//               {loading ? (
//                 <span className="flex items-center gap-2">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                   Refreshing...
//                 </span>
//               ) : 'Refresh Tasks'}
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <Card className="p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Tasks</h3>
//               <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
//             </div>
//             <div className="text-gray-400">
//               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//               </svg>
//             </div>
//           </div>
//         </Card>
        
//         <Card className="p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Completed</h3>
//               <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
//             </div>
//             <div className="text-green-400">
//               <CheckCircle className="w-8 h-8" />
//             </div>
//           </div>
//         </Card>
        
//         <Card className="p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pending</h3>
//               <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
//             </div>
//             <div className="text-yellow-400">
//               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* Tasks List */}
//       <div className="bg-white rounded-lg shadow">
//         <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//           <h2 className="text-lg font-semibold text-gray-900">
//             All Tasks ({tasks.length})
//           </h2>
//           <span className="text-sm text-gray-500">
//             Real-time updates enabled
//           </span>
//         </div>
        
//         <div className="p-6">
//           {loading && tasks.length === 0 ? (
//             <div className="flex justify-center items-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             </div>
//           ) : tasks.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="text-gray-400 text-6xl mb-4"></div>
//               <p className="text-gray-500 text-lg">No tasks found</p>
//               <p className="text-gray-400 mt-2">Tasks will appear here when users create them</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {tasks.map((task) => (
//                 <Card key={task._id || task.taskId} className="p-6 hover:shadow-lg transition-shadow duration-300">
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-3">
//                         <h3 className="text-lg font-semibold text-gray-900">
//                           {task.title}
//                         </h3>
//                         <Badge variant={task.completed ? 'success' : 'warning'}>
//                           {task.completed ? '✅ Completed' : '⏳ Pending'}
//                         </Badge>
//                         {task.completed && (
//                           <span className="text-xs text-green-600 font-medium">
//                             ✓ Real-time update
//                           </span>
//                         )}
//                       </div>
                      
//                       {task.description && (
//                         <p className="text-gray-600 mb-4">{task.description}</p>
//                       )}
                      
//                       <div className="flex items-center gap-4 text-sm text-gray-500">
//                         <span className="flex items-center gap-1">
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                           </svg>
//                           {task.user?.email || 'Unknown User'}
//                         </span>
//                         <span>•</span>
//                         <span className="flex items-center gap-1">
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                           </svg>
//                           {formatDate(task.createdAt)}
//                         </span>
//                         {task.updatedAt !== task.createdAt && (
//                           <>
//                             <span>•</span>
//                             <span className="text-xs text-blue-600">
//                               Updated: {formatDate(task.updatedAt)}
//                             </span>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// Add CheckCircle import at the top


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

