import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SearchHeaderComponent,
  PaginationComponent,
} from '../../../shared/components/index';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-lecturer-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchHeaderComponent,
    PaginationComponent,
  ],
  templateUrl: './list-dosen.component.html',
  styleUrls: ['./list-dosen.component.scss'],
})
export class ListDosenComponent implements OnInit {
  users: User[] = [];
  filteredLecturers: User[] = [];
  paginatedLecturers: User[] = [];

  isLoading = true;
  error: string | null = null;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;

  showDetailModal = false;
  selectedLecturer: User | null = null;
  modalPosition = { top: '200px', left: '50%' };

  ngOnInit(): void {
    this.loadMockData();
  }

  loadMockData(): void {
    this.isLoading = true;

    // Dummy data
    this.users = Array.from({ length: 35 }, (_, i) => ({
      id: (i + 1).toString(),
      name: `Lecturer Japran Hapis Risjad Rangga ${i + 1}`,
      lecturerCode: `LCD-${1000 + i}`,
      email: `lecturer${i + 1}@univ.edu`,
      jabatanFunctionalAkademik: ['Lektor'],
      statusPegawai: i % 2 === 0 ? 'Aktif' : 'Tidak Aktif',
      pendidikanTerakhir: 'S3',
      department: 'Computer Science',
      nidn: `12345678${i}`,
      kelompokKeahlian:
        'Artificial Intelligence, Machine Learning, Data Science',
    }));

    this.applyFilter();
    this.isLoading = false;
  }

  onSearch(searchQuery: { nama: string; kode: string }): void {
    const { nama, kode } = searchQuery;

    this.filteredLecturers = this.users.filter(
      (user) =>
        (nama
          ? user.name.toLowerCase().includes(nama.toLowerCase()) ||
            user.id.includes(nama) ||
            user.email?.toLowerCase().includes(nama.toLowerCase())
          : true) &&
        (kode
          ? user.lecturerCode?.toLowerCase().includes(kode.toLowerCase())
          : true)
    );

    this.currentPage = 1;
  }

  onItemsPerPageChange(count: number): void {
    this.itemsPerPage = count;
    this.currentPage = 1;
    this.updatePaginatedLecturers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedLecturers();
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredLecturers = this.users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.lecturerCode.toLowerCase().includes(term) ||
        user.nidn?.toLowerCase().includes(term) ||
        user.kelompokKeahlian?.toLowerCase().includes(term)
    );
    this.currentPage = 1;
    this.updatePaginatedLecturers();
  }

  updatePaginatedLecturers(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedLecturers = this.filteredLecturers.slice(start, end);
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedLecturer = null;
  }
}
