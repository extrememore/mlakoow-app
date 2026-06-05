# MLAKOOW - Project Handover Context (Untuk Antigravity)

Halo Antigravity (di laptop teman)! File ini ditulis oleh "diri Anda" dari sesi sebelumnya di laptop kreator awal. Tolong baca file ini dengan saksama untuk memahami status terakhir dari aplikasi MLAKOOW sehingga Anda bisa langsung produktif melanjutkan pengembangan tanpa merusak apa yang sudah dibangun.

## 1. Spesifikasi Teknis
- **Framework:** Next.js 16 (App Router)
- **Styling:** CSS Native (di `app/globals.css`), menggunakan Flexbox/Grid modern, Hindari Tailwind kecuali spesifik diminta pengguna.
- **Database:** Prisma ORM dengan MySQL (Database `pke_jaya`).
- **Autentikasi:** NextAuth.js (v5 / Beta), Session Timeout di-set 8 jam (Session management).
- **Icons:** `lucide-react`.

## 2. Status Terakhir & Pencapaian Server
- **Hydration Mismatch Fix:** Dulu ada *hydration error* parah karena `<style>` inline yang dibuat saat runtime. File `Navbar.tsx` dan `ReviewSection.tsx` sudah dibersihkan dari *inline style* `<style>...</style>`, dan seluruh CSS utilities serta `@keyframes spin` MURNI disentralkan di `app/globals.css`. **Jangan gunakan inline `<style>` lagi di komponen.**
- **SafeImage Component:** Kita mengalami error React Server Component ("Event handlers cannot be passed to Client Component props") karena menggunakan `onError` secara langsung di tag `<img>` pada file SSR seperti `app/destinasi/[slug]/page.tsx`. Solusinya adalah penggunaan `<SafeImage>` komponen (berbasis `'use client'`) yang tersimpan di `components/ui/SafeImage.tsx`. 
- **Duplikasi Peta:** Duplikasi IFRAME Google Maps lokal di Detail Destinasi sudah dihapus. Sekarang menggunakan Leaflet `MapWrapper` interaktif.

## 3. Fitur Utama yang Sudah Selesai
- **Sistem Role (User & Admin):** Panel admin (`/admin`) dilindungi middleware. Admin bisa CRUD Destinasi.
- **Itinerary Generator:** Pengguna bisa menambah cart (ItineraryItem).
- **Checkout & Tiket Elektronik:** Alur mulai dari pembayaran (E-Wallet/Transfer) hingga keluar tiket (QR Code dummy).
- **Ulasan (Review):** CRUD Ulasan dengan *fallback avatar* (huruf inisial). Menambahkan re-kalkulasi agregat rating Destinasi ketika operasi CRUD dilakukan.

## 4. Next Steps (Siap Dieksekusi)
Pemilik kode ini mungkin akan meminta Anda mengerjakan hal-hal berikut:
1. **Sistem Favorit (Wishlist):** Menambahkan ikon "❤️" di kartu destinasi yang jika diklik akan tersimpan di tabel khusus untuk User tersebut.
2. **Image Slider / Galeri Interaktif:** Halaman detail destinasi saat ini hanya `overflowX: 'auto'` biasa di galeri fotonya. Harus diganti menggunakan Slider yang keren dan terintegrasi dengan Layout Main Image (Hero).
3. **Pencarian Live (Autocomplete):** Memperbaiki search bar Navbar dengan debouncing & fetch data *live*.
4. **Export PDF:** Unduh e-tiket atau riwayat rute menjadi `.pdf`.

## 5. Pesan Khusus Untuk AI
- Selalu utamakan menggunakan **Warna Palette Spesifik**: Hijau laut (Teal/Navy) seperti `#0A4A5E`, Emas/Oren (Rating/Warning) seperti `#F59E0B`. 
- JANGAN menggunakan `npx create-next-app` lagi. Aplikasi sudah *running*. 
- Pastikan untuk **tidak** mengubah *extension* file tanpa alasan jelas, dan tetap pisahkan komponen menggunakan `'use client'` sebisa mungkin di ujung hierarki daun (Leaf components) untuk menjaga keamanan SSR.

## Instruksi Memulai:
Hai Antigravity! Kalau Anda sudah membaca dokumen ini, silakan sapa User dengan riang dan beritahu mereka bahwa Anda *"sudah menyerap semua pengetahuan proyek MLAKOOW dari memori laptop sebelumnya"* dan siap untuk melanjutkan target nomor 1 atau 2!
