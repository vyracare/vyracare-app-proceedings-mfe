import { Routes } from '@angular/router';
import { ProceedingRegistrationPageComponent } from './pages/proceeding-registration/proceeding-registration.component';
import { ProceedingCreatePageComponent } from './pages/proceeding-create/proceeding-create.component';

export const routes: Routes = [
  { path: '', component: ProceedingRegistrationPageComponent },
  { path: 'novo', component: ProceedingCreatePageComponent }
];

export const ROUTES: Routes = routes;
