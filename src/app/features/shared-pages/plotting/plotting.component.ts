import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchModalComponent, SearchMatkulComponent, ActionButtonComponent, LoadingSpinnerComponent } from '../../../shared/components/index';
import { Lecturer, Course } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { PlottingService } from '../../../core/services/plotting.service';
import { finalize } from 'rxjs/operators';

interface CourseRow {
  no: number;
  mappingId: number;
  plottingId?: number;
  kelas: string;
  dosen: string;
  dosenObject?: Lecturer;
  praktikum: string;
  kuota: number;
  kredit: number;
  pic: string;
  semester: string;
  onlineOnsite: string;
}

interface ProdiOption {
  id: string;
  prodiId: number;
  name: string;
  color: string;
}

@Component({
  selector: 'app-plotting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchModalComponent,
    SearchMatkulComponent,
    ActionButtonComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './plotting.component.html',
  styleUrls: ['./plotting.component.scss']
})
export class PlottingComponent implements OnInit {
  currentSelectedCourse: Course | null = null;
  currentSelectedAcademicYear: { id: number; value: string } | null = null;
  displaySelectedCourseText: string = '';

  coordinatorName: string = '';
  coordinatorObject?: Pick<Lecturer, 'id' | 'name' | 'lecturerCode'>;

  tableData: CourseRow[] = [];
  isLoadingTableData: boolean = false;

  showLecturerSearchModal: boolean = false;
  editingField: 'coordinator' | 'dosen' | null = null;
  editingDosenIndex: number | null = null;

  noCourseSelectedImageUrl: string = 'assets/images/search_plotting.svg';
  showPlaceholderContent: boolean = true;
  showProdiSelection: boolean = false;
  selectedProdi: ProdiOption | null = null;

  prodiOptions: ProdiOption[] = [
    { id: 'S1-IF', prodiId: 1, name: 'S1 IF', color: '#4F7EFF' },
    { id: 'S1-RPL', prodiId: 2, name: 'S1 RPL', color: '#B444DB' },
    { id: 'S1-IT', prodiId: 3, name: 'S1 IT', color: '#E53535' },
    { id: 'S1-DS', prodiId: 4, name: 'S1 DS', color: '#00D4AA' },
    { id: 'S1-IF-PJJ', prodiId: 5, name: 'S1 IF PJJ', color: '#4F7EFF' },
    { id: 'S2-IF', prodiId: 6, name: 'S2 IF', color: '#4F7EFF' },
    { id: 'S2-FS', prodiId: 7, name: 'S2 FS', color: '#D4AF37' },
    { id: 'S3-IF', prodiId: 8, name: 'S3 IF', color: '#4F7EFF' }
  ];

  constructor(
    private authService: AuthService,
    private plottingService: PlottingService
  ) { }

  ngOnInit(): void {
    this.checkUserRoleAndInitialize();
  }

  public parseCourseId(course: Course | null): number {
    if (!course || !course.id) {
      throw new Error('Course ID is missing');
    }
    const parsed = parseInt(course.id);
    if (isNaN(parsed)) throw new Error('Course ID is not a valid number');
    return parsed;
  }

  private checkUserRoleAndInitialize(): void {
    const currentRole = this.authService.getCurrentRole();
    this.showProdiSelection = currentRole?.role_name === 'KelompokKeahlian';
    if (!this.showProdiSelection) {
      this.updatePlaceholderVisibility();
    }
  }

  handleProdiSelection(prodi: ProdiOption): void {
    this.selectedProdi = prodi;
    this.showProdiSelection = false;
    this.updatePlaceholderVisibility();
  }

  onBackToProdiSelection(): void {
    if (this.isKelompokKeahlianUser) {
      this.showProdiSelection = true;
      this.selectedProdi = null;
      this.resetPlottingData();
    }
  }

  private resetPlottingData(): void {
    this.currentSelectedCourse = null;
    this.currentSelectedAcademicYear = null;
    this.displaySelectedCourseText = '';
    this.tableData = [];
    this.coordinatorName = '';
    this.coordinatorObject = undefined;
    this.updatePlaceholderVisibility();
  }

  handleCourseAndYearSelected(selection: {
    course: Course,
    academicYear: { id: number, value: string },
    coordinator?: { id: number, name: string, lecturerCode: string }
  }): void {
    this.currentSelectedCourse = selection.course;
    this.currentSelectedAcademicYear = selection.academicYear;
    this.displaySelectedCourseText = `${selection.course.name} (T.A. ${selection.academicYear.value})`;

    if (selection.coordinator?.id != null) {
      this.coordinatorObject = selection.coordinator;
      this.coordinatorName = selection.coordinator.lecturerCode;
    } else {
      this.coordinatorName = '';
      this.coordinatorObject = undefined;
    }

    this.fetchClassMappings();
  }

  fetchClassMappings(): void {
    if (!this.currentSelectedCourse || !this.currentSelectedAcademicYear) return;

    this.isLoadingTableData = true;
    this.tableData = [];
    const courseId = this.parseCourseId(this.currentSelectedCourse);
    const academicYearId = this.currentSelectedAcademicYear.id;
    const prodiId = this.selectedProdi?.prodiId;

    this.plottingService.getClassMappings(courseId, academicYearId, prodiId)
      .pipe(finalize(() => {
        this.isLoadingTableData = false;
        this.updatePlaceholderVisibility();
      }))
      .subscribe({
        next: (apiData) => {
          if (apiData && apiData.length > 0) {
            this.tableData = apiData.map((item: any, index: number): CourseRow => {
              const existingPlot = item.plottingan_pengajarans?.[0];
              return {
                no: index + 1,
                mappingId: item.id,
                plottingId: existingPlot?.id,
                kelas: item.nama_kelas,
                dosen: existingPlot?.dosen.lecturer_code || '',
                dosenObject: existingPlot ? existingPlot.dosen : undefined,
                praktikum: 'MEREUN',
                kuota: item.kuota,
                kredit: item.matakuliah.sks,
                pic: item.matakuliah.pic || 'ANDI',
                semester: item.tahun_ajaran.semester.toUpperCase(),
                onlineOnsite: '1170'
              };
            });
          }
        },
        error: (err) => {
          console.error('Failed to load class mappings:', err);
          alert('Gagal memuat data kelas dari server.');
        }
      });
  }

  updatePlaceholderVisibility(): void {
    this.showPlaceholderContent = !this.currentSelectedCourse || (!this.isLoadingTableData && this.tableData.length === 0);
  }

  openLecturerModal(field: 'coordinator' | 'dosen', index?: number): void {
    if (field === 'coordinator' && (!this.currentSelectedCourse || !this.currentSelectedAcademicYear)) {
      alert('Pilih Mata Kuliah & Tahun Ajaran terlebih dahulu.');
      return;
    }
    this.editingField = field;
    if (field === 'dosen' && index !== undefined) {
      this.editingDosenIndex = index;
    }
    this.showLecturerSearchModal = true;
  }

  handleCoordinatorAssigned(lecturer: Lecturer): void {
    this.coordinatorName = lecturer.lecturerCode;
    this.coordinatorObject = lecturer;
  }

  handleLecturerSelected(lecturer: Lecturer): void {
    if (this.editingField === 'coordinator') {
      this.coordinatorName = lecturer.lecturerCode;
      this.coordinatorObject = lecturer;
      this.closeLecturerModal();
      return;
    }

    if (this.editingField === 'dosen' && this.editingDosenIndex !== null) {
      const rowIndex = this.editingDosenIndex;
      const rowData = this.tableData[rowIndex];

      const payload = {
        id_dosen: lecturer.id,
        id_mapping_kelas_matakuliah: rowData.mappingId,
        beban_sks: rowData.kredit
      };

      this.plottingService.assignLecturerToClassMapping(payload).subscribe({
        next: (response) => {
          this.tableData[rowIndex].dosen = lecturer.lecturerCode;
          this.tableData[rowIndex].dosenObject = lecturer;
          this.tableData[rowIndex].plottingId = response.data?.id;
          alert(`Dosen ${lecturer.name} berhasil di-plot untuk kelas ${rowData.kelas}.`);
        },
        error: (err) => {
          alert(`Gagal menyimpan penugasan dosen: ${err.error?.message || 'Error tidak diketahui'}`);
        },
        complete: () => {
          this.closeLecturerModal();
        }
      });
    }
  }

  closeLecturerModal(): void {
    this.showLecturerSearchModal = false;
    this.editingField = null;
    this.editingDosenIndex = null;
  }

  onBack(): void {
    if (this.isKelompokKeahlianUser && this.selectedProdi) {
      this.onBackToProdiSelection();
    } else {
      this.resetPlottingData();
    }
  }

  get isKelompokKeahlianUser(): boolean {
    return this.authService.getCurrentRole()?.role_name === 'KelompokKeahlian';
  }

  get currentUserRole(): string {
    return this.authService.getCurrentRole()?.role_name || '';
  }
}