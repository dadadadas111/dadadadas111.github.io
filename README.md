# TASK: Build a New Partner Dashboard (Next.js) from Scratch

  ## Purpose

  You are building a brand-new partner dashboard web app in an empty folder.
  The primary goal is to VERIFY that the existing partner REST APIs work correctly
  end-to-end, so that IoT partners can rely on them to build their own dashboards.
  This is NOT a production app — it is a functional reference implementation.

  ---

  ## Tech Stack

  - **Framework**: Next.js 14+ (App Router)
  - **Language**: TypeScript (strict mode)
  - **Styling**: Tailwind CSS
  - **HTTP client**: axios or native fetch with a typed API layer
  - **Auth token storage**: httpOnly cookie (or localStorage as fallback for simplicity)
  - **State**: React Context or Zustand (minimal)
  - **Form**: react-hook-form + zod for validation
  - **UI primitives**: shadcn/ui (recommended) or similar Tailwind-based components

  Initialize with: `npx create-next-app@latest . --typescript --tailwind --app --eslint`

  ---

  ## API Base URL

  **Staging**: `https://staging.openapi.rogo.com.vn/api/v2.0`

  All partner APIs are documented at:
  `https://staging.openapi.rogo.com.vn/openapi/partner#`

  Read that Swagger page to understand exact request/response shapes before implementing
  Or read JSON version of Swagger at 
    `https://staging.openapi.rogo.com.vn/openapi/partner-json` and refer to the schemas.
  each feature. All authenticated endpoints require:
  Authorization: Bearer

  ---

  ## Authentication Flow

  ### Login
  `POST /partner/auth/login`
  Body: `{ email: string, password: string }`
  Response:
  ```json
  {
    "access_token": "...",
    "refresh_token": "...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "id_token": "..."
  }

  - Store access_token and refresh_token in cookies or localStorage.
  - access_token is a Firebase JWT. Decode it (base64 split) to get:
    - uid → the logged-in user's userId
    - email
  - The partnerId is NOT in the token — it must be fetched separately after login
  via GET /partner/user/resources (returns the user's linked partnerResources).
  Store partnerId in app state/context.

  Token Refresh

  POST /partner/auth/refresh
  Body: { refresh_token: string }
  Auto-refresh when receiving 401.

  Logout

  Clear stored tokens, redirect to /login.

  ---
  Permission System (ABAC V2)

  After login, fetch the current user's permissions:
  GET /partner/user/resources
  Response includes partnerResources (array of partner-level resource strings)
  and projectResources (array of ABAC entries per project).

  Each ABAC entry has a resources array of strings like:
  - "organization:view", "organization:edit"
  - "projectMgmt:view", "projectMgmt:edit"
  - "projectAuth:view", "projectAuth:edit"
  - "productDev:view", "productDev:edit"
  - "authorization:view", "authorization:edit"

  Rule: Show a tab or action button ONLY if the user has the required permission.
  Implement a usePermission(action: string): boolean hook backed by the fetched
  ABAC data. Wrap sensitive UI in <PermissionGate action="..."> component.

  ---
  App Structure

  app/
    (auth)/
      login/page.tsx          # Login form
    (dashboard)/
      layout.tsx              # Sidebar + top nav + auth guard
      page.tsx                # Redirect to /organizations or first accessible tab
      organizations/
        page.tsx              # List orgs
        [orgId]/page.tsx      # Org detail + member management
      projects/
        page.tsx              # List projects (optionally filtered by org)
        [projectId]/page.tsx  # Project detail + services + key management
      products/
        page.tsx              # Paginated product list
        [productId]/page.tsx  # Product detail + device list
      users/
        page.tsx              # Users in partner + their permission overview
      permissions/
        page.tsx              # ABAC V2 grant/revoke UI
  lib/
    api/
      client.ts               # Axios instance with auth header + refresh interceptor
      auth.ts                 # login, refresh
      organization.ts         # all org API calls
      project.ts              # all project API calls
      product.ts              # all product API calls
      user.ts                 # all user API calls
      permission.ts           # grant, revoke, get
    hooks/
      usePermission.ts
      usePartnerContext.ts     # provides partnerId, userId, email
    components/
      PermissionGate.tsx
      Sidebar.tsx
      DataTable.tsx            # reusable paginated table

  ---
  Features to Implement

  1. Login Page (/login)

  - Email + password form
  - Calls POST /partner/auth/login
  - On success: stores tokens, fetches user resources + partnerId, redirects to dashboard
  - Show error message on failure

  2. Layout & Sidebar

  Sidebar tabs (show/hide based on permissions):

  ┌───────────────┬─────────────────────┐
  │      Tab      │ Required permission │
  ├───────────────┼─────────────────────┤
  │ Organizations │ organization:view   │
  ├───────────────┼─────────────────────┤
  │ Projects      │ projectMgmt:view    │
  ├───────────────┼─────────────────────┤
  │ Products      │ productDev:view     │
  ├───────────────┼─────────────────────┤
  │ Users         │ authorization:view  │
  ├───────────────┼─────────────────────┤
  │ Permissions   │ authorization:view  │
  └───────────────┴─────────────────────┘

  ---
  3. Organizations Tab

  List (GET /partner/organization/list/:partnerId)
  - Show: name, orgId, status, owner (from owner.email or ownerId), created date
  - Requires organization:view

  Create (POST /partner/organization/create)
  - Form: name (required), description (optional)
  - Body must include partnerId
  - Requires organization:edit

  Edit (PATCH /partner/organization/update)
  - Inline edit or modal
  - Requires organization:edit

  Delete (DELETE /partner/organization/delete)
  - Confirm dialog before delete
  - Body: { partnerId, orgId }
  - Requires organization:edit

  Org Detail page (GET /partner/organization/:partnerId/:orgId)
  - Show org info
  - Show member list (GET /partner/organization/:partnerId/:orgId/users)
    - Each member: userId, joinedAt, isOwner
  - Add member (POST /partner/organization/user/add)
    - First check if user exists: POST /partner/user/check-exist
    - Body: { partnerId, orgId, userId, isOwner? }
  - Remove member (POST /partner/organization/user/remove)
    - Body: { partnerId, orgId, userId }
  - Transfer ownership (PATCH /partner/organization/transfer-owner)

  ---
  4. Projects Tab

  List (GET /partner/project/list/:partnerId?orgId=...)
  - Show all projects for the partner
  - Filter dropdown by Organization (optional)
  - Show: name, projectId, orgId, status, services count
  - Requires projectMgmt:view

  Create (POST /partner/project/create)
  - Form: name, orgId (select from org list), partnerId, description
  - Requires projectMgmt:edit

  Project Detail page (GET /partner/project/get/:partnerId/:projectId)
  - Response includes: project (full model), keyInfos (API key data), numOfIps
  - Show project info
  - Show active authorizedServices list
    - Each service has a uuid — allow deactivating via PATCH /partner/project/edit/:partnerId/:projectId
  with body { uuid } (removes the service from the project)
    - Requires projectMgmt:edit

  Edit project (POST /partner/project/edit/:partnerId/:projectId)
  - Editable fields: name, description
  - Requires projectMgmt:edit

  Generate Key (POST /partner/project/generate-key)
  - One-time action, show warning
  - Body: CreateProjectDto (same shape as create: { partnerId, projectId, ... })
  - Response is a Firebase service account JSON object — display in a readonly code block
  and offer a "Download JSON" button
  - Requires projectMgmt:edit

  Delete (POST /partner/project/delete)
  - Confirm dialog
  - Body: { partnerId, projectId }
  - Requires projectMgmt:edit

  ---
  5. Products Tab

  List (GET /partner/product/list/:partnerId?page=1&size=20)
  - Paginated table: modelId, name, category, releaseStatus, isPublic, isReadyOEM
  - Requires productDev:view

  Create (POST /partner/product-admin/create)
  - Form using CreateModelDto shape (read Swagger for full field list)
  - Key fields: modelId, name, partnerId, categoryInfo, description, isPublic
  - Requires productDev:edit

  Product Detail (GET /partner/product/:partnerId/:productId)
  - Show all fields
  - Edit button → POST /partner/product/edit
  - Requires productDev:view

  Release/Unrelease (POST /partner/product-admin/release/:partnerId)
  - Body: { modelId, releaseStatus: 'release' | 'unrelease' | ... }
  - Read Swagger for valid releaseStatus values
  - Requires productDev:edit

  Delete (POST /partner/product-admin/delete)
  - Body: { partnerId, modelId }
  - Requires productDev:edit

  Device List (GET /partner/product-admin/modeldevices/:partnerId/:productId?page=1&size=20)
  - Paginated list of devices registered to this product
  - Show from the product detail page as a sub-tab
  - Requires productDev:view

  ---
  6. Users Tab

  List all users in partner (GET /partner/user/list/:partnerId)
  - Response: [{ user: UserPartner, numOfProject: number }]
  - Show: email, userId, number of projects
  - Requires authorization:view

  User permissions → click a user → show their ABAC entries
  - GET /partner/permission/:partnerId/:ownerId
  - Requires authorization:view

  Add user to project (POST /partner/user/add)
  - Form: select project, enter user email
  - Requires projectAuth:edit

  Remove user (POST /partner/user/delete)
  - Body: UpdateUserpartnerDto (read Swagger)
  - Requires authorization:edit

  ---
  7. Permissions Tab

  List all permission records (GET /partner/permission/:partnerId)
  - Table of users and their ABAC entries
  - Requires authorization:view

  Grant permissions (POST /partner/permission/grant)
  - Body: GrantPermissionDto — { ownerId, partnerId, abac: [...] }
  - Read Swagger for ABAC entry shape
  - Requires authorization:edit

  Revoke permissions (POST /partner/permission/revoke)
  - Body: RevokePermissionDto
  - Requires authorization:edit

  ---
  What NOT to Build (APIs not yet migrated)

  Do NOT build UI for these features — their backend APIs are not yet on the new
  partner endpoint system:
  - API Key management (create/list/rotate project API keys)
  - Reports / analytics
  - AppSDK configuration
  - Hardware/flasher batch management (beyond the basic product list)
  - Project-level user permission listing (the GET /partner/user/permissions/... endpoint
  exists but the UI around it can be skipped for now)

  ---
  Reference Codebase

  The old dashboard is at D:/Repos/iot.rogo.com.vn on the developer machine.
  You can read it to understand previous UI patterns, API call structures, and
  feature expectations — but do NOT copy its code directly. The new dashboard
  should be a clean rewrite using the new partner API endpoints only.

  Focus on these areas of the old codebase if reading:
  - src/pages/ — to understand which tabs/features existed
  - src/api/backend.ts — to map old API calls to new equivalents
  - src/context/ or src/store/ — to understand what state was managed globally

  ---
  Error Handling

  - All API errors should display a toast notification (or alert) with the error message
  - 401 → auto-refresh token, retry once, then redirect to /login
  - 403 → show "You don't have permission for this action"
  - 400/500 → show the error message from the response body

  ---
  Key Implementation Notes

  1. partnerId is per-user: After login, call GET /partner/user/resources to get
  the user's partnerResources array. The partnerId for that user is embedded in the
  ABAC resource strings as the suffix after the colon (e.g., "authorization:partner123"
  means partnerId = "partner123"). Or store it explicitly at login time — check the
  actual response shape from the Swagger docs.
  2. ABAC permission check flow:
    - Login → fetch GET /partner/user/resources
    - Response has projectResources array of ABAC entries
    - Each entry has resources: string[] — these are the actions the user can take
    - Cache this in React context, expose via usePermission(action) hook
  3. Organization → Project relationship:
    - An Organization groups Projects inside a Partner
    - When listing projects, pass ?orgId=... to filter by org
    - When creating a project, orgId is required (select from org list)
  4. Firebase token decode (no library needed):
  function decodeJwt(token: string) {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  }
  // Returns { uid, email, exp, ... }
  5. API versioning: All partner APIs are at /api/v2.0/partner/...

  ---
  Acceptance Criteria

  The dashboard is considered complete when:
  - Login and logout work with real credentials
  - Permission-based tab visibility works (hiding tabs the user lacks access to)
  - Organizations: list, create, edit, delete, member management all work
  - Projects: list, create, detail, edit, delete, generate-key all work
  - Products: list (paginated), create, edit, release/delete, device list all work
  - Users: list by partner, view permissions all work
  - Grant/revoke permissions via the UI works
  - Token auto-refresh on 401 works
  - All API calls point to the staging URL and succeed with real data

  ---