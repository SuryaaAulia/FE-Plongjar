import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionButtonComponent, FormInputComponent, SelectOption } from '../../../shared/components/index';
import { Course } from '../../../core/models/user.model';

@Component({
  selector: 'app-tambah-matkul',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActionButtonComponent,
    FormInputComponent
  ],
  templateUrl: './tambah-matkul.component.html',
  styleUrls: ['./tambah-matkul.component.scss']
})
export class TambahMatkulComponent implements OnInit {
  addMatkulForm!: FormGroup;
  isEditMode = false;
  private editingCourseCode: string | null = null;

  pageTitle = 'Tambah Mata Kuliah';
  pageSubtitle = 'Masukkan informasi untuk mata kuliah baru';
  submitButtonText = 'Submit';

  sksOptions: SelectOption[] = [1, 2, 3, 4, 5, 6].map(v => ({ value: v, label: `${v} SKS` }));
  picOptions: SelectOption[] = [
    { value: 'pic1', label: 'PIC A (SEAL)' },
    { value: 'pic2', label: 'PIC B (BNL)' },
    { value: 'pic3', label: 'PIC C (SUI)' },
  ];
  statusMatkulOptions: SelectOption[] = [
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Tidak Aktif' },
    { value: 'new', label: 'Baru' },
  ];
  metodePerkuliahanOptions: SelectOption[] = [
    { value: 'online', label: 'Daring (Online)' },
    { value: 'offline', label: 'Luring (Offline)' },
    { value: 'hybrid', label: 'Bauran (Hybrid)' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.route.paramMap.subscribe(params => {
    });
  }

  initForm(): void {
    this.addMatkulForm = this.fb.group({
      namaMatkul: ['', Validators.required],
      kodeMatkul: ['', Validators.required],
      sks: ['', Validators.required],
      pic: ['', Validators.required],
      statusMatkul: ['', Validators.required],
      metodePerkuliahan: ['', Validators.required],
      praktikum: [null, Validators.required]
    });
  }

  getControl(name: string): AbstractControl | null {
    return this.addMatkulForm.get(name);
  }

  loadCourseDataForEdit(code: string): void { /* ... */ }
  onSubmit(): void { /* ... */ }
  markAllAsTouched(): void { /* ... */ }
  goBack(): void { /* ... */ }
}