import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ActionButtonComponent, FormInputComponent, SelectOption, LoadingSpinnerComponent } from '../../../shared/components/index';
import { MatakuliahService, Pic, CreateMatakuliahPayload } from '../../../core/services/matakuliah.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-tambah-matkul',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActionButtonComponent,
    FormInputComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './tambah-matkul.component.html',
  styleUrls: ['./tambah-matkul.component.scss'],
})
export class TambahMatkulComponent implements OnInit {
  addMatkulForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  pageTitle = 'Tambah Mata Kuliah';
  pageSubtitle = 'Masukkan informasi untuk mata kuliah baru';
  submitButtonText = 'Submit';

  private courseId: number | null = null;

  sksOptions: SelectOption[] = [1, 2, 3, 4, 6].map(v => ({ value: v, label: `${v} SKS` }));
  picOptions: SelectOption[] = [];
  metodePerkuliahanOptions: SelectOption[] = [
    { value: 'online', label: 'Daring (Online)' },
    { value: 'onsite', label: 'Luring (Onsite)' },
    { value: 'hybrid', label: 'Hybrid' },
  ];
  mandatoryStatusOptions: SelectOption[] = [
    { value: 'wajib_prodi', label: 'Wajib Prodi' },
    { value: 'pilihan', label: 'Pilihan' },
  ];
  matakuliahEksepsiOptions: SelectOption[] = [
    { value: 'tidak', label: 'Tidak' },
    { value: 'ya', label: 'Ya' },
  ];
  tingkatMatakuliahOptions: SelectOption[] = [
    { value: 'Tingkat 1', label: 'Tingkat 1' },
    { value: 'Tingkat 2', label: 'Tingkat 2' },
    { value: 'Tingkat 3', label: 'Tingkat 3' },
    { value: 'Tingkat 4', label: 'Tingkat 4' },
  ];

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private matakuliahService = inject(MatakuliahService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.initForm();
    this.loadPics();
    this.checkForEditMode();
  }

  private initForm(): void {
    this.addMatkulForm = this.fb.group({
      namaMatkul: ['', Validators.required],
      kodeMatkul: ['', Validators.required],
      sks: ['', Validators.required],
      pic: ['', Validators.required],
      metodePerkuliahan: ['', Validators.required],
      praktikum: [null, Validators.required],
      mandatoryStatus: ['', Validators.required],
      matakuliahEksepsi: ['', Validators.required],
      tingkatMatakuliah: ['', Validators.required],
    });
  }

  private checkForEditMode(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.isEditMode = true;
        this.courseId = Number(idParam);
        this.pageTitle = 'Edit Mata Kuliah';
        this.pageSubtitle = 'Perbarui informasi mata kuliah yang sudah ada';
        this.submitButtonText = 'Update';
        this.loadCourseForEdit(this.courseId);
      }
    });
  }

  private loadCourseForEdit(id: number): void {
    this.isLoading = true;
    this.matakuliahService.getCourseById(id).pipe(
      finalize(() => { this.isLoading = false; })
    ).subscribe({
      next: (course) => {
        this.addMatkulForm.patchValue({
          namaMatkul: course.name,
          kodeMatkul: course.code,
          sks: course.sks,
          pic: course.id_pic,
          metodePerkuliahan: course.mode_perkuliahan_key,
          praktikum: course.praktikum === 'Ya' ? 'true' : 'false',
          mandatoryStatus: course.statusMatkul,
          matakuliahEksepsi: course.matakuliah_eksepsi,
          tingkatMatakuliah: course.tingkat_matakuliah,
        });
      },
      error: (err) => {
        console.error(`Failed to load course ${id} for editing`, err);
        this.notificationService.showError('Gagal memuat data mata kuliah.');
        this.goBack();
      }
    });
  }

  private loadPics(): void {
    if (!this.isEditMode) {
      this.isLoading = true;
    }
    this.matakuliahService.getAllPics().pipe(
      finalize(() => { if (!this.isEditMode) this.isLoading = false; })
    ).subscribe({
      next: (pics: Pic[]) => {
        this.picOptions = pics.map(pic => ({
          value: pic.id,
          label: pic.name
        }));
      },
      error: (err) => {
        console.error('Failed to load PICs', err);
        this.notificationService.showError('Gagal memuat data PIC. Silakan coba lagi nanti.');
      }
    });
  }

  getControl(name: string): AbstractControl | null {
    return this.addMatkulForm.get(name);
  }

  onSubmit(): void {
    if (this.addMatkulForm.invalid) {
      this.addMatkulForm.markAllAsTouched();
      this.notificationService.showWarning('Harap isi semua field yang diperlukan dengan benar.');
      return;
    }

    this.isLoading = true;
    const formValue = this.addMatkulForm.value;
    const payload: CreateMatakuliahPayload = {
      nama_matakuliah: formValue.namaMatkul,
      kode_matkul: formValue.kodeMatkul,
      sks: Number(formValue.sks),
      praktikum: formValue.praktikum === 'true',
      id_pic: Number(formValue.pic),
      mandatory_status: formValue.mandatoryStatus,
      mode_perkuliahan: formValue.metodePerkuliahan,
      matakuliah_eksepsi: formValue.matakuliahEksepsi,
      tingkat_matakuliah: formValue.tingkatMatakuliah,
    };
    if (this.isEditMode && this.courseId) {
      this.updateCourse(this.courseId, payload);
    } else {
      this.createCourse(payload);
    }
  }

  private createCourse(payload: CreateMatakuliahPayload): void {
    this.matakuliahService.createMatakuliah(payload).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.notificationService.showSuccess('Mata kuliah berhasil ditambahkan!');
        this.router.navigate(['/ketua-prodi/manage-matkul']);
      },
      error: (err) => this.handleFormError(err)
    });
  }

  private updateCourse(id: number, payload: CreateMatakuliahPayload): void {
    this.matakuliahService.updateMatakuliah(id, payload).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.notificationService.showSuccess('Mata kuliah berhasil diperbarui!');
        this.goBack();
      },
      error: (err) => this.handleFormError(err)
    });
  }

  private handleFormError(err: HttpErrorResponse): void {
    this.isLoading = false;
    if (err.status === 422 && err.error?.errors?.kode_matkul) {
      this.notificationService.showError('Kode Mata Kuliah sudah terdaftar. Silakan gunakan kode lain.');
    } else {
      const errorMessage = err.error?.message || 'Terjadi kesalahan pada server.';
      this.notificationService.showError(`Gagal menyimpan mata kuliah: ${errorMessage}`);
    }
    console.error('Gagal menyimpan mata kuliah', err);
  }

  goBack(): void {
    this.location.back();
  }
}