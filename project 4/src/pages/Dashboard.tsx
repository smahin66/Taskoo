import React from 'react';
import { motion } from 'framer-motion';
import { Task } from '../types';
import TaskOverview from '../components/Dashboard/TaskOverview';
import Card from '../components/ui/Card';
import { 
  Activity, 
  Calendar, 
  Clock, 
  Target,
  Bird
} from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const recentActivity = tasks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="bento-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {/* Welcome Card - Spans full width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bento-card p-6 col-span-full"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-violet-900 dark:text-violet-100 mb-2">
              Tableau de bord
            </h1>
            <p className="text-violet-600 dark:text-violet-300">
              Voici un aperçu de votre progression
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-violet-600 dark:text-violet-300">Taux de complétion</p>
              <p className="text-2xl font-bold gradient-text">{completionRate}%</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-400 flex items-center justify-center">
              <Bird className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="bento-card p-6 bg-gradient-to-br from-violet-500 to-violet-400 dark:from-violet-600 dark:to-violet-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80">Total</p>
            <p className="text-2xl font-bold text-white mt-1">{totalTasks}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <div className="bento-card p-6 bg-gradient-to-br from-violet-500 to-violet-400 dark:from-violet-600 dark:to-violet-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80">Terminées</p>
            <p className="text-2xl font-bold text-white mt-1">{completedTasks}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <div className="bento-card p-6 bg-gradient-to-br from-violet-500 to-violet-400 dark:from-violet-600 dark:to-violet-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80">En cours</p>
            <p className="text-2xl font-bold text-white mt-1">{totalTasks - completedTasks}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <div className="bento-card p-6 bg-gradient-to-br from-violet-500 to-violet-400 dark:from-violet-600 dark:to-violet-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80">Cette semaine</p>
            <p className="text-2xl font-bold text-white mt-1">
              {tasks.filter(task => {
                const taskDate = new Date(task.createdAt);
                const today = new Date();
                const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                return taskDate >= weekStart;
              }).length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Charts Section - Spans full width */}
      <div className="col-span-full">
        <div className="bento-card">
          <TaskOverview tasks={tasks} />
        </div>
      </div>

      {/* Activity Feed */}
      <div className="col-span-full">
        <div className="bento-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-violet-900 dark:text-violet-100 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-violet-500" />
              Activité récente
            </h2>
            <span className="text-sm text-violet-500 dark:text-violet-400">
              Dernières 24h
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentActivity.map(task => (
              <div 
                key={task.id}
                className="flex items-center p-3 rounded-xl bg-violet-50 dark:bg-violet-900/30"
              >
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  task.completed 
                    ? 'bg-violet-500' 
                    : 'bg-violet-300'
                }`} />
                <div>
                  <p className="text-sm font-medium text-violet-900 dark:text-violet-100">
                    {task.title}
                  </p>
                  <p className="text-xs text-violet-500 dark:text-violet-400">
                    {new Date(task.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;