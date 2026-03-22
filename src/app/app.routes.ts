import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login.component';
import { ProductListComponent } from './core/features/products/product-list.component';
import { authGuard } from './core/guards/auth.guard'; 
import { ProductEditComponent } from './core/features/products/product-edit.component';
import { ProductFormComponent } from './core/features/products/product-form.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'products', component: ProductListComponent, canActivate: [authGuard] },
  { path: 'products/create', component: ProductFormComponent, canActivate: [authGuard] },
  { path: 'products/:id/edit', component: ProductEditComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/products', pathMatch: 'full' }
];