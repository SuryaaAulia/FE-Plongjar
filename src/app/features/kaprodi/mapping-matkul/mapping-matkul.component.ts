import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule as NgFormsModule,
  AbstractControl
} from '@angular/forms';
import { Router } from '@angular/router';
import { ActionButtonComponent, FormInputComponent, SelectOption } from '../../../shared/components/index';
interface MataKuliahOption {
  id: string;
  nama: string;
}

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
    FormInputComponent
  ],
  templateUrl: './mapping-matkul.component.html',
  styleUrls: ['./mapping-matkul.component.scss']
})
export class MappingMatkulComponent implements OnInit {
  mappingForm!: FormGroup;
  daftarKelas: KelasEntry[] = [];
  private kelasCounter: number = 0;
  showTable: boolean = false;
  formattedMataKuliahOptions: SelectOption[] = [];

  mataKuliahOptions: MataKuliahOption[] = [
    { id: 'mk001', nama: 'CCK41BB3-DEVOPS' },
    { id: 'mk002', nama: 'PEMROGRAMAN WEB LANJUT' },
    { id: 'mk003', nama: 'STATISTIKA INDUSTRI JAWA JAWA STATISTIKA JAWA JAWA' },
  ];

  tahunAjaranOptions: SelectOption[] = [
    { value: '2024/2025-ganjil', label: '2024/2025 Ganjil' },
    { value: '2024/2025-genap', label: '2024/2025 Genap' },
    { value: '2023/2024-genap', label: '2023/2024 Genap' },
  ];

  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.mappingForm = this.fb.group({
      mataKuliah: ['', Validators.required],
      tahunAjaran: ['', Validators.required],
      prefixNamaKelas: ['', Validators.required],
      kuotaDefault: [40, [Validators.required, Validators.min(1)]]
    });
    this.formattedMataKuliahOptions = this.mataKuliahOptions.map(mk => ({
      value: mk.id,
      label: mk.nama
    }));
  }
  getControl(name: string): AbstractControl | null {
    return this.mappingForm.get(name);
  }
  get isTambahKelasDisabled(): boolean {
    return this.mappingForm.invalid;
  }
  tambahKelas(): void {
    if (this.mappingForm.invalid) {
      this.mappingForm.markAllAsTouched();
      return;
    }

    const prefix = this.mappingForm.get('prefixNamaKelas')?.value;
    const kuota = this.mappingForm.get('kuotaDefault')?.value;

    this.kelasCounter++;
    const newKelas: KelasEntry = {
      id: crypto.randomUUID(),
      namaKelas: `${prefix}${String(this.kelasCounter).padStart(2, '0')}`,
      kuota: Number(kuota),
      teamTeaching: false
    };
    this.daftarKelas.push(newKelas);
    this.showTable = true;
  }
  hapusKelas(index: number): void {
    if (index >= 0 && index < this.daftarKelas.length) {
      this.daftarKelas.splice(index, 1);
      if (this.daftarKelas.length === 0) {
        this.kelasCounter = 0;
        this.showTable = false;
      }
    }
  }

  get isSubmitMappingDisabled(): boolean {
    return this.daftarKelas.length === 0 ||
      !!this.mappingForm.get('mataKuliah')?.invalid ||
      !!this.mappingForm.get('tahunAjaran')?.invalid;
  }

  submitMapping(): void {
    if (this.isSubmitMappingDisabled) {
      this.mappingForm.markAllAsTouched();
      return;
    }

    const finalMappingData = {
      mataKuliahId: this.mappingForm.get('mataKuliah')?.value,
      tahunAjaran: this.mappingForm.get('tahunAjaran')?.value,
      kelasDitambahkan: this.daftarKelas.map(k => ({
        namaKelas: k.namaKelas,
        kuota: k.kuota,
        isTeamTeaching: k.teamTeaching
      }))
    };

    console.log('Submitting Final Mapping Data:', finalMappingData);
    alert('Mapping Kelas berhasil disubmit! (Data di-log ke console)');
  }
}