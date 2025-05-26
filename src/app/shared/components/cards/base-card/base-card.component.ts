import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-base-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-card.component.html',
  styleUrl: './base-card.component.scss'
})
export class BaseCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() clickable: boolean = false;
  @Input() headerActionsTemplate?: TemplateRef<any>;
  @Input() contentTemplate?: TemplateRef<any>;
  @Input() footerActionsTemplate?: TemplateRef<any>;

  @Output() cardClick = new EventEmitter<void>();

  onCardClick(): void {
    if (this.clickable) {
      this.cardClick.emit();
    }
  }
}