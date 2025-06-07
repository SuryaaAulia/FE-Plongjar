import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionButtonComponent } from '../../../shared/components/index';
import { Course } from '../../../core/models/user.model';

interface SelectOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-tambah-matkul',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActionButtonComponent],
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

  sksOptions: number[] = [1, 2, 3, 4, 5, 6];
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
      const courseCodeFromRoute = params.get('code');
      if (courseCodeFromRoute) {
        this.isEditMode = true;
        this.editingCourseCode = courseCodeFromRoute;
        this.pageSubtitle = 'Edit informasi mengenai mata kuliah';
        this.pageTitle = 'Edit Mata Kuliah';
        this.submitButtonText = 'Update';
        this.loadCourseDataForEdit(courseCodeFromRoute);
      } else {
        this.isEditMode = false;
        this.editingCourseCode = null;
        this.pageTitle = 'Tambah Mata Kuliah';
        this.pageSubtitle = 'Masukkan informasi untuk mata kuliah baru';
        this.submitButtonText = 'Submit';
      }
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

  loadCourseDataForEdit(code: string): void {
    // ** IDEAL: Fetch from service **
    // this.matkulService.getMatkulByCode(code).subscribe(course => {
    //   if (course) {
    //     const formData = {
    //       namaMatkul: course.name,
    //       kodeMatkul: course.code,
    //       sks: course.sks,
    //       pic: course.pic,
    //       statusMatkul: course.statusMatkul,
    //       metodePerkuliahan: course.metodePerkuliahan,
    //       praktikum: String(course.praktikum) // Ensure string for radio
    //     };
    //     this.addMatkulForm.patchValue(formData);
    //     // Disable Kode Matkul if it should not be editable
    //     this.addMatkulForm.get('kodeMatkul')?.disable();
    //   } else {
    //     console.error(`Mata Kuliah dengan kode ${code} tidak ditemukan.`);
    //     this.router.navigate(['/ketua-prodi/manage-matkul']); // Navigate back to list
    //   }
    // }, error => {
    //   console.error('Error fetching mata kuliah:', error);
    //   this.router.navigate(['/ketua-prodi/manage-matkul']);
    // });

    const mockCourses: Course[] = [
      { id: 'db-1', name: 'MOBILE PROGRAMMING', code: 'CRI3I3', sks: 3, pic: 'pic1', statusMatkul: 'active', metodePerkuliahan: 'hybrid', praktikum: 'true' },
      { id: 'db-2', name: 'WEB DEVELOPMENT', code: 'CS101', sks: 4, pic: 'pic2', statusMatkul: 'new', metodePerkuliahan: 'online', praktikum: 'false' },
    ];
    const courseToEdit = mockCourses.find(c => c.code === code);

    if (courseToEdit) {
      const formData = {
        namaMatkul: courseToEdit.name,
        kodeMatkul: courseToEdit.code,
        sks: courseToEdit.sks,
        pic: courseToEdit.pic,
        statusMatkul: courseToEdit.statusMatkul,
        metodePerkuliahan: courseToEdit.metodePerkuliahan,
        praktikum: String(courseToEdit.praktikum)
      };
      this.addMatkulForm.patchValue(formData);

    } else {
      console.error(`Mock Mata Kuliah dengan kode ${code} tidak ditemukan.`);
      alert(`Error: Mata Kuliah dengan kode ${code} tidak ditemukan.`);
      this.router.navigate(['/ketua-prodi/manage-matkul']);
    }
  }

  onSubmit(): void {
    if (this.addMatkulForm.invalid) {
      this.markAllAsTouched();
      console.log('Form is invalid');
      return;
    }

    const formValue = this.addMatkulForm.getRawValue();
    const coursePayload: Partial<Course> = {
      name: formValue.namaMatkul,
      code: formValue.kodeMatkul,
      sks: formValue.sks,
      pic: formValue.pic,
      statusMatkul: formValue.statusMatkul,
      metodePerkuliahan: formValue.metodePerkuliahan,
      praktikum: formValue.praktikum
    };


    if (this.isEditMode && this.editingCourseCode) {
      console.log('Updating Course:', this.editingCourseCode, coursePayload);
      // ** IDEAL: Call update service **
      // this.matkulService.updateMatkul(this.editingCourseCode, coursePayload).subscribe({
      //   next: () => {
      //     alert('Mata Kuliah berhasil diperbarui!');
      //     this.router.navigate(['/ketua-prodi/manage-matkul']);
      //   },
      //   error: (err) => console.error('Error updating course:', err)
      // });
      alert(`MATA KULIAH ${this.editingCourseCode} BERHASIL DIPERBARUI! (Mock - Data di console)`);
      this.router.navigate(['/ketua-prodi/manage-matkul']); // Navigate after mock update
    } else {
      console.log('Adding New Course:', coursePayload);
      // ** IDEAL: Call add service **
      // this.matkulService.addMatkul(coursePayload).subscribe({
      //   next: () => {
      //     alert('Mata Kuliah berhasil ditambahkan!');
      //     this.router.navigate(['/ketua-prodi/manage-matkul']);
      //   },
      //   error: (err) => console.error('Error adding course:', err)
      // });
      alert('MATA KULIAH BARU BERHASIL DITAMBAHKAN! (Mock - Data di console)');
      this.router.navigate(['/ketua-prodi/manage-matkul']);
    }
  }

  markAllAsTouched(): void {
    Object.values(this.addMatkulForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/ketua-prodi/manage-matkul']);
  }
}