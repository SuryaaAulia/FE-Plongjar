import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent, ActionButtonComponent } from '../../../shared/components/index';
import { DosenService } from '../../../core/services/dosen.service';
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
  lecturer: any | null = null;
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