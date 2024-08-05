export function openAddAssetModal() {
    if (this.addAssetModal) {
        this.addAssetModal.show();
    }
}

export function selectAddAssetMethod(method) {
    if (method === 'manual') {
        this.addAssetModal.hide();
        this.openManualEntryModal();
    } else if (method === 'iotixScan') {
        // Implement iotix Network Scan functionality
        console.log('iotix Network Scan selected');
    } else if (method === 'activeDirectory') {
        // Implement Active Directory functionality
        console.log('Active Directory selected');
    }
}

export function openManualEntryModal() {
    this.newAsset = {}; // Reset the newAsset object
    if (this.manualEntryModal) {
        this.manualEntryModal.show();
    }
}

export function addNewAsset() {
    console.log('Adding new asset:', this.newAsset);
    // Here you would typically send this data to your backend
    // After successfully adding, you might want to reset the form:
    this.newAsset = {};
    // Optionally, show a success message
    alert('Asset added successfully!');
    // Close the modal
    if (this.manualEntryModal) {
        this.manualEntryModal.hide();
    }
    // Optionally, refresh the asset list or perform a new search
}