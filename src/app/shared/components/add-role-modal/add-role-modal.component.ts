import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleTagComponent } from '../role-tag/role-tag.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-role-modal',
  standalone: true,
  imports: [CommonModule, RoleTagComponent, FormsModule],
  templateUrl: './add-role-modal.component.html',
  styleUrls: ['./add-role-modal.component.scss'],
})
export class AddRoleModalComponent {
  @Output() roleSelected = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  searchText: string = '';
  roles: string[] = ['Kaur Lab', 'Ket. KK', 'Kaprodi', 'LAA', 'Admin'];

  filteredRoles(): string[] {
    if (!this.searchText) {
      return this.roles;
    }
    return this.roles.filter((role) =>
      role.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  selectRole(role: string) {
    this.roleSelected.emit(role);
  }

  closeModal() {
    this.close.emit();
  }
}
