import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Lecturer } from '../../../core/models/user.model';

@Component({
  selector: 'app-detail-dosen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-dosen.component.html',
  styleUrls: ['./detail-dosen.component.scss'],
})
export class DetailDosenComponent implements OnInit {
  lecturer: Lecturer | null = null;
  lecturerCode: string | null = null;
  currentPage = 1;
  totalPages = 2;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.lecturerCode = this.route.snapshot.paramMap.get('id');
    const page = this.route.snapshot.queryParamMap.get('page');
    if (page) {
      this.currentPage = parseInt(page, 10);
    }

    if (this.lecturerCode) {
      this.lecturer = {
        id: '1',
        name: 'Bambang Pamungkas, S.T., M.T.',
        lecturerCode: 'BPS',
        email: 'bambangp@telkomuniversity.ac.id',
        jabatanFunctionalAkademik: ['Ka.Prodi S1 Rekayasa Perangkat Lunak'],
        statusPegawai: 'Pegawai Tetap',
        department: 'S1 Rekayasa Perangkat Lunak',
        nidn: '65387947',
        kelompokKeahlian:
          'Data Science, Artificial Intelligence, Cyber Security',
      };
    }
  }

  goBack(): void {
    this.router.navigate(['/ketua-kk/list-dosen']);
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
