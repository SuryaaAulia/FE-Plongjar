import { Component, OnInit } from '@angular/core';
import { NavService } from '../../core/services/nav.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidenavComponent } from '../../shared/components/sidenav/sidenav.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { NavItem, SideNavToggle } from '../../core/models/nav-item.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidenavComponent, NavbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  menuItems$!: Observable<NavItem[]>;
  screenWidth = 0;
  collapsed = false;
  hovering = false;

  constructor(private nav: NavService, private auth: AuthService) { }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    this.menuItems$ = this.nav.getMenu('ketua_prodi');
  }

  toggleSidenav(): void {
    this.collapsed = !this.collapsed;
    this.emitSideNavInfo();
  }

  handleSideNavToggle(event: SideNavToggle): void {
    this.screenWidth = event.screenWidth;
    this.collapsed = event.collapsed;
  }

  handleSidenavHover(isHovering: boolean): void {
    this.hovering = isHovering;
  }

  private emitSideNavInfo(): void {
  }
}
