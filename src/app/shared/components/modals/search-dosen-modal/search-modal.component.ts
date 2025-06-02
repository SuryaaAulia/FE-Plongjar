import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Lecturer } from '../../../../core/models/user.model';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.scss',
})
export class SearchModalComponent {
  @Output() lecturerSelected = new EventEmitter<Lecturer>();
  @Output() closeModal = new EventEmitter<void>();

  searchNameTerm: string = '';
  searchCodeTerm: string = '';

  hasSearched: boolean = false;
  searchResults: Lecturer[] = [];
  private fullFilteredResults: Lecturer[] = [];

  allLecturers: Lecturer[] = [
    { id: 1, name: 'Bambang Pamungkas Prayoga', lecturerCode: 'BPP', jabatanFunctionalAkademik: ['Lektor'], email: 'bpp@example.com', statusPegawai: 'Tetap' },
    { id: 2, name: 'Bambang Pamungkas Junaidi', lecturerCode: 'BPJ', jabatanFunctionalAkademik: ['Asisten Ahli'], nidn: '0012345678', statusPegawai: 'Tetap' },
    { id: 3, name: 'Bambang Pamungkas Budiman', lecturerCode: 'BPB', jabatanFunctionalAkademik: ['Lektor Kepala'], statusPegawai: 'Tetap' },
    { id: 4, name: 'Bambang Pamungkas Ahmadi', lecturerCode: 'BPA', jabatanFunctionalAkademik: ['Guru Besar'], kelompokKeahlian: 'Software Engineering', statusPegawai: 'Tetap' },
    { id: 5, name: 'Bambang Pamungkas Zakari', lecturerCode: 'BPZ', jabatanFunctionalAkademik: ['Tenaga Pengajar'], statusPegawai: 'Tetap' },
    { id: 6, name: 'Siti Aminah', lecturerCode: 'STA', jabatanFunctionalAkademik: ['Lektor'], pendidikanTerakhir: ['S3'], statusPegawai: 'Tetap' },
    { id: 7, name: 'Ahmad Subagyo', lecturerCode: 'ASB', jabatanFunctionalAkademik: ['Asisten Ahli'], statusPegawai: 'Tetap' },
    { id: 8, name: 'Dewi Lestari', lecturerCode: 'DWL', jabatanFunctionalAkademik: ['Lektor Kepala'], department: 'Informatika', statusPegawai: 'Tetap' },
    { id: 9, name: 'Rizky Pratama', lecturerCode: 'RZP', jabatanFunctionalAkademik: ['Guru Besar'], statusPegawai: 'Tetap' },
    { id: 10, name: 'Putu Wijaya', lecturerCode: 'PTW', jabatanFunctionalAkademik: ['Lektor'], statusPegawai: 'Tetap' },
  ];

  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;

  constructor() { }

  performSearch(): void {
    const nameTerm = this.searchNameTerm.trim().toLowerCase();
    const codeTerm = this.searchCodeTerm.trim().toLowerCase();

    if (nameTerm === '' && codeTerm === '') {
      this.hasSearched = false;
      this.fullFilteredResults = [];
      this.searchResults = [];
      this.totalItems = 0;
      this.currentPage = 1;
      return;
    }

    this.fullFilteredResults = this.allLecturers.filter((lecturer) => {
      const nameMatches = nameTerm === '' || lecturer.name.toLowerCase().includes(nameTerm);
      const codeMatches = codeTerm === '' || lecturer.lecturerCode.toLowerCase().includes(codeTerm);
      return nameMatches && codeMatches;
    });

    this.totalItems = this.fullFilteredResults.length;
    this.currentPage = 1;
    this.updatePaginatedResults();
    this.hasSearched = true;
  }

  updatePaginatedResults(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.searchResults = this.fullFilteredResults.slice(startIndex, endIndex);
  }

  selectAndClose(lecturer: Lecturer): void {
    this.lecturerSelected.emit(lecturer);
    this.closeModal.emit();
    this.resetModalState();
  }

  requestClose(): void {
    this.resetModalState();
    this.closeModal.emit();
  }

  private resetModalState(): void {
    this.searchNameTerm = '';
    this.searchCodeTerm = '';
    this.hasSearched = false;
    this.fullFilteredResults = [];
    this.searchResults = [];
    this.totalItems = 0;
    this.currentPage = 1;
  }

  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.totalItems) {
      this.currentPage++;
      this.updatePaginatedResults();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedResults();
    }
  }

  get displayedItemsStart(): number {
    return this.totalItems > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
  }

  get displayedItemsEnd(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.totalItems ? this.totalItems : end;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
}