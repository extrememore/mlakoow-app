const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/oleh-oleh/[slug]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replacements
content = content.replace(/Kuliner Serupa/g, 'Oleh-Oleh Serupa');
content = content.replace(/Utensils/g, 'ShoppingBag');
content = content.replace(/href="\/kuliner"/g, 'href="/oleh-oleh"');
content = content.replace(/Eksplorasi Kuliner Lainnya/g, 'Eksplorasi Oleh-Oleh Lainnya');
content = content.replace(/linear-gradient\(135deg, #991B1B, #DC2626\)/g, "linear-gradient(135deg, #047857, #10B981)");
content = content.replace(/linear-gradient\(135deg, #991B1B 0%, #DC2626 100%\)/g, "linear-gradient(135deg, #047857 0%, #10B981 100%)");
content = content.replace(/color="#991B1B"/g, 'color="#047857"');

fs.writeFileSync(filePath, content, 'utf8');
console.log('File updated successfully.');
