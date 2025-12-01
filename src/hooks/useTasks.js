'use client';

import { useState, useEffect, useCallback } from 'react';
import { taskAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (loading) return; // Prevent multiple simultaneous calls
    
    try {
      setLoading(true);
      const response = await taskAPI.getUserTasks();
      setTasks(response.data.data.tasks || []);
      setHasFetched(true);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Initial fetch only once
  useEffect(() => {
    if (!hasFetched) {
      fetchTasks();
    }
  }, [hasFetched, fetchTasks]);

  const createTask = async (taskData) => {
    try {
      const response = await taskAPI.createTask(taskData);
      setTasks(prev => [response.data.data.task, ...prev]);
      toast.success('Task created successfully');
      return response.data.data.task;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task';
      toast.error(message);
      throw error;
    }
  };

  const updateTask = async (taskId, updateData) => {
    try {
      const response = await taskAPI.updateTask(taskId, updateData);
      setTasks(prev => 
        prev.map(t => t._id === taskId ? response.data.data.task : t)
      );
      toast.success('Task updated successfully');
      return response.data.data.task;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update task';
      toast.error(message);
      throw error;
    }
  };

  return { 
    tasks, 
    loading, 
    fetchTasks, 
    createTask, 
    updateTask 
  };
};
//add new one 

// 'use client';

// import { useState, useEffect } from 'react';
// import { taskAPI } from '@/lib/api';
// import toast from 'react-hot-toast';

// export const useTasks = () => {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchTasks = async () => {
//     try {
//       setLoading(true);
//       const response = await taskAPI.getUserTasks();
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

//   const createTask = async (taskData) => {
//     try {
//       const response = await taskAPI.createTask(taskData);
//       setTasks([response.data.data.task, ...tasks]);
//       toast.success('Task created successfully');
//       return response.data.data.task;
//     } catch (error) {
//       toast.error('Failed to create task');
//       throw error;
//     }
//   };


// const updateTask = async (taskId, updateData) => {
//     try {
//       console.log('Updating task with ID:', taskId); 
//       const response = await taskAPI.updateTask(taskId, updateData);
      
    
//       setTasks(tasks.map(t => t._id === taskId ? response.data.data.task : t));
//       toast.success('Task updated successfully');
//       return response.data.data.task;
//     } catch (error) {
//       console.error('Update error:', error.response?.data); 
//       toast.error('Failed to update task');
//       throw error;
//     }
//   };

//   return { tasks, loading, fetchTasks, createTask, updateTask };
// };

// 'use client';

// import { useState, useEffect } from 'react';
// import { taskAPI } from '@/lib/api';
// import toast from 'react-hot-toast';

// export const useTasks = () => {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchTasks = async () => {
//     try {
//       setLoading(true);
//       const response = await taskAPI.getUserTasks();
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

//   const createTask = async (taskData) => {
//     try {
//       const response = await taskAPI.createTask(taskData);
//       setTasks([response.data.data.task, ...tasks]);
//       toast.success('Task created successfully');
//       return response.data.data.task;
//     } catch (error) {
//       toast.error('Failed to create task');
//       throw error;
//     }
//   };

// //   const updateTask = async (taskId, updateData) => {
// //     try {
// //       const response = await taskAPI.updateTask(taskId, updateData);
// //       setTasks(tasks.map(t => t.taskId === taskId ? response.data.data.task : t));
// //       toast.success('Task updated successfully');
// //       return response.data.data.task;
// //     } catch (error) {
// //       toast.error('Failed to update task');
// //       throw error;
// //     }
// //   };
// const updateTask = async (taskId, updateData) => {
//     try {
//       console.log('Updating task with ID:', taskId); 
//       const response = await taskAPI.updateTask(taskId, updateData);
      
    
//       setTasks(tasks.map(t => t._id === taskId ? response.data.data.task : t));
//       toast.success('Task updated successfully');
//       return response.data.data.task;
//     } catch (error) {
//       console.error('Update error:', error.response?.data); // 
//       toast.error('Failed to update task');
//       throw error;
//     }
//   };

//   return { tasks, loading, fetchTasks, createTask, updateTask };
// };