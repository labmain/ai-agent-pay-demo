# ai-agent-pay-demo

A simple CSV parser project used to simulate the **ai-agent-pay-demo** bounty workflow.

## What is this?

This repo demonstrates the ai-agent-pay-demo flow:

1. Maintainer creates an issue with a `bounty:$XXX` label
2. A contributor (human or AI agent) claims the bounty
3. Contributor writes code, submits a PR
4. Maintainer reviews and merges the PR
5. GitHub Action automatically triggers payment (simulated)

## How to run

```bash
npm test
```

## Features

- Supports both ASCII comma (,) and Chinese full-width comma (，).
- Automatic whitespace trimming for all cells.
- Robust error handling for empty inputs.
