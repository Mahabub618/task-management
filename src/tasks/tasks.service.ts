import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { TaskStatus } from './task-status.enum';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private taskRepository: Repository<Task>) {
  }
  // getAllTasks(): Task[] {
  //   return this.tasks;
  // }
  //
  // getTaskWithFilters(filterDto: GetTasksFilterDto): Task[] {
  //   const { status, search} = filterDto;
  //
  //   let tasks: Task[] = this.getAllTasks();
  //
  //   if (status) {
  //     tasks = tasks.filter(task => task.status === status);
  //   }
  //
  //   if (search) {
  //     tasks = tasks.filter(task => task.title.includes(search) ||
  //       task.description.includes(search))
  //   }
  //   return tasks;
  // }

  async getTaskById(id: number): Promise<Task> {
    const found = await this.taskRepository.findOne({ where: { id } });
      if (!found) {
        throw new NotFoundException(`Task with ID "${id}" not found`);
      }
      return found;
  }

  // getTaskById(id: string): Task {
  //   const found: Task =  this.tasks.find(task => task.id === id);
  //   if (!found) {
  //     throw new NotFoundException(`Task with ID "${id}" not found`);
  //   }
  //   return found;
  // }
  //
  // deleteTaskById(id: string): void {
  //   const found: Task = this.getTaskById(id);
  //   this.tasks = this.tasks.filter(task => task.id !== found.id);
  // }

  async createTask(createTaskDto: CreateTaskDto) {
      const {title, description} = createTaskDto;
      const task = new Task();
      task.title = title;
      task.description = description;
      task.status = TaskStatus.OPEN;
      await task.save();
      return task;
  }

  //
  // updateTaskStatusById(id: string, status: TaskStatus): Task {
  //   const task: Task = this.getTaskById(id);
  //   task.status = status;
  //   return task;
  // }
}
