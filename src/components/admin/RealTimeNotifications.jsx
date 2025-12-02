
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { usePusher } from '@/hooks/usePusher';
import toast from 'react-hot-toast';
import { Bell, CheckCircle, Edit, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const RealTimeNotifications = ({ onTaskUpdate }) => {
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taskNotifications');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const updateTimeoutRef = useRef(null);

  // Initialize unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskNotifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // **FIXED: Optimized real-time update**
  const handleRealTimeUpdate = useCallback(() => {
    if (onTaskUpdate) {
      // Clear any existing timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Debounced update after 1 second
      updateTimeoutRef.current = setTimeout(() => {
        console.log(' Triggering real-time task update');
        onTaskUpdate();
      }, 1000);
    }
  }, [onTaskUpdate]);

  const handleTaskCreated = (data) => {
    console.log('Task Created Event (Real-time):', data);
    
    const newNotification = {
      id: Date.now() + Math.random(),
      type: 'created',
      title: data.title,
      user: data.user?.email || 'Unknown User',
      message: 'New task created',
      timestamp: new Date().toISOString(),
      read: false
    };

    toast.success(` New task: ${data.title}`, {
      icon: <Plus className="text-blue-500" />,
      duration: 3000,
    });

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
    
    // **FIXED: Trigger real-time update**
    handleRealTimeUpdate();
  };

  const handleTaskUpdated = (data) => {
    console.log(' Task Updated Event (Real-time):', data);
    
    const newNotification = {
      id: Date.now() + Math.random(),
      type: 'updated', 
      title: data.title,
      user: data.user?.email || 'Unknown User',
      message: 'Task updated',
      timestamp: new Date().toISOString(),
      read: false
    };

    toast(`✏️ Task updated: ${data.title}`, {
      icon: <Edit className="text-yellow-500" />,
      duration: 3000,
      style: {
        background: '#fef3c7',
        color: '#92400e',
      },
    });

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
    
    // **FIXED: Trigger real-time update**
    handleRealTimeUpdate();
  };

  const handleTaskCompleted = (data) => {
    console.log('Task Completed Event (Real-time):', data);
    
    const newNotification = {
      id: Date.now() + Math.random(),
      type: 'completed',
      title: data.title,
      user: data.user?.email || 'Unknown User', 
      message: 'Task completed',
      timestamp: new Date().toISOString(),
      read: false
    };

    toast.success(`Task completed: ${data.title}`, {
      icon: <CheckCircle className="text-green-500" />,
      duration: 3000,
    });

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
    
    // **FIXED: Trigger real-time update**
    handleRealTimeUpdate();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Subscribe to Pusher events
  usePusher('admin-tasks', 'task-created', handleTaskCreated);
  usePusher('admin-tasks', 'task-updated', handleTaskUpdated);
  usePusher('admin-tasks', 'task-completed', handleTaskCompleted);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Update unread count whenever notifications change
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'created': return <Plus className="w-4 h-4 text-blue-500" />;
      case 'updated': return <Edit className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setShowPanel(!showPanel)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notifications Panel */}
      {showPanel && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">
                Notifications ({notifications.length})
              </h3>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                    >
                      Mark all read
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={clearAll}
                    >
                      Clear all
                    </Button>
                  </>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPanel(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No notifications yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Real-time updates will appear here
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          By: {notification.user}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};


// 'use client';

// import { useState, useCallback, useEffect } from 'react';
// import { usePusher } from '@/hooks/usePusher';
// import toast from 'react-hot-toast';
// import { Bell, CheckCircle, Edit, Plus, X } from 'lucide-react';
// import { Button } from '@/components/ui/Button';

// export const RealTimeNotifications = ({ onTaskUpdate }) => {
//   const [notifications, setNotifications] = useState(() => {
//     // Load from localStorage on initial render
//     if (typeof window !== 'undefined') {
//       const saved = localStorage.getItem('taskNotifications');
//       return saved ? JSON.parse(saved) : [];
//     }
//     return [];
//   });
  
//   const [showPanel, setShowPanel] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(() => {
//     if (typeof window !== 'undefined') {
//       return notifications.filter(n => !n.read).length;
//     }
//     return 0;
//   });

//   // Save notifications to localStorage
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       localStorage.setItem('taskNotifications', JSON.stringify(notifications));
//     }
//   }, [notifications]);

//   // Optimized task update - debounced and without full refresh
//   const handleTaskUpdate = useCallback(() => {
//     if (onTaskUpdate) {
//       // Don't refresh immediately, wait and refresh only if needed
//       const timeoutId = setTimeout(() => {
//         onTaskUpdate();
//       }, 5000); // 5 seconds delay
      
//       return () => clearTimeout(timeoutId);
//     }
//   }, [onTaskUpdate]);

//   const handleTaskCreated = (data) => {
//     console.log('Task Created Event:', data);
//     const newNotification = {
//       id: Date.now() + Math.random(),
//       type: 'created',
//       title: data.title,
//       user: data.user?.email || 'Unknown User',
//       message: 'New task created',
//       timestamp: new Date().toISOString(),
//       read: false
//     };

//     toast.success(`New task: ${data.title}`, {
//       icon: <Plus className="text-blue-500" />,
//       duration: 4000,
//     });

//     setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
//     setUnreadCount(prev => prev + 1);
    
//     // Don't trigger immediate refresh
//     // handleTaskUpdate();
//   };

//   const handleTaskUpdated = (data) => {
//     console.log(' Task Updated Event:', data);
//     const newNotification = {
//       id: Date.now() + Math.random(),
//       type: 'updated', 
//       title: data.title,
//       user: data.user?.email || 'Unknown User',
//       message: 'Task updated',
//       timestamp: new Date().toISOString(),
//       read: false
//     };

//     toast(`Task updated: ${data.title}`, {
//       icon: <Edit className="text-yellow-500" />,
//       duration: 4000,
//       style: {
//         background: '#fef3c7',
//         color: '#92400e',
//       },
//     });

//     setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
//     setUnreadCount(prev => prev + 1);
    
//     // Don't trigger immediate refresh
//     // handleTaskUpdate();
//   };

//   const handleTaskCompleted = (data) => {
//     console.log(' Task Completed Event:', data);
//     const newNotification = {
//       id: Date.now() + Math.random(),
//       type: 'completed',
//       title: data.title,
//       user: data.user?.email || 'Unknown User', 
//       message: 'Task completed',
//       timestamp: new Date().toISOString(),
//       read: false
//     };

//     toast.success(`Task completed: ${data.title}`, {
//       icon: <CheckCircle className="text-green-500" />,
//       duration: 4000,
//     });

//     setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
//     setUnreadCount(prev => prev + 1);
    
//     // Don't trigger immediate refresh
//     // handleTaskUpdate();
//   };

//   // Pusher subscriptions with debugging
//   const isCreatedConnected = usePusher('admin-tasks', 'task-created', handleTaskCreated);
//   const isUpdatedConnected = usePusher('admin-tasks', 'task-updated', handleTaskUpdated);
//   const isCompletedConnected = usePusher('admin-tasks', 'task-completed', handleTaskCompleted);

//   console.log('Pusher Connections:', {
//     created: isCreatedConnected,
//     updated: isUpdatedConnected,
//     completed: isCompletedConnected
//   });

//   const markAsRead = (id) => {
//     setNotifications(prev => 
//       prev.map(notif => 
//         notif.id === id ? { ...notif, read: true } : notif
//       )
//     );
//     setUnreadCount(prev => Math.max(0, prev - 1));
//   };

//   const markAllAsRead = () => {
//     setNotifications(prev => 
//       prev.map(notif => ({ ...notif, read: true }))
//     );
//     setUnreadCount(0);
//   };

//   const clearAll = () => {
//     setNotifications([]);
//     setUnreadCount(0);
//   };

//   const getNotificationIcon = (type) => {
//     switch (type) {
//       case 'created': return <Plus className="w-4 h-4 text-blue-500" />;
//       case 'updated': return <Edit className="w-4 h-4 text-yellow-500" />;
//       case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
//       default: return <Bell className="w-4 h-4 text-gray-500" />;
//     }
//   };

//   const formatTime = (timestamp) => {
//     return new Date(timestamp).toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   return (
//     <div className="relative">
//       {/* Bell Icon */}
//       <Button
//         variant="secondary"
//         size="sm"
//         onClick={() => setShowPanel(!showPanel)}
//         className="relative"
//       >
//         <Bell className="w-5 h-5" />
//         {unreadCount > 0 && (
//           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//             {unreadCount > 9 ? '9+' : unreadCount}
//           </span>
//         )}
//       </Button>

//       {/* Notifications Panel */}
//       {showPanel && (
//         <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
//           <div className="p-4 border-b border-gray-200 bg-gray-50">
//             <div className="flex justify-between items-center">
//               <h3 className="font-semibold text-gray-900">Notifications</h3>
//               <div className="flex gap-2">
//                 {notifications.length > 0 && (
//                   <>
//                     <Button
//                       variant="secondary"
//                       size="sm"
//                       onClick={markAllAsRead}
//                       disabled={unreadCount === 0}
//                     >
//                       Mark all read
//                     </Button>
//                     <Button
//                       variant="danger"
//                       size="sm"
//                       onClick={clearAll}
//                     >
//                       Clear all
//                     </Button>
//                   </>
//                 )}
//                 <Button
//                   variant="secondary"
//                   size="sm"
//                   onClick={() => setShowPanel(false)}
//                 >
//                   <X className="w-4 h-4" />
//                 </Button>
//               </div>
//             </div>
//           </div>

//           <div className="overflow-y-auto max-h-80">
//             {notifications.length === 0 ? (
//               <div className="p-8 text-center text-gray-500">
//                 <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
//                 <p>No notifications yet</p>
//               </div>
//             ) : (
//               notifications.map((notification) => (
//                 <div
//                   key={notification.id}
//                   className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
//                     !notification.read ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
//                   }`}
//                   onClick={() => markAsRead(notification.id)}
//                 >
//                   <div className="flex items-start gap-3">
//                     <div className="flex-shrink-0 mt-0.5">
//                       {getNotificationIcon(notification.type)}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium text-gray-900 truncate">
//                         {notification.title}
//                       </p>
//                       <p className="text-sm text-gray-600 mt-1">
//                         {notification.message}
//                       </p>
//                       <div className="flex justify-between items-center mt-2">
//                         <span className="text-xs text-gray-500">
//                           By: {notification.user}
//                         </span>
//                         <span className="text-xs text-gray-400">
//                           {formatTime(notification.timestamp)}
//                         </span>
//                       </div>
//                     </div>
//                     {!notification.read && (
//                       <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
//                     )}
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
