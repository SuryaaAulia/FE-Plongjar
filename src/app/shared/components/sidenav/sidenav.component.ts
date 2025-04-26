import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavItem, SideNavToggle } from '../../../core/models/nav-item.model';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @Output() onToggleSideNav = new EventEmitter<SideNavToggle>();
  @Input() menuItems: NavItem[] | null = [];
  
  screenWidth = 0;
  collapsed = false;
  hovering = false;
  
  expandedItems: Record<string, boolean> = {};

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth
    });
  }

  onMouseEnter(): void {
    if (this.collapsed) {
      this.hovering = true;
    }
  }

  onMouseLeave(): void {
    this.hovering = false;
  }

  toggleSubmenu(label: string): void {
    this.expandedItems[label] = !this.expandedItems[label];
  }

  isSubmenuExpanded(label: string): boolean {
    return this.expandedItems[label] || false;
  }
  
  getSubmenuItemDelay(index: number): string {
    return `${index * 0.05}s`;
  }
}