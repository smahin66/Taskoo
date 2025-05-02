import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlignLeft, Calendar, Tag, Flag, Plus, X, AlertTriangle } from 'lucide-react';
import { Task, Category } from '../../types';
import Button from '../ui/Button';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initialTask?: Task | null;
  categories: Category[];
}

const initialTaskState: Omit<Task, 'id' | 'createdAt'> = {
  title: '',
  description: '',
  completed: false,
  dueDate: null,
  category: '',
  priority: 'medium',
  timerDuration: undefined,
  timerStatus: 'not_started',
  workSessionDuration: undefined,
  blocked_resources: []
};

const TaskForm: React.FC<TaskFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialTask,
  categories
}) => {
  const [task, setTask] = useState<Omit<Task, 'id' | 'createdAt'>>(
    initialTask 
      ? { 
          title: initialTask.title, 
          description: initialTask.description, 
          completed: initialTask.completed, 
          dueDate: initialTask.dueDate, 
          category: initialTask.category,
          priority: initialTask.priority,
          timerDuration: initialTask.timerDuration,
          timerStatus: initialTask.timerStatus,
          workSessionDuration: initialTask.workSessionDuration,
          blocked_resources: []
        } 
      : initialTaskState
  );
  
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTask(prev => ({ ...prev, dueDate: value ? new Date(value) : null }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task.title.trim()) {
      setError('Le titre est requis');
      return;
    }
    
    onSubmit(task);
  };

  const priorityOptions = [
    { value: 'low', label: 'Basse', color: 'bg-emerald-500' },
    { value: 'medium', label: 'Moyenne', color: 'bg-amber-500' },
    { value: 'high', label: 'Haute', color: 'bg-rose-500' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl w-full max-w-lg"
      >
        <div className="p-6 border-b border-gray-100 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-violet-100 dark:bg-violet-900/30 p-2.5 rounded-xl">
                {initialTask ? (
                  <AlignLeft className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                ) : (
                  <Plus className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {initialTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titre */}
          <div>
            <div className="flex items-center mb-1.5">
              <AlignLeft className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre
              </label>
            </div>
            <input
              name="title"
              value={task.title}
              onChange={handleChange}
              placeholder="Entrez le titre de la tâche"
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 
              border ${error ? 'border-rose-300 dark:border-rose-500' : 'border-gray-200 dark:border-dark-600'}
              rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent
              transition-all duration-200`}
            />
            {error && (
              <p className="mt-1.5 text-sm text-rose-500 dark:text-rose-400 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {error}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center mb-1.5">
              <AlignLeft className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
            </div>
            <textarea
              name="description"
              value={task.description}
              onChange={handleChange}
              placeholder="Ajoutez une description détaillée"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 
              border border-gray-200 dark:border-dark-600 rounded-xl 
              text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent
              transition-all duration-200 min-h-[100px] resize-none"
            />
          </div>

          {/* Date et Priorité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center mb-1.5">
                <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date d'échéance
                </label>
              </div>
              <input
                type="date"
                name="dueDate"
                value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                onChange={handleDateChange}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 
                border border-gray-200 dark:border-dark-600 rounded-xl 
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent
                transition-all duration-200"
              />
            </div>

            <div>
              <div className="flex items-center mb-1.5">
                <Flag className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Priorité
                </label>
              </div>
              <div className="flex space-x-2">
                {priorityOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTask(prev => ({ ...prev, priority: option.value as 'low' | 'medium' | 'high' }))}
                    className={`flex-1 py-2 px-3 rounded-xl border transition-all duration-200 ${
                      task.priority === option.value
                        ? `${option.color} border-transparent text-white`
                        : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Catégorie */}
          <div>
            <div className="flex items-center mb-1.5">
              <Tag className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Catégorie
              </label>
            </div>
            <select
              name="category"
              value={task.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 
              border border-gray-200 dark:border-dark-600 rounded-xl 
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent
              transition-all duration-200"
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-dark-700">
            <Button 
              variant="ghost"
              onClick={onCancel}
            >
              Annuler
            </Button>
            <Button 
              variant="primary"
              type="submit"
            >
              {initialTask ? 'Mettre à jour' : 'Ajouter la tâche'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TaskForm;