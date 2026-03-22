import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service'; 
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProductRequestDto, ProductResponseDto } from '../../models/product.dto';
import { AuthService } from '../../services/auth.service';

@Component({ 
  selector: 'app-product-form', 
  templateUrl: './product-form.component.html',
  standalone: true,
  imports:[ ReactiveFormsModule, RouterModule ]
})
export class ProductFormComponent implements OnInit {
  fb = inject(FormBuilder);
  productService = inject(ProductService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  authService = inject(AuthService);

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    categoria: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0)]],
    estado: [true, Validators.required],
    descripcion: ['']
  });

  isEdit = false;
  productId?: string;

  isAdmin = signal(this.authService.userRole() === 'Admin');
  error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.productId = id;
      this.productService.getById(id).subscribe((p: ProductResponseDto) => {
        this.form.patchValue(p);
      });
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: ProductRequestDto = this.form.getRawValue();

    if (this.isEdit && this.productId) {
      this.productService.update(this.productId, dto).subscribe({
        next: () => this.router.navigate(['/products']),
        error: err => {
          if (err.status === 403) {
            this.error.set('No tienes permisos para editar productos.');
          } else {
            this.error.set('Error al actualizar producto');
          }
        }
      });
    } else {
      this.productService.create(dto).subscribe({
        next: () => this.router.navigate(['/products']),
        error: err => {
          if (err.status === 403) {
            this.error.set('No tienes permisos para registrar productos.');
          } else {
            this.error.set('Error al registrar producto');
          }
        }
      });
    }
  }
}