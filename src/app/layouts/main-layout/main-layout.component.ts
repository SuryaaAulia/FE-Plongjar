import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavService } from '../../core/services/nav.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidenavComponent, NavbarComponent } from '../../shared/components/index';
import { NavItem, SideNavToggle } from '../../core/models/nav-item.model';
import { Observable, Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidenavComponent, NavbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  menuItems$!: Observable<NavItem[]>;
  screenWidth = 0;
  collapsed = false;
  hovering = false;
  currentUser$!: Observable<any>;
  private destroy$ = new Subject<void>();

  get isMobile(): boolean {
    return this.screenWidth <= 990;
  }

  constructor(
    private navService: NavService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    this.currentUser$ = this.authService.currentUser$;
    this.menuItems$ = this.authService.currentUser$.pipe(
      takeUntil(this.destroy$),
      switchMap(user => {
        const navRole = this.authService.getNavRole();
        return this.navService.getMenu(navRole);
      })
    );

    this.collapsed = this.isMobile;

    window.addEventListener('resize', this.onResize.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  onResize(): void {
    const previousScreenWidth = this.screenWidth;
    this.screenWidth = window.innerWidth;

    const wasMobile = previousScreenWidth <= 990;
    const isMobileNow = this.screenWidth <= 990;

    if (!wasMobile && isMobileNow) {
      this.collapsed = true;
      this.hovering = false;
    } else if (wasMobile && !isMobileNow) {
      this.hovering = false;
    }
  }

  toggleSidenav(): void {
    this.collapsed = !this.collapsed;
    this.hovering = false;
  }

  handleSideNavToggle(event: SideNavToggle): void {
    this.screenWidth = event.screenWidth;
    this.collapsed = event.collapsed;
  }

  handleSidenavHover(isHovering: boolean): void {
    if (this.collapsed && !this.isMobile) {
      this.hovering = isHovering;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}