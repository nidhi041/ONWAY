const fs = require('fs');
const filePath = 'constants/products.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Remove from interface
content = content.replace(/\s*category:\s*string;/g, '');
content = content.replace(/\s*reviews\?:\s*number;/g, '');
content = content.replace(/\s*deliveryTime:\s*number;/g, '');
content = content.replace(/\s*warranty\?:\s*string\s*\|\s*null;/g, '');
content = content.replace(/\s*returnDays\?:\s*number;/g, '');

// Remove from object literals
content = content.replace(/\s*category:\s*['"].*?['"],/g, '');
content = content.replace(/\s*reviews:\s*\d+,/g, '');
content = content.replace(/\s*deliveryTime:\s*\d+,/g, '');
content = content.replace(/\s*warranty:\s*(['"].*?['"]|null),/g, '');
content = content.replace(/\s*returnDays:\s*\d+,/g, '');

fs.writeFileSync(filePath, content);
