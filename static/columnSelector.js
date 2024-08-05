export function toggleColumn(column) {
    const index = this.visibleColumns.indexOf(column);
    if (index > -1) {
        this.visibleColumns.splice(index, 1);
    } else {
        this.visibleColumns.push(column);
    }
}

export function startDrag(column, event) {
    this.draggedColumn = column;
    event.dataTransfer.setData('text/plain', column);
    event.dataTransfer.effectAllowed = 'move';
    event.target.closest('.d-flex').classList.add('dragging');
}

export function onDrag(event) {
    event.preventDefault();
}

export function onDrop(targetColumn, event) {
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
}