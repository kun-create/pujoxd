import { trainsBatch1 } from "./trains-batch1.js";
import { trainsBatch2 } from "./trains-batch2.js";
import { extendedTrainsBatch } from "./trains-extended-batch.js";

const rawTrains = [
  ...trainsBatch1,
  ...trainsBatch2,
  ...extendedTrainsBatch
];

// User specifically requested to show all 62 locations and disable deduplication 
// which was hiding the 9 overlapping stations.
export const allTrains = rawTrains.map(train => {
    // We still strip brackets for clean display, but we no longer deduplicate
    return {
        ...train,
        name: train.name.replace(/\s*\(.*?\)\s*/g, '').trim()
    };
});
