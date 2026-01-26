import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-bookmark-form',
  standalone: true,
  imports: [ CommonModule , ReactiveFormsModule],
  templateUrl: './bookmark-form.component.html',
  styleUrl: './bookmark-form.component.css'
})
export class BookmarkFormComponent {
  // Formulario reutilizable
  @Input() form!: FormGroup;
  @Input() isAdmin = false;
  @Input() isEditMode = false;
  @Input() showForm = true;



  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();



  onSubmit() {
    this.save.emit();
  }

  onCancel() {
    this.cancel.emit();
  }



}
