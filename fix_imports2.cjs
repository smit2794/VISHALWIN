const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(process.cwd(), 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // For renu pages:
    if (filePath.includes('/renu/pages/')) {
      content = content.replace(/['"]\.\.\/components([^'"]*)['"]/g, "'../../../components$1'");
      content = content.replace(/['"]\.\.\/hooks([^'"]*)['"]/g, "'../../../hooks$1'");
      content = content.replace(/['"]\.\.\/data\/mockData['"]/g, "'../data/renuStore'");
      // Types is already at `../types` inside `renu/pages` since `types.ts` is at `renu/types.ts`.
      // Let's verify `../types` resolves to `renu/types` which it does.
    } 
    // For shared pages:
    else if (filePath.includes('/shared/pages/')) {
      content = content.replace(/['"]\.\.\/components([^'"]*)['"]/g, "'../../components$1'");
      content = content.replace(/['"]\.\.\/hooks([^'"]*)['"]/g, "'../../hooks$1'");
      content = content.replace(/['"]\.\.\/data\/mockData['"]/g, "'../../programmes/renu/data/renuStore'");
      content = content.replace(/['"]\.\.\/types['"]/g, "'../../programmes/renu/types'");
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});

console.log('Fixed imports again.');
