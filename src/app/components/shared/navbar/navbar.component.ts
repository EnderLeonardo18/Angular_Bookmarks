import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  // Usamos un signal para que el HTML se actualice automáticamente
  isLogged = signal<boolean>(false);
  isAdmin = signal<boolean>(false);
  currentRoute = signal<string>(''); // Nueva señal para la ruta actual
  currentUser: any = null;



  ngOnInit(): void {
    // Escuchamos el observable del servicio
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user; // Asignar el usuario a la propiedad
      // Si hay usuario o token, mostramos la barra
      this.isLogged.set(!!user || !!localStorage.getItem('auth_token'));

      // Verificamos si el usuario tiene rol 'admin'
      // Ajusta 'user.role' según la estructura del DTO
      // Detectar si el usuario logueado es admin
      this.isAdmin.set(
        user?.role === 'admin' || localStorage.getItem('user_role') === 'admin',
      );
    });

    // Detectar cambios de ruta en tiempo real
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute.set(event.urlAfterRedirects);
      });
  }

  restrictedAccess() {
    this.toastr.error('Acceso Denegado');
  }

  // Método para verificar si la ruta coincide
  isRouteActive(route: string): boolean {
    return this.currentRoute() === route;
  }

  // Método para intentar navegar a rutas protegidas
  accessAdminPanel(event: Event) {
    if (!this.isAdmin()) {
      event.preventDefault(); // Evita que el link funcione
      this.toastr.warning('Solo disponible para los Administradores');
    }
  }

  logout() {
    this.authService.logout(); // Asegúrate de tener este método en tu servicio
    this.isLogged.set(false);
    this.router.navigate(['/login']);
  }

}
