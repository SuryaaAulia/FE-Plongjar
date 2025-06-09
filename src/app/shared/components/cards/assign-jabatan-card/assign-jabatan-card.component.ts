import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseCardComponent } from '../base-card/base-card.component';
import { Lecturer } from '../../../../core/models/user.model';
import { FormInputComponent, SelectOption } from '../../../../shared/components/index';

export interface JabatanOption {
  id: number;
  name: string;
  value: string;
}

@Component({
  selector: 'app-assign-jabatan-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseCardComponent,
    FormInputComponent
  ],
  templateUrl: './assign-jabatan-card.component.html',
  styleUrls: ['./assign-jabatan-card.component.scss']
})
export class AssignJabatanCardComponent implements OnInit {
  @Input() lecturer!: Lecturer;
  @Input() jabatanOptions: JabatanOption[] = [
    { id: 1, name: 'Asisten Ahli', value: 'asisten_ahli' },
    { id: 2, name: 'Lektor', value: 'lektor' },
    { id: 3, name: 'Lektor Kepala', value: 'lektor_kepala' },
    { id: 4, name: 'Guru Besar', value: 'guru_besar' },
    { id: 5, name: 'Tenaga Pengajar', value: 'tenaga_pengajar' }
  ];

  @Output() assign = new EventEmitter<{ lecturer: Lecturer, jabatan: JabatanOption | null }>();

  selectedJabatanId: number | null = null;
  selectedJabatan: JabatanOption | null = null;
  showDropdown: boolean = true;

  ngOnInit(): void {
    console.log('Initializing component for lecturer:', this.lecturer.name);
    this.initializeJabatanState();
  }

  private initializeJabatanState(): void {
    const currentJabatanName = this.lecturer.jabatanFunctionalAkademik &&
      this.lecturer.jabatanFunctionalAkademik.length > 0
      ? this.lecturer.jabatanFunctionalAkademik[0]
      : null;

    console.log('Current jabatan for lecturer:', currentJabatanName);

    if (currentJabatanName) {
      const matchedJabatan = this.jabatanOptions.find(option =>
        option.name.toLowerCase().trim() === currentJabatanName.toLowerCase().trim()
      );

      if (matchedJabatan) {
        console.log('Found matching jabatan:', matchedJabatan);
        this.selectedJabatan = matchedJabatan;
        this.selectedJabatanId = matchedJabatan.id;
        this.showDropdown = false;
      } else {
        console.log('No matching jabatan found, showing dropdown');
        this.resetToDropdown();
      }
    } else {
      console.log('No current jabatan, showing dropdown');
      this.resetToDropdown();
    }
  }

  get formattedJabatanOptions(): SelectOption[] {
    return this.jabatanOptions.map(option => ({
      value: option.id,
      label: option.name
    }));
  }

  onJabatanChange(): void {
    console.log('Jabatan changed, selectedJabatanId:', this.selectedJabatanId);

    if (!this.selectedJabatanId) {
      this.resetToDropdown();
      return;
    }

    const newSelectedJabatan = this.jabatanOptions.find(option =>
      option.id === this.selectedJabatanId
    );

    if (newSelectedJabatan) {
      console.log('New jabatan selected:', newSelectedJabatan);

      this.selectedJabatan = newSelectedJabatan;
      this.showDropdown = false;

      this.assign.emit({
        lecturer: this.lecturer,
        jabatan: newSelectedJabatan
      });

      console.log('Assignment emitted, showDropdown:', this.showDropdown);
      console.log('selectedJabatan:', this.selectedJabatan);
    } else {
      console.error('Could not find jabatan with id:', this.selectedJabatanId);
      this.resetToDropdown();
    }
  }

  onRemoveJabatan(): void {
    console.log('Removing jabatan assignment');

    this.assign.emit({
      lecturer: this.lecturer,
      jabatan: null
    });

    this.resetToDropdown();
  }

  private resetToDropdown(): void {
    this.selectedJabatanId = null;
    this.selectedJabatan = null;
    this.showDropdown = true;
    console.log('Component reset to dropdown state');
  }
}