import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { BookmarkListComponent } from './components/bookmark-list/bookmark-list.component';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { AdminBookmarkListComponent } from './components/admin-bookmark-list/admin-bookmark-list.component';

export const routes: Routes = [

  { path: 'login', component: LoginComponent, title: 'Iniciar Sesión' },

  // RUTAS PROTEGIDAS PARA ADMIN
  // { path: 'users', component: UserListComponent, canActivate: [authGuard ,adminGuard] , title: 'Lista de Usuarios' },
  { path: 'users', component: UserListComponent, canActivate: [authGuard] , title: 'Lista de Usuarios' },
  // { path: 'users/create', component: UserFormComponent,canActivate: [authGuard ,adminGuard] ,title: 'Crear Usuario' },
  { path: 'users/create', component: UserFormComponent ,title: 'Crear Usuario' },
  // { path: 'users/edit/:id', component: UserFormComponent, canActivate: [authGuard ,adminGuard] , title: 'Editar Usuario' },
  { path: 'users/edit/:id', component: UserFormComponent, title: 'Editar Usuario' },
  { path: 'profile', component: UserFormComponent, canActivate: [authGuard], title: 'Mi Perfil' },

  {path: 'admin/bookmarks', component: AdminBookmarkListComponent, canActivate: [authGuard, adminGuard], title: 'Lista de Admin'},

  // RUTAS PROTEGIDAS PARA CUALQUIER USUARIO LOGUEADO
  { path: 'bookmarks', component: BookmarkListComponent, canActivate: [authGuard] , title: 'Lista de Marcadores'},

  { path: '', redirectTo: 'login', pathMatch: 'full' }

];
