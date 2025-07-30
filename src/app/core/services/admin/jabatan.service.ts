import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from '../api.service';
import { JabatanStruktural } from '../../models/user.model';
import { DosenService, DosenListResponse } from '../dosen.service';

export interface JabatanAssignment {
    id_dosen: number;
    id_jabatan_struktural: number;
}

export interface JabatanCreateRequest {
    nama: string;
    konversi_sks: number;
}

export interface JabatanCreateResponse {
    success: boolean;
    message: string;
    data: JabatanStruktural;
}

export interface AssignmentResponse {
    success: boolean;
    message: string;
}

export interface ValidationErrorResponse {
    message: string;
    errors: {
        [key: string]: string[];
    };
}

export interface JabatanStrukturalResponse {
    id: number;
    nama_jabatan: string;
    deskripsi?: string;
}

@Injectable({
    providedIn: 'root'
})
export class JabatanService {
    constructor(private apiService: ApiService, private dosenService: DosenService) { }

    getAllJabatanStruktural(): Observable<JabatanStruktural[]> {

        return this.apiService.getAllJabatanStruktural().pipe(
            tap(response => {
            }),
            map((response: any) => {
                if (response && response.success && response.data) {
                    return response.data;
                } else if (response && Array.isArray(response)) {
                    return response;
                } else if (response && response.data && Array.isArray(response.data)) {
                    return response.data;
                } else {
                    console.warn('JabatanService: Unexpected response structure:', response);
                    return [];
                }
            }),
            catchError(error => {
                console.error('Error fetching jabatan struktural:', error);
                return this.handleError(error);
            })
        );
    }

    createJabatanStruktural(data: JabatanCreateRequest): Observable<JabatanCreateResponse> {
        return this.apiService.createJabatanStruktural(data).pipe(
            map((response: any) => {
                if (!response.success && !response.data) {
                    return {
                        success: true,
                        message: 'Jabatan created successfully',
                        data: response
                    };
                }
                return response;
            }),
            catchError(error => {
                console.error('Error creating jabatan struktural:', error);
                return this.handleError(error);
            })
        );
    }

    private handleError(error: any): Observable<never> {
        console.error('JabatanService: Handling error:', error);

        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
            errorMessage = error.error.message;
        } else {
            errorMessage = error.error?.message || error.message || `Error Code: ${error.status}`;
        }

        return throwError(error);
    }

    formatJabatanForSelect(jabatanList: JabatanStruktural[]): { value: number; label: string }[] {
        return jabatanList.map(jabatan => ({
            value: jabatan.id,
            label: jabatan.nama
        }));
    }

    findJabatanById(jabatanList: JabatanStruktural[], id: number): JabatanStruktural | null {
        return jabatanList.find(jabatan => jabatan.id === id) || null;
    }

    extractValidationErrors(error: any): { [key: string]: string[] } {
        if (error.error && error.error.errors) {
            return error.error.errors;
        }
        return {};
    }

    getFirstValidationError(errors: { [key: string]: string[] }, fieldName: string): string | null {
        if (errors[fieldName] && errors[fieldName].length > 0) {
            return errors[fieldName][0];
        }
        return null;
    }

    getDosenTanpaJabatanStruktural(): Observable<DosenListResponse> {
        return this.apiService.getDosenTanpaJabatan().pipe(
            map(response => this.dosenService.transformResponse(response)),
            catchError(error => this.handleError(error))
        );
    }

    getDosenDenganJabatanStruktural(): Observable<DosenListResponse> {
        return this.apiService.getDosenDenganJabatan().pipe(
            map(response => this.dosenService.transformResponse(response)),
            catchError(error => this.handleError(error))
        );
    }

    getDosenByJabatanStruktural(jabatanId: number): Observable<DosenListResponse> {
        return this.apiService.getDosenByJabatan(jabatanId).pipe(
            map(response => this.dosenService.transformResponse(response)),
            catchError(error => this.handleError(error))
        );
    }

    assignJabatanStruktural(dosenId: number, jabatanId: number): Observable<any> {
        const payload = {
            id_jabatan_struktural: jabatanId
        };

        return this.apiService.assignJabatanDosen(dosenId, payload).pipe(
            catchError(error => this.handleError(error))
        );
    }

    revokeJabatanStruktural(dosenId: number): Observable<any> {
        return this.apiService.revokeJabatanDosen(dosenId).pipe(
            catchError(error => this.handleError(error))
        );
    }
}