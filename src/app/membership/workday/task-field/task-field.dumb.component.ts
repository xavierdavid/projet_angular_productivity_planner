import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { createPomodoroList, PomodoroCount, Task, TaskType } from '../task.model';

@Component({
  selector: 'app-task-field',
  imports: [],
  templateUrl: './task-field.dumb.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'card',
    '[attr.data-testid]': '`task-${index()}`',
  },
})
export class TaskFieldDumbComponent {
  // Propriétés d'entrée
  readonly task = input.required<Task>();
  readonly index = input.required<number>();

  // Propriétés de sortie
  readonly taskUpdated = output<Task>();
  readonly taskRemoved = output<void>();

  updateTaskType(type: string): void {
    const task: Task = { ...this.task(), type: type as TaskType };
    this.taskUpdated.emit(task);
  }
  updateTitle(title: string): void {
    const task: Task = { ...this.task(), title };
    this.taskUpdated.emit(task);
  }
  updatePomodoroCount(pomodoroCount: string): void {
    const count = Number(pomodoroCount) as PomodoroCount;
    const task: Task = {
      ...this.task(),
      pomodoroCount: count,
      pomodoroList: createPomodoroList(count),
    };
    this.taskUpdated.emit(task);
  }
}
