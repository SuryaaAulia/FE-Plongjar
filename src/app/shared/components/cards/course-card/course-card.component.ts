import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCardComponent } from '../base-card/base-card.component';
import { Course } from '../../../../core/models/user.model';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, BaseCardComponent],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss'
})
export class CourseCardComponent {
  @Input() course!: Course;
  @Output() viewDetails = new EventEmitter<Course>();
  @Output() edit = new EventEmitter<Course>();
  @Output() delete = new EventEmitter<Course>();

  onDetailClick(): void {
    this.viewDetails.emit(this.course);
  }

  onEditClick(): void {
    this.edit.emit(this.course);
  }

  onDeleteClick(): void {
    this.delete.emit(this.course);
  }
}