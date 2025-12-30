// Modélisation de la couche métier - Entité Workday
import {
  getActivePomodoroIndex,
  getActiveTask,
  getActiveTaskIndex,
  getTaskEmojiStatus,
  isTaskCompleted,
  Task,
  TaskList,
} from '@app/membership/workday/task.model';
import { Entity } from '../domain/entity.class';

// Contrat de structure de données pour l'objet 'Workday' (WorkdayProps)
interface WorkdayProps {
  taskList: TaskList;
  mode: 'edit' | 'execution';
}

export class Workday extends Entity<WorkdayProps> {
  // Constantes métier
  static readonly MAX_POMODORO_DURATION_IN_SEC = 5; // Durée maximum d'un pomodoro en secondes (5 secondes pour les tests, 1500 secondes pour 25 minutes)
  static readonly MAX_TASKS_PER_DAY = 6; // Nombre maximum de tâches par journée de travail
  override readonly _id;

  // Constructeur privé pour forcer l'utilisation des Factory Methods
  // Pour instancier une journée de travail avec des propriétés spécifiques (workday props) et une date (id unique)
  private constructor(props: WorkdayProps, date: string) {
    super(props, date);
    this._id = date;
  }

  // ** Factory Methods ** // 

  // Méthode statique pour créer une journée de travail vide
  static createEmpty(): Workday {
    // Utilisation du timestamp actuel comme identifiant unique
    const date = Date.now(); 
    // Génération des propriétés par défaut
    const taskList: TaskList = [
      {
        type: 'Hit the target',
        title: 'Nouvelle tâche',
        status: 'Not started',
        pomodoroCount: 1,
        pomodoroList: [0],
        statusEmoji: '🏁',
      },
    ];
    const mode = 'edit';
    const emptyProps: WorkdayProps = { taskList, mode };

    // Retourne une nouvelle instance de Workday avec les propriétés par défaut et la date actuelle en faisant appel au constructeur privé (instanciation à l'intérieur de la classe uniquement)
    return new Workday(emptyProps, date.toString()); // Conversion du timestamp en chaîne de caractères pour l'identifiant
  }

  // Méthode pour créer une journée de travail vide à une date spécifique
  createEmptyAtDate(date: string): Workday {
    const workday = Workday.createEmpty();
    return new Workday(workday.props, date);
  }

  /** Readonly - Getters qui retournent la valeur des propriétés de l'entité Workday  **/

  // Retourne la date associée à la journée de travail - Attribution d'un identifiant unique à chaque journée
  get date(): string {
    return this._id;
  }

  // Retourne la liste des tâches planifiées pour la journée
  get taskList(): TaskList {
    return this.props.taskList;
  }

  // Retourne le nombre de tâches planifiées pour la journée
  get taskCount(): number {
    return this.props.taskList.length;
  }

  // Retourne vrai si au moins une tâche est planifiée pour la journée
  get hasTaskPlanned(): boolean {
    return this.taskCount > 0;
  }

  // Retourne vrai si aucune tâche n'est planifiée pour la journée
  get hasNoTaskPlanned(): boolean {
    return this.taskCount === 0;
  }

  // Retourne vrai si le mode actuel est le mode édition
  get isEditMode(): boolean {
    return this.props.mode === 'edit';
  }

  // Retourne vrai si le mode actuel est le mode exécution
  get isExecutionMode(): boolean {
    return this.props.mode === 'execution';
  }
 // Retourne vrai si toutes les tâches de la journée sont complétées
  get isWorkdayCompleted(): boolean {
    return this.taskList.every((task) => {
      return isTaskCompleted(task);
    });
  }

  // Retourne vrai si une nouvelle tâche peut être ajoutée (limite maximale non atteinte)
  get canAddTask(): boolean {
    return this.taskCount < Workday.MAX_TASKS_PER_DAY;
  }

 
  //** Méthodes d'action pour modifier l'état de l'entité Workday - Setters **//

  // Passage au mode exécution
  setExecutionMode(): Workday {
    if (this.isExecutionMode) {
      throw new Error('Workday is already in execution mode.');
    }
    this.props.mode = 'execution';
    return this;
  }

  // Passage au mode édition
  setEditMode(): Workday {
    if (this.isEditMode) {
      throw new Error('Workday is already in edit mode.');
    }
    this.props.mode = 'edit';
    return this;
  }

  // Ajout d'une nouvelle tâche vide à la journée de travail
  addEmptyTask(): Workday {
    if (this.taskCount >= Workday.MAX_TASKS_PER_DAY) {
      throw new Error('Maximum number of tasks reached for the day.');
    }
    this.props.taskList.push(Workday.getEmptyTask());
    return this;
  }

  // Mise à jour d'une tâche existante à la journée de travail
  updateTask(index: number, updatedTask: Task): Workday {
    if (index < 0 || index >= this.props.taskList.length) {
      throw new Error(`Cannot update task at index ${index}.`);
    }
    this.props.taskList[index] = updatedTask;
    return this;
  }

  // Suppression d'une tâche existante de la journée de travail
  removeTask(index: number): Workday {
    // Vérification de la validité de l'index de la tâche à supprimer
    if (index < 0 || index >= this.props.taskList.length) {
      throw new Error(`Cannot remove task at index ${index}.`);
    }
    this.props.taskList.splice(index, 1);
    return this;
  }

  // Remise à jour du timer du pomodoro actif - Incrémentation du temps écoulé
  tick(): Workday {
    const task = getActiveTask(this.taskList);
    const taskIndex = getActiveTaskIndex(this.taskList);

    if (!task) {
      throw new Error('No active task found');
    }

    const pomodoroIndex = getActivePomodoroIndex(task);

    if (pomodoroIndex === -1) {
      throw new Error('No active pomodoro found');
    }
    // Incrémentation du temps écoulé du pomodoro actif de la tâche courante
    this.taskList[taskIndex].pomodoroList[pomodoroIndex]++;
    // Mise à jour de l'emoji de statut de la tâche courante
    this.taskList[taskIndex].statusEmoji = getTaskEmojiStatus(
      this.taskList[taskIndex]
    );

    return this;
  }

  // TODO: Extract following methods of Task into a Value Object.

  //** Value Objects **//

  // Vérification de la complétude d'une tâche
  isTaskCompleted(task: Task): boolean {
    if (this.isGetThingsDone(task)) {
      return task.status === 'Done';
    }

    // Hit the target task
    return task.pomodoroList.every((pomodoro) =>
      this.isPomodoroCompleted(pomodoro)
    );
  }

  // Vérification si une tâche est de type 'Get things done'
  isGetThingsDone(task: Task): boolean {
    return task.type === 'Get things done';
  }

  // Vérification de la complétude d'un pomodoro
  isPomodoroCompleted(pomodoro: number): boolean {
    return pomodoro === Workday.MAX_POMODORO_DURATION_IN_SEC;
  }

  // Récupération d'une tâche vide par défaut
  static getEmptyTask(): Task {
    return {
      type: 'Hit the target',
      title: 'Nouvelle tâche',
      status: 'Not started',
      pomodoroCount: 1,
      pomodoroList: [0],
      statusEmoji: '🏁',
    };
  }
}
