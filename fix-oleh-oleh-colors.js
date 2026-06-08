const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/oleh-oleh/[slug]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace dark red/orange hero gradient
content = content.replace(/linear-gradient\(135deg, #7B1A00 0%, #C0392B 100%\)/g, "linear-gradient(135deg, #047857 0%, #10B981 100%)");

// Replace CTA gradient
content = content.replace(/linear-gradient\(135deg, #C0392B, #E67E22\)/g, "linear-gradient(135deg, #047857, #10B981)");

// Replace other hex codes
content = content.replace(/#7B1A00/g, '#047857');
content = content.replace(/#C0392B/g, '#10B981');

// Replace box-shadow color (rgba(192,57,43,0.08)) to green equivalent (rgba(4,120,87,0.08))
content = content.replace(/rgba\(192,57,43,0\.08\)/g, "rgba(4,120,87,0.08)");

// Add Itinerary button
const wishlistLinkRegex = /<Link[\s\S]*?Tambah ke Wishlist[\s\S]*?<\/Link>/;
const itineraryButton = `
              <Link
                href={\`/itinerary?add=\${destination.id}\`}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', display: 'flex', fontSize: '0.875rem' }}
              >
                + Tambah ke Itinerary
              </Link>`;
content = content.replace(wishlistLinkRegex, (match) => {
  return match + '\n' + itineraryButton;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Colors and button fixed successfully.');
