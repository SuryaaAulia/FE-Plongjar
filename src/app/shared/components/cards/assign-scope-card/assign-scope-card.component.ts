import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseCardComponent } from '../base-card/base-card.component';
import { RoleTagComponent, ActionButtonComponent } from '../../../../shared/components/index';
import { User } from '../../../../core/models/user.model';
import { RoleService } from '../../../../core/services/admin/role.service';
import { FormInputComponent, SelectOption } from '../../form-input/form-input.component';

export interface ScopeOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-assign-scope-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseCardComponent,
    FormInputComponent,
    RoleTagComponent,
    ActionButtonComponent
  ],
  templateUrl: './assign-scope-card.component.html',
  styleUrls: ['./assign-scope-card.component.scss']
})
export class AssignScopeCardComponent implements OnInit, OnChanges {
  @Input() user!: User;
  @Input() scopeOptions: ScopeOption[] = [];
  @Input() placeholder: string = 'Pilih Opsi';
  @Input() roleService!: RoleService;

  @Output() assignScope = new EventEmitter<{ userId: number, scopeId: number }>();
  @Output() removeScope = new EventEmitter<{ userId: number }>();
  @Output() removeRole = new EventEmitter<void>();

  selectedScopeId: number | null = null;
  selectedScope: ScopeOption | null = null;
  showDropdown: boolean = true;

  ngOnInit(): void {
    this.initializeState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] || changes['scopeOptions']) {
      this.initializeState();
    }
  }

  private initializeState(): void {
    const currentScopeId = (this.user.role as any)?.pivot?.roleable_id;
    if (currentScopeId && this.scopeOptions.length > 0) {
      const matchedScope = this.scopeOptions.find(option => option.id === currentScopeId);
      if (matchedScope) {
        this.selectedScope = matchedScope;
        this.selectedScopeId = matchedScope.id;
        this.showDropdown = false;
      } else {
        this.resetToDropdown();
      }
    } else {
      this.resetToDropdown();
    }
  }

  get formattedScopeOptions(): SelectOption[] {
    return this.scopeOptions.map(option => ({ value: option.id, label: option.name }));
  }

  onScopeChange(): void {
    if (!this.selectedScopeId) {
      this.resetToDropdown();
      return;
    }
    const newSelectedScope = this.scopeOptions.find(option => option.id === Number(this.selectedScopeId));
    if (newSelectedScope) {
      this.selectedScope = newSelectedScope;
      this.showDropdown = false;
      this.assignScope.emit({ userId: this.user.id, scopeId: newSelectedScope.id });
    } else {
      this.resetToDropdown();
    }
  }

  onRemoveScope(): void {
    this.removeScope.emit({ userId: this.user.id });
    this.resetToDropdown();
  }

  onRemoveRole(): void {
    this.removeRole.emit();
  }

  private resetToDropdown(): void {
    this.selectedScopeId = null;
    this.selectedScope = null;
    this.showDropdown = true;
  }
}