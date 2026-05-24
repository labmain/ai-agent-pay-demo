# Manual Test: BountyPay Verification Flow

## Objective
Run a full manual verification of the BountyPay flow to confirm expected behavior across happy path and common failure paths.

## Scope
- Verify BountyPay initiation and confirmation flow.
- Verify post-payment state updates in UI and backend.
- Verify error handling for invalid or interrupted payment attempts.

## Preconditions
- Test environment is deployed and reachable.
- Test wallet/account has sufficient balance (or test-mode equivalent).
- Logging is enabled for request/response tracing.

## Manual Test Cases
1. **Happy Path**
   - Start a BountyPay payment from the app.
   - Complete verification/approval successfully.
   - Confirm transaction status changes to success.
   - Confirm user sees success state and relevant receipt/reference.

2. **User Cancellation**
   - Start payment and cancel at verification step.
   - Confirm app shows cancellation status.
   - Confirm no payout/charge is finalized.

3. **Insufficient Balance / Decline**
   - Attempt payment with insufficient balance (or forced decline in test mode).
   - Confirm failure is surfaced clearly to user.
   - Confirm no inconsistent state is stored.

4. **Network Interruption During Verification**
   - Interrupt network during verification callback/finalization.
   - Confirm retry/recovery behavior is deterministic.
   - Confirm eventual status is accurate after reconnect.

5. **Duplicate Submission Guard**
   - Trigger repeated submit/click actions during payment verification.
   - Confirm only one transaction is processed.

## Evidence to Attach
- Screenshots of each step (start, verification, final state).
- Transaction IDs / correlation IDs.
- Relevant logs for success and failure scenarios.

## Acceptance Criteria
- All listed scenarios are executed.
- Happy path completes with correct state and persisted records.
- Failure/cancellation states are handled without data corruption.
- Duplicate submissions do not create duplicate transactions.
- Findings are documented with reproduction notes where applicable.

## Deliverable
Post test summary with:
- pass/fail per scenario,
- defects found,
- severity and reproduction steps.