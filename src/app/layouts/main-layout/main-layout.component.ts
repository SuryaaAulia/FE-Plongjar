import { Component, OnInit } from '@angular/core';
import { NavService } from '../../core/services/nav.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidenavComponent } from '../../shared/components/sidenav/sidenav.component';
import { NavItem, SideNavToggle } from '../../core/models/nav-item.model';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidenavComponent],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit {
  menuItems$!: Observable<NavItem[]>;
  
  constructor(
    private nav: NavService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.menuItems$ = this.nav.getMenu('admin');
    
    /* Role-based menu approach - uncomment to enable
    this.menuItems$ = this.auth.currentUser$.pipe(
      switchMap(user => this.nav.getMenu(user.role as keyof typeof this.nav.menuConfig))
    );
    */
  }

  handleSideNavToggle(event: SideNavToggle) {
    console.log('Collapsed:', event.collapsed);
  }
}