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
console.log('Found files:', files.length);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add Feather import if missing
  if (!content.includes('import { Feather }') && !content.includes('@expo/vector-icons')) {
    content = content.replace(/(import .* from 'react';?)/, '$1\nimport { Feather } from \'@expo/vector-icons\';');
  }

  // Replace DrawerToggleButton with Back Arrow OR inject Back arrow into header
  if (content.includes('<DrawerToggleButton')) {
    content = content.replace(/<DrawerToggleButton[^>]*>/g, '<TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}><Feather name="arrow-left" size={24} color="#111827" /></TouchableOpacity>');
    changed = true;
  } else if (content.includes('<View style={styles.header}>')) {
    let backBtn = '\n        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 12 }}><Feather name="arrow-left" size={24} color="#FFFFFF" /></TouchableOpacity>';
    
    // For offline-models, color is white for header text, so back arrow should be white
    if (file.includes('offline-models') || file.includes('permissions') || file.includes('live-tracking') || file.includes('safety-timer') || file.includes('report') || file.includes('safety-analysis')) {
       // Check if dark theme headers
       if (content.includes('color: \'#FFFFFF\'') || content.includes('color: "#FFFFFF"')) {
         content = content.replace('<View style={styles.header}>', '<View style={[styles.header, { flexDirection: \'row\', alignItems: \'center\' }]}>' + backBtn);
       } else {
         content = content.replace('<View style={styles.header}>', '<View style={[styles.header, { flexDirection: \'row\', alignItems: \'center\' }]}>' + backBtn.replace('#FFFFFF', '#111827'));
       }
    } else {
       content = content.replace('<View style={styles.header}>', '<View style={[styles.header, { flexDirection: \'row\', alignItems: \'center\' }]}>' + backBtn.replace('#FFFFFF', '#111827'));
    }
    changed = true;
  }

  // Ensure useRouter is imported and declared if we added router.back()
  if (changed && !content.includes('const router = useRouter()')) {
    if (!content.includes('import { useRouter }')) {
       content = content.replace(/(import .* from 'react';?)/, '$1\nimport { useRouter } from \'expo-router\';');
    }
    content = content.replace(/(export default function [A-Za-z0-9_]+\([^)]*\) \{)/, '$1\n  const router = useRouter();');
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', path.basename(file));
  }
});
