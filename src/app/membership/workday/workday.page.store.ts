import { computed } from '@angular/core';
import { signalStore, withComputed, withState } from '@ngrx/signals';

// Contrat de structure de données pour l'objet 'Pomodoro'
interface Pomodoro {
  status: 'Not started' | 'In progress' | 'Done';
}

// Typage de la variable 'PomodoroList' (tableau contenant 0 à 5 pomodoros au maximum)
type PomodoroList =
  | [Pomodoro]
  | [Pomodoro, Pomodoro]
  | [Pomodoro, Pomodoro, Pomodoro]
  | [Pomodoro, Pomodoro, Pomodoro, Pomodoro]
  | [Pomodoro, Pomodoro, Pomodoro, Pomodoro, Pomodoro];

// Contrat de structure de données pour l'objet 'Task'
interface Task {
  type: 'Hit the target' | 'Get things done';
  title: string;
  pomodoroCount: 1 | 2 | 3 | 4 | 5;
  pomodoroList: PomodoroList;
}

// Typage de la variable 'liste de tâches' (tableau contenant 0 à 6 tâches au maximum)
type TaskList =
  | []
  | [Task]
  | [Task, Task]
  | [Task, Task, Task]
  | [Task, Task, Task, Task]
  | [Task, Task, Task, Task, Task]
  | [Task, Task, Task, Task, Task, Task];

// Contrat de structure de données pour l'objet 'WorkdayState'
interface WorkdayState {
  date: string;
  taskList: TaskList;
};

// Description d'une constante au démarrage (valeurs par défaut)
const initialState: WorkdayState = {
  date: '',
  taskList: [
    {
      type: 'Hit the target',
      title: 'Nouvelle tâche',
      pomodoroCount: 1,
      pomodoroList: [{ status: 'Not started' }],
    },
  ],
};

// Démarrage du Store
export const WorkdayStore = signalStore(
  withState<WorkdayState>(initialState),
    withComputed((store) => {
    const getMostImportantTask = computed(
      () => store.taskList()[0]
    );

    return { getMostImportantTask };
  }),
);