import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActionButtonComponent, FormInputComponent, SelectOption } from '../../../shared/components/index';
import { ApiService } from '../../../core/services/api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-add-program-studi',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActionButtonComponent,
    FormInputComponent
  ],
  templateUrl: './tambah-prodi.component.html',
  styleUrls: ['./tambah-prodi.component.scss']
})
export class TambahProdiComponent implements OnInit {
  prodiForm!: FormGroup;
  isLoading = false;

  tingkatOptions: SelectOption[] = [
    { value: 'S1', label: 'S1' },
    { value: 'S2', label: 'S2' },
    { value: 'S3', label: 'S3' }
  ];

  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);

  ngOnInit(): void {
    this.prodiForm = this.fb.group({
      tingkat: ['', Validators.required],
      namaProdi: ['', Validators.required]
    });
  }

  getControl(name: string): AbstractControl | null {
    return this.prodiForm.get(name);
  }

  onSubmit(): void {
    if (this.prodiForm.invalid) {
      this.prodiForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const { tingkat, namaProdi } = this.prodiForm.value;

    const payload = {
      nama: `${tingkat} ${namaProdi}`
    };

    this.apiService.createProgramStudi(payload)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          alert(`Program Studi "${payload.nama}" berhasil ditambahkan!`);
          this.prodiForm.reset();
        },
        error: (err) => {
          console.error('Failed to create program studi:', err);
          const errorMessage = err.error?.message || 'Terjadi kesalahan pada server.';
          alert(`Gagal menambahkan Program Studi: ${errorMessage}`);
        }
      });
  }
}