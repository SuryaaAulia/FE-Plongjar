import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ActionButtonComponent } from '../../../shared/components/buttons/action-button/action-button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { FormInputComponent, SelectOption } from '../../../shared/components/form-input/form-input.component';

interface JabatanStruktural {
  id?: number;
  nama: string;
  maksimal_sks: number;
}

@Component({
  selector: 'app-tambah-jabatan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActionButtonComponent,
    LoadingSpinnerComponent,
    FormInputComponent
  ],
  templateUrl: './tambah-jabatan.component.html',
  styleUrls: ['./tambah-jabatan.component.scss']
})
export class TambahJabatanComponent implements OnInit, OnDestroy {
  jabatanForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  sksOptions: SelectOption[] = [
    { value: 2, label: '2 SKS' },
    { value: 4, label: '4 SKS' },
    { value: 6, label: '6 SKS' },
    { value: 8, label: '8 SKS' },
    { value: 10, label: '10 SKS' },
    { value: 12, label: '12 SKS' },
    { value: 14, label: '14 SKS' },
    { value: 16, label: '16 SKS' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.jabatanForm = this.createJabatanForm();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createJabatanForm(): FormGroup {
    return this.fb.group({
      nama: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      maksimal_sks: ['', [Validators.required]]
    });
  }

  get namaControl(): AbstractControl | null {
    return this.jabatanForm.get('nama');
  }

  get sksControl(): AbstractControl | null {
    return this.jabatanForm.get('maksimal_sks');
  }

  private handleSubmitSuccess(response: any): void {
    console.log('Jabatan structural created successfully:', response);
    alert('Jabatan structural berhasil ditambahkan!');
    this.jabatanForm.reset();
  }

  private handleSubmitError(error: any): void {
    console.error('Error creating jabatan structural:', error);
    const errorMessage = error.error?.message || 'Gagal menambahkan jabatan structural. Silakan coba lagi.';
    alert(errorMessage);
  }

  get canSubmit(): boolean {
    return this.jabatanForm.valid && !this.isSubmitting;
  }
}