const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/priyabrata/Desktop/changes/Safety-App/my-app/app/(drawer)';
const walkSync = (d) => {
  let results = [];
  const list = fs.readdirSync(d);
  list.forEach((file) => {
    const filePath = path.join(d, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (!filePath.includes('tabs')) {
        results = results.concat(walkSync(filePath));
      }
    } else if (filePath.endsWith('.tsx') && !filePath.includes('_layout.tsx')) {
      results.push(filePath);
    }
  });
  return results;
};

const files = walkSync(dir);
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  const importRegex = /import\s+{[^}]*}\s+from\s+['"]react-native['"];?/;
  const match = content.match(importRegex);
  
  if (match) {
    if (!match[0].includes('TouchableOpacity')) {
      const newImport = match[0].replace('{', '{ TouchableOpacity,');
      content = content.replace(importRegex, newImport);
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed', path.basename(file));
    }
  } else {
    if (!content.includes('import { TouchableOpacity } from') && content.includes('<TouchableOpacity')) {
      content = 'import { TouchableOpacity } from "react-native";\n' + content;
      fs.writeFileSync(file, content, 'utf8');
      console.log('Added missing import to', path.basename(file));
    }
  }
});
