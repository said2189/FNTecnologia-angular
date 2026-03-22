import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductRequestDto, ProductResponseDto } from '../models/product.dto';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environment'; 

@Injectable({ providedIn: 'root' })
export class ProductService {
  private productsSignal = signal<ProductResponseDto[]>([]);
  public products = this.productsSignal.asReadonly();

  constructor(private http: HttpClient) {}

  loadAll() {
    return this.http.get<ProductResponseDto[]>(`${environment.apiUrlProduct}/products`)
      .pipe(tap((list: ProductResponseDto[]) => this.productsSignal.set(list)));
  }

  getById(id: string) {
    return this.http.get<ProductResponseDto>(`${environment.apiUrlProduct}/products/${id}`).pipe(
      tap((product: ProductResponseDto) => {
        this.productsSignal.update(prev => {
          const exists = prev.some(p => p.id === product.id);
          return exists
            ? prev.map(p => p.id === product.id ? product : p)
            : [...prev, product];
        });
      })
    );
  }
  
  create(dto: ProductRequestDto) {
    return this.http.post<ProductResponseDto>(`${environment.apiUrlProduct}/products`, dto).pipe(
      tap((created: ProductResponseDto) => this.productsSignal.update(prev => [created, ...prev]))
    );
  }
  
  update(id: string, dto: ProductRequestDto) {
    return this.http.put<ProductResponseDto>(`${environment.apiUrlProduct}/products/${id}`, dto).pipe(
      tap((updated: ProductResponseDto) =>
        this.productsSignal.update(prev =>
          prev.map(p => p.id === updated.id ? updated : p)
        )
      )
    );
  }

  delete(id: string) {
    return this.http.delete<void>(`${environment.apiUrlProduct}/products/${id}`).pipe(
      tap(() => this.productsSignal.update(prev => prev.filter(p => p.id !== id)))
    );
  }
}