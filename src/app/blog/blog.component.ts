// blog.component.ts
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { BlogService } from '../blog.service';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css'],
})
export class BlogComponent implements OnInit {
  showModal: boolean = false;
  showDropdownMenu: boolean = false;
  showCategoryForm: boolean = false;
  newCategoryName: string = '';
  users: any[] = [];
  articles: Article[] = [];
  categories: any[] = [];
  page: number = 1;
  pageSize: number = 3;
  totalArticles: number = 0;
  totalPages: number = 0;
  Math: any = Math;
  newArticleData: ArticleCreationData = {
    title: '',
    content: '',
    author_id: 0,
    category_id: 0,
    image_url: '',
    imageFile: new File([], ''),
  };

  @Output() createArticleEvent: EventEmitter<any> = new EventEmitter();
  @Output() onFileChangeEvent: EventEmitter<any> = new EventEmitter();
  @Output() createCategoryEvent: EventEmitter<any> = new EventEmitter();
  
  constructor(
    private blogService: BlogService,
    private router: Router
  ) {
    this.showCategoryForm = false; 
  }

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    this.blogService
      .getAllArticles(this.page, this.pageSize)
      .pipe(
        catchError((error) => {
          console.error('Error al cargar artículos', error);
          throw error;
        }),
        tap((response: ArticleResponse) => {
          this.totalArticles = response.totalCount;
        }),
        switchMap((response: ArticleResponse) => {
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

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
      this.loadArticles();
    }
  }

  goToArticleDetail(articleId: number) {
    this.router.navigate(['/article', articleId]);
  }

  toggleDetails() {
    this.showDropdownMenu = !this.showDropdownMenu;
  }

  getFullImageUrl(relativeUrl: string): string {
    return this.blogService.getBackendUrl() + relativeUrl;
  }

  openCreateArticleModal() {
    this.showDropdownMenu = false;
    this.openModal();
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  closeCategoryForm() {
    this.showCategoryForm = false;
    this.createCategoryEvent.emit();
    this.closeModal();  // Cierra el modal después de crear la categoría si es necesario
  }

  toggleCategoryForm() {
    this.showCategoryForm = !this.showCategoryForm;
  }
}

interface Article {
  id: number;
  title: string;
  content: string;
  created_at: string;
  author_id: number;
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
