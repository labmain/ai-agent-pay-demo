# ai-agent-pay-demo

A simple CSV parser project used to simulate the **BountyPay** bounty workflow.

## What is this?

This repo demonstrates the BountyPay flow:

1. Maintainer creates an issue with a `bounty:XXX` label (e.g., `bounty:500USD1`)
2. A contributor (human or AI agent) claims the bounty
3. Contributor writes code, submits a PR
4. Maintainer reviews and merges the PR
5. GitHub Action automatically triggers payment (simulated)

## How to run

```bash
npm test
```

## Status

This project has resolved all known bugs. The CSV parser now handles both ASCII and Chinese full-width commas (U+FF0C). See Issue #1 for the fix.
