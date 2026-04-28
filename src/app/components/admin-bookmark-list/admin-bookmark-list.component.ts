import { Component, inject, OnInit } from '@angular/core';
import { BookmarkService } from '../../services/bookmark.service';
import { ToastrService } from 'ngx-toastr';
import { Bookmark, BOOKMARK_CATEGORIES, BOOKMARK_STATUSES } from '../../core/interfaces/bookmark.interface';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { BookmarkFormComponent } from '../shared/bookmark-form/bookmark-form.component';

@Component({
  selector: 'app-admin-bookmark-list',
  imports: [CommonModule, DragDropModule, BookmarkFormComponent],
  templateUrl: './admin-bookmark-list.component.html',
  styleUrl: './admin-bookmark-list.component.css',
})
export class AdminBookmarkListComponent implements OnInit {
  private readonly bookmarkService = inject(BookmarkService);
  private readonly toastr = inject(ToastrService);

  bookmarks: Bookmark[] = [];
  isEditMode = false;
  editingId: number | null = null;
  showForm = true;
  selectedBookmark: any = null;

  filterSelected: string = 'Todos'; // Estado del filtro
  filterCategories: string[] = ['Todos', ...BOOKMARK_CATEGORIES];

  readonly categories = BOOKMARK_CATEGORIES;

  filterStatus: string = 'Todos';
  readonly statusOptions = [ 'Todos', ...BOOKMARK_STATUSES];


  ngOnInit(): void {
    this.loadAllBookmarks();
  }

  loadAllBookmarks() {
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
    this.selectedBookmark = item;
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleSave(formData: any) {
    if (this.isEditMode && this.editingId) {
      this.bookmarkService.updateBookmark(this.editingId, formData).subscribe({
        next: () => {
          this.toastr.success('Marcador actualizado (Admin)');
          this.loadAllBookmarks();
          this.cancelEdit();
        },
        error: () => this.toastr.error('Error al actualizar'),
      });
    } else {
      this.bookmarkService.createBookmark(formData).subscribe({
        next: (newBookmark) => {
          this.toastr.success('Marcador creado como Admin');
          this.bookmarks.unshift(newBookmark);
          this.cancelEdit();
        },
        error: () => this.toastr.error('Error al crear'),
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
        this.loadAllBookmarks(); // Recargara y deshace el cambio visual
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
    let result = this.bookmarks
    if (this.filterSelected !== 'Todos') {
      result = result.filter(b => b.category === this.filterSelected)
    };
    if(this.filterStatus !== 'Todos'){
      result = result.filter(b => b.status === this.filterStatus);
    }
    return result;

  }










  // ========== MÉTODOS DE EXPORTACIÓN ==========
  printBookmarks() {
    window.print();
  }

  exportJSON() {
    const data = this.filteredBookmarks.map(item => ({
      id: item.id,
      titulo: item.title,
      url: item.url,
      categoria: item.category,
      estado: item.status,
      descripcion: item.description || 'Sin descripción',
      imagen_preview: item.image_preview || 'Sin imagen',
      progreso_nota: item.progress_note || 'Sin progreso registrado',
      progreso_url: item.progress_url || 'Sin URL de progreso',
      propietario: item.user?.username || `ID: ${item.user_id}`,
      fecha_creacion: item.created_at || 'Fecha no disponible'
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    this.downloadFile(blob, 'admin_marcadores_completo.json');
  }

  exportTXT() {
    let content = "=".repeat(80) + "\n";
    content += "                 PANEL ADMIN - REPORTE DE MARCADORES\n";
    content += "=".repeat(80) + "\n";
    content += `Fecha de exportación: ${new Date().toLocaleString()}\n`;
    content += `Total de marcadores: ${this.filteredBookmarks.length}\n`;
    content += "=".repeat(80) + "\n\n";

    this.filteredBookmarks.forEach((item, index) => {
      content += `📌 [${index + 1}] ${item.title.toUpperCase()}\n`;
      content += `   ├─ 👤 Propietario: ${item.user?.username || 'ID: ' + item.user_id}\n`;
      content += `   ├─ 🔗 URL: ${item.url}\n`;
      content += `   ├─ 📂 Categoría: ${item.category}\n`;
      content += `   ├─ 📊 Estado: ${item.status}\n`;
      content += `   ├─ 📝 Descripción: ${item.description || 'Sin descripción'}\n`;
      content += `   ├─ 🖼️ Imagen: ${item.image_preview || 'Sin imagen'}\n`;
      if (item.progress_note) content += `   ├─ 📈 Progreso: ${item.progress_note}\n`;
      if (item.progress_url) content += `   ├─ 🔗 Link progreso: ${item.progress_url}\n`;
      content += `   └─ 📅 Creado: ${item.created_at || 'Fecha no disponible'}\n`;
      content += "\n" + "─".repeat(80) + "\n\n";
    });

    content += "\n" + "=".repeat(80) + "\n";
    content += "                   FIN DEL REPORTE DE ADMIN\n";
    content += "=".repeat(80);

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    this.downloadFile(blob, 'admin_marcadores_completo.txt');
  }



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









