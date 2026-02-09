import { CourseModel } from './courses.model';
import { CreateCourseDto, UpdateCourseDto } from './courses.dto';

export interface ICoursesRepository {
  create(tenantId: string, data: CreateCourseDto): Promise<CourseModel>;
  findById(tenantId: string, id: string): Promise<CourseModel | null>;
  list(tenantId: string): Promise<CourseModel[]>;
  update(tenantId: string, id: string, data: UpdateCourseDto): Promise<CourseModel>;
}
