import { Component, inject, OnInit } from '@angular/core';
import { BookmarkService } from '../../services/bookmark.service';
import { ToastrService } from 'ngx-toastr';
import { Bookmark, BOOKMARK_CATEGORIES, BOOKMARK_STATUSES } from '../../core/interfaces/bookmark.interface';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { BookmarkFormComponent } from '../shared/bookmark-form/bookmark-form.component';

@Component({
  selector: 'app-bookmark-list',
  imports: [CommonModule, DragDropModule, BookmarkFormComponent],
  templateUrl: './bookmark-list.component.html',
  styleUrl: './bookmark-list.component.css',
})
export class BookmarkListComponent implements OnInit {
  private readonly bookmarkService = inject(BookmarkService);
  private readonly toastr = inject(ToastrService);

  bookmarks: Bookmark[] = [];
  isEditMode = false;
  editingId: number | null = null;
  showForm = true; // Por defecto
  selectedBookmark: any = null; // <--- Nueva variable para pasar datos al hijo

  filterSelected: string = 'Todos'; // Estado del filtro
  filterCategories: string[] = ['Todos', ...BOOKMARK_CATEGORIES];



  readonly categories = BOOKMARK_CATEGORIES;


  filterStatus: string = 'Todos';
  readonly statusOptions = [ 'Todos', ...BOOKMARK_STATUSES];


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
  // Antes llenaba el formulario local, ahora solo debe "avisarle" al hijo.
  onEdit(item: Bookmark) {
    this.isEditMode = true;
    this.editingId = item.id;
    this.selectedBookmark = item; // Esto le pasa los datos al app-bookmark-form
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Este método lo llamará el HTML cuando el hijo emita (save)
// Este método centraliza si creamos o editamos
  handleSave(formData: any) {
    if (this.isEditMode && this.editingId) {
      // Llamas a tu lógica de updateBookmark
      this.bookmarkService.updateBookmark(this.editingId, formData).subscribe({
        next: () => {
          this.toastr.success('Marcador actualizado');
          this.loadBookmarks();
          this.cancelEdit();
        },
        error: () => this.toastr.error('Error al actualizar')
      });
    } else {
      // Llamas a tu lógica de createBookmark
      this.bookmarkService.createBookmark(formData).subscribe({
        next: (newBookmark) => {
          this.toastr.success('Marcador creado');
          // this.loadBookmarks();
          this.bookmarks.unshift(newBookmark); // Agrega al inicio de la lista
          this.cancelEdit();
        },
        error: () => this.toastr.error('Error al crear')
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
    this.selectedBookmark = null;
    this.showForm = false;
  }

  drop(event: CdkDragDrop<Bookmark[]>) {
    // 1. Si el elemento cayó en la misma posición, no hacemos nada
    if (event.previousIndex === event.currentIndex) return;

    // 2. Obtenemos los elementos involucrados desde la vista filtrada
    const displayedArray = this.filteredBookmarks;
    const itemMovido = displayedArray[event.previousIndex];
    const itemDestino = displayedArray[event.currentIndex];

    // 3. Encontramos sus posiciones REALES en el array principal de marcadores
    const indexRealOrigen = this.bookmarks.findIndex( (b) => b.id === itemMovido.id );
    const indexRealDestino = this.bookmarks.findIndex( (b) => b.id === itemDestino.id );

    // 4. Movemos el elemento en la lista maestra
    moveItemInArray(this.bookmarks, indexRealOrigen, indexRealDestino);


    // 5. Guardar el nuevo orden en el backend
    const orderedIds = this.bookmarks.map(b => b.id);
    this.bookmarkService.updateOrder(orderedIds).subscribe({
      next: () => this.toastr.success('Orden guardado permanentemente'),
      error: (err) => {
        console.error(err);
        this.toastr.error('Error al guardar el orden. Recargando...')
        this.loadBookmarks(); // Recargara y deshace el cambio visual
      }
    })
  }


    setStatusFilter(event: Event) {
      const select = event.target as HTMLSelectElement;
      this.filterStatus = select.value;
    }

    setFilter(category: string) {
      this.filterSelected = category;
    }

    resetFilters() {
      this.filterSelected = 'Todos';
      this.filterStatus = 'Todos';
    }


  toggleForm() {
    this.showForm = !this.showForm;
  }


  // Obtener los datos del filtro
  get filteredBookmarks() {
    let result = this.bookmarks;
    if (this.filterSelected !== 'Todos') {
      result = result.filter(b => b.category === this.filterSelected);
    }
    if (this.filterStatus !== 'Todos') {
      result = result.filter(b => b.status === this.filterStatus);
    }
    return result;
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
      estado: item.status,
      descripcion: item.description,
      imagen: item.image_preview,
      progreso_nota: item.progress_note,
      progreso_url: item.progress_url,
    }));
    // ...
  }

  // 3. Método para Exportar TXT
  exportTXT() {
    let content = "MIS MARCADORES - COPIA DE SEGURIDAD\n";
    content += `Fecha: ${new Date().toLocaleDateString()}\n`;
    content += "==========================================\n\n";

    this.filteredBookmarks.forEach((item, index) => {
    content += `${index + 1}. ${item.title.toUpperCase()}\n`;
    content += `   Categoría: ${item.category}\n`;
    content += `   Estado: ${item.status}\n`;
    content += `   Link: ${item.url}\n`;
    if (item.progress_note) content += `   Progreso: ${item.progress_note}\n`;
    if (item.progress_url) content += `   Link de progreso: ${item.progress_url}\n`;
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



