import { ICoursesRepository } from './courses.repository.interface';
import { CourseModel } from './courses.model';
import { CreateCourseDto, UpdateCourseDto } from './courses.dto';

export class CoursesService {
  constructor(private readonly repository: ICoursesRepository) {}

  async createCourse(tenantId: string, dto: CreateCourseDto): Promise<CourseModel> {
    return this.repository.create(tenantId, dto);
  }

  async listCourses(tenantId: string): Promise<CourseModel[]> {
    return this.repository.list(tenantId);
  }

  async getCourseById(tenantId: string, id: string): Promise<CourseModel | null> {
    return this.repository.findById(tenantId, id);
  }

  async updateCourse(tenantId: string, id: string, dto: UpdateCourseDto): Promise<CourseModel> {
    return this.repository.update(tenantId, id, dto);
  }

  async deleteCourse(tenantId: string, id: string): Promise<void> {
    return this.repository.delete(tenantId, id);
  }
}
