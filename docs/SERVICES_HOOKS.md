# Job Services & Hooks - Implementation Guide

This document details the complete implementation of services and hooks for the Job domain, serving as a reference for the established pattern.

## 📋 Table of Contents

- [Overview](#overview)
- [Implemented Services](#implemented-services)
- [Implemented Hooks](#implemented-hooks)
- [Usage Examples](#usage-examples)
- [Legacy Migration](#legacy-migration)
- [Troubleshooting](#troubleshooting)

## Overview

The Job domain implements the most robust pattern identified in the project, following the **Company Pattern** with:

- ✅ **ProcessedSupabaseError** with timestamp and operation
- ✅ **Custom retry logic** for different error types
- ✅ **Intelligent query invalidation** and specific
- ✅ **Computed states** for optimized performance
- ✅ **Customizable callbacks** and configurable toast
- ✅ **Total compatibility** with legacy implementation

## Implemented Services

### File Structure

```
src/services/job/
├── index.ts                           # Organized exports
├── get-job-by-id-service.ts          # Fetch job by ID
├── get-job-by-public-id-service.ts   # Fetch job by public_id
├── get-jobs-by-company-service.ts    # List company jobs
├── search-jobs-service.ts            # Search jobs with filters
├── job-insert-service.ts             # Job creation
├── job-update-service.ts             # Job updates
├── job-delete-service.ts             # Soft delete jobs
├── job-toggle-status-service.ts      # Toggle job status
└── job-application-service.ts        # Job applications
```

### Detailed Services

#### 1. get-job-by-id-service.ts

```typescript
export interface GetJobByIdOutput {
  job: Job | null;
  error: PostgrestError | null;
}

export async function getJobById(id: string): Promise<GetJobByIdOutput>
```

**Usage**: Fetches a specific job by internal ID.

#### 2. get-job-by-public-id-service.ts

```typescript
interface GetJobByPublicIdOutput {
  success: boolean;
  job?: Job;
  error?: PostgrestError | string;
}

export async function getJobByPublicIdService(publicId: string): Promise<GetJobByPublicIdOutput>
```

**Usage**: Fetches job by public_id (used in public URLs).

#### 3. get-jobs-by-company-service.ts

```typescript
export interface GetJobsByCompanyParams {
  companyId: string;
  status?: JobStatus;
  limit?: number;
  offset?: number;
}

export async function getJobsByCompany(params: GetJobsByCompanyParams): Promise<GetJobsByCompanyOutput>
```

**Usage**: Lists company jobs with optional filters.

#### 4. search-jobs-service.ts

```typescript
export interface SearchJobsParams {
  q?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}

export async function searchJobsService(params?: SearchJobsParams): Promise<SearchJobsOutput>
```

**Usage**: Searches jobs with text query and location filters.

#### 5. job-insert-service.ts

```typescript
export async function jobInsertService(
  jobData: Omit<JobInsert, "public_id">
): Promise<JobInsertOutput>
```

**Usage**: Creates new job with automatically generated unique public_id.

#### 6. job-update-service.ts

```typescript
export async function jobUpdateService(
  jobId: string,
  jobData: Partial<JobInsert>
): Promise<JobUpdateOutput>
```

**Usage**: Updates existing job with automatic updated_at.

#### 7. job-delete-service.ts

```typescript
export async function jobDeleteService(jobId: string): Promise<JobDeleteOutput>
```

**Usage**: Soft delete (marks status as "deleted").

#### 8. job-toggle-status-service.ts

```typescript
export async function jobToggleStatusService(
  jobId: string,
  newStatus: JobStatus
): Promise<JobToggleStatusOutput>
```

**Usage**: Changes job status (active, inactive, draft, deleted).

#### 9. job-application-service.ts

```typescript
export async function createJobApplication(data: JobApplicationData): Promise<JobApplicationOutput>
export async function checkExistingApplication(jobId: string, userId: string): Promise<CheckExistingApplicationOutput>
```

**Usage**: Manages job applications (create and check existence).

## Implemented Hooks

### File Structure

```
src/hooks/job/
├── index.ts                    # Organized exports
├── use-job-query.ts           # Job queries
├── use-job-mutation.ts        # CRUD mutations
├── use-job-search.ts          # Job search
├── use-job-application.ts     # Applications
├── use-jobs-by-company.ts     # Jobs by company
├── use-job-by-id.ts          # Legacy (deprecated)
├── use-job-update.ts         # Legacy (deprecated)
└── user-job-insert.ts        # Legacy (deprecated)
```

### Detailed Hooks

#### 1. use-job-query.ts

**Main hooks**:
- `useJobQuery()` - Configurable query for jobs by ID
- `useJobByPublicIdQuery()` - Query for jobs by public_id
- `useJobById()` - Convenience hook for ID search
- `useJobByPublicId()` - Convenience hook for public_id search

```typescript
// Usage example
const { job, isLoading, error, refetch } = useJobById("job-id-123");
```

#### 2. use-job-mutation.ts

**Available operations**:
- `createJob()` - Create new job
- `updateJob()` - Update existing job
- `deleteJob()` - Soft delete job
- `toggleJobStatus()` - Change job status

```typescript
// Usage example
const {
  createJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
  isLoading,
  isCreating,
  isUpdating
} = useJobMutation({
  onSuccess: (data, operation) => {
    console.log(`${operation} successful:`, data);
  },
  showToast: true
});
```

#### 3. use-job-search.ts

**Available hooks**:
- `useJobSearch()` - Simple paginated search
- `useInfiniteJobSearch()` - Infinite search (scroll)
- `useJobSearchQuery()` - Alias for simple search

```typescript
// Simple search
const { jobs, total, hasMore, isLoading } = useJobSearch({
  q: "chef",
  location: "São Paulo",
  pageSize: 20
});

// Infinite search
const {
  jobs,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteJobSearch({
  q: "cozinheiro",
  pageSize: 10
});
```

#### 4. use-job-application.ts

**Available hooks**:
- `useJobApplicationMutation()` - Apply for job
- `useJobApplicationStatus()` - Check application status
- `useJobApplication()` - Combined hook (mutation + status)

```typescript
// Combined hook
const {
  applyToJob,
  hasApplied,
  isApplying,
  isCheckingStatus,
  refetchStatus
} = useJobApplication("job-id", "user-id");

// Apply for job
applyToJob({
  jobId: "job-id",
  userId: "user-id",
  coverLetter: "I'm interested in this position..."
});
```

#### 5. use-jobs-by-company.ts

**Available hooks**:
- `useJobsByCompany()` - Main configurable hook
- `useActiveJobsByCompany()` - Only active jobs
- `useAllJobsByCompany()` - All jobs
- `useJobsByCompanyWithStatus()` - Jobs with specific status

```typescript
// Company active jobs
const { jobs, isLoading, hasJobs } = useActiveJobsByCompany("company-id");

// Jobs with specific status
const { jobs } = useJobsByCompanyWithStatus("company-id", "draft");
```

## Usage Examples

### 1. Fetch Job by ID

```typescript
import { useJobById } from "@/hooks/job";

function JobDetails({ jobId }: { jobId: string }) {
  const { job, isLoading, error } = useJobById(jobId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div>
      <h1>{job.name}</h1>
      <p>{job.description}</p>
    </div>
  );
}
```

### 2. Create Job

```typescript
import { useJobMutation } from "@/hooks/job";

function CreateJobForm() {
  const { createJob, isCreating } = useJobMutation({
    onSuccess: (data) => {
      console.log("Job created:", data.publicId);
      // Redirect or close modal
    }
  });

  const handleSubmit = (formData: JobFormData) => {
    createJob({
      name: formData.name,
      description: formData.description,
      company_id: formData.companyId,
      status: "draft"
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={isCreating}>
        {isCreating ? "Creating..." : "Create Job"}
      </button>
    </form>
  );
}
```

### 3. Search Jobs

```typescript
import { useJobSearch } from "@/hooks/job";

function JobSearchResults() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  const {
    jobs,
    total,
    isLoading,
    isEmpty
  } = useJobSearch({
    q: query,
    location: location,
    pageSize: 20,
    enabled: query.length > 2 // Only search with 3+ characters
  });

  return (
    <div>
      <SearchFilters
        onQueryChange={setQuery}
        onLocationChange={setLocation}
      />

      {isLoading && <div>Searching...</div>}
      {isEmpty && <div>No jobs found</div>}

      <div>
        {jobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      <div>Found {total} jobs</div>
    </div>
  );
}
```

### 4. Apply for Job

```typescript
import { useJobApplication } from "@/hooks/job";

function ApplyButton({ jobId, userId }: { jobId: string; userId: string }) {
  const {
    applyToJob,
    hasApplied,
    isApplying,
    isCheckingStatus
  } = useJobApplication(jobId, userId);

  if (isCheckingStatus) {
    return <button disabled>Checking...</button>;
  }

  if (hasApplied) {
    return <button disabled>Already Applied</button>;
  }

  const handleApply = () => {
    applyToJob({
      jobId,
      userId,
      coverLetter: "I'm interested in this position..."
    });
  };

  return (
    <button onClick={handleApply} disabled={isApplying}>
      {isApplying ? "Applying..." : "Apply Now"}
    </button>
  );
}
```

## Legacy Migration

### Maintained Legacy Hooks

Legacy hooks were maintained for total compatibility:

```typescript
// ✅ Still works
import { useInsertJob, useUpdateJob, useJobById } from "@/hooks/job";

// ✅ Also available explicitly
import {
  useInsertJobLegacy,
  useUpdateJobLegacy,
  useJobByIdLegacy
} from "@/hooks/job";
```

### Recommended Migration

For new development, use modern hooks:

```typescript
// ❌ Legacy (deprecated)
const insertMutation = useInsertJob({
  onSuccess: ({ jobId }) => console.log(jobId)
});

// ✅ Modern (recommended)
const { createJob } = useJobMutation({
  onSuccess: (data) => console.log(data.publicId)
});
```

### Query Keys

Legacy hooks use different query keys to avoid conflicts:

```typescript
// Legacy: ["job", "legacy", jobId]
// Modern: ["job", jobId]
```

## Troubleshooting

### Common Issues

#### 1. "Hook not found"

```typescript
// ❌ Error
import { useJobByIdQuery } from "@/hooks/job";

// ✅ Correct - use the alias
import { useJobByIdQuery } from "@/hooks/job"; // Exported as useJobByIdQuery
// OR use the convenience hook
import { useJobById } from "@/hooks/job";
```

#### 2. "Incompatible types"

```typescript
// ❌ Old service returns Job directly
const job = await getJobById(id); // Job | throws

// ✅ New service returns structured object
const { job, error } = await getJobById(id); // GetJobByIdOutput
```

#### 3. "Query doesn't invalidate"

```typescript
// ❌ Incorrect query key
queryClient.invalidateQueries({ queryKey: ["jobs"] });

// ✅ Specific query key
queryClient.invalidateQueries({ queryKey: ["job", jobId] });
queryClient.invalidateQueries({ queryKey: ["jobs", "company", companyId] });
```

#### 4. "Toast doesn't appear"

```typescript
// ✅ Make sure showToast is enabled
const mutation = useJobMutation({
  showToast: true, // Default is true
  showDetailedErrors: false // For cleaner errors
});
```

### Debugging

#### 1. Check Query State

```typescript
const query = useJobById(jobId);

console.log({
  isLoading: query.isLoading,
  isError: query.isError,
  error: query.error,
  data: query.job,
  failureCount: query.failureCount
});
```

#### 2. Check Service Response

```typescript
const { job, error } = await getJobById(jobId);

console.log({
  job,
  error,
  hasJob: !!job,
  errorType: typeof error
});
```

#### 3. Check Query Invalidation

```typescript
// In React Query DevTools
// Check if queries are being invalidated correctly
// Query Key: ["job", jobId] should appear as "stale" after mutation
```

---

**Last updated**: January 2025
**Version**: 1.0
**Status**: ✅ Implemented and tested
