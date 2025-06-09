import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule as NgFormsModule, AbstractControl } from '@angular/forms';
import { ActionButtonComponent, FormInputComponent, SelectOption } from '../../../shared/components/index';

interface TahunAjaranEntry {
  id: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  statusAktif: boolean;
}

@Component({
  selector: 'app-tahun-ajaran',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgFormsModule,
    ActionButtonComponent,
    FormInputComponent
  ],
  templateUrl: './manage-tahun-ajaran.component.html',
  styleUrls: ['./manage-tahun-ajaran.component.scss']
})
export class ManageTahunAjaranComponent implements OnInit {
  tahunAjaranForm!: FormGroup;
  daftarTahunAjaran: TahunAjaranEntry[] = [];
  tahunOptions: SelectOption[] = [];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.generateTahunOptions();
    this.tahunAjaranForm = this.fb.group({
      dariTahun: ['', Validators.required],
      sampaiTahun: ['', Validators.required]
    }, { validator: this.tahunValidator });

    // Pre-populate with some data to match the image
    this.prepopulateData();
  }

  private generateTahunOptions(): void {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
      const year = currentYear + i;
      this.tahunOptions.push({ value: year.toString(), label: year.toString() });
    }
  }

  // Pre-populate data to match the initial screenshot
  private prepopulateData(): void {
    this.daftarTahunAjaran = [
      { id: crypto.randomUUID(), tahunAjaran: '2024/2025', semester: 'Genap', statusAktif: false },
      { id: crypto.randomUUID(), tahunAjaran: '2024/2025', semester: 'Genap', statusAktif: false },
      { id: crypto.randomUUID(), tahunAjaran: '2024/2025', semester: 'Genap', statusAktif: false },
      { id: crypto.randomUUID(), tahunAjaran: '2024/2025', semester: 'Genap', statusAktif: false },
      { id: crypto.randomUUID(), tahunAjaran: '2024/2025', semester: 'Genap', statusAktif: false },
      { id: crypto.randomUUID(), tahunAjaran: '2024/2025', semester: 'Genap', statusAktif: false },
    ];
  }


  tahunValidator(group: FormGroup): { [key: string]: boolean } | null {
    const dari = group.get('dariTahun')?.value;
    const sampai = group.get('sampaiTahun')?.value;
    if (dari && sampai && parseInt(dari, 10) >= parseInt(sampai, 10)) {
      return { tahunTidakValid: true };
    }
    return null;
  }

  getControl(name: string): AbstractControl | null {
    return this.tahunAjaranForm.get(name);
  }

  tambahTahunAjaran(): void {
    if (this.tahunAjaranForm.invalid) {
      this.tahunAjaranForm.markAllAsTouched();
      return;
    }

    const { dariTahun, sampaiTahun } = this.tahunAjaranForm.value;
    const newTahunAjaran: TahunAjaranEntry = {
      id: crypto.randomUUID(),
      tahunAjaran: `${dariTahun}/${sampaiTahun}`,
      semester: 'Genap', // Default semester
      statusAktif: false,
    };

    this.daftarTahunAjaran.unshift(newTahunAjaran); // Add to the top of the list
    this.tahunAjaranForm.reset();
  }

  hapusTahunAjaran(index: number): void {
    if (index >= 0 && index < this.daftarTahunAjaran.length) {
      this.daftarTahunAjaran.splice(index, 1);
    }
  }

  setAktif(selectedIndex: number): void {
    this.daftarTahunAjaran.forEach((item, index) => {
      item.statusAktif = index === selectedIndex;
    });
  }

  simpanTahunAjaran(): void {
    if (this.daftarTahunAjaran.length === 0) {
      alert('Tidak ada data untuk disimpan.');
      return;
    }

    const activeEntry = this.daftarTahunAjaran.find(item => item.statusAktif);
    if (!activeEntry) {
      alert('Silakan pilih satu Tahun Ajaran sebagai status aktif.');
      return;
    }

    const dataToSave = {
      daftarTahunAjaran: this.daftarTahunAjaran,
      tahunAjaranAktif: activeEntry
    };

    console.log('Menyimpan data:', dataToSave);
    alert(`Tahun Ajaran berhasil disimpan! Aktif: ${activeEntry.tahunAjaran} - ${activeEntry.semester}`);
  }
}