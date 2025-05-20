import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  SearchHeaderComponent,
  PaginationComponent,
} from '../../../shared/components/index';
import { Lecturer } from '../../../core/models/user.model';
import { TableComponent, TableColumn, ActionButton } from '../../../shared/components/table/table.component';
import { AuthService, UserRole } from '../../../core/services/auth.service';

@Component({
  selector: 'app-lecturer-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchHeaderComponent,
    PaginationComponent,
    TableComponent,
  ],
  templateUrl: './list-dosen.component.html',
  styleUrls: ['./list-dosen.component.scss'],
})
export class ListDosenComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService) { }

  lecturer: Lecturer[] = [];
  filteredLecturers: Lecturer[] = [];
  paginatedLecturers: Lecturer[] = [];

  isLoading = true;
  error: string | null = null;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 9;

  tableColumns: TableColumn<Lecturer>[] = [
    { key: 'name', header: 'Nama Dosen', width: 'col-nama-dosen' },
    { key: 'lecturerCode', header: 'Kode' },
    { key: 'nidn', header: 'NIP' },
    { key: 'kelompokKeahlian', header: 'Bidang Keahlian', width: 'col-bidang-keahlian' },
    { key: 'statusPegawai', header: 'Status' },
  ];

  actionButtons: ActionButton<Lecturer>[] = [
    {
      icon: 'fa-money-check',
      title: 'Detail SKS',
      onClick: (lecturer: Lecturer) => this.viewLecturerSKS(lecturer.lecturerCode),
    },
    {
      icon: 'fa-file-alt',
      title: 'Detail',
      onClick: (lecturer: Lecturer) => this.viewLecturerDetails(lecturer.lecturerCode),
    },
  ];

  ngOnInit(): void {
    this.loadMockData();
  }

  loadMockData(): void {
    this.isLoading = true;
    this.error = null;

    // Dummy data
    this.lecturer = Array.from({ length: 35 }, (_, i) => ({
      id: (i + 1).toString(),
      name: `Lecturer Japran Hapis Risjad Rangga ${i + 1}`,
      lecturerCode: `LCD-${1000 + i}`,
      email: `lecturer${i + 1}@univ.edu`,
      jabatanFunctionalAkademik: ['Lektor'],
      statusPegawai: i % 2 === 0 ? 'Aktif' : 'Tidak Aktif',
      pendidikanTerakhir: 'S3',
      department: 'Computer Science',
      nidn: `12345678${String(i).padStart(2, '0')}`,
      kelompokKeahlian:
        'Artificial Intelligence, Machine Learning, Data Science',
    }));

    this.applyFilterAndPaginate();
    this.isLoading = false;
  }

  onSearch(searchQuery: { query1: string; query2: string }): void {
    const { query1, query2 } = searchQuery;
    const namaTerm = query1.toLowerCase().trim();
    const kodeTerm = query2.toLowerCase().trim();

    this.filteredLecturers = this.lecturer.filter(
      (lec) =>
        (namaTerm
          ? lec.name.toLowerCase().includes(namaTerm) ||
          lec.nidn?.toLowerCase().includes(namaTerm) ||
          lec.email?.toLowerCase().includes(namaTerm)
          : true) &&
        (kodeTerm
          ? lec.lecturerCode?.toLowerCase().includes(kodeTerm)
          : true)
    );

    this.currentPage = 1;
    this.updatePaginatedLecturers();
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredLecturers = [...this.lecturer];
    } else {
      this.filteredLecturers = this.lecturer.filter(
        (lec) =>
          lec.name.toLowerCase().includes(term) ||
          lec.lecturerCode.toLowerCase().includes(term) ||
          lec.nidn?.toLowerCase().includes(term) ||
          lec.kelompokKeahlian?.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
    this.updatePaginatedLecturers();
  }

  private applyFilterAndPaginate(): void {
    if (this.searchTerm) {
      this.applyFilter();
    } else {
      this.filteredLecturers = [...this.lecturer];
    }
    this.updatePaginatedLecturers();
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

  updatePaginatedLecturers(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedLecturers = this.filteredLecturers.slice(start, end);
  }

  onRowClick(lecturer: Lecturer): void {
    this.viewLecturerDetails(lecturer.lecturerCode);

  }

  viewLecturerSKS(lecturerCode: string): void {
    const currentUserRole = this.authService.currentUserRole;
    if (currentUserRole === 'ketua_prodi') {
      this.router.navigate(['/ketua-prodi/riwayat-mengajar/', lecturerCode]);
    } else {
      this.router.navigate(['/ketua-kk/riwayat-mengajar/', lecturerCode]);
    }
  }

  viewLecturerDetails(lecturerCode: string): void {
    const currentUserRole = this.authService.currentUserRole;
    if (currentUserRole === 'ketua_prodi') {
      this.router.navigate(['/ketua-prodi/detail-dosen/', lecturerCode]);
    } else {
      this.router.navigate(['/ketua-kk/detail-dosen/', lecturerCode]);
    }
  }
}
