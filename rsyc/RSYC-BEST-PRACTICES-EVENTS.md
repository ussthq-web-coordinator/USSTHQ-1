# RSYC Program Schedules & Events – Best Practices

## Events Are Now Program Schedules
- **All events should be entered as program schedules** in the JSON data, with the field `ShowinEventsSection` set to `true` for any schedule that should appear in the Events section.
- The legacy "events" and "full catalog" exports are deprecated. Use only the program schedule JSON for all integrations and exports.

## Marking an Event
- To mark a program schedule as an event, set `ShowinEventsSection: true` in the schedule object.
- Only schedules with `ShowinEventsSection: true` will appear in the Events section and be counted as events in the audit modal and catalog.

## Catalog & Audit Modal
- The program schedule catalog now includes an "Event" column, showing whether each schedule is an event.
- The audit modal displays a count of how many program schedules are marked as events for each center.

## Data Entry Guidance
- Enter all event details (title, dates, time, location, etc.) in the program schedule JSON.
- Do not duplicate events in a separate events array.
- For recurring events, use the appropriate schedule fields and set `ShowinEventsSection: true`.

## Integration
- All downstream integrations (SharePoint, exports, etc.) should use the program schedule JSON as the single source of truth for both regular schedules and events.

---

**Summary:**
- Events are now managed as program schedules with `ShowinEventsSection: true`.
- Use only the program schedule JSON for all exports and integrations.
- The UI and audit tools reflect this unified approach.
