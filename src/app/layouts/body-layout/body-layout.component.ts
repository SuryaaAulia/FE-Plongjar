import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-body-layout',
  standalone: true,
  imports: [NgClass],
  templateUrl: './body-layout.component.html',
  styleUrl: './body-layout.component.scss'
})
export class BodyLayoutComponent {
  @Input() screenWidth = 0;
  @Input() collapsed = false;

  getBodyClass(): string {
    let bodyClass = '';
    if (this.collapsed && this.screenWidth > 768) {
      bodyClass = 'body-trimmed';
    }else if (this.collapsed && this.screenWidth <= 768 && this.screenWidth > 0) {
      bodyClass = 'body-md-screen';
    }
    return bodyClass;
  }
}
