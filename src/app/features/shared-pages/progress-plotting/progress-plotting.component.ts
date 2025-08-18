import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressPlottingCardComponent, CardStatus } from '../../../shared/components/index';

export interface PlottingProgressData {
  statusTitle: string;
  courseCount: number;
  percentage: number;
  statusType: CardStatus;
}

@Component({
  selector: 'app-progress-plotting-page',
  standalone: true,
  imports: [CommonModule, ProgressPlottingCardComponent],
  templateUrl: './progress-plotting.component.html',
  styleUrls: ['./progress-plotting.component.scss']
})
export class ProgressPlottingPageComponent {
  @Input() plottingData: PlottingProgressData[] = [];

  @Input() isLoading: boolean = false;
}
