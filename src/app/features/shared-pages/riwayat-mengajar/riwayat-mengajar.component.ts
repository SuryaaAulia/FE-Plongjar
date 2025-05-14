import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  SearchHeaderComponent,
  PaginationComponent,
} from '../../../shared/components/index';
import { TeachingRecord } from '../../../core/models/user.model';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-riwayat-mengajar',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    SearchHeaderComponent,
    PaginationComponent,
    TableComponent,],
  templateUrl: './riwayat-mengajar.component.html',
  styleUrl: './riwayat-mengajar.component.scss'
})
export class RiwayatMengajarComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  teachingRecords: TeachingRecord[] = [];
  filteredRecords: TeachingRecord[] = [];
  paginatedRecords: TeachingRecord[] = [];

  isLoading = true;
  error: string | null = null;
  currentPage = 1;
  itemsPerPage = 9;

  currentLecturerCode: string | null = null;
  lecturerName: string = '';

  tableColumns: TableColumn<TeachingRecord>[] = [
    { key: 'subject', header: 'Mata Kuliah', width: 'col-nama-dosen' },
    { key: 'pic', header: 'PIC' },
    { key: 'class_type', header: 'Online/Onsite' },
    { key: 'class', header: 'Kelas', width: 'col-bidang-keahlian' },
    { key: 'quota', header: 'Kuota' },
    { key: 'period', header: 'Periode' },
  ];

  ngOnInit(): void {
    this.isLoading = true;

    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.currentLecturerCode = params.get('lecturerCode');
        if (!this.currentLecturerCode) {
          this.error = 'Lecturer code not provided in route.';
          this.isLoading = false;
          return of({ name: 'Error', records: [] });
        }

        const name = this.findMockLecturerName(this.currentLecturerCode);
        this.lecturerName = name || 'Unknown Lecturer';

        const records = this.loadMockDataForLecturer(this.currentLecturerCode);
        return of({ name: this.lecturerName, records: records });
      })
    ).subscribe({
      next: (result) => {

        this.teachingRecords = result.records;
        this.filteredRecords = [...this.teachingRecords];
        this.updatePaginatedRecords();
        this.isLoading = false;
        this.error = null;
        if (this.teachingRecords.length === 0 && !this.error) {

        }
      },
      error: (err) => {
        console.error("Error loading teaching history:", err);
        this.error = 'Failed to load teaching history data.';
        this.lecturerName = 'Error';
        this.isLoading = false;
        this.teachingRecords = [];
        this.filteredRecords = [];
        this.paginatedRecords = [];
      }
    });
  }

  findMockLecturerName(code: string): string | undefined {

    const mockLecturers = Array.from({ length: 35 }, (_, i) => ({
      lecturerCode: `LCD-${1000 + i}`,
      name: `Lecturer Japran Hapis Risjad Rangga ${i + 1}`
    }));
    const found = mockLecturers.find(l => l.lecturerCode === code);
    return found?.name;
  }

  loadMockDataForLecturer(lecturerCode: string): TeachingRecord[] {
    console.log(`Simulating fetch for lecturer: ${lecturerCode}`);
    const subjects = [
      { code: 'CRI3I3', name: 'PEMROGRAMAN PERANGKAT BERGERAK', credits: 3 },
      { code: 'CII2J4', name: 'DASAR PEMROGRAMAN', credits: 4 },
      { code: 'CIT3A4', name: 'STRUKTUR DATA DAN ALGORITMA', credits: 4 },
      { code: 'CII1F4', name: 'MATEMATIKA DISKRIT', credits: 4 },
      { code: 'CSI4I3', name: 'KECERDASAN ARTIFISIAL', credits: 3 },
      { code: 'CSI4G3', name: 'PEMBELAJARAN MESIN', credits: 3 },
    ];
    const classes = ['SE-45-01', 'SE-45-02', 'SE-46-01', 'SE-46-02', 'IF-45-01', 'DS-45-01'];
    const periods = ['TA 2023/2024 - Genap', 'TA 2023/2024 - Ganjil', 'TA 2024/2025 - Genap', 'TA 2024/2025 - Ganjil'];
    const classTypes: ('Online' | 'Onsite')[] = ['Online', 'Onsite'];

    const recordsForLecturer: TeachingRecord[] = [];
    const recordCount = Math.floor(Math.random() * 5) + 3;

    for (let i = 0; i < recordCount; i++) {
      const subject = subjects[i % subjects.length];
      const classType = classTypes[i % classTypes.length];
      const className = classes[i % classes.length];
      const period = periods[i % periods.length];

      recordsForLecturer.push({
        id: `TR-${lecturerCode}-${i + 1}`,
        subject: `${subject.code}-${subject.name}`,
        pic: lecturerCode,
        class_type: classType,
        class: className,
        quota: Math.floor(Math.random() * 21) + 30,
        period: period,
      });
    }
    return recordsForLecturer;
  }


  onSearch(searchQuery: { query1: string; query2: string }): void {
    const { query1, query2 } = searchQuery;
    const term1 = query1.toLowerCase();
    const term2 = query2.toLowerCase();

    this.filteredRecords = this.teachingRecords.filter(record => {
      const subjectMatch = term1 ? record.subject.toLowerCase().includes(term1) || record.class?.toLowerCase().includes(term1) : true;
      const periodMatch = term2 ? record.period.toLowerCase().includes(term2) : true;
      return subjectMatch && periodMatch;
    });

    this.currentPage = 1;
    this.updatePaginatedRecords();
  }

  onItemsPerPageChange(count: number): void {
    this.itemsPerPage = count;
    this.currentPage = 1;
    this.updatePaginatedRecords();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedRecords();
  }

  updatePaginatedRecords(): void {
    if (!this.filteredRecords) return;
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedRecords = this.filteredRecords.slice(start, end);
  }

  goBack(): void {
    this.router.navigate(['/ketua-kk/list-dosen']);
  }
}