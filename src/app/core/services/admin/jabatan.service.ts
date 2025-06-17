import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from '../api.service';
import { JabatanStruktural } from '../../models/user.model';

export interface JabatanAssignment {
    id_dosen: number;
    id_jabatan_struktural: number;
}

export interface JabatanCreateRequest {
    nama: string;
    konversi_sks: number;
}

export interface JabatanResponse {
    success: boolean;
    message: string;
    data: JabatanStruktural[];
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

@Injectable({
    providedIn: 'root'
})
export class JabatanService {
    constructor(private apiService: ApiService) { }

    getAllJabatanStruktural(): Observable<JabatanStruktural[]> {
        console.log('JabatanService: Fetching all jabatan struktural');

        return this.apiService.getAllJabatanStruktural().pipe(
            tap(response => {
                console.log('JabatanService: Raw API response:', response);
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
            tap(data => {
                console.log('JabatanService: Transformed jabatan data:', data);
            }),
            catchError(error => {
                console.error('Error fetching jabatan struktural:', error);
                return this.handleError(error);
            })
        );
    }

    createJabatanStruktural(data: JabatanCreateRequest): Observable<JabatanCreateResponse> {
        console.log('JabatanService: Creating jabatan struktural:', data);

        return this.apiService.createJabatanStruktural(data).pipe(
            tap(response => {
                console.log('JabatanService: Create response:', response);
            }),
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

    assignJabatanToDosen(assignment: JabatanAssignment): Observable<AssignmentResponse> {
        console.log('JabatanService: Assigning jabatan:', assignment);

        return this.apiService.assignJabatanDosen(assignment).pipe(
            tap(response => {
                console.log('JabatanService: Assignment response:', response);
            }),
            catchError(error => {
                console.error('Error assigning jabatan to dosen:', error);
                return this.handleError(error);
            })
        );
    }

    revokeJabatanFromDosen(dosenId: number): Observable<AssignmentResponse> {
        console.log('JabatanService: Revoking jabatan from dosen:', dosenId);

        const data = { id_dosen: dosenId };
        return this.apiService.revokeJabatanDosen(data).pipe(
            tap(response => {
                console.log('JabatanService: Revoke response:', response);
            }),
            catchError(error => {
                console.error('Error revoking jabatan from dosen:', error);
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
}