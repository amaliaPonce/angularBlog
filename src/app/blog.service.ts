// blog.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../enviroments/enviroment';

interface Article {
  id: number;
  title: string;
  content: string;
  created_at: string;
  author_id: number;  // Cambiado a number
  image_url: string;
}

interface ArticleResponse {
  articles: Article[];
  totalCount: number;
}

interface ArticleCreationData {
  title: string;
  content: string;
  author_id: number;
  category_id: number;
  image_url: string;
  imageFile: File;
}

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = environment.backendUrl;

  constructor(private http: HttpClient) {}

  getBackendUrl(): string {
    return this.apiUrl;
  }

  registerService(name: string, email: string, password: string): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);

    return this.http.post(`${this.apiUrl}/register`, formData).pipe(
      catchError((error) => {
        console.error('Error en la solicitud de registro:', error);
        throw error;
      })
    );
  }

  loginService(email: string, password: string): Observable<any> {
    const body = { email, password };

    return this.http.post(`${this.apiUrl}/login`, body).pipe(
      catchError((error) => {
        console.error('Error en la solicitud de inicio de sesión:', error);
        throw error;
      })
    );
  }

  getAllArticles(page: number, pageSize: number): Observable<ArticleResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ArticleResponse>(`${this.apiUrl}/articles`, { params }).pipe(
      catchError((error) => {
        console.error('Error al obtener todos los artículos:', error);
        throw error;
      })
    );
  }

  getArticleById(id: number): Observable<ArticleResponse> {
    return this.http.get<ArticleResponse>(`${this.apiUrl}/articles/${id}`).pipe(
      catchError((error) => {
        console.error('Error al obtener el artículo por ID:', error);
        throw error;
      })
    );
  }

  createArticle(articleData: ArticleCreationData): Observable<any> {
    return this.uploadImage(articleData.imageFile).pipe(
      switchMap((uploadResponse: any) => {
        if (uploadResponse && uploadResponse.message === 'Imagen subida con éxito' && uploadResponse.url) {
          const formData = new FormData();
          formData.append('title', articleData.title);
          formData.append('content', articleData.content);
          formData.append('author_id', articleData.author_id.toString());
          formData.append('category_id', articleData.category_id.toString());
          
          const imageUrl = uploadResponse.url;
          formData.append('image_url', imageUrl);

          const headers = new HttpHeaders();

          const apiUrl = `${this.apiUrl}/articles`;
          console.log('URL de la solicitud:', apiUrl);
          console.log('Cuerpo de la solicitud para crear el artículo:', formData);

          return this.http.post(apiUrl, formData, { headers }).pipe(
            catchError((error) => {
              console.error('Error al crear el artículo:', error);
              throw error;
            })
          );
        } else {
          throw new Error('La respuesta del servidor no incluye la URL de la imagen.');
        }
      })
    );
  }

  private uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('imagen', file);
    return this.http.post(`${this.apiUrl}/upload`, formData).pipe(
      catchError((error) => {
        console.error('Error al subir la imagen:', error);
        throw error;
      })
    );
  }
  
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/names`).pipe(
      catchError((error) => {
        console.error('Error al obtener los nombres de los usuarios:', error);
        throw error;
      })
    );
  }
  
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`).pipe(
      catchError((error) => {
        console.error('Error al obtener las categorías:', error);
        throw error;

      })
    );
  }

  createCategory(category: { name: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, category).pipe(
      catchError((error) => {
        console.error('Error al crear la categoría:', error);
        throw error;
      })
    );
  }
}  

