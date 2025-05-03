import {
  Component,
  EventEmitter,
  Input,
  Output,
  ElementRef,
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

  onClose(): void {
    this.close.emit();
  }

  onSelectRole(role: string): void {
    this.selectRole.emit(role);
  }
}
