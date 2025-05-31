import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, AuthUser } from '../../../../core/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidenav = new EventEmitter<void>();
  @Input() collapsed = false;
  @Input() hovering = false;

  currentUser: AuthUser | null = null;
  userInitials: string = '';
  userDisplayName: string = '';
  isDropdownOpen: boolean = false;
  isMobile: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Subscribe to current user changes
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
      this.updateUserInfo();
    });

    // Check if mobile on init
    this.checkIfMobile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Close dropdown when clicking outside and check screen size
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const userProfile = document.querySelector('.user-profile');

    if (userProfile && !userProfile.contains(target)) {
      this.isDropdownOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkIfMobile();
    // Emit mobile state to parent
    this.toggleSidenav.emit();
  }

  private checkIfMobile(): void {
    this.isMobile = window.innerWidth <= 990;
    // If switching to mobile, ensure sidebar is hidden
    if (this.isMobile) {
      this.collapsed = true;
    }
  }

  get shouldShowToggleButton(): boolean {
    return true; // Always show toggle button
  }

  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  private updateUserInfo(): void {
    if (this.currentUser) {
      this.userDisplayName = this.currentUser.name;
      this.userInitials = this.generateInitials(this.currentUser.name);
    } else {
      this.userDisplayName = '';
      this.userInitials = '';
    }
  }

  private generateInitials(fullName: string): string {
    if (!fullName) return '';

    const names = fullName.trim().split(' ');

    if (names.length === 1) {
      // Single name: take first 2 letters
      return names[0].substring(0, 2).toUpperCase();
    } else if (names.length >= 2) {
      // Multiple names: take first letter of first and last name
      const firstName = names[0];
      const lastName = names[names.length - 1];
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }

    return '';
  }

  logout(event: Event): void {
    event.stopPropagation(); // Prevent event bubbling
    this.isDropdownOpen = false; // Close dropdown
    this.authService.logout();
  }
}