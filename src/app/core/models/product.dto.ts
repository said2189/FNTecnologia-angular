export interface ProductRequestDto {
  nombre: string;
  categoria: string;
  precio: number;
  estado: boolean;
  descripcion?: string;
}

export interface ProductResponseDto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  estado: boolean;
  descripcion?: string;
}
