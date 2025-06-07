import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Endpoint } from './endpoint';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private endpoint = new Endpoint();

    constructor(private http: HttpClient) { }

    login(email: string, password: string): Observable<any> {
        const url = this.endpoint.getUrl('auth', 'login');
        return this.http.post(url!, { email, password });
    }

    register(userData: any): Observable<any> {
        const url = this.endpoint.getUrl('auth', 'register');
        return this.http.post(url!, userData);
    }

    logout(): Observable<any> {
        const url = this.endpoint.getUrl('auth', 'logout');
        return this.http.post(url!, {});
    }

    getCurrentUser(): Observable<any> {
        const url = this.endpoint.getUrl('auth', 'user');
        return this.http.get(url!);
    }

    getAllRoles(): Observable<any> {
        const url = this.endpoint.getUrl('roles', 'get_all_roles');
        return this.http.get(url!);
    }

    getAllUsers(): Observable<any> {
        const url = this.endpoint.getUrl('roles', 'get_all_users');
        return this.http.get(url!);
    }

    getAllAssignedUserRoles(): Observable<any> {
        const url = this.endpoint.getUrl('roles', 'get_all_assigned_user_roles');
        return this.http.get(url!);
    }

    getAllUnassignedUsers(): Observable<any> {
        const url = this.endpoint.getUrl('roles', 'get_all_unassigned_users');
        return this.http.get(url!);
    }

    getAllUsersByRole(roleId: number): Observable<any> {
        const url = this.endpoint.getUrl('roles', 'get_all_user_by_role', { roleId });
        return this.http.get(url!);
    }

    assignRole(data: any): Observable<any> {
        const url = this.endpoint.getUrl('roles', 'assign_role');
        return this.http.post(url!, data);
    }

    revokeRole(data: any): Observable<any> {
        const url = this.endpoint.getUrl('roles', 'revoke_role');
        return this.http.post(url!, data);
    }

    addPic(picData: any): Observable<any> {
        const url = this.endpoint.getUrl('pic', 'add');
        return this.http.post(url!, picData);
    }

    getAllPic(): Observable<any> {
        const url = this.endpoint.getUrl('pic', 'get_all');
        return this.http.get(url!);
    }

    addDosen(dosenData: any): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'add');
        return this.http.post(url!, dosenData);
    }

    getAllDosen(params?: HttpParams): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'get_all');
        if (!url) {
            console.error('URL for getAllDosen is not defined');
            return new Observable();
        }
        return this.http.get(url, { params: params });
    }

    getDosenByKK(kkId: number): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'get_by_kk', { kkId });
        return this.http.get(url!);
    }

    getDosenDetail(dosenId: number): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'get_detail', { dosenId });
        return this.http.get(url!);
    }

    createDosen(data: any): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'resource');
        return this.http.post(url!, data);
    }

    getDosenById(id: number): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'show', { id });
        return this.http.get(url!);
    }

    updateDosen(id: number, data: any): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'update', { id });
        return this.http.put(url!, data);
    }

    deleteDosen(id: number): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'delete', { id });
        return this.http.delete(url!);
    }

    assignJabatanDosen(data: any): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'assign_jabatan');
        return this.http.post(url!, data);
    }

    revokeJabatanDosen(data: any): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'revoke_jabatan');
        return this.http.post(url!, data);
    }

    getAllMatakuliah(): Observable<any> {
        const url = this.endpoint.getUrl('matakuliah', 'get_all');
        return this.http.get(url!);
    }

    createMatakuliah(data: any): Observable<any> {
        const url = this.endpoint.getUrl('matakuliah', 'resource');
        return this.http.post(url!, data);
    }

    getMatakuliahById(id: number): Observable<any> {
        const url = this.endpoint.getUrl('matakuliah', 'show', { id });
        return this.http.get(url!);
    }

    updateMatakuliah(id: number, data: any): Observable<any> {
        const url = this.endpoint.getUrl('matakuliah', 'update', { id });
        return this.http.put(url!, data);
    }

    deleteMatakuliah(id: number): Observable<any> {
        const url = this.endpoint.getUrl('matakuliah', 'delete', { id });
        return this.http.delete(url!);
    }

    getAllProgramStudi(): Observable<any> {
        const url = this.endpoint.getUrl('program_studi', 'get_all');
        return this.http.get(url!);
    }

    getAllKelompokKeahlian(): Observable<any> {
        const url = this.endpoint.getUrl('kelompok_keahlian', 'get_all');
        return this.http.get(url!);
    }

    getAllMappingKelasMatkul(): Observable<any> {
        const url = this.endpoint.getUrl('mapping_kelas_matkul', 'resource');
        return this.http.get(url!);
    }

    createMappingKelasMatkul(data: any): Observable<any> {
        const url = this.endpoint.getUrl('mapping_kelas_matkul', 'resource');
        return this.http.post(url!, data);
    }

    getMappingByMatkulId(matkulId: number): Observable<any> {
        const url = this.endpoint.getUrl('mapping_kelas_matkul', 'get_by_matkul_id', { matkulId });
        return this.http.get(url!);
    }

    getMappingByMatakuliah(matkulId: number): Observable<any> {
        const url = this.endpoint.getUrl('mapping_kelas_matkul', 'get_by_matakuliah', { matkulId });
        return this.http.get(url!);
    }

    getMappingKelasByMatkulId(id: number): Observable<any> {
        const url = this.endpoint.getUrl('mapping_kelas_matkul', 'show', { id });
        return this.http.get(url!);
    }

    updateMappingKelasMatkul(id: number, data: any): Observable<any> {
        const url = this.endpoint.getUrl('mapping_kelas_matkul', 'update', { id });
        return this.http.put(url!, data);
    }

    deleteMappingKelasMatkul(id: number): Observable<any> {
        const url = this.endpoint.getUrl('mapping_kelas_matkul', 'delete', { id });
        return this.http.delete(url!);
    }

    getAllKoordinatorMatakuliah(): Observable<any> {
        const url = this.endpoint.getUrl('koordinator_matakuliah', 'resource');
        return this.http.get(url!);
    }

    createKoordinatorMatakuliah(data: any): Observable<any> {
        const url = this.endpoint.getUrl('koordinator_matakuliah', 'resource');
        return this.http.post(url!, data);
    }

    getKoordinatorMatakuliahById(id: number): Observable<any> {
        const url = this.endpoint.getUrl('koordinator_matakuliah', 'show', { id });
        return this.http.get(url!);
    }

    updateKoordinatorMatakuliah(id: number, data: any): Observable<any> {
        const url = this.endpoint.getUrl('koordinator_matakuliah', 'update', { id });
        return this.http.put(url!, data);
    }

    deleteKoordinatorMatakuliah(id: number): Observable<any> {
        const url = this.endpoint.getUrl('koordinator_matakuliah', 'delete', { id });
        return this.http.delete(url!);
    }

    getAllTahunAjaran(): Observable<any> {
        const url = this.endpoint.getUrl('tahun_ajaran', 'resource');
        return this.http.get(url!);
    }

    createTahunAjaran(data: any): Observable<any> {
        const url = this.endpoint.getUrl('tahun_ajaran', 'resource');
        return this.http.post(url!, data);
    }

    getTahunAjaranById(id: number): Observable<any> {
        const url = this.endpoint.getUrl('tahun_ajaran', 'show', { id });
        return this.http.get(url!);
    }

    updateTahunAjaran(id: number, data: any): Observable<any> {
        const url = this.endpoint.getUrl('tahun_ajaran', 'update', { id });
        return this.http.put(url!, data);
    }

    deleteTahunAjaran(id: number): Observable<any> {
        const url = this.endpoint.getUrl('tahun_ajaran', 'delete', { id });
        return this.http.delete(url!);
    }

    getAllJabatanStruktural(): Observable<any> {
        const url = this.endpoint.getUrl('jabatan_struktural', 'resource');
        return this.http.get(url!);
    }

    createJabatanStruktural(data: any): Observable<any> {
        const url = this.endpoint.getUrl('jabatan_struktural', 'resource');
        return this.http.post(url!, data);
    }

    getJabatanStrukturalById(id: number): Observable<any> {
        const url = this.endpoint.getUrl('jabatan_struktural', 'show', { id });
        return this.http.get(url!);
    }

    updateJabatanStruktural(id: number, data: any): Observable<any> {
        const url = this.endpoint.getUrl('jabatan_struktural', 'update', { id });
        return this.http.put(url!, data);
    }

    deleteJabatanStruktural(id: number): Observable<any> {
        const url = this.endpoint.getUrl('jabatan_struktural', 'delete', { id });
        return this.http.delete(url!);
    }
    get(namespace: string, key: string, context?: any): Observable<any> {
        const url = this.endpoint.getUrl(namespace as any, key as any, context);
        if (!url) {
            throw new Error(`Invalid endpoint: ${namespace}.${key}`);
        }
        return this.http.get(url);
    }

    post(namespace: string, key: string, data: any, context?: any): Observable<any> {
        const url = this.endpoint.getUrl(namespace as any, key as any, context);
        if (!url) {
            throw new Error(`Invalid endpoint: ${namespace}.${key}`);
        }
        return this.http.post(url, data);
    }

    put(namespace: string, key: string, data: any, context?: any): Observable<any> {
        const url = this.endpoint.getUrl(namespace as any, key as any, context);
        if (!url) {
            throw new Error(`Invalid endpoint: ${namespace}.${key}`);
        }
        return this.http.put(url, data);
    }

    delete(namespace: string, key: string, context?: any): Observable<any> {
        const url = this.endpoint.getUrl(namespace as any, key as any, context);
        if (!url) {
            throw new Error(`Invalid endpoint: ${namespace}.${key}`);
        }
        return this.http.delete(url);
    }
}