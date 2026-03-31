# Taskify

Taskify is a lightweight task management dashboard with a professional Kanban-style workflow UI. It is built as a static frontend app with persistent local storage, drag-and-drop task movement, and a cleaner project structure for publishing to GitHub.

## Features

- polished dashboard layout with responsive design
- task creation with title, description, due date, and priority
- drag-and-drop workflow stages: To Do, In Progress, Under Review, Completed
- local storage persistence so tasks remain after refresh
- lightweight static setup that can be hosted on GitHub Pages

## Project structure

- `index.html` - main app entry
- `style.css` - application styling
- `app.js` - task state and UI logic
- `taskify.html` - redirect to `index.html` for compatibility

## Run locally

Open `index.html` in a browser.

## Prepare for GitHub

1. Create a new GitHub repository.
2. Add the remote:
   `git remote add origin <your-repo-url>`
3. Push the default branch:
   `git push -u origin main`

If you want to use GitHub Pages, set the source to the root of the `main` branch.
