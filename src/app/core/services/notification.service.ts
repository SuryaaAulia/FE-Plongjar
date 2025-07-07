import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor() { }

    showSuccess(message: string): void {
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: message,
            timer: 1500,
            showConfirmButton: false,
        });
    }

    showError(message: string): void {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: message,
        });
    }

    showWarning(message: string): void {
        Swal.fire({
            icon: 'warning',
            title: 'Peringatan',
            text: message,
        });
    }

    showConfirmation(
        title: string,
        text: string,
        confirmButtonText: string = 'Ya, hapus!'
    ): Promise<SweetAlertResult> {
        return Swal.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: confirmButtonText,
            cancelButtonText: 'Batal'
        });
    }
}