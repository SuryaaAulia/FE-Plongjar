import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, AuthUser } from '../../../../core/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TahunAjaranService } from '../../../../core/services/admin/tahun-ajaran.service';

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
  activeTahunAjaranString: string = 'Memuat...';

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private tahunAjaranService: TahunAjaranService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
      this.updateUserInfo();
    });

    this.tahunAjaranService.activeTahunAjaran$
      .pipe(takeUntil(this.destroy$))
      .subscribe(active => {
        if (active) {
          const semester = active.semester.charAt(0).toUpperCase() + active.semester.slice(1);
          this.activeTahunAjaranString = `Tahun Ajaran ${active.tahun_ajaran} | Semester ${semester}`;
        } else {
          this.activeTahunAjaranString = 'Tahun Ajaran Belum Diatur';
        }
      });

    this.checkIfMobile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
  }

  private checkIfMobile(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 990;
    if (this.isMobile && !wasMobile) {
      this.collapsed = true;
      this.onToggleSidenav();
    }
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
      return names[0].substring(0, 2).toUpperCase();
    } else if (names.length >= 2) {
      const firstName = names[0];
      const lastName = names[names.length - 1];
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }
    return '';
  }

  logout(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = false;
    this.authService.logout();
  }
}
