import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActionButtonComponent } from '../../shared/components/index';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ActionButtonComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;

  constructor() { }

  onSubmit(loginForm: NgForm): void {
    if (loginForm.invalid) {
      Object.values(loginForm.controls).forEach(control => {
        control.markAsTouched();
      });
      console.log('Form is invalid');
      return;
    }
    console.log('Login attempt with:', {
      email: this.email,
      password: '*** MASKED FOR SECURITY ***',
      rememberMe: this.rememberMe
    });

    console.log(`Simulating login for ${this.email}. Remember me: ${this.rememberMe}`);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}