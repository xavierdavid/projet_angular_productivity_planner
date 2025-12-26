import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WorkdayStore } from './workday.page.store';
import { TaskFieldDumbComponent } from "./task-field/task-field.dumb.component";
import { TaskReadonlyDumbComponent } from './task-readonly/task-readonly.dumb.component';
import { JsonPipe } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workday.page.component.html',
  // Workday LocalStore
  providers: [WorkdayStore],
  imports: [TaskFieldDumbComponent, TaskReadonlyDumbComponent, JsonPipe]
})

export class WorkdayPageComponent {
  //Injection du store Workday dans le composant en lecture seule et à utiliser dans le template
  readonly store = inject(WorkdayStore);
}
