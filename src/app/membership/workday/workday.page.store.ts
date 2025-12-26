import { computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { Subject, takeUntil, timer } from 'rxjs';
import { MAXIMUM_POMODORO_DURATION, getActivePomodoroIndex, getActiveTask,PomodoroList, Task, TaskList, getActiveTaskIndex, getTaskEmojiStatus, isTaskCompleted } from './task.model';

// Contrat de structure de données pour l'objet 'WorkdayState'
interface WorkdayState {
  date: string;
  taskList: TaskList;
  progress: number;
  mode: 'edit' | 'execution';
};

// Description d'une constante pour une nouvelle tâche 'vide' par défaut
const getEmptyTask = (): Task => ({
  type: 'Hit the target',
  title: 'Nouvelle tâche',
  status: 'Not started',
  pomodoroCount: 1,
  pomodoroList: [0],
  statusEmoji: '🏁',
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
  // Ajout de propriétés et services personnalisés
  withProps(() => ({
    destroyRef: inject(DestroyRef),
    pomodoroCompleted: new Subject<void>(), // (évènement programmatique pour indiquer qu'un pomodoro est complété)
  })),
  // Gestion de l'état dérivé si on atteint 6 tâches ou si aucune tâche n'est plannifiée
  withComputed((state) => {
    const taskCount = computed(() => state.taskList().length);
    const isButtonDisplayed = computed(() => taskCount() < WORKDAY_TASK_LIMIT);
    const hasNoTaskPlanned = computed(() => taskCount() === 0);
    const hasTaskPlanned = computed(() => taskCount() > 0);
    const isEditMode = computed(() => state.mode() === 'edit');
    const isExecutionMode = computed(() => state.mode() === 'execution');
    const pomodoroProgress = computed(() => {
      return Math.floor((state.progress() / MAXIMUM_POMODORO_DURATION)*100)
    });

    return { 
      taskCount,
      isButtonDisplayed,
      hasNoTaskPlanned, 
      hasTaskPlanned, 
      isEditMode, 
      isExecutionMode, 
      pomodoroProgress };
  }), 
  // Gestion des interactions de l'utilisateur à partir du template
  withMethods(({ destroyRef, pomodoroCompleted, ...store }) => ({
    // Gestion du démarrage d'une tâche - Mise à jour de la tâche courante en fonction du temps écoulé
    startworkday() {
      patchState(store, { mode: 'execution'});
      console.log('Workday started!');
      // Démarrage d'un flux avec un Observable (méthode 'timer' de RXJS) pour gérer lancement du chronomètre (gestion du temps - Décompte des secondes écoulées)
      timer(0, 1000).pipe(takeUntil(pomodoroCompleted), takeUntilDestroyed(destroyRef)).subscribe((elapsedSeconds: number) => {
        console.log('elapsedSeconds', elapsedSeconds);
        
        patchState(store, { progress: elapsedSeconds });
      
        patchState(store, (state) => {
          // Récupération de la tâche courante dans le tableau Workday
          const task = getActiveTask(state.taskList);
          // Récupération de l'index de la tâche courante dans le tableau Workday
          const taskIndex = getActiveTaskIndex(store.taskList());
          if(!task){
            throw new Error('No active task found');
          }

          // Récupération de l'index du pomodoro actif de la Workday
          const pomodoroIndex = getActivePomodoroIndex(task);
          if(pomodoroIndex === -1) {
            throw new Error('No active pomodoro found');
          }

          // Mise à jour et reconstruction de la tâche - Incrémentation du timer du pomodoro actif (à l'index du pomodoro actif) - Mise à jour le temps écoulé
          
          // Create a new pomodoro list and a new task object (immutable update)
            const newPomodoroList = [...task.pomodoroList] as PomodoroList;
            newPomodoroList[pomodoroIndex] = elapsedSeconds;

            const updatedTask: Task = {
              ...task,
              pomodoroList: newPomodoroList,
              statusEmoji: getTaskEmojiStatus({
                ...task,
                pomodoroList: newPomodoroList,
              }),
            };

          // Mise à jour de l'emoji de statut de la tâche
          

          // Récupération de la liste des tâches mise à jour à partir du store
          const taskList: TaskList = store
          .taskList()
          // On remplace dans la taskList la tâche courante par la tâche mise à jour 
          .toSpliced(taskIndex, 1, updatedTask);
       
          // Patch de la liste des tâches mise à jour dans le store
          return { taskList };
        });
        
        // Gestion de la complétude des états ...

        // Si les secondes écoulées sont égales à la durée maximale d'un pomodoro)
        if(elapsedSeconds === MAXIMUM_POMODORO_DURATION) {
          // Alors on se désabonne ... (déclaration d'un 'subject') - N.B. Le timer peut s'arrêter pour 3 raisons : 1. On quitte le composant (il est détruit) - 2. l'utilisateur à cliqué sur 'completed pomodoro' (évènement utilisateur stocké dans un 'subject') - 3. Evènement programmatique (Subject) déclenché lorsque la durée du pomodoro écoulée):
          pomodoroCompleted.next();
          // On repasse en mode 'edit' pour permettre à l'utilisateur de valider le pomodoro complété et on réinitiaise le compteur de progression
          patchState(store, { mode: 'edit', progress: 0 });
        }

      });
    },
    // Gestion de la vérification de l'achèvement de la journée de travail
    isWorkdayCompleted(): boolean {
      return store.taskList().every((task) => {
        return isTaskCompleted(task);
      });
    },
    // Gestion de la vérification de l'achèvement d'une tâche
    isTaskCompleted(task: Task): boolean {
      return isTaskCompleted(task);
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


