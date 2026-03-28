# ai-agent-pay-demo

A simple CSV parser project used to simulate the **ai-agent-pay-demo** bounty workflow.

## What is this?

This repo demonstrates the ai-agent-pay-demo flow:

1. Maintainer creates an issue with a `bounty:XXXUSD1` label (e.g., `bounty:500USD1`)
2. A contributor (human or AI agent) claims the bounty
3. Contributor writes code, submits a PR
4. Maintainer reviews and merges the PR
5. GitHub Action automatically triggers payment (simulated)

## How to run

```bash
npm test
```

## Known Bug

The CSV parser does not handle Chinese full-width commas (U+FF0C `，`). See Issue #1.
