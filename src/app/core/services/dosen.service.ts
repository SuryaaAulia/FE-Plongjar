import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

export interface KelompokKeahlian {
    id: number;
    nama: string;
    roleable_type: string;
    unit_type: string;
}
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
    bidang_keahlian?: string;
    contact_person?: string;
    home_base?: string | null;
    jabatan?: string;
    jfa?: string;
    kode_dosen: string;
    nama_dosen: string;
    nidn?: string | null;
    nip: string;
    pendidikan?: string;
    riwayat_pengajaran?: string;
    status: string;
    id: number;
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

@Injectable({
    providedIn: 'root'
})
export class DosenService {

    constructor(
        private apiService: ApiService
    ) { }

    getAllDosen(params: DosenListParams = {}): Observable<DosenListResponse> {
        let httpParams = new HttpParams();

        if (params.page) {
            httpParams = httpParams.set('page', params.page.toString());
        }

        if (params.per_page) {
            httpParams = httpParams.set('per_page', params.per_page.toString());
        }

        if (params.search && params.search.trim()) {
            httpParams = httpParams.set('search', params.search.trim());
        }
        return this.apiService.getAllDosen(httpParams)
            .pipe(
                map((response: any) => {
                    return this.transformResponse(response);
                }),
            );
    }

    private transformResponse(response: any): DosenListResponse {
        if (response && response.success) {
            return response as DosenListResponse;
        }
        return {
            success: true,
            message: response.message || 'Data retrieved successfully',
            data: response.data || response
        };
    }

    getDosenById(id: number): Observable<{ success: boolean; message: string; data: DosenDetailResponse }> {
        return this.apiService.getDosenDetail(id)
            .pipe(
                map((response: any) => {
                    console.log('DosenService: Raw API getDosenDetail response:', response);
                    if (response.success && response.data) {
                        if (response.data.id !== undefined && response.data.id !== null || response.data.kode_dosen) {
                            console.log('DosenService: Successfully found data for detail (ID/Kode Dosen available).');
                            return {
                                success: true,
                                message: 'Dosen detail found',
                                data: response.data as DosenDetailResponse
                            };
                        } else {
                            console.warn('DosenService: API response.data for detail is missing identifier (id or kode_dosen):', response.data);
                            return {
                                success: false,
                                message: 'Dosen detail data is incomplete (missing identifier).',
                                data: null as any
                            };
                        }
                    } else {
                        console.warn('DosenService: API response indicates failure or missing data for detail:', response);
                        return {
                            success: false,
                            message: response.message || 'Dosen detail not found or API error',
                            data: null as any
                        };
                    }
                })
            );
    }
}