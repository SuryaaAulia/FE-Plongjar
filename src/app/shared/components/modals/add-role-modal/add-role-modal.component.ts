import {
  Component,
  EventEmitter,
  Input,
  Output,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-role-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-role-modal.component.html',
  styleUrls: ['./add-role-modal.component.scss'],
})
export class AddRoleModalComponent {
  @Input() show = false;
  @Input() availableRoles: string[] = [];
  @Input() position: { top: number; left: number } = { top: 0, left: 0 };
  @Output() close = new EventEmitter<void>();
  @Output() selectRole = new EventEmitter<string>();

  roleColors: { [key: string]: string } = {
    'Kaur Lab': 'red',
    'Ket. KK': 'blue',
    Kaprodi: 'green',
    LAA: 'yellow',
    Admin: 'pink',
  };

  // Drag functionality
  isDragging = false;
  dragOffset = { x: 0, y: 0 };
  dragStart = { x: 0, y: 0 };

  onClose(): void {
    this.close.emit();
  }

  onSelectRole(role: string): void {
    this.selectRole.emit(role);
  }

  onDragStart(event: MouseEvent): void {
    event.preventDefault();
    this.isDragging = true;
    this.dragStart = {
      x: event.clientX - this.dragOffset.x,
      y: event.clientY - this.dragOffset.y,
    };
  }

  @HostListener('document:mousemove', ['$event'])
  onDragMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    event.preventDefault();
    this.dragOffset = {
      x: event.clientX - this.dragStart.x,
      y: event.clientY - this.dragStart.y,
    };
  }

  @HostListener('document:mouseup', ['$event'])
  onDragEnd(event: MouseEvent): void {
    if (!this.isDragging) return;

    this.isDragging = false;
  }
}