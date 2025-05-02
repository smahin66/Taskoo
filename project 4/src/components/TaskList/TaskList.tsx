import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Filter, CheckSquare2, Clock, ListTodo } from 'lucide-react';
import TaskCard from './TaskCard';
import { Task, Category } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface TaskListProps {
  tasks: Task[];
  categories?: Category[];
  onTaskToggle: (id: string) => void;
  onTaskDelete: (id: string) => void;
  onTaskEdit: (task: Task) => void;
  onTimerStart?: (taskId: string) => void;
  onTimerPause?: (taskId: string) => void;
  onTimerStop?: (taskId: string) => void;
  filter?: string;
}

type FilterType = 'all' | 'active' | 'completed';

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  categories = [],
  onTaskToggle, 
  onTaskDelete, 
  onTaskEdit,
  onTimerStart,
  onTimerPause,
  onTimerStop,
  filter: categoryFilter
}) => {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  
  const filteredTasks = tasks
    .filter(task => {
      // Category filter
      if (categoryFilter && categoryFilter !== 'all') {
        if (task.category !== categoryFilter) return false;
      }
      
      // Status filter
      if (statusFilter === 'active') return !task.completed;
      if (statusFilter === 'completed') return task.completed;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const filterButtons: { id: FilterType; label: string; icon: typeof ListTodo }[] = [
    { id: 'all', label: 'Toutes', icon: ListTodo },
    { id: 'active', label: 'Actives', icon: Clock },
    { id: 'completed', label: 'Terminées', icon: CheckSquare2 }
  ];

  if (filteredTasks.length === 0) {
    return (
      <Card glass className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('no_tasks_found')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {categoryFilter !== 'all' 
            ? "Aucune tâche dans cette catégorie"
            : statusFilter === 'all' 
              ? t('no_tasks_yet')
              : t('no_tasks_filter')}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Status filter buttons */}
        <div className="flex items-center bg-gray-100 dark:bg-dark-700 rounded-xl p-1">
          {filterButtons.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={statusFilter === id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(id)}
              glass={statusFilter === id}
              className="relative"
            >
              <div className="flex items-center">
                <Icon className="w-4 h-4 mr-2" />
                {label}
                {id !== 'completed' && (
                  <span className="ml-2 bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-gray-300 text-xs px-1.5 rounded-full">
                    {tasks.filter(task => id === 'all' ? true : id === 'active' ? !task.completed : task.completed).length}
                  </span>
                )}
              </div>
            </Button>
          ))}
        </div>

        {/* Sort options */}
        <div className="flex items-center ml-auto">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Filter className="w-4 h-4" />}
            onClick={() => setSortBy(prev => prev === 'date' ? 'priority' : 'date')}
          >
            Trier par {sortBy === 'date' ? 'date' : 'priorité'}
          </Button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TaskCard
                task={task}
                categories={categories}
                onTaskToggle={onTaskToggle}
                onTaskDelete={onTaskDelete}
                onTaskEdit={onTaskEdit}
                onTimerStart={onTimerStart}
                onTimerPause={onTimerPause}
                onTimerStop={onTimerStop}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default TaskList;