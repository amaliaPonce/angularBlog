// login.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';  // Importa el Router
import { BlogService } from '../blog.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  error: string = '';

  constructor(private blogService: BlogService, private router: Router) {}  // Inyecta el Router

  login(): void {
    this.error = '';
    this.isLoading = true;

    if (!this.email || !this.password) {
      this.error = 'Por favor, ingresa tu correo y contraseña.';
      this.isLoading = false;
      return;
    }

    this.blogService.loginService(this.email, this.password)
      .pipe(
        catchError(error => {
          console.error('Error en el inicio de sesión:', error);
          return of(null); // Retorna un observable para evitar que el error se propague
        })
      )
      .subscribe(response => {
        if (response) {
          // Almacena todos los datos del usuario en localStorage
          localStorage.setItem('userData', JSON.stringify(response));

          // Redirige a la página del blog
          this.router.navigate(['/blog']);  // 'blog' debe coincidir con la ruta configurada en tu AppRoutingModule
        } else {
          this.error = 'Hubo un error en el inicio de sesión.';
        }
      })
      .add(() => this.isLoading = false);
  }
}
