import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.scss']
})
export class ActionButtonComponent implements OnInit, OnChanges {
  @Input() text?: string;
  @Input() iconClass?: string;
  @Input() iconCustomColor?: string;
  @Input() showIcon: boolean = true;

  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth: boolean = false;

  @Input() backgroundColorVar: string = 'var(--primary-blue)';
  @Input() textColorVar: string = 'var(--primary-white)';
  @Input() borderColorVar?: string;

  @Input() fontSizePx: number = 16;
  @Input() paddingScaleFactor: number = 0.5;
  @Input() paddingHorizontalMultiplier: number = 1.5;


  @Output() buttonClick = new EventEmitter<MouseEvent>();

  public currentButtonStyles: { [key: string]: string | null } = {};
  private readonly FIXED_BORDER_RADIUS_PX: number = 6;

  constructor() { }

  ngOnInit(): void {
    this.updateButtonStyles();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['backgroundColorVar'] ||
      changes['textColorVar'] ||
      changes['borderColorVar'] ||
      changes['fontSizePx'] ||
      changes['paddingScaleFactor'] ||
      changes['paddingHorizontalMultiplier']
    ) {
      this.updateButtonStyles();
    }
  }

  private updateButtonStyles(): void {
    const styles: { [key: string]: string | null } = {};

    styles['background-color'] = this.backgroundColorVar;
    styles['color'] = this.textColorVar;

    if (this.borderColorVar) {
      styles['border-color'] = this.borderColorVar;
      styles['border-width'] = '1px';
      styles['border-style'] = 'solid';
    } else {
      styles['border-style'] = 'none';
    }

    styles['font-size'] = `${this.fontSizePx}px`;

    const verticalPadding = this.fontSizePx * this.paddingScaleFactor;
    const horizontalPadding = verticalPadding * this.paddingHorizontalMultiplier;
    styles['padding'] = `${verticalPadding}px ${horizontalPadding}px`;

    styles['border-radius'] = `${this.FIXED_BORDER_RADIUS_PX}px`;

    this.currentButtonStyles = styles;
  }

  onButtonClick(event: MouseEvent): void {
    if (!this.disabled) {
      this.buttonClick.emit(event);
    }
  }

  getIconStyles(): { [key: string]: string | null } {
    const iconColor = this.iconCustomColor ? this.iconCustomColor : 'inherit';
    return {
      'color': iconColor,
      'font-size': 'inherit'
    };
  }
}
