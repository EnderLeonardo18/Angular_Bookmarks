import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-user-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {

  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly toastr = inject(ToastrService);

  users: any[] = [];
  currentUser: any = null;
  successMessage: string | null = null;


  ngOnInit(){
    // Recuperamos los datos del usuario que guardamos en el login
    // Nota: Deberías guardar el objeto user en localStorage al hacer login
    const userJson = localStorage.getItem('user_data');
    this.currentUser = userJson ? JSON.parse(userJson) : { first_name: 'Usuario', role: 'user' };

    this.loadUser();
  }

  loadUser(){
    this.userService.getUser().subscribe({
      next: (data: any) => {
        // Laravel paginate devuelve los datos en 'data'
        this.users = data.data;
      },
      error: (err) => console.error('Error cargando usuarios', err)
    });
  }


  deleteUser(id: number) {
    if(confirm('Estas seguro de eliminar este usuario?')){
      this.userService.deleteUser(id).subscribe(()=> {
        this.successMessage = 'Usuario eliminado correctamente';
        this.toastr.success('Usuario eliminado correctamente');
        this.loadUser(); // Recargamos la lista

        // Limpia mensaje después de 3 segundos
        setTimeout(()=> {
          this.successMessage = null, 3000
        })
      })
    }
  }


  onLogout() {
    this.authService.logout();
    this.toastr.success('Sesión cerrada correctamente');
    this.router.navigate(['/login']);
  }

}
