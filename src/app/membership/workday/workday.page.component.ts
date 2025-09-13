import { Component, inject } from '@angular/core';
import { WorkdayStore } from './workday.page.store';
@Component({
  imports: [],
  templateUrl: './workday.page.component.html',
  styleUrl: './workday.page.component.scss',
  // Workday LocalStore
  providers: [WorkdayStore]
})

export class WorkdayPageComponent {
  //Injection du store Workday dans le composant en lecture seule et à utiliser dans le template
  readonly store = inject(WorkdayStore);
}
