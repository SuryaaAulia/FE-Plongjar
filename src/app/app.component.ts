import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidenavComponent } from './shared/components/sidenav/sidenav.component';
import { BodyLayoutComponent } from './layouts/body-layout/body-layout.component';
import { NavItem, SideNavToggle } from './core/models/nav-item.model';
import { NavService } from './core/services/nav.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidenavComponent, BodyLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'FE-Plongjar';

  screenWidth = 0;
  collapsed = false;
  menuItems: NavItem[] = [];

  constructor(private navService: NavService) {}

  ngOnInit() {
    this.navService.getMenu('admin').subscribe(items => {
      this.menuItems = items;
    });
  }

  onToggleSideNav(data: SideNavToggle) {
    this.screenWidth = data.screenWidth;
    this.collapsed = data.collapsed;
  }
}