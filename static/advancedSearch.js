export function performAdvancedSearch(event = null) {
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
    }}