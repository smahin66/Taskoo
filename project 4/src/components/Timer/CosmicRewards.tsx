import React from 'react';
import { motion } from 'framer-motion';
import { Star, Lock } from 'lucide-react';
import { useFocusStore } from '../../stores/focusStore';

const CosmicRewards: React.FC = () => {
  const { rewards, totalFocusMinutes } = useFocusStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100">
            Votre Univers Cosmique
          </h3>
          <p className="text-sm text-violet-600 dark:text-violet-300">
            {totalFocusMinutes} minutes de concentration
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="w-5 h-5 text-violet-500 dark:text-violet-400" />
          <span className="text-sm font-medium text-violet-600 dark:text-violet-300">
            {rewards.filter(r => r.unlocked).length} / {rewards.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-xl ${
              reward.unlocked
                ? 'ring-2 ring-violet-500/20 dark:ring-violet-400/20'
                : 'grayscale opacity-50'
            }`}
          >
            <img
              src={reward.imageUrl}
              alt={reward.name}
              className="w-full h-48 object-cover"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-violet-900/80 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-white font-medium mb-1">
                    {reward.name}
                  </h4>
                  <p className="text-violet-200 text-sm">
                    {reward.description}
                  </p>
                </div>
                {!reward.unlocked && (
                  <div className="flex items-center bg-violet-800/80 rounded-full px-3 py-1">
                    <Lock className="w-4 h-4 text-violet-200 mr-1" />
                    <span className="text-sm text-violet-200">
                      {reward.requiredMinutes}m
                    </span>
                  </div>
                )}
              </div>
            </div>

            {reward.unlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 bg-violet-500 dark:bg-violet-400 rounded-full p-1"
              >
                <Star className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CosmicRewards;