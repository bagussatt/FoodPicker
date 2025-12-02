import React from 'react';
import { Place } from '../types';

interface PlaceCardProps {
  place: Place;
  onReset: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onReset }) => {
  const getCurrentStatusColor = () => {
    if (place.isOpen === undefined) return 'bg-gray-100 text-gray-600'; // No data
    return place.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  };

  const getStatusText = () => {
    if (place.isOpen === undefined) return 'Jam buka tidak diketahui';
    return place.isOpen ? '🟢 Buka Sekarang' : '🔴 Tutup';
  };

  const getTodayHours = () => {
    if (!place.openingHours) return null;

    const now = new Date();
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const currentDay = dayNames[now.getDay()];

    const todayHours = place.openingHours[currentDay];
    if (!todayHours) return null;

    const dayMap: { [key: string]: string } = {
      'Su': 'Minggu',
      'Mo': 'Senin',
      'Tu': 'Selasa',
      'We': 'Rabu',
      'Th': 'Kamis',
      'Fr': 'Jumat',
      'Sa': 'Sabtu'
    };

    return `${dayMap[currentDay]}: ${todayHours}`;
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-orange-100 flex flex-col items-center text-center animate-fade-in-up">
      <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4 text-3xl">
        🍽️
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">{place.name}</h2>

      {/* Status Buka/Tutup */}
      <div className={`px-3 py-1 rounded-full text-xs font-medium mb-3 ${getCurrentStatusColor()}`}>
        {getStatusText()}
      </div>

      {place.address && (
        <p className="text-sm text-gray-600 mb-2 px-2 leading-tight">
          {place.address}
        </p>
      )}

      {/* Jam Buka Hari Ini */}
      {getTodayHours() && (
        <p className="text-xs text-gray-500 mb-2">
          🕐 {getTodayHours()}
        </p>
      )}

      <p className="text-gray-400 text-xs mb-6">
        {place.isOpen !== false ? 'Pilihan yang bagus! Selamat makan.' : 'Tempat ini sedang tutup, tapi bisa dicoba lain waktu.'}
      </p>
      
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