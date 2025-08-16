import { Component } from '@angular/core';
import { WorkdayStore } from './workday.page.store';

@Component({
  imports: [],
  templateUrl: './workday.page.component.html',
  styleUrl: './workday.page.component.scss',
  // Workday LocalStore
  providers: [WorkdayStore]
})
export class WorkdayPageComponent {

}
