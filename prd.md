# Product Requirements Document (PRD): CTF Submission Website

## 1. Overview
A web-based platform for users to view Capture The Flag (CTF) challenges, submit flags, and view a leaderboard. Access is restricted to users with credentials stored in a specific markdown file.

## 2. User Stories
- **As a User**, I want to log in using my assigned username and password so that I can access the challenges.
- **As a User**, I want to see a list of available CTF challenges on the home page.
- **As a User**, I want to click on a challenge to see a submission form.
- **As a User**, I want to submit a flag for a challenge and get immediate feedback (success/fail).
- **As a User**, I want to see a leaderboard showing who has solved which challenges.
- **As an Admin**, I want to define users and passwords in a `passwords.md` file.
- **As an Admin**, I want to store correct flags securely in the backend.

## 3. Functional Requirements

### 3.1 Authentication
- System must read credentials from `passwords.md`.
- Format assumed for `passwords.md`: `username:password` (one per line) OR a Markdown table.
- Session management (simple token or cookie) to keep the user logged in.

### 3.2 Home Page (Dashboard)
- Layout: Grid of cards representing CTF challenges.
- Content per card: CTF Name/Title.
- Visuals: Clean, modern blueprint style (as per user description).

### 3.3 CTF Submission (Modal/Detail)
- Trigger: Clicking a CTF card.
- UI: Pop-up modal or dedicated section.
- Elements:
  - Title of the CTF.
  - Description (optional).
  - Input field for the Flag.
  - "Submit" button.
  - "Cancel" button.

### 3.4 Backend Logic
- **Store Correct Flags**: A secure mapping of `CTF ID -> Correct Flag`.
- **Validation**: Compare submitted flag with stored flag.
- **Data Persistence**: Store submissions (Who solved what and when).
- **Leaderboard Calculation**: Aggregate submissions to show user scores/progress.

## 4. Technical Architecture

### 4.1 Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla or lightweight framework).
- **Backend**: Node.js with Express.js.
- **Database**: JSON file-based storage (for simplicity and portability) or SQLite.
  - `data/ctfs.json`: Challenge details (ID, Title, Description, CorrectFlag).
  - `data/submissions.json`: User submissions.

### 4.2 File Structure (Proposed)
```
/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── data/
│   ├── ctfs.json       (Stores challenges & answers)
│   └── submissions.json (Stores results)
├── route/
│   └── api.js
├── passwords.md        (User provided source of truth for auth)
├── server.js           (Entry point)
└── package.json
```

## 5. UI/UX Design
- **Theme**: Blueprint / Technical aesthetic.
- **Home**: Banner/Header "CTF SUBMISSION", followed by a grid of "CTF 1", "CTF 2"...
- **Modal**: Centralized focused view for input.

## 6. Security Considerations
- **Flag Hiding**: Correct flags must *never* be sent to the client. Validation happens strictly on the server.
- **Input Sanitization**: Basic santization for flag inputs.

## 7. Future Scope
- Admin panel to add CTFs via UI.
- Real-time leaderboard updates (WebSockets).
