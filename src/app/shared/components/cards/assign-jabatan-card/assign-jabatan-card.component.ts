import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseCardComponent } from '../base-card/base-card.component';
import { Lecturer } from '../../../../core/models/user.model';
import { FormInputComponent, SelectOption } from '../../form-input/form-input.component';
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
export class AssignJabatanCardComponent implements OnInit, OnChanges {
  @Input() lecturer!: Lecturer;
  @Input() jabatanOptions: JabatanOption[] = [];

  @Output() assign = new EventEmitter<{ lecturer: Lecturer, jabatan: JabatanOption | null }>();

  selectedJabatanId: number | null = null;
  selectedJabatan: JabatanOption | null = null;
  showDropdown: boolean = true;

  ngOnInit(): void {
    this.initializeJabatanState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['jabatanOptions'] && !changes['jabatanOptions'].firstChange) {
      this.initializeJabatanState();
    }
  }

  private initializeJabatanState(): void {
    const currentJabatanId = this.lecturer.idJabatanStruktural;

    if (currentJabatanId && this.jabatanOptions.length > 0) {
      const matchedJabatan = this.jabatanOptions.find(option =>
        option.id === currentJabatanId
      );

      if (matchedJabatan) {
        this.selectedJabatan = matchedJabatan;
        this.selectedJabatanId = matchedJabatan.id;
        this.showDropdown = false;
      } else {
        this.resetToDropdown();
      }
    } else {
      this.resetToDropdown();
    }
  }

  get formattedJabatanOptions(): SelectOption[] {
    const options = this.jabatanOptions.map(option => ({
      value: option.id,
      label: option.name
    }));
    return options;
  }

  onJabatanChange(): void {

    if (!this.selectedJabatanId) {
      this.resetToDropdown();
      return;
    }

    const newSelectedJabatan = this.jabatanOptions.find(option =>
      option.id === Number(this.selectedJabatanId)
    );


    if (newSelectedJabatan) {

      this.selectedJabatan = newSelectedJabatan;
      this.showDropdown = false;

      this.assign.emit({
        lecturer: this.lecturer,
        jabatan: newSelectedJabatan
      });

    } else {
      this.resetToDropdown();
    }
  }

  onRemoveJabatan(): void {

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
  }
}