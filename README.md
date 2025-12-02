# FoodPicker - Aplikasi Pemilih Tempat Makan Acak

<div align="center">
  <img width="1900" height="806" alt="image" src="https://github.com/user-attachments/assets/437b6024-b7bd-493a-b8db-cf549b9dedc4" />
  <img width="1898" height="808" alt="image" src="https://github.com/user-attachments/assets/0fa4c0b0-94de-40cd-9757-eee60afed47d" />
</div>

Aplikasi web berbasis React yang membantu Anda memilih tempat makan secara acak di sekitar lokasi Anda. Menggunakan data OpenStreetMap untuk menemukan berbagai jenis tempat makan seperti restoran, kafe, dan fast food.

## 🚀 Fitur Utama

- **🗺️ Peta Interaktif**: Visualisasi lokasi dengan peta yang dapat digeser
- **📍 Deteksi Lokasi Otomatis**: Menggunakan GPS perangkat untuk menemukan lokasi Anda
- **🔍 Pencarian Lokasi Manual**: Cari lokasi dengan nama tempat (contoh: "Monas, Jakarta")
- **🍽️ Berbagai Kategori**:
  - Semua tempat makan
  - Restoran
  - Kafe
  - Fast Food
- **📏 Radius Kustom**: Atur jarak pencarian dari 500m hingga 5km
- **🕐 Filter Jam Buka**: Hanya tampilkan tempat yang buka saat ini
- **🎲 Pemilihan Acak**: Animasi roulette yang menarik untuk memilih tempat makan
- **📱 Responsive Design**: Tampilan optimal di berbagai ukuran layar
- **🌐 Gratis**: Menggunakan OpenStreetMap API yang gratis dan terbuka

## 🛠️ Teknologi yang Digunakan

- **React 19.2.0** - Framework frontend modern
- **TypeScript** - Type safety untuk development yang lebih baik
- **OpenLayers 10.4.0** - Library peta interaktif
- **OpenStreetMap APIs**:
  - Overpass API untuk pencarian tempat
  - Nominatim API untuk geocoding
- **Vite** - Build tool yang cepat dan modern
- **Tailwind CSS** - Utility-first CSS framework (melalui inline styles)

## 📦 Dependencies

### Runtime Dependencies
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "ol": "10.4.0",
  "@google/genai": "^1.30.0"
}
```

### Development Dependencies
```json
{
  "@types/node": "^22.14.0",
  "@vitejs/plugin-react": "^5.0.0",
  "typescript": "~5.8.2",
  "vite": "^6.2.0"
}
```

## 🚀 Cara Menjalankan Aplikasi

### Prasyarat
- Node.js (versi 16 atau lebih tinggi)
- npm atau yarn

### Instalasi dan Menjalankan

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd randomFood
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Jalankan aplikasi dalam mode development**
   ```bash
   npm run dev
   ```

4. **Buka browser**
   Aplikasi akan berjalan di `http://localhost:5173`

### Build untuk Produksi

```bash
# Build aplikasi
npm run build

# Preview hasil build
npm run preview
```

## 📁 Struktur Proyek

```
randomFood/
├── components/           # Komponen React
│   ├── MapComponent.tsx # Komponen peta interaktif
│   └── PlaceCard.tsx    # Kartu hasil tempat makan
├── services/            # Layanan dan API
│   └── geminiService.ts # Integrasi OpenStreetMap API
├── App.tsx              # Komponen utama aplikasi
├── types.ts             # Type definitions TypeScript
├── index.html           # Template HTML
├── index.tsx           # Entry point aplikasi
├── package.json        # Konfigurasi dependencies
├── tsconfig.json       # Konfigurasi TypeScript
├── vite.config.ts      # Konfigurasi Vite
└── README.md           # Dokumentasi proyek
```

## 🔧 Cara Kerja Aplikasi

### 1. Deteksi Lokasi
- **GPS Otomatis**: Menggunakan `navigator.geolocation` API untuk mendapatkan lokasi pengguna
- **Pencarian Manual**: Menggunakan Nominatim API untuk mencari lokasi berdasarkan nama

### 2. Pencarian Tempat Makan
- Menggunakan Overpass API untuk query OpenStreetMap
- Mencari tempat dengan tags: `restaurant`, `cafe`, `fast_food`, dll.
- Filter berdasarkan radius dan kategori
- Menghapus tempat dengan nama generik

### 3. Pemilihan Acak
- Animasi roulette dengan 30 iterasi
- Pemilihan acak murni dari hasil pencarian
- Tampilan hasil dengan detail tempat dan link Google Maps

### 4. Filter Jam Buka
- Data jam buka diambil dari OpenStreetMap
- Parsing format OSM opening_hours (contoh: "Mo-Fr 08:00-22:00")
- Deteksi otomatis status buka/tutup berdasarkan waktu real-time
- Toggle filter untuk hanya menampilkan tempat yang buka
- Tampilan jam buka hari ini di hasil akhir

## 🌐 API yang Digunakan

### OpenStreetMap Overpass API
- **Endpoint**: `https://overpass-api.de/api/interpreter`
- **Fungsi**: Mencari tempat makan di sekitar koordinat
- **Timeout**: 90 detik
- **Rate Limit**: Tinggi (gratis)

### OpenStreetMap Nominatim API
- **Endpoint**: `https://nominatim.openstreetmap.org`
- **Fungsi**: Geocoding (nama lokasi → koordinat) dan reverse geocoding
- **Rate Limit**: 1 request per detik
- **Tanpa API Key Required**

## 🎨 State Management

Aplikasi menggunakan state management React hooks dengan status berikut:

```typescript
enum AppState {
  IDLE = 'IDLE',          // Menunggu input user
  LOCATING = 'LOCATING',  // Sedang mencari lokasi
  SEARCHING = 'SEARCHING', // Sedang mencari tempat
  READY = 'READY',        // Siap untuk pemilihan acak
  PICKING = 'PICKING',    // Sedang animasi roulette
  RESULT = 'RESULT',      // Menampilkan hasil
  ERROR = 'ERROR'         // Terjadi error
}
```

## 📱 Fitur Peta

- **Drag & Drop**: Seret marker untuk mengubah lokasi
- **Zoom**: Pinch to zoom atau scroll
- **Centering**: Otomatis center ke lokasi yang dipilih
- **Responsive**: Menyesuaikan ukuran layar

## 🔍 Kategori Pencarian

Aplikasi mendukung beberapa kategori tempat makan:

- **Semua**: Semua jenis tempat makan
- **Resto**: Restaurant, food court, warmindo, makan
- **Kafe**: Cafe, internet_cafe, coffee, tea, bubble_tea
- **Fast Food**: Fast food chains

## 📊 Data Sources

- **OpenStreetMap**: Database peta global open-source
- **Contributors**: Komunitas global pemeta sukarela
- **Update Real-time**: Data diperbarui secara berkala

## 🐛 Troubleshooting

### Error Umum

1. **GPS tidak tersedia**
   - Pastikan GPS aktif di perangkat
   - Gunakan pencarian manual sebagai alternatif

2. **Tidak ada tempat ditemukan**
   - Perbesar radius pencarian
   - Coba ganti kategori
   - Pastikan lokasi valid

3. **Timeout server**
   - Kurangi radius pencarian
   - Coba lagi beberapa saat

4. **Maps tidak muncul**
   - Periksa koneksi internet
   - Refresh halaman

## 🤝 Kontribusi

Contributions are welcome! Silakan fork repository dan buat pull request.

## 📄 Lisensi

Project ini menggunakan data dari OpenStreetMap yang dilisensikan under ODbL.

---

**Built with ❤️ using React, TypeScript, and OpenStreetMap**
