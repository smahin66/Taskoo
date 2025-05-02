import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import TaskList from './components/TaskList/TaskList';
import TaskForm from './components/TaskForm/TaskForm';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './components/KanbanBoard/KanbanBoard';
import WeeklyView from './components/WeeklyView/WeeklyView';
import TimerPage from './components/Timer/TimerPage';
import FocusPage from './pages/FocusPage';
import SplashScreen from './components/SplashScreen';
import AuthPage from './components/auth/AuthPage';
import LandingPage from './pages/LandingPage';
import SettingsPage from './components/Settings/SettingsPage';
import Navbar from './components/Navbar/Navbar';
import { Task, Category } from './types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isTimerFullscreen, setIsTimerFullscreen] = useState(false);

  const loadCategories = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
      } else {
        setCategories(categoriesData || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      } else {
        setTasks(tasksData || []);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);

        if (session) {
          await loadTasks();
          await loadCategories();
        }

        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
        setTheme(savedTheme);
      } catch (error) {
        console.error('Error during initial load:', error);
      } finally {
        setIsLoading(false);
        setInitialLoad(false);
      }
    };

    loadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setTasks([]);
        setCategories([]);
        setShowAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleToggleTask = async (taskId: string) => {
    try {
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate) return;

      const { error } = await supabase
        .from('tasks')
        .update({ completed: !taskToUpdate.completed })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, completed: !task.completed } 
            : task
        )
      );
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleUpdateTask = async (updatedTask: Omit<Task, 'id' | 'createdAt'>) => {
    if (!editingTask?.id || editingTask.id.toString().startsWith('temp-')) {
      await handleAddTask(updatedTask);
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update(updatedTask)
        .eq('id', editingTask.id);

      if (error) throw error;

      await loadTasks(); // Recharger toutes les tâches après la mise à jour

      setEditingTask(null);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleAddTask = async (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...newTask,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      await loadTasks(); // Recharger toutes les tâches après l'ajout

      setShowTaskForm(false);
      setEditingTask(null);

      if (activeTab === 'dashboard') {
        setActiveTab('all');
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleTimerStart = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          timerStartedAt: new Date().toISOString(),
          timerStatus: 'running'
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                timerStartedAt: new Date(),
                timerStatus: 'running'
              }
            : task
        )
      );
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  };

  const handleTimerPause = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          timerStatus: 'paused'
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                timerStatus: 'paused'
              }
            : task
        )
      );
    } catch (error) {
      console.error('Error pausing timer:', error);
    }
  };

  const handleTimerStop = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          timerStatus: 'completed',
          completed: true
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                timerStatus: 'completed',
                completed: true
              }
            : task
        )
      );
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const renderMainContent = () => {
    if (activeTab === 'dashboard') {
      return <Dashboard tasks={tasks} />;
    }
    
    if (activeTab === 'weekly') {
      return (
        <WeeklyView
          tasks={tasks}
          onTaskToggle={handleToggleTask}
          onTaskDelete={handleDeleteTask}
          onTaskEdit={handleEditTask}
          onTimerStart={handleTimerStart}
          onTimerPause={handleTimerPause}
          onTimerStop={handleTimerStop}
        />
      );
    }
    
    if (activeTab === 'timer') {
      return (
        <TimerPage
          isFullscreen={isTimerFullscreen}
          onToggleFullscreen={() => setIsTimerFullscreen(!isTimerFullscreen)}
        />
      );
    }

    if (activeTab === 'focus') {
      return <FocusPage />;
    }

    if (activeTab === 'settings') {
      return <SettingsPage />;
    }
    
    return (
      <div className="p-6">
        <TaskList
          tasks={tasks}
          onTaskToggle={handleToggleTask}
          onTaskDelete={handleDeleteTask}
          onTaskEdit={handleEditTask}
          onTimerStart={handleTimerStart}
          onTimerPause={handleTimerPause}
          onTimerStop={handleTimerStop}
          filter={activeTab}
        />
      </div>
    );
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        {showAuth ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AuthPage onAuthSuccess={() => setIsAuthenticated(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Navbar 
              theme={theme}
              onToggleTheme={toggleTheme}
              onLogin={() => setShowAuth(true)}
            />
            <LandingPage onGetStarted={() => setShowAuth(true)} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.div 
      className="flex flex-col h-screen bg-gradient-to-br from-violet-50 via-violet-50/50 to-violet-50 dark:from-dark-900 dark:via-dark-950 dark:to-dark-900 transition-colors duration-200"
      initial={initialLoad ? { opacity: 0 } : false}
      animate={initialLoad ? { opacity: 1 } : false}
    >
      <Toaster position="top-right" />
      
      {!isTimerFullscreen && (
        <Header 
          onAddTask={() => {
            setEditingTask(null);
            setShowTaskForm(true);
          }}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {!isTimerFullscreen && (
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            categories={categories}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
        
        <motion.main 
          className="flex-1 overflow-y-auto"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {showTaskForm && !isTimerFullscreen && (
            <div className="px-6 pt-6">
              <TaskForm 
                onSubmit={handleUpdateTask}
                onCancel={() => {
                  setShowTaskForm(false);
                  setEditingTask(null);
                }}
                initialTask={editingTask}
                categories={categories}
              />
            </div>
          )}
          
          {renderMainContent()}
        </motion.main>
      </div>
    </motion.div>
  );
}

export default App;