import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { AArrowDown as Owl, Wand2, Palette, Crown, Star, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Card from '../ui/Card';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const owlColors = [
  { name: 'Brun', value: 'brown', class: 'bg-amber-800' },
  { name: 'Gris', value: 'grey', class: 'bg-gray-500' },
  { name: 'Blanc', value: 'white', class: 'bg-gray-100' },
  { name: 'Noir', value: 'black', class: 'bg-gray-900' },
  { name: 'Doré', value: 'golden', class: 'bg-amber-400' },
];

interface OwlCustomizationPageProps {
  onComplete: () => void;
}

const OwlCustomizationPage: React.FC<OwlCustomizationPageProps> = ({ onComplete }) => {
  const [selectedColor, setSelectedColor] = useState(owlColors[0].value);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      const owlData = {
        color: selectedColor,
        accessories: [],
        evolution_stage: 'egg',
        experience_points: 0,
        reliability_score: 0,
        last_evaluation: null,
        family: {
          has_partner: false,
          children: []
        }
      };

      const { error } = await supabase
        .from('profiles')
        .update({ owl_customization: owlData })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Votre hibou a été créé avec succès !');
      onComplete();
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
      console.error('Error saving owl:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950 dark:via-orange-950 dark:to-amber-950 p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center">
                    <Owl className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Créez votre compagnon hibou
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Votre hibou évoluera avec vous au fil de vos accomplissements
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Choisissez la couleur de votre hibou
                </label>
                <div className="grid grid-cols-5 gap-4">
                  {owlColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`
                        w-full aspect-square rounded-xl transition-all duration-200
                        ${color.class}
                        ${selectedColor === color.value 
                          ? 'ring-4 ring-amber-500 dark:ring-amber-400 scale-110' 
                          : 'hover:scale-105'
                        }
                      `}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  variant="primary"
                  onClick={() => setStep(2)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continuer
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-violet-500 rounded-full flex items-center justify-center">
                    <Wand2 className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  La magie commence
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Votre hibou commencera son voyage sous forme d'œuf
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4 text-center">
                  <Palette className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Personnalisation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Débloquez de nouveaux accessoires
                  </p>
                </Card>

                <Card className="p-4 text-center">
                  <Crown className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Évolution</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Regardez votre hibou grandir
                  </p>
                </Card>

                <Card className="p-4 text-center">
                  <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Récompenses</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gagnez des points et des bonus
                  </p>
                </Card>
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                >
                  Retour
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  loading={loading}
                >
                  Commencer l'aventure
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default OwlCustomizationPage;