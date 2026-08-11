const fs = require('fs');
const path = require('path');

const renuPagesDir = path.join(process.cwd(), 'src/programmes/renu/pages');
const files = fs.readdirSync(renuPagesDir).map(f => path.join(renuPagesDir, f));

files.push(path.join(process.cwd(), 'src/shared/pages/Settings.tsx'));
files.push(path.join(process.cwd(), 'src/App.tsx'));
files.push(path.join(process.cwd(), 'src/layouts/DashboardLayout.tsx'));

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  if (file.includes('renu/pages/')) {
    content = content.replace(/from '\.\.\/components/g, "from '../../../components");
    content = content.replace(/from '\.\.\/data\/mockData'/g, "from '../data/renuStore'");
    // For types, it was `../types`, it should stay `../types` because we moved types to `renu/types.ts`.
  } else if (file.includes('shared/pages/')) {
    content = content.replace(/from '\.\.\/components/g, "from '../../components");
    content = content.replace(/from '\.\.\/types'/g, "from '../../programmes/renu/types'");
  } else if (file.endsWith('App.tsx')) {
    content = content.replace(/from '\.\/pages\//g, "from './programmes/renu/pages/");
    // Fix Settings.tsx import
    content = content.replace(/from '\.\/programmes\/renu\/pages\/Settings'/g, "from './shared/pages/Settings'");
  } else if (file.endsWith('DashboardLayout.tsx')) {
    content = content.replace(/from '\.\.\/data\/mockData'/g, "from '../programmes/renu/data/renuStore'");
  }

  fs.writeFileSync(file, content, 'utf8');
});

console.log('Imports fixed.');
