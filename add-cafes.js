const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const cafeImages = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1445116572660-236099cecb33?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501339817309-1461ba14ce4c?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1481833758786-ceed14326ea0?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop'
];

const foodImages = [
  'https://images.unsplash.com/photo-1495474472201-40916a2ff5b4?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1463797221720-6b07e6ceedbd?q=80&w=600&auto=format&fit=crop'
];

function getImg(seed) {
  return cafeImages[seed % cafeImages.length];
}

const cafes = [
  {
    name: "Titik Koma Coffee",
    slug: "titik-koma-coffee",
    description: "Titik Koma Coffee adalah salah satu pelopor kedai kopi berkonsep minimalis di Surabaya. Tempat ini sangat digemari oleh anak muda untuk nongkrong atau mengerjakan tugas karena suasananya yang tenang dan colokan listrik yang melimpah. Kopi andalannya, Kopi Susu Aren, menjadi favorit banyak pengunjung.",
    
    lat: -7.288921, lng: 112.735123,
    address: "Jl. Biliton No.25, Gubeng, Surabaya",
    rating: 4.6, reviewCount: 320, ticketPrice: 35000,
    openHour: "08:00", closeHour: "22:00",
    facilities: JSON.stringify(["WiFi Kencang", "Colokan Listrik", "AC", "Area Merokok", "Mushola"]),
    featured: true, hiddenGem: false,
    menus: JSON.stringify([
      { name: "Kopi Susu Aren Titik Koma", ticketPrice: 25000, desc: "Kopi susu dengan gula aren asli", image: foodImages[0], recommended: true },
      { name: "Americano", ticketPrice: 22000, desc: "Espresso dengan air", image: foodImages[1] },
      { name: "Croissant Butter", ticketPrice: 30000, desc: "Pastry renyah dengan rasa mentega", image: foodImages[2], recommended: true }
    ])
  },
  {
    name: "Communale Space",
    slug: "communale-space",
    description: "Communale Space menawarkan konsep semi-outdoor yang asri dengan banyak tanaman hijau, membuatnya seperti oase di tengah teriknya kota Surabaya. Tempat ini memadukan kedai kopi, eatery, dan ruang kreatif.",
    
    lat: -7.281234, lng: 112.748901,
    address: "Jl. Pucang Anom Timur, Gubeng, Surabaya",
    rating: 4.5, reviewCount: 215, ticketPrice: 50000,
    openHour: "10:00", closeHour: "23:00",
    facilities: JSON.stringify(["WiFi", "Area Outdoor", "Live Music", "Parkir Luas"]),
    featured: false, hiddenGem: true,
    menus: JSON.stringify([
      { name: "V60 Filter Coffee", ticketPrice: 35000, desc: "Kopi seduh manual pilihan bean lokal", image: foodImages[0] }
    ])
  },
  {
    name: "Tropicola Coffee & Eatery",
    slug: "tropicola-coffee-eatery",
    description: "Membawa nuansa tropical ala Bali ke jantung Surabaya. Tropicola sangat estetik dengan warna pastel dan dekorasi rotan. Menunya bervariasi dari kopi hingga makanan berat fusion.",
    
    lat: -7.265432, lng: 112.743210,
    address: "Jl. Sumatra, Gubeng, Surabaya",
    rating: 4.7, reviewCount: 450, ticketPrice: 75000,
    openHour: "11:00", closeHour: "23:00",
    facilities: JSON.stringify(["WiFi", "Spot Foto", "Valet Parking", "VIP Room"]),
    featured: true, hiddenGem: false
  },
  {
    name: "Kuppel Biergarten & Bar",
    slug: "kuppel-biergarten",
    description: "Kuppel bukan sekadar tempat nongkrong, bentuk bangunannya yang unik seperti kubah kaca raksasa membuatnya sangat ikonik. Malam hari di sini ditemani lampu-lampu indah dan penampilan DJ.",
    
    lat: -7.284567, lng: 112.678901,
    address: "Bukit Telaga Golf, Citraland, Surabaya",
    rating: 4.8, reviewCount: 890, ticketPrice: 150000,
    openHour: "17:00", closeHour: "02:00",
    facilities: JSON.stringify(["Live DJ", "Alkohol", "VIP Area", "Parkir Valet"]),
    featured: true, hiddenGem: false
  },
  {
    name: "Historica Coffee & Pastry",
    slug: "historica-coffee",
    description: "Bagi pecinta gaya klasik dan retro, Historica adalah jawabannya. Bangunan tua Belanda yang disulap menjadi cafe elegan ini menawarkan aneka pastry lezat yang dipanggang segar setiap hari.",
    
    lat: -7.266789, lng: 112.744567,
    address: "Jl. Sumatra No. 40, Surabaya",
    rating: 4.6, reviewCount: 340, ticketPrice: 60000,
    openHour: "07:00", closeHour: "22:00",
    facilities: JSON.stringify(["WiFi", "AC", "Pastry Fresh", "Area Merokok Terpisah"]),
    featured: false, hiddenGem: true
  },
  {
    name: "Caturra Espresso",
    slug: "caturra-espresso",
    description: "Kedai kopi spesialis untuk para purist kopi. Caturra menyajikan biji kopi yang di-roast sendiri dan memiliki interior minimalis industrial. Tempat yang sangat nyaman untuk work from cafe (WFC).",
    
    lat: -7.279812, lng: 112.741234,
    address: "Jl. Anjasmoro, Sawahan, Surabaya",
    rating: 4.7, reviewCount: 410, ticketPrice: 40000,
    openHour: "08:00", closeHour: "21:00",
    facilities: JSON.stringify(["WiFi Cepat", "Colokan Lengkap", "Ruang Meeting", "AC"]),
    featured: false, hiddenGem: false
  },
  {
    name: "Noach Cafe & Bistro",
    slug: "noach-cafe",
    description: "Cafe premium dengan desain interior modern kontemporer. Sangat luas, nyaman untuk keluarga, arisan, maupun kencan. Makanan yang ditawarkan mulai dari western hingga asian.",
    
    lat: -7.275678, lng: 112.747890,
    address: "Jl. Pregolan No. 4, Tegalsari, Surabaya",
    rating: 4.8, reviewCount: 620, ticketPrice: 100000,
    openHour: "10:30", closeHour: "22:30",
    facilities: JSON.stringify(["WiFi", "Private Room", "Live Music", "Valet"]),
    featured: true, hiddenGem: false
  },
  {
    name: "Kudos Cafe",
    slug: "kudos-cafe",
    description: "Berada di kawasan Barat Surabaya, Kudos mengusung tema monokrom dan kayu yang chic. Makanan andalannya berupa pizza dan pasta. Sangat cocok untuk sesi foto OOTD.",
    
    lat: -7.288901, lng: 112.671234,
    address: "Pakuwon Square AK 2, Surabaya Barat",
    rating: 4.5, reviewCount: 280, ticketPrice: 80000,
    openHour: "08:00", closeHour: "22:00",
    facilities: JSON.stringify(["WiFi", "Spot Foto", "Area Outdoor"]),
    featured: false, hiddenGem: false
  },
  {
    name: "Oost Koffie & Thee",
    slug: "oost-koffie",
    description: "Sesuai namanya yang berbau Belanda, cafe ini berada di bangunan tua yang asri. Pilihan teh artisannya sangat banyak, dipadukan dengan cake yang lumer di mulut.",
    
    lat: -7.254321, lng: 112.745678,
    address: "Jl. Kaliwaron, Tambaksari, Surabaya",
    rating: 4.4, reviewCount: 150, ticketPrice: 45000,
    openHour: "09:00", closeHour: "21:00",
    facilities: JSON.stringify(["WiFi", "Perpustakaan Mini", "AC"]),
    featured: false, hiddenGem: true
  },
  {
    name: "Threelogy Coffee",
    slug: "threelogy-coffee",
    description: "Threelogy selalu ramai. Desainnya yang modern minimalist dengan dominasi warna putih membuat tempat ini terlihat sangat luas. Kopinya strong dan kuenya enak.",
    
    lat: -7.268901, lng: 112.735678,
    address: "Jl. Mojopahit, Keputran, Surabaya",
    rating: 4.6, reviewCount: 510, ticketPrice: 50000,
    openHour: "07:00", closeHour: "21:00",
    facilities: JSON.stringify(["WiFi", "Sofa Nyaman", "Outdoor Seating"]),
    featured: true, hiddenGem: false
  },
  {
    name: "Grandfather Coffee Shop",
    slug: "grandfather-coffee",
    description: "Seperti namanya, mengunjungi cafe ini seperti berkunjung ke rumah kakek. Perabotan vintage, motor antik, dan suasana remang yang cozy membuat Grandfather cocok untuk ngobrol santai di malam hari.",
    
    lat: -7.271234, lng: 112.748901,
    address: "Jl. Kalasan No. 25, Tambaksari, Surabaya",
    rating: 4.7, reviewCount: 390, ticketPrice: 35000,
    openHour: "17:00", closeHour: "00:00",
    facilities: JSON.stringify(["Live Acoustic", "Area Merokok Luas", "Parkir Motor"]),
    featured: false, hiddenGem: true
  },
  {
    name: "Caloria",
    slug: "caloria",
    description: "Caloria menyajikan comfort food dan dessert manis yang tak terlupakan. Desain interiornya fun dengan dominasi warna pastel yang ceria.",
    
    lat: -7.294567, lng: 112.731234,
    address: "Jl. Raya Darmo Permai, Surabaya",
    rating: 4.4, reviewCount: 180, ticketPrice: 60000,
    openHour: "10:00", closeHour: "22:00",
    facilities: JSON.stringify(["WiFi", "Kids Friendly", "AC"]),
    featured: false, hiddenGem: false
  },
  {
    name: "Babeh Street",
    slug: "babeh-street",
    description: "Cafe hits di tengah kota. Tempatnya luas dan nyaman untuk nongkrong rombongan. Makanan fusion seperti Mie Goreng Wagyu dan Es Campur modern sangat direkomendasikan.",
    
    lat: -7.262345, lng: 112.741234,
    address: "Jl. Slamet No. 31, Grand City, Surabaya",
    rating: 4.6, reviewCount: 550, ticketPrice: 70000,
    openHour: "10:00", closeHour: "22:00",
    facilities: JSON.stringify(["WiFi", "VIP Room", "Mushola", "Parkir"]),
    featured: true, hiddenGem: false
  },
  {
    name: "Togo Coffee",
    slug: "togo-coffee",
    description: "Sesuai namanya, awalnya berkonsep kopi to-go, tapi akhirnya punya tempat nongkrong yang industrial dan keren. Biji kopi lokalnya di-roast dengan sempurna.",
    
    lat: -7.286789, lng: 112.754321,
    address: "Jl. Ngagel Jaya Utara, Surabaya",
    rating: 4.5, reviewCount: 210, ticketPrice: 30000,
    openHour: "08:00", closeHour: "22:00",
    facilities: JSON.stringify(["WiFi", "Colokan Listrik", "AC"]),
    featured: false, hiddenGem: false
  },
  {
    name: "Moengkopi",
    slug: "moengkopi",
    description: "Surga tersembunyi bagi pecinta kopi manual brew. Baristanya ramah dan siap menjelaskan profil rasa setiap biji kopi. Tempatnya intim dan mungil.",
    
    lat: -7.311234, lng: 112.767890,
    address: "Jl. Medokan Ayu, Rungkut, Surabaya",
    rating: 4.8, reviewCount: 120, ticketPrice: 25000,
    openHour: "15:00", closeHour: "23:00",
    facilities: JSON.stringify(["Area Merokok", "Koleksi Biji Kopi Lokal"]),
    featured: false, hiddenGem: true
  },
  {
    name: "Le Cafe Gourmand",
    slug: "le-cafe-gourmand",
    description: "Cafe premium dengan spesialisasi es krim gelato dan kopi premium. Desain klasik Eropanya membuat suasana sangat elegan.",
    
    lat: -7.273456, lng: 112.735678,
    address: "Jl. Pregolan Bunder No.42, Tegalsari, Surabaya",
    rating: 4.7, reviewCount: 670, ticketPrice: 85000,
    openHour: "10:00", closeHour: "23:00",
    facilities: JSON.stringify(["WiFi", "Valet", "AC", "Sofa Premium"]),
    featured: true, hiddenGem: false
  },
  {
    name: "Volks Coffee",
    slug: "volks-coffee",
    description: "Identik dengan mobil VW (Volks) tua di depannya. Cafe ini asyik untuk nongkrong sambil menikmati angin sepoi-sepoi Surabaya karena area semi-outdoornya dominan.",
    
    lat: -7.278901, lng: 112.748901,
    address: "Jl. M.H. Thamrin No. 34, Surabaya",
    rating: 4.5, reviewCount: 300, ticketPrice: 40000,
    openHour: "09:00", closeHour: "22:00",
    facilities: JSON.stringify(["Area Outdoor", "Live Music (Weekend)"]),
    featured: false, hiddenGem: false
  },
  {
    name: "Varna Culture Hotel & Cafe",
    slug: "varna-cafe",
    description: "Terletak di Jalan Tunjungan yang legendaris. Varna menawarkan pemandangan langsung ke keramaian Jalan Tunjungan dari lantai 2. Makanan tradisional Indonesia disajikan secara modern.",
    
    lat: -7.260123, lng: 112.738901,
    address: "Jl. Tunjungan No. 51, Genteng, Surabaya",
    rating: 4.6, reviewCount: 420, ticketPrice: 60000,
    openHour: "10:00", closeHour: "22:00",
    facilities: JSON.stringify(["City View", "AC", "WiFi", "Hotel Terintegrasi"]),
    featured: true, hiddenGem: false
  },
  {
    name: "Onni House Surabaya",
    slug: "onni-house",
    description: "Perpaduan apik antara florist, home living, dan cafe. Anda bisa menikmati hidangan barat sambil dikelilingi bunga-bunga segar dan perabotan yang bisa Anda beli.",
    
    lat: -7.285678, lng: 112.732345,
    address: "Jl. Opak No. 56, Wonokromo, Surabaya",
    rating: 4.8, reviewCount: 480, ticketPrice: 120000,
    openHour: "11:00", closeHour: "21:30",
    facilities: JSON.stringify(["Florist", "Boutique", "Private Event Space", "AC"]),
    featured: true, hiddenGem: false
  },
  {
    name: "Communal Coffee & Eatery",
    slug: "communal-coffee",
    description: "Suasana nyaman seperti rumah sendiri. Menu andalannya adalah Rice Bowl dengan berbagai topping yang mengenyangkan serta es kopi susu literan.",
    
    lat: -7.288901, lng: 112.675678,
    address: "Jl. Klampis Jaya, Sukolilo, Surabaya",
    rating: 4.4, reviewCount: 220, ticketPrice: 45000,
    openHour: "09:00", closeHour: "22:00",
    facilities: JSON.stringify(["WiFi", "Colokan", "Area Merokok Terpisah"]),
    featured: false, hiddenGem: false
  }
];

async function seed() {
  let category = await prisma.category.findUnique({
    where: { slug: 'cafe' }
  });

  if (!category) {
    console.log("Kategori 'cafe' tidak ditemukan! Membuat kategori baru...");
    category = await prisma.category.create({
      data: {
        name: 'Cafe & Nongkrong',
        slug: 'cafe',
        icon: '☕',
        color: '#8B5A2B'
      }
    });
  }

  console.log('Menambahkan 20 Cafe...');

  for (let i = 0; i < cafes.length; i++) {
    const cafe = cafes[i];
    
    // Default gallery
    const img1 = getImg(i * 3);
    const img2 = getImg(i * 3 + 1);
    const img3 = getImg(i * 3 + 2);
    const gallery = JSON.stringify([img1, img2, img3]);

    await prisma.destination.upsert({
      where: { slug: cafe.slug },
      update: {
        ...cafe,
        area: "Pusat",
        categoryId: category.id,
        mainImage: img1,
        gallery: gallery,
      },
      create: {
        ...cafe,
        area: "Pusat",
        categoryId: category.id,
        mainImage: img1,
        gallery: gallery,
      }
    });
  }

  console.log('20 Cafe berhasil ditambahkan!');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
