const fs = require('fs');
const path = require('path');

let filePath = path.join(process.cwd(), 'src/programmes/awards/pages/Events.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix ToastContainer import
content = content.replace(
  "import { Card, Button, Badge, Modal, Input, Select, ToastContainer } from '../../../components/ui';",
  "import { Card, Button, Badge, Modal, Input, Select } from '../../../components/ui';\nimport { ToastContainer } from '../../../components/ui/ToastContainer';"
);

// Fix Input/Select label props by replacing them with a wrapper structure
// It's easier to just use regex to replace `<Input label="Foo" ... />` with `<div className="space-y-1"><label className="text-sm font-bold text-slate-700">Foo</label><Input ... /></div>`

content = content.replace(/<Input label="([^"]+)"/g, '<div className="space-y-1"><label className="text-sm font-bold text-slate-700">$1</label><Input');
content = content.replace(/(<div className="space-y-1"><label[^>]+>[^<]+<\/label><Input[^>]+)\/>/g, '$1 /></div>');

content = content.replace(/<Select label="([^"]+)"/g, '<div className="space-y-1"><label className="text-sm font-bold text-slate-700">$1</label><Select');
content = content.replace(/(<div className="space-y-1"><label[^>]+>[^<]+<\/label><Select[^>]+>([\s\S]*?)<\/Select>)/g, '$1</div>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Events.tsx TS errors');
