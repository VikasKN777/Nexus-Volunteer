/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Heart, 
  Leaf, 
  Users, 
  PawPrint, 
  GraduationCap, 
  Activity, 
  Palette, 
  UserPlus,
  ArrowRight,
  Loader2,
  Calendar,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { VolunteerOpportunity, Category } from './types';
import { searchVolunteerOpportunities } from './services/geminiService';

const CATEGORIES: { name: Category; icon: React.ReactNode; color: string }[] = [
  { name: 'Environment', icon: <Leaf className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Animals', icon: <PawPrint className="w-5 h-5" />, color: 'bg-amber-100 text-amber-700' },
  { name: 'Education', icon: <GraduationCap className="w-5 h-5" />, color: 'bg-blue-100 text-blue-700' },
  { name: 'Health', icon: <Activity className="w-5 h-5" />, color: 'bg-red-100 text-red-700' },
  { name: 'Community', icon: <Users className="w-5 h-5" />, color: 'bg-purple-100 text-purple-700' },
  { name: 'Arts', icon: <Palette className="w-5 h-5" />, color: 'bg-pink-100 text-pink-700' },
  { name: 'Youth', icon: <UserPlus className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-700' },
];

export default function App() {
  const [location, setLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  useEffect(() => {
    // Try to get initial location
    handleAutoLocate();
  }, []);

  const handleAutoLocate = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Use reverse geocoding via a simple fetch or just ask Gemini to resolve it
            // For now, we'll let Gemini handle "near me" or we could use a free API
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
            setLocation(city);
            // Auto search when location is found
            if (city) {
              const results = await searchVolunteerOpportunities(city);
              setOpportunities(results);
              setHasSearched(true);
            }
          } catch (e) {
            console.error("Locating error", e);
          } finally {
            setIsLocating(false);
          }
        },
        () => setIsLocating(false)
      );
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!location && !searchQuery) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await searchVolunteerOpportunities(
        location || 'San Francisco', // Default if empty
        selectedCategory || undefined,
        searchQuery
      );
      setOpportunities(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (cat: Category) => {
    setSelectedCategory(prev => prev === cat ? null : cat);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-slate-900 font-sans selection:bg-emerald-200">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">Nexus Volunteer</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-emerald-600 transition-colors">Find Opportunities</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">How it Works</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">For Organizations</a>
          </div>
          <button className="px-5 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-sm">
            Sign In
          </button>
        </nav>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight font-serif italic"
          >
            Better Together. <br />
            <span className="text-emerald-600 italic">Find your purpose locally.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 mb-10"
          >
            Connect with meaningful volunteer opportunities in your neighborhood. 
            AI-powered matching to help you find causes you truly care about.
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-2 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center gap-2"
          >
            <div className="flex-1 w-full flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100">
              <Search className="w-5 h-5 text-slate-400 mr-3" />
              <input 
                type="text" 
                placeholder="Skills, causes, or keywords..."
                className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex-1 w-full flex items-center px-4 py-2">
              <MapPin className="w-5 h-5 text-slate-400 mr-3" />
              <input 
                type="text" 
                placeholder="City or zip code"
                className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={handleAutoLocate}
                className="p-1.5 hover:bg-slate-50 rounded-full transition-colors text-slate-500"
                title="Use current location"
                disabled={isLocating}
              >
                {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4 rotate-90" />}
              </button>
            </div>
            <button 
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="w-full md:w-auto px-10 py-4 bg-emerald-600 text-white rounded-[20px] font-bold hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Search <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </motion.div>
        </div>

        {/* Categories */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Browse by Cause</h2>
            <button className="text-sm font-semibold text-emerald-600 hover:underline">View All</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => toggleCategory(cat.name)}
                className={`flex items-center gap-2 px-6 py-4 rounded-[24px] transition-all border-2 ${
                  selectedCategory === cat.name 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-md' 
                    : 'border-white bg-white hover:border-slate-200 text-slate-600 shadow-sm'
                }`}
              >
                <div className={`p-2 rounded-xl scale-90 ${selectedCategory === cat.name ? 'bg-emerald-600 text-white' : cat.color}`}>
                  {cat.icon}
                </div>
                <span className="font-bold text-sm tracking-wide uppercase">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
              <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mb-4" />
              <p className="text-slate-500 font-medium">Brewing local opportunities...</p>
            </div>
          ) : opportunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {opportunities.map((opp, idx) => (
                  <motion.div
                    key={opp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-emerald-200/20 transition-all duration-500 flex flex-col"
                  >
                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                      <img 
                        src={`https://images.unsplash.com/photo-1559027615-cd4428a622b5?auto=format&fit=crop&q=80&w=800`} 
                        alt={opp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm">
                        {opp.category}
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-3">
                        <Users className="w-3.5 h-3.5" />
                        {opp.organization}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors leading-tight">
                        {opp.title}
                      </h3>
                      <p className="text-slate-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                        {opp.description}
                      </p>
                      
                      <div className="mt-auto space-y-3">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {opp.location}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {opp.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <a 
                          href={opp.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all font-bold text-sm"
                        >
                          Learn More & Apply
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : hasSearched ? (
            <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No opportunities found</h3>
              <p className="text-slate-500">Try broading your search or changing location.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-40 grayscale pointer-events-none">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-[32px] h-96 border border-slate-100"></div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-slate-900 text-white py-20 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Nexus Volunteer</span>
            </div>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
              Making social impact accessible to everyone. Our mission is to bridge the gap between passion and purpose through technology.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                <Users className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                <Palette className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-slate-500">Company</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Our Team</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Press</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-slate-500">Resources</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Safety Tips</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Volunteering Guide</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Nonprofit Resources</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-600">
          <p>© 2026 NEXUS VOLUNTEER. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
