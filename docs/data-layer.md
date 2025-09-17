# Data Layer Documentation

## Overview

The Data Layer in LegalTrack serves as the abstraction between the business logic and the database. It implements the Repository pattern to provide a clean, testable interface for data operations while encapsulating database-specific logic.

## Architecture Principles

### 1. Repository Pattern
- **Abstraction**: Provides a uniform interface for data access
- **Testability**: Enables easy mocking and unit testing
- **Flexibility**: Allows switching between different data sources
- **Separation of Concerns**: Isolates database logic from business logic

### 2. Data Transfer Objects (DTOs)
- **Type Safety**: Ensures data integrity across layers
- **Validation**: Centralizes input/output validation
- **Transformation**: Handles data mapping between layers
- **API Contracts**: Defines clear interfaces for data exchange

## Directory Structure

```
src/
├── repositories/
│   ├── interfaces/           # Repository contracts
│   │   ├── user-repository.ts
│   │   ├── process-repository.ts
│   │   └── client-repository.ts
│   ├── prisma/              # Prisma implementations
│   │   ├── user-repository.ts
│   │   ├── process-repository.ts
│   │   └── client-repository.ts
│   └── index.ts             # Repository factory
├── dto/                     # Data Transfer Objects
│   ├── user.dto.ts
│   ├── process.dto.ts
│   └── client.dto.ts
├── mappers/                 # Data transformation
│   ├── user.mapper.ts
│   ├── process.mapper.ts
│   └── client.mapper.ts
└── types/
    ├── database.types.ts    # Database-specific types
    └── repository.types.ts  # Repository common types
```

## Repository Interfaces

### Base Repository Interface

```typescript
// src/repositories/interfaces/base-repository.ts
export interface BaseRepository<T, CreateDTO, UpdateDTO> {
  findById(id: string): Promise<T | null>;
  findMany(filters?: FilterOptions): Promise<T[]>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<void>;
  count(filters?: FilterOptions): Promise<number>;
}

export interface FilterOptions {
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  skip?: number;
  take?: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### User Repository Interface

```typescript
// src/repositories/interfaces/user-repository.ts
import { BaseRepository } from './base-repository';
import { UserDTO, CreateUserDTO, UpdateUserDTO } from '../../dto/user.dto';

export interface IUserRepository extends BaseRepository<UserDTO, CreateUserDTO, UpdateUserDTO> {
  findByEmail(email: string): Promise<UserDTO | null>;
  findByOrganization(organizationId: string): Promise<UserDTO[]>;
  updateProfile(userId: string, profileData: UpdateProfileDTO): Promise<UserDTO>;
  deactivateUser(userId: string): Promise<void>;
  findActiveUsers(filters?: FilterOptions): Promise<UserDTO[]>;
}
```

### Process Repository Interface

```typescript
// src/repositories/interfaces/process-repository.ts
import { BaseRepository } from './base-repository';
import { ProcessDTO, CreateProcessDTO, UpdateProcessDTO } from '../../dto/process.dto';

export interface IProcessRepository extends BaseRepository<ProcessDTO, CreateProcessDTO, UpdateProcessDTO> {
  findByClient(clientId: string): Promise<ProcessDTO[]>;
  findByStatus(status: ProcessStatus): Promise<ProcessDTO[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<ProcessDTO[]>;
  findWithDeadlines(processId: string): Promise<ProcessWithDeadlinesDTO>;
  updateStatus(processId: string, status: ProcessStatus): Promise<ProcessDTO>;
  getProcessStatistics(filters?: StatisticsFilters): Promise<ProcessStatistics>;
}
```

## Data Transfer Objects (DTOs)

### User DTOs

```typescript
// src/dto/user.dto.ts
import { z } from 'zod';

export const CreateUserDTOSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['ADMIN', 'LAWYER', 'ASSISTANT']),
  organizationId: z.string().uuid(),
  profile: z.object({
    phone: z.string().optional(),
    department: z.string().optional(),
    bio: z.string().optional()
  }).optional()
});

export const UpdateUserDTOSchema = CreateUserDTOSchema.partial();

export const UserDTOSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['ADMIN', 'LAWYER', 'ASSISTANT']),
  organizationId: z.string().uuid(),
  profile: z.object({
    phone: z.string().nullable(),
    department: z.string().nullable(),
    bio: z.string().nullable(),
    avatarUrl: z.string().nullable()
  }).nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type CreateUserDTO = z.infer<typeof CreateUserDTOSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserDTOSchema>;
export type UserDTO = z.infer<typeof UserDTOSchema>;
```

### Process DTOs

```typescript
// src/dto/process.dto.ts
import { z } from 'zod';

export const ProcessStatus = z.enum([
  'ACTIVE', 'PENDING', 'COMPLETED', 'ARCHIVED', 'CANCELLED'
]);

export const CreateProcessDTOSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  clientId: z.string().uuid(),
  assignedLawyerId: z.string().uuid(),
  status: ProcessStatus.default('PENDING'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  category: z.string(),
  metadata: z.record(z.any()).optional()
});

export const ProcessDTOSchema = CreateProcessDTOSchema.extend({
  id: z.string().uuid(),
  processNumber: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  client: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email()
  }).optional(),
  assignedLawyer: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email()
  }).optional()
});

export type CreateProcessDTO = z.infer<typeof CreateProcessDTOSchema>;
export type UpdateProcessDTO = Partial<CreateProcessDTO>;
export type ProcessDTO = z.infer<typeof ProcessDTOSchema>;
export type ProcessStatus = z.infer<typeof ProcessStatus>;
```

## Repository Implementations

### Prisma User Repository

```typescript
// src/repositories/prisma/user-repository.ts
import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../interfaces/user-repository';
import { UserDTO, CreateUserDTO, UpdateUserDTO } from '../../dto/user.dto';
import { UserMapper } from '../../mappers/user.mapper';
import { FilterOptions, PaginationResult } from '../interfaces/base-repository';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<UserDTO | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: { profile: true, organization: true }
      });
      
      return user ? UserMapper.toDTO(user) : null;
    } catch (error) {
      throw new RepositoryError('Failed to find user by ID', error);
    }
  }

  async findByEmail(email: string): Promise<UserDTO | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { profile: true, organization: true }
      });
      
      return user ? UserMapper.toDTO(user) : null;
    } catch (error) {
      throw new RepositoryError('Failed to find user by email', error);
    }
  }

  async findMany(filters?: FilterOptions): Promise<UserDTO[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: filters?.where,
        orderBy: filters?.orderBy,
        skip: filters?.skip,
        take: filters?.take,
        include: { profile: true, organization: true }
      });
      
      return users.map(UserMapper.toDTO);
    } catch (error) {
      throw new RepositoryError('Failed to find users', error);
    }
  }

  async create(data: CreateUserDTO): Promise<UserDTO> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          role: data.role,
          organizationId: data.organizationId,
          profile: data.profile ? {
            create: data.profile
          } : undefined
        },
        include: { profile: true, organization: true }
      });
      
      return UserMapper.toDTO(user);
    } catch (error) {
      throw new RepositoryError('Failed to create user', error);
    }
  }

  async update(id: string, data: UpdateUserDTO): Promise<UserDTO> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...data,
          profile: data.profile ? {
            upsert: {
              create: data.profile,
              update: data.profile
            }
          } : undefined
        },
        include: { profile: true, organization: true }
      });
      
      return UserMapper.toDTO(user);
    } catch (error) {
      throw new RepositoryError('Failed to update user', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw new RepositoryError('Failed to delete user', error);
    }
  }

  async count(filters?: FilterOptions): Promise<number> {
    try {
      return await this.prisma.user.count({
        where: filters?.where
      });
    } catch (error) {
      throw new RepositoryError('Failed to count users', error);
    }
  }

  async findByOrganization(organizationId: string): Promise<UserDTO[]> {
    return this.findMany({
      where: { organizationId, isActive: true }
    });
  }

  async updateProfile(userId: string, profileData: UpdateProfileDTO): Promise<UserDTO> {
    return this.update(userId, { profile: profileData });
  }

  async deactivateUser(userId: string): Promise<void> {
    await this.update(userId, { isActive: false });
  }

  async findActiveUsers(filters?: FilterOptions): Promise<UserDTO[]> {
    return this.findMany({
      ...filters,
      where: { ...filters?.where, isActive: true }
    });
  }
}
```

## Data Mappers

### User Mapper

```typescript
// src/mappers/user.mapper.ts
import { User, Profile, Organization } from '@prisma/client';
import { UserDTO } from '../dto/user.dto';

type UserWithRelations = User & {
  profile?: Profile | null;
  organization?: Organization | null;
};

export class UserMapper {
  static toDTO(user: UserWithRelations): UserDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'ADMIN' | 'LAWYER' | 'ASSISTANT',
      organizationId: user.organizationId,
      profile: user.profile ? {
        phone: user.profile.phone,
        department: user.profile.department,
        bio: user.profile.bio,
        avatarUrl: user.profile.avatarUrl
      } : null,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  static toDomain(dto: UserDTO): User {
    return {
      id: dto.id,
      email: dto.email,
      name: dto.name,
      role: dto.role,
      organizationId: dto.organizationId,
      isActive: dto.isActive,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    };
  }

  static toCreateData(dto: CreateUserDTO) {
    return {
      email: dto.email,
      name: dto.name,
      role: dto.role,
      organizationId: dto.organizationId,
      profile: dto.profile ? {
        create: dto.profile
      } : undefined
    };
  }
}
```

## Repository Factory

```typescript
// src/repositories/index.ts
import { PrismaClient } from '@prisma/client';
import { IUserRepository } from './interfaces/user-repository';
import { IProcessRepository } from './interfaces/process-repository';
import { IClientRepository } from './interfaces/client-repository';
import { PrismaUserRepository } from './prisma/user-repository';
import { PrismaProcessRepository } from './prisma/process-repository';
import { PrismaClientRepository } from './prisma/client-repository';

export interface RepositoryContainer {
  userRepository: IUserRepository;
  processRepository: IProcessRepository;
  clientRepository: IClientRepository;
}

export class RepositoryFactory {
  private static instance: RepositoryContainer;
  private static prisma: PrismaClient;

  static initialize(prisma: PrismaClient): void {
    this.prisma = prisma;
    this.instance = {
      userRepository: new PrismaUserRepository(prisma),
      processRepository: new PrismaProcessRepository(prisma),
      clientRepository: new PrismaClientRepository(prisma)
    };
  }

  static getRepositories(): RepositoryContainer {
    if (!this.instance) {
      throw new Error('RepositoryFactory not initialized');
    }
    return this.instance;
  }

  static getUserRepository(): IUserRepository {
    return this.getRepositories().userRepository;
  }

  static getProcessRepository(): IProcessRepository {
    return this.getRepositories().processRepository;
  }

  static getClientRepository(): IClientRepository {
    return this.getRepositories().clientRepository;
  }
}
```

## Error Handling

### Repository Error Classes

```typescript
// src/repositories/errors/repository-error.ts
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class NotFoundError extends RepositoryError {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`, undefined, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends RepositoryError {
  constructor(message: string, public readonly field?: string) {
    super(message, undefined, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class ConflictError extends RepositoryError {
  constructor(message: string) {
    super(message, undefined, 'CONFLICT');
    this.name = 'ConflictError';
  }
}
```

## Performance Optimization

### 1. Query Optimization

```typescript
// Efficient queries with proper includes
const processesWithDetails = await this.prisma.process.findMany({
  include: {
    client: {
      select: { id: true, name: true, email: true }
    },
    assignedLawyer: {
      select: { id: true, name: true, email: true }
    },
    _count: {
      select: { deadlines: true, documents: true }
    }
  }
});
```

### 2. Pagination Implementation

```typescript
async findPaginated(
  filters: FilterOptions,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginationResult<ProcessDTO>> {
  const skip = (page - 1) * pageSize;
  
  const [data, total] = await Promise.all([
    this.findMany({ ...filters, skip, take: pageSize }),
    this.count(filters)
  ]);
  
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}
```

### 3. Caching Strategy

```typescript
// Repository with caching
export class CachedUserRepository implements IUserRepository {
  constructor(
    private repository: IUserRepository,
    private cache: CacheService
  ) {}

  async findById(id: string): Promise<UserDTO | null> {
    const cacheKey = `user:${id}`;
    const cached = await this.cache.get<UserDTO>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const user = await this.repository.findById(id);
    if (user) {
      await this.cache.set(cacheKey, user, 300); // 5 minutes
    }
    
    return user;
  }
}
```

## Testing Strategy

### Repository Unit Tests

```typescript
// src/repositories/__tests__/user-repository.test.ts
import { PrismaUserRepository } from '../prisma/user-repository';
import { mockPrismaClient } from '../../__mocks__/prisma';
import { createMockUser } from '../../__mocks__/user';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    prisma = mockPrismaClient();
    repository = new PrismaUserRepository(prisma);
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const mockUser = createMockUser();
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findById('user-id');

      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email
      }));
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        include: { profile: true, organization: true }
      });
    });

    it('should return null when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should throw RepositoryError on database error', async () => {
      prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(repository.findById('user-id'))
        .rejects.toThrow(RepositoryError);
    });
  });
});
```

## Best Practices

### 1. Repository Design
- Keep repositories focused on data access only
- Use interfaces for better testability
- Implement proper error handling
- Follow consistent naming conventions

### 2. DTO Usage
- Validate all input data using Zod schemas
- Keep DTOs simple and focused
- Use proper type definitions
- Implement proper serialization

### 3. Performance
- Use database indexes effectively
- Implement proper pagination
- Cache frequently accessed data
- Optimize database queries

### 4. Error Handling
- Use specific error types
- Provide meaningful error messages
- Log errors appropriately
- Handle database constraints properly

### 5. Testing
- Mock database dependencies
- Test error scenarios
- Use factory functions for test data
- Test repository interfaces, not implementations

## Integration with Business Layer

```typescript
// src/services/user.service.ts
import { RepositoryFactory } from '../repositories';
import { CreateUserDTO, UserDTO } from '../dto/user.dto';
import { UserValidator } from '../validators/user.validator';

export class UserService {
  private userRepository = RepositoryFactory.getUserRepository();

  async createUser(data: CreateUserDTO): Promise<UserDTO> {
    // Validate business rules
    await UserValidator.validateCreateUser(data);
    
    // Check for existing user
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }
    
    // Create user through repository
    return await this.userRepository.create(data);
  }

  async getUserById(id: string): Promise<UserDTO> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }
    return user;
  }
}
```

This data layer provides a robust foundation for data access in LegalTrack, ensuring type safety, testability, and maintainability while abstracting database complexities from the business logic.