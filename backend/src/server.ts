import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

import { env } from './config/env';
import { tenantContext } from './middleware/tenantContext';
import { errorHandler } from './middleware/errorHandler';
import { registerHealthRoutes } from './modules/health/health.routes';
import { registerAuthRoutes } from './modules/auth/auth.routes';
import { registerTenantRoutes } from './modules/tenant/tenant.routes';
import { registerStudentRoutes } from './modules/students/students.routes';
import { registerProgramRoutes } from './modules/programs/programs.routes';
import { registerCourseRoutes } from './modules/courses/courses.routes';
import { registerExamRoutes } from './modules/exams/exams.routes';
import { registerFinanceRoutes } from './modules/finance/finance.routes';
import { registerRecordsRoutes } from './modules/records/records.routes';
import { registerTicketsRoutes } from './modules/tickets/tickets.routes';
import { registerNotificationRoutes } from './modules/notifications/notifications.routes';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin || '*',
    credentials: !!env.corsOrigin,
  }),
);
app.use(express.json());
app.use(morgan('dev'));
app.use(tenantContext);

// Swagger UI (OpenAPI spec from backend/openapi.yaml)
const openApiPath = path.join(__dirname, '..', 'openapi.yaml');
if (fs.existsSync(openApiPath)) {
  const spec = YAML.parse(fs.readFileSync(openApiPath, 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
}

// API routes (prefix /api)
const api = express.Router();
registerHealthRoutes(api);
registerAuthRoutes(api);
registerTenantRoutes(api);
registerStudentRoutes(api);
registerProgramRoutes(api);
registerCourseRoutes(api);
registerExamRoutes(api);
registerFinanceRoutes(api);
registerRecordsRoutes(api);
registerTicketsRoutes(api);
registerNotificationRoutes(api);

app.use('/api', api);

// Global error handler
app.use(errorHandler);

export { app };

// The actual listen() call should be done from a separate entrypoint
// so tests can import { app } without starting the server.

