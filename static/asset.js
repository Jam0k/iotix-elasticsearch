document.addEventListener('alpine:init', () => {
    Alpine.store('assetSearch', {
        selectedAsset: null
    })
})

function assetSearch() {
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

        init() {
            this.$nextTick(() => {
                const assetModalEl = document.getElementById('assetModal');
                const gridModalEl = document.getElementById('gridModal');
                const columnSelectorModalEl = document.getElementById('columnSelectorModal');

                if (assetModalEl) this.modal = new bootstrap.Modal(assetModalEl);
                if (gridModalEl) this.gridModal = new bootstrap.Modal(gridModalEl);
                if (columnSelectorModalEl) this.columnSelectorModal = new bootstrap.Modal(columnSelectorModalEl);
            });
            this.visibleColumns = [...this.selectedAttributes];
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

        performAdvancedSearch(event = null) {
            if (event) event.preventDefault();

            this.loading = true;
            const payload = {
                criteria: this.criteria.filter(c => c.field && c.operator && c.value),
                boolean_options: this.booleanOptions,
                custom_query: this.useCustomQuery ? this.customQuery : null,
                page: this.currentPage,
                size: this.pageSize,
                sort_field: this.sortField,
                sort_order: this.sortOrder
            };

            console.log('Sending advanced search payload:', payload);

            fetch('/advanced-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Received advanced search results:', data);
                    if (data.detail) {
                        console.error('Error in advanced search:', data.detail);
                        this.advancedResults = [];
                        this.filteredResults = [];
                    } else {
                        this.advancedResults = data.assets || [];
                        this.filteredResults = [...this.advancedResults];
                        this.totalPages = data.total_pages || 1;
                        this.currentPage = data.page || 1;
                    }
                    this.loading = false;
                })
                .catch(error => {
                    console.error('Error:', error);
                    this.advancedResults = [];
                    this.filteredResults = [];
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

        getAssetTypeIcon(assetType) {
            const iconMap = {
                'PLC': 'fas fa-microchip',
                'Server': 'fas fa-server',
                'Router': 'fas fa-router',
                'Switch': 'fas fa-network-wired',
                'Workstation': 'fas fa-desktop',
                'Printer': 'fas fa-print',
                'Camera': 'fas fa-video',
                'Sensor': 'fas fa-thermometer-half',
                'Mobile Device': 'fas fa-mobile-alt',
                'Firewall': 'fas fa-shield-alt',
                'Storage': 'fas fa-hdd',
                'VPN': 'fas fa-lock',
                'Access Point': 'fas fa-wifi',
                'IoT Device': 'fas fa-microchip',
                'SCADA': 'fas fa-industry'
            };
            return iconMap[assetType] || 'fas fa-cube';
        },

        getAssetTypeIconClass(assetType) {
            const classMap = {
                'PLC': 'bg-plc',
                'Server': 'bg-server',
                'Router': 'bg-router',
                'Switch': 'bg-switch',
                'Workstation': 'bg-workstation',
                'Printer': 'bg-printer',
                'Camera': 'bg-camera',
                'Sensor': 'bg-sensor',
                'Mobile Device': 'bg-mobile',
                'Firewall': 'bg-firewall',
                'Storage': 'bg-storage',
                'VPN': 'bg-vpn',
                'Access Point': 'bg-access-point',
                'IoT Device': 'bg-iot',
                'SCADA': 'bg-scada'
            };
            return classMap[assetType] || 'bg-default';
        },

        getCriticalityClass(criticality) {
            const classMap = {
                'Low': 'criticality-low',
                'Medium': 'criticality-medium',
                'High': 'criticality-high',
                'Critical': 'criticality-critical',
            };
            return classMap[criticality] || '';
        },

        getMatchedField(asset) {
            const excludeFields = ['id', 'criticality'];
            const query = this.query.toLowerCase();

            for (const [key, value] of Object.entries(asset)) {
                if (excludeFields.includes(key)) continue;
                if (value && value.toString().toLowerCase().includes(query)) {
                    const label = key.split(/(?=[A-Z])|_/).map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(' ');
                    return `${label}: ${value}`;
                }
            }
            return null;
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

        addCriterion() {
            this.criteria.push({ field: '', operator: '=', value: '' });
        },

        removeCriterion(index) {
            this.criteria.splice(index, 1);
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

        toggleColumn(column) {
            const index = this.visibleColumns.indexOf(column);
            if (index > -1) {
                this.visibleColumns.splice(index, 1);
            } else {
                this.visibleColumns.push(column);
            }
        },

        startDrag(column, event) {
            this.draggedColumn = column;
            event.dataTransfer.setData('text/plain', column);
            event.dataTransfer.effectAllowed = 'move';
            event.target.closest('.d-flex').classList.add('dragging');
        },

        onDrag(event) {
            event.preventDefault();
        },

        onDrop(targetColumn, event) {
            event.preventDefault();
            const draggedElement = event.target.closest('.d-flex');
            if (draggedElement) {
                draggedElement.classList.remove('dragging');
            }
            if (this.draggedColumn !== targetColumn) {
                const fromIndex = this.visibleColumns.indexOf(this.draggedColumn);
                const toIndex = this.visibleColumns.indexOf(targetColumn);
                this.visibleColumns.splice(fromIndex, 1);
                this.visibleColumns.splice(toIndex, 0, this.draggedColumn);
            }
            this.draggedColumn = null;
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
        }
    }
}







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