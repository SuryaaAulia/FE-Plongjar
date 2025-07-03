import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCardComponent } from '../base-card/base-card.component';
import { Course } from '../../../../core/models/user.model';

@Component({
  selector: 'app-plotting-result-card',
  standalone: true,
  imports: [CommonModule, BaseCardComponent],
  templateUrl: './plotting-result-card.component.html',
  styleUrl: './plotting-result-card.component.scss'
})
export class PlottingResultCardComponent {

  @Input() course!: Course;
  @Output() cardClick = new EventEmitter<Course>();
  @Output() showDetails = new EventEmitter<Course>();
  @Output() downloadExcel = new EventEmitter<Course>();

  onCardClick(): void {
    this.cardClick.emit(this.course);
  }

  onShowDetailsClick(event: Event): void {
    event.stopPropagation();
    this.showDetails.emit(this.course);
  }

  onDownloadExcelClick(event: Event): void {
    event.stopPropagation();
    this.downloadExcel.emit(this.course);
  }
}