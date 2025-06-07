import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionButtonComponent } from '../../../shared/components/index';
import { Course } from '../../../core/models/user.model';


interface SelectOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-detail-matkul',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActionButtonComponent
  ],
  templateUrl: './detail-matkul.component.html',
  styleUrls: ['./detail-matkul.component.scss']
})
export class DetailMatkulComponent implements OnInit {
  detailMatkulForm!: FormGroup;
  courseData: Course | null = null;
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
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.initForm();
    const courseId = this.route.snapshot.paramMap.get('code');

    if (courseId) {
      this.loadCourseDetails(courseId);
    } else {
      console.error('Course ID not found!');
      this.goBack();
    }
  }

  initForm(): void {
    this.detailMatkulForm = this.fb.group({
      namaMatkul: ['', Validators.required],
      kodeMatkul: ['', Validators.required],
      sks: ['', Validators.required],
      pic: ['', Validators.required],
      statusMatkul: ['', Validators.required],
      metodePerkuliahan: ['', Validators.required],
      praktikum: [null, Validators.required]
    });
  }

  loadCourseDetails(code: string): void {

    const mockCourses: Course[] = [
      { id: 'db-1', name: 'MOBILE PROGRAMMING', code: 'CRI3I3', sks: 3, pic: 'pic1', statusMatkul: 'active', metodePerkuliahan: 'hybrid', praktikum: 'true' },
      { id: 'db-2', name: 'WEB DEVELOPMENT', code: 'CS101', sks: 4, pic: 'pic2', statusMatkul: 'new', metodePerkuliahan: 'online', praktikum: 'false' },
    ];
    this.courseData = mockCourses.find(c => c.code === code) || null;

    if (this.courseData) {
      const formData = {
        namaMatkul: this.courseData.name,
        kodeMatkul: this.courseData.code,
        sks: this.courseData.sks,
        pic: this.courseData.pic,
        statusMatkul: this.courseData.statusMatkul,
        metodePerkuliahan: this.courseData.metodePerkuliahan,
        praktikum: String(this.courseData.praktikum)
      };
      this.detailMatkulForm.patchValue(formData);
      this.detailMatkulForm.disable();
    } else {
      console.error('Mock Course data not found for ID:', code);
      this.goBack();
    }
  }

  goBack(): void {
    this.location.back();
  }

}