import { Component, inject, OnInit } from '@angular/core';
import { BookmarkService } from '../../services/bookmark.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Bookmark } from '../../core/interfaces/bookmark.interface';
import { BookmarkDTO } from '../../core/dtos/bookmark.dto';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { BookmarkFormComponent } from '../shared/bookmark-form/bookmark-form.component';

@Component({
  selector: 'app-bookmark-list',
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './bookmark-list.component.html',
  styleUrl: './bookmark-list.component.css',
})
export class BookmarkListComponent implements OnInit {
  private readonly bookmarkService = inject(BookmarkService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);

  bookmarks: Bookmark[] = [];
  isEditMode = false;
  editingId: number | null = null;

  filterSelected: string = 'Todos'; // Estado del filtro
  // categories: string[] = ['Todos', 'Anime', 'Manga', 'Youtube', 'Otro'];
  categories: string[] = ['Todos', 'Anime', 'Manga', 'Youtube', 'Manhwa', 'Series', 'Peliculas', 'RRSS', 'Programacion' , 'Otro'];


  showForm = true; // Por defecto


  // Formulario simple para agregar marcadores
  bookmarkForm = this.fb.group({
    title: ['', [Validators.required]],
    url: ['', [Validators.required, Validators.pattern('https?://.+')]],
    category: ['Anime', [Validators.required]],
    description: ['', [Validators.maxLength(255)]],
    image_preview: [''], // Campo opcional para tu propia imagen
  });

  ngOnInit(): void {
    this.loadBookmarks();
  }

  loadBookmarks() {
    // El servicio ya apunta a la API que, en Laravel, debe filtrar por el usuario autenticado
    this.bookmarkService.getBookmarks().subscribe({
      next: (res: any) => {
        // Si usas ->paginate(10) en Laravel, los datos vienen en res.data
        this.bookmarks = res.data ? res.data : res;
      },
      error: () => {
        this.toastr.error('Error al cargar marcadores');
      },
    });
  }

  // Cargar datos en el formulario para editar
  onEdit(item: Bookmark) {
    this.isEditMode = true;
    this.editingId = item.id;
    this.bookmarkForm.patchValue({
      title: item.title,
      url: item.url,
      category: item.category,
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
          this.toastr.success('Marcador Actualizado');
          this.cancelEdit();
          this.loadBookmarks();
        },
      });
    } else {
      this.bookmarkService.createBookmark(data).subscribe({
        next: (newBookmark) => {
          this.toastr.success('Marcador Creado');
          this.bookmarks.unshift(newBookmark); // Agrega al inicio de la lista
          this.bookmarkForm.reset({ category: 'Anime' });
        },
        // error: (err) => this.toastr.error('Error al guardar❌')
      });
    }
  }

  onDelete(id: number) {
    if (!confirm('Eliminar marcador?')) return;

    this.bookmarkService.deleteBookmark(id).subscribe({
      next: () => {
        this.bookmarks = this.bookmarks.filter((b) => b.id !== id);
        this.toastr.info('Eliminado');
      },
    });
  }

  cancelEdit() {
    this.isEditMode = false;
    this.editingId = null;
    this.bookmarkForm.reset({ category: 'Anime' });
  }

  drop(event: CdkDragDrop<Bookmark[]>) {
    // 1. Si el elemento cayó en la misma posición, no hacemos nada
    if (event.previousIndex === event.currentIndex) return;

    // 2. Obtenemos los elementos involucrados desde la vista filtrada
    const displayedArray = this.filteredBookmarks;
    const itemMovido = displayedArray[event.previousIndex];
    const itemDestino = displayedArray[event.currentIndex];

    // 3. Encontramos sus posiciones REALES en el array principal de marcadores
    const indexRealOrigen = this.bookmarks.findIndex(
      (b) => b.id === itemMovido.id
    );
    const indexRealDestino = this.bookmarks.findIndex(
      (b) => b.id === itemDestino.id
    );

    // 4. Movemos el elemento en la lista maestra
    moveItemInArray(this.bookmarks, indexRealOrigen, indexRealDestino);

    this.toastr.info('Orden actualizado localmente');
  }


  toggleForm() {
    this.showForm = !this.showForm;
  }


  get filteredBookmarks() {
    if (this.filterSelected === 'Todos') return this.bookmarks;
    return this.bookmarks.filter((b) => b.category === this.filterSelected);
  }

  setFilter(category: string) {
    this.filterSelected = category;
  }

















// 1. Método para Imprimir / PDF
  printBookmarks() {
    window.print();
  }

  // 2. Método para Exportar JSON
  exportJSON() {
    const data = this.filteredBookmarks.map(item => ({
      titulo: item.title,
      url: item.url,
      categoria: item.category,
      descripcion: item.description,
      imagen: item.image_preview
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    this.downloadFile(blob, 'respaldo_marcadores.json');
  }

  // 3. Método para Exportar TXT
  exportTXT() {
    let content = "MIS MARCADORES - COPIA DE SEGURIDAD\n";
    content += `Fecha: ${new Date().toLocaleDateString()}\n`;
    content += "==========================================\n\n";

    this.filteredBookmarks.forEach((item, index) => {
      content += `${index + 1}. ${item.title.toUpperCase()}\n`;
      content += `   Categoría: ${item.category}\n`;
      content += `   Link: ${item.url}\n`;
      content += `   Nota: ${item.description || 'Sin descripción'}\n`;
      content += "------------------------------------------\n";
    });

    const blob = new Blob([content], { type: 'text/plain' });
    this.downloadFile(blob, 'lista_marcadores.txt');
  }

  // 4. Función auxiliar para la descarga automática
  private downloadFile(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
    this.toastr.success(`Archivo ${fileName} generado con éxito`);
  }




}



