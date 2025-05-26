import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlottingResultCardComponent } from '../../../shared/components/index';
import { Course } from '../../../core/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rekap-plotting',
  standalone: true,
  imports: [CommonModule, PlottingResultCardComponent],
  templateUrl: './rekap-plotting.component.html',
  styleUrl: './rekap-plotting.component.scss'
})
export class RekapPlottingComponent implements OnInit {

  constructor(
    private router: Router,
  ) { }

  courses: Course[] = [];
  selectedProgramStudi: string = 'S1 Rekayasa Perangkat Lunak';
  selectedTahunAjaran: string = 'TA 2024/25';
  selectedSemester: string = 'TA 2024/25';

  programStudiOptions = [
    'S1 Rekayasa Perangkat Lunak',
    'S1 Sistem Informasi',
    'S1 Teknik Informatika'
  ];

  tahunAjaranOptions = [
    'TA 2024/25',
    'TA 2023/24',
    'TA 2022/23'
  ];

  semesterOptions = [
    'TA 2024/25',
    'Semester Ganjil',
    'Semester Genap'
  ];

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.courses = [
      {
        id: '1',
        name: 'S1 Rekayasa Perangkat Lunak',
        code: 'PWL001',
        sks: 3,
        pic: 'Dr. Ahmad Susanto',
        statusMatkul: 'Aktif',
        metodePerkuliahan: 'Hybrid',
        praktikum: 'Ya'
      },
      {
        id: '2',
        name: 'S1 Rekayasa Perangkat Lunak',
        code: 'BDT002',
        sks: 3,
        pic: 'Prof. Maria Dewi',
        statusMatkul: 'Aktif',
        metodePerkuliahan: 'Online',
        praktikum: 'Tidak'
      },
      {
        id: '3',
        name: 'S1 Rekayasa Perangkat Lunak',
        code: 'RPL003',
        sks: 4,
        pic: 'Dr. Budi Santoso',
        statusMatkul: 'Aktif',
        metodePerkuliahan: 'Offline',
        praktikum: 'Ya'
      },
      {
        id: '4',
        name: 'S1 Rekayasa Perangkat Lunak',
        code: 'ASD004',
        sks: 3,
        pic: 'Dr. Sari Indah',
        statusMatkul: 'Aktif',
        metodePerkuliahan: 'Hybrid',
        praktikum: 'Ya'
      },
      {
        id: '5',
        name: 'Sistem Operasi',
        code: 'SO005',
        sks: 3,
        pic: 'Dr. Andi Wijaya',
        statusMatkul: 'Aktif',
        metodePerkuliahan: 'Offline',
        praktikum: 'Tidak'
      },
      {
        id: '6',
        name: 'Jaringan Komputer',
        code: 'JK006',
        sks: 3,
        pic: 'Prof. Lisa Hartono',
        statusMatkul: 'Aktif',
        metodePerkuliahan: 'Online',
        praktikum: 'Ya'
      },
      {
        id: '7',
        name: 'Keamanan Sistem Informasi',
        code: 'KSI007',
        sks: 2,
        pic: 'Dr. Rizki Pratama',
        statusMatkul: 'Aktif',
        metodePerkuliahan: 'Hybrid',
        praktikum: 'Tidak'
      },
      {
        id: '8',
        name: 'Machine Learning',
        code: 'ML008',
        sks: 4,
        pic: 'Dr. Nina Sari',
        statusMatkul: 'Aktif',
        metodePerkuliahan: 'Online',
        praktikum: 'Ya'
      },
      {
        id: '9',
        name: 'Manajemen Proyek TI',
        code: 'MPTI009',
        sks: 2,
        pic: 'Prof. Hendra Gunawan',
        statusMatkul: 'Aktif',
        metodePerkuliahan: 'Offline',
        praktikum: 'Tidak'
      }
    ];
  }

  onProgramStudiChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedProgramStudi = target.value;
    this.loadCourses();
  }

  onTahunAjaranChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedTahunAjaran = target.value;
    this.loadCourses();
  }

  onSemesterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedSemester = target.value;
    this.loadCourses();
  }

  onCourseClick(course: Course): void {
    console.log('Course clicked:', course);
  }

  onShowCourseDetails(course: Course): void {
    this.router.navigate(['kaur-lab/hasil-plotting', course.id]);
  }

  onDownloadCourseExcel(course: Course): void {
    console.log('Download course excel:', course);
  }

  trackByCourseId(index: number, course: Course): string {
    return course.id;
  }
}
