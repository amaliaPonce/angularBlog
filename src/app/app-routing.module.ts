import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioPageComponent } from './inicio-page/inicio-page.component';
import { LoginComponent } from './login/login.component';
import {BlogComponent} from './blog/blog.component'
import { ArticleDetailComponent } from './article-detail/article-detail.component';


const routes: Routes = [
  { path: 'inicio', component: InicioPageComponent },
   { path: 'login', component: LoginComponent },
   { path: 'blog', component: BlogComponent },
   { path: 'article/:id', component: ArticleDetailComponent }, 


  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes),],
  exports: [RouterModule]
})
export class AppRoutingModule { }
