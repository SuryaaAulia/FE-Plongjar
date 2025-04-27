import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-tag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-tag.component.html',
  styleUrls: ['./role-tag.component.scss']
})
export class RoleTagComponent {
  @Input() roleName!: string;
  @Output() remove = new EventEmitter<string>();

  onRemove(): void {
    this.remove.emit(this.roleName);
  }
}