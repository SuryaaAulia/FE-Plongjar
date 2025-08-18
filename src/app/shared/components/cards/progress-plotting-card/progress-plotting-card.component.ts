import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardStatus = 'not-plotted' | 'in-progress' | 'completed';

@Component({
  selector: 'app-progress-plotting-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-plotting-card.component.html',
  styleUrls: ['./progress-plotting-card.component.scss']
})
export class ProgressPlottingCardComponent {
  @Input() statusTitle: string = '';

  @Input() courseCount: number = 0;

  @Input() percentage: number = 0;

  @Input() statusType: CardStatus = 'not-plotted';

  isExpanded: boolean = false;

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }
}
