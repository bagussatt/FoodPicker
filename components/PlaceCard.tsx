import React from 'react';
import { Place } from '../types';

interface PlaceCardProps {
  place: Place;
  onReset: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onReset }) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-orange-100 flex flex-col items-center text-center animate-fade-in-up">
      <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4 text-3xl">
        🍽️
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">{place.name}</h2>
      
      {place.address && (
        <p className="text-sm text-gray-600 mb-2 px-2 leading-tight">
          {place.address}
        </p>
      )}

      <p className="text-gray-400 text-xs mb-6">Pilihan yang bagus! Selamat makan.</p>
      
      <div className="flex gap-3 w-full">
        <a 
          href={place.uri} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <span>Buka Maps</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
        <button 
          onClick={onReset}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          Ulangi
        </button>
      </div>
    </div>
  );
};

export default PlaceCard;