# Product Requirements Document (PRD)
## Process Module

### Version: 1.0
### Date: August 22, 2025
### Author: Development Team
### Status: Draft

---

## 1. Overview

### 1.1 Purpose
This document outlines the requirements for the Process Module, which enables the management of legal processes within the deadlines management system. The module provides comprehensive CRUD operations, relationship management with deadlines and cases, and audit trail functionality.

### 1.2 Scope
The Process Module encompasses:
- Database schema and relationships
- API endpoints for process management
- User interface components
- Authorization and security
- Audit trail and history tracking

### 1.3 Goals
- Centralized management of legal processes
- Integration with existing deadline management system
- Comprehensive audit trail for compliance
- User-friendly interface following design system standards

---

## 2. Requirements

### 2.1 Database Schema

#### 2.1.1 Processes Table
**Table Name:** `processes`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `case_number` | String | Required, Unique | Legal case number |
| `court` | String | Required | Court name/jurisdiction |
| `area` | Enum | Required | Legal area (civil, labor, criminal, family, tax, administrative, constitutional, international) |
| `parties` | JSON/Object | Required | Structured data for party names and roles |
| `status` | Enum | Required | Process status (ongoing, suspended, archived, closed) |
| `_creationTime` | Number | System field | Creation timestamp |
| `_id` | ID | System field | Convex document ID |

#### 2.1.2 Relationships
- **One-to-Many:** `processes` → `deadlines` (one process can have multiple deadlines)
- **One-to-Many:** `processes` → `cases` (one process can have multiple related cases)

#### 2.1.3 Indexes
- `by_case_number`: Index on `case_number` for unique constraint and fast lookup
- `by_court`: Index on `court` for filtering
- `by_area`: Index on `area` for filtering
- `by_status`: Index on `status` for filtering

### 2.2 API Endpoints

#### 2.2.1 Create Process
**Endpoint:** `POST /api/processes`

**Request Payload:**
```json
{
  "case_number": "string (required)",
  "court": "string (required)",
  "area": "enum (required)",
  "parties": "object (required)",
  "status": "enum (required)"
}
```

**Response:**
- **Success (201):** Process object with generated ID
- **Error (400):** Validation errors
- **Error (409):** Duplicate case number

**Validations:**
- Case number uniqueness check
- Required field validation
- Enum value validation

#### 2.2.2 Update Process
**Endpoint:** `PUT /api/processes/:id`

**Request Payload:**
```json
{
  "court": "string (optional)",
  "area": "enum (optional)",
  "parties": "object (optional)",
  "status": "enum (optional)"
}
```

**Response:**
- **Success (200):** Updated process object
- **Error (400):** Validation errors
- **Error (404):** Process not found

**Business Rules:**
- `case_number` cannot be modified
- Changes are logged in audit trail

#### 2.2.3 Delete Process
**Endpoint:** `DELETE /api/processes/:id`

**Response:**
- **Success (204):** No content
- **Error (403):** Insufficient permissions
- **Error (404):** Process not found

**Business Rules:**
- Admin-only operation
- Soft delete implementation (mark as deleted, don't remove)
- Cascade behavior for related entities

#### 2.2.4 List Processes
**Endpoint:** `GET /api/processes`

**Query Parameters:**
- `status`: Filter by status
- `court`: Filter by court
- `area`: Filter by area
- `case_number`: Search by case number
- `cursor`: Pagination cursor
- `numItems`: Number of items per page (default: 25)

**Response:**
```json
{
  "page": [
    {
      "id": "string",
      "case_number": "string",
      "court": "string",
      "area": "string",
      "status": "string",
      "_creationTime": "number"
    }
  ],
  "isDone": "boolean",
  "continueCursor": "string"
}
```

#### 2.2.5 Get Process Details
**Endpoint:** `GET /api/processes/:id`

**Response:**
```json
{
  "id": "string",
  "case_number": "string",
  "court": "string",
  "area": "string",
  "parties": "object",
  "status": "string",
  "_creationTime": "number",
  "deadlines": [
    {
      "id": "string",
      "title": "string",
      "due_date": "string",
      "status": "string"
    }
  ],
  "cases": [
    {
      "id": "string",
      "title": "string",
      "status": "string"
    }
  ]
}
```

### 2.3 User Interface

#### 2.3.1 Process Registration Form
**Location:** `/dashboard/processes/new`

**Components:**
- Form with ShadcnUI components
- Slate theme consistency
- Fields:
  - Case Number (text input, required)
  - Court (text input, required)
  - Area (select dropdown, required)
  - Parties (structured input/textarea, required)
  - Status (select dropdown, required)
- Save button with loading state
- Cancel button

**Validation:**
- Real-time field validation
- Duplicate case number check
- Required field indicators

#### 2.3.2 Process List View
**Location:** `/dashboard/processes`

**Components:**
- Data table with columns:
  - Case Number
  - Court
  - Area
  - Status
  - Actions (Edit/Delete)
- Filter controls:
  - Status filter
  - Court filter
  - Area filter
- Search bar for case number
- Pagination controls
- New Process button

**Features:**
- Sortable columns
- Responsive design
- Bulk actions (future enhancement)

#### 2.3.3 Process Detail View
**Location:** `/dashboard/processes/:id`

**Layout:**
- Header with process information
- Tab navigation:
  - **Overview:** Basic process information
  - **Deadlines:** Related deadlines list
  - **Cases:** Related cases list
  - **History:** Audit trail

**Actions:**
- Edit button
- Delete button (admin only)
- Add Deadline button
- Add Case button

#### 2.3.4 Process Edit Form
**Location:** `/dashboard/processes/:id/edit`

**Components:**
- Pre-populated form
- Case Number (read-only)
- Editable fields: Court, Area, Parties, Status
- Update button
- Cancel button

### 2.4 Authorization

#### 2.4.1 Access Control
- **Create:** Authenticated users
- **Read:** Authenticated users
- **Update:** Authenticated users (own processes) + Admins (all processes)
- **Delete:** Admins only

#### 2.4.2 Data Security
- Process data visible only to authorized users
- Audit trail for all modifications
- Secure API endpoints with authentication

### 2.5 Audit Trail

#### 2.5.1 Process History Table
**Table Name:** `process_history`

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID | Primary Key |
| `process_id` | ID | Reference to process |
| `user_id` | ID | User who made the change |
| `action` | Enum | Type of action (create, update, delete) |
| `field_changes` | Object | Before/after values |
| `timestamp` | Number | When the change occurred |

#### 2.5.2 Tracked Events
- Process creation
- Field modifications
- Status changes
- Deletion/archival

---

## 3. Technical Specifications

### 3.1 Technology Stack
- **Backend:** Convex (serverless functions)
- **Frontend:** Next.js with TypeScript
- **UI Components:** ShadcnUI with Slate theme
- **Database:** Convex database
- **Authentication:** Convex Auth

### 3.2 Data Models

#### 3.2.1 Process Areas Enum
```typescript
export const ProcessArea = {
  CIVIL: "civil",
  LABOR: "labor",
  CRIMINAL: "criminal",
  FAMILY: "family",
  TAX: "tax",
  ADMINISTRATIVE: "administrative",
  CONSTITUTIONAL: "constitutional",
  INTERNATIONAL: "international"
} as const;
```

#### 3.2.2 Process Status Enum
```typescript
export const ProcessStatus = {
  ONGOING: "ongoing",
  SUSPENDED: "suspended",
  ARCHIVED: "archived",
  CLOSED: "closed"
} as const;
```

#### 3.2.3 Parties Structure
```typescript
interface ProcessParties {
  plaintiff: {
    name: string;
    type: "individual" | "company" | "government";
    document?: string;
  };
  defendant: {
    name: string;
    type: "individual" | "company" | "government";
    document?: string;
  };
  lawyers?: {
    plaintiff?: string[];
    defendant?: string[];
  };
}
```

### 3.3 Validation Rules
- Case number: Alphanumeric, 10-50 characters
- Court: Non-empty string, max 200 characters
- Area: Must be valid enum value
- Parties: Must contain at least plaintiff and defendant
- Status: Must be valid enum value

---

## 4. Success Criteria

### 4.1 Functional Requirements
- [ ] All CRUD operations working correctly
- [ ] Proper validation and error handling
- [ ] Relationship management with deadlines/cases
- [ ] Audit trail functionality
- [ ] Search and filtering capabilities

### 4.2 Non-Functional Requirements
- [ ] Response time < 500ms for list operations
- [ ] Response time < 200ms for single record operations
- [ ] 99.9% uptime
- [ ] Mobile-responsive UI
- [ ] Accessibility compliance (WCAG 2.1 AA)

### 4.3 Security Requirements
- [ ] Authentication required for all operations
- [ ] Authorization checks implemented
- [ ] Audit trail for all changes
- [ ] Data validation on both client and server

---

## 5. Dependencies

### 5.1 External Dependencies
- Existing authentication system
- Deadline management module
- Case management module (if exists)

### 5.2 Internal Dependencies
- ShadcnUI component library
- Convex backend infrastructure
- Design system consistency

---

## 6. Risks and Mitigation

### 6.1 Technical Risks
- **Risk:** Complex relationship management
- **Mitigation:** Careful schema design and testing

- **Risk:** Performance with large datasets
- **Mitigation:** Proper indexing and pagination

### 6.2 Business Risks
- **Risk:** User adoption
- **Mitigation:** Intuitive UI design and user training

- **Risk:** Data integrity
- **Mitigation:** Comprehensive validation and audit trail

---

## 7. Timeline

### Phase 1: Database and API (Week 1-2)
- Schema implementation
- Core CRUD operations
- Basic validation

### Phase 2: User Interface (Week 3-4)
- Form components
- List and detail views
- Integration with API

### Phase 3: Advanced Features (Week 5-6)
- Audit trail
- Advanced filtering
- Relationship management

### Phase 4: Testing and Polish (Week 7-8)
- Comprehensive testing
- Performance optimization
- UI/UX refinements

---

## 8. Unit Testing Plan

### 8.1 Testing Strategy

The Process Module follows a comprehensive testing strategy using **Vitest** for unit tests and an **In-Memory Repository** pattern for isolated testing. This approach ensures:

- **Fast execution**: Tests run without database dependencies
- **Isolation**: Each test is independent and doesn't affect others
- **Maintainability**: Clear separation between business logic and infrastructure
- **Reliability**: Predictable results without external dependencies

### 8.2 Test Structure

#### 8.2.1 Test Organization
```
src/modules/process/actions/
├── __tests__/
│   ├── insert-process-action.test.ts
│   ├── update-process-action.test.ts
│   ├── delete-process-action.test.ts
│   ├── get-process-by-id-action.test.ts
│   ├── get-processes-action.test.ts
│   └── search-processes-action.test.ts
├── insert-process-action.ts
├── update-process-action.ts
├── delete-process-action.ts
├── get-process-by-id-action.ts
├── get-processes-action.ts
├── search-processes-action.ts
└── index.ts
```

#### 8.2.2 In-Memory Repository
Located at `tests/repositories/in-memory-process-repository.ts`, provides:

```typescript
export class InMemoryProcessRepository {
  public items: Process[] = []

  async create(data: ProcessInsert): Promise<Process>
  async update(id: string, data: Partial<ProcessInsert>): Promise<Process | null>
  async delete(id: string): Promise<boolean>
  async findById(id: string): Promise<Process | null>
  async findAll(filters?: ProcessFilters): Promise<Process[]>
  async search(query: string): Promise<Process[]>
  async count(filters?: ProcessFilters): Promise<number>
  clear(): void
}
```

### 8.3 Test Coverage

#### 8.3.1 Insert Process Action (`insertProcessAction`)

**Positive Scenarios:**
- ✓ Should create a new process with valid input
- ✓ Should associate process with current account
- ✓ Should revalidate dashboard path after creation
- ✓ Should handle optional fields (tags, client_id)

**Negative Scenarios:**
- ✓ Should return error if input validation fails
- ✓ Should return error if no account context
- ✓ Should return error if database insert fails
- ✓ Should validate required fields (title, cnj, court)

**Edge Cases:**
- Empty or null values for optional fields
- Special characters in text fields
- Very long strings

#### 8.3.2 Update Process Action (`updateProcessAction`)

**Positive Scenarios:**
- ✓ Should update process with valid input
- ✓ Should only update provided fields
- ✓ Should update timestamp automatically
- ✓ Should respect account isolation

**Negative Scenarios:**
- ✓ Should return error if process not found
- ✓ Should return error if no account context
- ✓ Should return error if access denied (different account)
- ✓ Should return error if input validation fails

**Edge Cases:**
- Updating with same values
- Partial updates
- Concurrent update scenarios

#### 8.3.3 Delete Process Action (`deleteProcessAction`)

**Positive Scenarios:**
- ✓ Should perform soft delete (set deleted_at timestamp)
- ✓ Should revalidate dashboard path
- ✓ Should respect account isolation

**Negative Scenarios:**
- ✓ Should return error if process not found
- ✓ Should return error if no account context
- ✓ Should return error if access denied
- ✓ Should not hard delete from database

**Edge Cases:**
- Deleting already deleted process
- Deleting process with related deadlines

#### 8.3.4 Get Process By ID Action (`getProcessByIdAction`)

**Positive Scenarios:**
- ✓ Should return process by valid ID
- ✓ Should respect account isolation
- ✓ Should exclude soft-deleted processes

**Negative Scenarios:**
- ✓ Should return null if process not found
- ✓ Should return null if no account context
- ✓ Should return null for deleted processes
- ✓ Should return null for processes from other accounts

**Edge Cases:**
- Invalid ID format
- Non-existent ID

#### 8.3.5 Get Processes Action (`getProcessesAction`)

**Positive Scenarios:**
- ✓ Should return paginated list of processes
- ✓ Should filter by status
- ✓ Should search by query (title, cnj, court)
- ✓ Should sort by different fields
- ✓ Should respect account isolation

**Negative Scenarios:**
- ✓ Should return error if no account context
- ✓ Should return empty array if no results
- ✓ Should handle invalid pagination parameters

**Edge Cases:**
- Large page numbers
- Very small page sizes
- Sorting with null values

#### 8.3.6 Search Processes Action (`searchProcessesAction`)

**Positive Scenarios:**
- ✓ Should search processes by query string
- ✓ Should filter by status
- ✓ Should calculate hasMore correctly
- ✓ Should return total count
- ✓ Should paginate results

**Negative Scenarios:**
- ✓ Should return empty array if no account context
- ✓ Should handle empty search query
- ✓ Should handle no results found

**Edge Cases:**
- Special characters in search query
- Very long search queries
- Multiple filters combined

### 8.4 Mocking Strategy

#### 8.4.1 Database Mocking
```typescript
vi.mock('@infra/db', () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
    select: vi.fn(),
    delete: vi.fn(),
  },
}))
```

#### 8.4.2 Account Context Mocking
```typescript
vi.mock('@modules/account/utils/get-current-account', () => ({
  getCurrentAccountId: vi.fn().mockResolvedValue(1),
}))
```

#### 8.4.3 Next.js Cache Mocking
```typescript
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))
```

### 8.5 Running Tests

```bash
# Run all tests
pnpm test

# Run process module tests only
pnpm test src/modules/process

# Run with coverage
pnpm test --coverage

# Run in watch mode
pnpm test --watch
```

### 8.6 Coverage Goals

- **Line Coverage**: > 80%
- **Branch Coverage**: > 75%
- **Function Coverage**: > 90%
- **Statement Coverage**: > 80%

### 8.7 Integration Tests (Future)

While unit tests use mocked dependencies, integration tests will:
- Use a test database instance
- Test actual database operations
- Validate Drizzle ORM queries
- Test transaction rollbacks
- Verify data integrity constraints

**Location**: `src/modules/process/__integration__/`

### 8.8 Best Practices

1. **Arrange-Act-Assert Pattern**: Each test follows clear structure
2. **Descriptive Test Names**: Use "should..." pattern for clarity
3. **Independent Tests**: No shared state between tests
4. **Mock Reset**: Clear all mocks in `beforeEach`
5. **Type Safety**: Use proper TypeScript types in tests
6. **Edge Cases**: Test boundary conditions and error paths
7. **Documentation**: Comment complex test scenarios

### 8.9 Continuous Integration

Tests run automatically on:
- Every pull request
- Before merge to main branch
- Pre-commit hooks (optional)
- Scheduled nightly builds

**CI Configuration**: `.github/workflows/test.yml`

---

## 9. Appendices

### 9.1 Wireframes
[To be added]

### 9.2 API Documentation
[To be generated from implementation]

### 9.3 Database Schema Diagram
[To be created]
