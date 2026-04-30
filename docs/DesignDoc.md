# Design Document — English Work Tracker (PWA)

## 1. Overview

**Name:** English Work Tracker
**Type:** Progressive Web App (PWA)
**Stack:** React + IndexedDB (offline-first) + optional backend (Supabase or custom API)
**Distribution:** Packaged as a PWA and published on the Microsoft Store

This application focuses on structured tracking of English study plans geared towards the workplace, with an emphasis on:

- Daily consistency
- Active production (writing + speaking)
- Flexible recording by blocks throughout the day
- Centralization of personalized resources
- Real progress metrics

---

# 2. Product Objectives

## 2.1 Primary Objective

To enable users to maintain a sustainable work study routine (1–2 hours daily) seamlessly and with clear progress measurement.

## 2.2 Secondary Objectives

- To avoid assuming that study occurs in a single block.

- Allow recording multiple sessions at different times of the day.

- Centralize study links by category.

- Encourage frequent written output.

--- View monthly and cumulative progress.

---

# 3. Design Principles

1. **Flexible, not rigid:** The user can study in 2–4 small blocks.

2. **Mandatory output:** There will always be time to produce (write or speak).

3. **Simple registration:** Adding activity should take <10 seconds.

4. **Offline first:** It should work without internet access.

5. **Cumulative measurement:** Progress is measured by consistency, not by isolated bursts of intensity.

---

# 4. Architecture

## 4.1 Frontend

- React (Vite)
- React Router
- Zustand or Context API
- IndexedDB (Dexie recommended)
- Service Worker
- Web App Manifest

## 4.2 Backend (Optional V2)

- Supabase or REST API
- Optional Synchronization
- Cloud Backup

---

# 5. Module Structure

## 5.1 Dashboard

Displays:

- Total time today
- Number of blocks logged today
- Current streak
- Weekly progress (% of goal achieved)
- Button: "Log Activity"
- Button: "Write Mode"

---

## 5.2 Flexible Daily Log (Core Feature)

### Key Concept

A day is not a single session.

A day contains multiple **activity blocks**.

Real Example:

- 7:30 a.m. → 20 min podcast
- 12:30 p.m. → 15 min reading
- 8:00 p.m. → 30 min writing

All belong to the same day.

--

## 5.3 Block Log Model

Each block contains:

- Date
- Start time (optional)
- Activity type
- Resource used (selected or customized)
- Free-form description (what you did exactly)
- Time in minutes

Activity types:

- Listening
- Reading
- Writing
- Speaking
- Shadowing
- Vocabulary (Anki)
- Other

---

# 6. Recommended Content System (Updated)

## 6.1 Objective

To centralize all useful links by category so they are readily available when logging activity.

---

## 6.2 Configurable Categories

The user can create and manage categories such as:

- Work Series
- Podcasts
- Technical YouTube Videos
- Articles
- Technical Documentation
- Actual Meetings
- Actual Emails
- Custom Resources

---

## 6.3 Links per Category

Each category allows:

- Adding multiple links
- Custom title
- URL
- Optional notes
- Tags (e.g., technical, casual, advanced)

Example structure:

```json
{
id,
category_id,
title,
url,
notes,
tags[]
}
```

---

## 6.4 Use in Daily Log

When logging an activity:

1. Select type (Listening, Reading, etc.)
2. You can:

- Choose an existing resource (dropdown filtered by category)
- Or manually enter what you used

3. Indicate duration
4. Add a brief note (e.g., "Shadowing") 5 minutes from 03:00 to 08:00

This allows for real-time progress tracking.

---

# 7. Daily Writing Mode (Main Feature)

## 7.1 Objective

To encourage frequent written output geared towards a professional environment.

---

## 7.2 Features

- Minimalist editor
- Automatic saving
- Word counter
- Active writing time
- History by date
- Ability to write multiple times in a single day

---

## 7.3 Suggested Prompts

Automatically generated or selectable:

- Write an email explaining a bug.
- Summarize your workday.
- Explain a technical feature.
- Simulate a meeting.
- Describe a system improvement.

You can also write without a prompt.

---

## 7.4 Writing Metrics

- Total words accumulated
- Words per month
- Consecutive days writing
- Average words per session
- Total minutes writing

---

# 8. Global Metrics

## 8.1 Daily

- Total minutes
- Blocks recorded
- Types of activity performed

## 8.2 Weekly

- Total minutes
- % of goal achieved
- Most frequent activity
- Writing consistency

## 8.3 Monthly

- Total hours
- Total words written
- Structured self-assessment
- Heatmap chart

---

# 9. Streak System

Rules:

- Valid day = ≥30 minutes accumulated
- Full day = ≥60 minutes
- Streak depends on consecutive valid days

Strike does not depend on doing everything in a single session.
---

# 10. Daily UX Flow

### Scenario A — Quick Log

1. Open app
2. Click "Log activity"
3. Select type
4. Select resource or enter a new one
5. Enter minutes
6. Save

Flow duration: <10 seconds.

---

### Scenario B — Writing Mode

1. Click "Writing Mode"
2. Select prompt or free input
3. Write
4. Auto-save
5. Automatically saved as a Writing block

---

### Scenario C — Day View

Displays:

- Chronological list of blocks
- Cumulative total
- Ability to edit/delete blocks
- Visual summary by type

---

# 11. Final Data Model

## users

- id
- created_at

## daily_blocks

- id
- date
- start_time (nullable)
- type
- resource_id (nullable)
- custom_resource_text (nullable)
- duration_minutes
- notes

## writing_entries

- id
- date
- text
- word_count
- active_time_minutes
- linked_block_id (nullable)

## resource_categories

- id
- name

## resources

- id
- category_id
- title
- url
- notes
- tags_json

## monthly_reviews

- month
- answers_json
- notes

---

# 12. Offline Strategy

- IndexedDB as primary source
- Optional deferred synchronization
- Service worker cache-first
- Manual JSON export as backup

---

# 13. Roadmap

## MVP

- Dashboard
- Block registration
- Categories + custom links
- Basic writing mode
- Streak
- Full offline

## V2

- Advanced statistics
- CSV export
- Cloud synchronization
- Automatic writing feedback

## V3

- Language evolution analysis
- Intelligent focus recommendation
- Predictive metrics

---

# 14. Publishing as PWA

Steps:

1. Complete Manifest.json
2. Stable service worker
3. Real offline support
4. Package with PWABuilder
5. Publish on the Microsoft Store

Requirements:

- Responsive icons
- Privacy policy
- Semantic versioning
- Windows testing

---

# 15. Differentiator

It's not a generic English app.

It is:

- Geared towards real professional use
- Flexible with daily blocks
- With centralized resources
- With structured writing
- Measurable and cumulative
- Designed for long-term consistency

---