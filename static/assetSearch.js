import { performAdvancedSearch } from './advancedSearch.js';
import { getAssetTypeIcon, getAssetTypeIconClass, getCriticalityClass, getMatchedField } from './utils.js';
import { toggleColumn, startDrag, onDrag, onDrop } from './columnSelector.js';
import { openAddAssetModal, selectAddAssetMethod, openManualEntryModal, addNewAsset } from './assetAddition.js';

export function assetSearch() {
    return {
        query: '',
        results: [],
        advancedResults: [],
        filteredResults: [],
        loading: false,
        showDropdown: false,
        showAdvancedSearch: false,
        modal: null,
        gridModal: null,
        addAssetModal: null,
        manualEntryModal: null,
        criteria: [{ field: '', operator: '=', value: '' }],
        booleanOptions: {
            secure_location: null,
            remote_access: null,
            syslog: null,
            obsolete: null
        },
        useCustomQuery: false,
        customQuery: '',
        selectedAttributes: [
            'asset_type', 'manufacturer', 'site_name', 'criticality', 'ip_address',
            'serial_number', 'part_no', 'product_range', 'card_type', 'part_description',
            'site_id', 'area', 'site_type', 'mcc_no', 'mcc_location',
            'process_area', 'physical_location_coordinates', 'secure_location',
            'firmware_revision', 'software_compiler', 'operating_system', 'os_version',
            'power_supply', 'dns_name', 'mac_address', 'communication_protocols',
            'remote_access', 'syslog', 'network_zone', 'cybersecurity_patch_status',
            'last_vulnerability_scan_date', 'risk_assessment_score', 'data_classification',
            'installation_date', 'last_maintenance_date', 'next_scheduled_maintenance',
            'warranty_expiration_date', 'change_management', 'vendor_support_contract',
            'support_contract_expiration', 'backup_frequency', 'purchase_cost',
            'depreciation_value', 'expected_lifespan', 'asset_status', 'obsolete',
            'responsible_department', 'primary_contact_person', 'backup_contact_person',
            'compliance_requirements', 'custom_configurations', 'connected_devices',
            'failure_history', 'created_date', 'modified_date'
        ],
        visibleColumns: [],
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        sortField: 'criticality.keyword',
        sortOrder: 'desc',
        showFilterRow: false,
        columnSelectorModal: null,
        draggedColumn: null,
        newAsset: {},

        init() {
            this.$nextTick(() => {
                const assetModalEl = document.getElementById('assetModal');
                const gridModalEl = document.getElementById('gridModal');
                const columnSelectorModalEl = document.getElementById('columnSelectorModal');
                const addAssetModalEl = document.getElementById('addAssetModal');
                const manualEntryModalEl = document.getElementById('manualEntryModal');

                if (assetModalEl) this.modal = new bootstrap.Modal(assetModalEl);
                if (gridModalEl) this.gridModal = new bootstrap.Modal(gridModalEl);
                if (columnSelectorModalEl) this.columnSelectorModal = new bootstrap.Modal(columnSelectorModalEl);
                if (addAssetModalEl) this.addAssetModal = new bootstrap.Modal(addAssetModalEl);
                if (manualEntryModalEl) this.manualEntryModal = new bootstrap.Modal(manualEntryModalEl);
            });
            this.visibleColumns = [...this.selectedAttributes];
        },

        openAddAssetModal() {
            if (this.addAssetModal) {
                this.addAssetModal.show();
            }
        },

        search() {
            if (this.query.length < 2) {
                this.results = [];
                this.showDropdown = false;
                return;
            }
            this.loading = true;
            fetch(`/search?query=${encodeURIComponent(this.query)}`)
                .then(response => response.json())
                .then(data => {
                    this.results = data.assets;
                    this.loading = false;
                    this.showDropdown = true;
                })
                .catch(error => {
                    console.error('Error:', error);
                    this.loading = false;
                });
        },

        selectAsset(asset) {
            this.showDropdown = false;
            this.query = '';
            this.openModal(asset);
        },

        openModal(asset) {
            if (asset) {
                Alpine.store('assetSearch').selectedAsset = asset;
                this.modal.show();
                window.dispatchEvent(new CustomEvent('update-asset-modal'));
            }
        },

        openAssetModalFromGrid(asset) {
            if (asset) {
                Alpine.store('assetSearch').selectedAsset = asset;

                // Remove existing backdrop
                this.removeBackdrop();

                // Ensure the asset modal has a higher z-index
                const assetModalElement = document.getElementById('assetModal');
                if (assetModalElement) {
                    assetModalElement.style.zIndex = '1060';
                }

                // Show the asset modal
                this.modal.show();

                // Dispatch the event to update the modal content
                window.dispatchEvent(new CustomEvent('update-asset-modal'));

                // Add event listener for asset modal hidden event
                assetModalElement.addEventListener('hidden.bs.modal', () => {
                    // Check if grid modal is still open
                    const gridModalElement = document.getElementById('gridModal');
                    if (gridModalElement.classList.contains('show')) {
                        // Re-show the grid modal backdrop
                        document.body.classList.add('modal-open');
                        const backdrop = document.createElement('div');
                        backdrop.className = 'modal-backdrop fade show';
                        document.body.appendChild(backdrop);
                    } else {
                        // Both modals are closed, remove backdrop
                        this.removeBackdrop();
                    }
                }, { once: true });

                // Modify the grid modal to prevent closing when clicking outside
                const gridModalElement = document.getElementById('gridModal');
                const gridModal = bootstrap.Modal.getInstance(gridModalElement);
                gridModal._config.backdrop = 'static';
                gridModal._config.keyboard = false;
            }
        },

        removeBackdrop() {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            document.body.classList.remove('modal-open');
        },

        toggleAdvancedSearch() {
            this.showAdvancedSearch = !this.showAdvancedSearch;
            if (this.showAdvancedSearch) {
                this.results = [];
                this.showDropdown = false;
            }
        },


        getGridHeaders() {
            return this.visibleColumns.map(attr =>
                attr.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            );
        },

        changePage(newPage) {
            if (newPage >= 1 && newPage <= this.totalPages) {
                this.currentPage = newPage;
                this.performAdvancedSearch();
            }
        },

        changeSort(field) {
            if (this.sortField === field) {
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortField = field;
                this.sortOrder = 'asc';
            }
            this.performAdvancedSearch();
        },

        resetAdvancedSearch() {
            this.criteria = [{ field: '', operator: '=', value: '' }];
            this.booleanOptions = {
                secure_location: null,
                remote_access: null,
                syslog: null,
                obsolete: null
            };
            this.useCustomQuery = false;
            this.customQuery = '';
            this.currentPage = 1;
            this.sortField = 'criticality.keyword';
            this.sortOrder = 'desc';
            this.advancedResults = [];
            this.filteredResults = [];
        },

        openGridModal() {
            this.gridModal.show();

            // Add event listener for grid modal hidden event
            const gridModalElement = document.getElementById('gridModal');
            gridModalElement.addEventListener('hidden.bs.modal', () => {
                this.removeBackdrop();
            }, { once: true });
        },

        toggleColumnSelector() {
            if (!this.columnSelectorModal) {
                const modalElement = document.getElementById('columnSelectorModal');
                if (modalElement) {
                    this.columnSelectorModal = new bootstrap.Modal(modalElement);
                } else {
                    console.error('Column selector modal element not found');
                    return;
                }
            }
            this.columnSelectorModal.show();
        },

        applyColumnSelection() {
            // Refresh the table or grid view
            this.performAdvancedSearch();
            this.columnSelectorModal.hide();
        },

        toggleFilterRow() {
            this.showFilterRow = !this.showFilterRow;
        },

        filterTable(event) {
            const column = event.target.dataset.column;
            const filterValue = event.target.value.toLowerCase();

            this.filteredResults = this.advancedResults.filter(asset => {
                const cellValue = (asset[column] || '').toString().toLowerCase();
                return cellValue.includes(filterValue);
            });
        },

        // Import functions from other modules
        performAdvancedSearch,
        getAssetTypeIcon,
        getAssetTypeIconClass,
        getCriticalityClass,
        getMatchedField,
        toggleColumn,
        startDrag,
        onDrag,
        onDrop,
        openAddAssetModal,
        selectAddAssetMethod,
        openManualEntryModal,
        addNewAsset
    };
}