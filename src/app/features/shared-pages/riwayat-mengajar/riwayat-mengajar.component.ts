import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { SearchHeaderComponent, PaginationComponent, TableComponent, TableColumn, LoadingSpinnerComponent, SearchNotFoundComponent, ActionButtonComponent } from '../../../shared/components/index';
import { TeachingRecord } from '../../../core/models/user.model';
import { DosenService } from '../../../core/services/dosen.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-riwayat-mengajar',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchHeaderComponent, PaginationComponent, TableComponent, LoadingSpinnerComponent, SearchNotFoundComponent, ActionButtonComponent],
  templateUrl: './riwayat-mengajar.component.html',
  styleUrls: ['./riwayat-mengajar.component.scss']
})
export class RiwayatMengajarComponent implements OnInit {
  paginatedRecords: TeachingRecord[] = [];
  isLoading = true;
  error: string | null = null;
  currentPage = 1;
  itemsPerPage = 9;
  totalItems = 0;

  lecturerId: number | null = null;
  lecturerName: string = '';
  currentSearchQuery1: string = '';
  currentSearchQuery2: string = '';

  tableColumns: TableColumn<TeachingRecord>[] = [
    { key: 'subject', header: 'Mata Kuliah', width: 'col-subject' },
    { key: 'pic', header: 'PIC', width: 'col-pic' },
    { key: 'class_type', header: 'Metode', width: 'col-metode' },
    { key: 'class', header: 'Kelas', width: 'col-kelas' },
    { key: 'quota', header: 'Kuota', width: 'col-kuota' },
    { key: 'period', header: 'Periode', width: 'col-periode' },
  ];

  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private dosenService = inject(DosenService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.notificationService.showError('Lecturer ID not provided in route.');
      this.isLoading = false;
      return;
    }
    this.lecturerId = +idParam;
    this.loadInitialData();
  }

  loadInitialData(): void {
    if (!this.lecturerId) return;
    this.isLoading = true;
    forkJoin({
      lecturer: this.dosenService.getDosenById(this.lecturerId),
      history: this.fetchHistoryPage(this.lecturerId, 1)
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: ({ lecturer, history }) => {
        this.lecturerName = lecturer.data?.nama_dosen || 'Unknown Lecturer';
        this.handleHistoryResponse(history);
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  loadHistory(): void {
    if (!this.lecturerId) return;
    this.isLoading = true;
    this.fetchHistoryPage(this.lecturerId, this.currentPage).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => this.handleHistoryResponse(response),
      error: (err) => this.handleError(err)
    });
  }

  private fetchHistoryPage(dosenId: number, page: number) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', this.itemsPerPage.toString());

    if (this.currentSearchQuery1 || this.currentSearchQuery2) {
      const search = `${this.currentSearchQuery1} ${this.currentSearchQuery2}`.trim();
      params = params.set('search', search);
    }


    return this.dosenService.getRiwayatPengajaranDosen(dosenId, params);
  }

  private handleHistoryResponse(response: any): void {
    if (response.success && response.data) {
      this.paginatedRecords = this.mapApiResponseToTeachingRecords(response.data.data);
      this.totalItems = response.data.total;
      this.currentPage = response.data.current_page;
    } else {
      this.paginatedRecords = [];
      this.totalItems = 0;
    }
  }

  private mapApiResponseToTeachingRecords(records: any[]): TeachingRecord[] {
    return records.map(record => ({
      id: record.id_plotting || record.id,
      subject: record.nama_matakuliah,
      pic: record.pic_matakuliah,
      class_type: record.online_onsite,
      class: record.kelas,
      quota: record.kuota,
      period: record.periode,
    }));
  }

  private handleError(err: any): void {
    console.error("Error loading teaching history:", err);
    this.notificationService.showError('Failed to load teaching history data.');
    this.paginatedRecords = [];
    this.totalItems = 0;
  }

  onSearch(searchQuery: { query1: string; query2: string }): void {
    this.currentSearchQuery1 = searchQuery.query1;
    this.currentSearchQuery2 = searchQuery.query2;
    this.currentPage = 1;
    this.loadHistory();
  }

  onItemsPerPageChange(count: number): void {
    this.itemsPerPage = count;
    this.currentPage = 1;
    this.loadHistory();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadHistory();
  }

  goBack(): void {
    this.location.back();
  }
}