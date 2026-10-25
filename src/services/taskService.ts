import { Task, TaskStatus } from '../types';

const API_BASE = 'http://localhost:5000/api';

class TaskService {
  // Fetch live tasks directly from PostgreSQL database
  async getTasks(eventId?: string, assigneeId?: string): Promise<Task[]> {
    try {
      let url = `${API_BASE}/tasks`;
      const params = new URLSearchParams();
      if (eventId) params.append('event_id', eventId);
      if (assigneeId) params.append('assigned_to_id', assigneeId);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const res = await fetch(url);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch tasks from database:', err);
      return [];
    }
  }

  async getTasksByEvent(eventId: string): Promise<Task[]> {
    return this.getTasks(eventId);
  }

  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return this.getTasks(undefined, assigneeId);
  }

  // Admin creates new task directly in PostgreSQL
  async createTask(task: Omit<Task, 'id' | 'progress'>): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to create task in database');
    }

    return {
      ...task,
      id: result.id,
      progress: 0,
    };
  }

  // OC Member or Admin updates progress in PostgreSQL
  async updateTaskStatus(taskId: string, status: TaskStatus, progress?: number): Promise<void> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: status === 'Completed' ? 'COMPLETED' : status === 'In Progress' ? 'IN_PROGRESS' : 'PENDING',
        progress: progress !== undefined ? progress : status === 'Completed' ? 100 : undefined,
      }),
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to update task progress in database');
    }
  }
}

export const taskService = new TaskService();
