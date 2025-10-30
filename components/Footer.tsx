
import React from 'react';
import { Icon } from './common';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-24 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                <Icon name="tag" className="w-9 h-9 text-indigo-500" />
                <span className="text-3xl font-bold font-display text-white">DealChain</span>
                </div>
                <p className="text-slate-400 max-w-sm">User-owned deals powered by blockchain. Discover, collect, and trade NFT discount coupons in a decentralized marketplace.</p>
                <div className="mt-6 flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-full w-fit border border-slate-700">
                    <Icon name="globe" className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-bold">Built on Solana</span>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-bold font-display text-white mb-4">Quick Links</h3>
                <ul className="space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Marketplace</a></li>
                <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Contact Us</a></li>
                </ul>
            </div>
            <div>
                <h3 className="text-lg font-bold font-display text-white mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-transform hover:scale-110"><Icon name="twitter" className="w-6 h-6" /></a>
                <a href="#" className="text-slate-400 hover:text-white transition-transform hover:scale-110"><Icon name="github" className="w-6 h-6" /></a>
                <a href="#" className="text-slate-400 hover:text-white transition-transform hover:scale-110"><Icon name="send" className="w-6 h-6" /></a>
                </div>
            </div>
            </div>
            <div className="mt-10 border-t border-slate-800 pt-8 text-center text-slate-500">
            <p>&copy; {new Date().getFullYear()} DealChain. All rights reserved.</p>
            </div>
      </div>
    </footer>
  );
};
