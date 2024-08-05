import { assetSearch } from './assetSearch.js';
import { assetModalData } from './assetModal.js';
import * as utils from './utils.js';
import * as advancedSearch from './advancedSearch.js';
import * as columnSelector from './columnSelector.js';
import * as assetAddition from './assetAddition.js';

document.addEventListener('alpine:init', () => {
    Alpine.store('assetSearch', {
        selectedAsset: null
    });

    Alpine.data('assetSearch', assetSearch);
    Alpine.data('assetModalData', assetModalData);
});

// Make utility functions globally available if needed
window.utils = utils;