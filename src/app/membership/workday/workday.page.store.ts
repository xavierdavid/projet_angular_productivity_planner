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
type TaskType = 'Hit the target' | 'Get things done';

// Typage de la variable 'PomodoroCount'
type PomodoroCount = 1 | 2 | 3 | 4 | 5;
  
// Contrat de structure de données pour l'objet 'Task'
interface Task {
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
  }),
  //Gestion de l'état dérivé si on atteint 6 tâches ou si aucune tâche n'est plannifiée
  withComputed((state) => {
    const taskCount = computed(() => state.taskList().length);
    const isButtonDisplayed = computed(() => taskCount() < WORKDAY_TASK_LIMIT);
    const hasNoTaskPlanned = computed(() => taskCount() === 0);

    return { taskCount, isButtonDisplayed, hasNoTaskPlanned };
  }), 
  // Gestion des interactions de l'utilisateur à partir du template
  withMethods((store) => ({
    // Gestion de l'ajout d'une nouvelle tâche - Réponse à l'évènement clic
    onAddTask() {
      // Patch de la nouvelle tâche dans le state (modification du state de manière immutable)
      patchState(store, (state) => ({ taskList: [...state.taskList, getEmptyTask()] }))
    },
    // Gestion de la suppression d'une tâche ajoutée - On conserve les tâches n'ayant pas l'index courant
    removeTask($index: number) {
      // Patch de la nouvelle tâche dans le state (modification du state de manière immutable)
      patchState(store, (state) => ({ taskList: state.taskList.toSpliced($index, 1) }))
    },
    // Gestion de la modification de la propriété 'type' de la tâche sélectionnée (à partir de son index - Ecoute d'évènement)
    updateTaskType($index: number, event: Event) {
      // Ecoute de l'évènement à partir de la balise HTML 'select' et récupération de la valeur de l'index de la tâche sélectionnée
      const type = (event.target as HTMLSelectElement).value as TaskType;
      // Patch de la nouvelle tâche modifiée dans le state (modification du state de manière immutable)
      patchState(store, (state) => {
        // Tâche modifiée (à partir de la valeur de son index)
        const task = { ...state.taskList[$index], type };
        // Liste de tâches intégrant la tâche modifiée
        const taskList = state.taskList.toSpliced($index, 1, task);
        // On retourne le nouvel état de la liste de tâches
        return { taskList };
      });
    },
    // Gestion de la modification de la propriété 'title' de la tâche
    updateTaskTitle($index: number, event: Event) {
      const title = (event.target as HTMLInputElement).value as TaskType;
      patchState(store, (state) => {
        const task = { ...state.taskList[$index], title };
        const taskList = state.taskList.toSpliced($index, 1, task);
        return { taskList };
      });
    },
    // Gestion de la modification de la propriété 'pomodoroCount' de la tâche
    updateTaskPomodoroCount($index: number, event: Event) {
      const pomodoroCount = Number((event.target as HTMLSelectElement).value) as PomodoroCount;
      patchState(store, (state) => {
        const task = { ...state.taskList[$index], pomodoroCount };
        const taskList = state.taskList.toSpliced($index, 1, task);
        return { taskList };
      });
    },
    // Gestion de la modification de la propriété 'date' de la tâche
    updateDate(event: Event) {
      const date = (event.target as HTMLInputElement).value;
      patchState(store, () => ({ date }));
    },
  }))
);