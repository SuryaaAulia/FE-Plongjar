import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCardComponent } from '../base-card/base-card.component';
import { PlottingSummary } from '../../../../features/shared-pages/rekap-plotting/rekap-plotting.component';

@Component({
  selector: 'app-plotting-result-card',
  standalone: true,
  imports: [CommonModule, BaseCardComponent],
  templateUrl: './plotting-result-card.component.html',
  styleUrl: './plotting-result-card.component.scss'
})
export class PlottingResultCardComponent {

  @Input() summary!: PlottingSummary;

  @Output() cardClick = new EventEmitter<PlottingSummary>();
  @Output() showDetails = new EventEmitter<PlottingSummary>();
  @Output() downloadExcel = new EventEmitter<PlottingSummary>();

  onCardClick(): void {
    this.cardClick.emit(this.summary);
  }

  onShowDetailsClick(event: Event): void {
    event.stopPropagation();
    this.showDetails.emit(this.summary);
  }

  onDownloadExcelClick(event: Event): void {
    event.stopPropagation();
    this.downloadExcel.emit(this.summary);
  }
}