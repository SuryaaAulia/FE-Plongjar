import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { catchError, map } from 'rxjs/operators';
import { Course, TahunAjaran } from '../models/user.model';
import { HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';

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

export interface HasilPlottingRow {
    no: number;
    idMatkul: string;
    matkul: string;
    pic: string;
    dosen: string;
    mandatory: string;
    tingkatMatkul: string;
    kredit: number;
    kelas: string;
    praktikum: string;
    koordinator: string;
    semester: string;
    hourTarget: number;
    tahunAjaran: string;
    mkEksepsi: string;
    teamTeaching: string;
}
@Injectable({
    providedIn: 'root'
})

export class MatakuliahService {

    private authService = inject(AuthService);

    constructor(private apiService: ApiService) { }

    getAllCoursesAuthProdi(params: HttpParams): Observable<PaginatedCourses> {
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

    getDataMappingKelasMatkul(matkulId: number, tahunAjaranId: number): Observable<any> {
        return this.apiService.getDataMappingKelasMatkul(matkulId, tahunAjaranId).pipe(
            map(response => {
                if (response.success && response.data) {
                    return response.data;
                }
                throw new Error('Invalid response format for data mapping kelas matkul');
            }),
            catchError(this.handleError('Error fetching data mapping kelas matkul'))
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


    getCourses(params?: HttpParams): Observable<Course[]> {
        const currentRole = this.authService.getCurrentRole()?.role_name;

        let apiCall: Observable<any>;

        if (currentRole === 'KelompokKeahlian') {
            apiCall = this.apiService.getMatakuliahByAuthKK(params);
        } else {
            apiCall = this.apiService.getMatakuliahByAuthProdi(params);
        }
        return apiCall.pipe(
            map(response => {
                if (response.success && response.data) {
                    const coursesData = Array.isArray(response.data) ? response.data : response.data.data;

                    if (Array.isArray(coursesData)) {
                        return this.mapApiCoursesToCourses(coursesData);
                    }
                }
                throw new Error('Invalid response format for courses');
            }),
        );
    }

    getTahunAjaran(): Observable<TahunAjaran[]> {
        return this.apiService.getAllTahunAjaran().pipe(
            map((response: any) => response.data || []),
            catchError(this.handleError('Error fetching Tahun Ajaran'))
        );
    }

    getTahunAjaranKaurLAAK(): Observable<TahunAjaran[]> {
        return this.apiService.getAllTahunAjaranKaurLAAK().pipe(
            map((response: any) => response.data || []),
            catchError(this.handleError('Error fetching Tahun Ajaran Kaur LAAK'))
        );
    }

    getProgramStudi(): Observable<any[]> {
        return this.apiService.getAllProgramStudi().pipe(
            map((response: any) => response.data || []),
            catchError(this.handleError('Error fetching Program Studi'))
        );
    }

    getHasilPlottinganByProdi(tahunAjaranId: number, prodiId: number): Observable<{ data: HasilPlottingRow[] }> {
        return this.apiService.getHasilPlottinganByProdi(tahunAjaranId, prodiId).pipe(
            map(response => {
                if ((response.success || response.status === 'success') && response.data?.data) {
                    const mataKuliahMapped = this.mapApiResponseToMataKuliah(response.data.data);
                    return { data: mataKuliahMapped };
                }
                throw new Error('Invalid response format');
            }),
            catchError(this.handleError('Error loading hasil plottingan'))
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
            code: apiCourse.kode_matakuliah || apiCourse.kode_matkul || '-',
            sks: apiCourse.sks_matakuliah ?? 0,
            pic: apiCourse.pic_matakuliah || 'N/A',
            id_pic: apiCourse.id_pic ?? null,
            statusMatkul: apiCourse.mandatory_status,
            metodePerkuliahan: this.mapModePerkuliahan(apiCourse.mode_perkuliahan),
            praktikum: apiCourse.praktikum ? 'Ya' : 'Tidak',
            matakuliah_eksepsi: apiCourse.mk_eksepsi === 'ya' ? 'Ya' : 'Tidak',
            tingkat_matakuliah: apiCourse.tingkat_matakuliah || '-',
            mode_perkuliahan_key: apiCourse.mode_perkuliahan,
            tahun_ajaran: apiCourse.tahun_ajaran || '-',
            koordinator: apiCourse.kode_koordinator || '-',
        }));
    }

    private mapApiResponseToMataKuliah(apiData: any[]): HasilPlottingRow[] {
        return apiData.map((item) => {
            const [tahun, semester] = (item.tahun_ajaran || ' - ').split(' - ');
            return {
                no: 0,
                idMatkul: item.kode_matakuliah || '-',
                matkul: item.nama_matakuliah || '-',
                pic: item.pic_matakuliah || '-',
                dosen: item.kode_dosen_pengajar || '-',
                mandatory: item.mandatory_status === 'wajib_prodi' ? 'Wajib Prodi' : 'Pilihan',
                tingkatMatkul: item.tingkat_matakuliah || '-',
                kredit: item.sks_matakuliah || 0,
                kelas: item.nama_kelas || '-',
                praktikum: item.praktikum ? 'Ya' : 'Tidak',
                koordinator: item.kode_koordinator || '-',
                semester: semester || '-',
                hourTarget: item.hour_target || 0,
                tahunAjaran: tahun || '-',
                mkEksepsi: item.mk_eksepsi === 'ya' ? 'Ya' : 'Tidak',
                teamTeaching: item.team_teaching === 'Yes' ? 'Ya' : 'Tidak',
            };
        });
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
