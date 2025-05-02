import React, { useState } from 'react';
import Chart from './Chart';
import { Task } from '../../types';
import { Calendar, Star } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Button from '../ui/Button';

interface TaskOverviewProps {
  tasks: Task[];
}

const TaskOverview: React.FC<TaskOverviewProps> = ({ tasks }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'1D' | '1W' | '1M' | '6M' | '1Y' | '5Y' | 'ALL'>('1W');
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  // Get session ratings from localStorage
  const sessionRatings = React.useMemo(() => {
    const ratings = JSON.parse(localStorage.getItem('session_ratings') || '[]');
    return ratings.map((rating: any) => ({
      date: new Date(rating.date),
      rating: rating.rating,
      duration: rating.duration / 60, // Convert seconds to minutes
      notes: rating.notes
    }));
  }, []);

  const periods = [
    { value: '1D', label: 'Jour' },
    { value: '1W', label: 'Semaine' },
    { value: '1M', label: 'Mois' },
    { value: '6M', label: '6 mois' },
    { value: '1Y', label: '1 an' },
    { value: '5Y', label: '5 ans' },
    { value: 'ALL', label: 'Tout' }
  ] as const;

  return (
    <div className="space-y-6">      
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-dark-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-violet-500 dark:text-violet-400" />
              Progression des tâches
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Taux de complétion
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white ml-2">
                {completionRate}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-gray-100 dark:bg-dark-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-violet-500 dark:bg-violet-400 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {periods.map(period => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
        
        <Chart data={[]} type="line" showRatings={true} />
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-dark-700">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
            <Star className="w-5 h-5 mr-2 text-violet-500 dark:text-violet-400" />
            Historique des sessions
          </h3>
        </div>

        <div className="space-y-4">
          {sessionRatings.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aucune évaluation de session pour le moment
            </div>
          ) : (
            sessionRatings.sort((a, b) => b.date.getTime() - a.date.getTime()).map((session, index) => (
              <div 
                key={index}
                className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= session.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {session.duration} minutes
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {format(session.date, 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </span>
                </div>
                {session.notes && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                    {session.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskOverview;