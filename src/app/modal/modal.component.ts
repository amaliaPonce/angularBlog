// modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { BlogService } from '../blog.service';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { of, empty } from 'rxjs';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  @Input() showDetails: boolean = false;
  @Input() newArticleData: any;
  @Input() users: any[] = [];
  @Input() categories: any[] = [];
  @Input() showCategoryForm: boolean = false;

  @Output() createArticleEvent: EventEmitter<any> = new EventEmitter();
  @Output() onFileChangeEvent: EventEmitter<any> = new EventEmitter();
  @Output() createCategoryEvent: EventEmitter<any> = new EventEmitter();

  newCategoryName: string = '';

  totalArticles: number = 0;
  totalPages: number = 0;
  pageSize: number = 3;
  page: number = 1;
  articles: any[] = [];

  constructor(private blogService: BlogService) {
    this.clearNewArticleData();
    this.showDetails = false; 
  }
  

  ngOnInit() {
    this.loadUsers();
    this.loadCategories();
  }

  toggleDetails() {
    console.log('showDetails antes:', this.showDetails);
    this.showDetails ? this.closeModal() : this.openModal();
    console.log('showDetails después:', this.showDetails);
  }

  openModal() {
    this.showDetails = true;
  }

  closeModal() {
    this.showDetails = false;
    this.createArticleEvent.emit();
  }

  closeCategoryForm() {
    this.showCategoryForm = false;
    this.createCategoryEvent.emit();
    this.closeModal();  // Cierra el modal después de crear la categoría si es necesario
  }

  createCategory() {
    this.blogService.createCategory({ name: this.newCategoryName }).subscribe(
      (response: any) => {
        console.log('Categoría creada con éxito', response);
        this.createCategoryEvent.emit();
      },
      (error) => {
        console.error('Error al crear la categoría', error);
      }
    );
  }

  loadCategories() {
    this.blogService.getCategories().subscribe(
      (response: any) => {
        this.categories = response.categories;
      },
      (error: any) => {
        console.error('Error al cargar las categorías.', error);
      }
    );
  }

  loadUsers() {
    this.blogService.getUsers().subscribe(
      (response: any) => {
        this.users = response.users;
      },
      (error) => {
        console.error('Error al cargar los nombres de los usuarios.', error);
      }
    );
  }

  getFullImageUrl(relativeUrl: string): string {
    return this.blogService.getBackendUrl() + relativeUrl;
  }

  createArticle() {
    if (!this.newArticleData.imageFile) {
      console.error('No se ha proporcionado ninguna imagen para el artículo.');
      return;
    }

    this.blogService
      .createArticle(this.newArticleData)
      .pipe(
        tap((response) => {
          console.log('Artículo creado con éxito', response);
          this.loadArticles();
          this.clearNewArticleData();
          this.showDetails = false;
          console.log('showDetails después de crear artículo:', this.showDetails);
        }),
        catchError((error) => {
          console.error('Error al crear el artículo', error);
          throw error;
        })
      )
      .subscribe();
  }

  clearNewArticleData() {
    this.newArticleData = {
      title: '',
      content: '',
      author_id: 0,
      category_id: 0,
      image_url: '',
      imageFile: new File([], ''),
    };
  }

  loadArticles() {
    this.blogService
      .getAllArticles(this.page, this.pageSize)
      .pipe(
        catchError((error) => {
          console.error('Error al cargar artículos', error);
          throw error;
        }),
        tap((response: any) => {
          this.totalArticles = response.totalCount;
        }),
        switchMap((response: any) => {
          if (this.totalArticles > 0) {
            this.totalPages = Math.ceil(this.totalArticles / this.pageSize);

            const startIndex = (this.page - 1) * this.pageSize;
            const endIndex = startIndex + this.pageSize;
            this.articles = response.articles.slice(startIndex, endIndex);
          } else {
            this.totalPages = 0;
            this.articles = [];
          }

          return of(undefined);
        })
      )
      .subscribe(
        () => {},
        (error) => {
          console.error('Hubo un error al cargar los artículos.', error);
        }
      );
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.newArticleData.imageFile = file;
    this.onFileChangeEvent.emit(event);
  }
}
