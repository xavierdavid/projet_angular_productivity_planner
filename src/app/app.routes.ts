import { Routes } from '@angular/router';
import { HomePageComponent } from './visitor/home/home.page.component';
import { SignupPageComponent } from './visitor/signup/signup.page.component';
import { LoginPageComponent } from './visitor/login/login.page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    title: 'Productivity Planner'
  },
  {
    path: 'signup',
    component: SignupPageComponent,
    title: 'Signup'
  },
  {
    path: 'login',
    component: LoginPageComponent,
    title: 'Login'
  }
];
