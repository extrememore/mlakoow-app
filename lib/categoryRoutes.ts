/**
 * Maps any category/subcategory slug to its parent route path.
 * Covers all 30+ subcategories in the database.
 */

const ROUTE_MAP: Record<string, string> = {
  // Wisata & subcategories
  wisata: 'wisata', alam: 'wisata', budaya: 'wisata', sejarah: 'wisata',
  keluarga: 'wisata', edukasi: 'wisata', petualangan: 'wisata',
  'taman-rekreasi': 'wisata', 'hidden-gem': 'wisata',
  // Kuliner & subcategories
  kuliner: 'kuliner', 'makanan-tradisional': 'kuliner', 'street-food': 'kuliner',
  seafood: 'kuliner', restoran: 'kuliner', 'warung-lokal': 'kuliner', 'jajanan-snack': 'kuliner',
  // Cafe & subcategories
  cafe: 'cafe', 'cafe-umum': 'cafe', 'coffee-shop': 'cafe',
  'creative-space': 'cafe', kedai: 'cafe',
  // Hiburan & subcategories
  hiburan: 'hiburan', 'bioskop-hiburan': 'hiburan', 'olahraga-petualangan': 'hiburan',
  'permainan-arcade': 'hiburan', 'spot-foto': 'hiburan',
  'spot-foto-indoor': 'hiburan', 'spot-foto-outdoor': 'hiburan', 'studio-foto': 'hiburan',
  // Oleh-oleh & subcategories
  'oleh-oleh': 'oleh-oleh', 'batik-fashion': 'oleh-oleh', 'kerajinan-tangan': 'oleh-oleh',
  'kue-roti': 'oleh-oleh', 'makanan-khas': 'oleh-oleh',
  'minuman-bumbu': 'oleh-oleh', 'souvenir-aksesoris': 'oleh-oleh',
}

export function getCategoryRoute(categorySlug: string): string {
  return ROUTE_MAP[categorySlug] ?? 'wisata'
}

export function getDetailHref(slug: string, categorySlug: string): string {
  return `/${getCategoryRoute(categorySlug)}/${slug}`
}
