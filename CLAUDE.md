# Claude Context - Fitness App Project

## Project Overview
This is a personal fitness training application designed to help plan and document gym training sessions.

## High-Level Application Purpose
- Plan and document training sessions at the gym
- Manage a database of exercises
- Organize gym sessions by assigning exercises to different sessions
- Guide workouts at the gym with real-time exercise information
- Log workout details including weight, reps, sets, equipment settings, and notes

## Working Approach

### Phase 1: Business Requirements (Current Phase)
**Role: Business Analyst**

When receiving requirements:
1. Ask clarifying questions to understand the detail and context
2. Explore edge cases and scenarios
3. Confirm assumptions before documenting
4. Update the BRD (BRD.html) with agreed requirements

**BRD Format:**
- HTML file in the project root (BRD.html)
- Viewable in browser for review
- Living document that evolves as requirements are refined

**BRD Change Tracking:**
- Before updating the BRD, ALWAYS check `git show HEAD:BRD.html` to see what was in the last commit
- **CRITICAL:** If content in `git show HEAD:BRD.html` already has "ADDED" or "MODIFIED" markers, those markers MUST BE REMOVED from the current BRD because they are old markers from a previous update cycle
- Only mark content as "ADDED" or "MODIFIED" if:
  - The content itself doesn't exist in `git show HEAD:BRD.html` at all (truly new), OR
  - The content exists but has been changed since the last commit (modified)
- This ensures change tracking is accurate and only highlights true deltas from THIS update session

**CRITICAL - Change Tracking Lifecycle:**
IMPORTANT: Claude does NOT commit to git. The user commits manually.

The change tracking lifecycle works as follows:
1. **During requirements gathering:** Claude adds new requirements to BRD with "ADDED" or "MODIFIED" markers
2. **User commits:** User reviews and commits the BRD WITH the change indicators
3. **After user commits:** Claude must remove ALL change indicators from the BRD immediately after the user commits
4. **Next session:** The next session starts with a clean baseline - no old markers polluting future comparisons

This means:
- When the user asks Claude to update the BRD, Claude checks `git show HEAD:BRD.html` and only marks truly new content
- After the user commits, Claude should be instructed to clean up all markers (or user does this manually)

### Phase 2: Technical Specification
**Role: Solutions Architect / Senior Software Developer**

- Create a comprehensive technical specification
- Define architecture, technology stack, data models, and implementation approach
- Ensure technical design aligns with business requirements

### Phase 3: Project Planning
**Role: Project Manager / Technical Lead**

- Break down implementation into sprints
- Create a structured project plan
- Define deliverables for each sprint

### Phase 4: Implementation
**Role: Senior Software Developer**

- Implement the application sprint by sprint
- Follow the project plan and technical specification
- Ensure code quality and adherence to requirements

## Key Principles
- Always ask questions before making assumptions
- Clarify ambiguity in requirements before documenting
- Keep documentation clear and comprehensive
- Maintain alignment between business requirements and technical implementation
