import { Component, inject, OnInit } from '@angular/core';
import { BookmarkService } from '../../services/bookmark.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Bookmark } from '../../core/interfaces/bookmark.interface';
import { BookmarkDTO } from '../../core/dtos/bookmark.dto';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-admin-bookmark-list',
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './admin-bookmark-list.component.html',
  styleUrl: './admin-bookmark-list.component.css',
})
export class AdminBookmarkListComponent implements OnInit {
  private readonly bookmarkService = inject(BookmarkService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);

  bookmarks: Bookmark[] = [];
  isEditMode = false;
  editingId: number | null = null;
  filterSelected: string = 'Todos';
  categories: string[] = ['Todos', 'Anime', 'Manga', 'Youtube', 'Manhwa', 'Series', 'Peliculas', 'RRSS', 'Programacion' , 'Otro'];
  showForm = true;

  bookmarkForm = this.fb.group({
    title: ['', [Validators.required]],
    url: ['', [Validators.required, Validators.pattern('https?://.+')]],
    category: ['Anime', [Validators.required]],
    description: ['', [Validators.maxLength(255)]],
    image_preview: [''],
  });

  ngOnInit(): void {
    this.loadAllBookmarks(); // LLAMADA AL NUEVO MÉTODO
  }

  loadAllBookmarks() {
    // Usamos el método que creamos en el servicio para ADMIN
    this.bookmarkService.getAllBookmarksAdmin().subscribe({
      next: (res: any) => {
        this.bookmarks = res.data ? res.data : res;
      },
      error: () => this.toastr.error('Error al cargar vista de administrador'),
    });
  }

  onEdit(item: Bookmark) {
    this.isEditMode = true;
    this.editingId = item.id;
    this.showForm = true;
    this.bookmarkForm.patchValue({
      title: item.title,
      url: item.url,
      category: item.category as any,
      description: item.description,
      image_preview: item.image_preview,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSave() {
    if (this.bookmarkForm.invalid) return;
    const data = this.bookmarkForm.value as BookmarkDTO;

    if (this.isEditMode && this.editingId) {
      this.bookmarkService.updateBookmark(this.editingId, data).subscribe({
        next: () => {
          this.toastr.success('Marcador actualizado (Admin)');
          this.cancelEdit();
          this.loadAllBookmarks();
        },
      });
    } else {
      this.bookmarkService.createBookmark(data).subscribe({
        next: (newBookmark) => {
          this.toastr.success('Marcador creado como Admin');
          this.bookmarks.unshift(newBookmark);
          this.bookmarkForm.reset({ category: 'Anime' });
          this.showForm = false;
        },
      });
    }
  }

  onDelete(id: number) {
    if (!confirm('¿Estás seguro de eliminar este marcador? (Acción de administrador)')) return;

    this.bookmarkService.deleteBookmark(id).subscribe({
      next: () => {
        this.bookmarks = this.bookmarks.filter((b) => b.id !== id);
        this.toastr.warning('Marcador eliminado por moderación');
      },
    });
  }

  // Métodos auxiliares igual que el original
  cancelEdit() {
    this.isEditMode = false;
    this.editingId = null;
    this.bookmarkForm.reset({ category: 'Anime' });
    this.showForm = false;
  }

  // METODO PARA MANEJAR EL ARRASTRE
  drop(event: CdkDragDrop<Bookmark[]>) {
    moveItemInArray(this.bookmarks, event.previousIndex, event.currentIndex);
  }

  toggleForm() { this.showForm = !this.showForm; }

  setFilter(category: string) { this.filterSelected = category; }

  get filteredBookmarks() {
    if (this.filterSelected === 'Todos') return this.bookmarks;
    return this.bookmarks.filter((b) => b.category === this.filterSelected);
  }
}
