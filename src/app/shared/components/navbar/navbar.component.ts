import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Input() collapsed = false;
  @Output() toggleSidenav = new EventEmitter<void>();
  
  constructor() {}
  
  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }
}