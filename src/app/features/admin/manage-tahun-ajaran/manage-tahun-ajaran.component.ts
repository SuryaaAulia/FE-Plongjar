import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActionButtonComponent, FormInputComponent, SelectOption, LoadingSpinnerComponent } from '../../../shared/components/index';
import { TahunAjaranService } from '../../../core/services/admin/tahun-ajaran.service';
import { TahunAjaran } from '../../../core/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-tahun-ajaran',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActionButtonComponent,
    FormInputComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './manage-tahun-ajaran.component.html',
  styleUrls: ['./manage-tahun-ajaran.component.scss']
})
export class ManageTahunAjaranComponent implements OnInit, OnDestroy {
  tahunAjaranForm!: FormGroup;
  daftarTahunAjaran: TahunAjaran[] = [];
  activeTahunAjaran: TahunAjaran | null = null;
  tahunOptions: SelectOption[] = [];
  sampaiTahunOptions: SelectOption[] = [];
  semesterOptions: SelectOption[] = [];
  isLoading: boolean = false;

  private destroy$ = new Subject<void>();

  private fb = inject(FormBuilder);
  private tahunAjaranService = inject(TahunAjaranService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.generateTahunOptions();
    this.generateSemesterOptions();
    this.initForm();
    this.loadTahunAjaranData();

    this.tahunAjaranService.activeTahunAjaran$
      .pipe(takeUntil(this.destroy$))
      .subscribe(active => {
        this.activeTahunAjaran = active;
        this.updateStatusInList();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.tahunAjaranForm = this.fb.group({
      dariTahun: ['', Validators.required],
      sampaiTahun: [{ value: '', disabled: true }, Validators.required],
      semester: ['', Validators.required],
    }, { validators: this.tahunValidator });

    this.getControl('dariTahun').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(val => {
      const dariTahunNum = parseInt(val, 10);
      const sampaiTahunControl = this.getControl('sampaiTahun');

      if (val) {
        sampaiTahunControl.enable();
        this.sampaiTahunOptions = this.tahunOptions.filter(option => Number(option.value) > dariTahunNum);

        if (sampaiTahunControl.value && parseInt(sampaiTahunControl.value, 10) <= dariTahunNum) {
          sampaiTahunControl.setValue('');
        }
      } else {
        sampaiTahunControl.disable();
        sampaiTahunControl.setValue('');
      }
    });
  }

  private loadTahunAjaranData(): void {
    this.isLoading = true;
    this.tahunAjaranService.getAllTahunAjaran()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success && Array.isArray(res.data)) {
            this.daftarTahunAjaran = res.data.sort((a: TahunAjaran, b: TahunAjaran) => {
              if (a.tahun_ajaran > b.tahun_ajaran) return -1;
              if (a.tahun_ajaran < b.tahun_ajaran) return 1;
              return a.semester > b.semester ? -1 : 1;
            });
            this.updateStatusInList();
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load tahun ajaran list', err);
          this.notificationService.showError('Gagal memuat daftar tahun ajaran.');
          this.isLoading = false;
        }
      });
    this.tahunAjaranService.loadInitialActiveTahunAjaran();
  }

  private updateStatusInList(): void {
    if (this.activeTahunAjaran && this.daftarTahunAjaran.length > 0) {
      this.daftarTahunAjaran.forEach(item => {
        item.status = (item.id === this.activeTahunAjaran?.id) ? 1 : 0;
      });
    }
  }

  private generateTahunOptions(): void {
    const currentYear = new Date().getFullYear();
    for (let i = -5; i < 10; i++) {
      const year = currentYear + i;
      this.tahunOptions.push({ value: year.toString(), label: year.toString() });
    }
  }

  private generateSemesterOptions(): void {
    this.semesterOptions = [
      { value: 'ganjil', label: 'Ganjil' },
      { value: 'genap', label: 'Genap' }
    ];
  }

  tahunValidator = (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const dari = group.get('dariTahun')?.value;
    const sampai = group.get('sampaiTahun')?.value;
    if (dari && sampai && parseInt(dari, 10) + 1 !== parseInt(sampai, 10)) {
      return { tahunTidakBerurutan: true };
    }
    return null;
  };

  getControl(name: string): AbstractControl {
    return this.tahunAjaranForm.get(name) as AbstractControl;
  }

  tambahTahunAjaran(): void {
    if (this.tahunAjaranForm.invalid) {
      this.tahunAjaranForm.markAllAsTouched();
      this.notificationService.showWarning('Harap isi semua field yang diperlukan dengan benar.');
      return;
    }

    const { dariTahun, sampaiTahun, semester } = this.tahunAjaranForm.value;
    const payload = {
      tahun_ajaran: `${dariTahun}/${sampaiTahun}`,
      semester: semester,
    };

    this.tahunAjaranService.createTahunAjaran(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.notificationService.showSuccess(res.message || 'Tahun Ajaran berhasil ditambahkan.');
          this.tahunAjaranForm.reset();
          this.loadTahunAjaranData();
        },
        error: (err) => {
          const errorMsg = err.error?.message || 'Gagal menambahkan tahun ajaran.';
          this.notificationService.showError(errorMsg);
          console.error('Create error:', err);
        }
      });
  }

  hapusTahunAjaran(ajaran: TahunAjaran): void {
    this.notificationService.showConfirmation(
      'Anda Yakin?',
      `Menghapus ${ajaran.tahun_ajaran} - semester ${ajaran.semester}. Aksi ini tidak dapat dibatalkan.`,
      'Ya, Hapus!'
    ).then((result) => {
      if (result.isConfirmed) {
        this.tahunAjaranService.deleteTahunAjaran(ajaran.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res) => {
              this.notificationService.showSuccess(res.message || 'Tahun Ajaran telah dihapus.');
              this.loadTahunAjaranData();
            },
            error: (err) => {
              const errorMsg = err.error?.message || 'Gagal menghapus tahun ajaran.';
              this.notificationService.showError(errorMsg);
              console.error('Delete error:', err);
            }
          });
      }
    });
  }

  setAktif(ajaran: TahunAjaran): void {
    this.tahunAjaranService.setActiveTahunAjaran(ajaran.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.notificationService.showSuccess(res.message || 'Status berhasil diperbarui.');
        },
        error: (err) => {
          const errorMsg = err.error?.message || 'Gagal mengubah status aktif.';
          this.notificationService.showError(errorMsg);
          console.error('Set active error:', err);
        }
      });
  }
}