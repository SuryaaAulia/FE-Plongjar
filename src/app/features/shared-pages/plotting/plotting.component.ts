import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchModalComponent } from '../../../shared/components/index';
import { Lecturer } from '../../../core/models/user.model';
import { SearchMatkulComponent } from '../../../shared/components/search-matkul/search-matkul.component';
import { Course } from '../../../core/models/user.model';

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
    SearchModalComponent,
    SearchMatkulComponent
  ],
  templateUrl: './plotting.component.html',
  styleUrls: ['./plotting.component.scss']
})
export class PlottingComponent implements OnInit {
  currentSelectedCourse: Course | null = null;
  currentSelectedAcademicYear: string | null = null;
  displaySelectedCourseText: string = '';

  coordinatorName: string = '';
  coordinatorObject?: Lecturer;

  tableData: CourseRow[] = [];

  showLecturerSearchModal: boolean = false;
  editingField: 'coordinator' | 'dosen' | null = null;
  editingDosenIndex: number | null = null;

  noCourseSelectedImageUrl: string = 'assets/images/search_plotting.svg';
  showPlaceholderContent: boolean = true;

  constructor() { }

  ngOnInit(): void {
    this.updatePlaceholderVisibility();
  }

  handleCourseAndYearSelected(selection: { course: Course, academicYear: string }): void {
    this.currentSelectedCourse = selection.course;
    this.currentSelectedAcademicYear = selection.academicYear;
    this.displaySelectedCourseText = `${selection.course.id} - ${selection.course.name} (T.A. ${selection.academicYear})`;

    if (this.currentSelectedCourse) {
      this.generateMockData(this.currentSelectedCourse.name);
      this.coordinatorName = '';
      this.coordinatorObject = undefined;
    } else {
      this.tableData = [];
      this.coordinatorName = '';
      this.coordinatorObject = undefined;
    }
    this.updatePlaceholderVisibility();
  }

  updatePlaceholderVisibility(): void {
    this.showPlaceholderContent = !this.currentSelectedCourse || this.tableData.length === 0;
  }

  generateMockData(courseName: string): void {
    console.log(`Generating data for course: ${courseName}`);
    if (this.currentSelectedCourse) {
      this.tableData = [
        { no: 1, kelas: 'SE-45-01', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 2, kelas: 'SE-45-02', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
        { no: 3, kelas: 'SE-45-03', dosen: '', praktikum: 'YES', kuota: 48, kredit: 4, pic: 'SEAL', semester: 'GENAP', onlineOnsite: 'ONSITE' },
      ];
    } else {
      this.tableData = [];
    }
  }

  openLecturerModal(field: 'coordinator' | 'dosen', index?: number): void {
    if (!this.currentSelectedCourse && field === 'coordinator') {
      alert('Pilih Mata Kuliah & Tahun Ajaran terlebih dahulu.');
      return;
    }
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
    this.currentSelectedCourse = null;
    this.currentSelectedAcademicYear = null;
    this.displaySelectedCourseText = '';
    this.tableData = [];
    this.coordinatorName = '';
    this.coordinatorObject = undefined;
    this.updatePlaceholderVisibility();
  }

  onSubmit(): void {
    if (!this.currentSelectedCourse || !this.currentSelectedAcademicYear) {
      alert('Mohon pilih Mata Kuliah & Tahun Ajaran terlebih dahulu.');
      return;
    }
    if (!this.coordinatorName) {
      alert('Mohon pilih Koordinator Mata Kuliah.');
      return;
    }
    const unassignedDosen = this.tableData.find(row => !row.dosen);
    if (unassignedDosen) {
      alert(`Mohon tetapkan Dosen untuk kelas ${unassignedDosen.kelas}.`);
      return;
    }

    console.log('Submit button clicked');
    console.log('Selected Course:', this.currentSelectedCourse);
    console.log('Selected Academic Year:', this.currentSelectedAcademicYear);
    console.log('Coordinator Name:', this.coordinatorName, 'Object:', this.coordinatorObject);
    console.log('Table Data:', this.tableData);
  }
}