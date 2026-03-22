import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service'; 

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [RouterModule]
})
export class NavbarComponent {
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}