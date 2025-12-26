import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskReadonlyDumbComponent } from './task-readonly.dumb.component';
import { Task } from '../task.model';

describe('TaskReadonlyDumbComponent', () => {
  let component: TaskReadonlyDumbComponent;
  let fixture: ComponentFixture<TaskReadonlyDumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskReadonlyDumbComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskReadonlyDumbComponent);

    fixture.componentRef.setInput('task', {
      id: '1',
      title: 'Test task',
      completed: false,
      pomodoroList: []
    } as unknown as Task);

    fixture.componentRef.setInput('index', 0);

    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
