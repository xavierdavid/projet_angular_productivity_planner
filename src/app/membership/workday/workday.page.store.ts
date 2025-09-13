import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

// Contrat de structure de données pour l'objet 'Pomodoro'
interface Pomodoro {
  status: 'Not started' | 'In progress' | 'Done';
  currentTime: number;
  duration: number;
  isCompleted: boolean;
}

// Typage de la variable 'PomodoroList'
type PomodoroList = Pomodoro[];
  
// Contrat de structure de données pour l'objet 'Task'
interface Task {
  type: 'Hit the target' | 'Get things done';
  title: string;
  pomodoroCount: 1 | 2 | 3 | 4 | 5;
  pomodoroList: PomodoroList;
}

// Typage de la variable 'liste de tâches' 
type TaskList = Task[]
  
// Contrat de structure de données pour l'objet 'WorkdayState'
interface WorkdayState {
  date: string;
  taskList: TaskList;
};

// Description d'une constante pour une nouvelle tâche
const getEmptyTask = (): Task => ({
  type: 'Hit the target',
  title: 'Nouvelle tâche',
  pomodoroCount: 1,
  pomodoroList: [
    {
      status: 'Not started',
      currentTime: 0,
      duration: 1500,
      isCompleted: false, 
    },
  ],
});

// Description d'une constante au démarrage (valeurs par défaut de l'Etat initial)
const initialState: WorkdayState = {
  date: '',
  taskList: [getEmptyTask()],
};

// Démarrage du Store
export const WorkdayStore = signalStore(
  withState<WorkdayState>(initialState),
    withComputed((store) => {
    const mostImportantTask = computed(
      () => store.taskList()[0]
    );

    return { mostImportantTask };
  }),
  // Gestion de l'interaction avec le bouton 'ajouter une tâche' 
  withMethods((store) => ({
    // Réponse à l'évènement clic 'ajouter une tâche'
    onAddTask() {
      // On patch la nouvelle tâche dans le state (modification du state de manière immutable)
      patchState(store, (state) => ({ taskList: [...state.taskList, getEmptyTask()] }))
    }
  }))
);