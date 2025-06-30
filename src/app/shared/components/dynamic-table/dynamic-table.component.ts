import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule, NgStyle, NgClass } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

export interface ColumnConfig {
  key: string;
  label: string;
  isSticky?: boolean;
  stickyOrder?: number;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  customClass?: string;
  headerCustomClass?: string;
  cellCustomClass?: string;
  cellRenderer?: (item: any, colConfig: ColumnConfig) => string | number;
  titleRenderer?: (item: any, colConfig: ColumnConfig) => string;
}

interface StickyColumnStyle {
  left: string;
  width: string;
  minWidth: string;
  maxWidth: string;
}

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [CommonModule, NgStyle, NgClass, LoadingSpinnerComponent],
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DynamicTableComponent implements OnChanges {
  @Input() data: any[] = [];
  @Input() columnConfigs: ColumnConfig[] = [];
  @Input() tableMinimuWidth?: string;
  @Input() isLoading?: boolean = false;
  @Input() parentMaxHeight: string = '70vh';
  @Input() noDataMessage: string = 'No data available.';

  stickyColStylesMap: Map<string, StickyColumnStyle> = new Map();
  sortedStickyColumns: ColumnConfig[] = [];
  nonStickyColumns: ColumnConfig[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columnConfigs'] || changes['data']) {
      this.prepareColumnLayout();
    }
  }

  private prepareColumnLayout(): void {
    this.stickyColStylesMap.clear();
    const stickyColumns = this.columnConfigs
      .filter(col => col.isSticky)
      .sort((a, b) => (a.stickyOrder ?? Infinity) - (b.stickyOrder ?? Infinity));

    this.sortedStickyColumns = stickyColumns;
    this.nonStickyColumns = this.columnConfigs.filter(col => !col.isSticky);


    let currentLeft = 0;
    for (const col of stickyColumns) {
      const colWidth = col.width || 'auto';
      const style: StickyColumnStyle = {
        left: `${currentLeft}px`,
        width: colWidth,
        minWidth: col.minWidth || colWidth,
        maxWidth: col.maxWidth || colWidth,
      };
      this.stickyColStylesMap.set(col.key, style);

      const widthMatch = (col.width || '0').match(/^(\d+)(px)?$/);
      if (widthMatch && widthMatch[1]) {
        currentLeft += parseInt(widthMatch[1], 10);
      } else {
      }
    }
  }

  getStickyStylesForColumn(columnKey: string): { [key: string]: string } | null {
    const styles = this.stickyColStylesMap.get(columnKey);
    if (styles) {
      return {
        'position': 'sticky',
        'left': styles.left,
        'width': styles.width,
        'min-width': styles.minWidth,
        'max-width': styles.maxWidth,
      };
    }
    return null;
  }

  isLastSticky(columnKey: string): boolean {
    if (this.sortedStickyColumns.length === 0) return false;
    return this.sortedStickyColumns[this.sortedStickyColumns.length - 1].key === columnKey;
  }

  getCellValue(item: any, colConfig: ColumnConfig): any {
    if (colConfig.cellRenderer) {
      return colConfig.cellRenderer(item, colConfig);
    }
    return colConfig.key.split('.').reduce((o, k) => (o || {})[k], item);
  }

  getCellTitle(item: any, colConfig: ColumnConfig): string {
    if (colConfig.titleRenderer) {
      return colConfig.titleRenderer(item, colConfig);
    }
    const value = this.getCellValue(item, colConfig);
    return value?.toString() || '';
  }

  trackByColumnKey(index: number, colConfig: ColumnConfig): string {
    return colConfig.key;
  }

  trackByRow(index: number, item: any): any {
    return item.id || item.no || index;
  }
}