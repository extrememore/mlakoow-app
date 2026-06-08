const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const hiburanImages = [
  'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?q=80&w=1200&auto=format&fit=crop', // roller coaster
  'https://images.unsplash.com/photo-1560840067-ddcaeb6831d2?q=80&w=1200&auto=format&fit=crop', // arcade
  'https://images.unsplash.com/photo-1550096141-8eb99a9a5f4c?q=80&w=1200&auto=format&fit=crop', // waterpark / pool
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1200&auto=format&fit=crop', // cinema
  'https://images.unsplash.com/photo-1518998053401-b53e8d5f3089?q=80&w=1200&auto=format&fit=crop', // bowling
  'https://images.unsplash.com/photo-1543884100-bfb90ee21699?q=80&w=1200&auto=format&fit=crop', // trampoline
  'https://images.unsplash.com/photo-1578374173705-969cbe6f2d6b?q=80&w=1200&auto=format&fit=crop', // escape room / dark
  'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1200&auto=format&fit=crop', // ferris wheel
  'https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=1200&auto=format&fit=crop', // gaming / vr
  'https://images.unsplash.com/photo-1605152276890-8727bc2ac4eb?q=80&w=1200&auto=format&fit=crop'  // indoor playground
];

function getImg(index) {
  return hiburanImages[index % hiburanImages.length];
}

const hiburan = [
  {
    name: "Trans Snow World Surabaya",
    slug: "trans-snow-world-surabaya",
    address: "Jl. Ahmad Yani No.260, Siwalankerto, Wonocolo",
    description: "Nikmati pengalaman bermain salju tanpa harus ke luar negeri. Berbagai wahana salju seru seperti ski, kereta gantung, dan seluncuran tersedia untuk keluarga.",
    ticketPrice: 225000,
    rating: 4.6,
    reviewCount: 3100,
    estimatedDuration: 180,
    lat: -7.3371,
    lng: 112.7312,
    featured: true,
    hiddenGem: false,
    openHour: "10:00",
    closeHour: "20:00",
    facilities: JSON.stringify(["Penyewaan Jaket", "Penyewaan Sepatu Salju", "Loker", "Cafe", "Toilet"]),
    menus: JSON.stringify([])
  },
  {
    name: "Atlantis Land Kenjeran",
    slug: "atlantis-land-kenjeran",
    address: "Jl. Sukolilo No.100, Sukolilo Baru, Bulak",
    description: "Taman hiburan tematik bertema istana bawah laut Atlantis. Memiliki banyak wahana dari yang ramah anak hingga memacu adrenalin, serta waterpark besar.",
    ticketPrice: 100000,
    rating: 4.4,
    reviewCount: 5200,
    estimatedDuration: 300,
    lat: -7.2435,
    lng: 112.7981,
    featured: true,
    hiddenGem: false,
    openHour: "10:00",
    closeHour: "18:00",
    facilities: JSON.stringify(["Waterpark", "Wahana Ekstrem", "Food Court", "Ruang Bilas", "Parkir Luas"]),
    menus: JSON.stringify([])
  },
  {
    name: "KidZania Surabaya",
    slug: "kidzania-surabaya",
    address: "Grand Sungkono Lagoon Avenue Mall, Jl. KH Abdul Wahab Siamin",
    description: "Taman bermain edukatif di mana anak-anak bisa mencoba berbagai profesi seperti dokter, pemadam kebakaran, pilot, dan banyak lagi dalam replika kota yang nyata.",
    ticketPrice: 200000,
    rating: 4.8,
    reviewCount: 2800,
    estimatedDuration: 240,
    lat: -7.2913,
    lng: 112.7061,
    featured: true,
    hiddenGem: false,
    openHour: "10:00",
    closeHour: "17:00",
    facilities: JSON.stringify(["Zona Edukasi", "Ruang Tunggu Orang Tua", "Cafe", "Toilet Anak", "Merchandise Store"]),
    menus: JSON.stringify([])
  },
  {
    name: "Pandora Experience Escape Room",
    slug: "pandora-experience-surabaya",
    address: "Marvell City Mall, Jl. Ngagel Raya No.123",
    description: "Permainan melarikan diri (escape room) dengan teka-teki yang menantang, efek visual dan suara yang menegangkan, cocok untuk dimainkan bersama teman-teman.",
    ticketPrice: 150000,
    rating: 4.7,
    reviewCount: 1500,
    estimatedDuration: 120,
    lat: -7.2926,
    lng: 112.7441,
    featured: false,
    hiddenGem: true,
    openHour: "12:00",
    closeHour: "21:00",
    facilities: JSON.stringify(["Briefing Room", "Loker", "Ruang AC", "Tempat Foto"]),
    menus: JSON.stringify([])
  },
  {
    name: "Timezone Tunjungan Plaza",
    slug: "timezone-tunjungan-plaza",
    address: "Tunjungan Plaza 3, Jl. Basuki Rahmat No.8-12",
    description: "Pusat hiburan arkade indoor terlengkap dengan berbagai mesin permainan terbaru, mesin capit boneka, balapan, hingga VR experience.",
    ticketPrice: 50000,
    rating: 4.6,
    reviewCount: 4200,
    estimatedDuration: 120,
    lat: -7.2625,
    lng: 112.7397,
    featured: true,
    hiddenGem: false,
    openHour: "10:00",
    closeHour: "22:00",
    facilities: JSON.stringify(["Mesin Arkade", "VR Box", "Penukaran Tiket", "Sofa Tunggu"]),
    menus: JSON.stringify([])
  },
  {
    name: "Strike Bowling Kaza Mall",
    slug: "strike-bowling-kaza",
    address: "Kaza City Mall Lt. 3, Jl. Kapas Krampung No.45",
    description: "Arena bowling modern yang seru dan asyik untuk dimainkan bersama keluarga atau teman. Fasilitas sepatu khusus dan bola berbagai ukuran tersedia lengkap.",
    ticketPrice: 35000,
    rating: 4.3,
    reviewCount: 890,
    estimatedDuration: 120,
    lat: -7.2471,
    lng: 112.7594,
    featured: false,
    hiddenGem: true,
    openHour: "11:00",
    closeHour: "21:00",
    facilities: JSON.stringify(["Arena Bowling", "Sewa Sepatu", "Area Duduk", "Kantin"]),
    menus: JSON.stringify([])
  },
  {
    name: "Food Junction Grand Pakuwon",
    slug: "food-junction-grand-pakuwon",
    address: "Jl. Grand Pakuwon, Banjar Sugihan, Tandes",
    description: "Bukan hanya tempat makan, tapi juga taman hiburan outdoor yang sangat asyik di sore hari. Terdapat danau buatan, bianglala raksasa, komedi putar, dan mobil-mobilan.",
    ticketPrice: 20000,
    rating: 4.5,
    reviewCount: 6100,
    estimatedDuration: 180,
    lat: -7.2515,
    lng: 112.6651,
    featured: true,
    hiddenGem: false,
    openHour: "11:00",
    closeHour: "22:00",
    facilities: JSON.stringify(["Bianglala", "Food Court Luas", "Danau Buatan", "Spot Foto", "Area Parkir Ekstra Luas"]),
    menus: JSON.stringify([])
  },
  {
    name: "Amped Trampoline Park",
    slug: "amped-trampoline-park-surabaya",
    address: "Pakuwon Mall, Lantai 2",
    description: "Taman bermain trampolin dalam ruangan yang sangat luas. Anda bisa melompat bebas, bermain dodgeball, atau sekadar berolahraga dengan cara yang menyenangkan.",
    ticketPrice: 100000,
    rating: 4.6,
    reviewCount: 1200,
    estimatedDuration: 120,
    lat: -7.2891,
    lng: 112.6750,
    featured: false,
    hiddenGem: false,
    openHour: "10:00",
    closeHour: "21:00",
    facilities: JSON.stringify(["Area Melompat Bebas", "Kolam Busa", "Dodgeball Arena", "Loker", "Kaus Kaki Khusus"]),
    menus: JSON.stringify([])
  },
  {
    name: "CGV Cinemas Marvell City",
    slug: "cgv-marvell-city",
    address: "Marvell City Mall, Jl. Ngagel Raya No.123",
    description: "Bioskop premium dengan berbagai auditorium seperti 4DX, Velvet Class, dan Regular. Menonton film dengan kualitas audio visual terbaik di Surabaya.",
    ticketPrice: 45000,
    rating: 4.7,
    reviewCount: 4500,
    estimatedDuration: 150,
    lat: -7.2926,
    lng: 112.7441,
    featured: true,
    hiddenGem: false,
    openHour: "11:00",
    closeHour: "23:00",
    facilities: JSON.stringify(["4DX", "Velvet Bed", "Sweetbox", "Popcorn & Snack", "Ruang Tunggu Nyaman"]),
    menus: JSON.stringify([])
  },
  {
    name: "Playtopia Pakuwon Mall",
    slug: "playtopia-pakuwon",
    address: "Pakuwon Mall Surabaya Lt. 2",
    description: "Taman bermain anak indoor yang sangat populer dengan berbagai atraksi interaktif, kolam bola raksasa, seluncuran, dan area halang rintang yang aman.",
    ticketPrice: 125000,
    rating: 4.8,
    reviewCount: 2200,
    estimatedDuration: 180,
    lat: -7.2891,
    lng: 112.6750,
    featured: false,
    hiddenGem: false,
    openHour: "10:00",
    closeHour: "22:00",
    facilities: JSON.stringify(["Kolam Bola", "Seluncuran Ekstrem Anak", "Ruang Tunggu", "Penitipan Sepatu"]),
    menus: JSON.stringify([])
  },
  {
    name: "Trans Studio Mini Rungkut",
    slug: "trans-studio-mini-rungkut",
    address: "Transmart Rungkut, Jl. Raya Kalirungkut No.23",
    description: "Versi mini dari Trans Studio yang berlokasi di dalam mal. Terdapat roller coaster indoor yang melintasi luar gedung, bombom car, dan berbagai permainan arkade.",
    ticketPrice: 75000,
    rating: 4.4,
    reviewCount: 3800,
    estimatedDuration: 150,
    lat: -7.3195,
    lng: 112.7668,
    featured: false,
    hiddenGem: false,
    openHour: "10:00",
    closeHour: "21:00",
    facilities: JSON.stringify(["Crazy Cab Coaster", "Bumper Car", "Mesin Arkade", "Food Court Transmart"]),
    menus: JSON.stringify([])
  },
  {
    name: "Suroboyo Carnival Park",
    slug: "suroboyo-carnival-park",
    address: "Jl. Ahmad Yani No.333, Dukuh Menanggal",
    description: "Taman hiburan malam hari terbesar di Surabaya (berbasis pasar malam modern) dengan berbagai wahana seru, rumah hantu, dan spot foto lampu-lampu indah.",
    ticketPrice: 60000,
    rating: 4.3,
    reviewCount: 7500,
    estimatedDuration: 240,
    lat: -7.3400,
    lng: 112.7290,
    featured: true,
    hiddenGem: false,
    openHour: "16:00",
    closeHour: "23:00",
    facilities: JSON.stringify(["Wahana Malam", "Museum 3D", "Rumah Hantu", "Food Court", "Parkir Luas"]),
    menus: JSON.stringify([])
  },
  {
    name: "Funworld Galaxy Mall",
    slug: "funworld-galaxy-mall",
    address: "Galaxy Mall 3, Jl. Dr. Ir. H. Soekarno No.178",
    description: "Pusat hiburan arkade keluarga yang ramah untuk semua umur. Dilengkapi mesin game terbaru, atraksi VR, serta mesin penjepit boneka premium.",
    ticketPrice: 50000,
    rating: 4.5,
    reviewCount: 1600,
    estimatedDuration: 120,
    lat: -7.2750,
    lng: 112.7820,
    featured: false,
    hiddenGem: false,
    openHour: "10:00",
    closeHour: "22:00",
    facilities: JSON.stringify(["Mesin Arkade", "VR Game", "Tukar Tiket", "Sofa Istirahat"]),
    menus: JSON.stringify([])
  },
  {
    name: "Ciputra Waterpark",
    slug: "ciputra-waterpark",
    address: "Kawasan Waterpark Boulevard Citraland",
    description: "Taman bermain air terbesar di Surabaya dengan tema petualangan Sinbad. Terdapat kolam ombak, menara seluncur air, dan kolam arus yang santai.",
    ticketPrice: 110000,
    rating: 4.5,
    reviewCount: 4800,
    estimatedDuration: 300,
    lat: -7.2882,
    lng: 112.6315,
    featured: true,
    hiddenGem: false,
    openHour: "09:00",
    closeHour: "17:00",
    facilities: JSON.stringify(["Kolam Ombak", "Water Slider", "Penyewaan Ban", "Gazebo", "Food Court"]),
    menus: JSON.stringify([])
  },
  {
    name: "E-Sports Arena Supermal Pakuwon",
    slug: "esports-arena-pakuwon",
    address: "Pakuwon Mall Surabaya",
    description: "Warnet PC premium dan konsol E-Sports terlengkap dengan PC spesifikasi dewa, kursi gaming razer, dan suasana turnamen kelas dunia.",
    ticketPrice: 15000,
    rating: 4.8,
    reviewCount: 950,
    estimatedDuration: 180,
    lat: -7.2891,
    lng: 112.6750,
    featured: false,
    hiddenGem: true,
    openHour: "10:00",
    closeHour: "22:00",
    facilities: JSON.stringify(["PC High-End", "PS5 & Switch Area", "Private Room", "Snack Bar"]),
    menus: JSON.stringify([])
  },
  {
    name: "Taman Hutan Raya Jeruk",
    slug: "tahura-jeruk-surabaya",
    address: "Jl. Raya Menganti Jeruk, Lakarsantri",
    description: "Ruang terbuka hijau yang tenang dan sejuk. Selain edukasi flora, pengunjung juga bisa menikmati outbond mini, berkuda, dan panahan.",
    ticketPrice: 5000,
    rating: 4.5,
    reviewCount: 2200,
    estimatedDuration: 150,
    lat: -7.3115,
    lng: 112.6568,
    featured: false,
    hiddenGem: true,
    openHour: "07:00",
    closeHour: "17:00",
    facilities: JSON.stringify(["Area Panahan", "Penyewaan Kuda", "Area Piknik", "Toilet", "Jogging Track"]),
    menus: JSON.stringify([])
  }
];

async function seed() {
  let category = await prisma.category.findUnique({ where: { slug: 'hiburan' } });
  
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Hiburan',
        slug: 'hiburan',
        icon: '🎢',
        color: '#8B5CF6'
      }
    });
  }

  console.log('Menambahkan 16 Destinasi Hiburan...');

  for (let i = 0; i < hiburan.length; i++) {
    const dest = hiburan[i];
    
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
        categoryId: category.id,
        mainImage: img1,
        gallery: gallery,
      },
      create: {
        ...dest,
        area: "Surabaya",
        categoryId: category.id,
        mainImage: img1,
        gallery: gallery,
      }
    });
  }

  console.log('16 Destinasi Hiburan berhasil ditambahkan!');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
