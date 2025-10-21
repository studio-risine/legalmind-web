# Context

Summary of the repository context and current understanding:

The LegalTrack system is a multi-tenant legal deadline management application built with Next.js, Supabase, and Drizzle ORM. It manages clients, processes, deadlines, and notifications with role-based access control (RBAC). 

**Current State Analysis:**
- **Existing API Documentation**: Process module has partial API specs (CRUD operations, endpoints) in `docs/PROCESS_MODULE_PRD.md` but lacks comprehensive coverage
- **RBAC Architecture**: Well-documented in `docs/RBAC_ARCHITECTURE.md` with detailed roles (SUPER_ADMIN, ADMIN, LAWYER), middleware patterns, and data isolation
- **Implementation Status**: Client module is fully implemented with server actions, hooks, and RBAC. Deadline and process modules are partially implemented
- **Documentation Gaps**: Missing unified API specification, incomplete RBAC-API integration docs, no contracts or SLA documentation

**Current Technology Stack:**
- Frontend: Next.js App Router, shadcn/ui, TypeScript
- Backend: Supabase (Postgres), Drizzle ORM, Server Actions
- Authentication: Supabase Auth with custom RBAC
- Architecture: Multi-tenant with account-based data isolation

## Problem

Clear problem/need description:

The Linear task "Docs & contracts: finalize API and RBAC appendix" requires completing and consolidating the API documentation and RBAC integration specifications. Currently, the system has:

1. **Fragmented API Documentation**: API endpoints are documented partially in module PRDs but lack comprehensive, unified documentation
2. **Missing RBAC-API Integration**: While RBAC architecture is well-documented, the integration between RBAC and API endpoints lacks detailed specification
3. **Incomplete Contracts Documentation**: No formal API contracts, SLAs, or integration patterns documented
4. **Inconsistent Documentation Format**: Different modules have varying documentation styles and completeness levels

This creates challenges for:
- Developers implementing new features
- Frontend developers integrating with backend APIs
- Stakeholders understanding system capabilities
- Future maintenance and scaling

## Alternatives

### Alternative 1: Update Existing Documentation In-Place
Pros:
- Faster implementation by building on existing structure
- Maintains current organization and familiar locations
- Preserves existing valid content

Cons:
- Continues fragmented documentation approach
- May perpetuate inconsistencies between modules
- Harder to maintain unified standards

### Alternative 2: Create Centralized API Documentation Hub
Pros:
- Single source of truth for all API documentation
- Consistent format and structure across all modules
- Better organization for developers and stakeholders
- Easier to maintain and version control
- Enables better tooling integration (OpenAPI, etc.)

Cons:
- Requires more upfront work to consolidate existing docs
- May need to update references in other documentation
- Higher complexity in initial setup

✅ Chosen approach

**Justification:** 
Alternative 2 provides better long-term maintainability and developer experience. Given the system's multi-tenant SaaS nature and the need for comprehensive API documentation, a centralized approach will scale better as the system grows. The upfront investment will pay dividends in reduced maintenance overhead and improved developer onboarding.

## Tasks

- [ ] **Create unified API specification document**
  - Description: Consolidate all existing API documentation into a comprehensive, standardized specification including all modules (clients, processes, deadlines, notifications, accounts)
  - Objective: Provide a single source of truth for all API endpoints with consistent formatting, authentication patterns, and error handling
  - Acceptance Criteria: 
    - All CRUD operations documented for each entity
    - Consistent request/response schemas
    - Authentication and authorization requirements specified
    - Error codes and responses documented
    - Examples provided for each endpoint
  - Dependencies: None
  - Verification Steps: Review covers all modules mentioned in database schema, matches existing server action implementations

- [ ] **Document RBAC integration patterns**
  - Description: Create comprehensive documentation showing how RBAC integrates with each API endpoint, including permission matrices and access control flows
  - Objective: Clarify exactly which roles can access which endpoints and under what conditions
  - Acceptance Criteria:
    - Permission matrix for all endpoints vs roles
    - Account-scoped data access patterns documented
    - Middleware usage examples for each pattern
    - Edge cases and error scenarios covered
  - Dependencies: Unified API specification document
  - Verification Steps: Cross-reference with existing RBAC_ARCHITECTURE.md, validate against current middleware implementations

- [ ] **Create API contracts and integration guide**
  - Description: Document formal API contracts including service level agreements, rate limiting, versioning strategy, and integration patterns for external systems
  - Objective: Provide clear expectations and guidelines for API consumers and integrators
  - Acceptance Criteria:
    - SLA definitions (response times, availability)
    - Rate limiting policies documented
    - API versioning strategy defined
    - Integration patterns for common use cases
    - External API dependencies documented (DataJud, Google Calendar)
  - Dependencies: Unified API specification, RBAC integration patterns
  - Verification Steps: Review against current infrastructure setup, validate rate limiting matches current implementation

- [ ] **Create RBAC appendix with practical examples**
  - Description: Develop a practical appendix showing real-world RBAC scenarios with code examples, troubleshooting guides, and best practices
  - Objective: Bridge the gap between theoretical RBAC documentation and practical implementation
  - Acceptance Criteria:
    - Code examples for common RBAC patterns
    - Troubleshooting guide for permission issues
    - Migration guide for adding new roles/permissions
    - Testing patterns for RBAC scenarios
    - Performance considerations documented
  - Dependencies: RBAC integration patterns
  - Verification Steps: Test examples work with current codebase, validate against existing middleware implementations

- [ ] **Update navigation and cross-references**
  - Description: Update docs/README.md and other navigation to reference the new centralized documentation and ensure all cross-references are correct
  - Objective: Ensure discoverability and maintain documentation coherence
  - Acceptance Criteria:
    - docs/README.md updated with new documentation structure
    - Cross-references updated in existing files
    - Deprecation notices added where appropriate
    - Navigation flows logically from overview to detailed specs
  - Dependencies: All previous documentation tasks
  - Verification Steps: Manual review of all documentation links, validate navigation makes sense for new developers

## Risks & Mitigations

**Risk: Documentation becomes outdated as system evolves**
- Mitigation: Include documentation updates in PR review checklist, automate validation where possible

**Risk: Over-documentation may slow development**
- Mitigation: Focus on essential information and maintain clear separation between reference documentation and implementation guides

**Risk: Inconsistency with current implementations**
- Mitigation: Cross-reference all documentation with existing server actions and middleware implementations during creation

**Risk: Breaking changes to existing API consumers**
- Mitigation: Document current API as-is first, then propose changes separately with migration guides

## Saving

- Save this plan at: docs/plans/finalize-api-rbac-documentation.md