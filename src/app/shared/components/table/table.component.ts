import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn<T> {
  key: string;
  header: string;
  width?: string;
  cell?: (item: T) => string | number;
}

export interface ActionButton<T> {
  icon: string;
  title: string;
  onClick: (item: T) => void;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent<T> {
  @Input() columns: TableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() isLoading = false;
  @Input() noDataMessage = 'No data available';
  @Input() showIndex = true;
  @Input() currentPage = 1;
  @Input() itemsPerPage = 10;
  @Input() actionButtons: ActionButton<T>[] = [];
  @Input() trackBy: (index: number, item: T) => any = (index) => index;

  @Output() rowClick = new EventEmitter<T>();

  getItemValue(item: T, column: TableColumn<T>): string | number {
    if (column.cell) {
      return column.cell(item);
    }

    return this.getNestedPropertyValue(item, column.key);
  }

  private getNestedPropertyValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  }

  onRowClick(item: T): void {
    this.rowClick.emit(item);
  }
}
