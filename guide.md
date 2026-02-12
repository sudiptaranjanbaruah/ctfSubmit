# Step-by-Step Implementation Guide for CTF Submission Website

This guide outlines the process to build a CTF submission platform with a backend server, file-based database, and a frontend interface.

## Phase 1: Project Setup

1.  **Initialize Project**
    *   Create a new directory: `ctf-website`.
    *   Run `npm init -y` to generate `package.json`.
    *   Install dependencies: `npm install express body-parser express-session fs`.

2.  **Create File Structure**
    ```
    ctf-website/
    ├── public/
    │   ├── index.html
    │   ├── style.css
    │   ├── script.js
    │   └── login.html
    ├── data/
    │   ├── ctfs.json
    │   └── submissions.json
    ├── server.js
    └── passwords.md
    ```

## Phase 2: Backend Development (`server.js`)

1.  **Setup Express Server**
    *   Initialize `express`.
    *   Configure `body-parser` and `express-session`.
    *   Serve static files from `public/`.

2.  **Implement Authentication**
    *   Create a function to read `passwords.md` dynamically on login attempt.
    *   Parse the markdown for `username:password`.
    *   Create a `/login` POST endpoint:
        *   Verify credentials.
        *   Create session if valid.
        *   Return success/failure.

3.  **Implement CTF Data Handling**
    *   Create `data/ctfs.json` with sample data:
        ```json
        [
          {"id": 1, "title": "CTF 1", "flag": "flag{example_1}"},
          {"id": 2, "title": "CTF 2", "flag": "flag{example_2}"}
        ]
        ```
    *   Create `/api/ctfs` GET endpoint (protected by session check).
        *   Return list of CTFs *without* the flags to the frontend.

4.  **Implement Submission Logic**
    *   Create `/api/submit` POST endpoint.
    *   Receive `{ ctfId, submittedFlag }`.
    *   Validate against stored flags in `data/ctfs.json`.
    *   If correct:
        *   Log entry to `data/submissions.json` with `{ user, ctfId, timestamp }`.
        *   Return `success: true`.
    *   If incorrect: Return `success: false`.

5.  **Implement Leaderboard**
    *   Create `/api/leaderboard` GET endpoint.
    *   Read `submissions.json`.
    *   Aggregate counts per user.
    *   Return sorted list.

## Phase 3: Frontend Development

1.  **Blueprint Design (`style.css`)**
    *   Use a "blueprint" aesthetic: White/Blue simple lines, rounded handwritten-style fonts (like `Comic Sans MS` or a Google Font like `Patrick Hand` or `Architects Daughter`).
    *   Card styling: Border with `border-radius`, slight sketch effect if possible (using multiple borders or SVG).

2.  **Login Page (`public/login.html`)**
    *   Simple form: Username, Password.
    *   Fetch POST to `/login`.
    *   Redirect to `index.html` on success.

3.  **Dashboard (`public/index.html`)**
    *   Fetch GET `/api/ctfs`.
    *   Render grid of cards ("CTF 1", "CTF 2"...).
    *   **Modal Implementation**:
        *   Hidden by default.
        *   On card click: Show modal with Input Field ("Submit your flag here") and Buttons ("Submit", "Cancel").

4.  **Client Logic (`public/script.js`)**
    *   Handle Modal Open/Close.
    *   Handle Submission:
        *   AJAX POST to `/api/submit`.
        *   Show alert/notification on result.
    *   Refresh Leaderboard display (if on same page).

## Phase 4: Data & content

1.  **Populate `passwords.md`**
    *   Add users in format:
        ```markdown
        user1:pass123
        admin:secret
        ```

2.  **Populate `data/ctfs.json`**
    *   Add real CTF challenges and their correct flags.

## Phase 5: Testing

1.  Start server: `node server.js`.
2.  Open `http://localhost:3000`.
3.  Login with credentials from `passwords.md`.
4.  Click a CTF, enter correct flag -> Verify success.
5.  Enter incorrect flag -> Verify failure.
6.  Check `submissions.json` updates.
