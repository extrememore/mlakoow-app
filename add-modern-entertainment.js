const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const modernImages = [
  'https://images.unsplash.com/photo-1550096141-8eb99a9a5f4c?q=80&w=1200&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1622295679549-923f779bce6d?q=80&w=1200&auto=format&fit=crop', // photo studio
  'https://images.unsplash.com/photo-1596450514735-111a2fea0291?q=80&w=1200&auto=format&fit=crop', // vr/modern
  'https://images.unsplash.com/photo-1616082408361-b1e7c5409db8?q=80&w=1200&auto=format&fit=crop', // photo camera
  'https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=1200&auto=format&fit=crop'  // gaming
];

function getImg(index) {
  return modernImages[index % modernImages.length];
}

const modernSpots = [
  {
    name: "Seori Self Photo Studio",
    slug: "seori-self-photo-studio",
    address: "Jl. Tunjungan No.88, Surabaya",
    description: "Self-photo studio bergaya Korea yang sangat estetik. Bebas berfoto tanpa canggung karena tidak ada fotografer di dalam ruangan, menggunakan remote kamera.",
    ticketPrice: 120000,
    rating: 4.8,
    reviewCount: 450,
    estimatedDuration: 45,
    lat: -7.2625,
    lng: 112.7400,
    featured: true,
    hiddenGem: false,
    openHour: "10:00",
    closeHour: "21:00",
    facilities: JSON.stringify(["Kamera Profesional", "Remote Clicker", "Aksesoris Lucu", "Cetak Foto Langsung", "Softcopy Digital"]),
    menus: JSON.stringify([])
  },
  {
    name: "Photomatics Tunjungan Plaza",
    slug: "photomatics-tp",
    address: "Tunjungan Plaza 3, Lantai 5",
    description: "Kabin photobox retro dan modern kekinian yang sering viral di TikTok. Punya berbagai frame edisi terbatas dan hasil cetak yang tajam.",
    ticketPrice: 35000,
    rating: 4.6,
    reviewCount: 890,
    estimatedDuration: 15,
    lat: -7.2625,
    lng: 112.7397,
    featured: false,
    hiddenGem: false,
    openHour: "10:00",
    closeHour: "22:00",
    facilities: JSON.stringify(["Photobox Booth", "Frame Unik", "Softcopy via QR", "Props Foto"]),
    menus: JSON.stringify([])
  },
  {
    name: "Sandbox VR Surabaya",
    slug: "sandbox-vr-surabaya",
    address: "Pakuwon Mall Lantai 2",
    description: "Pengalaman Virtual Reality (VR) full-body tingkat dunia. Bermain game aksi, zombie, hingga petualangan luar angkasa bersama teman dengan sensor tubuh lengkap.",
    ticketPrice: 200000,
    rating: 4.9,
    reviewCount: 310,
    estimatedDuration: 60,
    lat: -7.2891,
    lng: 112.6750,
    featured: true,
    hiddenGem: false,
    openHour: "10:00",
    closeHour: "22:00",
    facilities: JSON.stringify(["Full-Body VR Suit", "Arena Luas", "Loker", "Video Recap Gameplay"]),
    menus: JSON.stringify([])
  },
  {
    name: "Pictura Self Studio",
    slug: "pictura-self-studio",
    address: "Jl. Raya Darmo Permai II",
    description: "Self-photo studio premium dengan pilihan latar belakang estetik, dari gaya monokrom elegan hingga pastel yang ceria.",
    ticketPrice: 150000,
    rating: 4.7,
    reviewCount: 220,
    estimatedDuration: 60,
    lat: -7.2840,
    lng: 112.6850,
    featured: false,
    hiddenGem: true,
    openHour: "09:00",
    closeHour: "20:00",
    facilities: JSON.stringify(["Ganti Latar", "Lighting Studio", "Banyak Props", "Private Room", "Retouch Foto"]),
    menus: JSON.stringify([])
  },
  {
    name: "Supernova Laser Tag",
    slug: "supernova-laser-tag",
    address: "Galaxy Mall 3",
    description: "Arena bermain tembak-tembakan laser tag indoor futuristik. Gelap, penuh lampu neon, dan sangat seru untuk dimainkan dalam format tim.",
    ticketPrice: 75000,
    rating: 4.5,
    reviewCount: 510,
    estimatedDuration: 45,
    lat: -7.2750,
    lng: 112.7820,
    featured: false,
    hiddenGem: false,
    openHour: "11:00",
    closeHour: "21:00",
    facilities: JSON.stringify(["Vest Laser Sensor", "Briefing Room", "Loker", "Leaderboard Display"]),
    menus: JSON.stringify([])
  },
  {
    name: "SnapBox PTC",
    slug: "snapbox-ptc",
    address: "Pakuwon Trade Center (PTC) Lt. UG",
    description: "Photobox tematik gaya Y2K yang selalu update frame-frame lucu sesuai perayaan bulan ini. Sangat disukai anak muda Surabaya.",
    ticketPrice: 30000,
    rating: 4.4,
    reviewCount: 1100,
    estimatedDuration: 15,
    lat: -7.2891,
    lng: 112.6750,
    featured: false,
    hiddenGem: false,
    openHour: "10:00",
    closeHour: "21:30",
    facilities: JSON.stringify(["Y2K Props", "High-res Print", "Digital Copy"]),
    menus: JSON.stringify([])
  },
  {
    name: "Lumina Interactive Art Museum",
    slug: "lumina-interactive-art",
    address: "Ciputra World Surabaya",
    description: "Museum seni digital interaktif dengan proyeksi cahaya dan sensor sentuh 360 derajat. Sangat cocok sebagai spot foto futuristik dan hiburan modern.",
    ticketPrice: 85000,
    rating: 4.8,
    reviewCount: 950,
    estimatedDuration: 90,
    lat: -7.2915,
    lng: 112.7150,
    featured: true,
    hiddenGem: false,
    openHour: "10:00",
    closeHour: "21:00",
    facilities: JSON.stringify(["Digital Projection", "Interactive Floor", "Kaca Tanpa Batas", "AC"]),
    menus: JSON.stringify([])
  },
  {
    name: "The Portrait Place by X",
    slug: "portrait-place-sby",
    address: "G-Walk Citraland",
    description: "Konsep studio foto swalayan bergaya industriil dan minimalis. Memberikan kebebasan berekspresi penuh tanpa rasa malu.",
    ticketPrice: 100000,
    rating: 4.6,
    reviewCount: 340,
    estimatedDuration: 45,
    lat: -7.2855,
    lng: 112.6450,
    featured: false,
    hiddenGem: true,
    openHour: "11:00",
    closeHour: "22:00",
    facilities: JSON.stringify(["Peralatan Lengkap", "Kacamata Hitam Props", "Bebas Ganti Baju"]),
    menus: JSON.stringify([])
  },
  {
    name: "Zero Latency SBY",
    slug: "zero-latency-sby",
    address: "Pakuwon Mall Lantai 2",
    description: "Free-roam VR (Virtual Reality) pertama di Surabaya. Anda bisa berlari dan berjalan bebas di area seluas 200m2 melawan musuh virtual.",
    ticketPrice: 250000,
    rating: 4.9,
    reviewCount: 220,
    estimatedDuration: 60,
    lat: -7.2891,
    lng: 112.6750,
    featured: true,
    hiddenGem: false,
    openHour: "10:00",
    closeHour: "22:00",
    facilities: JSON.stringify(["VR Headset", "Senjata Haptic", "Ruang Ganti", "Arena Luas"]),
    menus: JSON.stringify([])
  },
  {
    name: "K-Photo Booth Royal Plaza",
    slug: "k-photo-booth-royal",
    address: "Royal Plaza Lantai 3",
    description: "Bilik foto yang membawa nuansa asli dari jalanan Hongdae, Korea Selatan. Banyak properti bando kelinci dan kacamata lucu yang identik dengan K-Pop idol.",
    ticketPrice: 40000,
    rating: 4.5,
    reviewCount: 1300,
    estimatedDuration: 15,
    lat: -7.3090,
    lng: 112.7340,
    featured: false,
    hiddenGem: false,
    openHour: "10:00",
    closeHour: "21:30",
    facilities: JSON.stringify(["Bando K-Pop", "Frame Idola", "Cetak Cepat", "Softcopy"]),
    menus: JSON.stringify([])
  }
];

async function seed() {
  // Kita cari kategori Hiburan atau Spot Foto
  let categoryHiburan = await prisma.category.findUnique({ where: { slug: 'hiburan' } });
  if (!categoryHiburan) {
    categoryHiburan = await prisma.category.create({
      data: { name: 'Hiburan', slug: 'hiburan', icon: '🎢', color: '#8B5CF6' }
    });
  }

  let categorySpotFoto = await prisma.category.findUnique({ where: { slug: 'spot-foto' } });
  if (!categorySpotFoto) {
    categorySpotFoto = await prisma.category.create({
      data: { name: 'Spot Foto', slug: 'spot-foto', icon: '📸', color: '#EC4899' }
    });
  }

  console.log('Menambahkan 10 Destinasi Hiburan Modern & Photo Studio...');

  for (let i = 0; i < modernSpots.length; i++) {
    const dest = modernSpots[i];
    
    // Tentukan kategori: jika ada kata "Photo" atau "Studio" atau "Booth", masukkan ke Spot Foto, sisanya Hiburan
    const isPhotoSpot = dest.name.toLowerCase().includes('photo') || 
                        dest.name.toLowerCase().includes('studio') || 
                        dest.name.toLowerCase().includes('booth') ||
                        dest.name.toLowerCase().includes('snap');
    
    const targetCategoryId = isPhotoSpot ? categorySpotFoto.id : categoryHiburan.id;

    // Default gallery from images
    const img1 = getImg(i * 3);
    const img2 = getImg(i * 3 + 1);
    const img3 = getImg(i * 3 + 2);
    const gallery = JSON.stringify([img1, img2, img3]);

    await prisma.destination.upsert({
      where: { slug: dest.slug },
      update: {
        ...dest,
        area: "Surabaya",
        categoryId: targetCategoryId,
        mainImage: img1,
        gallery: gallery,
      },
      create: {
        ...dest,
        area: "Surabaya",
        categoryId: targetCategoryId,
        mainImage: img1,
        gallery: gallery,
      }
    });
  }

  console.log('10 Destinasi Baru berhasil ditambahkan!');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
