# Business Logic Layer Documentation

The Business Logic Layer serves as the core of the LegalTrack application, containing all business rules, validation logic, and orchestration between different data sources. This layer ensures that business requirements are properly implemented and maintained independently of the presentation and data access layers.

## Overview

The business layer is responsible for:
- Implementing business rules and validation
- Orchestrating operations across multiple repositories
- Managing transactions and data consistency
- Handling authorization and permissions
- Transforming data between layers
- Error handling and logging

## Directory Structure

```
src/
├── services/              # Core business services
│   ├── index.ts          # Service exports
│   ├── profile/          # Profile management services
│   └── user/             # User management services
├── modules/              # Feature-specific business modules
│   ├── app/              # Application-wide modules
│   ├── auth/             # Authentication modules
│   └── process/          # Process management modules
├── schemas/              # Validation schemas
│   └── user-schemas.ts   # User validation schemas
├── types/                # Business type definitions
│   ├── api.ts            # API type definitions
│   ├── base.ts           # Base type definitions
│   ├── client.ts         # Client type definitions
│   ├── dto/              # Data Transfer Objects
│   ├── index.ts          # Type exports
│   ├── process.ts        # Process type definitions
│   ├── profile.ts        # Profile type definitions
│   └── supabase/         # Supabase-specific types
└── utils/                # Business utilities
    ├── converters/       # Data conversion utilities
    ├── either.ts         # Result type utilities
    ├── formatters/       # Data formatting utilities
    └── mappers/          # Data mapping utilities
```

## Core Services

### 1. Service Architecture

Services follow a consistent pattern that promotes maintainability and testability:

```typescript
// Base Service Interface
interface BaseService<TEntity, TCreateDTO, TUpdateDTO> {
  getById(id: string): Promise<TEntity | null>;
  getAll(filters?: FilterOptions): Promise<TEntity[]>;
  create(data: TCreateDTO): Promise<TEntity>;
  update(id: string, data: TUpdateDTO): Promise<TEntity>;
  delete(id: string): Promise<void>;
}

// Service Implementation Pattern
export class ProcessService implements BaseService<ProcessDTO, CreateProcessDTO, UpdateProcessDTO> {
  constructor(
    private processRepository: ProcessRepository,
    private clientRepository: ClientRepository,
    private userRepository: UserRepository,
    private auditService: AuditService
  ) {}

  async getById(id: string): Promise<ProcessDTO | null> {
    // Implementation with business logic
  }

  // Other methods...
}
```

### 2. User Service

```typescript
// user/user-service.ts
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private profileRepository: ProfileRepository,
    private organizationRepository: OrganizationRepository,
    private auditService: AuditService
  ) {}

  async createUserWithProfile(userData: CreateUserDTO): Promise<UserDTO> {
    // Validate business rules
    await this.validateUserCreation(userData);

    // Create user
    const user = await this.userRepository.create({
      email: userData.email,
      supabaseId: userData.supabaseId,
      role: userData.role || UserRole.USER
    });

    // Create default profile
    const profile = await this.profileRepository.create({
      userId: user.id,
      name: userData.name,
      phone: userData.phone,
      document: userData.document
    });

    // Log activity
    await this.auditService.logActivity({
      userId: user.id,
      action: 'USER_CREATED',
      details: { email: user.email, role: user.role }
    });

    return UserMapper.toDTO({ ...user, profile });
  }

  async updateUser(id: string, updates: UpdateUserDTO): Promise<UserDTO> {
    // Check permissions
    await this.validateUserUpdatePermissions(id, updates);

    // Get existing user
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Apply business rules
    const validatedUpdates = await this.validateUserUpdates(existingUser, updates);

    // Update user
    const updatedUser = await this.userRepository.update(id, validatedUpdates);

    // Update profile if needed
    if (updates.profile) {
      await this.profileRepository.updateByUserId(id, updates.profile);
    }

    // Log activity
    await this.auditService.logActivity({
      userId: id,
      action: 'USER_UPDATED',
      details: { updatedFields: Object.keys(validatedUpdates) }
    });

    return UserMapper.toDTO(updatedUser);
  }

  private async validateUserCreation(userData: CreateUserDTO): Promise<void> {
    // Check email uniqueness
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ValidationError('Email already exists');
    }

    // Validate organization membership
    if (userData.organizationId) {
      const organization = await this.organizationRepository.findById(userData.organizationId);
      if (!organization) {
        throw new ValidationError('Invalid organization');
      }
    }

    // Additional business validations...
  }

  private async validateUserUpdatePermissions(userId: string, updates: UpdateUserDTO): Promise<void> {
    // Role-based permission checks
    const currentUser = await this.getCurrentUser();

    if (updates.role && !this.canUpdateRole(currentUser, updates.role)) {
      throw new ForbiddenError('Insufficient permissions to update role');
    }

    // Organization-specific validations
    if (updates.organizationId) {
      await this.validateOrganizationAccess(currentUser, updates.organizationId);
    }
  }
}
```

### 3. Process Service

```typescript
// process/process-service.ts
export class ProcessService {
  constructor(
    private processRepository: ProcessRepository,
    private clientRepository: ClientRepository,
    private deadlineRepository: DeadlineRepository,
    private documentRepository: DocumentRepository,
    private auditService: AuditService,
    private notificationService: NotificationService
  ) {}

  async createProcess(data: CreateProcessDTO): Promise<ProcessDTO> {
    // Validate business rules
    await this.validateProcessCreation(data);

    // Create process with transaction
    const process = await this.processRepository.create({
      title: data.title,
      description: data.description,
      clientId: data.clientId,
      assignedLawyerId: data.assignedLawyerId,
      status: ProcessStatus.DRAFT,
      priority: data.priority || ProcessPriority.MEDIUM,
      processNumber: await this.generateProcessNumber(),
      court: data.court,
      processType: data.processType
    });

    // Create initial deadlines if provided
    if (data.deadlines?.length) {
      await this.createProcessDeadlines(process.id, data.deadlines);
    }

    // Create initial documents if provided
    if (data.documents?.length) {
      await this.createProcessDocuments(process.id, data.documents);
    }

    // Send notifications
    await this.notificationService.notifyProcessCreated(process);

    // Log activity
    await this.auditService.logActivity({
      processId: process.id,
      userId: data.createdBy,
      action: 'PROCESS_CREATED',
      details: { title: process.title, client: data.clientId }
    });

    return ProcessMapper.toDTO(process);
  }

  async updateProcessStatus(processId: string, newStatus: ProcessStatus, reason?: string): Promise<ProcessDTO> {
    // Get current process
    const process = await this.processRepository.findById(processId);
    if (!process) {
      throw new NotFoundError('Process not found');
    }

    // Validate status transition
    if (!this.isValidStatusTransition(process.status, newStatus)) {
      throw new ValidationError(`Invalid status transition from ${process.status} to ${newStatus}`);
    }

    // Apply business rules for status change
    await this.applyStatusChangeRules(process, newStatus);

    // Update process
    const updatedProcess = await this.processRepository.update(processId, {
      status: newStatus,
      statusChangedAt: new Date(),
      statusChangeReason: reason
    });

    // Handle status-specific actions
    await this.handleStatusChangeActions(updatedProcess, newStatus);

    // Log activity
    await this.auditService.logActivity({
      processId,
      action: 'STATUS_CHANGED',
      details: {
        from: process.status,
        to: newStatus,
        reason
      }
    });

    return ProcessMapper.toDTO(updatedProcess);
  }

  private async validateProcessCreation(data: CreateProcessDTO): Promise<void> {
    // Validate client exists
    const client = await this.clientRepository.findById(data.clientId);
    if (!client) {
      throw new ValidationError('Client not found');
    }

    // Validate assigned lawyer
    if (data.assignedLawyerId) {
      const lawyer = await this.userRepository.findById(data.assignedLawyerId);
      if (!lawyer || lawyer.role !== UserRole.LAWYER) {
        throw new ValidationError('Invalid lawyer assignment');
      }
    }

    // Validate process number uniqueness if provided
    if (data.processNumber) {
      const existingProcess = await this.processRepository.findByProcessNumber(data.processNumber);
      if (existingProcess) {
        throw new ValidationError('Process number already exists');
      }
    }
  }

  private isValidStatusTransition(currentStatus: ProcessStatus, newStatus: ProcessStatus): boolean {
    const validTransitions: Record<ProcessStatus, ProcessStatus[]> = {
      [ProcessStatus.DRAFT]: [ProcessStatus.ACTIVE, ProcessStatus.CANCELLED],
      [ProcessStatus.ACTIVE]: [ProcessStatus.ON_HOLD, ProcessStatus.COMPLETED, ProcessStatus.CANCELLED],
      [ProcessStatus.ON_HOLD]: [ProcessStatus.ACTIVE, ProcessStatus.CANCELLED],
      [ProcessStatus.COMPLETED]: [], // No transitions from completed
      [ProcessStatus.CANCELLED]: [] // No transitions from cancelled
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private async generateProcessNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.processRepository.countByYear(year);
    return `${year}-${String(count + 1).padStart(6, '0')}`;
  }
}
```

## Business Modules

### 1. Authentication Module

```typescript
// modules/auth/auth-service.ts
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
    private supabaseClient: SupabaseClient,
    private auditService: AuditService
  ) {}

  async signIn(credentials: SignInCredentials): Promise<AuthResult> {
    try {
      // Authenticate with Supabase
      const { data, error } = await this.supabaseClient.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        throw new AuthenticationError(error.message);
      }

      // Get or create user in our database
      let user = await this.userRepository.findBySupabaseId(data.user.id);
      if (!user) {
        user = await this.createUserFromSupabase(data.user);
      }

      // Create session
      const session = await this.sessionRepository.create({
        userId: user.id,
        supabaseSessionId: data.session.access_token,
        expiresAt: new Date(data.session.expires_at! * 1000),
        ipAddress: credentials.ipAddress,
        userAgent: credentials.userAgent
      });

      // Log activity
      await this.auditService.logActivity({
        userId: user.id,
        action: 'USER_SIGNED_IN',
        details: { ipAddress: credentials.ipAddress }
      });

      return {
        user: UserMapper.toDTO(user),
        session: SessionMapper.toDTO(session),
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token
      };
    } catch (error) {
      // Log failed attempt
      await this.auditService.logActivity({
        action: 'SIGN_IN_FAILED',
        details: {
          email: credentials.email,
          error: error.message,
          ipAddress: credentials.ipAddress
        }
      });
      throw error;
    }
  }

  async signOut(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    // Revoke Supabase session
    await this.supabaseClient.auth.signOut();

    // Invalidate our session
    await this.sessionRepository.invalidate(sessionId);

    // Log activity
    await this.auditService.logActivity({
      userId: session.userId,
      action: 'USER_SIGNED_OUT',
      details: { sessionId }
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    const { data, error } = await this.supabaseClient.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Update session
    const session = await this.sessionRepository.findBySupabaseSessionId(data.session.access_token);
    if (session) {
      await this.sessionRepository.update(session.id, {
        expiresAt: new Date(data.session.expires_at! * 1000)
      });
    }

    const user = await this.userRepository.findBySupabaseId(data.user.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      user: UserMapper.toDTO(user),
      session: session ? SessionMapper.toDTO(session) : null,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token
    };
  }
}
```

### 2. Process Management Module

```typescript
// modules/process/process-management-service.ts
export class ProcessManagementService {
  constructor(
    private processService: ProcessService,
    private deadlineService: DeadlineService,
    private documentService: DocumentService,
    private clientService: ClientService,
    private notificationService: NotificationService
  ) {}

  async createCompleteProcess(data: CreateCompleteProcessDTO): Promise<CompleteProcessDTO> {
    // Validate complete process data
    await this.validateCompleteProcessData(data);

    // Create client if new
    let clientId = data.clientId;
    if (data.newClient) {
      const client = await this.clientService.create(data.newClient);
      clientId = client.id;
    }

    // Create process
    const process = await this.processService.create({
      ...data.process,
      clientId
    });

    // Create deadlines
    const deadlines = await Promise.all(
      data.deadlines.map(deadline =>
        this.deadlineService.create({
          ...deadline,
          processId: process.id
        })
      )
    );

    // Upload and create documents
    const documents = await Promise.all(
      data.documents.map(doc =>
        this.documentService.createWithUpload({
          ...doc,
          processId: process.id
        })
      )
    );

    // Send notifications
    await this.notificationService.notifyProcessCreated(process);

    if (deadlines.length > 0) {
      await this.notificationService.notifyDeadlinesCreated(deadlines);
    }

    return {
      process,
      deadlines,
      documents,
      client: await this.clientService.getById(clientId)
    };
  }

  async transferProcess(processId: string, transferData: ProcessTransferDTO): Promise<ProcessDTO> {
    // Validate transfer permissions
    await this.validateProcessTransfer(processId, transferData);

    // Get current process
    const process = await this.processService.getById(processId);
    if (!process) {
      throw new NotFoundError('Process not found');
    }

    // Update process assignment
    const updatedProcess = await this.processService.update(processId, {
      assignedLawyerId: transferData.newLawyerId,
      transferReason: transferData.reason,
      transferredAt: new Date(),
      transferredBy: transferData.transferredBy
    });

    // Create transfer notification
    await this.notificationService.notifyProcessTransferred({
      process: updatedProcess,
      fromLawyer: process.assignedLawyerId,
      toLawyer: transferData.newLawyerId,
      reason: transferData.reason
    });

    // Log transfer activity
    await this.auditService.logActivity({
      processId,
      userId: transferData.transferredBy,
      action: 'PROCESS_TRANSFERRED',
      details: {
        fromLawyer: process.assignedLawyerId,
        toLawyer: transferData.newLawyerId,
        reason: transferData.reason
      }
    });

    return updatedProcess;
  }
}
```

## Validation Schemas

### 1. User Validation

```typescript
// schemas/user-schemas.ts
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  document: z.string().optional(),
  role: z.enum(['ADMIN', 'LAWYER', 'USER']).default('USER'),
  organizationId: z.string().uuid().optional(),
  supabaseId: z.string().uuid()
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  document: z.string().optional(),
  role: z.enum(['ADMIN', 'LAWYER', 'USER']).optional(),
  organizationId: z.string().uuid().optional(),
  profile: z.object({
    bio: z.string().optional(),
    avatar: z.string().url().optional(),
    preferences: z.record(z.any()).optional()
  }).optional()
});

export const UserQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'LAWYER', 'USER']).optional(),
  organizationId: z.string().uuid().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Type inference
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
export type UserQueryDTO = z.infer<typeof UserQuerySchema>;
```

### 2. Process Validation

```typescript
// schemas/process-schemas.ts
export const CreateProcessSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  clientId: z.string().uuid('Invalid client ID'),
  assignedLawyerId: z.string().uuid().optional(),
  processNumber: z.string().optional(),
  court: z.string().optional(),
  processType: z.enum(['CIVIL', 'CRIMINAL', 'LABOR', 'FAMILY', 'TAX']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  deadlines: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    dueDate: z.date(),
    type: z.enum(['HEARING', 'FILING', 'RESPONSE', 'APPEAL'])
  })).optional(),
  documents: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    file: z.instanceof(File),
    type: z.enum(['CONTRACT', 'EVIDENCE', 'CORRESPONDENCE', 'COURT_ORDER'])
  })).optional()
});

export const UpdateProcessStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']),
  reason: z.string().optional()
});

export const ProcessTransferSchema = z.object({
  newLawyerId: z.string().uuid('Invalid lawyer ID'),
  reason: z.string().min(10, 'Transfer reason must be at least 10 characters'),
  transferredBy: z.string().uuid('Invalid user ID')
});
```

## Error Handling

### 1. Custom Error Classes

```typescript
// utils/errors.ts
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;
  abstract readonly errorCode: string;

  constructor(message: string, public readonly context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly isOperational = true;
  readonly errorCode = 'VALIDATION_ERROR';

  constructor(message: string, public readonly validationErrors?: Record<string, string[]>) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly isOperational = true;
  readonly errorCode = 'NOT_FOUND';
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly isOperational = true;
  readonly errorCode = 'FORBIDDEN';
}

export class AuthenticationError extends AppError {
  readonly statusCode = 401;
  readonly isOperational = true;
  readonly errorCode = 'AUTHENTICATION_ERROR';
}

export class BusinessRuleError extends AppError {
  readonly statusCode = 422;
  readonly isOperational = true;
  readonly errorCode = 'BUSINESS_RULE_VIOLATION';
}
```

### 2. Error Handler Service

```typescript
// services/error-handler-service.ts
export class ErrorHandlerService {
  constructor(
    private logger: Logger,
    private notificationService: NotificationService
  ) {}

  handleError(error: Error, context?: Record<string, any>): never {
    // Log error
    this.logger.error(error.message, {
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });

    // Send notifications for critical errors
    if (this.isCriticalError(error)) {
      this.notificationService.notifyAdmins({
        type: 'CRITICAL_ERROR',
        message: error.message,
        context
      });
    }

    // Transform error for client
    if (error instanceof AppError) {
      throw error;
    }

    // Handle unexpected errors
    throw new InternalServerError('An unexpected error occurred');
  }

  private isCriticalError(error: Error): boolean {
    return (
      error instanceof DatabaseConnectionError ||
      error instanceof ExternalServiceError ||
      (!error instanceof AppError && error.name !== 'ValidationError')
    );
  }
}
```

## Data Transformation

### 1. Mappers

```typescript
// utils/mappers/user-mapper.ts
export class UserMapper {
  static toDTO(user: User & { profile?: Profile }): UserDTO {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      supabaseId: user.supabaseId,
      organizationId: user.organizationId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile ? ProfileMapper.toDTO(user.profile) : null
    };
  }

  static fromCreateDTO(dto: CreateUserDTO): Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      email: dto.email,
      role: dto.role,
      supabaseId: dto.supabaseId,
      organizationId: dto.organizationId
    };
  }

  static fromUpdateDTO(dto: UpdateUserDTO): Partial<User> {
    const updates: Partial<User> = {};

    if (dto.role !== undefined) updates.role = dto.role;
    if (dto.organizationId !== undefined) updates.organizationId = dto.organizationId;

    return updates;
  }

  static toDTOList(users: (User & { profile?: Profile })[]): UserDTO[] {
    return users.map(user => this.toDTO(user));
  }
}
```

### 2. Result Type Utilities

```typescript
// utils/either.ts
export type Either<L, R> = Left<L> | Right<R>;

export class Left<L> {
  constructor(public readonly value: L) {}

  isLeft(): this is Left<L> {
    return true;
  }

  isRight(): this is Right<never> {
    return false;
  }
}

export class Right<R> {
  constructor(public readonly value: R) {}

  isLeft(): this is Left<never> {
    return false;
  }

  isRight(): this is Right<R> {
    return true;
  }
}

export const left = <L>(value: L): Either<L, never> => new Left(value);
export const right = <R>(value: R): Either<never, R> => new Right(value);

// Usage in services
export class ProcessService {
  async createProcess(data: CreateProcessDTO): Promise<Either<ValidationError, ProcessDTO>> {
    try {
      const validation = CreateProcessSchema.safeParse(data);
      if (!validation.success) {
        return left(new ValidationError('Invalid process data', validation.error.flatten().fieldErrors));
      }

      const process = await this.processRepository.create(validation.data);
      return right(ProcessMapper.toDTO(process));
    } catch (error) {
      return left(error as ValidationError);
    }
  }
}
```

## Testing Strategy

### 1. Service Testing

```typescript
// services/__tests__/user-service.test.ts
describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockProfileRepository: jest.Mocked<ProfileRepository>;
  let mockAuditService: jest.Mocked<AuditService>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockProfileRepository = createMockProfileRepository();
    mockAuditService = createMockAuditService();

    userService = new UserService(
      mockUserRepository,
      mockProfileRepository,
      mockOrganizationRepository,
      mockAuditService
    );
  });

  describe('createUserWithProfile', () => {
    it('should create user with profile successfully', async () => {
      // Arrange
      const userData: CreateUserDTO = {
        email: 'test@example.com',
        name: 'Test User',
        supabaseId: 'supabase-id',
        role: UserRole.USER
      };

      const mockUser = { id: 'user-id', ...userData };
      const mockProfile = { id: 'profile-id', userId: 'user-id', name: userData.name };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockProfileRepository.create.mockResolvedValue(mockProfile);

      // Act
      const result = await userService.createUserWithProfile(userData);

      // Assert
      expect(result).toEqual(expect.objectContaining({
        id: 'user-id',
        email: 'test@example.com',
        profile: expect.objectContaining({ name: 'Test User' })
      }));
      expect(mockAuditService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'USER_CREATED' })
      );
    });

    it('should throw ValidationError for duplicate email', async () => {
      // Arrange
      const userData: CreateUserDTO = {
        email: 'existing@example.com',
        name: 'Test User',
        supabaseId: 'supabase-id',
        role: UserRole.USER
      };

      mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing-id' } as User);

      // Act & Assert
      await expect(userService.createUserWithProfile(userData))
        .rejects
        .toThrow(ValidationError);
    });
  });
});
```

### 2. Integration Testing

```typescript
// services/__tests__/integration/process-service.integration.test.ts
describe('ProcessService Integration', () => {
  let processService: ProcessService;
  let testDatabase: TestDatabase;

  beforeAll(async () => {
    testDatabase = await setupTestDatabase();
    processService = createProcessService(testDatabase);
  });

  afterAll(async () => {
    await testDatabase.cleanup();
  });

  beforeEach(async () => {
    await testDatabase.reset();
  });

  it('should create process with deadlines and documents', async () => {
    // Arrange
    const client = await testDatabase.createClient({ name: 'Test Client' });
    const lawyer = await testDatabase.createUser({ role: UserRole.LAWYER });

    const processData: CreateProcessDTO = {
      title: 'Test Process',
      clientId: client.id,
      assignedLawyerId: lawyer.id,
      processType: 'CIVIL',
      deadlines: [{
        title: 'Initial Filing',
        dueDate: new Date('2024-12-31'),
        type: 'FILING'
      }]
    };

    // Act
    const result = await processService.create(processData);

    // Assert
    expect(result).toEqual(expect.objectContaining({
      title: 'Test Process',
      client: expect.objectContaining({ id: client.id }),
      assignedLawyer: expect.objectContaining({ id: lawyer.id })
    }));

    // Verify deadlines were created
    const deadlines = await testDatabase.getDeadlinesByProcessId(result.id);
    expect(deadlines).toHaveLength(1);
    expect(deadlines[0].title).toBe('Initial Filing');
  });
});
```

## Performance Considerations

### 1. Caching Strategy

```typescript
// services/cache-service.ts
export class CacheService {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Usage in services
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private cacheService: CacheService
  ) {}

  async getById(id: string): Promise<UserDTO | null> {
    const cacheKey = `user:${id}`;

    // Try cache first
    const cached = await this.cacheService.get<UserDTO>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const user = await this.userRepository.findById(id);
    if (user) {
      const dto = UserMapper.toDTO(user);
      await this.cacheService.set(cacheKey, dto, 1800); // 30 minutes
      return dto;
    }

    return null;
  }

  async update(id: string, updates: UpdateUserDTO): Promise<UserDTO> {
    const result = await this.userRepository.update(id, updates);

    // Invalidate cache
    await this.cacheService.invalidate(`user:${id}`);

    return UserMapper.toDTO(result);
  }
}
```

### 2. Batch Operations

```typescript
// services/batch-service.ts
export class BatchService {
  async batchUpdateProcesses(updates: Array<{ id: string; data: UpdateProcessDTO }>): Promise<ProcessDTO[]> {
    // Validate all updates first
    const validationResults = await Promise.all(
      updates.map(update => this.validateProcessUpdate(update.id, update.data))
    );

    const errors = validationResults.filter(result => result.isLeft());
    if (errors.length > 0) {
      throw new ValidationError('Batch validation failed', {
        errors: errors.map(error => error.value)
      });
    }

    // Perform batch update
    const results = await this.processRepository.batchUpdate(updates);

    // Invalidate caches
    await Promise.all(
      updates.map(update =>
        this.cacheService.invalidate(`process:${update.id}`)
      )
    );

    // Log batch activity
    await this.auditService.logActivity({
      action: 'BATCH_PROCESS_UPDATE',
      details: {
        count: updates.length,
        processIds: updates.map(u => u.id)
      }
    });

    return results.map(ProcessMapper.toDTO);
  }
}
```

## Best Practices

### 1. Service Design
- Keep services focused on a single domain
- Use dependency injection for testability
- Implement proper error handling
- Follow the single responsibility principle

### 2. Business Logic
- Encapsulate business rules in services
- Validate data at service boundaries
- Use domain-specific error types
- Implement comprehensive logging

### 3. Performance
- Implement caching for frequently accessed data
- Use batch operations for bulk updates
- Optimize database queries
- Monitor service performance

### 4. Maintainability
- Write comprehensive tests
- Document complex business logic
- Use consistent naming conventions
- Implement proper monitoring and alerting

---

*This business layer documentation provides a comprehensive guide for implementing and maintaining the core business logic of the LegalTrack application.*
