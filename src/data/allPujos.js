import { batchOnePujos } from './pujos-part1.js';
import { batchTwoPujos } from './pujos-part2.js';
import { batchThreePujos } from './pujos-part3.js';
import { batchFourPujos } from './pujos-part4.js';
import { pujoBatch5 as batchFivePujos } from './pujo-batch5.js';
import { pujoAddressMap } from './pujoAddresses.js';

const rawPujos = [...batchOnePujos, ...batchTwoPujos, ...batchThreePujos, ...batchFourPujos, ...batchFivePujos];

const uniquePujosMap = new Map();
rawPujos.forEach(pujo => {
    // Strip text in brackets/parentheses to render clean names
    pujo.name = pujo.name.replace(/\s*\(.*?\)\s*/g, '').trim();
    
    const cleanName = pujo.name.toLowerCase();
    if (!uniquePujosMap.has(cleanName)) {
        if (pujoAddressMap[cleanName]) {
            pujo.address = pujoAddressMap[cleanName];
        }
        uniquePujosMap.set(cleanName, pujo);
    }
});

export const allPujos = Array.from(uniquePujosMap.values());
