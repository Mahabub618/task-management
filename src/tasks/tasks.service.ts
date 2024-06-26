import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { DeleteResult, Repository } from 'typeorm';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService  {
  constructor(@InjectRepository(Task) private taskRepository: Repository<Task>) {
  }
  private logger = new Logger('TaskService');
  async getTask(
    filterDto: GetTasksFilterDto,
    user: User
  ): Promise<Task[]> {
    const { status, search} = filterDto;
    const query = this.taskRepository.createQueryBuilder('task');

    query.where('task.userId = :userId', { userId: user.id });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere('(task.title LIKE :search OR task.description LIKE :search)', {
        search: `%${search}%`,
      });
    }
    try {
      const task: Task[] = await query.getMany();
      return task;
    }
    catch (error) {
      this.logger.error(`Failed to get tasks for user "${user.username}. 
      Filters: ${JSON.stringify(filterDto)}`, error.stack);
      throw new InternalServerErrorException();
    }
  }

  async getTaskById(
    id: number,
    user: User
  ): Promise<Task> {
    const found: Task = await this.taskRepository.findOne({ where: { id, userId: user.id } });
      if (!found) {
        throw new NotFoundException(`Task with ID "${id}" not found`);
      }
      return found;
  }

  async deleteTaskById(
    id: number,
    user: User
  ): Promise<DeleteResult> {
      const result: DeleteResult = await this.taskRepository.delete({ id, userId: user.id });
      if (!result.affected) {
        throw new NotFoundException(`Task with ID "${id}" not found`);
      }
      return result;
  }

  async createTask(
    createTaskDto: CreateTaskDto,
    user: User
  ): Promise<Task> {
      const {title, description} = createTaskDto;
      const task = new Task();
      task.title = title;
      task.description = description;
      task.status = TaskStatus.OPEN;
      task.user = user;

      try {
        await task.save();
      }
      catch (error) {
        this.logger.error(`Failed to create a task for user "${user.username}.
        Data: ${createTaskDto}`, error.stack);

        throw new InternalServerErrorException();
      }

      delete task.user;
      return task;
  }

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: User): Promise<Task> {
     const task = await this.getTaskById(id, user);
     task.status = status;
     await task.save();
     return task;
  }
}
