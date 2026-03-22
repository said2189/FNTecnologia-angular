import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProductRequestDto } from '../../models/product.dto';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class ProductEditComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    nombre: ['', Validators.required],
    categoria: ['', Validators.required],
    precio: [0, Validators.required],
    estado: [true, Validators.required],
    descripcion: ['']
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loading.set(true);
    this.productService.getById(id).subscribe({
      next: product => {
        this.form.patchValue({
          nombre: product.nombre,
          categoria: product.categoria,
          precio: product.precio,
          estado: product.estado,
          descripcion: product.descripcion ?? ''
        });
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.message || 'Error al cargar producto');
        this.loading.set(false);
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.route.snapshot.paramMap.get('id')!;

    const dto: ProductRequestDto = {
      nombre: this.form.value.nombre!,
      categoria: this.form.value.categoria!,
      precio: this.form.value.precio!,
      estado: this.form.value.estado!,
      descripcion: this.form.value.descripcion ?? ''
    };

    this.loading.set(true);
    this.productService.update(id, dto).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/products']);
      },
      error: err => {
        this.error.set(err.message || 'Error al actualizar producto');
        this.loading.set(false);
      }
    });
  }
}