import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role } from '../../../core/models/user.model';
import { RoleService } from '../../../core/services/admin/role.service';

@Component({
  selector: 'app-role-tag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-tag.component.html',
  styleUrls: ['./role-tag.component.scss'],
})
export class RoleTagComponent {
  @Input() role!: Role;
  @Input() roleService!: RoleService;

  get roleIcon(): string {
    return 'fa-circle';
  }

  get displayName(): string {
    return this.roleService.getRoleDisplayName(this.role.name);
  }

  getCircleColor(): string {
    return this.roleService.getRoleColor(this.role.name);
  }
}