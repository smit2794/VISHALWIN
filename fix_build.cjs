const fs = require('fs');
const path = require('path');

// 1. Fix RenuJourneyTracker
let trackerPath = path.join(process.cwd(), 'src/components/common/RenuJourneyTracker.tsx');
if (fs.existsSync(trackerPath)) {
  let content = fs.readFileSync(trackerPath, 'utf8');
  content = content.replace(/['"]\.\.\/\.\.\/types['"]/g, "'../../programmes/renu/types'");
  fs.writeFileSync(trackerPath, content, 'utf8');
}

// 2. Fix ProgrammeSwitcher
let switcherPath = path.join(process.cwd(), 'src/components/ProgrammeSwitcher.tsx');
if (fs.existsSync(switcherPath)) {
  let content = fs.readFileSync(switcherPath, 'utf8');
  content = content.replace(/['"]\.\/ui\/Card['"]/g, "'./ui'");
  fs.writeFileSync(switcherPath, content, 'utf8');
}

// 3. Fix useRole.ts
let hookPath = path.join(process.cwd(), 'src/hooks/useRole.ts');
if (fs.existsSync(hookPath)) {
  let content = fs.readFileSync(hookPath, 'utf8');
  content = content.replace(/['"]\.\.\/types['"]/g, "'../programmes/renu/types'");
  fs.writeFileSync(hookPath, content, 'utf8');
}

// 4. Fix DashboardLayout
let dashboardPath = path.join(process.cwd(), 'src/layouts/DashboardLayout.tsx');
if (fs.existsSync(dashboardPath)) {
  let content = fs.readFileSync(dashboardPath, 'utf8');
  // Need to import Settings as SettingsIcon from lucide-react if not present
  if (!content.includes('SettingsIcon')) {
    // but the error said Cannot find name 'SettingsIcon' which means it's used
    content = content.replace(/Settings as SettingsIcon, \n/g, ""); // if there was one?
    // just replace lucide-react imports to add it
    content = content.replace(/Menu, X, Search/g, "Menu, X, Search, Settings as SettingsIcon");
  }
  fs.writeFileSync(dashboardPath, content, 'utf8');
}

console.log('Fixed the last 4 errors');
