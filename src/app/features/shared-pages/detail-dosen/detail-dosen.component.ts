import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent, ActionButtonComponent } from '../../../shared/components/index';
import { DosenService } from '../../../core/services/dosen.service';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-detail-dosen',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ActionButtonComponent
  ],
  templateUrl: './detail-dosen.component.html',
  styleUrls: ['./detail-dosen.component.scss'],
})
export class DetailDosenComponent implements OnInit {
  lecturer: any | null = null;
  lecturerId: number | null = null;
  currentPage = 1;
  totalPages = 2;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private dosenService: DosenService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.lecturerId = parseInt(idParam, 10);
      if (isNaN(this.lecturerId)) {
        console.error('DetailDosenComponent: Invalid lecturer ID provided in URL:', idParam);
        this.isLoading = false;
        this.lecturer = null;
        return;
      }
      this.loadLecturerDetails(this.lecturerId);
    } else {
      console.error('DetailDosenComponent: No lecturer ID found in route parameters.');
      this.isLoading = false;
      this.lecturer = null;
    }

    this.route.queryParamMap.subscribe(params => {
      const page = params.get('page');
      this.currentPage = page ? parseInt(page, 10) : 1;
    });
  }

  loadLecturerDetails(id: number): void {
    this.dosenService.getDosenById(id)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (apiResponse) => {
          if (apiResponse.success && apiResponse.data) {
            this.lecturer = this.mapDosenDetailResponseToLecturer(apiResponse.data);
          } else {
            console.warn('DetailDosenComponent: Lecturer data not found for ID:', id, apiResponse);
            this.lecturer = null;
          }
        },
        error: (error) => {
          console.error('DetailDosenComponent: Error fetching lecturer details:', error);
          this.lecturer = null;
        }
      });
  }

  private mapDosenDetailResponseToLecturer(dosen: any): any {
    return {
      id: dosen.id,
      name: dosen.nama_dosen,
      lecturerCode: dosen.kode_dosen || '-',
      email: dosen.contact_person || '',
      jabatan: dosen.jabatan || '-',
      jabatanFungsionalAkademik: dosen.jfa || '-',
      home_base: dosen.homebase || '-',
      statusPegawai: dosen.status || '-',
      pendidikanTerakhir: dosen.pendidikan || null,
      nidn: dosen.nidn || '-',
      nip: dosen.nip || null,
      kelompokKeahlian: dosen.bidang_keahlian || '-',
    };
  }

  goBack(): void {
    if (this.currentPage > 1) {
      this.prevPage();
    } else {
      const userRole = this.authService.getCurrentRole()?.role_name;
      let basePath = '';
      if (userRole === 'ProgramStudi') {
        basePath = '/ketua-prodi';
      } else if (userRole === 'KelompokKeahlian') {
        basePath = '/ketua-kk';
      }

      if (basePath) {
        this.router.navigate([basePath, 'list-dosen']);
      } else {
        this.location.back();
      }
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePageInUrl();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePageInUrl();
    }
  }

  updatePageInUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage },
      queryParamsHandling: 'merge',
    });
  }

  viewTeachingHistory(): void {
    if (this.lecturerId) {
      const userRole = this.authService.getCurrentRole()?.role_name;
      let basePath = '';
      if (userRole === 'ProgramStudi') {
        basePath = '/ketua-prodi';
      } else if (userRole === 'KelompokKeahlian') {
        basePath = '/ketua-kk';
      }

      if (basePath) {
        this.router.navigate([basePath, 'riwayat-mengajar', this.lecturerId]);
      } else {
        console.error("Cannot determine user's base path for navigation.");
      }
    } else {
      console.error("Cannot navigate, lecturer ID is missing.");
    }
  }

  get pendidikanList(): string[] {
    if (Array.isArray(this.lecturer?.pendidikanTerakhir)) {
      return this.lecturer.pendidikanTerakhir;
    } else if (typeof this.lecturer?.pendidikanTerakhir === 'string') {
      return [this.lecturer.pendidikanTerakhir];
    } else {
      return [];
    }
  }
}