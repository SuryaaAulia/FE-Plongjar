import { environment } from "../../../environments/environment";

const API = environment.apiUrl;

export class Endpoint {
    getUrl(namespace: any, key: any, context?: any): string | undefined {
        const ENDPOINT: any = {
            auth: {
                register: `${API}/auth/register`,
                login: `${API}/auth/login`,
                logout: `${API}/auth/logout`,
                user: `${API}/user`,
            },

            roles: {
                get_all_roles: `${API}/roles`,
                get_all_users: `${API}/roles/getAllUser`,
                get_all_assigned_user_roles: `${API}/roles/getAllAssignedUserRoles`,
                get_all_unassigned_users: `${API}/roles/getAllUnassignedUser`,
                get_all_user_by_role: `${API}/roles/getAllUserByRole/${context?.roleId || ':roleId'}`,
                assign_role: `${API}/roles/assignRole`,
                revoke_role: `${API}/roles/revokeRole`,
                assign_scoped_role: `${API}/roles/assign-scoped-role`,
            },

            pic: {
                add: `${API}/masterdata/addPicData`,
                get_all: `${API}/masterdata/getAllPic`,
            },

            dosen: {
                add: `${API}/masterdata/addDosenData`,
                get_all: `${API}/masterdata/getAllDosen`,
                get_by_kk: `${API}/masterdata/getAllDosen/${context?.kkId || ':kkId'}`,
                get_by_kk_alt: `${API}/masterdata/dosens/by-kelompok-keahlian/${context?.kkId || ':kkId'}`,
                get_tanpa_jabatan: `${API}/masterdata/dosens/tanpa-jabatan-struktural`,
                get_dengan_jabatan: `${API}/masterdata/dosens/dengan-jabatan-struktural`,
                get_by_jabatan: `${API}/masterdata/dosens/by-jabatan-struktural/${context?.jabatanId || ':jabatanId'}`,
                get_detail: `${API}/masterdata/getDosenDetail/${context?.dosenId || ':dosenId'}`,
                assign_jabatan: `${API}/masterdata/assignjabatantodosen`,
                revoke_jabatan: `${API}/masterdata/revokejabatandosen`,
                resource: `${API}/masterdata/dosens`,
                show: `${API}/masterdata/dosens/${context?.id || ':id'}`,
                update: `${API}/masterdata/dosens/${context?.id || ':id'}`,
                delete: `${API}/masterdata/dosens/${context?.id || ':id'}`,
                laporan_beban_sks: `${API}/plottingan-pengajaran/dosen/laporan-beban-sks/tahun-ajaran/${context?.tahunAjaranId || ':tahunAjaranId'}`,
                riwayat_pengajaran: `${API}/plottingan-pengajaran/dosen/${context?.dosenId || ':dosenId'}/riwayat-pengajaran`,
                beban_sks_aktif: `${API}/plottingan-pengajaran/dosen/${context?.dosenId || ':dosenId'}/beban-sks-aktif`,
                beban_sks_by_tahun: `${API}/plottingan-pengajaran/dosen/${context?.dosenId || ':dosenId'}/tahun-ajaran/${context?.tahunAjaranId || ':tahunAjaranId'}`,
            },

            matakuliah: {
                get_all: `${API}/getAllMatakuliah`,
                by_auth_prodi: `${API}/masterdata/matakuliahs/by-auth-prodi`,
                by_auth_kk: `${API}/masterdata/matakuliahs/by-auth-kk`,
                resource: `${API}/masterdata/matakuliahs`,
                show: `${API}/masterdata/matakuliahs/${context?.id || ':id'}`,
                update: `${API}/masterdata/matakuliahs/${context?.id || ':id'}`,
                delete: `${API}/masterdata/matakuliahs/${context?.id || ':id'}`,
                by_pic_and_all_kk: `${API}/masterdata/matakuliahs/by-auth-prodi-and-all-kk`,
            },

            program_studi: {
                get_all: `${API}/masterdata/programstudi`,
                resource: `${API}/masterdata/program-studi`,
                show: `${API}/masterdata/program-studi/${context?.id || ':id'}`,
                update: `${API}/masterdata/program-studi/${context?.id || ':id'}`,
                delete: `${API}/masterdata/program-studi/${context?.id || ':id'}`,
            },

            kelompok_keahlian: {
                get_all: `${API}/masterdata/kelompokkeahlian`,
                assign_ketua: `${API}/masterdata/kelompok-keahlian/${context?.kkId || ':kkId'}/assign-ketua`,
                revoke_ketua: `${API}/masterdata/kelompok-keahlian/${context?.kkId || ':kkId'}/revoke-ketua`,
            },

            mapping_kelas_matkul: {
                resource: `${API}/masterdata/mappingkelasmatakuliahs`,
                get_by_matkul_id: `${API}/masterdata/getmappingkelasmatkulbyidmatkul/${context?.matkulId || ':matkulId'}`,
                get_by_matakuliah: `${API}/masterdata/mappingkelasmatakuliahs/by-matakuliah/${context?.matkulId || ':matkulId'}`,
                get_by_matkul_tahun_prodi: `${API}/masterdata/mapping-kelas-matakuliah/matakuliah/${context?.matkulId || ':matkulId'}/tahun-ajaran/${context?.tahunAjaranId || ':tahunAjaranId'}/program-studi/${context?.prodiId || ':prodiId'}`,
                get_by_matkul_tahun: `${API}/masterdata/mapping-kelas-matakuliah/by-matakuliah/${context?.matkulId || ':matkulId'}/tahun-ajaran/${context?.tahunAjaranId || ':tahunAjaranId'}`,
                get_data_mapping: `${API}/masterdata/mapping-kelas-matakuliah/by-matakuliah/${context?.matkulId || ':matkulId'}/tahun-ajaran/${context?.tahunAjaranId || ':tahunAjaranId'}/logged-in-prodi`,
                show: `${API}/masterdata/mappingkelasmatakuliahs/${context?.id || ':id'}`,
                update: `${API}/masterdata/mappingkelasmatakuliahs/${context?.id || ':id'}`,
                delete: `${API}/masterdata/mappingkelasmatakuliahs/${context?.id || ':id'}`,
            },

            koordinator_matakuliah: {
                resource: `${API}/masterdata/koordinator-matakuliah`,
                assign_by_prodi: `${API}/masterdata/koordinator-matakuliah/assign-by-program-studi`,
                assign_by_prodi_auth: `${API}/masterdata/koordinator-matakuliah/assign-by-program-studi/by-auth-prodi`,
                show: `${API}/masterdata/koordinator-matakuliah/${context?.id || ':id'}`,
                update: `${API}/masterdata/koordinator-matakuliah/${context?.id || ':id'}`,
                unassign: `${API}/masterdata/koordinator-matakuliah/revoke-by-program-studi`,
            },

            tahun_ajaran: {
                resource: `${API}/masterdata/tahunajarans`,
                get_all_kaur_laak: `${API}/masterdata/get-all-tahun-ajaran`,
                get_active: `${API}/masterdata/tahun-ajaran/aktif`,
                set_active: `${API}/masterdata/tahun-ajaran/${context?.id || ':id'}/set-active`,
                show: `${API}/masterdata/tahunajarans/${context?.id || ':id'}`,
                update: `${API}/masterdata/tahunajarans/${context?.id || ':id'}`,
                delete: `${API}/masterdata/tahunajarans/${context?.id || ':id'}`,
            },

            jabatan_struktural: {
                resource: `${API}/masterdata/jabatanstruktural`,
                show: `${API}/masterdata/jabatanstruktural/${context?.id || ':id'}`,
                update: `${API}/masterdata/jabatanstruktural/${context?.id || ':id'}`,
                delete: `${API}/masterdata/jabatanstruktural/${context?.id || ':id'}`,
            },

            plottingan_pengajaran: {
                resource: `${API}/plottingan-pengajaran/start-plottingan-pengajaran`,
                unassign_dosen: `${API}/plottingan-pengajaran/unassign/${context?.plottinganPengajaran || ':plottinganPengajaranId'}`,
                get_hasil: `${API}/plottingan-pengajaran/get-hasil-plottingan-pengajaran/${context?.tahunAjaranId || ':tahunAjaranId'}`,
                get_hasil_by_prodi: `${API}/plottingan-pengajaran/tahun-ajaran/${context?.tahunAjaranId || ':tahunAjaranId'}/program-studi/${context?.prodiId || ':prodiId'}`,
                export: `${API}/plottingan-pengajaran/export/tahun-ajaran/${context?.tahunAjaranId || ':tahunAjaranId'}`,
                export_by_prodi: `${API}/plottingan-pengajaran/export/tahun-ajaran/${context?.tahunAjaranId || ':tahunAjaranId'}/program-studi/${context?.prodiId || ':prodiId'}`,
            },
        };

        return ENDPOINT[namespace] && ENDPOINT[namespace][key];
    }
}
