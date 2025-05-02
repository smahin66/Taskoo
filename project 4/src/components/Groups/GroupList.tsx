import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Mail } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { Group, GroupInvite } from '../../types';
import Button from '../ui/Button';
import GroupInviteModal from './GroupInviteModal';
import GroupInvites from './GroupInvites';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
    loadInvites();
  }, []);

  const loadGroups = async () => {
    try {
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          description,
          created_at,
          owner_id
        `);

      if (groupsError) throw groupsError;
      setGroups(groupsData || []);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Erreur lors du chargement des groupes');
    } finally {
      setLoading(false);
    }
  };

  const loadInvites = async () => {
    try {
      const { data: invitesData, error: invitesError } = await supabase
        .from('group_invites')
        .select('*')
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      if (invitesError) throw invitesError;
      setInvites(invitesData || []);
    } catch (error) {
      console.error('Error loading invites:', error);
      toast.error('Erreur lors du chargement des invitations');
    }
  };

  const handleCreateGroup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const groupName = prompt('Nom du groupe:');
      if (!groupName) return;

      const { error } = await supabase
        .from('groups')
        .insert([{
          name: groupName,
          owner_id: user.id
        }]);

      if (error) throw error;

      toast.success('Groupe créé avec succès');
      loadGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Erreur lors de la création du groupe');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-violet-100 dark:bg-violet-900/30 p-2.5 rounded-xl">
            <Users className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Groupes
          </h2>
        </div>
        <Button
          variant="primary"
          onClick={handleCreateGroup}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Créer un groupe
        </Button>
      </div>

      {invites.length > 0 && (
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-gray-100 dark:border-dark-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Mail className="w-5 h-5 mr-2 text-violet-500 dark:text-violet-400" />
              Invitations en attente
            </h3>
          </div>
          <GroupInvites 
            invites={invites} 
            onInviteAction={loadInvites} 
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-gray-100 dark:border-dark-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {group.name}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedGroupId(group.id);
                  setShowInviteModal(true);
                }}
              >
                <Mail className="w-4 h-4" />
              </Button>
            </div>
            {group.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {group.description}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {showInviteModal && selectedGroupId && (
        <GroupInviteModal
          groupId={selectedGroupId}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedGroupId(null);
          }}
        />
      )}
    </div>
  );
};

export default GroupList;