import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Course, Lecturer } from '../models/user.model';
import { AuthService } from './auth.service';
import { HttpParams } from '@angular/common/http';
import { PlottingProgressData } from '../../features/shared-pages/progress-plotting/progress-plotting.component';
import { CourseDetail } from '../../shared/components/index';

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

interface ProgressApiResponse {
    success: boolean;
    data: {
        jumlah_selesai: number;
        persentase_selesai: number;
        jumlah_sedang: number;
        persentase_sedang: number;
        jumlah_belum: number;
        persentase_belum: number;
        detail_progress: {
            selesai_diplotting: any[];
            sedang_diplotting: any[];
            belum_diplotting: any[];
        };
    };
}

@Injectable({
    providedIn: 'root'
})
export class PlottingService {

    constructor(private apiService: ApiService, private authService: AuthService) { }

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
        const currentRole = this.authService.getCurrentRole()?.role_name;
        if (currentRole === 'KelompokKeahlian') {
            return this.apiService.assignKoordinatorByProdi(data).pipe(
                catchError(error => {
                    console.error('Error assigning coordinator for KK role:', error);
                    return throwError(() => error);
                })
            );
        }
        return this.apiService.assignKoordinatorByProdiAuth(data).pipe(
            catchError(error => {
                console.error('Error assigning coordinator for Auth Role:', error);
                return throwError(() => error);
            })
        );
    }

    unassignCoordinator(data: any): Observable<any> {
        return this.apiService.deleteKoordinatorMatakuliah(data).pipe(
            catchError(error => {
                console.error('Error unassigning coordinator:', error);
                return throwError(() => new Error('Failed to unassign coordinator.'));
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

    getProgressPlotting(prodiId?: number): Observable<PlottingProgressData[]> {
        const currentRole = this.authService.getCurrentRole()?.role_name;
        let apiCall: Observable<any>;

        if (currentRole === 'KelompokKeahlian' && prodiId) {
            apiCall = this.apiService.getProgressPlottingKK(prodiId);
        } else if (currentRole === 'ProgramStudi') {
            apiCall = this.apiService.getProgressPlottingProdi();
        } else {
            return of([]);
        }

        return apiCall.pipe(
            map(response => this.mapApiResponseToProgressData(response)),
            catchError(err => {
                console.error('Failed to fetch plotting progress:', err);
                return of([]);
            })
        );
    }


    private mapApiResponseToProgressData(response: ProgressApiResponse): PlottingProgressData[] {
        if (!response.success || !response.data) {
            return [];
        }

        const data = response.data;

        const SelesaiCard: PlottingProgressData = {
            statusTitle: 'Selesai di Plotting',
            courseCount: data.jumlah_selesai || 0,
            percentage: data.persentase_selesai || 0,
            statusType: 'completed',
            courseList: this.mapCourseDetails(data.detail_progress.selesai_diplotting)
        };

        const SedangCard: PlottingProgressData = {
            statusTitle: 'Sedang di Plotting',
            courseCount: data.jumlah_sedang || 0,
            percentage: data.persentase_sedang || 0,
            statusType: 'in-progress',
            courseList: this.mapCourseDetails(data.detail_progress.sedang_diplotting)
        };

        const BelumCard: PlottingProgressData = {
            statusTitle: 'Belum di Plotting',
            courseCount: data.jumlah_belum || 0,
            percentage: data.persentase_belum || 0,
            statusType: 'not-plotted',
            courseList: this.mapCourseDetails(data.detail_progress.belum_diplotting)
        };

        return [BelumCard, SedangCard, SelesaiCard];
    }

    private mapCourseDetails(details: any[]): CourseDetail[] {
        if (!details) return [];
        return details.map(item => ({
            name: item.nama_matakuliah,
            classCount: item.total_kelas,
            sks: item.sks || 0
        }));
    }

    unassignDosenFromPlotting(plottinganPengajaranId: number): Observable<any> {
        return this.apiService.unassignDosenFromPlotting(plottinganPengajaranId).pipe(
            catchError(error => {
                console.error('Error unassigning dosen from plotting:', error);
                return throwError(() => error);
            })
        );
    }

    getPlottinganSummary(params: HttpParams): Observable<any> {
        return this.apiService.getHasilPlottinganKaurLAAK(params).pipe(
            map(response => {
                if (response.success && response.data) {
                    return response.data;
                }
                throw new Error('Invalid response format for plotting summary');
            })
        );
    }
}