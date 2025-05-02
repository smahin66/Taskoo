import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { GroupInvite } from '../../types';
import Button from '../ui/Button';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface GroupInvitesProps {
  invites: GroupInvite[];
  onInviteAction: () => void;
}

const GroupInvites: React.FC<GroupInvitesProps> = ({ invites, onInviteAction }) => {
  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const { data: invite } = await supabase
        .from('group_invites')
        .select('group_id')
        .eq('id', inviteId)
        .single();

      if (!invite) {
        toast.error('Invitation introuvable');
        return;
      }

      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{
          group_id: invite.group_id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          role: 'member'
        }]);

      if (memberError) throw memberError;

      const { error: inviteError } = await supabase
        .from('group_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      if (inviteError) throw inviteError;

      toast.success('Invitation acceptée');
      onInviteAction();
    } catch (error: any) {
      console.error('Error accepting invite:', error);
      toast.error('Erreur lors de l\'acceptation de l\'invitation');
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('group_invites')
        .update({ status: 'declined' })
        .eq('id', inviteId);

      if (error) throw error;

      toast.success('Invitation refusée');
      onInviteAction();
    } catch (error: any) {
      console.error('Error declining invite:', error);
      toast.error('Erreur lors du refus de l\'invitation');
    }
  };

  if (invites.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          Aucune invitation en attente
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invites.map((invite) => (
        <motion.div
          key={invite.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-gray-100 dark:border-dark-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Expire le {format(new Date(invite.expires_at), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeclineInvite(invite.id)}
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAcceptInvite(invite.id)}
              >
                <Check className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default GroupInvites;