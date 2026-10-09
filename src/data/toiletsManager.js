import { toiletsBatch1 } from "./toilets-batch1.js";
import { toiletsBatch2 } from "./toilets-batch2.js";
import { toiletsBatch3 } from "./toilets-batch3.js";
import { toiletsBatch4 } from "./toilets-batch4.js";
import { toiletsBatch5 } from "./toilets-batch5.js";
import { toiletsBatch6 } from "./toilets-batch6.js";
import { osmToilets } from "./osmToilets.js";
import { extendedToiletsBatch } from "./toilets-batch-extended.js";

const rawToilets = [
  ...toiletsBatch1,
  ...toiletsBatch2,
  ...toiletsBatch3,
  ...toiletsBatch4,
  ...toiletsBatch5,
  ...toiletsBatch6,
  ...osmToilets,
  ...extendedToiletsBatch
];

const uniqueToiletsMap = new Map();
rawToilets.forEach(toilet => {
    // Strip text in brackets/parentheses to render clean names (if any exist)
    toilet.name = toilet.name.replace(/\s*\(.*?\)\s*/g, '').trim();
    
    const cleanName = toilet.name.toLowerCase();
    if (!uniqueToiletsMap.has(cleanName)) {
        uniqueToiletsMap.set(cleanName, toilet);
    }
});

export const allToilets = Array.from(uniqueToiletsMap.values());
