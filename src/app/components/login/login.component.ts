import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Login } from '../../core/interfaces/auth.interface';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly toastr = inject(ToastrService);


  errorMessage: string | null = null; // Para mostrar errores de Laravel

  loginForm = this.fb.group({
    // Usamos nonNullable: true para que TS sepa que el valor no será null
    email: ['', { validators: [Validators.required, Validators.email], nonNullable: true }],
    password: ['', { validators:  [Validators.required], nonNullable: true }]
  });


  onSubmit(){
    if(this.loginForm.valid)  {

      this.errorMessage = null; //Limpia el error

      // // 1. Limpieza de datos: Clonamos para no afectar visualmente al formulario
      const credentials = this.loginForm.getRawValue() as Login;

      this.authService.login(credentials).subscribe({
        next: (res) => {
          console.log('Token recibido:', res.token);
          this.toastr.success('Inicio de Sesión. Bienvenido!!!')
          // Al usar el tap en el servicio, los datos ya se guardaron en localStorage
          this.router.navigate(['/users']); // Nos lleva al CRUD tras loguear
        },
        error: (err) => {
          // Captura el 'Message' => 'Credenciales incorrectas' de tu Laravel
          this.errorMessage = err.error.message || 'Error al iniciar sesión';
          this.toastr.error( this.errorMessage ||'Error desconocido');
        }
      });
    }
  }


}
