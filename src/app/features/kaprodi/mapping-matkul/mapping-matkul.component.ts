import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule as NgFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActionButtonComponent } from '../../../shared/components/index';

interface SelectOption {
  value: string | number;
  label: string;
}

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
    ActionButtonComponent
  ],
  templateUrl: './mapping-matkul.component.html',
  styleUrls: ['./mapping-matkul.component.scss']
})
export class MappingMatkulComponent implements OnInit {
  mappingForm!: FormGroup;
  daftarKelas: KelasEntry[] = [];
  private kelasCounter: number = 0;
  showTable: boolean = false;

  // Placeholder options - fetch from a service in a real app
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
  }

  // Check if all required fields are filled before enabling the Tambah Kelas button
  get isTambahKelasDisabled(): boolean {
    return this.mappingForm.invalid ||
      !this.mappingForm.get('mataKuliah')?.value ||
      !this.mappingForm.get('tahunAjaran')?.value ||
      !this.mappingForm.get('prefixNamaKelas')?.value ||
      !this.mappingForm.get('kuotaDefault')?.value;
  }

  tambahKelas(): void {
    if (this.isTambahKelasDisabled) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.mappingForm.controls).forEach(key => {
        this.mappingForm.get(key)?.markAsTouched();
      });
      return;
    }

    const prefix = this.mappingForm.get('prefixNamaKelas')?.value;
    const kuota = this.mappingForm.get('kuotaDefault')?.value;

    if (prefix && kuota && kuota >= 1) {
      this.kelasCounter++;
      const newKelas: KelasEntry = {
        id: crypto.randomUUID(),
        namaKelas: `${prefix}${String(this.kelasCounter).padStart(2, '0')}`,
        kuota: Number(kuota),
        teamTeaching: false
      };
      this.daftarKelas.push(newKelas);
      this.showTable = true; // Show the table after adding a class
    }
  }

  hapusKelas(index: number): void {
    if (index >= 0 && index < this.daftarKelas.length) {
      this.daftarKelas.splice(index, 1);
      if (this.daftarKelas.length === 0) {
        this.kelasCounter = 0;
        this.showTable = false; // Hide the table when no classes are left
      }
    }
  }

  get isSubmitMappingDisabled(): boolean {
    return this.daftarKelas.length === 0 || this.mappingForm.invalid;
  }

  submitMapping(): void {
    if (this.isSubmitMappingDisabled) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.mappingForm.controls).forEach(key => {
        this.mappingForm.get(key)?.markAsTouched();
      });
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

    console.log('Submitting Mapping Data:', finalMappingData);
    // Here, you would call a service to send data to your backend
    alert('Mapping Kelas berhasil disubmit! (Data di console)');
  }
}