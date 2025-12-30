// Logique de vue et d'affichage pour la page Workday - Store de gestion d'état

import { computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { Subject, takeUntil, timer } from 'rxjs';
import { MAXIMUM_POMODORO_DURATION, Task } from './task.model';
import { Workday } from '@app/core/entity/workday';


// Contrat de structure de données pour l'objet 'WorkdayState'
interface WorkdayState {
  workday: Workday;
  progress: number;
};

// Démarrage du Store
export const WorkdayStore = signalStore(
  withState<WorkdayState>({
    // Etat initial - Valeurs par défaut de l'Etat initial au démarrage
    workday: Workday.createEmpty(),
    progress: 0,
  }),
  // Ajout de propriétés et services personnalisés
  withProps(() => ({
    destroyRef: inject(DestroyRef),
    // Using Subject to emit events when a pomodoro is completed
    pomodoroCompleted: new Subject<void>(), // (évènement programmatique pour indiquer qu'un pomodoro est complété)
  })),
  // Gestion de l'état dérivé si on atteint 6 tâches ou si aucune tâche n'est plannifiée
  withComputed((state) => {
    // View - Couche affichage
    const pomodoroProgress = computed(() => {
      return Math.floor((state.progress() / MAXIMUM_POMODORO_DURATION)*100)
    });

    return { 
      pomodoroProgress };
  }), 
  // Gestion des interactions de l'utilisateur à partir du template
  withMethods(({ destroyRef, pomodoroCompleted, ...store }) => ({
    // Gestion du démarrage d'une tâche - Mise à jour de la tâche courante en fonction du temps écoulé
    startWorkday() {
      // Passage en mode exécution
      patchState(store, { workday: store.workday().setExecutionMode() });
      // Démarrage d'un flux avec un Observable (méthode 'timer' de RXJS) pour gérer lancement du chronomètre (gestion du temps - Décompte des secondes écoulées)
      timer(0, 1000).pipe(takeUntil(pomodoroCompleted), takeUntilDestroyed(destroyRef)).subscribe((elapsedSeconds: number) => {
        // Mise à jour de la progression du pomodoro dans le state
        patchState(store, { progress: elapsedSeconds });

        // Gestion de la complétude des pomodoros ... 
        // Si les secondes écoulées sont égales à la durée maximale d'un pomodoro
        if (elapsedSeconds === Workday.MAX_POMODORO_DURATION_IN_SEC) {
          // Notification de la complétude du pomodoro via l'évènement programmatique
          pomodoroCompleted.next();
          // Réinitialisation du compteur de progression
          patchState(store, ({ workday }) => ({
              workday: workday.setEditMode(),
              progress: 0,
          }));
          return;
        }

        // Mise à jour de l'état de la journée de travail (incrémentation du timer du pomodoro actif)
        patchState(store, ({ workday }) => {
            return { workday: workday.tick() };
        }); 
      });
    },
    // Gestion de l'ajout d'une nouvelle tâche - Réponse à l'évènement clic
    addTask() {
      // Patch de la nouvelle tâche dans le state (modification du state de manière immutable)
      patchState(store, ({ workday }) => ({ workday: workday.addEmptyTask() }));
    },
    // Gestion de la suppression d'une tâche ajoutée - On conserve les tâches n'ayant pas l'index courant
    removeTask(index: number) {
      // Patch de la nouvelle tâche dans le state (modification du state de manière immutable)
      patchState(store, ({workday}) => ({ workday: workday.removeTask(index) }));
    },
    // Gestion de la mise à jour de la date
    updateDate(event: Event) {
      const date = (event.target as HTMLInputElement).value;
      patchState(store, ({ workday }) => ({
        workday: workday.createEmptyAtDate(date),
      }));
    },
    // Gestion de la mise à jour de la tâche
    updateTask(index: number, updatedTask: Task) {
      patchState(store, ({ workday }) => ({
        workday: workday.updateTask(index, updatedTask),
      }));
    },
    // Gestion de la sauvegarde de la journée de travail
    /* saveWorkday(workday: Workday): Observable<void> {
      console.log('Workday saved!', workday);
      return of(undefined);
    } */
  }))
);


