# Session workflow product decisions

Updated: 2026-09-21

## Practice plan structure

A practice plan is hierarchical rather than a flat list.

```text
Section
  -> Drill
  -> Drill
```

Example:

```text
Ball Handling
  -> Pound dribble series
  -> Between-cross series
  -> PG combo

Shooting
  -> One-dribble pull-up
  -> Catch-and-shoot
```

Sections remain flexible and are created for the workout Shandon plans to use that day. The app must not force the same fixed sections into every session.

Each drill has a category such as Ball Handling, Shooting, Finishing, Defense, Passing, Footwork, Conditioning, Warm-up, or Other. This category controls which Quick Log fields are relevant.

## Quick Log behavior

Quick Log should be fast enough to use during water breaks.

The normal path is:

```text
Choose section
-> choose a drill already in that section's practice plan
-> choose any relevant spot/side
-> enter result and/or coach note
-> choose what it means next
-> save
```

The trainer should not need to retype a drill that is already in the practice plan.

An `Other / add drill` option remains available for drills improvised during the session. An improvised drill can be added into that section so it is available again during the same session.

Saved Quick Logs remain editable. The trainer can correct section, drill, spot/side, result, note, log type, and next-step meaning after saving.

## Shooting locations

When the selected drill is categorized as Shooting, Quick Log should show a Court Spot dropdown rather than requiring free typing.

Initial court spots:
- Right Corner
- Right Wing
- Top
- Left Wing
- Left Corner
- Right Short Corner
- Left Short Corner
- Right Elbow
- Left Elbow
- Paint / Rim
- Custom

Other drill categories may use a simpler side/context field when relevant. Future category-specific presets can be added without making every category use the same location choices.

## Progress history implication

The long-term production model should preserve a reusable drill identity rather than relying only on display text. That allows the app to compare the same drill across sessions, including location-specific results such as:

```text
One-dribble pull-up / Right Wing
Previous: 5/10
Current: 8/10
```

The current public preview is still fake-data UX validation. Persistence and final schema changes come after workflow acceptance.

## External / camp evaluations — later feature

Shandon needs to evaluate athletes who are not recurring clients, especially at camps, without requiring a full client profile first.

Future external evaluation flow:

```text
New External Evaluation
-> lightweight athlete/contact information
-> use the same individual evaluation scale/template
-> priorities / short-term focus / trainer summary
-> save a lightweight historical record
-> generate a branded PDF
-> download or email to the athlete/parent
```

The PDF should use That's Tuff branding and include athlete name, event/camp name, evaluation date, ratings, strengths, development priorities, short-term focus, trainer comments, and appropriate business contact/training information.

Camp evaluation entry should support a faster observation workflow for larger groups, including the existing quick observation symbols (meets / developing / needs focus) alongside the documented 1–5 That's Tuff scale where appropriate.

If an external/camp athlete later becomes a recurring client, the system should support attaching their prior evaluation history to the new player identity rather than discarding it.

This external evaluation/PDF workflow is recorded as a later feature and should not interrupt completion of the recurring-client session workflow.
