

import React, { useState, useEffect, useMemo, FC, useRef, ReactNode } from 'react';
import { HashRouter, Routes, Route, useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { AppContextProvider, useAppContext } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DealCard } from './components/DealCard';
import { Icon, Button, SecondaryButton, CountdownTimer, QRCodeCanvas, Modal, NotificationContainer, InputField, TextAreaField, SelectField } from './components/common';
import { Deal, Category, Coupon, Listing, UserProfile } from './types';
import { INITIAL_DEALS, CITIES, PREDEFINED_AVATARS } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';

// Helper to initialize lucide icons
const useLucideIcons = () => {
  const location = useLocation();
  useEffect(() => {
    // @ts-ignore
    if (window.lucide) {
      // @ts-ignore
      window.lucide.createIcons();
    }
  }, [location.pathname]);
};

// Main Layout Component
const Layout: FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  useLucideIcons();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <NotificationContainer />
      <main key={location.pathname} className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-slow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Data Management Logic
const useDealData = () => {
    const { addNotification, userProfile } = useAppContext();
    const [deals, setDeals] = useLocalStorage<Deal[]>('dealchain-deals', INITIAL_DEALS);
    const [myCoupons, setMyCoupons] = useLocalStorage<Coupon[]>('dealchain-myCoupons', []);
    const [myListings, setMyListings] = useLocalStorage<Listing[]>('dealchain-myListings', []);

    const buyCoupon = (dealId: number) => {
        const deal = deals.find(d => d.id === dealId);
        if (!deal || deal.sold >= deal.totalMint) {
            addNotification('Failed to buy coupon. It might be sold out.', 'error');
            return false;
        }

        const newCoupon: Coupon = {
            id: `${deal.id}-${Math.random().toString(36).substr(2, 9)}`,
            deal: deal, purchaseDate: new Date().toISOString(), status: 'active',
        };
        
        setMyCoupons(prev => [...prev, newCoupon]);
        setDeals(prev => prev.map(d => d.id === dealId ? { ...d, sold: d.sold + 1 } : d));
        addNotification(`Successfully purchased "${deal.title}"!`, 'success');
        return true;
    };

    const useCoupon = (couponId: string) => {
        setMyCoupons(prev => prev.map(c => c.id === couponId ? { ...c, status: 'used' } : c));
        addNotification('Coupon marked as used.', 'info');
    };

    const listCoupon = (couponId: string, price: number) => {
        const coupon = myCoupons.find(c => c.id === couponId);
        if(!coupon) return;
        const newListing: Listing = {
            coupon, sellerUsername: userProfile.username, sellerAvatar: userProfile.avatar, resalePrice: price,
        }
        setMyListings(prev => [newListing, ...prev]);
        setMyCoupons(prev => prev.map(c => c.id === couponId ? { ...c, status: 'listed' } : c));
        addNotification(`Your coupon "${coupon.deal.title}" is now listed!`, 'success');
    };

    const createDeal = (dealData: Omit<Deal, 'id' | 'sold'>) => {
      const newDeal: Deal = {
        ...dealData, id: deals.length > 0 ? Math.max(...deals.map(d => d.id)) + 1 : 1, sold: 0,
      };
      setDeals(prev => [newDeal, ...prev]);

      if (userProfile.preferredCategory !== 'None' && newDeal.category === userProfile.preferredCategory) {
          addNotification(`New deal in your preferred category: "${newDeal.title}"`, 'info');
      }
    };
    
    const buyListing = (listing: Listing) => {
        setMyListings(prev => prev.filter(l => l.coupon.id !== listing.coupon.id));
        const purchasedCoupon: Coupon = {
            ...listing.coupon, status: 'active', purchaseDate: new Date().toISOString(),
        };
        setMyCoupons(prev => [...prev, purchasedCoupon]);
        addNotification(`You bought "${listing.coupon.deal.title}" from ${listing.sellerUsername}!`, 'success');
    };

    return { deals, myCoupons, myListings, buyCoupon, useCoupon, listCoupon, createDeal, buyListing };
};

// Breadcrumbs
const Breadcrumbs: FC<{ deal: Deal }> = ({ deal }) => (
    <nav className="mb-8 text-sm text-slate-400 flex items-center space-x-2">
        <Link to="/" className="hover:text-white">Home</Link>
        <Icon name="chevron-right" className="w-4 h-4" />
        <Link to="/browse" className="hover:text-white">Browse</Link>
        <Icon name="chevron-right" className="w-4 h-4" />
        <span className="text-white font-medium truncate max-w-[200px]">{deal.title}</span>
    </nav>
);

// PAGES

// FIX: Destructured 'deals' prop to make it available inside the component.
const HomePage: FC<{ deals: Deal[] }> = ({ deals }) => {
    return (
        <div className="space-y-32">
            {/* Hero Section */}
            <div className="text-center py-24 relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900 bg-[length:200%_200%] animate-gradient-xy"></div>
               <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
              <div className="relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 leading-tight mb-6">
                    Discover, Collect & Trade <br/> NFT Discount Coupons
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
                    User-owned deals powered by blockchain. Your coupon is a tradable asset.
                </p>
                <div className="flex justify-center gap-4">
                    <Button to="/browse"> <Icon name="search" className="w-5 h-5 mr-2" /> Browse Deals</Button>
                    <SecondaryButton to="/create-deal">Create a Deal</SecondaryButton>
                </div>
              </div>
            </div>

            {/* Featured Deals */}
            <div>
                <h2 className="text-4xl font-bold font-display text-center mb-12">Featured Deals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {deals.slice(0, 6).map(deal => <DealCard key={deal.id} deal={deal} />)}
                </div>
            </div>

            {/* How It Works */}
            <div>
                <h2 className="text-4xl font-bold font-display text-center mb-12">How It Works</h2>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
                        <Icon name="search" className="w-12 h-12 mx-auto text-indigo-500 mb-4" />
                        <h3 className="text-2xl font-bold font-display mb-2">1. Browse & Buy</h3>
                        <p className="text-slate-400">Discover exclusive deals from top merchants and purchase them as NFTs.</p>
                    </div>
                    <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
                        <Icon name="shield-check" className="w-12 h-12 mx-auto text-indigo-500 mb-4" />
                        <h3 className="text-2xl font-bold font-display mb-2">2. Own as NFT</h3>
                        <p className="text-slate-400">Your coupon is a unique digital asset on the blockchain, giving you true ownership.</p>
                    </div>
                    <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
                        <Icon name="repeat" className="w-12 h-12 mx-auto text-indigo-500 mb-4" />
                        <h3 className="text-2xl font-bold font-display mb-2">3. Use or Resell</h3>
                        <p className="text-slate-400">Redeem your NFT coupon in-store or sell it to others on our marketplace.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BrowsePage: FC<{ deals: Deal[] }> = ({ deals }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState<Category>('All');
    const [priceRange, setPriceRange] = useState(500);
    const [location, setLocation] = useState('All');

    const filteredDeals = useMemo(() => {
        return deals.filter(deal => {
            const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) || deal.merchantName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = category === 'All' || deal.category === category;
            const matchesPrice = deal.priceUSDC <= priceRange;
            const matchesLocation = location === 'All' || deal.location === location;
            return matchesSearch && matchesCategory && matchesPrice && matchesLocation;
        });
    }, [deals, searchTerm, category, priceRange, location]);
    
    const categories: Category[] = ['All', 'Restaurants', 'Travel', 'Shopping', 'Services'];

    return (
        <div className="flex flex-col lg:flex-row gap-10">
            <aside className="lg:w-1/4 xl:w-1/5 space-y-8 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 self-start sticky top-28">
                <h3 className="text-2xl font-bold font-display">Filters</h3>
                <div>
                    <h4 className="font-bold mb-4">Category</h4>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${category === cat ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600'}`}>{cat}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="priceRange" className="font-bold mb-3 block">Max Price: <span className="text-indigo-400 font-bold">${priceRange}</span></label>
                    <input type="range" id="priceRange" min="0" max="500" step="10" value={priceRange} onChange={e => setPriceRange(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
                <div>
                    <label htmlFor="location" className="font-bold mb-2 block">Location</label>
                    <select id="location" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="All">All Cities</option>
                        {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                </div>
                <button onClick={() => { setSearchTerm(''); setCategory('All'); setPriceRange(500); setLocation('All'); }} className="w-full text-center py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold">Reset Filters</button>
            </aside>

            <main className="flex-1">
                <div className="relative mb-8">
                    <input type="text" placeholder="Search deals by title or merchant..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg pl-12 pr-4 py-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500" />
                    <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredDeals.length > 0 ? (
                        filteredDeals.map(deal => <DealCard key={deal.id} deal={deal} />)
                    ) : (
                        <div className="md:col-span-2 xl:col-span-3 text-center py-20 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
                             <Icon name="frown" className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                             <h3 className="text-xl font-bold">No deals found.</h3>
                             <p className="text-slate-400">Try adjusting your filters.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const DealDetailPage: FC<{ deals: Deal[]; buyCoupon: (dealId: number) => boolean }> = ({ deals, buyCoupon }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const deal = deals.find(d => d.id === Number(id));

    if (!deal) {
        return <div className="text-center py-20">Deal not found. <Link to="/browse" className="text-indigo-400">Go back to deals.</Link></div>;
    }
    
    const handleBuy = () => { if(buyCoupon(deal.id)) navigate('/my-coupons'); }
    const similarDeals = deals.filter(d => d.category === deal.category && d.id !== deal.id).slice(0, 3);

    return (
        <div>
            <Breadcrumbs deal={deal} />
            <div className="bg-slate-800/50 p-6 md:p-10 rounded-3xl border border-slate-700 grid lg:grid-cols-5 gap-10">
                <div className="lg:col-span-2">
                    <img src={deal.image} alt={deal.title} className="w-full h-auto object-cover rounded-2xl shadow-lg" />
                </div>
                <div className="lg:col-span-3 space-y-5">
                    <h1 className="text-5xl font-bold font-display text-white">{deal.title}</h1>
                    <div className="flex items-center space-x-4">
                        <img src={deal.merchantLogo} alt={deal.merchantName} className="w-14 h-14 rounded-full" />
                        <span className="text-2xl font-bold">{deal.merchantName}</span>
                        <Icon name="shield-check" className="w-7 h-7 text-blue-400" />
                    </div>
                    <div className="flex items-baseline space-x-4">
                        <span className="text-4xl font-bold font-display text-indigo-400">{deal.priceUSDC} USDC</span>
                        <span className="text-2xl text-slate-500 line-through">${deal.originalPrice}</span>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-xl flex items-center justify-between">
                        <CountdownTimer expiryDate={deal.expiryDate} />
                        <span className="font-bold text-white">{deal.totalMint - deal.sold} of {deal.totalMint} available</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{deal.description}</p>
                    <div className="space-y-3 pt-3 border-t border-slate-700">
                        <div>
                            <h3 className="font-bold text-white mb-1">Redemption Instructions</h3>
                            <p className="text-sm text-slate-400">{deal.redemptionInstructions}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-white mb-1">Terms & Conditions</h3>
                            <p className="text-sm text-slate-400">{deal.terms}</p>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Button onClick={handleBuy} className="flex-1 text-lg"><Icon name="shopping-cart" className="w-5 h-5 mr-2"/> Buy Now</Button>
                        <SecondaryButton className="flex-1 text-lg"><Icon name="share-2" className="w-5 h-5 mr-2"/> Share Deal</SecondaryButton>
                    </div>
                </div>
            </div>
            {similarDeals.length > 0 && (
                <div className="mt-20">
                    <h2 className="text-3xl font-bold font-display text-center mb-10">Similar Deals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {similarDeals.map(d => <DealCard key={d.id} deal={d} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

const MyCouponsPage: FC<{ myCoupons: Coupon[]; listCoupon: (couponId: string, price: number) => void }> = ({ myCoupons, listCoupon }) => {
    type Tab = 'active' | 'used' | 'listed';
    const [activeTab, setActiveTab] = useState<Tab>('active');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [resalePrice, setResalePrice] = useState(0);

    const filteredCoupons = myCoupons.filter(c => c.status === activeTab);

    const handleListClick = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setResalePrice(coupon.deal.priceUSDC * 0.9);
        setIsModalOpen(true);
    };

    const handleConfirmListing = () => {
        if (selectedCoupon && resalePrice > 0) {
            listCoupon(selectedCoupon.id, resalePrice);
            setIsModalOpen(false);
            setSelectedCoupon(null);
        }
    };
    
    const getExpiryStyle = (expiryDate: string) => {
        const diffDays = (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
        if (diffDays < 1) return 'border-red-500/50 bg-red-500/10 text-red-400';
        if (diffDays < 7) return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400';
        return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
    };

    const CouponCard: FC<{ coupon: Coupon }> = ({ coupon }) => (
        <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 p-4 flex flex-col justify-between transition-shadow hover:shadow-elevation-2">
            <div>
                <div className="flex items-start justify-between mb-4">
                    <img src={coupon.deal.merchantLogo} alt={coupon.deal.merchantName} className="w-14 h-14 rounded-full shadow-md" />
                    <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getExpiryStyle(coupon.deal.expiryDate)}`}>
                        Expires in {Math.ceil((new Date(coupon.deal.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}d
                    </div>
                </div>
                <h3 className="font-bold text-lg text-white">{coupon.deal.title}</h3>
                <p className="text-sm text-slate-400 mb-3">{coupon.deal.merchantName}</p>
                <p className="text-xs text-slate-500 font-mono">NFT ID: {coupon.id.slice(0,12)}...</p>
            </div>
            {coupon.status === 'active' && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <Link to={`/coupon/${coupon.id}`} className="w-full text-center bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/40 font-semibold py-2 rounded-lg transition-colors text-sm">View QR</Link>
                    <button onClick={() => handleListClick(coupon)} className="w-full text-center bg-slate-700 hover:bg-slate-600 font-semibold py-2 rounded-lg transition-colors text-sm">List for Resale</button>
                </div>
            )}
             {coupon.status === 'listed' && (
                <div className="mt-4 text-center text-purple-400 font-semibold bg-purple-500/10 py-2 rounded-lg text-sm border border-purple-500/30">
                    Listed on Marketplace
                </div>
            )}
        </div>
    );
    
    return (
        <div>
            <h1 className="text-4xl font-bold font-display mb-8">My Coupons</h1>
            <div className="border-b border-slate-700 mb-8">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {(['active', 'used', 'listed'] as Tab[]).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-lg capitalize transition-all ${activeTab === tab ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'}`}>
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            {filteredCoupons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredCoupons.map(coupon => <CouponCard key={coupon.id} coupon={coupon} />)}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
                    <Icon name="ticket-slash" className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                    <h3 className="text-xl font-bold">No {activeTab} coupons yet.</h3>
                    <p className="text-slate-400 mb-6">Looks like this section is empty.</p>
                    <Button to="/browse">Browse Deals</Button>
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="List Coupon for Resale">
                {selectedCoupon && (
                    <div className="space-y-6">
                        <p className="text-slate-300">Set a resale price for your <span className="font-bold text-white">"{selectedCoupon.deal.title}"</span> coupon.</p>
                        <InputField name="resalePrice" label="Resale Price (USDC)" type="number" value={resalePrice} onChange={(e: any) => setResalePrice(Number(e.target.value))} />
                        <p className="text-sm text-slate-400 -mt-3">Original price: {selectedCoupon.deal.priceUSDC} USDC</p>
                        <Button onClick={handleConfirmListing} className="w-full">Confirm Listing</Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const QRCodePage: FC<{ myCoupons: Coupon[]; useCoupon: (couponId: string) => void }> = ({ myCoupons, useCoupon }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const coupon = myCoupons.find(c => c.id === id);

    if (!coupon) {
        return <div className="text-center py-20">Coupon not found.</div>;
    }

    const handleUseCoupon = () => { useCoupon(coupon.id); navigate('/my-coupons'); };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-slate-800 p-8 rounded-3xl shadow-elevation-3 shadow-indigo-500/20 border border-slate-700 w-full max-w-sm text-center relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-3xl blur-md opacity-30 animate-pulse"></div>
                <div className="relative bg-slate-800 p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold font-display text-white mb-2">{coupon.deal.title}</h2>
                    <p className="text-slate-400 mb-6">{coupon.deal.merchantName}</p>
                    <div className="bg-white p-4 rounded-xl inline-block">
                        <QRCodeCanvas text={JSON.stringify({ couponId: coupon.id, dealId: coupon.deal.id })} />
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-4">NFT ID: {coupon.id}</p>
                    <p className="font-semibold text-amber-400 mt-2">Expires: {new Date(coupon.deal.expiryDate).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-300 mt-8 mb-6">Show this QR code to the merchant at checkout.</p>
                    <div className="space-y-3">
                        <Button onClick={handleUseCoupon} className="w-full">Mark as Used</Button>
                        <Link to="/my-coupons" className="text-slate-400 hover:text-white text-sm transition-colors">Back to My Coupons</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MarketplacePage: FC<{ listings: Listing[]; buyListing: (listing: Listing) => void }> = ({ listings, buyListing }) => {
    const ListingCard: FC<{ listing: Listing }> = ({ listing }) => (
        <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-elevation-1 hover:shadow-elevation-2 border border-slate-700 group">
          <div className="relative">
            <img className="w-full h-48 object-cover" src={listing.coupon.deal.image} alt={listing.coupon.deal.title} />
            <div className="absolute top-3 right-3 bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-2 border border-slate-700">
                <img src={listing.sellerAvatar} alt="seller" className="w-6 h-6 rounded-full" />
                <span className="text-xs font-semibold">{listing.sellerUsername}</span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold text-white truncate">{listing.coupon.deal.title}</h3>
            <p className="text-sm text-slate-400">{listing.coupon.deal.merchantName}</p>
            <div className="flex justify-between items-center mt-4">
                <div>
                  <span className="text-2xl font-bold text-white">{listing.resalePrice} <span className="text-base font-normal text-slate-400">USDC</span></span>
                  <p className="text-xs text-slate-500 line-through">Original: {listing.coupon.deal.priceUSDC} USDC</p>
                </div>
                <CountdownTimer expiryDate={listing.coupon.deal.expiryDate} />
            </div>
            <Button className="w-full mt-4" onClick={() => buyListing(listing)}>Buy from User</Button>
          </div>
        </div>
    );
    
    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold font-display">Secondary Marketplace</h1>
                <p className="text-slate-400 mt-3 text-lg">Buy NFT coupons directly from other users.</p>
            </div>
            {listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {listings.map(listing => <ListingCard key={listing.coupon.id} listing={listing} />)}
                </div>
            ) : (
                 <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
                    <Icon name="store" className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                    <h3 className="text-xl font-bold">Marketplace is empty.</h3>
                    <p className="text-slate-400">No coupons are listed for resale at the moment.</p>
                </div>
            )}
        </div>
    );
};

const Confetti: FC = () => (
    <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => {
            const style = {
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                '--color': `hsl(${Math.random() * 360}, 70%, 60%)`,
            } as React.CSSProperties;
            return <div key={i} className="absolute top-0 w-2 h-4 rounded-full bg-[--color] animate-confetti-fall" style={style}></div>
        })}
    </div>
)

const CreateDealPage: FC<{ createDeal: (dealData: Omit<Deal, 'id' | 'sold'>) => void }> = ({ createDeal }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Partial<Omit<Deal, 'id' | 'sold'>>>({
      category: 'Restaurants', totalMint: 100, location: CITIES[0],
      image: `https://picsum.photos/seed/${Math.random()}/800/600`,
      merchantLogo: `https://picsum.photos/seed/${Math.random()}/100/100`,
    });
    const [isPublishing, setIsPublishing] = useState(false);
    const [isPublished, setIsPublished] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumeric = type === 'number';
        setFormData(prev => ({...prev, [name]: isNumeric ? Number(value) : value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsPublishing(true);
        setTimeout(() => {
            createDeal(formData as Omit<Deal, 'id' | 'sold'>);
            setIsPublishing(false);
            setIsPublished(true);
            setTimeout(() => navigate('/browse'), 2500);
        }, 2000);
    };

    if(isPublished) {
        return (
            <div className="text-center py-20 relative overflow-hidden">
                <Confetti />
                <Icon name="check-circle-2" className="w-24 h-24 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-4xl font-bold font-display">Deal Published Successfully!</h2>
                <p className="text-slate-400 mt-2">Redirecting you to the browse page...</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold font-display text-center mb-10">Create New NFT Coupon Deal</h1>
            <form onSubmit={handleSubmit} className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <InputField name="title" label="Deal Title" placeholder="e.g., 30% off dinner" onChange={handleChange} required />
                    <InputField name="merchantName" label="Merchant Name" placeholder="e.g., The Pizza Place" onChange={handleChange} required />
                </div>
                <TextAreaField name="description" label="Description" placeholder="A brief description of the deal" onChange={handleChange} required />
                <div className="grid md:grid-cols-2 gap-6">
                     <SelectField name="category" label="Category" options={['Restaurants', 'Travel', 'Shopping', 'Services']} onChange={handleChange} />
                     <InputField name="discountValue" label="Discount Badge Text" placeholder="e.g., 30% OFF or BOGO" onChange={handleChange} required />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    <InputField name="originalPrice" label="Original Price ($)" type="number" onChange={handleChange} required />
                    <InputField name="priceUSDC" label="Price in USDC" type="number" onChange={handleChange} required />
                    <InputField name="totalMint" label="# of Coupons to Mint" type="number" defaultValue={100} onChange={handleChange} required />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <InputField name="expiryDate" label="Expiry Date" type="date" onChange={handleChange} required />
                    <SelectField name="location" label="Location" options={CITIES} onChange={handleChange} />
                </div>
                <TextAreaField name="terms" label="Terms & Conditions" rows={3} onChange={handleChange} required />
                <TextAreaField name="redemptionInstructions" label="Redemption Instructions" rows={2} onChange={handleChange} required />

                <div className="pt-4 flex justify-end">
                    <Button type="submit" className="w-full md:w-auto" disabled={isPublishing}>
                        {isPublishing ? (
                            <span className="flex items-center"><Icon name="loader-2" className="w-5 h-5 mr-2 animate-spin"/> Minting NFTs...</span>
                        ) : 'Publish Deal'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

const ProfilePage: FC = () => {
    const { userProfile, updateUserProfile, addNotification } = useAppContext();
    const [profile, setProfile] = useState<UserProfile>(userProfile);

    useEffect(() => { setProfile(userProfile); }, [userProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAvatarSelect = (avatarUrl: string) => {
        setProfile(prev => ({ ...prev, avatar: avatarUrl }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUserProfile(profile);
        addNotification('Profile updated successfully!', 'success');
    };
    
    const categories: (Category | 'None')[] = ['None', 'Restaurants', 'Travel', 'Shopping', 'Services'];

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold font-display text-center mb-10">My Profile</h1>
            <form onSubmit={handleSubmit} className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 space-y-8">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-4">Select Avatar</label>
                    <div className="flex items-center gap-6">
                        <img src={profile.avatar} alt="Current Avatar" className="w-28 h-28 rounded-full border-4 border-indigo-500 shadow-lg" />
                        <div className="grid grid-cols-4 gap-3">
                            {PREDEFINED_AVATARS.map(avatar => (
                                <button key={avatar} type="button" onClick={() => handleAvatarSelect(avatar)} className={`rounded-full overflow-hidden w-14 h-14 transition-all duration-200 ${profile.avatar === avatar ? 'ring-4 ring-indigo-400' : 'hover:scale-110 hover:ring-2 ring-slate-500'}`}>
                                    <img src={avatar} alt="avatar option" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <InputField name="username" label="Username" value={profile.username} placeholder="Your public name" onChange={handleChange} required />
                    <SelectField name="preferredCategory" label="Preferred Category for Notifications" value={profile.preferredCategory} options={categories} onChange={handleChange} />
                </div>
                <TextAreaField name="bio" label="Short Bio" value={profile.bio} rows={3} placeholder="Tell us about yourself" onChange={handleChange} required />

                <div className="pt-4 flex justify-end">
                    <Button type="submit">Save Profile</Button>
                </div>
            </form>
        </div>
    );
};


// App Router
const AppRouter: FC = () => {
    const { deals, myCoupons, myListings, buyCoupon, useCoupon, listCoupon, createDeal, buyListing } = useDealData();
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<HomePage deals={deals} />} />
                <Route path="/browse" element={<BrowsePage deals={deals} />} />
                <Route path="/deal/:id" element={<DealDetailPage deals={deals} buyCoupon={buyCoupon} />} />
                <Route path="/my-coupons" element={<MyCouponsPage myCoupons={myCoupons} listCoupon={listCoupon} />} />
                <Route path="/coupon/:id" element={<QRCodePage myCoupons={myCoupons} useCoupon={useCoupon} />} />
                <Route path="/marketplace" element={<MarketplacePage listings={myListings} buyListing={buyListing} />} />
                <Route path="/create-deal" element={<CreateDealPage createDeal={createDeal} />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        </Layout>
    );
};

function App() {
  return (
    <AppContextProvider>
        <HashRouter>
            <AppRouter />
        </HashRouter>
    </AppContextProvider>
  );
}

export default App;