# ACLC-Pulse Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Verified Identity Gate**: Every read/write on operational collections (`laboratories`, `assets`, `loans`, `maintenance`, `system_meta`) requires `request.auth != null && request.auth.token.email_verified == true`.
2. **Ownership & Campus Admin Access**:
   - The bootstrapped campus administrator (`barracudaskynet@gmail.com` with `email_verified == true`) can read/write/delete all shared campus records across browsers and devices.
   - Any other authenticated user can only list/get/write records where `ownerId == request.auth.uid`.
   - `allow list` never uses `get()` or `exists()` and strictly evaluates `isBootstrappedAdmin() || resource.data.ownerId == request.auth.uid`.
3. **Referential & Laboratory Deletion Integrity**:
   - Creating a `LoanRecord` requires `assetId` to reference an existing `/assets/{assetId}` document (`exists(...)`), and updating/deleting resources validates document IDs via `isValidId()`.
   - Updating a `LoanRecord` into terminal `'Returned'` state locks it against subsequent mutations (`existing().status != 'Returned'`).
4. **Strict Schema & Immutability**:
   - Every `create` and `update` invokes its `isValid[Entity](incoming())` helper enforcing exact required/allowed keys (`hasAll` + `hasOnly`), string `.size()` bounds, enum constraints, positive/non-negative numeric ranges, immutable `ownerId` and `createdAt`, and server timestamp integrity (`request.time`).

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated read/list** on `/assets` without `request.auth`.
2. **Unverified email write** (`email_verified: false`) attempting `create` on `/assets`.
3. **Shadow field injection** adding `isAdmin: true` to an `Asset` payload (`hasOnly` rejects).
4. **Oversized ID poisoning** using a 500-character document ID (`isValidId` rejects).
5. **Owner spoofing** creating an `Asset` with `ownerId: "victim-uid"` != `request.auth.uid`.
6. **Client-spoofed timestamp** setting `createdAt` to a past date instead of `request.time`.
7. **Mutating immutable `createdAt`** during an `Asset` update.
8. **Mutating `ownerId`** during a `Laboratory` update.
9. **Orphaned Loan creation** referencing a nonexistent `assetId` (`exists` check rejects).
10. **Terminal state bypass** modifying a `LoanRecord` whose `existing().status == 'Returned'`.
11. **Invalid enum poisoning** setting `Asset.status = "Stolen"` or `Asset.category = "Weapons"`.
12. **PII / cross-user `list` scraping** querying `/loans` by a non-admin without `where('ownerId', '==', uid)`.
