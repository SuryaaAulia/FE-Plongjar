import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent {
  @Input() isVisible: boolean = false;
  @Input() title: string = 'Confirmation!';
  @Input() message: string = 'Plottingan yang di-submit akan langsung diteruskan ke LAA, pastikan data yang anda masukan sudah benar!';
  @Input() checkboxLabel: string = 'Ya, saya yakin.';
  @Input() okButtonText: string = 'OK';
  @Input() cancelButtonText: string = 'Cancel';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  isConfirmed: boolean = false;

  onConfirm(): void {
    if (this.isConfirmed) {
      this.confirmed.emit();
      this.closeModal();
    }
  }

  onCancel(): void {
    this.cancelled.emit();
    this.closeModal();
  }

  closeModal(): void {
    this.isVisible = false;
    this.isConfirmed = false;
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}