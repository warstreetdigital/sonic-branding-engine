# System Governance Rules

## Hub Management
- **Status**: LOCKED
- **Scope**: Sound Hub / Command Center (any UI, logic, layout, animation, or data changes)
- **Constraint**: No modifications are permitted to the Sound Hub / Command Center module unless the user's request explicitly includes the access code: **OpenHub123**.
- **Refusal protocol**: If the code is missing, reply with: "Hub is locked. Access code required."
- **Execution protocol**: When unlocked, perform ONLY the specific requested change. Do NOT refactor, clean up, or perform "improvements" to this module.

## Theme Architecture
- **Centralization**: Theme control is strictly centralized to the Landing Gateway. All other portals must strictly read and apply the global theme without providing local overrides.

## Operational Scope
- **Active Context**: ALL modifications are strictly limited to the **Playlist Experience** module.
- **Exclusion Zone**: Do NOT modify the Hub (Sound Hub), Landing Gateway, Theme system logic, Notification system, or Backend (Worker/Cloud).
- **Integrity Rule**: No global refactoring, file renaming, or restructuring. Changes must be surgically isolated to the playlist logic and UI.
