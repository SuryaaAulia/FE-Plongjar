import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';
import { KelompokKeahlian } from '../models/user.model';

export interface DosenResponse {
    id: number;
    name: string;
    lecturer_code: string;
    nip: string;
    nidn?: string | null;
    email?: string;
    jabatan_fungsional_akademik?: string;
    id_jabatan_struktural?: number;
    status_pegawai: string;
    pendidikan_terakhir?: string;
    id_kelompok_keahlian?: number;
    kelompok_keahlian?: KelompokKeahlian;
}

export interface DosenDetailResponse {
    id: number;
    nama_dosen: string;
    kode_dosen: string;
    nip: string;
    nidn?: string | null;
    contact_person?: string;
    jfa?: string;
    jabatan?: string;
    bidang_keahlian?: string;
    status: string;
    riwayat_pengajaran?: string;
    home_base?: string | null;
    pendidikan?: string;
}

export interface DosenListResponse {
    success: boolean;
    message: string;
    data: {
        data: DosenResponse[];
        current_page: number;
        first_page_url: string;
        from: number;
        last_page: number;
        links: any[];
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    };
}

export interface DosenListParams {
    page?: number;
    per_page?: number;
    search?: string;
}

export interface JabatanStrukturalResponse {
    id: number;
    nama_jabatan: string;
    deskripsi?: string;
}

export interface BebanSksResponse {
    id_dosen: number;
    nama_dosen: string;
    total_sks: number;
    detail_pengajaran: any[];
}

export interface RiwayatPengajaranResponse {
    id_dosen: number;
    nama_dosen: string;
    riwayat: any[];
}

@Injectable({
    providedIn: 'root'
})
export class DosenService {

    constructor(private apiService: ApiService) { }

    getAllDosen(params: DosenListParams = {}): Observable<DosenListResponse> {
        let httpParams = new HttpParams();

        if (params.page) httpParams = httpParams.set('page', params.page.toString());
        if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
        if (params.search && params.search.trim()) httpParams = httpParams.set('search', params.search.trim());

        return this.apiService.getAllDosen(httpParams).pipe(
            map(response => this.transformResponse(response)),
            catchError(error => this.handleError(error))
        );
    }

    getAllDosenByKK(kkId: number): Observable<DosenListResponse> {
        return this.apiService.getDosenByKK(kkId).pipe(
            map(response => this.transformResponse(response)),
            catchError(error => this.handleError(error))
        );
    }

    getAllDosenByKKAlt(kkId: number): Observable<DosenListResponse> {
        return this.apiService.getDosenByKKAlt(kkId).pipe(
            map(response => this.transformResponse(response)),
            catchError(error => this.handleError(error))
        );
    }

    getDosenTanpaJabatanStruktural(): Observable<DosenListResponse> {
        return this.apiService.getDosenTanpaJabatan().pipe(
            map(response => this.transformResponse(response)),
            catchError(error => this.handleError(error))
        );
    }

    getDosenDenganJabatanStruktural(): Observable<DosenListResponse> {
        return this.apiService.getDosenDenganJabatan().pipe(
            map(response => this.transformResponse(response)),
            catchError(error => this.handleError(error))
        );
    }

    getDosenByJabatanStruktural(jabatanId: number): Observable<DosenListResponse> {
        return this.apiService.getDosenByJabatan(jabatanId).pipe(
            map(response => this.transformResponse(response)),
            catchError(error => this.handleError(error))
        );
    }

    createDosen(dosenData: any): Observable<any> {
        return this.apiService.createDosen(dosenData).pipe(
            catchError(error => this.handleError(error))
        );
    }

    updateDosen(id: number, dosenData: any): Observable<any> {
        return this.apiService.updateDosen(id, dosenData).pipe(
            catchError(error => this.handleError(error))
        );
    }

    deleteDosen(id: number): Observable<any> {
        return this.apiService.deleteDosen(id).pipe(
            catchError(error => this.handleError(error))
        );
    }

    assignJabatanStruktural(data: { id_dosen: number; id_jabatan_struktural: number }): Observable<any> {
        return this.apiService.assignJabatanDosen(data).pipe(
            catchError(error => this.handleError(error))
        );
    }

    revokeJabatanStruktural(data: { id_dosen: number }): Observable<any> {
        return this.apiService.revokeJabatanDosen(data).pipe(
            catchError(error => this.handleError(error))
        );
    }

    getLaporanBebanSksDosen(tahunAjaranId: number): Observable<any> {
        return this.apiService.getLaporanBebanSksDosen(tahunAjaranId).pipe(
            catchError(error => this.handleError(error))
        );
    }

    getRiwayatPengajaran(dosenId: number): Observable<any> {
        return this.apiService.getRiwayatPengajaran(dosenId).pipe(
            catchError(error => this.handleError(error))
        );
    }

    getBebanSksDosenAktif(dosenId: number): Observable<any> {
        return this.apiService.getBebanSksDosenAktif(dosenId).pipe(
            catchError(error => this.handleError(error))
        );
    }

    getDosenById(id: number): Observable<{ success: boolean; message: string; data: DosenDetailResponse }> {
        return this.apiService.getDosenDetail(id).pipe(
            map(response => {
                if (response && (response.success || response.data)) {
                    const data = response.data || response;
                    if (data.id !== undefined || data.kode_dosen) {
                        return {
                            success: true,
                            message: 'Dosen detail found',
                            data: data as DosenDetailResponse
                        };
                    }
                }
                return {
                    success: false,
                    message: response?.message || 'Dosen detail not found',
                    data: null as any
                };
            }),
            catchError(error => this.handleError(error))
        );
    }

    private transformResponse(response: any): DosenListResponse {
        if (response && response.success !== undefined) {
            return response as DosenListResponse;
        } else if (response && response.data) {
            return {
                success: true,
                message: 'Data retrieved successfully',
                data: response.data
            };
        } else if (response && Array.isArray(response)) {
            return {
                success: true,
                message: 'Data retrieved successfully',
                data: {
                    data: response,
                    current_page: 1,
                    first_page_url: '',
                    from: 1,
                    last_page: 1,
                    links: [],
                    next_page_url: null,
                    path: '',
                    per_page: response.length,
                    prev_page_url: null,
                    to: response.length,
                    total: response.length
                }
            };
        } else if (response && response.current_page !== undefined) {
            return {
                success: true,
                message: 'Data retrieved successfully',
                data: response
            };
        } else {
            return {
                success: false,
                message: 'Unexpected response structure',
                data: {
                    data: [],
                    current_page: 1,
                    first_page_url: '',
                    from: 0,
                    last_page: 1,
                    links: [],
                    next_page_url: null,
                    path: '',
                    per_page: 10,
                    prev_page_url: null,
                    to: 0,
                    total: 0
                }
            };
        }
    }

    private handleError(error: any): Observable<any> {
        let errorMessage = 'An error occurred';
        if (error.error instanceof ErrorEvent) {
            errorMessage = error.error.message;
        } else {
            errorMessage = error.error?.message || error.message || `Error Code: ${error.status}`;
        }

        return throwError(() => ({
            success: false,
            message: errorMessage,
            data: null
        }));
    }
}
