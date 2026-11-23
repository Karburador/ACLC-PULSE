# ACLC-Pulse Hardened Firestore Security Specification

## 1. Data Invariants
1. **Verified Identity & Custodian Allowlist Gate**:
   - Every read/write on operational collections (`laboratories`, `assets`, `loans`, `maintenance`, `system_meta`, `audit_logs`) requires `request.auth != null && request.auth.token.email_verified == true` AND either the Bootstrapped Head Admin (`barracudaskynet@gmail.com`) or an active entry (`active == true`) in `/authorized_custodians/{email}`.
2. **Tiered RBAC & Admin-Only Destructive Lock**:
   - Only `Admin` users (Bootstrapped Head Admin or active custodian with `role == 'Admin'`) can manage `/authorized_custodians`, delete any record across `laboratories`, `assets`, `loans`, `maintenance`, `system_meta`, or execute system wipe/restore operations (`Reset to 0` / `Restore Default`).
   - Regular `Custodian` accounts can create/edit operational records, issue/return loans, and move maintenance tickets, without destructive deletion privileges.
3. **Atomic Loan Stock Balance & Terminal State Lock**:
   - Creating a `LoanRecord` atomically checks `get(/assets/{assetId}).data.availableQuantity >= incoming().quantity` and guarantees `getAfter(/assets/{assetId}).data.availableQuantity == get(...).data.availableQuantity - incoming().quantity`.
   - Returning a `LoanRecord` locks it into terminal `'Returned'` state for non-admin accounts and validates stock restoration bounds (`availableQuantity <= quantity`).
4. **Immutable Append-Only Audit Trail & Actor Provenance**:
   - Every `/audit_logs/{logId}` entry enforces `actorUid == request.auth.uid`, `actorEmail == request.auth.token.email.lower()`, server `createdAt == request.time`, and `allow update, delete: if false;`.
   - Operational creates/updates stamp immutable `ownerId` and `createdByEmail` plus verified `lastUpdatedByEmail`.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated read/list** on `/assets` or `/loans` without `request.auth`.
2. **Unlisted verified Gmail** attempting `list` or `create` on `/assets` when not in `/authorized_custodians`.
3. **Suspended custodian (`active: false`)** attempting to issue a loan or read `/loans` PII.
4. **Non-admin Custodian** attempting `delete` on `/assets/{id}`, `/laboratories/{code}`, or `/system_meta/catalog`.
5. **Non-admin Custodian** attempting `create` or `update` on `/authorized_custodians/{email}`.
6. **Admin demotion/removal attack** attempting to delete or deactivate `barracudaskynet@gmail.com`.
7. **Loan over-issuance / stock bypass** creating a `LoanRecord` without atomically decrementing `/assets/{assetId}.availableQuantity`.
8. **Audit log tampering** attempting `update` or `delete` on `/audit_logs/{logId}`, or spoofing `actorEmail`.
9. **Shadow field injection** adding `isAdmin: true` to an `Asset` or `Custodian` payload (`hasOnly` rejects).
10. **Owner/creator spoofing** mutating `ownerId`, `createdByEmail`, or `createdAt` during an update.
11. **Terminal state bypass** modifying a `LoanRecord` whose `existing().status == 'Returned'` as a non-admin custodian.
12. **Client-spoofed timestamp** setting `createdAt` or `updatedAt` to a value other than `request.time`.
