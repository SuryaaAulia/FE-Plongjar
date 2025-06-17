import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface Pic {
    id: number;
    name: string;
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

    getMataKuliah() {
        return this.apiService.getAllMatakuliah();
    }

    getTahunAjaran() {
        return this.apiService.getAllTahunAjaran();
    }

    getProgramStudi() {
        return this.apiService.getAllProgramStudi();
    }

    submitMapping(payload: any): Observable<any> {
        return this.apiService.createMappingKelasMatkul(payload);
    }
}