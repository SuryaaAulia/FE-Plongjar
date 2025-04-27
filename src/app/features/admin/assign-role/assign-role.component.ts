import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchHeaderComponent } from '../../../shared/components/index';
import { UserCardComponent } from '../../../shared/components/index';
import { PaginationComponent } from '../../../shared/components/index';

interface User {
  id: string;
  name: string;
  department: string;
  roles?: string[];
}

@Component({
  selector: 'app-assign-role',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchHeaderComponent,
    UserCardComponent,
    PaginationComponent
  ],
  templateUrl: './assign-role.component.html',
  styleUrls: ['./assign-role.component.scss']
})
export class AssignRoleComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 9;

  ngOnInit(): void {
    this.generateMockUsers();
    this.filteredUsers = [...this.users];
  }

  generateMockUsers(): void {
    for (let i = 0; i < 200; i++) {
      this.users.push({
        id: '65387547',
        name: 'Bambang Pamungkas, S.T., M.T.',
        department: 'BPS',
        roles: i === 0 ? ['Dosen', 'Kor. MK'] : []
      });
    }
  }

  onSearch(searchParams: { name: string, code: string }): void {
    this.filteredUsers = this.users.filter(user => {
      return user.name.toLowerCase().includes(searchParams.name.toLowerCase()) &&
             user.id.includes(searchParams.code);
    });
    this.currentPage = 1;
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
  }

  addRole(user: User): void {
    // In a real app, this would open a modal/dialog for role selection
    if (!user.roles) user.roles = [];
    user.roles.push('New Role'); // Example - replace with actual role selection
  }

  removeRole(user: User, role: string): void {
    if (user.roles) {
      user.roles = user.roles.filter(r => r !== role);
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }
}