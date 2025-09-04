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

    // =================================================================
    // AUTH METHODS
    // =================================================================
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

    // =================================================================
    // ROLE MANAGEMENT METHODS
    // =================================================================
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

    getAllUsersByRole(roleId: number, params?: HttpParams): Observable<any> {
        const url = this.endpoint.getUrl('roles', 'get_all_user_by_role', { roleId });
        return this.http.get(url!, { params: params });
    }

    assignRole(roleId: number, data: { user_id: number }): Observable<any> {
        const url = this.endpoint.getUrl('roles', 'assign_role', { roleId });
        return this.http.post(url!, data);
    }

    revokeRole(roleId: number, userId: number): Observable<any> {
        const url = this.endpoint.getUrl('roles', 'revoke_role', { roleId, userId });
        return this.http.delete(url!);
    }

    assignScopedRole(data: any): Observable<any> {
        const url = this.endpoint.getUrl('roles', 'assign_scoped_role');
        return this.http.post(url!, data);
    }

    // =================================================================
    // PIC MANAGEMENT METHODS
    // =================================================================
    addPic(picData: any): Observable<any> {
        const url = this.endpoint.getUrl('pic', 'add');
        return this.http.post(url!, picData);
    }

    getAllPic(): Observable<any> {
        const url = this.endpoint.getUrl('pic', 'get_all');
        return this.http.get(url!);
    }

    // =================================================================
    // DOSEN MANAGEMENT METHODS
    // =================================================================
    addDosen(dosenData: any): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'add');
        return this.http.post(url!, dosenData);
    }

    getAllDosen(params?: HttpParams): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'get_all');
        return this.http.get(url!, { params: params });
    }

    getDosenByKK(kkId: number): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'get_by_kk', { kkId });
        return this.http.get(url!);
    }

    getDosenByKKAlt(kkId: number): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'get_by_kk_alt', { kkId });
        return this.http.get(url!);
    }

    getDosenTanpaJabatan(): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'get_tanpa_jabatan');
        return this.http.get(url!);
    }

    getDosenDenganJabatan(): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'get_dengan_jabatan');
        return this.http.get(url!);
    }

    getDosenByJabatan(jabatanId: number): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'get_by_jabatan', { jabatanId });
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

    assignJabatanDosen(dosenId: number, data: { id_jabatan_struktural: number }): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'assign_jabatan', { dosenId });
        return this.http.post(url!, data);
    }

    revokeJabatanDosen(dosenId: number): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'revoke_jabatan', { dosenId });
        return this.http.delete(url!);
    }

    getLaporanBebanSksDosen(tahunAjaranId: number, params?: HttpParams): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'laporan_beban_sks', { tahunAjaranId });
        return this.http.get(url!, { params });
    }

    getRiwayatPengajaran(dosenId: number, params?: HttpParams): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'riwayat_pengajaran', { dosenId });
        return this.http.get(url!, { params });
    }

    getBebanSksDosenTahunAjaranAktif(dosenId: number): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'beban_sks_aktif', { dosenId });
        return this.http.get(url!);
    }

    getBebanSksDosenByTahun(dosenId: number, tahunAjaranId: number): Observable<any> {
        const url = this.endpoint.getUrl('dosen', 'beban_sks_by_dosen', { dosenId, tahunAjaranId });
        return this.http.get(url!);
    }

    // =================================================================
    // MATAKULIAH MANAGEMENT METHODS
    // =================================================================
    getAllMatakuliah(params?: HttpParams): Observable<any> {
        const url = this.endpoint.getUrl('matakuliah', 'resource');
        return this.http.get(url!, { params });
    }

    getMatakuliahByAuthProdi(params?: HttpParams): Observable<any> {
        const url = this.endpoint.getUrl('matakuliah', 'by_auth_prodi');
        return this.http.get(url!, { params });
    }

    getMatakuliahByAuthKK(params?: HttpParams): Observable<any> {
        const url = this.endpoint.getUrl('matakuliah', 'by_auth_kk');
        return this.http.get(url!, { params });
    }

    createMatakuliah(data: any): Observable<any> {
        const url = this.endpoint.getUrl('matakuliah', 'resource');
        return this.http.post(url!, data);
    }

    getMatakuliahById(id: number): Observable<any> {
        const url = this.endpoint.getUrl('matakuliah', 'show', { id });
        return this.http.get(url!);
    }

    getMatakuliahByPicAndAllKK(): Observable<any> {
        const url = this.endpoint.getUrl('matakuliah', 'by_pic_and_all_kk');
        return this.http.get(url!);
    }

    updateMatakuliah(id: number, data: any): Observable<any> {
        const url = this.endpoint.getUrl('matakuliah', 'update', { id });
        return this.http.put(url!, data);
    }

    deleteMatakuliah(id: number, body?: any): Observable<any> {
        const url = this.endpoint.getUrl('matakuliah', 'delete', { id });
        return this.http.delete(url!, { body: body });
    }

    // =================================================================
    // PROGRAM STUDI MANAGEMENT METHODS
    // =================================================================
    getAllProgramStudi(): Observable<any> {
        const url = this.endpoint.getUrl('program_studi', 'get_all');
        return this.http.get(url!);
    }

    createProgramStudi(data: any): Observable<any> {
        const url = this.endpoint.getUrl('program_studi', 'resource');
        return this.http.post(url!, data);
    }

    getProgramStudiById(id: number): Observable<any> {
        const url = this.endpoint.getUrl('program_studi', 'show', { id });
        return this.http.get(url!);
    }

    updateProgramStudi(id: number, data: any): Observable<any> {
        const url = this.endpoint.getUrl('program_studi', 'update', { id });
        return this.http.put(url!, data);
    }

    deleteProgramStudi(id: number): Observable<any> {
        const url = this.endpoint.getUrl('program_studi', 'delete', { id });
        return this.http.delete(url!);
    }

    // =================================================================
    // KELOMPOK KEAHLIAN MANAGEMENT METHODS
    // =================================================================
    getAllKelompokKeahlian(): Observable<any> {
        const url = this.endpoint.getUrl('kelompok_keahlian', 'get_all');
        return this.http.get(url!);
    }

    assignKetuaKK(kkId: number, data: any): Observable<any> {
        const url = this.endpoint.getUrl('kelompok_keahlian', 'assign_ketua', { kkId });
        return this.http.post(url!, data);
    }

    revokeKetuaKK(kkId: number, data: any): Observable<any> {
        const url = this.endpoint.getUrl('kelompok_keahlian', 'revoke_ketua', { kkId });
        return this.http.post(url!, data);
    }

    getAllKelompokKeahlianWithKetua(params?: HttpParams): Observable<any> {
        const url = this.endpoint.getUrl('kelompok_keahlian', 'get_ketua_kk');
        return this.http.get(url!, { params });
    }

    // =================================================================
    // MAPPING KELAS MATAKULIAH METHODS
    // =================================================================
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

    getMappingByMatkulTahunProdi(matkulId: number, tahunAjaranId: number, prodiId: number): Observable<any> {
        const url = this.endpoint.getUrl('mapping_kelas_matkul', 'get_by_matkul_tahun_prodi', { matkulId, tahunAjaranId, prodiId });
        return this.http.get(url!);
    }

    getMappingByMatkulTahun(matkulId: number, tahunAjaranId: number): Observable<any> {
        const url = this.endpoint.getUrl('mapping_kelas_matkul', 'get_by_matkul_tahun', { matkulId, tahunAjaranId });
        return this.http.get(url!);
    }

    getMappingKelasMatkulById(id: number): Observable<any> {
        const url = this.endpoint.getUrl('mapping_kelas_matkul', 'show', { id });
        return this.http.get(url!);
    }

    getDataMappingKelasMatkul(matkulId: number, tahunAjaranId: number): Observable<any> {
        const url = this.endpoint.getUrl('mapping_kelas_matkul', 'get_data_mapping', { matkulId, tahunAjaranId });
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

    // =================================================================
    // KOORDINATOR MATAKULIAH METHODS
    // =================================================================
    getAllKoordinatorMatakuliah(params?: HttpParams): Observable<any> {
        const url = this.endpoint.getUrl('koordinator_matakuliah', 'resource');
        return this.http.get(url!, { params });
    }

    createKoordinatorMatakuliah(data: any): Observable<any> {
        const url = this.endpoint.getUrl('koordinator_matakuliah', 'resource');
        return this.http.post(url!, data);
    }

    assignKoordinatorByProdi(data: any): Observable<any> {
        const url = this.endpoint.getUrl('koordinator_matakuliah', 'assign_by_prodi');
        return this.http.post(url!, data);
    }

    assignKoordinatorByProdiAuth(data: any): Observable<any> {
        const url = this.endpoint.getUrl('koordinator_matakuliah', 'assign_by_prodi_auth');
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

    deleteKoordinatorMatakuliah(data: any): Observable<any> {
        const url = this.endpoint.getUrl('koordinator_matakuliah', 'unassign');
        return this.http.post(url!, data);
    }

    // =================================================================
    // TAHUN AJARAN METHODS
    // =================================================================
    getAllTahunAjaran(params?: HttpParams): Observable<any> {
        const url = this.endpoint.getUrl('tahun_ajaran', 'resource');
        return this.http.get(url!, { params });
    }

    getAllTahunAjaranKaurLAAK(params?: HttpParams): Observable<any> {
        const url = this.endpoint.getUrl('tahun_ajaran', 'get_all_kaur_laak');
        return this.http.get(url!, { params });
    }

    createTahunAjaran(data: any): Observable<any> {
        const url = this.endpoint.getUrl('tahun_ajaran', 'resource');
        return this.http.post(url!, data);
    }

    getActiveTahunAjaran(): Observable<any> {
        const url = this.endpoint.getUrl('tahun_ajaran', 'get_active');
        return this.http.get(url!);
    }

    setActiveTahunAjaran(id: number): Observable<any> {
        const url = this.endpoint.getUrl('tahun_ajaran', 'set_active', { id });
        return this.http.post(url!, {});
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
        // Corrected the typo from 'tahun _ajaran' to 'tahun_ajaran'
        const url = this.endpoint.getUrl('tahun_ajaran', 'delete', { id });
        return this.http.delete(url!);
    }

    // =================================================================
    // JABATAN STRUKTURAL METHODS
    // =================================================================
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

    // =================================================================
    // PLOTTINGAN PENGAJARAN METHODS
    // =================================================================
    getAllPlottinganPengajaran(): Observable<any> {
        const url = this.endpoint.getUrl('plottingan_pengajaran', 'resource');
        return this.http.get(url!);
    }

    createPlottinganPengajaran(data: any): Observable<any> {
        const url = this.endpoint.getUrl('plottingan_pengajaran', 'resource');
        return this.http.post(url!, data);
    }

    getHasilPlottinganPengajaran(tahunAjaranId: number): Observable<any> {
        const url = this.endpoint.getUrl('plottingan_pengajaran', 'get_hasil', { tahunAjaranId });
        return this.http.get(url!);
    }

    getHasilPlottinganByProdi(tahunAjaranId: number, prodiId: number, http: HttpParams): Observable<any> {
        const url = this.endpoint.getUrl('plottingan_pengajaran', 'get_hasil_by_prodi', { tahunAjaranId, prodiId });
        return this.http.get(url!, { params: http });
    }

    exportPlottinganPengajaran(tahunAjaranId: number): Observable<any> {
        const url = this.endpoint.getUrl('plottingan_pengajaran', 'export', { tahunAjaranId });
        return this.http.get(url!, { responseType: 'blob' });
    }

    exportPlottinganByProdi(tahunAjaranId: number, prodiId: number): Observable<any> {
        const url = this.endpoint.getUrl('plottingan_pengajaran', 'export_by_prodi', { tahunAjaranId, prodiId });
        return this.http.get(url!, { responseType: 'blob' });
    }

    getPlottinganPengajaranById(id: number): Observable<any> {
        const url = this.endpoint.getUrl('plottingan_pengajaran', 'show', { id });
        return this.http.get(url!);
    }

    updatePlottinganPengajaran(id: number, data: any): Observable<any> {
        const url = this.endpoint.getUrl('plottingan_pengajaran', 'update', { id });
        return this.http.put(url!, data);
    }

    unassignDosenFromPlotting(plottinganPengajaranId: number): Observable<any> {
        const context = { plottinganPengajaran: plottinganPengajaranId };
        const url = this.endpoint.getUrl('plottingan_pengajaran', 'unassign_dosen', context);

        return this.http.delete(url!);
    }

    getHasilPlottinganKaurLAAK(params?: HttpParams): Observable<any> {
        const url = this.endpoint.getUrl('plottingan_pengajaran', 'get_hasil_laak_kaur');
        return this.http.get(url!, { params });
    }

    getProgressPlottingKK(prodiId: number): Observable<any> {
        const url = this.endpoint.getUrl('progress_plotting', 'get_progress_kk', { prodiId });
        return this.http.get<any>(url!);
    }

    getProgressPlottingProdi(): Observable<any> {
        const url = this.endpoint.getUrl('progress_plotting', 'get_progress_prodi');
        return this.http.get<any>(url!);
    }
}