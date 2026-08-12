import re

with open('/Users/smit/Desktop/vishalwin/src/programmes/renu/pages/ChildProfile.tsx', 'r') as f:
    content = f.read()

# 1. Update Tabs Header
new_tabs_section = """{/* NEW TABS SECTION */}
  <Card className="p-0 overflow-hidden">
    <div className="flex overflow-x-auto whitespace-nowrap border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
      {['enrollment', 'therapy', 'assessment', 'medical', 'iep', 'milestones', 'financial', 'devices', 'homevisit'].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-3 text-sm font-bold capitalize transition-colors ${
            activeTab === tab ? 'text-brand-cyan-700 border-b-2 border-brand-cyan-700 bg-white' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {tab === 'homevisit' ? 'Parent & Visit' : 
           tab === 'medical' ? 'Medical' : 
           tab === 'iep' ? 'IEP' : 
           tab === 'financial' ? 'Financial' : 
           tab === 'devices' ? 'Devices' : 
           tab === 'enrollment' ? 'Enrollment' :
           tab === 'therapy' ? 'Therapy' :
           tab === 'milestones' ? 'Milestones' :
           'Assessment'}
        </button>
      ))}
    </div>
    <div className="p-6 bg-white min-h-[400px]">"""

content = re.sub(
    r'\{\/\* NEW TABS SECTION \*\/\}.*?<div className="p-6 bg-white min-h-\[400px\]">',
    new_tabs_section,
    content,
    flags=re.DOTALL
)

with open('/Users/smit/Desktop/vishalwin/src/programmes/renu/pages/ChildProfile.tsx', 'w') as f:
    f.write(content)

print("Updated tabs header")
