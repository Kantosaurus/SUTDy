'use client';

import React, { useState, useEffect } from 'react';
import Task, { TaskItem, RepeatOption } from './Task';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCalendar } from '../hooks/useCalendar';

const DEFAULT_TASK_TYPES = ['Assignment', 'Quiz', 'Exam', 'Project', 'Reading', 'Other'] as const;
const REPEAT_OPTIONS: { value: RepeatOption; label: string; icon: string }[] = [
  { 
    value: 'none', 
    label: 'No repeat',
    icon: 'M6 18L18 6M6 6l12 12'
  },
  { 
    value: 'weekly', 
    label: 'Weekly',
    icon: 'M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  },
  { 
    value: 'biweekly', 
    label: 'Every 2 weeks',
    icon: 'M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM12 12v6'
  },
  { 
    value: 'monthly', 
    label: 'Monthly',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
  },
  { 
    value: 'annually', 
    label: 'Annually',
    icon: 'M19 4h-1a2 2 0 01-2-2 1 1 0 00-1-1H9a1 1 0 00-1 1 2 2 0 01-2 2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z'
  },
];

const INITIAL_TASK_TYPE_ICONS: Record<string, string> = {
  Assignment: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  Quiz: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  Exam: 'M9 12h6m-6 4h6m-6-8h6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z',
  Project: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  Reading: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  Other: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',
};

export default function TaskList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addTaskToCalendar } = useCalendar();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [customTaskTypes, setCustomTaskTypes] = useState<string[]>([]);
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [taskTypeIcons, setTaskTypeIcons] = useState(INITIAL_TASK_TYPE_ICONS);
  const [newTask, setNewTask] = useState({
    title: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    taskType: 'Assignment',
    subject: '',
    repeat: 'none' as RepeatOption,
  });
  const [showForm, setShowForm] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showRepeatDropdown, setShowRepeatDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [taskTypeInput, setTaskTypeInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Don't render anything while checking authentication
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Don't render if not authenticated
  if (!session?.user) {
    return null;
  }

  // Load saved custom options from localStorage on component mount
  useEffect(() => {
    const savedTaskTypes = localStorage.getItem('customTaskTypes');
    const savedSubjects = localStorage.getItem('customSubjects');
    const savedTaskTypeIcons = localStorage.getItem('taskTypeIcons');

    if (savedTaskTypes) setCustomTaskTypes(JSON.parse(savedTaskTypes));
    if (savedSubjects) setCustomSubjects(JSON.parse(savedSubjects));
    if (savedTaskTypeIcons) setTaskTypeIcons(JSON.parse(savedTaskTypeIcons));
  }, []);

  // Save custom options to localStorage when they change
  useEffect(() => {
    localStorage.setItem('customTaskTypes', JSON.stringify(customTaskTypes));
    localStorage.setItem('customSubjects', JSON.stringify(customSubjects));
    localStorage.setItem('taskTypeIcons', JSON.stringify(taskTypeIcons));
  }, [customTaskTypes, customSubjects, taskTypeIcons]);

  const allTaskTypes = [...DEFAULT_TASK_TYPES, ...customTaskTypes];
  
  const handleAddCustomTaskType = (newType: string) => {
    if (!allTaskTypes.includes(newType)) {
      setCustomTaskTypes(prev => [...prev, newType]);
      setTaskTypeIcons(prev => ({
        ...prev,
        [newType]: INITIAL_TASK_TYPE_ICONS.Other // Use 'Other' icon for custom types
      }));
    }
  };

  const handleAddCustomSubject = (newSubject: string) => {
    if (!customSubjects.includes(newSubject)) {
      setCustomSubjects(prev => [...prev, newSubject]);
    }
  };

  // Load tasks from MongoDB
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        setTasks(data.map((task: any) => ({
          ...task,
          startDate: new Date(task.startDate),
          endDate: new Date(task.endDate),
          createdAt: new Date(task.createdAt)
        })));
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    if (session?.user) {
      fetchTasks();
    }
  }, [session]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.endDate || !newTask.subject) return;

    try {
      const taskData = {
        title: newTask.title.trim(),
        completed: false,
        startDate: newTask.startDate ? new Date(newTask.startDate) : new Date(),
        endDate: new Date(newTask.endDate),
        taskType: newTask.taskType,
        subject: newTask.subject.trim(),
        repeat: newTask.repeat,
      };

      // First, create the task in MongoDB
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include credentials for session
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }
      
      const savedTask = await response.json();
      
      // Then, add the task to Google Calendar
      try {
        await addTaskToCalendar({
          title: savedTask.title,
          startDate: new Date(savedTask.endDate),
          endDate: new Date(savedTask.endDate),
          description: `${savedTask.taskType} - ${savedTask.subject}`,
          repeat: savedTask.repeat,
        });
      } catch (calendarError) {
        console.error('Failed to add task to calendar:', calendarError);
        // Continue even if calendar addition fails
      }

      // Update the local state with the new task
      setTasks(prev => [
        {
          ...savedTask,
          startDate: new Date(savedTask.startDate),
          endDate: new Date(savedTask.endDate),
          createdAt: new Date(savedTask.createdAt)
        },
        ...prev
      ]);

      // Reset the form
      setNewTask({
        title: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        taskType: 'Assignment',
        subject: '',
        repeat: 'none',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert(error instanceof Error ? error.message : 'Failed to create task. Please try again.');
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          completed: !task.completed,
        }),
      });

      if (!response.ok) throw new Error('Failed to update task');

      setTasks(prev =>
        prev.map(task =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete task');

      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 rounded-xl bg-black/60 backdrop-blur-xl text-white hover:bg-black/50 transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Task</span>
        </button>
      ) : (
        <form onSubmit={handleAddTask} className="mb-6 bg-white/30 backdrop-blur-xl rounded-xl p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Task Name*
              </label>
              <input
                type="text"
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task name"
                className="w-full px-4 py-2 rounded-lg bg-white/50 border-0 focus:border-0 focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={newTask.startDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/50 border-0 focus:border-0 focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date*
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={newTask.endDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/50 border-0 focus:border-0 focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="taskType" className="block text-sm font-medium text-gray-700 mb-1">
                  Task Type*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="taskType"
                    value={taskTypeInput || newTask.taskType}
                    onChange={(e) => {
                      setTaskTypeInput(e.target.value);
                      setShowTypeDropdown(true);
                    }}
                    onFocus={() => setShowTypeDropdown(true)}
                    className="w-full px-4 py-2 rounded-lg bg-white/50 border-0 focus:border-0 focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <svg 
                      className={`w-4 h-4 text-gray-600 transition-all duration-300 ${showTypeDropdown ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div 
                  className={`absolute z-10 w-full mt-1 overflow-hidden transition-all duration-300 ease-out ${
                    showTypeDropdown 
                      ? 'opacity-100 max-h-[300px] translate-y-0' 
                      : 'opacity-0 max-h-0 -translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                    {allTaskTypes
                      .filter(type => type.toLowerCase().includes(taskTypeInput.toLowerCase()))
                      .map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setNewTask(prev => ({ ...prev, taskType: type }));
                            setTaskTypeInput('');
                            setShowTypeDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-50 transition-colors group"
                        >
                          <svg className={`w-4 h-4 transition-colors ${newTask.taskType === type ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={taskTypeIcons[type]} />
                          </svg>
                          <span className={`transition-colors ${newTask.taskType === type ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'}`}>{type}</span>
                        </button>
                    ))}
                    {taskTypeInput && !allTaskTypes.includes(taskTypeInput) && (
                      <button
                        type="button"
                        onClick={() => {
                          handleAddCustomTaskType(taskTypeInput);
                          setNewTask(prev => ({ ...prev, taskType: taskTypeInput }));
                          setTaskTypeInput('');
                          setShowTypeDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-50 transition-colors text-blue-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add "{taskTypeInput}"</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="subject"
                    value={subjectInput || newTask.subject}
                    onChange={(e) => {
                      setSubjectInput(e.target.value);
                      setShowSubjectDropdown(true);
                    }}
                    onFocus={() => setShowSubjectDropdown(true)}
                    className="w-full px-4 py-2 rounded-lg bg-white/50 border-0 focus:border-0 focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <svg 
                      className={`w-4 h-4 text-gray-600 transition-all duration-300 ${showSubjectDropdown ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div 
                  className={`absolute z-10 w-full mt-1 overflow-hidden transition-all duration-300 ease-out ${
                    showSubjectDropdown 
                      ? 'opacity-100 max-h-[300px] translate-y-0' 
                      : 'opacity-0 max-h-0 -translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                    {customSubjects
                      .filter(subject => subject.toLowerCase().includes(subjectInput.toLowerCase()))
                      .map(subject => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => {
                            setNewTask(prev => ({ ...prev, subject }));
                            setSubjectInput('');
                            setShowSubjectDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                        >
                          {subject}
                        </button>
                    ))}
                    {subjectInput && !customSubjects.includes(subjectInput) && (
                      <button
                        type="button"
                        onClick={() => {
                          handleAddCustomSubject(subjectInput);
                          setNewTask(prev => ({ ...prev, subject: subjectInput }));
                          setSubjectInput('');
                          setShowSubjectDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-50 transition-colors text-blue-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add "{subjectInput}"</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <label htmlFor="repeat" className="block text-sm font-medium text-gray-700 mb-1">
                Repeat
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowRepeatDropdown(!showRepeatDropdown);
                  setShowTypeDropdown(false);
                }}
                className="w-full px-4 py-2 rounded-lg bg-white/50 border-0 focus:border-0 focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-600 transition-colors group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={REPEAT_OPTIONS.find(opt => opt.value === newTask.repeat)?.icon} />
                  </svg>
                  <span className="transition-colors group-hover:text-gray-900">{REPEAT_OPTIONS.find(opt => opt.value === newTask.repeat)?.label}</span>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-600 transition-all duration-300 group-hover:text-gray-900 ${showRepeatDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div 
                className={`absolute z-10 w-full mt-1 overflow-hidden transition-all duration-300 ease-out ${
                  showRepeatDropdown 
                    ? 'opacity-100 max-h-[300px] translate-y-0' 
                    : 'opacity-0 max-h-0 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                  {REPEAT_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setNewTask(prev => ({ ...prev, repeat: option.value }));
                        setShowRepeatDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-50 transition-colors group"
                    >
                      <svg className={`w-4 h-4 transition-colors ${newTask.repeat === option.value ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={option.icon} />
                      </svg>
                      <span className={`transition-colors ${newTask.repeat === option.value ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'}`}>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
              >
                Add Task
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-2 mt-6">
        {tasks.length > 0 ? (
          tasks
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map(task => (
              <Task
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
              />
            ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No tasks yet. Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
} 