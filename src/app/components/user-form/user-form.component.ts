import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { UserDTO } from '../../core/dtos/user.dto';


@Component({
  selector: 'app-user-form',
  imports: [
    CommonModule,                // AGREGADO: Para usar ngIf, ngClass y pipes
    RouterLink,                  // AGREGADO: Para formularios reactivos
    ReactiveFormsModule          // AGREGADO: Para que funcione el botón Cancelar

  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css',

})
export class UserFormComponent implements OnInit{

  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly toastr = inject(ToastrService);

  userId: number | null = null;
  isEditMode = false;
  errors: Partial<Record<keyof UserDTO, string[]>> = {}; // Para mostrar errores de validación de Laravel

  isAdmin = false;


  userForm = this.fb.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    role: ['user', [Validators.required]],
    // NUEVO: Quitamos el Validators.required de aquí para manejarlo dinámicamente
    password: ['', [Validators.minLength(8)]], // Opcional en edición  AJUSTAR IMPORTANTE
    password_confirmation: ['', [Validators.minLength(8)]],
    current_password: [''] // Requerido por tu UpdateUserRequest
  })


  ngOnInit(): void {
    // Verificamos si hay ID en la URL
    const id = this.route.snapshot.paramMap.get('id');
    if(id) {
      this.userId = +id;
      this.isEditMode = true;
      // NUEVO: En edición, la contraseña no es obligatoria (Validators.required no se aplica)
      // Si editamos, la contraseña no es obligatoria
      this.loadUser(this.userId);
    } else {
      // NUEVO: En creación, forzamos que la contraseña sea obligatoria
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      // this.userForm.get('password_confirmation')?.setValidators([Validators.required, Validators.minLength(8)]);
    }



    if(!this.isAdmin) {
      this.userForm.get('role')?.disable();
    }

  }


  loadUser(id: number) {
    this.userService.getUserById(id).subscribe((user: any) => {
      // NUEVO: Usamos patchValue para cargar datos sin tocar los campos de password
      this.userForm.patchValue({
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        role: user.role
      });
    });
  }


  onSubmit() {
    if(this.userForm.invalid) return;


    // 1. Limpieza de datos: Clonamos para no afectar visualmente al formulario
    const payload = { ...this.userForm.value } as UserDTO;


    if(this.isEditMode){
      if(!payload.password){
        delete payload.password;
        delete payload.password_confirmation;
      }
      // Si no quieres cambiar nada sensible, a veces current_password puede sobrar,
      // pero tu Request de Laravel lo pide como 'required'.
    }

      const request = this.isEditMode
      ? this.userService.updateUser(this.userId!, payload)
      : this.userService.createUser(payload);

    request.subscribe({
      next: () => {
        // 1. Disparar la notificación de éxito
        const mensaje = this.isEditMode
        ? 'Usuario actualizado correctamente'
        : 'Usuario creado con éxito';

        this.toastr.success(mensaje);

        // 2. Limpieza de UI
        // Forzamos al body a recuperar el scroll y eliminamos cualquier clase de bloqueo // COMENTARIO: Solución al "Sombreado Negro" / Pantalla bloqueada
        document.body.style.overflow = 'auto';
        this.router.navigate(['/users']);
      },

      error: (err) => {
        if(err.status === 422) {
          this.errors = err.error.errors; // Captura errores de StoreUserRequest/UpdateUserRequest
          this.toastr.warning('Por favor revisa los errores del formulario', 'Datos Inválidos')
        } else if(err.status === 500) {
          // alert('Error 500: Probablemente la "Contraseña Actual" es incorrecta o falta ')
          // En lugar de alert, usamos toastr.error
          this.toastr.error('Error del servidor: revisa la contraseña actual o los datos enviados', 'Error 500')
        } else {
          this.toastr.error('Ocurrio un error inesperado', 'Error');
        }
      }
    });
  }


}
