import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchModalComponent } from '../../../shared/components/index';
import { Lecturer } from '../../../core/models/user.model';

interface CourseRow {
  no: number;
  kelas: string;
  dosen: string;
  dosenObject?: Lecturer;
  praktikum: 'YES' | 'NO';
  kuota: number;
  kredit: number;
  pic: string;
  semester: string;
  onlineOnsite: 'ONLINE' | 'ONSITE';
}

@Component({
  selector: 'app-plotting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchModalComponent
  ],
  templateUrl: './plotting.component.html',
  styleUrls: ['./plotting.component.scss']
})
export class PlottingComponent implements OnInit {
  courseOptions: string[] = [
    'CRI3I3 - MOBILE PROGRAMMING',
    'CS101 - INTRODUCTION TO PROGRAMMING',
    'MA205 - LINEAR ALGEBRA'
  ];
  selectedCourse: string = this.courseOptions[0];
  coordinatorName: string = '';
  coordinatorObject?: Lecturer;

  tableData: CourseRow[] = [];

  showLecturerSearchModal: boolean = false;
  editingField: 'coordinator' | 'dosen' | null = null;
  editingDosenIndex: number | null = null;

  constructor() { }

  ngOnInit(): void {
    this.generateMockData();
  }

  generateMockData(): void {
    this.tableData = [
      { no: 1, kelas: 'SE-45-01', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
      { no: 2, kelas: 'SE-45-02', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
      { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
      { no: 4, kelas: 'SE-45-04', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
      { no: 5, kelas: 'SE-45-05', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
      { no: 6, kelas: 'SE-45-06', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
    ];
  }

  // Opens the lecturer search modal
  openLecturerModal(field: 'coordinator' | 'dosen', index?: number): void {
    this.editingField = field;
    if (field === 'dosen' && index !== undefined) {
      this.editingDosenIndex = index;
    } else {
      this.editingDosenIndex = null;
    }
    this.showLecturerSearchModal = true;
  }

  handleLecturerSelected(lecturer: Lecturer): void {
    const lecturerDisplay = `${lecturer.lecturerCode}`;
    if (this.editingField === 'coordinator') {
      this.coordinatorName = lecturerDisplay;
      this.coordinatorObject = lecturer;
    } else if (this.editingField === 'dosen' && this.editingDosenIndex !== null) {
      this.tableData[this.editingDosenIndex].dosen = lecturerDisplay;
      this.tableData[this.editingDosenIndex].dosenObject = lecturer;
    }
    this.closeLecturerModal();
  }

  closeLecturerModal(): void {
    this.showLecturerSearchModal = false;
    this.editingField = null;
    this.editingDosenIndex = null;
  }

  onBack(): void {
    console.log('Back button clicked');
  }

  onSubmit(): void {
    console.log('Submit button clicked');
    console.log('Selected Course:', this.selectedCourse);
    console.log('Coordinator Name:', this.coordinatorName, 'Object:', this.coordinatorObject);
    console.log('Table Data:', this.tableData);
  }
}