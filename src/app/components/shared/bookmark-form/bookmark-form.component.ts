import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Bookmark, BOOKMARK_CATEGORIES, BOOKMARK_STATUSES } from '../../../core/interfaces/bookmark.interface';
import { BookmarkDTO } from '../../../core/dtos/bookmark.dto';

@Component({
  selector: 'app-bookmark-form',
  standalone: true,
  imports: [ CommonModule , ReactiveFormsModule],
  templateUrl: './bookmark-form.component.html',
  styleUrl: './bookmark-form.component.css'
})
export class BookmarkFormComponent {

  private fb = inject(FormBuilder);

  // Formulario reutilizable
  @Input() isEditMode = false;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>()


  readonly categories = BOOKMARK_CATEGORIES;
  readonly statusOptions = BOOKMARK_STATUSES;


  // Formulario simple para agregar marcadores
  bookmarkForm = this.fb.group({
    url: ['', [Validators.required, Validators.pattern('https?://.+')]],
    title: ['', [Validators.required]],
    description: ['', [Validators.maxLength(255)]],
    category: ['Anime', [Validators.required]],
    image_preview: [''], // Campo opcional para tu propia imagen
    status: ['Pendiente', [Validators.required]],
    progress_note: [''],
    progress_url: ['', [Validators.pattern('https?://.+')]]
  });


    get progressPlaceholder(): string {
    // 1. Obtenemos el valor actual que el usuario seleccionó en el select de 'category'
    const cat = this.bookmarkForm.get('category')?.value;

    // 2. Comparamos y retornamos un texto de ayuda (hint) específico
    if (cat === 'Manga' || cat === 'Manhwa') return 'Ej: Tomo 1, Cap 24'
    if(cat === 'Youtube' || cat === 'Series') return 'Ej: Temporada 2, Ep 5';
    // 3. Si no es ninguna de las anteriores, damos un mensaje genérico
    return '¿Por dónde vas?';
  }


  @Input() set bookmarkData(data: Partial<Bookmark>) {
    if(data) {
      this.bookmarkForm.patchValue(data)
    }
  }


  submit() {
    if (this.bookmarkForm.valid) {
      this.save.emit(this.bookmarkForm.value as BookmarkDTO);
    }
  }


}
