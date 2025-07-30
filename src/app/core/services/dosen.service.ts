import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';
import { KelompokKeahlian, TahunAjaran } from '../models/user.model';

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
    nama_or_nip?: string;
    kode_dosen?: string;
}

export interface RiwayatPengajaranResponse {
    id_dosen: number;
    nama_dosen: string;
    riwayat: any[];
}
export interface BebanSksApiData {
    kode_dosen: string;
    nama_dosen: string;
    kelompok_keahlian: string;
    jfa: string;
    jabatan_struktural: string | null;
    sks_ekuivalen_jabatan: number;
    max_ajar_sks: number;
    status_pegawai: string;
    total_ajar_per_prodi: { [key: string]: number } | null;
    total_ajar_sks_keseluruhan: number;
    sisa_sks_mengajar: number;
}
export interface BebanSksApiResponse {
    success: boolean;
    message: string;
    data: {
        current_page: number;
        data: BebanSksApiData[];
        last_page: number;
        per_page: number;
        total: number;
    };
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

        if (params.nama_or_nip && params.nama_or_nip.trim()) {
            httpParams = httpParams.set('nama', params.nama_or_nip.trim());
        }
        if (params.kode_dosen && params.kode_dosen.trim()) {
            httpParams = httpParams.set('kode_dosen', params.kode_dosen.trim());
        }

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

    getLaporanBebanSksDosen(tahunAjaranId: number, params: DosenListParams = {}): Observable<BebanSksApiResponse> {
        let httpParams = new HttpParams();
        if (params.page) httpParams = httpParams.set('page', params.page.toString());
        if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
        if (params.nama_or_nip && params.nama_or_nip.trim()) {
            httpParams = httpParams.set('search', params.nama_or_nip.trim());
        }
        return this.apiService.getLaporanBebanSksDosen(tahunAjaranId, httpParams).pipe(
            catchError(error => this.handleError(error))
        );
    }

    getTahunAjaran(): Observable<TahunAjaran[]> {
        return this.apiService.getAllTahunAjaran().pipe(
            map((response: any) => response.data || []),
            catchError(error => this.handleError(error))
        );
    }

    getRiwayatPengajaran(dosenId: number): Observable<any> {
        return this.apiService.getRiwayatPengajaran(dosenId).pipe(
            catchError(error => this.handleError(error))
        );
    }

    getBebanSksDosenTahunAjaranAktif(dosenId: number): Observable<any> {
        return this.apiService.getBebanSksDosenTahunAjaranAktif(dosenId).pipe(
            catchError(error => this.handleError(error))
        );
    }

    getBebanSksDosenByTahun(dosenId: number, tahunAjaranId: number): Observable<BebanSksApiResponse> {
        return this.apiService.getBebanSksDosenByTahun(dosenId, tahunAjaranId).pipe(
            map((res: any) => {
                if (Array.isArray(res?.data?.data)) return res;
                return {
                    success: res.success,
                    message: res.message,
                    data: {
                        current_page: 1,
                        data: [res.data],
                        last_page: 1,
                        per_page: 1,
                        total: 1,
                    },
                } as BebanSksApiResponse;
            }),
            catchError((error) => this.handleError(error))
        );
    }

    getRiwayatPengajaranDosen(dosenId: number, params?: HttpParams): Observable<RiwayatPengajaranResponse> {
        return this.apiService.getRiwayatPengajaran(dosenId, params).pipe(
            map(response => {
                if (response && response.success) {
                    return {
                        id_dosen: response.data.id,
                        nama_dosen: response.data.nama_dosen,
                        riwayat: response.data.riwayat_pengajaran || []
                    };
                } else {
                    throw new Error(response?.message || 'Failed to fetch teaching history');
                }
            }),
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

    public transformResponse(response: any): DosenListResponse {
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
