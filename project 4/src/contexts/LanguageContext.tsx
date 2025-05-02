import React, { createContext, useContext, useState } from 'react';

type Language = 'fr' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    'app.title': 'Tasko',
    'dashboard': 'Tableau de bord',
    'all_tasks': 'Toutes les tâches',
    'active': 'En cours',
    'completed': 'Terminées',
    'categories': 'Catégories',
    'settings': 'Paramètres',
    'add_task': 'Nouvelle tâche',
    'search': 'Rechercher',
    'profile': 'Profil',
    'sign_out': 'Déconnexion',
    'update': 'Mettre à jour',
    'cancel': 'Annuler',
    'username': "Nom d'utilisateur",
    'email': 'Email',
    'language': 'Langue',
    'select_language': 'Sélectionner la langue',
    'sign_in': 'Se connecter',
    'sign_up': "S'inscrire",
    'password': 'Mot de passe',
    'confirm_password': 'Confirmer le mot de passe',
    'enter_email': 'Entrez votre email',
    'enter_password': 'Entrez votre mot de passe',
    'or_continue_with': 'Ou continuer avec',
    'already_have_account': 'Déjà un compte ? Se connecter',
    'no_account': "Pas de compte ? S'inscrire",
    'passwords_not_match': 'Les mots de passe ne correspondent pas',
    'password_min_length': 'Le mot de passe doit contenir au moins 6 caractères',
    'account_created': 'Compte créé avec succès !',
    'login_success': 'Connexion réussie !',
    'organize_efficiently': 'Organisez vos tâches simplement',
    'invalid_credentials': 'Email ou mot de passe incorrect',
    'invalid_email': 'Adresse email invalide',
    'network_error': 'Erreur de connexion au serveur',
    'unknown_error': 'Une erreur est survenue',
    'required_field': 'Ce champ est requis',
    'weekly': 'Vue hebdomadaire',
    'timer': 'Minuteur',
    'focus': 'Concentration',
    'no_tasks_found': 'Aucune tâche trouvée',
    'no_tasks_yet': "Vous n'avez pas encore de tâches",
    'no_tasks_filter': 'Aucune tâche ne correspond à ce filtre',
    'mark_incomplete': 'Marquer comme non terminée',
    'mark_complete': 'Marquer comme terminée',
    'edit_task': 'Modifier la tâche',
    'delete_task': 'Supprimer la tâche',
    'start_timer': 'Démarrer le minuteur',
    'pause_timer': 'Mettre en pause',
    'resume_timer': 'Reprendre',
    'stop_timer': 'Arrêter',
    'overdue': 'En retard',
    'due': 'Échéance',
    'low': 'Basse',
    'medium': 'Moyenne',
    'high': 'Haute'
  },
  en: {
    // ... (keep English translations)
  },
  es: {
    // ... (keep Spanish translations)
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleLanguageChange, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};