import React from 'react';

export type RepeatOption = 'none' | 'weekly' | 'biweekly' | 'monthly' | 'annually';

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  startDate: Date;
  endDate: Date;
  taskType: string;
  subject: string;
  repeat: RepeatOption;
  createdAt: Date;
}

interface TaskProps {
  task: TaskItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function Task({ task, onToggle, onDelete }: TaskProps) {
  const isOverdue = new Date() > new Date(task.endDate) && !task.completed;

  const getRepeatText = (repeat: RepeatOption) => {
    switch (repeat) {
      case 'weekly':
        return 'Repeats weekly';
      case 'biweekly':
        return 'Repeats every 2 weeks';
      case 'monthly':
        return 'Repeats monthly';
      case 'annually':
        return 'Repeats annually';
      default:
        return '';
    }
  };

  return (
    <div className={`group flex items-center justify-between p-4 bg-white/30 backdrop-blur-xl rounded-xl shadow-sm hover:bg-white/40 transition-colors ${isOverdue ? 'border-l-4 border-red-500' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onToggle(task.id)}
            className="relative flex-shrink-0 w-5 h-5 flex items-center justify-center"
          >
            <div className={`w-5 h-5 border-2 rounded-md transition-colors ${task.completed ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`} />
            {task.completed && (
              <svg
                className="absolute w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium truncate ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {task.title}
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                {task.subject}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {task.taskType}
              </span>
              {task.repeat !== 'none' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  {getRepeatText(task.repeat)}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
              <span>Due: {new Date(task.endDate).toLocaleDateString()}</span>
              {isOverdue && !task.completed && (
                <span className="text-red-500 font-medium">Overdue</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/50 rounded-full text-red-500 transition-all ml-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
} 