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
