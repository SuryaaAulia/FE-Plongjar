import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule as NgFormsModule, AbstractControl } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { ActionButtonComponent, FormInputComponent, SelectOption, LoadingSpinnerComponent } from '../../../shared/components/index';
import { MatakuliahService } from '../../../core/services/kaprodi/matakuliah.service';
import { Course, TahunAjaran } from '../../../core/models/user.model';

interface KelasEntry {
  id: string;
  namaKelas: string;
  kuota: number;
  teamTeaching: boolean;
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

  mataKuliahOptions: SelectOption[] = [];
  tahunAjaranOptions: SelectOption[] = [];
  programStudiOptions: SelectOption[] = [];

  private fb = inject(FormBuilder);
  private matakuliahService = inject(MatakuliahService);

  ngOnInit(): void {
    this.mainForm = this.fb.group({
      mataKuliah: ['', Validators.required],
      tahunAjaran: ['', Validators.required],
      programStudi: ['', Validators.required],
    });

    this.kelasForm = this.fb.group({
      namaKelas: ['', Validators.required],
      kuota: [40, [Validators.required, Validators.min(1)]]
    });

    this.loadDropdownData();
  }

  private loadDropdownData(): void {
    this.isLoading = true;
    forkJoin({
      matakuliah: this.matakuliahService.getCoursesByAuthProdi(),
      tahunAjaran: this.matakuliahService.getTahunAjaran(),
      programStudi: this.matakuliahService.getProgramStudi()
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: ({ matakuliah, tahunAjaran, programStudi }) => {
        this.mataKuliahOptions = matakuliah.map((mk: Course) => ({
          value: mk.id,
          label: `${mk.code} - ${mk.name}`
        }));

        this.tahunAjaranOptions = tahunAjaran.map((ta: TahunAjaran) => ({
          value: ta.id,
          label: `${ta.tahun_ajaran} - ${ta.semester}`
        }));

        this.programStudiOptions = programStudi.map((ps: any) => ({
          value: ps.id,
          label: ps.nama
        }));

        console.log("prodi", this.programStudiOptions);
      },
      error: err => {
        console.error("Failed to load initial data", err);
        alert("Gagal memuat data dropdown. Silakan coba lagi.");
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
      id: crypto.randomUUID(),
      namaKelas: this.kelasForm.value.namaKelas,
      kuota: Number(this.kelasForm.value.kuota),
      teamTeaching: false
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

  get isSubmitMappingDisabled(): boolean {
    return this.daftarKelas.length === 0 || this.mainForm.invalid;
  }

  submitMapping(): void {
    if (this.isSubmitMappingDisabled) {
      this.mainForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.mainForm.value;

    const payload = {
      id_matakuliah: formValue.mataKuliah,
      id_tahun_ajaran: formValue.tahunAjaran,
      id_program_studi: formValue.programStudi,
      classes: this.daftarKelas.map(k => ({
        nama_kelas: k.namaKelas,
        kuota: k.kuota,
        team_teaching: k.teamTeaching
      }))
    };

    this.matakuliahService.submitMapping(payload)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          alert('Mapping Kelas berhasil disubmit!');
          this.daftarKelas = [];
          this.showTable = false;
          this.mainForm.reset();
          this.kelasForm.reset({ kuota: 40 });
        },
        error: (err) => {
          console.error('Failed to submit mapping', err);
          alert('Gagal menyimpan mapping. Silakan cek kembali data Anda.');
        }
      });
  }
}