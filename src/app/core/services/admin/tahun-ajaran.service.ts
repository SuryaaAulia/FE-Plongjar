import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { TahunAjaran } from '../../models/user.model';
@Injectable({
    providedIn: 'root'
})
export class TahunAjaranService {

    private activeTahunAjaranSubject = new BehaviorSubject<TahunAjaran | null>(null);
    activeTahunAjaran$ = this.activeTahunAjaranSubject.asObservable();

    constructor(private apiService: ApiService) {
        this.loadInitialActiveTahunAjaran();
    }

    loadInitialActiveTahunAjaran(): void {
        this.apiService.getActiveTahunAjaran().subscribe(response => {
            if (response.success && response.data) {
                this.activeTahunAjaranSubject.next(response.data);
            }
        });
    }

    getAllTahunAjaran(): Observable<any> {
        return this.apiService.getAllTahunAjaran();
    }

    getActiveTahunAjaran(): Observable<any> {
        return this.apiService.getActiveTahunAjaran().pipe(
            tap(response => {
                if (response.success && response.data) {
                    this.activeTahunAjaranSubject.next(response.data);
                }
            })
        );
    }

    setActiveTahunAjaran(id: number): Observable<any> {
        return this.apiService.setActiveTahunAjaran(id).pipe(
            tap(response => {
                if (response.success && response.data) {
                    this.activeTahunAjaranSubject.next(response.data);
                }
            })
        );
    }

    createTahunAjaran(data: { tahun_ajaran: string; semester: string }): Observable<any> {
        return this.apiService.createTahunAjaran(data);
    }

    deleteTahunAjaran(id: number): Observable<any> {
        return this.apiService.deleteTahunAjaran(id);
    }
}
