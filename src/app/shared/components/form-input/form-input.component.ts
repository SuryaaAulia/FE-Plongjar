import { Component, Input, Output, EventEmitter, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, AbstractControl } from '@angular/forms';

export interface SelectOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true
    }
  ],
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss']
})
export class FormInputComponent implements ControlValueAccessor, OnInit {

  @Input() type: string = 'text';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() control: AbstractControl | null = null;
  @Input() errorMessages: { [key: string]: string } = {};

  @Input() showIcon: boolean = false;
  @Input() iconClass: string = '';

  @Input() options: SelectOption[] = [];

  @Input() customError: string = '';
  @Input() showCustomError: boolean = false;

  @Output() inputChange = new EventEmitter<string>();
  @Output() inputFocus = new EventEmitter<Event>();
  @Output() inputBlur = new EventEmitter<Event>();
  @Output() clearError = new EventEmitter<void>();

  value: string | number = '';
  showPassword = false;

  private onChange = (value: string | number) => { };
  private onTouched = () => { };

  ngOnInit(): void {
    if (!this.id) {
      this.id = this.name || `app-input-${Math.random().toString(36).substring(2, 9)}`;
    }
    if (this.showIcon && !this.iconClass) {
      this.setDefaultIcon();
    }
  }

  private setDefaultIcon(): void {
    const iconMap: { [key: string]: string } = {
      'email': 'fas fa-envelope',
      'password': 'fas fa-lock',
      'text': 'fas fa-user',
      'tel': 'fas fa-phone',
      'url': 'fas fa-link',
      'search': 'fas fa-search'
    };
    this.iconClass = iconMap[this.type] || 'fas fa-pencil-alt';
  }

  writeValue(value: string | number): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    this.value = target.value;
    this.onChange(this.value);
    this.inputChange.emit(this.value);
    if (this.customError) {
      this.clearError.emit();
    }
  }

  onFocus(event: Event): void {
    this.inputFocus.emit(event);
  }

  onBlur(event: Event): void {
    this.onTouched();
    this.inputBlur.emit(event);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get hasError(): boolean {
    if (this.showCustomError && this.customError) {
      return true;
    }
    return !!(this.control?.invalid && (this.control.dirty || this.control.touched));
  }

  get errorMessage(): string {
    if (this.showCustomError && this.customError) {
      return this.customError;
    }
    if (this.control?.errors) {
      const errors = this.control.errors;
      for (const errorKey in errors) {
        if (this.errorMessages[errorKey]) {
          return this.errorMessages[errorKey];
        }
        switch (errorKey) {
          case 'required':
            return `${this.label || 'This field'} wajib diisi.`;
          case 'email':
            return 'Please enter a valid email format.';
          case 'minlength':
            return `Must be at least ${errors['minlength'].requiredLength} characters.`;
          case 'maxlength':
            return `Cannot exceed ${errors['maxlength'].requiredLength} characters.`;
          case 'pattern':
            return `The format is invalid.`;
        }
      }
    }
    return '';
  }

  get inputType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  get requiredIndicator(): string {
    return this.required ? '*' : '';
  }

  get inputClasses(): string {
    let baseClass = this.type === 'select' ? 'form-select' : 'form-input';
    return `${baseClass} ${this.hasError ? 'invalid-input' : ''}`.trim();
  }

  get shouldShowIcon(): boolean {
    return this.showIcon && !!this.iconClass && this.type !== 'select';
  }

  get shouldShowPasswordToggle(): boolean {
    return this.type === 'password';
  }

  get inputPadding(): string {
    const hasLeftIcon = this.shouldShowIcon;
    const hasRightIcon = this.shouldShowPasswordToggle;
    let paddingLeft = hasLeftIcon ? '2.5rem' : '0.75rem';
    let paddingRight = hasRightIcon ? '2.5rem' : '0.75rem';
    return `0.75rem ${paddingRight} 0.75rem ${paddingLeft}`;
  }
}