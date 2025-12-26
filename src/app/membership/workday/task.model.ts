// Modèle de données d'une tâche - TASK

// Structure des données 
export interface Task {
  type: TaskType;
  title: string;
  status: Status; 
  pomodoroCount: PomodoroCount;
  pomodoroList: PomodoroList;
  statusEmoji: string;
}

// Durée maximum d'un pomodoro en minutes
export const MAXIMUM_POMODORO_DURATION = 5; // 25 minutes

// Typage des variables 
export type TaskList = Task[]
export type TaskType = 'Hit the target' | 'Get things done';
export type Status = 'Not started' | 'In progress' | 'Done';
export type PomodoroList = 
  |[number] 
  |[number, number]
  |[number, number, number]
  |[number, number, number, number]
  |[number, number, number, number, number];
export type PomodoroCount = 1 | 2 | 3 | 4 | 5;

// Méthodes - Gestion du mode de la tâche
export function isHitTheTarget(task: Task): boolean {
  return task.type === 'Hit the target';
}
export function isGetThingsDone(task: Task): boolean {
  return task.type === 'Get things done';
}

// Gestion de la récupération de la tâche active
export function getActiveTask(taskList: TaskList) : Task | undefined {
  // On retourne la première tâche qui n'est pas encore achevée
  return taskList.find((task) => !isTaskCompleted(task));
}
// Gestion de la récupération de l'index de la tâche active
export function getActiveTaskIndex(taskList: TaskList) : number | -1 {
  // On retourne l'index de la première tâche qui n'est pas encore achevée
  return taskList.findIndex((task) => !isTaskCompleted(task));
}

// Gestion du statut de complétude d'une tâche
export function isTaskCompleted(task: Task): boolean {
  // Si la tâche est de type 'Get things done' alors elle ne peut être considérée comme achevée ('Done') que si son statut est défini comme tel ('Done') même si tous ses pomodoros ne sont pas achevés
  if(isGetThingsDone(task)) {
    return task.status === 'Done';
  }
  // Si la tâche est de type 'Hit the target' alors elle ne peut être considérée comme achevée ('Done') que si tous ses pomodoros sont achevés
  return task.pomodoroList.every((pomodoro) => isPomodoroCompleted(pomodoro));
}
// Gestion du statut d'une tâche en cours
export function isTaskInProgress(task: Task): boolean {
  if (isGetThingsDone(task)) {
    return task.status === 'In progress';
  }
  // Hit the target task
  return task.pomodoroList.some((pomodoro) => isPomodoroInProgress(pomodoro));
}
// Gestion du statut d'une tâche non démarrée
export function isTaskNotStarted(task: Task): boolean {
  if (isGetThingsDone(task)) {
    return task.status === 'Not started';
  }
  // Hit the target task
  return task.pomodoroList.every((pomodoro) => isPomodoroNotStarted(pomodoro));
}

// Méthodes - Gestion des pomodoros

// Gestion de la complétude d'un pomodoro
export function isPomodoroCompleted(pomodoro: number): boolean {
  // Un pomodoro est considéré comme achevé dès lors que sa durée maximum est écoulée
  return pomodoro === MAXIMUM_POMODORO_DURATION;
}

// Gestion du statut d'un pomodoro en cours
export function isPomodoroInProgress(pomodoro: number): boolean {
  return pomodoro !== MAXIMUM_POMODORO_DURATION && pomodoro !== 0;
}

// Gestion du statut d'un pomodoro non démarré
export function isPomodoroNotStarted(pomodoro: number): boolean {
  return pomodoro === 0;
}

// Gestion de la récupération de l'index du prochain pomodoro actif sur lequel on va débuter l'incrémentation du 'timer'
export function getActivePomodoroIndex(task: Task): number | -1 {
  // Déterminer (dans le tableau des pomodoro) l'index du pomodoro courant qui n'est pas encore achevé
  return task.pomodoroList.findIndex((pomodoro) => !isPomodoroCompleted(pomodoro));
}


/* View model methods */
export function getTaskEmojiStatus(task: Task): string {
  // Done
  if (isTaskCompleted(task)) {
    return '✅';
  }

  // In progress
  if (isTaskInProgress(task)) {
    return '🔄';
  }

  // Not started
  return '🏁';
}