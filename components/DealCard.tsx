
import React from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../types';
import { Icon, CountdownTimer } from './common';

interface DealCardProps {
  deal: Deal;
}

export const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const soldPercentage = (deal.sold / deal.totalMint) * 100;

  return (
    <div className="bg-slate-800/50 rounded-2xl overflow-hidden shadow-elevation-1 hover:shadow-elevation-3 hover:shadow-indigo-500/20 border border-slate-700/80 transition-all duration-300 transform hover:-translate-y-2 group [perspective:1000px]">
        <div className="transition-transform duration-500 group-hover:[transform:rotateX(5deg)_rotateY(-5deg)] [transform-style:preserve-3d]">
            <div className="relative">
                <img className="w-full h-52 object-cover" src={deal.image} alt={deal.title} />
                <div className="absolute top-4 left-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                {deal.discountValue}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-800 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center space-x-3">
                <img src={deal.merchantLogo} alt={deal.merchantName} className="w-12 h-12 rounded-full border-2 border-slate-900 shadow-md" />
                <span className="text-white font-bold text-lg">{deal.merchantName}</span>
                </div>
            </div>
            <div className="p-5">
                <h3 className="text-xl font-bold font-display text-white truncate group-hover:text-indigo-400 transition-colors">{deal.title}</h3>
                <p className="text-sm text-slate-400 flex items-center mt-1">
                <Icon name="map-pin" className="w-4 h-4 mr-2" />
                {deal.location}
                </p>
                
                <div className="mt-4">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                        <span className="font-semibold">NFTs Sold</span>
                        <span className="font-mono">{deal.sold}/{deal.totalMint}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${soldPercentage}%` }}></div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-5">
                <span className="text-3xl font-bold font-display text-white">{deal.priceUSDC} <span className="text-lg font-sans font-medium text-slate-400">USDC</span></span>
                <CountdownTimer expiryDate={deal.expiryDate} />
                </div>
                
                <Link to={`/deal/${deal.id}`} className="mt-5 block w-full text-center bg-indigo-500/20 text-indigo-300 border-2 border-indigo-500/30 hover:bg-indigo-500/40 hover:text-white font-bold py-3 rounded-lg transition-all duration-300">
                View Details
                </Link>
            </div>
        </div>
    </div>
  );
};
