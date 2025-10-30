
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Icon } from './common';

export const Header: React.FC = () => {
  const { walletConnected, toggleWallet, userProfile } = useAppContext();

  const NavItem: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative text-lg font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`
      }
    >
      {({ isActive }) => (
        <>
          {children}
          {isActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 bg-indigo-500 rounded-full"></span>}
        </>
      )}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-40 bg-slate-900/60 backdrop-blur-xl border-b border-slate-700/50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
        <NavLink to="/" className="flex items-center space-x-3">
          <Icon name="tag" className="w-8 h-8 text-indigo-500" />
          <span className="text-3xl font-bold font-display text-white">DealChain</span>
        </NavLink>
        <div className="hidden md:flex items-center space-x-10">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/browse">Browse</NavItem>
          <NavItem to="/marketplace">Marketplace</NavItem>
          <NavItem to="/my-coupons">My Coupons</NavItem>
          <NavItem to="/create-deal">Create Deal</NavItem>
          <NavItem to="/profile">Profile</NavItem>
        </div>
        <div>
          {walletConnected ? (
            <div className="flex items-center space-x-3 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
              <img src={userProfile.avatar} alt="User Avatar" className="w-9 h-9 rounded-full" />
              <span className="font-mono text-sm">{userProfile.username.substring(0,6)}...</span>
              <button onClick={toggleWallet} title="Disconnect Wallet" className="transition-transform hover:scale-110">
                <Icon name="log-out" className="w-5 h-5 text-red-500 hover:text-red-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={toggleWallet}
              className="px-6 py-2.5 font-bold text-white rounded-lg shadow-elevation-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105 transition-transform duration-300"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};
