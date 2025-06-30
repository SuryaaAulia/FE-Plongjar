import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActionButtonComponent } from '../../buttons/action-button/action-button.component';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ActionButtonComponent
  ],
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnChanges {
  @Input() isVisible: boolean = false;
  @Input() title: string = 'Confirmation!';
  @Input() mode: 'checkbox' | 'password' = 'checkbox';

  @Input() message: string = 'Plottingan yang di-submit akan langsung diteruskan ke LAA, pastikan data yang anda masukan sudah benar!';
  @Input() checkboxLabel: string = 'Ya, saya yakin.';

  @Input() passwordPrompt: string = 'Masukan password akun anda untuk melanjutkan tindakan penghapusan mata kuliah';

  @Input() okButtonText: string = 'OK';
  @Input() cancelButtonText: string = 'Cancel';

  @Output() confirmed = new EventEmitter<void>();
  @Output() passwordEntered = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  isCheckboxConfirmed: boolean = false;
  passwordValue: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && !this.isVisible) {
      this.resetStates();
    }
    if (changes['mode']) {
      this.resetStates();
    }
  }

  private resetStates(): void {
    this.isCheckboxConfirmed = false;
    this.passwordValue = '';
  }

  onConfirm(): void {
    if (this.mode === 'checkbox') {
      if (this.isCheckboxConfirmed) {
        this.confirmed.emit();
      }
    } else if (this.mode === 'password') {
      if (this.passwordValue.trim() !== '') {
        this.passwordEntered.emit(this.passwordValue);
      }
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  isOkDisabled(): boolean {
    if (this.mode === 'checkbox') {
      return !this.isCheckboxConfirmed;
    }
    if (this.mode === 'password') {
      return this.passwordValue.trim() === '';
    }
    return true;
  }
}