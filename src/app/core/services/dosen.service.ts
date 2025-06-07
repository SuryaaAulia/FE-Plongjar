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

    getDosenById(id: number): Observable<{ success: boolean; message: string; data: DosenResponse }> {
        return this.apiService.getAllDosen()
            .pipe(
                map((response: any) => {
                    const dosen = response.data?.data?.find((d: DosenResponse) => d.id === id);
                    return {
                        success: true,
                        message: 'Dosen found',
                        data: dosen
                    };
                }),
            );
    }
}