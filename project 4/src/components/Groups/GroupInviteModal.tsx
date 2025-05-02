import React, { useState } from 'react';
import { X, Mail, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface GroupInviteModalProps {
  groupId: string;
  onClose: () => void;
}

const GroupInviteModal: React.FC<GroupInviteModalProps> = ({ groupId, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('L\'adresse email est requise');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Adresse email invalide');
      return;
    }

    try {
      setLoading(true);

      // Vérifier si l'utilisateur est déjà membre
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (existingMember) {
        setError('Cet utilisateur est déjà membre du groupe');
        return;
      }

      // Vérifier si une invitation est déjà en attente
      const { data: existingInvite } = await supabase
        .from('group_invites')
        .select('id, status')
        .eq('group_id', groupId)
        .eq('email', email)
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        setError('Une invitation est déjà en attente pour cette adresse email');
        return;
      }

      // Créer l'invitation
      const { error: inviteError } = await supabase
        .from('group_invites')
        .insert([{
          group_id: groupId,
          email: email.toLowerCase(),
          status: 'pending'
        }]);

      if (inviteError) throw inviteError;

      toast.success('Invitation envoyée avec succès');
      onClose();
    } catch (error: any) {
      console.error('Error sending invite:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'envoi de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl w-full max-w-md"
      >
        <div className="p-6 border-b border-gray-100 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-violet-100 dark:bg-violet-900/30 p-2.5 rounded-xl">
                <Mail className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Inviter un membre
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleInvite} className="p-6 space-y-6">
          <div>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="Adresse email"
              error={error}
              fullWidth
            />
            {error && (
              <div className="mt-2 flex items-center text-rose-500 dark:text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 mr-1.5" />
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={onClose}
              type="button"
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={loading}
            >
              Envoyer l'invitation
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default GroupInviteModal;