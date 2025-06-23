import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActionButtonComponent, FormInputComponent, SelectOption, LoadingSpinnerComponent } from '../../../shared/components/index';
import { TahunAjaranService } from '../../../core/services/admin/tahun-ajaran.service';
import { TahunAjaran } from '../../../core/models/user.model';

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

  constructor(
    private fb: FormBuilder,
    private tahunAjaranService: TahunAjaranService
  ) { }

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
      sampaiTahun: ['', Validators.required],
      semester: ['', Validators.required],
    }, { validators: this.tahunValidator });

    this.getControl('dariTahun').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(val => {
      const dariTahunNum = parseInt(val, 10);
      this.sampaiTahunOptions = this.tahunOptions.filter(option => Number(option.value) > dariTahunNum);

      const currentSampaiTahun = this.getControl('sampaiTahun').value;
      if (currentSampaiTahun && parseInt(currentSampaiTahun, 10) <= dariTahunNum) {
        this.getControl('sampaiTahun').setValue('');
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
              if (a.semester > b.semester) return -1;
              if (a.semester < b.semester) return 1;
              return 0;
            });
            this.updateStatusInList();
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load tahun ajaran list', err);
          alert('Error: Gagal memuat daftar tahun ajaran.');
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
    this.sampaiTahunOptions = [...this.tahunOptions];
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

    if (dari && sampai && parseInt(dari, 10) >= parseInt(sampai, 10)) {
      return { tahunTidakValid: true };
    }

    return null;
  };


  getControl(name: string): AbstractControl {
    return this.tahunAjaranForm.get(name) as AbstractControl;
  }

  tambahTahunAjaran(): void {
    if (this.tahunAjaranForm.invalid) {
      this.tahunAjaranForm.markAllAsTouched();
      alert('Peringatan: Harap isi semua field yang diperlukan.');
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
          alert(res.message || 'Tahun Ajaran berhasil ditambahkan.');
          this.tahunAjaranForm.reset();
          this.getControl('dariTahun').setValue(''); // Clear selections
          this.getControl('sampaiTahun').setValue('');
          this.getControl('semester').setValue('');
          this.loadTahunAjaranData();
        },
        error: (err) => {
          const errorMsg = err.error?.message || 'Gagal menambahkan tahun ajaran.';
          alert('Error: ' + errorMsg);
          console.error('Create error:', err);
        }
      });
  }

  hapusTahunAjaran(ajaran: TahunAjaran): void {
    if (confirm(`Anda yakin akan menghapus ${ajaran.tahun_ajaran} - semester ${ajaran.semester}? Aksi ini tidak dapat dibatalkan.`)) {
      this.tahunAjaranService.deleteTahunAjaran(ajaran.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            alert(res.message || 'Tahun Ajaran telah dihapus.');
            this.loadTahunAjaranData();
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Gagal menghapus tahun ajaran.';
            alert('Error: ' + errorMsg);
            console.error('Delete error:', err);
          }
        });
    }
  }

  setAktif(ajaran: TahunAjaran): void {
    this.tahunAjaranService.setActiveTahunAjaran(ajaran.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          alert(res.message || 'Status berhasil diperbarui.');
          this.loadTahunAjaranData();
        },
        error: (err) => {
          const errorMsg = err.error?.message || 'Gagal mengubah status aktif.';
          alert('Error: ' + errorMsg);
          console.error('Set active error:', err);
          this.loadTahunAjaranData();
        }
      });
  }
}