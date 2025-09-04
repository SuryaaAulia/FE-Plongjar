import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchModalComponent, SearchMatkulComponent, ActionButtonComponent, LoadingSpinnerComponent, TeamTeachingSelection } from '../../../shared/components/index';
import { Lecturer, Course } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { PlottingService } from '../../../core/services/plotting.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProgressPlottingPageComponent, PlottingProgressData } from '../progress-plotting/progress-plotting.component';
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
  teamTeaching?: boolean;
  assignedLecturers?: TeamTeachingSelection[];
}

interface ProdiOption {
  prodiId: number;
  name: string;
  color?: string;
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
    LoadingSpinnerComponent,
    ProgressPlottingPageComponent
  ],
  templateUrl: './plotting.component.html',
  styleUrls: ['./plotting.component.scss']
})
export class PlottingComponent implements OnInit {
  @ViewChild(SearchMatkulComponent) searchMatkulComponent!: SearchMatkulComponent;

  currentSelectedCourse: Course | null = null;
  currentSelectedAcademicYear: { id: number; value: string } | null = null;
  displaySelectedCourseText: string = '';

  coordinatorName: string = '';
  coordinatorObject?: Pick<Lecturer, 'id' | 'name' | 'lecturerCode'>;

  tableData: CourseRow[] = [];
  initialLecturerSelections: TeamTeachingSelection[] = [];
  isLoadingTableData: boolean = false;

  plottingProgressData: PlottingProgressData[] = [];
  isLoadingPlottingProgress: boolean = false;

  showLecturerSearchModal: boolean = false;
  editingField: 'coordinator' | 'dosen' | null = null;
  editingDosenIndex: number | null = null;

  noCourseSelectedImageUrl: string = 'assets/images/search_plotting.svg';
  currentView: 'prodi-selection' | 'progress' | 'plotting' = 'plotting';
  selectedProdi: ProdiOption | null = null;

  pageTitle: string = 'Plotting Koordinator dan Dosen Matkul';

  prodiOptions: ProdiOption[] = [];

  public authService = inject(AuthService);
  private plottingService = inject(PlottingService);
  private notificationService = inject(NotificationService);

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
    if (currentRole?.role_name === 'KelompokKeahlian') {
      this.currentView = 'prodi-selection';
      this.loadProgramStudi();
    } else if (currentRole?.role_name === 'ProgramStudi') {
      this.currentView = 'progress';
      this.fetchPlottingProgress();
    } else {
      this.currentView = 'plotting';
    }
  }

  public handleSearchQuery(query: string): void {
    console.log('Search query from child:', query);
  }

  private loadProgramStudi(): void {
    this.isLoadingTableData = true;
    this.plottingService.getAllProgramStudi()
      .pipe(finalize(() => this.isLoadingTableData = false))
      .subscribe({
        next: (apiData) => {
          if (apiData && apiData.length > 0) {
            this.prodiOptions = apiData.map((prodi: any, index: number): ProdiOption => ({
              prodiId: prodi.id,
              name: prodi.nama,
              color: this.generateColor(index)
            }));
          } else {
            this.prodiOptions = [];
          }
        },
        error: (err) => {
          this.notificationService.showError('Gagal memuat daftar program studi.');
        }
      });
  }

  private generateColor(index: number): string {
    const colors = ['#4F7EFF', '#B444DB', '#E53535', '#00D4AA', '#FF9800', '#3F51B5', '#D4AF37', '#795548'];
    return colors[index % colors.length];
  }

  handleProdiSelection(prodi: ProdiOption): void {
    this.selectedProdi = prodi;
    this.fetchPlottingProgress(prodi.prodiId);
    this.currentView = 'progress';
  }

  private fetchPlottingProgress(prodiId?: number): void {
    this.isLoadingPlottingProgress = true;

    this.plottingService.getProgressPlotting(prodiId).subscribe({
      next: (data) => {
        setTimeout(() => {
          this.plottingProgressData = data;
          this.isLoadingPlottingProgress = false;
        }, 0);
      },
      error: (err) => {
        setTimeout(() => {
          this.notificationService.showError('Gagal memuat data progress plotting.');
          this.plottingProgressData = [];
          this.isLoadingPlottingProgress = false;
        }, 0);
      }
    });
  }

  onBackToProdiSelection(): void {
    if (this.isKelompokKeahlianUser) {
      this.currentView = 'prodi-selection';
      this.selectedProdi = null;
      this.resetPlottingData();
      this.plottingProgressData = [];
    }
  }

  private resetPlottingData(): void {
    this.currentSelectedCourse = null;
    this.currentSelectedAcademicYear = null;
    this.tableData = [];
    this.coordinatorName = '';
    this.coordinatorObject = undefined;
  }

  handleCourseAndYearSelected(selection: { course: Course; academicYear: { id: number; value: string }; coordinator?: { id: number; name: string; lecturerCode: string } }): void {
    this.currentSelectedCourse = selection.course;
    this.currentSelectedAcademicYear = selection.academicYear;
    this.coordinatorName = '';
    this.coordinatorObject = undefined;
    this.tableData = [];
    if (selection.coordinator?.id != null) {
      this.coordinatorObject = selection.coordinator;
      this.coordinatorName = selection.coordinator.lecturerCode;
      this.fetchClassMappings();
    }
  }

  updatePlaceholderVisibility(): void {
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
      }))
      .subscribe({
        next: (apiData) => {
          if (apiData && apiData.length > 0) {
            this.tableData = apiData.map((item: any, index: number): CourseRow => {
              const assignedLecturers: TeamTeachingSelection[] = (item.plottingan_pengajarans || []).map((plot: any) => ({
                plottingId: plot.id,
                sks: plot.beban_sks,
                lecturer: {
                  id: plot.dosen.id,
                  name: plot.dosen.name,
                  lecturerCode: plot.dosen.lecturer_code,
                  nip: plot.dosen.nip || '', nidn: plot.dosen.nidn || '', email: plot.dosen.email || '', jabatanFungsionalAkademik: plot.dosen.jabatanFungsionalAkademik || '', idJabatanStruktural: plot.dosen.idJabatanStruktural || null, statusPegawai: plot.dosen.statusPegawai || '', pendidikanTerakhir: plot.dosen.pendidikanTerakhir || '', idKelompokKeahlian: plot.dosen.idKelompokKeahlian || 0,
                }
              }));
              const lecturerCodes = assignedLecturers.map(sel => sel.lecturer.lecturerCode).join(', ');
              return {
                no: index + 1,
                mappingId: item.id,
                plottingId: item.plottingan_pengajarans?.[0]?.id,
                kelas: item.nama_kelas,
                teamTeaching: !!item.team_teaching,
                dosen: lecturerCodes || '',
                assignedLecturers: assignedLecturers,
                praktikum: item.matakuliah.praktikum ? 'YA' : 'TIDAK',
                kuota: item.kuota,
                kredit: item.matakuliah.sks,
                pic: item.matakuliah.pic.name,
                semester: item.tahun_ajaran.semester.toUpperCase(),
                onlineOnsite: item.matakuliah.mode_perkuliahan.toUpperCase()
              };
            });
          }
          if (this.editingDosenIndex !== null && this.tableData[this.editingDosenIndex]) {
            this.initialLecturerSelections = this.tableData[this.editingDosenIndex].assignedLecturers || [];
          }
        },
        error: (err) => {
          this.notificationService.showError('Gagal memuat data kelas dari server.');
        }
      });
  }

  public handleSearchCleared(): void {
    this.resetPlottingData();
  }

  public unassignCoordinator(): void {
    if (!this.coordinatorObject || !this.currentSelectedCourse || !this.currentSelectedAcademicYear) {
      return;
    }
    this.notificationService.showConfirmation(
      'Anda Yakin?',
      `Menghapus koordinator "${this.coordinatorName}"?`,
      'Ya, Hapus'
    ).then((result) => {
      if (result.isConfirmed) {
        const payload: any = {
          id_matakuliah: this.parseCourseId(this.currentSelectedCourse),
          id_tahun_ajaran: this.currentSelectedAcademicYear!.id,
        };
        if (this.isKelompokKeahlianUser && this.selectedProdi) {
          payload.id_program_studi = this.selectedProdi.prodiId;
        }
        this.plottingService.unassignCoordinator(payload).subscribe({
          next: () => {
            this.notificationService.showSuccess('Koordinator berhasil dihapus.');
            this.coordinatorName = '';
            this.coordinatorObject = undefined;
            this.tableData = [];
          },
          error: (err) => {
            this.notificationService.showError(`Gagal menghapus koordinator: ${err.error?.message || 'Error'}`);
          }
        });
      }
    });
  }

  openLecturerModal(field: 'coordinator' | 'dosen', index?: number): void {
    this.editingField = field;
    this.initialLecturerSelections = [];
    if (field === 'dosen' && index !== undefined) {
      this.editingDosenIndex = index;
      const rowData = this.tableData[index];
      if (rowData.assignedLecturers && rowData.assignedLecturers.length > 0) {
        this.initialLecturerSelections = rowData.assignedLecturers;
      }
    } else if (field === 'coordinator') {
      if (this.coordinatorObject && this.coordinatorObject.id) {
        const fullCoordinatorObject: Lecturer = { id: this.coordinatorObject.id, name: this.coordinatorObject.name, lecturerCode: this.coordinatorObject.lecturerCode, nip: '', nidn: '', email: '', jabatanFungsionalAkademik: '', idJabatanStruktural: null, statusPegawai: '', pendidikanTerakhir: '', idKelompokKeahlian: 0 };
        const coordinatorAsSelection: TeamTeachingSelection = { lecturer: fullCoordinatorObject, sks: 0 };
        this.initialLecturerSelections = [coordinatorAsSelection];
      }
    }
    this.showLecturerSearchModal = true;
  }

  handleCoordinatorAssigned(lecturer: Lecturer): void {
    if (!this.currentSelectedCourse || !this.currentSelectedAcademicYear) {
      return;
    }
    const payload: any = {
      id_matakuliah: this.parseCourseId(this.currentSelectedCourse),
      id_tahun_ajaran: this.currentSelectedAcademicYear.id,
      id_dosen: lecturer.id,
    };
    if (this.isKelompokKeahlianUser && this.selectedProdi) {
      payload.id_program_studi = this.selectedProdi.prodiId;
    }
    this.plottingService.assignCoordinator(payload).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Koordinator ${lecturer.name} berhasil di-plot.`);
        this.coordinatorName = lecturer.lecturerCode;
        this.coordinatorObject = lecturer;
        this.fetchClassMappings();
        this.closeLecturerModal();
      },
      error: (err) => {
        this.notificationService.showError(`Gagal menyimpan koordinator: ${err.error?.message || 'Error'}`);
      }
    });
  }

  handleLecturerSelected(lecturer: Lecturer): void {
    if (this.editingField === 'coordinator') {
      this.handleCoordinatorAssigned(lecturer);
      return;
    }
    if (this.editingDosenIndex !== null) {
      const rowData = this.tableData[this.editingDosenIndex];
      const payload = {
        id_dosen: lecturer.id,
        id_mapping_kelas_matakuliah: rowData.mappingId,
        beban_sks: rowData.kredit
      };
      this.plottingService.assignLecturerToClassMapping(payload).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Dosen ${lecturer.name} berhasil di-plot.`);
          this.fetchClassMappings();
          this.closeLecturerModal();
        },
        error: (err) => {
          this.notificationService.showError(`Gagal menyimpan penugasan: ${err.error?.message || 'Error'}`);
        }
      });
    }
  }

  closeLecturerModal(): void {
    this.showLecturerSearchModal = false;
    this.editingField = null;
    this.editingDosenIndex = null;
    this.initialLecturerSelections = [];
  }

  clearAll(): void {
    this.resetPlottingData();
    if (this.searchMatkulComponent) {
      this.searchMatkulComponent.clearSearch();
    }
  }

  get isKelompokKeahlianUser(): boolean {
    return this.authService.getCurrentRole()?.role_name === 'KelompokKeahlian';
  }

  public isCurrentRowTeamTeaching(): boolean {
    if (this.editingDosenIndex === null) return false;
    return this.tableData[this.editingDosenIndex]?.teamTeaching ?? false;
  }

  public getCurrentRowSks(): number {
    if (this.editingDosenIndex === null) return 3;
    return this.tableData[this.editingDosenIndex]?.kredit ?? 3;
  }

  public handleAssignmentChanged(): void {
    this.fetchClassMappings();
  }

  public switchToPlottingView(): void {
    this.currentView = 'plotting';
  }

  public switchToProgressView(): void {
    this.currentView = 'progress';
  }

  public handleTeamLecturersSelected(selections: TeamTeachingSelection[]): void {
    if (this.editingDosenIndex === null) return;
    const rowData = this.tableData[this.editingDosenIndex];
    const payloads = selections.map(selection => ({
      id_dosen: selection.lecturer.id,
      id_mapping_kelas_matakuliah: rowData.mappingId,
      beban_sks: selection.sks
    }));

    payloads.forEach((payload) => {
      this.plottingService.assignLecturerToClassMapping(payload).subscribe({
        next: () => {
        },
        error: (err) => {
          this.notificationService.showError(`Gagal menyimpan penugasan: ${err.error?.message || 'Error'}`);
        }
      });
    });
    this.notificationService.showSuccess('Tim dosen berhasil di-plot.');
    this.fetchClassMappings();
    this.closeLecturerModal();
  }
}