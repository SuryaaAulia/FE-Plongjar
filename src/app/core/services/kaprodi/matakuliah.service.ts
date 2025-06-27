import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { catchError, map } from 'rxjs/operators';
import { Course, TahunAjaran, PaginatedUsers } from '../../../core/models/user.model';
import { HttpParams } from '@angular/common/http';

export interface Pic {
    id: number;
    name: string;
}

export interface PaginatedCourses {
    current_page: number;
    data: Course[];
    total: number;
    per_page: number;
}

export interface CreateMatakuliahPayload {
    nama_matakuliah: string;
    kode_matkul: string;
    sks: number;
    praktikum: boolean;
    id_pic: number;
    mandatory_status: string;
    mode_perkuliahan: string;
    matakuliah_eksepsi: string;
    tingkat_matakuliah: string;
}

@Injectable({
    providedIn: 'root'
})
export class MatakuliahService {

    constructor(private apiService: ApiService) { }

    getAllCourses(params: HttpParams): Observable<PaginatedCourses> {
        return this.apiService.getMatakuliahByAuthProdi(params).pipe(
            map(response => {
                if (response.success && response.data) {
                    const paginatedData = response.data;
                    return {
                        current_page: paginatedData.current_page,
                        data: this.mapApiCoursesToCourses(paginatedData.data),
                        total: paginatedData.total,
                        per_page: paginatedData.per_page,
                    };
                }
                throw new Error('Invalid response format for courses');
            }),
            catchError(this.handleError('Error loading courses'))
        );
    }

    getAllCoursesByPicAndAllKK(): Observable<Course[]> {
        return this.apiService.getMatakuliahByPicAndAllKK().pipe(
            map(response => {
                if (response.success && response.data) {
                    return this.mapApiCoursesToCourses(response.data);
                }
                throw new Error('Invalid response format for courses by PIC');
            }),
            catchError(this.handleError('Error loading courses by PIC'))
        );
    }

    getCourseById(id: number): Observable<any> {
        return this.apiService.getMatakuliahById(id).pipe(
            map(response => {
                if (response.success && response.data) {
                    return this.mapApiCoursesToCourses([response.data])[0];
                }
                throw new Error(`Course with id ${id} not found`);
            }),
            catchError(this.handleError(`Error fetching course with id ${id}`))
        );
    }

    createMatakuliah(payload: CreateMatakuliahPayload): Observable<any> {
        return this.apiService.createMatakuliah(payload).pipe(
            catchError(this.handleError('Error creating course'))
        );
    }

    updateMatakuliah(id: number, payload: CreateMatakuliahPayload): Observable<any> {
        return this.apiService.updateMatakuliah(id, payload).pipe(
            catchError(this.handleError(`Error updating course with id ${id}`))
        );
    }

    deleteMatakuliah(id: number, password: string): Observable<any> {
        return this.apiService.deleteMatakuliah(id, { password }).pipe(
            catchError(this.handleError(`Error deleting course with id ${id}`))
        );
    }

    getAllPics(): Observable<Pic[]> {
        return this.apiService.getAllPic().pipe(
            map(response => {
                if (Array.isArray(response)) {
                    return response;
                } else {
                    return [];
                }
            }),
            catchError(this.handleError('Error fetching PICs'))
        );
    }


    getCoursesByAuthProdi(): Observable<Course[]> {
        return this.apiService.getMatakuliahByAuthProdi().pipe(
            map(response => {
                if (response.success && response.data && response.data.data) {
                    return this.mapApiCoursesToCourses(response.data.data);
                }
                throw new Error('Invalid response format');
            }),
            catchError(this.handleError('Error loading courses by auth prodi'))
        );
    }

    getTahunAjaran(): Observable<TahunAjaran[]> {
        return this.apiService.getAllTahunAjaran().pipe(
            map((response: any) => response.data || []),
            catchError(this.handleError('Error fetching Tahun Ajaran'))
        );
    }

    getProgramStudi(): Observable<any[]> {
        return this.apiService.getAllProgramStudi().pipe(
            map((response: any) => response.data || []),
            catchError(this.handleError('Error fetching Program Studi'))
        );
    }

    getHasilPlottinganByProdi(tahunAjaranId: number, prodiId: number): Observable<any> {
        return this.apiService.getHasilPlottinganByProdi(tahunAjaranId, prodiId).pipe(
            catchError(this.handleError('Error fetching hasil plottingan by prodi'))
        );
    }

    exportPlottinganByProdi(tahunAjaranId: number, prodiId: number): Observable<Blob> {
        return this.apiService.exportPlottinganByProdi(tahunAjaranId, prodiId).pipe(
            catchError(this.handleError('Error exporting plottingan by prodi'))
        );
    }


    submitMapping(payload: any): Observable<any> {
        return this.apiService.createMappingKelasMatkul(payload).pipe(
            map((response: any) => response),
            catchError(this.handleError('Error submitting mapping'))
        );
    }

    private mapApiCoursesToCourses(apiCourses: any[]): Course[] {
        return apiCourses.map(apiCourse => ({
            id: apiCourse.id,
            name: apiCourse.nama_matakuliah,
            code: apiCourse.kode_matkul,
            sks: apiCourse.sks,
            pic: apiCourse.pic ? apiCourse.pic.name : 'N/A',
            id_pic: apiCourse.id_pic,
            statusMatkul: apiCourse.mandatory_status,
            metodePerkuliahan: this.mapModePerkuliahan(apiCourse.mode_perkuliahan),
            praktikum: apiCourse.praktikum === 1 ? 'Ya' : 'Tidak',
            matakuliah_eksepsi: apiCourse.matakuliah_eksepsi,
            tingkat_matakuliah: apiCourse.tingkat_matakuliah,
            mode_perkuliahan_key: apiCourse.mode_perkuliahan,
        }));
    }

    private mapModePerkuliahan(mode: string): string {
        const modeMapping: { [key: string]: string } = {
            'onsite': 'Luring (Onsite)',
            'online': 'Daring (Online)',
            'hybrid': 'Hybrid'
        };
        return modeMapping[mode] || 'N/A';
    }

    private handleError(operation = 'operation') {
        return (error: any): Observable<any> => {
            console.error(`${operation} failed:`, error);
            return throwError(() => error);
        };
    }
}
