import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Lecturer } from '../../../core/models/user.model';
import { LoadingSpinnerComponent, ActionButtonComponent } from '../../../shared/components/index';
import { DosenService, DosenDetailResponse } from '../../../core/services/dosen.service';
import { finalize } from 'rxjs/operators';

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
  lecturer: Lecturer | null = null;
  lecturerId: number | null = null;
  currentPage = 1;
  totalPages = 2;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private dosenService: DosenService
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

    const page = this.route.snapshot.queryParamMap.get('page');
    if (page) {
      this.currentPage = parseInt(page, 10);
    }
  }

  loadLecturerDetails(id: number): void {
    this.dosenService.getDosenById(id)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (apiResponse) => {
          console.log('DetailDosenComponent: API response from DosenService:', apiResponse);
          if (apiResponse.success && apiResponse.data && (apiResponse.data.kode_dosen || apiResponse.data.id)) {
            try {
              this.lecturer = this.mapDosenDetailResponseToLecturer(apiResponse.data);
              console.log('DetailDosenComponent: Mapped lecturer data:', this.lecturer);
            } catch (mappingError) {
              console.error('DetailDosenComponent: Error mapping DosenDetailResponse to Lecturer:', mappingError, apiResponse.data);
              this.lecturer = null;
            }
          } else {
            console.warn('DetailDosenComponent: Lecturer data not found or incomplete for ID:', id, apiResponse);
            this.lecturer = null;
          }
        },
        error: (error) => {
          console.error('DetailDosenComponent: Error fetching lecturer details from service:', error);
          this.lecturer = null;
        }
      });
  }

  private mapDosenDetailResponseToLecturer(dosen: DosenDetailResponse): Lecturer {
    if (!dosen || (!dosen.id && !dosen.kode_dosen)) {
      console.error('mapDosenDetailResponseToLecturer: Invalid "dosen" object received. Missing ID or Kode Dosen.', dosen);
      throw new Error('Invalid DosenDetailResponse: ID or Kode Dosen is missing.');
    }

    return {
      id: dosen.id,
      name: dosen.nama_dosen || '',
      lecturerCode: dosen.kode_dosen || '',
      email: dosen.contact_person || '',
      jabatanFunctionalAkademik: dosen.jabatan ? [dosen.jabatan] : [],
      statusPegawai: dosen.status || '',
      pendidikanTerakhir: dosen.pendidikan ? dosen.pendidikan.split(',').map(s => s.trim()) : [],
      department: dosen.home_base || '',
      nidn: dosen.nidn || '',
      nip: dosen.nip || '',
      kelompokKeahlian: dosen.bidang_keahlian || '',
      idJabatanStruktural: undefined,
      idKelompokKeahlian: undefined,
    };
  }

  goBack(): void {
    this.location.back();
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
}