import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  standalone: true,
  imports:[CurrencyPipe, RouterModule]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private authService = inject(AuthService);

  products = this.productService.products;
  loading = signal(false);
  error = signal<string | null>(null);

  isAdmin = computed(() => this.authService.userRole() === 'Admin');

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.productService.loadAll().subscribe({
      next: () => { this.loading.set(false); this.error.set(null); },
      error: (err) => { this.loading.set(false); this.error.set('Error en la solicitud, intentelo nuevamente'); }
    });
  }

  delete(id: string) {
    this.productService.delete(id).subscribe({
      next: () => {},
      error: e => {
        if (e.status === 403) {
          this.error.set('No tienes permisos para eliminar productos.');
        } else {
          this.error.set('Error al eliminar');
        }
      }
    });
  }

  edit(id: string) {
    this.router.navigate(['/products', id, 'edit']);
  }
}