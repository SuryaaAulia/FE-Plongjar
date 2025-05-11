import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Lecturer } from '../models/user.model';

const MOCK_LECTURERS: Lecturer[] = [
    {
        id: '1',
        name: 'Dr. Budi Santoso',
        lecturerCode: 'D001',
        nidn: '1234567890',
        kelompokKeahlian: 'Software Engineering',
        statusPegawai: 'Active',
        jabatanFunctionalAkademik: ['Lektor Kepala'],
        department: 'Informatika',
    },
    {
        id: '2',
        name: 'Prof. Citra Dewi',
        lecturerCode: 'D002',
        nidn: '0987654321',
        kelompokKeahlian: 'Data Science',
        statusPegawai: 'Active',
        jabatanFunctionalAkademik: ['Guru Besar'],
        department: 'Sistem Informasi',
    },
];

@Injectable({
    providedIn: 'root',
})
export class LecturerService {
    constructor() { }

    getAllLecturers(): Observable<Lecturer[]> {
        return of(MOCK_LECTURERS).pipe(delay(500));
    }

    getLecturerByCode(code: string): Observable<Lecturer | undefined> {
        const lecturer = MOCK_LECTURERS.find((l) => l.lecturerCode === code);
        if (lecturer) {
            return of(lecturer).pipe(delay(300));
        } else {
            return throwError(() => new Error('Lecturer not found'));
        }
    }
}
