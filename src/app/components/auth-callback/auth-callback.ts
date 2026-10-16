import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';

@Component({
  imports: [],
  selector: 'app-auth-callback',
  styleUrl: './auth-callback.css',
  templateUrl: './auth-callback.html',
})
export class AuthCallback implements OnInit {
  private authService = inject(AuthService);

  ngOnInit(): void {
    void this.authService.handleCallback();
  }
}
