import { Task, TaskStatus } from '../types';
import { mockTasks } from '../data/mockTasks';

class TaskService {
  private tasks: Task[] = [...mockTasks];

  async getTasks(): Promise<Task[]> {
    return Promise.resolve([...this.tasks]);
  }

  async getTasksByEvent(eventId: string): Promise<Task[]> {
    return Promise.resolve(this.tasks.filter((t) => t.eventId === eventId));
  }

  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return Promise.resolve(this.tasks.filter((t) => t.assignedToId === assigneeId));
  }

  async createTask(task: Omit<Task, 'id' | 'progress'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: `tsk-${Date.now()}`,
      progress: 0,
    };
    this.tasks.unshift(newTask);
    return Promise.resolve(newTask);
  }

  async updateTaskStatus(taskId: string, status: TaskStatus, progress?: number): Promise<Task> {
    const index = this.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) throw new Error('Task not found');
    this.tasks[index].status = status;
    if (progress !== undefined) this.tasks[index].progress = progress;
    return Promise.resolve({ ...this.tasks[index] });
  }
}

export const taskService = new TaskService();
