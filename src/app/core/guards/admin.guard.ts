import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";


export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUserValue; // Obtén el usuario del localStorage/BehaviorSubject

  if(user && user.role === 'admin') {
    return true;
  }

  router.navigate(['/bookmarks']); // Si no es admin, mándalo a sus marcadores
  return false;


}
