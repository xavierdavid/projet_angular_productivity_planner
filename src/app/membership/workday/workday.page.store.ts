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

// Typage de la variable 'TaskType'
export type TaskType = 'Hit the target' | 'Get things done';

// Typage de la variable 'PomodoroCount'
export type PomodoroCount = 1 | 2 | 3 | 4 | 5;
  
// Contrat de structure de données pour l'objet 'Task'
export interface Task {
  type: TaskType;
  title: string;
  pomodoroCount: PomodoroCount;
  pomodoroList: PomodoroList;
}

// Typage de la variable 'liste de tâches' 
type TaskList = Task[]
  
// Contrat de structure de données pour l'objet 'WorkdayState'
interface WorkdayState {
  date: string;
  taskList: TaskList;
  progress: number;
  mode: 'edit' | 'execution';
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

// Définition d'une constante pour limiter à 6 le nombre de tâches par jour
const WORKDAY_TASK_LIMIT = 6;

// Démarrage du Store
export const WorkdayStore = signalStore(
  withState<WorkdayState>({
    // Etat initial - Valeurs par défaut de l'Etat initial au démarrage
    date: '2019-02-28',
    taskList: [getEmptyTask()],
    progress: 0,
    mode: 'edit',
  }),
  //Gestion de l'état dérivé si on atteint 6 tâches ou si aucune tâche n'est plannifiée
  withComputed((state) => {
    const taskCount = computed(() => state.taskList().length);
    const isButtonDisplayed = computed(() => taskCount() < WORKDAY_TASK_LIMIT);
    const hasNoTaskPlanned = computed(() => taskCount() === 0);
    const hasTaskPlanned = computed(() => taskCount() > 0);
    const isEditMode = computed(() => state.mode() === 'edit');
    const isExecutionMode = computed(() => state.mode() === 'execution');

    return { taskCount, isButtonDisplayed, hasNoTaskPlanned , hasTaskPlanned, isEditMode, isExecutionMode};
  }), 
  // Gestion des interactions de l'utilisateur à partir du template
  withMethods((store) => ({
    // Gestion du démarrage d'une tâche
    startworkday() {
      patchState(store, { mode: 'execution'});
    },
    // Gestion de l'ajout d'une nouvelle tâche - Réponse à l'évènement clic
    addTask() {
      // Patch de la nouvelle tâche dans le state (modification du state de manière immutable)
      patchState(store, (state) => ({ taskList: [...state.taskList, getEmptyTask()] }))
    },
    // Gestion de la suppression d'une tâche ajoutée - On conserve les tâches n'ayant pas l'index courant
    removeTask($index: number) {
      // Patch de la nouvelle tâche dans le state (modification du state de manière immutable)
      patchState(store, (state) => ({ taskList: state.taskList.toSpliced($index, 1) }))
    },
    // Gestion de la mise à jour de la date
    updateDate(event: Event) {
      const date = (event.target as HTMLInputElement).value;
      patchState(store, () => ({ date }));
    },
    // Gestion de la mise à jour de la tâche
    updateTask(index: number, updatedTask: Task) {
      patchState(store, (state) => {const taskList: TaskList = state.taskList.toSpliced(index, 1, updatedTask);
        return { taskList };
      });
     },
  }))
);