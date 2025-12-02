import React, { useState, useCallback, useEffect } from 'react';
import MapComponent from './components/MapComponent';
import PlaceCard from './components/PlaceCard';
import { fetchNearbyPlaces, searchLocation, getAddressFromCoords } from './services/geminiService';
import { Coordinates, Place, AppState } from './types';

const App: React.FC = () => {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [addressName, setAddressName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [rouletteName, setRouletteName] = useState<string>('???');
  const [category, setCategory] = useState<string>('all');
  const [radius, setRadius] = useState<number>(1000); // Default 1km
  const [onlyOpen, setOnlyOpen] = useState<boolean>(false); // Filter untuk tempat yang buka saja
  const [isAddressLoading, setIsAddressLoading] = useState<boolean>(false);

  // Helper to update address text when coords change
  const updateAddress = useCallback(async (newCoords: Coordinates) => {
    setIsAddressLoading(true);
    const address = await getAddressFromCoords(newCoords);
    setAddressName(address);
    setIsAddressLoading(false);
  }, []);

  // Handle Geolocation
  const handleLocateUser = useCallback(() => {
    setAppState(AppState.LOCATING);
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation tidak didukung browser ini.");
      setAppState(AppState.ERROR);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(newCoords);
        updateAddress(newCoords);
        handleSearchPlaces(newCoords, category, radius, onlyOpen);
      },
      (error) => {
        console.error(error);
        setErrorMsg("Gagal mendapatkan lokasi. Pastikan GPS aktif atau gunakan pencarian manual.");
        setAppState(AppState.ERROR);
      }
    );
  }, [category, radius, updateAddress]);

  // Handle Manual Text Search for Location
  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setAppState(AppState.LOCATING);
    const result = await searchLocation(searchQuery);
    
    if (result) {
      setCoords(result);
      updateAddress(result);
      setPlaces([]);
      setSelectedPlace(null);
      setAppState(AppState.IDLE);
    } else {
      setErrorMsg("Lokasi tidak ditemukan. Coba nama yang lebih spesifik.");
      setAppState(AppState.ERROR);
    }
  };

  // Handle Manual Marker Drag
  const handleLocationChange = useCallback((newCoords: Coordinates) => {
    setCoords(newCoords);
    setPlaces([]);
    setSelectedPlace(null);
    setAppState(AppState.IDLE);
    updateAddress(newCoords);
  }, [updateAddress]);

  // Handle Searching Places via OSM Service
  const handleSearchPlaces = async (coordinates: Coordinates, selectedCategory: string, selectedRadius: number, onlyOpenFilter: boolean = false) => {
    setAppState(AppState.SEARCHING);
    try {
      const results = await fetchNearbyPlaces(coordinates, selectedCategory, selectedRadius, onlyOpenFilter);
      if (results.length > 0) {
        setPlaces(results);
        setAppState(AppState.READY);
      } else {
        const message = onlyOpenFilter
          ? `Tidak ada tempat makan yang buka dalam radius ${selectedRadius}m. Coba nonaktifkan filter "Buka Sekarang" atau perbesar jarak.`
          : `Tidak ditemukan tempat makan dalam radius ${selectedRadius}m. Coba perbesar jarak.`;
        setErrorMsg(message);
        setAppState(AppState.ERROR);
      }
    } catch (err: any) {
        console.error(err);
        let msg = "Gagal mengambil data peta. Periksa koneksi internet.";
        
        // Handle specific timeouts
        if (err.message && (err.message.includes("Timeout") || err.message.includes("504"))) {
            msg = "Server peta sedang sibuk (Timeout). Coba kurangi jarak radius atau coba lagi sebentar lagi.";
        }
        
      setErrorMsg(msg);
      setAppState(AppState.ERROR);
    }
  };

  // Handle Picking a Random Place (Roulette Effect)
  const handlePickFood = useCallback(() => {
    if (places.length === 0) return;
    setAppState(AppState.PICKING);
    setSelectedPlace(null);
    
    let counter = 0;
    const maxIterations = 30;
    const intervalTime = 70;
    
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * places.length);
      setRouletteName(places[randomIndex].name);
      counter++;

      if (counter >= maxIterations) {
        clearInterval(interval);
        // Pure random selection
        const winnerIndex = Math.floor(Math.random() * places.length);
        setSelectedPlace(places[winnerIndex]);
        setAppState(AppState.RESULT);
      }
    }, intervalTime);
  }, [places]);

  const resetPicker = () => {
    setSelectedPlace(null);
    setAppState(AppState.READY);
    setRouletteName('???');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-900 relative">
      {/* Header */}
      <header className="px-6 py-4 bg-white shadow-sm z-20 flex flex-col gap-4 sticky top-0">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                    🍔
                </div>
                <h1 className="text-xl font-bold tracking-tight text-gray-800">Food<span className="text-orange-600">Picker</span></h1>
            </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleManualSearch} className="relative w-full">
            <input 
                type="text" 
                placeholder="Cari lokasi (cth: Monas, Jakarta)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-orange-500 transition-all outline-none text-sm"
            />
            <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </form>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full gap-4 pb-24">
        
        {/* Map Section */}
        <div className="h-64 sm:h-72 w-full relative z-0 shadow-md rounded-2xl ring-4 ring-white overflow-hidden">
            {coords ? (
                <MapComponent coords={coords} onLocationChange={handleLocationChange} />
            ) : (
                <div className="w-full h-full bg-slate-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 p-6 text-center">
                    <p className="font-medium mb-2">Peta Lokasi</p>
                    <p className="text-xs">Aktifkan GPS atau cari lokasi manual di atas.</p>
                </div>
            )}
            
            {/* Status Overlay on Map */}
            {appState === AppState.LOCATING && (
                 <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[400] flex items-center justify-center rounded-2xl">
                    <div className="flex items-center gap-2 text-orange-600 font-semibold animate-pulse">
                        Mencari Lokasi...
                    </div>
                 </div>
            )}
        </div>

        {/* Current Location Address Display */}
        {coords && (
            <div className="flex items-start gap-2 px-2 text-sm text-gray-600 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <span className="mt-0.5">📍</span>
                <div className="flex-1">
                    <p className="text-xs text-gray-400 uppercase font-semibold">Lokasi Pencarian</p>
                    {isAddressLoading ? (
                        <span className="animate-pulse bg-gray-200 h-4 w-24 block rounded mt-1"></span>
                    ) : (
                        <p className="font-medium text-gray-800 leading-tight text-xs mt-1">{addressName || "Geser pin untuk set lokasi"}</p>
                    )}
                </div>
            </div>
        )}

        {/* Dynamic Content Area */}
        <div className="flex-1 flex flex-col gap-4">
            
            {/* Error Message */}
            {appState === AppState.ERROR && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start gap-3 animate-fade-in">
                    <span className="text-xl">⚠️</span>
                    <div>
                        <p className="font-semibold">Oops!</p>
                        <p className="text-sm">{errorMsg}</p>
                        <button onClick={() => setAppState(AppState.IDLE)} className="text-xs underline mt-1">Tutup</button>
                    </div>
                </div>
            )}

            {/* Controls: Category & Radius */}
            <div className="flex flex-col gap-3">
                 {/* Categories */}
                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'all', label: 'Semua', icon: '🍽️' },
                        { id: 'restaurant', label: 'Resto', icon: '🏪' },
                        { id: 'cafe', label: 'Kafe', icon: '☕' },
                        { id: 'fast_food', label: 'Fast Food', icon: '🍔' }
                    ].map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setCategory(cat.id);
                                if (coords && (appState === AppState.READY || appState === AppState.IDLE)) {
                                    handleSearchPlaces(coords, cat.id, radius, onlyOpen);
                                }
                            }}
                            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                                category === cat.id 
                                ? 'bg-orange-600 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <span>{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Radius Slider */}
                <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 uppercase w-12">Jarak</span>
                    <input 
                        type="range" 
                        min="500" 
                        max="5000" 
                        step="500" 
                        value={radius} 
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                    <span className="text-xs font-bold text-orange-600 w-12 text-right">
                        {radius >= 1000 ? `${radius/1000}km` : `${radius}m`}
                    </span>
                </div>

                {/* Opening Hours Filter */}
                <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">Filter</span>
                        <span className="text-xs text-gray-600">Hanya yang buka</span>
                    </div>
                    <button
                        onClick={() => {
                            const newOnlyOpen = !onlyOpen;
                            setOnlyOpen(newOnlyOpen);
                            if (coords && (appState === AppState.READY || appState === AppState.IDLE)) {
                                handleSearchPlaces(coords, category, radius, newOnlyOpen);
                            }
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            onlyOpen ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                onlyOpen ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* Initial State */}
            {!coords && appState !== AppState.LOCATING && (
                <div className="text-center py-6 animate-fade-in">
                    <button 
                        onClick={handleLocateUser}
                        className="w-full bg-gray-900 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        📡 Gunakan GPS Saya
                    </button>
                </div>
            )}

            {/* IDLE state with Coords */}
            {coords && (appState === AppState.IDLE || appState === AppState.ERROR) && (
                 <div className="animate-fade-in">
                    <button 
                        onClick={() => handleSearchPlaces(coords, category, radius, onlyOpen)}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2"
                    >
                        🔍 Cari {radius >= 1000 ? `${radius/1000}km` : `${radius}m`} Sekitar
                    </button>
                 </div>
            )}

             {/* Searching State */}
             {appState === AppState.SEARCHING && (
                <div className="text-center py-10 animate-pulse bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-5xl mb-4">🗺️</div>
                    <p className="text-gray-800 font-bold text-lg">Memindai Peta...</p>
                    <p className="text-gray-500 text-sm">Radius {radius}m di sekitar lokasi.</p>
                </div>
            )}

            {/* Ready State */}
            {appState === AppState.READY && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100 animate-fade-in-up">
                    <div className="text-center">
                        <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                            <span>Tempat Terdeteksi:</span>
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                {places.length} Tempat
                            </span>
                        </div>
                        <button 
                            onClick={handlePickFood}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
                        >
                            <span>🎲</span>
                            Acak Sekarang
                        </button>
                    </div>
                </div>
            )}

            {/* Picking (Roulette) State */}
            {appState === AppState.PICKING && (
                <div className="flex-1 flex flex-col items-center justify-center py-12 bg-gray-900 rounded-3xl shadow-2xl relative overflow-hidden">
                    <p className="text-xs text-orange-400 uppercase tracking-[0.3em] font-bold mb-6 z-10">MEMILIH...</p>
                    <div className="text-3xl md:text-4xl font-black text-center text-white animate-bounce z-10 px-4 leading-tight">
                        {rouletteName}
                    </div>
                </div>
            )}

            {/* Result State */}
            {appState === AppState.RESULT && selectedPlace && (
                <PlaceCard place={selectedPlace} onReset={resetPicker} />
            )}

        </div>
      </main>

      {/* Credits */}
      <footer className="w-full text-center py-4 text-xs text-gray-400 bg-slate-50">
        Data © OpenStreetMap contributors
      </footer>
    </div>
  );
};

export default App;