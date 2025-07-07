/* FILE: plotting.component.ts */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchModalComponent, SearchMatkulComponent, ActionButtonComponent, LoadingSpinnerComponent, TeamTeachingSelection } from '../../../shared/components/index';
import { Lecturer, Course } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { PlottingService } from '../../../core/services/plotting.service';
import { NotificationService } from '../../../core/services/notification.service';
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
  initialLecturerSelections: TeamTeachingSelection[] = [];
  isLoadingTableData: boolean = false;

  showLecturerSearchModal: boolean = false;
  editingField: 'coordinator' | 'dosen' | null = null;
  editingDosenIndex: number | null = null;

  noCourseSelectedImageUrl: string = 'assets/images/search_plotting.svg';
  showPlaceholderContent: boolean = true;
  showProdiSelection: boolean = false;
  selectedProdi: ProdiOption | null = null;

  prodiOptions: ProdiOption[] = [];

  private authService = inject(AuthService);
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
    this.showProdiSelection = currentRole?.role_name === 'KelompokKeahlian';
    if (this.showProdiSelection) {
      this.loadProgramStudi();
    } else {
      this.updatePlaceholderVisibility();
    }
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
            console.warn("No program studi returned from API.");
          }
        },
        error: (err) => {
          console.error('Failed to load program studi list:', err);
          this.notificationService.showError('Gagal memuat daftar program studi. Silakan coba lagi.');
          this.showProdiSelection = false;
        }
      });
  }

  private generateColor(index: number): string {
    const colors = ['#4F7EFF', '#B444DB', '#E53535', '#00D4AA', '#FF9800', '#3F51B5', '#D4AF37', '#795548'];
    return colors[index % colors.length];
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

  handleCourseAndYearSelected(selection: { course: Course; academicYear: { id: number; value: string }; coordinator?: { id: number; name: string; lecturerCode: string } }): void {
    this.currentSelectedCourse = selection.course;
    this.currentSelectedAcademicYear = selection.academicYear;
    this.displaySelectedCourseText = `${selection.course.name} (T.A. ${selection.academicYear.value})`;
    this.coordinatorName = '';
    this.coordinatorObject = undefined;
    this.tableData = [];
    if (selection.coordinator?.id != null) {
      this.coordinatorObject = selection.coordinator;
      this.coordinatorName = selection.coordinator.lecturerCode;
      this.fetchClassMappings();
    }
    this.updatePlaceholderVisibility();
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
              const assignedLecturers: TeamTeachingSelection[] = (item.plottingan_pengajarans || []).map((plot: any) => ({
                plottingId: plot.id,
                sks: plot.beban_sks,
                lecturer: {
                  id: plot.dosen.id,
                  name: plot.dosen.name,
                  lecturerCode: plot.dosen.lecturer_code,
                  nip: plot.dosen.nip || '',
                  nidn: plot.dosen.nidn || '',
                  email: plot.dosen.email || '',
                  jabatanFungsionalAkademik: plot.dosen.jabatanFungsionalAkademik || '',
                  idJabatanStruktural: plot.dosen.idJabatanStruktural || null,
                  statusPegawai: plot.dosen.statusPegawai || '',
                  pendidikanTerakhir: plot.dosen.pendidikanTerakhir || '',
                  idKelompokKeahlian: plot.dosen.idKelompokKeahlian || 0,
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
            const freshRowData = this.tableData[this.editingDosenIndex];
            this.initialLecturerSelections = freshRowData.assignedLecturers || [];
          }
        },
        error: (err) => {
          console.error('Failed to load class mappings:', err);
          this.notificationService.showError('Gagal memuat data kelas dari server.');
        }
      });
  }

  updatePlaceholderVisibility(): void {
    this.showPlaceholderContent = !this.currentSelectedCourse || (!this.isLoadingTableData && this.tableData.length === 0);
  }

  public handleSearchCleared(): void {
    this.resetPlottingData();
  }

  public unassignCoordinator(): void {
    if (!this.coordinatorObject || !this.currentSelectedCourse || !this.currentSelectedAcademicYear) {
      this.notificationService.showWarning('Tidak ada koordinator yang dipilih untuk dihapus.');
      return;
    }
    this.notificationService.showConfirmation(
      'Anda Yakin?',
      `Menghapus koordinator "${this.coordinatorName}" dari mata kuliah ini?`,
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
        this.isLoadingTableData = true;
        this.plottingService.unassignCoordinator(payload)
          .pipe(finalize(() => this.isLoadingTableData = false))
          .subscribe({
            next: () => {
              this.notificationService.showSuccess('Koordinator berhasil dihapus.');
              this.coordinatorName = '';
              this.coordinatorObject = undefined;
              this.tableData = [];
              this.updatePlaceholderVisibility();
            },
            error: (err) => {
              console.error('Failed to unassign coordinator:', err);
              const errorMessage = err.error?.message || 'Error tidak diketahui';
              this.notificationService.showError(`Gagal menghapus koordinator: ${errorMessage}`);
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
      this.notificationService.showWarning("Mata kuliah atau tahun ajaran belum dipilih.");
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
    this.isLoadingTableData = true;
    this.plottingService.assignCoordinator(payload).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Koordinator ${lecturer.name} berhasil di-plot.`);
        this.coordinatorName = lecturer.lecturerCode;
        this.coordinatorObject = lecturer;
        this.fetchClassMappings();
      },
      error: (err) => {
        this.isLoadingTableData = false;
        console.error('Failed to assign coordinator', err);
        const errorMessage = err.error?.message || 'Error tidak diketahui';
        this.notificationService.showError(`Gagal menyimpan koordinator: ${errorMessage}`);
      },
      complete: () => {
        this.closeLecturerModal();
      }
    });
  }

  handleLecturerSelected(lecturer: Lecturer): void {
    if (this.editingField === 'coordinator') {
      this.handleCoordinatorAssigned(lecturer);
      return;
    }
    if (this.editingDosenIndex !== null) {
      const rowIndex = this.editingDosenIndex;
      const rowData = this.tableData[rowIndex];
      const payload = {
        id_dosen: lecturer.id,
        id_mapping_kelas_matakuliah: rowData.mappingId,
        beban_sks: rowData.kredit
      };
      this.plottingService.assignLecturerToClassMapping(payload).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Dosen ${lecturer.name} berhasil di-plot untuk kelas ${rowData.kelas}.`);
          this.fetchClassMappings();
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Error tidak diketahui';
          this.notificationService.showError(`Gagal menyimpan penugasan dosen: ${errorMessage}`);
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
    this.initialLecturerSelections = [];
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

  public handleTeamLecturersSelected(selections: TeamTeachingSelection[]): void {
    if (this.editingDosenIndex === null) return;
    const rowIndex = this.editingDosenIndex;
    const rowData = this.tableData[rowIndex];
    const payloads = selections.map(selection => ({
      id_dosen: selection.lecturer.id,
      id_mapping_kelas_matakuliah: rowData.mappingId,
      beban_sks: selection.sks
    }));
    let successfulAssignments: string[] = [];
    let failedAssignments: string[] = [];
    let completedCalls = 0;
    payloads.forEach((payload, index) => {
      this.plottingService.assignLecturerToClassMapping(payload).subscribe({
        next: () => {
          successfulAssignments.push(selections[index].lecturer.lecturerCode);
        },
        error: (err) => {
          failedAssignments.push(selections[index].lecturer.name);
          console.error(`Failed to assign ${selections[index].lecturer.name}`, err);
        },
        complete: () => {
          completedCalls++;
          if (completedCalls === payloads.length) {
            if (failedAssignments.length > 0) {
              this.notificationService.showError(`Gagal menyimpan penugasan untuk: ${failedAssignments.join(', ')}.`);
            } else {
              this.notificationService.showSuccess('Tim dosen berhasil di-plot.');
            }
            this.fetchClassMappings();
          }
        }
      });
    });
    this.closeLecturerModal();
  }
}
