# AGENTS.md

## Project Context

This is a Next.js + React + Tailwind personal portfolio / resume website.

The current branch is `feat/fullscreen-redesign`, used for a fullscreen redesign experiment.

The existing Hero / first screen is considered stable and should not be changed unless the user explicitly asks.

The second and third sections may be redesigned only when the task clearly says so.

The global page background must remain `#F5F7FA`.

## Core Working Rules

- Think before coding: before making changes, explain the intended change, risks, and minimal implementation path.
- Simplicity first: prefer direct, maintainable solutions over unnecessary abstraction.
- Surgical changes: only edit files required by the current task.
- Goal-driven execution: every task must have a clear completion condition and verification step.
- If the request is ambiguous, stop and ask or state assumptions before making large changes.
- Do not delete or rewrite parts the user has already approved.
- Do not refactor unrelated code.
- Do not add dependencies unless explicitly requested.
- Do not automatically commit unless the user explicitly asks.
- After code changes, run `npm run build`.
- If build fails, stop and report the error summary.

## Current Design Constraints

- The first screen Hero is protected by default.
- Do not change Hero layout, animation, MorphingText, orbit icons, 3D card, copy, spacing, or visual position unless explicitly requested.
- The top navigation/header may be hidden only when requested, but hiding it must not visually shift or break the Hero.
- The second and third sections are moving toward a fullscreen stage system.
- Fullscreen sections should use `min-height: 100vh`.
- Stage containers should use `width: 100vw`, `height: 100vh`, `position: relative`, and `overflow: hidden`.
- Content safe area should use `clamp(48px, 7vw, 128px)`.
- Background motion layers may be full-bleed.
- Text and core interactive content must remain inside the safe area.
- Do not bind the second and third section main layout to the old fixed `176px` margin system.
- Complex animation must be implemented in stages:
  1. static layout
  2. entrance / hover animation
  3. scroll-driven / pinned interaction
- The third screen scroll interaction must avoid artificial waiting, breathing delays, or automatic pauses.

## Verification

Before finishing any code task:
- Run `npm run build`.
- Report modified files.
- Report whether the first screen was touched.
- Report current git branch.
- Report `git status --short`.
