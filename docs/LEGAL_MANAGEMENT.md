# Legal Process Management System

## Domain
**Legal Process Management for Law Firms and Solo Practitioners**

## Description
A comprehensive system for managing legal processes, deadlines, clients, and tribunals. The system focuses on deadline tracking (*prazos*) which are critical in legal procedures. Missing a deadline can cause serious consequences, such as losing the right to present a defense or appeal.

---

## Core Entities

### 1. Users
Represents system users with role-based access control.

**Roles:**
- `SUPER_ADMIN`: Full system access across all accounts
- `ADMIN`: Account-level administration
- `LAWYER`: Legal professional with process management access

**Fields:**
- `userId`: Unique identifier
- `email`: User email address
- `name`: Full name
- `role`: User role (SUPER_ADMIN, ADMIN, LAWYER)
- `accountId`: Associated account/organization
- `avatarUrl`: Profile picture URL
- `isActive`: Account status

### 2. Processes
Represents legal cases/processes with comprehensive tracking.

**Fields:**
- `processId`: Unique identifier
- `caseNumber`: Official case number
- `tribunalId`: Associated tribunal
- `area`: Legal area (CIVIL, CRIMINAL, LABOR, FAMILY, etc.)
- `processType`: Type of process (LAWSUIT, APPEAL, PETITION, etc.)
- `parties`: Involved parties (plaintiff, defendant, etc.)
- `status`: Current status (ACTIVE, SUSPENDED, CONCLUDED, ARCHIVED)
- `visibility`: Access level (PUBLIC, CONFIDENTIAL)
- `clientId`: Associated client
- `description`: Process description
- `processValue`: Monetary value if applicable
- `assignedLawyers`: Array of assigned lawyer IDs
- `accountId`: Organization identifier
- `createdBy`: Creator user ID
- `updatedBy`: Last updater user ID
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### 3. Deadlines
Represents legal deadlines associated with processes.

**Fields:**
- `deadlineId`: Unique identifier
- `processId`: Associated process
- `title`: Deadline title
- `taskDescription`: What must be done (e.g., Submit appeal)
- `deadlineDate`: The final date and time to complete the task
- `timeUnit`: Unit used for calculation (BUSINESS_DAYS or CALENDAR_DAYS)
- `isExtendable`: Boolean indicating if the deadline can be extended
- `completionStatus`: Status (PENDING, DONE, MISSED)
- `priority`: Priority level (LOW, MEDIUM, HIGH, CRITICAL)
- `assignedTo`: Lawyer responsible for the task
- `completedAt`: Completion timestamp
- `completedBy`: User who completed the task
- `notes`: Additional notes
- `reminders`: Reminder settings
- `accountId`: Organization identifier

### 4. Clients
Represents clients (individuals or organizations).

**Fields:**
- `clientId`: Unique identifier
- `name`: Client name
- `document`: Legal document number (CPF, CNPJ, etc.)
- `documentType`: Type of document (CPF, CNPJ, RG, PASSPORT, OTHER)
- `clientType`: Type of client (INDIVIDUAL, COMPANY, GOVERNMENT, NGO)
- `email`: Contact email
- `phone`: Contact phone
- `address`: Physical address
- `notes`: Additional notes
- `isActive`: Active status
- `accountId`: Organization identifier

### 5. Tribunals
Represents courts and tribunals.

**Fields:**
- `tribunalId`: Unique identifier
- `name`: Tribunal name
- `code`: Official tribunal code
- `jurisdiction`: Jurisdiction level (FEDERAL, STATE, MUNICIPAL, LABOR, ELECTORAL, MILITARY)
- `tribunalType`: Type (SUPREME_COURT, SUPERIOR_COURT, APPELLATE_COURT, TRIAL_COURT, SPECIALIZED_COURT)
- `address`: Physical address
- `phone`: Contact phone
- `email`: Contact email
- `website`: Official website
- `isActive`: Active status
- `accountId`: Organization identifier

---

## Entity Relationships

### Process-Centric Model
- **Process** is the central entity connecting all other entities
- **Deadlines** belong to a Process (1:N relationship)
- **Process** belongs to a Client (N:1 relationship)
- **Process** is handled by a Tribunal (N:1 relationship)
- **Process** can have multiple assigned Lawyers (N:N relationship)
- **Users** can be assigned to multiple Processes and Deadlines
- All entities belong to an **Account** for strict multi-tenancy

### Enhanced Data Relationships

#### Account Structure
```
Account (1:N) → Users
Account (1:N) → Processes
Account (1:N) → Clients
Account (1:N) → Tribunals
Account (1:N) → Deadlines
Account (1:N) → ActivityLogs
```

#### Process Relationships
```
Process (N:1) → Client
Process (N:1) → Tribunal
Process (1:N) → Deadlines
Process (N:N) → Users (assignedTo)
Process (N:1) → User (createdBy)
Process (N:1) → User (updatedBy)
```

#### Deadline Relationships
```
Deadline (N:1) → Process
Deadline (N:1) → User (assignedTo)
Deadline (N:1) → User (completedBy)
```

#### Client Relationships
```
Client (1:N) → Processes
Client (N:1) → Account
```

#### Tribunal Relationships
```
Tribunal (1:N) → Processes
Tribunal (N:1) → Account (for custom tribunals)
```

### Authorization Model
- **Account-based isolation**: Strict data isolation between accounts
- **Role-based permissions**: Granular access control (SUPER_ADMIN, ADMIN, LAWYER)
- **Process visibility**: Public vs confidential process handling
- **Resource limits**: Account-based limits for users, processes, and storage
- **Comprehensive audit trail**: All operations logged with detailed metadata
- **Access validation**: Every operation validates user permissions and account access

### Data Integrity Features
- **Referential integrity**: Foreign key relationships enforced
- **Unique constraints**: Case numbers, client documents, tribunal codes
- **Validation rules**: Email formats, document types, date ranges
- **Soft deletes**: Data preservation with isActive flags
- **Audit timestamps**: createdAt, updatedAt tracking on all entities
- **Activity logging**: Comprehensive change tracking for compliance

---

## Implementation Details

### Database Schema (Convex)
The system uses Convex as the backend-as-a-service with the following tables:
- `users` - User management with RBAC
- `accounts` - Multi-tenant organization management with subscription limits
- `processes` - Legal process tracking with comprehensive metadata
- `deadlines` - Deadline management with priority and notification system
- `clients` - Client information with document validation
- `tribunals` - Court/tribunal data with contact information
- `activityLogs` - Comprehensive audit trail with metadata
- `invitations` - User invitation system with role assignment

#### Database Indexes
Optimized indexes for efficient querying:

**Processes:**
- `by_case_number` - Unique case number lookup
- `by_client` - Filter processes by client
- `by_tribunal` - Filter processes by tribunal
- `by_assigned_to` - Filter processes by assigned lawyer
- `by_status` - Filter processes by status
- `by_area` - Filter processes by legal area
- `by_account` - Account-based data isolation

**Deadlines:**
- `by_process` - Get all deadlines for a process
- `by_due_date` - Sort deadlines by due date
- `by_status` - Filter deadlines by completion status
- `by_assigned_to` - Filter deadlines by assigned lawyer
- `by_account` - Account-based data isolation

**Clients:**
- `by_document` - Unique document number lookup
- `by_type` - Filter clients by type (individual/company)
- `by_account` - Account-based data isolation

**Tribunals:**
- `by_code` - Unique tribunal code lookup
- `by_jurisdiction` - Filter tribunals by jurisdiction
- `by_type` - Filter tribunals by tribunal type
- `by_active` - Filter active tribunals

**Activity Logs:**
- `by_account` - Account-based audit trail
- `by_user` - Filter activities by user
- `by_action` - Filter activities by action type
- `by_timestamp` - Sort activities chronologically

### Key Features
1. **Multi-tenancy**: Account-based data isolation with subscription limits
2. **Role-based Access Control**: SUPER_ADMIN, ADMIN, LAWYER roles with granular permissions
3. **Comprehensive Audit Trail**: All operations logged with detailed metadata
4. **Advanced Deadline Tracking**: Priority-based deadline management with notifications
5. **Process Visibility**: Public vs confidential process handling
6. **Data Validation**: Strict validation for documents, emails, and business rules
7. **Account Limits**: Configurable limits for users, processes, and storage
8. **Activity Logging**: Detailed logging for compliance and monitoring
9. **Optimized Queries**: Indexed database for fast search and filtering
10. **Document Management**: Support for various document types (CPF, CNPJ, etc.)

### API Operations
Each entity supports comprehensive CRUD operations with advanced features:

#### Standard Operations
- **Create**: Add new records with strict validation and limit checking
- **Read**: Query with advanced filtering, search, and pagination
- **Update**: Modify existing records with change tracking
- **Delete**: Soft delete (mark as inactive) with audit trail
- **Statistics**: Aggregate data for dashboards and reporting

#### Advanced Features
- **Batch Operations**: Efficient bulk operations for large datasets
- **Search & Filter**: Multi-field search with complex filtering
- **Pagination**: Efficient pagination for large result sets
- **Access Control**: Role-based access validation on all operations
- **Activity Logging**: Automatic logging of all data changes
- **Validation**: Business rule validation and data integrity checks
- **Account Limits**: Automatic enforcement of subscription limits

#### Specific Entity Operations

**Processes:**
- `getProcesses` - List with filtering by status, area, client, tribunal
- `getProcessByCaseNumber` - Unique case number lookup
- `getProcessStats` - Statistics for dashboards
- `updateProcessStatus` - Status change with audit trail

**Deadlines:**
- `getUpcomingDeadlines` - Deadlines approaching due date
- `getMyDeadlines` - Deadlines assigned to current user
- `updateDeadlineStatus` - Mark deadlines as completed
- `getDeadlineStats` - Deadline statistics and metrics

**Clients:**
- `getClients` - List with filtering and search
- `getClientStats` - Client statistics and metrics
- Document validation for CPF, CNPJ, and other types

**Tribunals:**
- `getTribunals` - List with filtering by jurisdiction and type
- `getTribunalByCode` - Lookup by official tribunal code
- `getTribunalStats` - Tribunal usage statistics

---

## Example Data Structure

### Process with Deadlines
```json
{
  "processId": "proc_2025_00123",
  "caseNumber": "2025-00123",
  "tribunalId": "trib_stj_001",
  "area": "CIVIL",
  "processType": "LAWSUIT",
  "parties": {
    "plaintiff": "João Silva",
    "defendant": "Empresa XYZ Ltda"
  },
  "status": "ACTIVE",
  "visibility": "CONFIDENTIAL",
  "clientId": "client_001",
  "description": "Ação de cobrança por serviços prestados",
  "processValue": 50000.00,
  "assignedLawyers": ["user_lawyer_001", "user_lawyer_002"],
  "deadlines": [
    {
      "deadlineId": "deadline_001",
      "title": "Contestação",
      "taskDescription": "Apresentar contestação ao pedido inicial",
      "deadlineDate": 1725926399000,
      "timeUnit": "BUSINESS_DAYS",
      "isExtendable": false,
      "completionStatus": "PENDING",
      "priority": "HIGH",
      "assignedTo": "user_lawyer_001"
    },
    {
      "deadlineId": "deadline_002",
      "title": "Recurso de Apelação",
      "taskDescription": "Interpor recurso de apelação",
      "deadlineDate": 1727222399000,
      "timeUnit": "CALENDAR_DAYS",
      "isExtendable": true,
      "completionStatus": "PENDING",
      "priority": "MEDIUM",
      "assignedTo": "user_lawyer_002"
    }
  ]
}
```

### Client Information
```json
{
  "clientId": "client_001",
  "name": "João Silva",
  "document": "123.456.789-00",
  "documentType": "CPF",
  "clientType": "INDIVIDUAL",
  "email": "joao.silva@email.com",
  "phone": "+55 11 99999-9999",
  "address": "Rua das Flores, 123 - São Paulo, SP",
  "isActive": true
}
```

### Tribunal Information
```json
{
  "tribunalId": "trib_stj_001",
  "name": "Superior Tribunal de Justiça",
  "code": "STJ",
  "jurisdiction": "FEDERAL",
  "tribunalType": "SUPERIOR_COURT",
  "address": "Setor de Administração Federal Sul, Quadra 6, Lote 1, Trecho III - Brasília, DF",
  "phone": "+55 61 3319-8000",
  "email": "atendimento@stj.jus.br",
  "website": "https://www.stj.jus.br",
  "isActive": true
}
```
