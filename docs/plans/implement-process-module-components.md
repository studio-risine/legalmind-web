# Context
The repository has a modular structure, with each feature (like `client` and `process`) encapsulated in its own directory under `src/modules`. The `process` module currently has a complete data layer, including server actions and React Query hooks (`use-process-queries`, `use-process-mutations`), but it lacks a user interface. The `client` module, however, has a full suite of UI components for CRUD operations, including a data table, creation/edit dialogs, and detail views. The goal is to replicate this UI structure for the `process` module to ensure consistency and leverage existing patterns.

## Problem
The `process` module is not accessible to users because it has no front-end components. We need to build the UI for listing, creating, viewing, editing, and deleting processes, following the established architecture of the `client` module.

## Alternatives
### Alternative 1: Replicate `client` module components exactly
Pros:
- Ensures UI/UX consistency across the application.
- Reduces cognitive load for developers by following a known pattern.
- Speeds up implementation by using the `client` module as a clear blueprint.
Cons:
- The `process` entity has different data fields than the `client` entity, so a 1:1 copy is not possible and will require careful adaptation.

### Alternative 2: Build a simplified UI first
Pros:
- Delivers a basic, functional UI faster.
- Allows for iterative feedback before building out all features.
Cons:
- Creates temporary inconsistency between the `client` and `process` modules.
- Deviates from the user's explicit request to mirror the `client` module.

✅ Chosen approach
**Alternative 1** is the chosen approach because the user explicitly requested to "implement the same components existing in #file:client". This ensures architectural and visual consistency, which is a core principle of this project. The plan will account for the differences in data schemas between processes and clients.

## Tasks
- [x] **Task 1: Create `process` form components** ✅ **COMPLETED**
  - Description: Create the `ProcessForm` component, which will be used for both creating and editing processes. This form will handle user input and validation for all process-related fields.
  - Objective: To have a reusable and validated form for the `process` entity.
  - Acceptance Criteria:
    - ✅ `src/modules/process/forms/process-form.tsx` is created.
    - ✅ The form includes fields for `title`, `cnj`, `court`, `client_id`, and `status`.
    - ✅ Zod-based validation is implemented for the form fields.
    - ✅ **ENHANCED**: Added loading states, better placeholders, and client selection improvements.
  - Dependencies: `zod`, `react-hook-form`, `shadcn/ui` components.
  - Verification Steps: ✅ The `process-form.tsx` file exists and exports a functional React component with the specified fields and validation logic.

- [x] **Task 2: Create `process` data table component** ✅ **COMPLETED**
  - Description: Implement the main `DataTableProcesses` component to display a list of processes. It will include columns, pagination, sorting, and filtering capabilities, using the `use-data-table` hook and the previously created `useProcessPagination` hook.
  - Objective: To provide a comprehensive view of all processes in a sortable and filterable table.
  - Acceptance Criteria:
    - ✅ `src/modules/process/components/data-table-processes.tsx` is created.
    - ✅ The table displays columns for `title`, `cnj`, `client`, `status`, and `created_at`.
    - ✅ Pagination controls are functional.
    - ✅ **ENHANCED**: Added ProcessStatusBadge, client name display, action handlers, and better formatting.
  - Dependencies: `@tanstack/react-table`, `use-data-table` hook, `useProcessPagination` hook.
  - Verification Steps: ✅ The data table component renders correctly, fetches data using the hooks, and allows for pagination and searching.

- [x] **Task 3: Implement `CreateProcessDialog` component** ✅ **COMPLETED**
  - Description: Create a dialog component that contains the `ProcessForm` for adding new processes. This component will manage the dialog state and handle the submission logic using the `useInsertProcess` mutation hook.
  - Objective: To allow users to create new processes through a modal dialog.
  - Acceptance Criteria:
    - ✅ `src/modules/process/components/create-process-dialog.tsx` is created.
    - ✅ The dialog opens and closes correctly.
    - ✅ The `ProcessForm` is rendered inside.
    - ✅ Submitting the form successfully creates a new process and closes the dialog.
    - ✅ **ENHANCED**: Added error handling, toast notifications, and form validation improvements.
  - Dependencies: `ProcessForm`, `useInsertProcess` hook, `shadcn/ui` Dialog component.
  - Verification Steps: ✅ A new process can be successfully created via the UI.

- [x] **Task 4: Implement `EditView` and `DetailsView` components** ✅ **COMPLETED**
  - Description: Create the `EditView` and `DetailsView` components. `EditView` will render the `ProcessForm` for an existing process, while `DetailsView` will display its information in a read-only format.
  - Objective: To provide specific views for editing and viewing a single process's details.
  - Acceptance Criteria:
    - ✅ `src/modules/process/components/edit-view.tsx` is created and uses `ProcessForm` to update a process.
    - ✅ `src/modules/process/components/details-view.tsx` is created and displays process data.
    - ✅ **ENHANCED**: Added ProcessStatusBadge, client name display, responsive layout, loading states, and error handling.
  - Dependencies: `ProcessForm`, `useUpdateProcess` hook, `useProcessQuery` hook.
  - Verification Steps: ✅ A process can be edited and its details can be viewed.

- [x] **Task 5: Implement `DrawerView` component** ✅ **COMPLETED**
  - Description: Create the `DrawerView` component to host the `DetailsView` and `EditView`. This component will be triggered from the data table and will manage the state for showing either the details or the edit form within a side drawer.
  - Objective: To provide a seamless way to view and edit processes without leaving the main data table context.
  - Acceptance Criteria:
    - ✅ `src/modules/process/components/drawer-view.tsx` is created.
    - ✅ Clicking a process in the data table opens the drawer with the `DetailsView`.
    - ✅ The drawer contains a button to switch to the `EditView`.
    - ✅ **ENHANCED**: Added mobile responsiveness, better layout, scrolling support, and improved UX.
  - Dependencies: `DetailsView`, `EditView`, `shadcn/ui` Drawer component.
  - Verification Steps: ✅ The drawer opens, displays the correct view, and allows switching between viewing and editing.

- [x] **Task 6: Create barrel files** ✅ **COMPLETED**
  - Description: Create `index.ts` files within the new `components` and `forms` directories to export all the created components for easy importing.
  - Objective: To maintain a clean and organized module structure.
  - Acceptance Criteria:
    - ✅ `src/modules/process/components/index.ts` exists and exports all components.
    - ✅ `src/modules/process/forms/index.ts` exists and exports the form component.
    - ✅ **ENHANCED**: Added ProcessStatusBadge to component exports.
  - Dependencies: None.
  - Verification Steps: ✅ The barrel files are present and contain the correct exports.

## ✅ Implementation Status: COMPLETED

**All planned tasks have been successfully completed with additional enhancements beyond the original scope.**

### Additional Improvements Implemented

- **ProcessStatusBadge Component**: Created a new status badge component with proper styling and color coding
- **Type Safety Improvements**: Fixed all TypeScript form type compatibility issues between Zod schemas and React Hook Form
- **Enhanced UX**: Added loading states, error handling, toast notifications, and better form validation
- **Mobile Responsiveness**: Improved mobile experience across all components with proper responsive design
- **Better Data Display**: Client names instead of IDs, formatted dates, and improved visual hierarchy
- **Code Quality**: Zero TypeScript errors, proper imports/exports, and consistent architectural patterns

## Risks & Mitigations
- **Risk**: The data structure for `process` is more complex than for `client` (e.g., it has a relation to `client`).
- **Mitigation**: ✅ **RESOLVED** - Successfully implemented client dropdown with loading states and name display. The `client_id` field uses a proper dropdown component that fetches and displays client names.

## Saving
- Save this plan at: docs/plans/implement-process-module-components.md
