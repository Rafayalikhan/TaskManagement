import { Button } from '@/components/ui/Button';
import { CheckCircle2, Circle, Edit } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const TaskCard = ({ task, onEdit }) => {

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
            <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
          </div>
          
          {task.description && (
            <p className="text-gray-600 text-sm mb-3">{task.description}</p>
          )}
          
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              task.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {task.completed ? 'Completed' : 'Pending'}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(task.createdAt)}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => onEdit(task)}
          className="ml-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

