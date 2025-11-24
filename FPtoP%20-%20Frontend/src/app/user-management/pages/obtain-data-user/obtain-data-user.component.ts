import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/features/auth/services/user.service';
import { UserManagementService } from '../../services/user-management.service';

@Component({
  selector: 'app-obtain-data-user',
  templateUrl: './obtain-data-user.component.html',
  styleUrls: ['./obtain-data-user.component.css'],
})
export class ObtainDataUserComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private userManagementService: UserManagementService
  ) { }

  ngOnInit(): void {
    localStorage.removeItem('user');
    this.userManagementService.getCurrentUserSession().subscribe({
      next: data => {
        if (!data || !data.data || data.data.length === 0) {
          console.error('Respuesta vacía al obtener usuario:', data);
          this.router.navigate(['/auth/login']);
          return;
        }

        const userInformation = data.data[0];
        if (!userInformation) {
          console.error('Información de usuario inválida:', userInformation);
          this.router.navigate(['/auth/login']);
          return;
        }

        // Guarda la info de usuario
        this.userService.saveUserInfo(userInformation);

      },
      error: err => {
        console.error('Error al obtener información del usuario:', err);
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
