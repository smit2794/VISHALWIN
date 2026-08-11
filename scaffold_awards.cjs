const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'src/programmes/awards/pages');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const pages = ['Events', 'Nominees', 'NomineeProfile', 'Ceremony', 'Awardees', 'Reports'];

pages.forEach(page => {
  const content = `import React from 'react';

const ${page}: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold font-display text-slate-900">${page}</h1>
      <p className="text-slate-500 mt-2">This module is under construction.</p>
    </div>
  );
};

export default ${page};
`;
  const filePath = path.join(dir, `${page}.tsx`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Scaffolds created');
