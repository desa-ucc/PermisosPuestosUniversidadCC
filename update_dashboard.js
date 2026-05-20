const fs = require('fs');
let content = fs.readFileSync('src/src/app/components/dashboard/dashboard.component.ts', 'utf8');

// The dashboard already uses the bento grid from the previous step. We just need to update standard utility classes like bg-white to ucc-card.
content = content.replace(/bg-white p-6 rounded-xl custom-shadow/g, 'ucc-card');
content = content.replace(/bg-white p-md rounded-xl custom-shadow/g, 'ucc-card p-0'); // p-md is already in ucc-card
content = content.replace(/bg-secondary text-white/g, 'bg-ucc-secondary text-white');
content = content.replace(/bg-primary-fixed\/20 p-md rounded-xl border border-primary-container relative overflow-hidden flex flex-col justify-between/g, 'bg-ucc-primary-fixed/20 p-md rounded-xl border border-ucc-primary-container relative overflow-hidden flex flex-col justify-between');

fs.writeFileSync('src/src/app/components/dashboard/dashboard.component.ts', content);
