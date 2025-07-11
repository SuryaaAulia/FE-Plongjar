import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule as NgFormsModule, AbstractControl } from '@angular/forms';
import { finalize, forkJoin, combineLatest, switchMap, debounceTime, filter, startWith, distinctUntilChanged } from 'rxjs';
import { ActionButtonComponent, FormInputComponent, SelectOption, LoadingSpinnerComponent } from '../../../shared/components/index';
import { MatakuliahService } from '../../../core/services/matakuliah.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Course, TahunAjaran } from '../../../core/models/user.model';
import { v4 as uuidv4 } from 'uuid';

interface KelasEntry {
  id: string;
  namaKelas: string;
  kuota: number;
  teamTeaching: boolean;
  isExisting: boolean;
}

@Component({
  selector: 'app-mapping-kelas-matkul',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgFormsModule,
    ActionButtonComponent,
    FormInputComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './mapping-matkul.component.html',
  styleUrls: ['./mapping-matkul.component.scss']
})
export class MappingMatkulComponent implements OnInit {
  mainForm!: FormGroup;
  kelasForm!: FormGroup;

  daftarKelas: KelasEntry[] = [];
  isLoading = false;
  showTable = false;
  isTableLoading = false

  mataKuliahOptions: SelectOption[] = [];
  tahunAjaranOptions: SelectOption[] = [];

  private fb = inject(FormBuilder);
  private matakuliahService = inject(MatakuliahService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.mainForm = this.fb.group({
      mataKuliah: ['', Validators.required],
      tahunAjaran: ['', Validators.required],
    });

    this.kelasForm = this.fb.group({
      namaKelas: ['', Validators.required],
      kuota: [40, [Validators.required, Validators.min(1)]]
    });

    this.loadDropdownData();
    this.listenForDataMappingChanges();
  }

  private loadDropdownData(): void {
    this.isLoading = true;
    forkJoin({
      matakuliah: this.matakuliahService.getAllCoursesByPicAndAllKK(),
      tahunAjaran: this.matakuliahService.getTahunAjaran()
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: ({ matakuliah, tahunAjaran }) => {
        this.mataKuliahOptions = matakuliah
          .filter((mk: Course) => mk.id !== null && mk.id !== undefined)
          .map((mk: Course) => ({
            value: mk.id,
            label: `${mk.code} - ${mk.name}`
          }));

        this.tahunAjaranOptions = tahunAjaran.map((ta: TahunAjaran) => ({
          value: ta.id,
          label: `${ta.tahun_ajaran} - ${ta.semester}`
        }));
      },
      error: err => {
        console.error("Failed to load initial data", err);
        this.notificationService.showError("Gagal memuat data dropdown. Silakan coba lagi.");
      }
    });
  }

  private listenForDataMappingChanges(): void {
    const mataKuliah$ = this.mainForm.get('mataKuliah')!.valueChanges.pipe(startWith(null));
    const tahunAjaran$ = this.mainForm.get('tahunAjaran')!.valueChanges.pipe(startWith(null));

    combineLatest([mataKuliah$, tahunAjaran$]).pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => prev[0] === curr[0] && prev[1] === curr[1]),
      filter(([matkulId, tahunAjaranId]) => !!matkulId && !!tahunAjaranId),
      switchMap(([matkulId, tahunAjaranId]) => {
        this.isTableLoading = true;
        this.showTable = false;
        this.daftarKelas = this.daftarKelas.filter(k => !k.isExisting);
        return this.matakuliahService.getDataMappingKelasMatkul(matkulId, tahunAjaranId).pipe(
          finalize(() => {
            this.isTableLoading = false;
          })
        );
      })
    ).subscribe({
      next: (existingClasses) => {
        const fetchedKelas = existingClasses.map((k: any) => ({
          id: uuidv4(),
          namaKelas: k.nama_kelas,
          kuota: k.kuota,
          teamTeaching: !!k.team_teaching,
          isExisting: true
        }));

        this.daftarKelas.unshift(...fetchedKelas);
        this.showTable = this.daftarKelas.length > 0;
      },
      error: (err) => {
        console.error("Failed to fetch existing class data", err);
        this.notificationService.showError("Gagal mengambil data kelas yang sudah ada.");
        this.showTable = false;
      }
    });
  }

  getKelasControl(name: string): AbstractControl | null {
    return this.kelasForm.get(name);
  }

  tambahKelas(): void {
    if (this.kelasForm.invalid) {
      this.kelasForm.markAllAsTouched();
      return;
    }

    const newKelas: KelasEntry = {
      id: uuidv4(),
      namaKelas: this.kelasForm.value.namaKelas,
      kuota: Number(this.kelasForm.value.kuota),
      teamTeaching: false,
      isExisting: false
    };

    this.daftarKelas.push(newKelas);
    this.showTable = true;
    this.kelasForm.reset({ kuota: 40 });
  }

  hapusKelas(index: number): void {
    this.daftarKelas.splice(index, 1);
    if (this.daftarKelas.length === 0) {
      this.showTable = false;
    }
  }

  get newKelasCount(): number {
    return this.daftarKelas.filter(k => !k.isExisting).length;
  }

  get isSubmitMappingDisabled(): boolean {
    const hasNewClasses = this.daftarKelas.some(k => !k.isExisting);
    return !hasNewClasses || this.mainForm.invalid;
  }

  submitMapping(): void {
    if (this.isSubmitMappingDisabled) {
      this.mainForm.markAllAsTouched();
      if (!this.daftarKelas.some(k => !k.isExisting)) {
        this.notificationService.showWarning("Tidak ada kelas baru untuk ditambahkan.");
      }
      return;
    }

    this.isLoading = true;
    const formValue = this.mainForm.value;

    const payload = {
      id_matakuliah: formValue.mataKuliah,
      id_tahun_ajaran: formValue.tahunAjaran,
      classes: this.daftarKelas
        .filter(k => !k.isExisting)
        .map(k => ({
          nama_kelas: k.namaKelas,
          kuota: k.kuota,
          team_teaching: k.teamTeaching
        }))
    };

    this.matakuliahService.submitMapping(payload)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Mapping Kelas berhasil disubmit!');
          this.daftarKelas = [];
          this.showTable = false;
          this.mainForm.reset();
          this.kelasForm.reset({ kuota: 40 });
        },
        error: (err) => {
          console.error('Failed to submit mapping', err);
          this.notificationService.showError('Gagal menyimpan mapping. Silakan cek kembali data Anda.');
        }
      });
  }
}