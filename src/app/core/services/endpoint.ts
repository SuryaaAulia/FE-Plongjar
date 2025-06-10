// src/app/core/config/endpoint.ts

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
            },

            pic: {
                add: `${API}/masterdata/addPicData`,
                get_all: `${API}/masterdata/getAllPic`,
            },

            dosen: {
                add: `${API}/masterdata/addDosenData`,
                get_all: `${API}/masterdata/getAllDosen`,
                get_by_kk: `${API}/masterdata/getAllDosen/${context?.kkId || ':kkId'}`,
                get_detail: `${API}/masterdata/getDosenDetail/${context?.dosenId || ':dosenId'}`,
                assign_jabatan: `${API}/masterdata/assignjabatantodosen`,
                revoke_jabatan: `${API}/masterdata/revokejabatandosen`,
                show: `${API}/masterdata/dosens/${context?.id || ':id'}`,
                update: `${API}/masterdata/dosens/${context?.id || ':id'}`,
                delete: `${API}/masterdata/dosens/${context?.id || ':id'}`,
            },

            matakuliah: {
                get_all: `${API}/masterdata/getAllMatakuliah`,
                resource: `${API}/masterdata/matakuliahs`,
                show: `${API}/masterdata/matakuliahs/${context?.id || ':id'}`,
                update: `${API}/masterdata/matakuliahs/${context?.id || ':id'}`,
                delete: `${API}/masterdata/matakuliahs/${context?.id || ':id'}`,
            },

            program_studi: {
                get_all: `${API}/masterdata/programstudi`,
            },

            kelompok_keahlian: {
                get_all: `${API}/masterdata/kelompokkeahlian`,
            },

            mapping_kelas_matkul: {
                resource: `${API}/masterdata/mappingkelasmatakuliahs`,
                get_by_matkul_id: `${API}/masterdata/getmappingkelasmatkulbyidmatkul/${context?.matkulId || ':matkulId'}`,
                get_by_matakuliah: `${API}/masterdata/mappingkelasmatakuliahs/by-matakuliah/${context?.matkulId || ':matkulId'}`,
                show: `${API}/masterdata/mappingkelasmatakuliahs/${context?.id || ':id'}`,
                update: `${API}/masterdata/mappingkelasmatakuliahs/${context?.id || ':id'}`,
                delete: `${API}/masterdata/mappingkelasmatakuliahs/${context?.id || ':id'}`,
            },

            koordinator_matakuliah: {
                resource: `${API}/masterdata/koordinator-matakuliah`,
                show: `${API}/masterdata/koordinator-matakuliah/${context?.id || ':id'}`,
                update: `${API}/masterdata/koordinator-matakuliah/${context?.id || ':id'}`,
                delete: `${API}/masterdata/koordinator-matakuliah/${context?.id || ':id'}`,
            },

            jabatan_struktural: {
                show: `${API}/masterdata/jabatanstruktural`,
                create: `${API}/masterdata/`,
            },
        };

        return ENDPOINT[namespace] && ENDPOINT[namespace][key];
    }
}