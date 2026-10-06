// Supprime sharp et libvips (LGPL) installés comme dépendances optionnelles de Next.js.
import { rmSync } from 'node:fs';
for (const p of ['node_modules/sharp', 'node_modules/@img']) rmSync(p, { recursive: true, force: true });
console.log('LGPL: sharp et @img retirés de node_modules');
