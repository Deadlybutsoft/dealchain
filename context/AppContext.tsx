
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { UserProfile, Notification, Category } from '../types';

interface AppContextType {
  walletConnected: boolean;
  toggleWallet: () => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  notifications: Notification[];
  addNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeNotification: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_PROFILE: UserProfile = {
    username: 'user123',
    avatar: 'https://i.pravatar.cc/150?u=wallet',
    bio: 'NFT coupon enthusiast.',
    preferredCategory: 'None',
};

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletConnected, setWalletConnected] = useLocalStorage<boolean>('dealchain-walletConnected', false);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('dealchain-userProfile', DEFAULT_PROFILE);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const toggleWallet = () => {
    setWalletConnected(prev => !prev);
  };
  
  const updateUserProfile = (profileUpdate: Partial<UserProfile>) => {
      setUserProfile(prev => ({ ...prev, ...profileUpdate }));
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const addNotification = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
      const id = Date.now();
      setNotifications(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
          removeNotification(id);
      }, 5000); // Auto-dismiss after 5 seconds
  }, []);

  return (
    <AppContext.Provider value={{ walletConnected, toggleWallet, userProfile, updateUserProfile, notifications, addNotification, removeNotification }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
