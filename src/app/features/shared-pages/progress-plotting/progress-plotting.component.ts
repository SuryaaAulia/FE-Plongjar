import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseDetail, ProgressPlottingCardComponent } from '../../../shared/components/index';
import { LoadingSpinnerComponent, SearchMatkulComponent } from '../../../shared/components';
import { Subject } from 'rxjs';

export interface PlottingProgressData {
  statusTitle: string;
  courseCount: number;
  percentage: number;
  statusType: 'not-plotted' | 'in-progress' | 'completed';
  courseList: CourseDetail[];
}

@Component({
  selector: 'app-progress-plotting-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ProgressPlottingCardComponent, LoadingSpinnerComponent, SearchMatkulComponent],
  templateUrl: './progress-plotting.component.html',
  styleUrls: ['./progress-plotting.component.scss']
})
export class ProgressPlottingPageComponent {
  @Input() plottingData: PlottingProgressData[] = [];
  @Input() isLoading: boolean = false;
  @Input() isEmbedded: boolean = false;

  @Input() selectedProdiId: number | null = null;
  @Input() selectedProdiName: string | undefined

  @Output() prodiChanged = new EventEmitter<number>();
  @Output() viewSwitched = new EventEmitter<void>();

  private searchSubject = new Subject<string>();
  searchQuery: string = '';


  onSwitchView(): void {
    this.viewSwitched.emit();
  }

  onSearchQueryChange(): void {
    this.searchSubject.next(this.searchQuery);
  }
}
