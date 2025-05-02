import React from 'react';
import { Home, ListTodo, Settings, Calendar, Timer, Focus, AArrowDown as Owl } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Category } from '../../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  categories,
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  
  const mainNavItems = [
    { id: 'dashboard', label: t('dashboard'), icon: Home },
    { id: 'all', label: t('all_tasks'), icon: ListTodo },
    { id: 'weekly', label: t('weekly'), icon: Calendar },
    { id: 'timer', label: 'Timer', icon: Timer },
    { id: 'focus', label: 'Focus', icon: Focus },
  ];
  
  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    if (window.innerWidth < 768) {
      onClose();
    }
  };
  
  return (
    <>
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={onClose}
        ></div>
      )}
    
      <aside 
        className={`
          fixed md:sticky top-0 bottom-0 left-0 z-20
          w-64 h-screen md:h-[calc(100vh-4rem)] 
          bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl
          border-r border-white/20 dark:border-dark-700/20
          shadow-xl shadow-violet-500/5
          overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 sticky top-0 bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl z-10 border-b border-white/20 dark:border-dark-700/20">
          <h2 className="text-xl font-semibold gradient-text flex items-center">
            <Owl className="w-6 h-6 mr-2 text-violet-500 dark:text-violet-400" />
            Tasko
          </h2>
        </div>
        
        <nav className="px-3 py-4">
          <div className="mb-6">
            <ul>
              {mainNavItems.map(item => {
                const Icon = item.icon;
                return (
                  <li key={item.id} className="mb-1">
                    <button
                      onClick={() => handleTabClick(item.id)}
                      className={`
                        w-full flex items-center px-3 py-2.5 text-sm rounded-xl
                        transition-colors duration-200
                        ${activeTab === item.id 
                          ? 'bg-gradient-to-r from-violet-500/10 to-violet-400/10 dark:from-violet-500/20 dark:to-violet-400/20 text-violet-700 dark:text-violet-300 font-medium' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'}
                      `}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          
          {categories.length > 0 && (
            <div>
              <p className="px-3 mb-2 text-xs font-medium text-violet-500 dark:text-violet-400 uppercase tracking-wider">
                {t('categories')}
              </p>
              <ul>
                {categories.map(category => (
                  <li key={category.id} className="mb-1">
                    <button
                      onClick={() => handleTabClick(category.id)}
                      className={`
                        w-full flex items-center px-3 py-2.5 text-sm rounded-xl
                        transition-colors duration-200
                        ${activeTab === category.id 
                          ? 'bg-gradient-to-r from-violet-500/10 to-violet-400/10 dark:from-violet-500/20 dark:to-violet-400/20 text-violet-700 dark:text-violet-300 font-medium' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'}
                      `}
                    >
                      <div 
                        className="w-5 h-5 mr-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-6">
            <button
              onClick={() => handleTabClick('settings')}
              className={`
                w-full flex items-center px-3 py-2.5 text-sm rounded-xl
                transition-colors duration-200
                ${activeTab === 'settings'
                  ? 'bg-gradient-to-r from-violet-500/10 to-violet-400/10 dark:from-violet-500/20 dark:to-violet-400/20 text-violet-700 dark:text-violet-300 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'}
              `}
            >
              <Settings className="h-5 w-5 mr-3" />
              {t('settings')}
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;