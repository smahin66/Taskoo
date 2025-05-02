import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Trash2, Edit3, Timer, Play, Pause, StopCircle } from 'lucide-react';
import { Task, Category } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface TaskCardProps {
  task: Task;
  categories?: Category[];
  onTaskToggle: (id: string) => void;
  onTaskDelete: (id: string) => void;
  onTaskEdit: (task: Task) => void;
  onTimerStart?: (taskId: string) => void;
  onTimerPause?: (taskId: string) => void;
  onTimerStop?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  categories = [],
  onTaskToggle,
  onTaskDelete,
  onTaskEdit,
  onTimerStart,
  onTimerPause,
  onTimerStop
}) => {
  const { t } = useLanguage();
  const [remainingSeconds, setRemainingSeconds] = React.useState<number | null>(null);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  // Find category name
  const category = categories.find(cat => cat.id === task.category);

  React.useEffect(() => {
    let intervalId: number;

    if (task.timerStatus === 'running' && task.timerStartedAt && task.timerDuration) {
      const updateRemainingTime = () => {
        const startTime = new Date(task.timerStartedAt!).getTime();
        const currentTime = new Date().getTime();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        const remainingTime = (task.timerDuration! * 60) - elapsedSeconds;
        
        setRemainingSeconds(remainingTime > 0 ? remainingTime : 0);
      };

      updateRemainingTime();
      intervalId = window.setInterval(updateRemainingTime, 1000);
    } else if (task.timerStatus === 'not_started' && task.timerDuration) {
      setRemainingSeconds(task.timerDuration * 60);
    } else if (task.timerStatus === 'completed' || task.timerStatus === 'failed') {
      setRemainingSeconds(0);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [task.timerStatus, task.timerStartedAt, task.timerDuration]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h${minutes.toString().padStart(2, '0')}m${seconds.toString().padStart(2, '0')}s`;
    }
    return `${minutes}m${seconds.toString().padStart(2, '0')}s`;
  };

  const renderTimerControls = () => {
    if (!task.timerDuration) return null;

    return (
      <div className="flex items-center space-x-2">
        {task.timerStatus === 'not_started' && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTimerStart?.(task.id)}
            className="p-1.5 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-full transition-colors"
            title={t('start_timer')}
          >
            <Play className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </motion.button>
        )}
        
        {task.timerStatus === 'running' && (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTimerPause?.(task.id)}
              className="p-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-full transition-colors"
              title={t('pause_timer')}
            >
              <Pause className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTimerStop?.(task.id)}
              className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-full transition-colors"
              title={t('stop_timer')}
            >
              <StopCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </motion.button>
          </>
        )}
        
        {task.timerStatus === 'paused' && (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTimerStart?.(task.id)}
              className="p-1.5 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-full transition-colors"
              title={t('resume_timer')}
            >
              <Play className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTimerStop?.(task.id)}
              className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-full transition-colors"
              title={t('stop_timer')}
            >
              <StopCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </motion.button>
          </>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={task.completed ? 'opacity-70' : ''}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTaskToggle(task.id)}
                  className="mr-3 focus:outline-none"
                  aria-label={task.completed ? t('mark_incomplete') : t('mark_complete')}
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-6 w-6 text-primary-500 dark:text-primary-400" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  )}
                </motion.button>
                <div className="flex-1">
                  <h3 className={`font-medium text-gray-900 dark:text-white ${
                    task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
                  }`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center mt-2 flex-wrap gap-2">
                    <Badge 
                      variant={
                        task.priority === 'high' ? 'danger' :
                        task.priority === 'medium' ? 'warning' : 'success'
                      }
                    >
                      {t(task.priority)}
                    </Badge>
                    
                    {category && (
                      <Badge 
                        variant="default"
                        className="flex items-center gap-1"
                      >
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </Badge>
                    )}
                    
                    {task.dueDate && (
                      <Badge variant={isOverdue ? 'danger' : 'primary'}>
                        {isOverdue ? t('overdue') : t('due')}: {new Date(task.dueDate).toLocaleDateString()}
                      </Badge>
                    )}
                    
                    {task.timerDuration && remainingSeconds !== null && (
                      <Badge 
                        variant={
                          task.timerStatus === 'completed' ? 'success' :
                          task.timerStatus === 'failed' ? 'danger' :
                          task.timerStatus === 'running' ? 'primary' : 'default'
                        }
                      >
                        <Timer className="w-3 h-3 mr-1" />
                        {formatTime(remainingSeconds)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {renderTimerControls()}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTaskEdit(task)}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                aria-label={t('edit_task')}
              >
                <Edit3 className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTaskDelete(task.id)}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                aria-label={t('delete_task')}
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default TaskCard;