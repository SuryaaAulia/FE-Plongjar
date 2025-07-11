import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { JabatanService, JabatanCreateRequest } from '../../../core/services/admin/jabatan.service';
import { ActionButtonComponent } from '../../../shared/components/buttons/action-button/action-button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { FormInputComponent } from '../../../shared/components/form-input/form-input.component';
import { NotificationService } from '../../../core/services/notification.service';

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
  validationErrors: { [key: string]: string } = {};

  private destroy$ = new Subject<void>();

  private fb = inject(FormBuilder);
  private jabatanService = inject(JabatanService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  constructor() {
    this.jabatanForm = this.createJabatanForm();
  }

  ngOnInit(): void {
    this.jabatanForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.clearValidationErrors();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createJabatanForm(): FormGroup {
    return this.fb.group({
      nama: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      maksimal_sks: ['', [Validators.required, Validators.min(1), Validators.max(50), Validators.pattern(/^\d+$/)]]
    });
  }

  get namaControl(): AbstractControl | null {
    return this.jabatanForm.get('nama');
  }

  get sksControl(): AbstractControl | null {
    return this.jabatanForm.get('maksimal_sks');
  }

  private clearValidationErrors(): void {
    this.validationErrors = {};
  }

  private setValidationErrors(errors: { [key: string]: string[] }): void {
    this.validationErrors = {};
    Object.keys(errors).forEach(key => {
      if (errors[key] && errors[key].length > 0) {
        const fieldName = key === 'konversi_sks' ? 'maksimal_sks' : key;
        this.validationErrors[fieldName] = errors[key][0];
      }
    });
  }

  onSubmit(): void {
    if (this.jabatanForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.clearValidationErrors();

    const formValue = this.jabatanForm.value;

    const jabatanData: JabatanCreateRequest = {
      nama: formValue.nama.trim(),
      konversi_sks: Number(formValue.maksimal_sks)
    };

    this.jabatanService.createJabatanStruktural(jabatanData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.handleSubmitSuccess(response);
        },
        error: (error) => {
          this.handleSubmitError(error);
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.jabatanForm.controls).forEach(key => {
      this.jabatanForm.get(key)?.markAsTouched();
    });
  }

  private handleSubmitSuccess(response: any): void {
    if (response.success) {
      this.notificationService.showSuccess(response.message || 'Jabatan berhasil ditambahkan!');
      this.jabatanForm.reset();
      this.clearValidationErrors();
    } else {
      this.notificationService.showError('Terjadi kesalahan saat menyimpan data.');
    }
  }

  private handleSubmitError(error: any): void {
    if (error.status === 422 && error.error && error.error.errors) {
      this.setValidationErrors(error.error.errors);
      const errorMessage = error.error.errors.nama?.find((msg: string) =>
        msg.toLowerCase().includes('already been taken') ||
        msg.toLowerCase().includes('sudah digunakan') ||
        msg.toLowerCase().includes('sudah ada')
      );

      if (errorMessage) {
        this.notificationService.showError('Jabatan struktural dengan nama tersebut sudah ada.');
      } else {
        this.notificationService.showWarning('Terdapat kesalahan pada form. Silakan periksa kembali.');
      }
    } else if (error.error && error.error.message) {
      this.notificationService.showError(error.error.message);
    } else {
      this.notificationService.showError('Gagal menambahkan jabatan struktural. Silakan coba lagi.');
    }
  }

  get canSubmit(): boolean {
    return this.jabatanForm.valid && !this.isSubmitting;
  }

  getValidationError(fieldName: string): string | null {
    return this.validationErrors[fieldName] || null;
  }

  hasValidationError(fieldName: string): boolean {
    return !!this.validationErrors[fieldName];
  }
}