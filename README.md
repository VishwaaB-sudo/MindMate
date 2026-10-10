# MindMate — Student Wellness Web App

A responsive frontend prototype for a student mental wellness competition concept. It is built with plain HTML, CSS, and JavaScript so it can run easily on a Windows laptop without installing a framework or dependencies.

## Features included

- Home dashboard and navigation
- Daily mood check-ins with optional reason and note
- Mood reflection chart and recent check-ins
- Guided breathing animation and grounding prompt
- Study task list with priorities, completion, and deletion
- Focus/break/reset timer
- Private journal with create, edit, and delete
- Support page with a sample message to a trusted person
- Settings page with a clear-demo-data control
- Responsive layout for mobile, tablet, and desktop
- Browser localStorage persistence

## Run on Windows / VS Code

1. Extract `MindMate.zip`.
2. Open VS Code.
3. Select **File → Open Folder** and choose the extracted `MindMate` folder.
4. Open `index.html` in a browser by double-clicking it in File Explorer.

**Recommended:** In VS Code, install the **Live Server** extension. Right-click `index.html` and select **Open with Live Server**. Your browser will open the application and refresh when you save changes.

No Node.js installation or package installation is required for this version.

## Important demo-mode notes

- This is a frontend prototype, not a production mental-health service.
- Mood entries, tasks, and journal pages are saved in the current browser's localStorage on this device.
- There are no accounts, cloud sync, or remote database in this version.
- Anyone with access to the same browser profile may potentially access locally stored demo entries. Do not use real sensitive journal content on a shared computer.
- The support directory is a prototype. Add verified institution-specific contacts before presenting it as a real service.
- MindMate is not a diagnosis, treatment, or crisis-response tool. It does not replace qualified professional care.

## Suggested competition demo flow

1. Start on the dashboard.
2. Record a mood and optional context.
3. Open Calm Corner and start the breathing animation.
4. Add a study task and try the focus timer.
5. Write a short demo journal entry, then edit or delete it.
6. Show the reflections page.
7. Explain that this current build uses local demo storage; secure account-based storage would be implemented and tested as a later development phase.

## Project files

- `index.html` — page structure
- `style.css` — responsive visual design
- `script.js` — navigation and working interactions

## Future development

A production-ready version could add React, secure authentication, Supabase/PostgreSQL storage with Row Level Security, consent flows, verified support contacts, accessibility testing, and user testing with appropriate supervision.
