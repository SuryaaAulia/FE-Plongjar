import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../core/models/user.model';
import { RoleTagComponent } from '../../role-tag/role-tag.component';
import { BaseCardComponent } from '../base-card/base-card.component';
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, RoleTagComponent, BaseCardComponent],
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
})
export class UserCardComponent {
  @Input() user!: User;
  @Input() isSelected: boolean = false;
  @Output() removeRole = new EventEmitter<string>();
  @Output() addRole = new EventEmitter<MouseEvent>();

  onRemoveRole(role: string): void {
    this.removeRole.emit(role);
  }

  onAddRole(event: MouseEvent): void {
    this.addRole.emit(event);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }
}