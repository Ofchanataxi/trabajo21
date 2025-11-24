import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  numberValue: number | null = null;
  private userService = inject(UserService);

  onNumberInput(): void {
    // this.userService.changeUserInfo(this.numberValue!)
    // //TODO: Borrar el console log
    // console.log('Número ingresado:', this.numberValue);
  }
}
