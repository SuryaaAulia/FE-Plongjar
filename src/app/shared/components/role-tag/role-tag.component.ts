import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-tag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-tag.component.html',
  styleUrls: ['./role-tag.component.scss'],
})
export class RoleTagComponent {
  @Input() roleName!: string;

  get roleIcon(): string {
    return 'fa-circle';
  }

  getCircleColor(): string {
    const role = this.roleName.toLowerCase();
    if (role.includes('kaur lab')) return 'var(--red)';
    if (role.includes('ket. kk')) return 'var(--blue)';
    if (role.includes('kaprodi')) return 'var(--green)';
    if (role.includes('laa')) return 'var(--yellow)';
    if (role.includes('admin')) return 'var(--purple)';
    return 'var(--grey)';
  }
}
