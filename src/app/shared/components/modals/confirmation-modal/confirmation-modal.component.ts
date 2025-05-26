import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
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

  // This method is for the parent to call if it wants to force close,
  // or parent can just set isVisible to false.
  // For this design, parent controls isVisible.
  // closeModal(): void {
  //   this.isVisible = false; // This is problematic if isVisible is an @Input
  //   this.resetStates();
  // }

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