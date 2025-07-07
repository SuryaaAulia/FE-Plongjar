import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ActionButtonComponent, LoadingSpinnerComponent, FormInputComponent } from '../../../shared/components/index';
import { Course } from '../../../core/models/user.model';
import { MatakuliahService } from '../../../core/services/matakuliah.service';
import { NotificationService } from '../../../core/services/notification.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-detail-matkul',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActionButtonComponent,
    LoadingSpinnerComponent,
    FormInputComponent
  ],
  templateUrl: './detail-matkul.component.html',
  styleUrls: ['./detail-matkul.component.scss']
})
export class DetailMatkulComponent implements OnInit {
  detailMatkulForm!: FormGroup;
  isLoading = false;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private matakuliahService = inject(MatakuliahService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.initForm();
    const courseIdParam = this.route.snapshot.paramMap.get('id');

    if (courseIdParam) {
      const courseId = Number(courseIdParam);
      if (!isNaN(courseId)) {
        this.loadCourseDetails(courseId);
      } else {
        console.error('Invalid Course ID in URL');
        this.notificationService.showError('ID Mata Kuliah tidak valid.');
        this.goBack();
      }
    } else {
      console.error('Course ID not found in URL!');
      this.notificationService.showError('ID Mata Kuliah tidak ditemukan di URL.');
      this.goBack();
    }
  }

  initForm(): void {
    this.detailMatkulForm = this.fb.group({
      namaMatkul: [''],
      kodeMatkul: [''],
      sks: [''],
      pic: [''],
      statusMatkul: [''],
      metodePerkuliahan: [''],
      praktikum: [''],
      matakuliahEksepsi: [''],
      tingkatMatakuliah: [''],
    });
    this.detailMatkulForm.disable();
  }

  loadCourseDetails(id: number): void {
    this.isLoading = true;
    this.matakuliahService.getCourseById(id).pipe(
      finalize(() => { this.isLoading = false; })
    ).subscribe({
      next: (courseData: Course) => {
        this.populateForm(courseData);
      },
      error: (err) => {
        console.error('Failed to load course details:', err);
        this.notificationService.showError('Gagal memuat detail mata kuliah.');
        this.goBack();
      }
    });
  }

  populateForm(course: any): void {
    this.detailMatkulForm.patchValue({
      namaMatkul: course.name,
      kodeMatkul: course.code,
      sks: `${course.sks} SKS`,
      pic: course.pic,
      statusMatkul: course.statusMatkul,
      metodePerkuliahan: course.metodePerkuliahan,
      praktikum: course.praktikum,
      matakuliahEksepsi: course.matakuliah_eksepsi,
      tingkatMatakuliah: course.tingkat_matakuliah,
    });
  }

  goBack(): void {
    this.location.back();
  }
}