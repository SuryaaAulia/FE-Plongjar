import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Course, Lecturer } from '../models/user.model';

export interface PlottingData {
    course: Course;
    academicYear: string;
    coordinator: Lecturer | null;
    classAssignments: ClassAssignment[];
}

export interface AssignDosenRequest {
    id_plotting: number;
    id_dosen: number;
}

export interface ClassAssignment {
    no: number;
    kelas: string;
    dosen: Lecturer | null;
    praktikum: 'YES' | 'NO';
    kuota: number;
    kredit: number;
    pic: string;
    semester: string;
    onlineOnsite: 'ONLINE' | 'ONSITE';
}

export interface SubmitPlottingRequest {
    matakuliah_id: number;
    tahun_ajaran_id: number;
    koordinator_id: number;
    program_studi_id?: number;
    class_assignments: {
        kelas: string;
        dosen_id: number;
        praktikum: boolean;
        kuota: number;
        kredit: number;
        pic: string;
        semester: string;
        mode: 'online' | 'onsite';
    }[];
}

@Injectable({
    providedIn: 'root'
})
export class PlottingService {

    constructor(private apiService: ApiService) { }
    getCoursesByAuthProdi(): Observable<Course[]> {
        return this.apiService.getMatakuliahByAuthProdi().pipe(
            map(response => {
                if (response.success && response.data && response.data.data) {
                    return this.mapApiCoursesToCourses(response.data.data);
                }
                throw new Error('Invalid response format');
            }),
            catchError(error => {
                console.error('Error loading courses:', error);
                return throwError(() => error);
            })
        );
    }

    getAllProgramStudi(): Observable<any[]> {
        return this.apiService.getAllProgramStudi().pipe(
            map(response => {
                if (response.status === 'success' && response.data) {
                    return response.data;
                }
                throw new Error('Invalid response format');
            }),
            catchError(error => {
                console.error('Error loading programs:', error);
                return throwError(() => error);
            })
        );
    }

    getAcademicYears(): Observable<any[]> {
        return this.apiService.getAllTahunAjaran().pipe(
            map(response => {
                if (response.success && response.data) {
                    return response.data;
                }
                throw new Error('Invalid response format');
            }),
            catchError(error => {
                console.error('Error loading academic years:', error);
                return throwError(() => error);
            })
        );
    }

    getClassMappings(courseId: number, academicYearId: number, prodiId?: number): Observable<any[]> {
        const apiCall = prodiId
            ? this.apiService.getMappingByMatkulTahunProdi(courseId, academicYearId, prodiId)
            : this.apiService.getMappingByMatkulTahun(courseId, academicYearId);

        return apiCall.pipe(
            map(response => response.data || []),
            catchError(error => {
                console.error('Error loading class mappings:', error);
                return throwError(() => error);
            })
        );
    }

    getLecturersByKK(kkId: number): Observable<Lecturer[]> {
        return this.apiService.getDosenByKK(kkId).pipe(
            map(response => {
                if (response.success && response.data) {
                    return response.data;
                }
                throw new Error('Invalid response format');
            }),
            catchError(error => {
                console.error('Error loading lecturers:', error);
                return throwError(() => error);
            })
        );
    }

    assignLecturerToClassMapping(payload: { id_dosen: number; id_mapping_kelas_matakuliah: number; beban_sks: number }): Observable<any> {
        return this.apiService.createPlottinganPengajaran(payload).pipe(
            catchError(error => {
                console.error('Error assigning lecturer to class mapping:', error);
                return throwError(() => error);
            })
        );
    }

    assignCoordinator(data: any): Observable<any> {
        return this.apiService.assignKoordinatorByProdiAuth(data).pipe(
            catchError(error => {
                console.error('Error assigning coordinator:', error);
                return throwError(() => error);
            })
        );
    }

    assignDosenToPlotting(data: AssignDosenRequest): Observable<any> {
        const payload = { id_dosen: data.id_dosen };
        return this.apiService.updatePlottinganPengajaran(data.id_plotting, payload).pipe(
            catchError(error => {
                console.error('Error assigning dosen:', error);
                return throwError(() => error);
            })
        );
    }

    private mapApiCoursesToCourses(apiCourses: any[]): Course[] {
        return apiCourses.map(apiCourse => ({
            id: apiCourse.kode_matkul || apiCourse.id.toString(),
            name: apiCourse.nama_matakuliah || apiCourse.name,
            code: apiCourse.kode_matkul || apiCourse.code,
            sks: apiCourse.sks || 0,
            pic: apiCourse.id_pic,
            statusMatkul: apiCourse.mandatory_status,
            metodePerkuliahan: this.mapModePerkuliahan(apiCourse.mode_perkuliahan) || 'Daring',
            praktikum: apiCourse.praktikum === 1 || apiCourse.praktikum === true ? 'Ya' : 'Tidak'
        }));
    }

    private mapModePerkuliahan(mode: string): string {
        const modeMapping: { [key: string]: string } = {
            'onsite': 'Luring',
            'online': 'Daring',
            'hybrid': 'Hybrid'
        };
        return modeMapping[mode] || 'Daring';
    }
}