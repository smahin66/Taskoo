import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, X, Globe2, Tag, Upload, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useLanguage } from '../../contexts/LanguageContext';
import CategoryManager from '../CategoryManager/CategoryManager';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface ProfilePageProps {
  onClose: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'owl1', url: 'https://images.pexels.com/photos/86596/owl-bird-eyes-eagle-owl-86596.jpeg' },
  { id: 'owl2', url: 'https://images.pexels.com/photos/3608263/pexels-photo-3608263.jpeg' },
  { id: 'owl3', url: 'https://images.pexels.com/photos/2115984/pexels-photo-2115984.jpeg' },
  { id: 'owl4', url: 'https://images.pexels.com/photos/3690509/pexels-photo-3690509.jpeg' }
];

const ProfilePage: React.FC<ProfilePageProps> = ({ onClose }) => {
  const { t, language, setLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Utilisateur non authentifié');
        }

        setUser(user);
        setEmail(user.email || '');

        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!existingProfile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              username: '',
              avatar_url: AVATAR_OPTIONS[0].url,
              updated_at: new Date().toISOString()
            }]);

          if (insertError) throw insertError;

          setUsername('');
          setAvatarUrl(AVATAR_OPTIONS[0].url);
          toast.success('Profil créé avec succès');
        } else {
          setUsername(existingProfile.username || '');
          setAvatarUrl(existingProfile.avatar_url || AVATAR_OPTIONS[0].url);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement du profil:', error);
        toast.error(error.message || 'Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);

      if (!username.trim()) {
        throw new Error("Le nom d'utilisateur ne peut pas être vide");
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profil mis à jour avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la déconnexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAvatar = async (url: string) => {
    setAvatarUrl(url);
    setShowAvatarSelector(false);
  };

  if (loading && !user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{t('profile')}</h2>

        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div 
              className="w-24 h-24 rounded-full overflow-hidden bg-violet-100 dark:bg-violet-900/30"
              style={{
                backgroundImage: `url(${avatarUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <button
              onClick={() => setShowAvatarSelector(true)}
              className="absolute bottom-0 right-0 p-2 bg-violet-500 dark:bg-violet-400 rounded-full text-white hover:bg-violet-600 dark:hover:bg-violet-500 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label={t('email')}
            value={email}
            disabled
            fullWidth
          />

          <Input
            label={t('username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('username')}
            fullWidth
            disabled={loading}
          />

          <div className="flex items-center space-x-2">
            <Globe2 className="w-5 h-5 text-gray-500" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'fr' | 'en' | 'es')}
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>

          <button
            onClick={() => setShowCategoryManager(true)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-dark-700 rounded-xl text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors duration-200"
          >
            <div className="flex items-center">
              <Tag className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
              <span>Gérer les catégories</span>
            </div>
            <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
          </button>

          <div className="flex space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={handleSignOut}
              fullWidth
              disabled={loading}
            >
              {t('sign_out')}
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateProfile}
              fullWidth
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                t('update')
              )}
            </Button>
          </div>
        </div>
      </div>

      {showCategoryManager && (
        <CategoryManager
          onClose={() => setShowCategoryManager(false)}
          onCategoryChange={() => {
            setShowCategoryManager(false);
            window.location.reload();
          }}
        />
      )}

      {showAvatarSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Choisir un avatar
              </h3>
              <button
                onClick={() => setShowAvatarSelector(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleSelectAvatar(avatar.url)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    avatarUrl === avatar.url
                      ? 'border-violet-500 dark:border-violet-400 scale-95'
                      : 'border-transparent hover:border-violet-300 dark:hover:border-violet-600'
                  }`}
                >
                  <img
                    src={avatar.url}
                    alt="Avatar option"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;