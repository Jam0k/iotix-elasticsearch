function assetModalData() {
    return {
        asset: {},
        init() {
            this.updateAssetData();
            window.addEventListener('update-asset-modal', () => this.updateAssetData());
        },
        updateAssetData() {
            const selectedAsset = Alpine.store('assetSearch').selectedAsset;
            if (selectedAsset) {
                this.asset = { ...selectedAsset };
                this.formatDates();
            }
        },
        formatDates() {
            const dateFields = [
                'installation_date',
                'last_maintenance_date',
                'next_scheduled_maintenance',
                'warranty_expiration_date',
                'support_contract_expiration',
                'last_vulnerability_scan_date',
                'created_date',
                'modified_date'
            ];

            dateFields.forEach(field => {
                if (this.asset[field]) {
                    this.asset[field] = this.formatDate(this.asset[field]);
                }
            });
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString; // Return original string if invalid date
            }
            return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        },
        saveAsset() {
            console.log('Saving asset:', this.asset);
            // Implement your save logic here

            // After saving, update the store
            Alpine.store('assetSearch').selectedAsset = { ...this.asset };

            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('assetModal'));
            modal.hide();
        }
    }
}