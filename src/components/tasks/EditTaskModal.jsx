'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const EditTaskModal = ({ isOpen, onClose, task, onUpdateTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setCompleted(task.completed || false);
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // ✅ task._id use karein task.taskId ke jagah
      const taskId = task._id || task.taskId;
      console.log('Sending update for task ID:', taskId); // ✅ Debugging
      
      await onUpdateTask(taskId, { title, description, completed });
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setCompleted(false);
    setError('');
    onClose();
  };

  if (!task) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Edit Task"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
        />
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            required
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="completed"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label 
            htmlFor="completed"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            Mark as completed
          </label>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        
        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};


// 'use client';

// import { useState, useEffect } from 'react';
// import { Modal } from '@/components/ui/Modal';
// import { Input } from '@/components/ui/Input';
// import { Button } from '@/components/ui/Button';

// export const EditTaskModal = ({ isOpen, onClose, task, onUpdateTask }) => {
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [completed, setCompleted] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (task) {
//       setTitle(task.title || '');
//       setDescription(task.description || '');
//       setCompleted(task.completed || false);
//     }
//   }, [task]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
    
//     try {
//       await onUpdateTask(task.taskId, { title, description, completed });
//       onClose();
//     } catch (error) {
//       setError(error.message || 'Failed to update task. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClose = () => {
//     setTitle('');
//     setDescription('');
//     setCompleted(false);
//     setError('');
//     onClose();
//   };

//   if (!task) return null;

//   return (
//     <Modal 
//       isOpen={isOpen} 
//       onClose={handleClose}
//       title="Edit Task"
//     >
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <Input
//           label="Title"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           placeholder="Enter task title"
//           required
//         />
        
//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-gray-700">
//             Description
//           </label>
//           <textarea
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             placeholder="Enter task description"
//             rows={4}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
//             required
//           />
//         </div>
        
//         <div className="flex items-center space-x-2">
//           <input
//             type="checkbox"
//             id="completed"
//             checked={completed}
//             onChange={(e) => setCompleted(e.target.checked)}
//             className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//           />
//           <label 
//             htmlFor="completed"
//             className="text-sm font-medium text-gray-700 cursor-pointer"
//           >
//             Mark as completed
//           </label>
//         </div>

//         {error && (
//           <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
//             {error}
//           </div>
//         )}
        
//         <div className="flex gap-3 justify-end pt-4">
//           <Button
//             type="button"
//             variant="secondary"
//             onClick={handleClose}
//             disabled={loading}
//           >
//             Cancel
//           </Button>
//           <Button
//             type="submit"
//             disabled={loading}
//           >
//             {loading ? 'Updating...' : 'Update'}
//           </Button>
//         </div>
//       </form>
//     </Modal>
//   );
// };