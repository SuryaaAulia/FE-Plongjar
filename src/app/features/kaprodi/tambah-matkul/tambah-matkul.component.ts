import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { ActionButtonComponent, FormInputComponent, SelectOption, LoadingSpinnerComponent } from '../../../shared/components/index';
import { Pic, CreateMatakuliahPayload } from '../../../core/services/kaprodi/matakuliah.service';

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
  private apiService = inject(ApiService);

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
      const courseId = params.get('id');
      if (courseId) {
        this.isEditMode = true;
      }
    });
  }

  private loadPics(): void {
    this.isLoading = true;
    this.apiService.getAllPic().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (pics: Pic[]) => {
        this.picOptions = pics.map(pic => ({
          value: pic.id,
          label: pic.name
        }));
      },
      error: (err) => {
        console.error('Failed to load PICs', err);
        alert('Gagal memuat data PIC. Silakan coba lagi nanti.');
      }
    });
  }

  getControl(name: string): AbstractControl | null {
    return this.addMatkulForm.get(name);
  }

  onSubmit(): void {
    if (this.addMatkulForm.invalid) {
      this.addMatkulForm.markAllAsTouched();
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

    this.apiService.createMatakuliah(payload).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        console.log('Mata kuliah berhasil dibuat!', response);
        alert('Mata kuliah berhasil ditambahkan!');
        this.addMatkulForm.reset();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 422 && err.error?.errors?.kode_matkul) {
          alert('Gagal: Kode Mata Kuliah sudah terdaftar. Silakan gunakan kode lain.');
        } else {
          alert('Gagal menambahkan mata kuliah. Terjadi kesalahan pada server.');
        }
        console.error('Gagal membuat mata kuliah', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}