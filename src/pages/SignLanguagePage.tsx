import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Search,
  Heart,
  CheckCircle2,
  Check,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';
import { SIGN_LANGUAGE_CARDS } from '../data/signLanguageData';
import { SignCategory } from '../types';
import { SignVisualIllustration } from '../components/SignVisualIllustration';
import { getAssetUrl } from '../utils/assets';

const CATEGORIES: ('All' | SignCategory)[] = [
  'All',
  'Greetings',
  'Everyday Communication',
  'Emergency',
  'Medical Communication',
  'Food and Drinks',
  'Travel',
  'Common Responses',
];

export const SignLanguagePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | SignCategory>('All');
  const [viewMode, setViewMode] = useState<'photos' | 'diagrams'>('photos');
  const [showChartModal, setShowChartModal] = useState(false);

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('hearme_favorite_signs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [learnedIds, setLearnedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('hearme_learned_signs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        localStorage.setItem('hearme_favorite_signs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const toggleLearned = (id: string) => {
    setLearnedIds((prev) => {
      const isAlreadyLearned = prev.includes(id);
      const updated = isAlreadyLearned ? prev.filter((i) => i !== id) : [...prev, id];
      if (!isAlreadyLearned) {
        try {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#000000', '#555555', '#999999'],
          });
        } catch {}
      }
      try {
        localStorage.setItem('hearme_learned_signs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const filteredCards = useMemo(() => {
    return SIGN_LANGUAGE_CARDS.filter((card) => {
      const matchesCategory = selectedCategory === 'All' || card.category === selectedCategory;
      const matchesSearch =
        card.phrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.context.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const progressPercent = Math.round((learnedIds.length / SIGN_LANGUAGE_CARDS.length) * 100);

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-black py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Minimalist Progress Indicator */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#777777] px-2 py-0.5 rounded bg-[#F7F7F7] border border-[#E5E5E5]">
                Indian Sign Language Lexicon
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black px-2 py-0.5 rounded bg-black text-white">
                PHOTO REFERENCE INCLUDED
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
              Sign Language Learning Library
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-1.5 max-w-xl">
              Authentic Indian Sign Language (ISL) vocabulary referenced from the Indian Sign Language Research and Training Centre (ISLRTC) and 20 Essential Signs photo standard.
            </p>
          </div>

          {/* Actions & Minimal Monochrome Progress Indicator */}
          <div className="w-full md:w-72 space-y-3">
            <button
              onClick={() => setShowChartModal(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-black text-white hover:bg-[#1C1C1C] text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>View Full Reference Photo Chart</span>
            </button>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#777777]">LEARNING PROGRESS</span>
                <span className="font-bold text-black">{learnedIds.length} / {SIGN_LANGUAGE_CARDS.length} ({progressPercent}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E5E5E5] overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar, Visual Mode Toggle & Category Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#777777]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by sign, meaning, or communication context..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-black rounded-xl text-xs sm:text-sm text-black placeholder-[#777777] focus:outline-none focus:ring-1 focus:ring-black shadow-sm"
              />
            </div>

            {/* Visual View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-[#E5E5E5] shrink-0 self-start sm:self-auto shadow-sm">
              <button
                onClick={() => setViewMode('photos')}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'photos'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-[#666666] hover:text-black'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Photo Signs</span>
              </button>
              <button
                onClick={() => setViewMode('diagrams')}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'diagrams'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-[#666666] hover:text-black'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Vector Diagrams</span>
              </button>
            </div>
          </div>

          {/* Minimalist Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-black text-white border border-black'
                    : 'bg-white text-black border border-[#D4D4D4] hover:border-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        {filteredCards.length === 0 ? (
          <div className="py-16 text-center text-[#777777] space-y-2 bg-white rounded-2xl border border-[#E5E5E5]">
            <BookOpen className="w-8 h-8 mx-auto text-[#AAAAAA]" />
            <h3 className="text-sm font-bold text-black uppercase tracking-wider">No matching signs found</h3>
            <p className="text-xs">Try searching a different word or select "All" categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => {
              const isFav = favoriteIds.includes(card.id);
              const isLearned = learnedIds.includes(card.id);

              return (
                <div
                  key={card.id}
                  className={`rounded-2xl border bg-white p-6 flex flex-col justify-between transition-all duration-200 ${
                    isLearned
                      ? 'border-black shadow-md'
                      : 'border-[#E5E5E5] hover:border-black shadow-sm hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-[#E5E5E5] text-[#555555]">
                        {card.category}
                      </span>
                      {card.isISLVerified && (
                        <span className="text-[10px] font-mono text-black flex items-center gap-1 font-semibold">
                          <Check className="w-3 h-3 text-black" /> ISL VERIFIED
                        </span>
                      )}
                    </div>

                    {/* Sign Visual: Photo or Vector Diagram */}
                    <div className="rounded-xl overflow-hidden mb-4 border border-[#E5E5E5] bg-white h-40 flex items-center justify-center p-2">
                      {viewMode === 'photos' && card.imageSrc ? (
                        <img
                          src={getAssetUrl(card.imageSrc)}
                          alt={`Sign for ${card.phrase}`}
                          className="w-full h-full object-contain hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <SignVisualIllustration type={card.svgVisualType} className="w-full h-full object-contain" />
                      )}
                    </div>

                    {/* Word & Meaning */}
                    <h3 className="text-lg font-bold text-black tracking-tight">
                      {card.phrase}
                    </h3>
                    <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                      {card.meaning}
                    </p>

                    {/* Context */}
                    <div className="mt-3 p-3 rounded-lg bg-[#F7F7F7] border border-[#E5E5E5] text-[11px]">
                      <span className="font-semibold text-black block mb-0.5">Context:</span>
                      <span className="text-[#555555]">{card.context}</span>
                    </div>

                    {/* Step-by-step instructions */}
                    <div className="mt-3 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-[#777777] uppercase tracking-wider block">
                        Instructions:
                      </span>
                      <ul className="space-y-1 text-xs text-[#444444]">
                        {card.instructions.map((inst, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-black font-bold mt-0.5">•</span>
                            <span>{inst}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions: Favorite Heart & Mark as Learned */}
                  <div className="mt-6 pt-4 border-t border-[#E5E5E5] flex items-center justify-between gap-3">
                    <button
                      onClick={() => toggleFavorite(card.id)}
                      className={`p-2 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
                        isFav
                          ? 'border-black bg-black text-white'
                          : 'border-[#D4D4D4] bg-white text-black hover:border-black'
                      }`}
                      title={isFav ? 'Remove Favorite' : 'Save to Favorites'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white text-white' : 'text-black'}`} />
                      <span className="text-[11px] font-medium">{isFav ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                      onClick={() => toggleLearned(card.id)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isLearned
                          ? 'bg-black text-white'
                          : 'bg-white border border-[#D4D4D4] hover:border-black text-black'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isLearned ? 'Learned' : 'Mark Learned'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Master 20 Signs Photo Reference Modal */}
        {showChartModal && (
          <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowChartModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 border-2 border-black max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <div>
                  <h3 className="text-lg font-black text-black">
                    Signs Everyone Should Know — 20 Vocabulary Signs
                  </h3>
                  <p className="text-xs text-[#666666] font-mono">
                    Official visual reference poster for HearMe AI sign language library
                  </p>
                </div>
                <button
                  onClick={() => setShowChartModal(false)}
                  className="px-3 py-1 rounded-lg border border-[#D4D4D4] hover:border-black text-xs font-mono"
                >
                  Close
                </button>
              </div>

              <div className="rounded-xl overflow-hidden border border-[#E5E5E5] bg-white p-2">
                <img
                  src={getAssetUrl('/images/signs-reference-chart.jpg')}
                  alt="Full 20 Signs Reference Chart"
                  className="w-full h-auto object-contain mx-auto"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
