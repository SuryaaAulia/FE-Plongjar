import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Course } from '../../../core/models/user.model';
import {
  SearchHeaderComponent,
  PaginationComponent,
  CourseCardComponent
} from '../../../shared/components/index';

@Component({
  selector: 'app-manage-matkul',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchHeaderComponent,
    CourseCardComponent,
    PaginationComponent,
  ],
  templateUrl: './manage-matkul.component.html',
  styleUrl: './manage-matkul.component.scss'
})
export class ManageMatkulComponent implements OnInit {
  allCourses: Course[] = [];
  filteredCourses: Course[] = [];
  currentPage = 1;
  itemsPerPage = 12;
  isLoading = true;
  searchNamaMatkul: string = '';
  searchPIC: string = '';

  constructor(private router: Router) { } // <-- Inject Router

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.allCourses = this.generateMockCourses();
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
  }

  private generateMockCourses(): Course[] {
    const courseNames = ['MOBILE PROGRAMMING', 'WEB DEVELOPMENT', 'DATABASE SYSTEMS', 'ALGORITHMS', 'DATA STRUCTURES', 'OPERATING SYSTEMS', 'NETWORKING', 'SOFTWARE ENGINEERING', 'ARTIFICIAL INTELLIGENCE', 'MACHINE LEARNING'];
    // Ensure these codes are unique if they are the primary lookup key
    const courseCodes = ['CRI3I3', 'CS101', 'DB202', 'ALGO303', 'DS304', 'OS401', 'NET402', 'SE501', 'AI601', 'ML602'];
    const pics = ['SEAL', 'RPL', 'KBK', 'DOSEN X', 'DOSEN Y'];
    const sksValues = [1, 2, 3, 4, 5, 6];
    const statuses = ['active', 'inactive', 'new'];
    const metodes = ['online', 'offline', 'hybrid'];
    const praktikumValues = ['true', 'false'];

    return Array.from({ length: 20 }, (_, i) => { // Reduced to 20 for more unique codes with modulo
      const code = courseCodes[i % courseCodes.length] + (i >= courseCodes.length ? `_V${Math.floor(i / courseCodes.length)}` : ''); // Attempt at uniqueness for mock
      return {
        id: `db-${i + 1}`, // A separate internal ID
        name: courseNames[i % courseNames.length] + (i >= courseNames.length ? ` ${Math.floor(i / courseNames.length) + 1}` : ''),
        code: code, // This is the identifier for routing
        sks: sksValues[i % sksValues.length],
        pic: pics[i % pics.length],
        statusMatkul: statuses[i % statuses.length],
        metodePerkuliahan: metodes[i % metodes.length],
        praktikum: praktikumValues[i % praktikumValues.length],
      };
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredCourses = this.allCourses.filter(course => {
      const nameMatch = this.searchNamaMatkul
        ? course.name.toLowerCase().includes(this.searchNamaMatkul.toLowerCase())
        : true;
      const picMatch = this.searchPIC
        ? course.pic.toLowerCase().includes(this.searchPIC.toLowerCase())
        : true;
      return nameMatch && picMatch;
    });
    this.currentPage = 1;
  }

  onItemsPerPageChange(items: number): void {
    this.itemsPerPage = items;
    this.currentPage = 1;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  get paginatedCourses(): Course[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCourses.slice(start, start + this.itemsPerPage);
  }

  // --- Card Action Handlers ---
  handleViewDetails(course: Course): void {
    console.log('Navigating to View Details for:', course);
    this.router.navigate(['/ketua-prodi/detail-matkul', course.code]);
    // If using nested routes:
    // this.router.navigate(['/manage-matkul', course.id, 'detail']);
  }

  handleEditCourse(course: Course): void {
    console.log('Edit Course:', course);
    // This might still open a modal or navigate to an edit page
    // If navigating: this.router.navigate(['/course-edit', course.id]);
    // If modal, your existing logic for modals would apply here.
    this.router.navigate(['/ketua-prodi/matkul/edit', course.code]);
  }

  handleDeleteCourse(course: Course): void {
    console.log('Delete Course:', course);
    // This would typically open a confirmation modal first.
    // After confirmation, you'd call a service to delete and then refresh the list.
    if (confirm(`Are you sure you want to delete ${course.name}?`)) {
      // Call your service to delete course
      // this.courseService.delete(course.id).subscribe(() => {
      //   this.loadCourses(); // Refresh list
      // });
      alert(`Placeholder: Course ${course.name} deleted (mock).`);
      this.allCourses = this.allCourses.filter(c => c.id !== course.id);
      this.applyFilters();
    }
  }
  get displayedEndIndex(): number { // 👈 New getter
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredCourses.length);
  }

  get displayedStartIndex(): number { // 👈 Optional: for consistency
    if (this.filteredCourses.length === 0) {
      return 0;
    }
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }
}
