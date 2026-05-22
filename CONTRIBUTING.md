# Contributing to SANJEEVANI 🚑

> **"When humans freeze, AI moves."**  
> Thank you for choosing to contribute to SANJEEVANI — an AI-powered automated emergency response system that bridges the gap between accident detection and life-saving action.

This project is part of **GirlScript Summer of Code 2026 (GSSoC26)**. All contributors — whether first-timers or veterans — are warmly welcome.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Code of Conduct](#code-of-conduct)
- [GSSoC26 Contributors](#gssoc26-contributors)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Fork & Clone](#fork--clone)
  - [Project Structure](#project-structure)
  - [Local Setup](#local-setup)
- [Making Changes](#making-changes)
  - [Branching Strategy](#branching-strategy)
  - [Commit Message Convention](#commit-message-convention)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Issue Guidelines](#issue-guidelines)
- [Coding Standards](#coding-standards)
  - [Python (Backend & ML)](#python-backend--ml)
  - [JavaScript / React (Frontend)](#javascript--react-frontend)
- [Areas Open for Contribution](#areas-open-for-contribution)
- [Community & Communication](#community--communication)
- [Recognition](#recognition)

---

## About the Project

**SANJEEVANI** is an end-to-end automated accident detection and emergency dispatch platform. It uses:

- **YOLOv8** for real-time accident detection from CCTV feeds
- **EasyOCR** for automatic number plate recognition
- **FastAPI** for a high-performance Python backend
- **React + Vite + Tailwind CSS** for a responsive dashboard
- **Supabase (PostgreSQL)** for vehicle registry and event storage
- **Leaflet** for geospatial accident location mapping

The system detects accidents, identifies vehicles, retrieves owner/emergency contacts, and dispatches ambulances — all without human intervention.

---

## Code of Conduct

By participating in this project, you agree to uphold a respectful and inclusive environment for everyone. Please be kind, constructive, and considerate in all interactions — in issues, pull requests, and discussions.

Unacceptable behaviour includes harassment, discrimination, or any form of personal attack. Violations may result in removal from the project.

---

## GSSoC26 Contributors

Welcome, GSSoC26 participants! Here's what you need to know:

- All contributions must go through the **fork → branch → PR** workflow described below.
- Always **comment on an issue** before starting work, and wait for assignment.
- Do **not** raise a PR without a linked issue.
- Each PR should address **one issue only** — avoid bundling unrelated changes.
- Mention `GSSoC26` in your PR description so maintainers can track program contributions.
- Spammy or low-effort PRs (e.g., fixing typos alone without added value, whitespace-only changes) will be marked invalid.

---

## How Can I Contribute?

There are many ways to contribute beyond writing code:

- 🐛 **Bug Reports** — Found something broken? Open a detailed issue.
- ✨ **Feature Requests** — Have an idea to improve the system? Propose it.
- 🧠 **ML Model Improvements** — Better detection accuracy, severity prediction, OCR tuning.
- 🎨 **UI/UX Enhancements** — Improve the React dashboard's design and usability.
- 📖 **Documentation** — Fix typos, add guides, improve clarity.
- 🧪 **Testing** — Write unit/integration tests for backend or frontend.
- 🗺️ **Geospatial Data** — Expand CCTV location mapping beyond Kerala.
- 🔐 **Security** — Identify and responsibly disclose vulnerabilities.

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

| Tool | Minimum Version |
|---|---|
| Python | 3.8+ |
| Node.js | 16+ |
| npm | 8+ |
| Git | Any recent version |

You will also need a free **Supabase** account to configure the database.

---

### Fork & Clone

**1. Fork the repository**

Click the **Fork** button at the top-right of the [SANJEEVANI repository](https://github.com/Ann-Maria-Jaison/SANJEEVANI).

**2. Clone your fork**

```bash
git clone https://github.com/<your-username>/SANJEEVANI.git
cd SANJEEVANI
```

**3. Add the upstream remote**

```bash
git remote add upstream https://github.com/Ann-Maria-Jaison/SANJEEVANI.git
```

**4. Verify remotes**

```bash
git remote -v
# origin    https://github.com/<your-username>/SANJEEVANI.git
# upstream  https://github.com/Ann-Maria-Jaison/SANJEEVANI.git
```

---

### Project Structure

```
SANJEEVANI/
├── .github/             # GitHub configuration and templates
├── backend/             # FastAPI Python backend
├── captured_frames/     # Frames captured during detection
├── docs/                # Architecture and documentation
├── frontend/            # React + Vite + Tailwind dashboard
├── ml/                  # Machine Learning scripts
├── screenshots/         # Project screenshots
├── templates/           # HTML templates
├── .gitignore           # Specifies files and folders to be ignored by Git version control
├── app.py               # Root-level application script
├── check_cols.py        # Script for checking and validating database table columns
├── check_db_v2.py       # Improved version of database validation and consistency checker
├── check_db.py          # Basic database health and connectivity verification script
├── CODE_OF_CONDUCT.md   # Community standards and behavior expectations
├── CONTRIBUTING.md      # Contribution guidelines
├── debug_fetch.py       # Utility script for debugging API/database fetch operations
├── LICENSE              # Contains the project's open-source license information
└── README.md            # Project documentation, setup guide and usage instructions
```

---

### Local Setup

**Backend**

```bash
# Navigate to the backend directory
cd backend

# (Recommended) Create a virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create your environment variables file
cp .env.example .env
# Edit .env and add your SUPABASE_URL and SUPABASE_KEY

# Start the FastAPI server
python main.py
# Server runs at http://localhost:8000
```

**Frontend**

```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
# Dashboard available at http://localhost:5173
```

**ML Detection Engine**

```bash
# Ensure the backend is running first, then:
cd ml
python accident_detection.py
```

---

## Making Changes

### Branching Strategy

Always create a new branch from the latest `main`. **Never commit directly to `main`.**

```bash
# Sync your fork with upstream
git checkout main
git pull upstream main

# Create a descriptive branch
git checkout -b <type>/<short-description>
```

**Branch naming conventions:**

| Type | Example |
|---|---|
| New feature | `feat/severity-prediction` |
| Bug fix | `fix/ocr-plate-parsing` |
| Documentation | `docs/contributing-guide` |
| UI/UX improvement | `ui/dashboard-dark-mode` |
| ML model work | `ml/yolo-model-tuning` |
| Refactor | `refactor/backend-api-structure` |
| Tests | `test/backend-unit-tests` |

---

### Commit Message Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Format:**

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | Adding a new feature |
| `fix` | Fixing a bug |
| `docs` | Documentation changes only |
| `style` | Formatting, missing semicolons (no logic change) |
| `refactor` | Code restructuring without feature/fix |
| `test` | Adding or updating tests |
| `chore` | Build process, dependency updates |
| `perf` | Performance improvements |
| `ml` | Machine learning model changes |
| `ui` | Frontend/UI-only changes |

**Examples:**

```
feat(ml): add YOLOv8 severity score to detection output
fix(backend): resolve OCR timeout on high-resolution frames
docs(contributing): add branching strategy section
ui(dashboard): improve live feed card responsiveness
```

---

## Submitting a Pull Request

1. **Ensure your branch is up to date** with upstream `main`:
   ```bash
   git pull upstream main
   ```

2. **Run and test your changes locally** before pushing.

3. **Push your branch** to your fork:
   ```bash
   git push origin <your-branch-name>
   ```

4. **Open a Pull Request** from your fork to `Ann-Maria-Jaison/SANJEEVANI:main`.

5. **Fill out the PR template** completely:
   - Describe what the PR does and why.
   - Link the related issue using `Closes #<issue-number>`.
   - Add screenshots/recordings for UI changes.
   - Mention `GSSoC26` if applicable.

6. **Wait for review.** Maintainers may request changes — please respond promptly and update your branch accordingly.

7. Once approved, a maintainer will merge your PR. **Do not merge your own PRs.**

> ⚠️ PRs without a linked issue, without a description, or with merge conflicts will not be reviewed until fixed.

---

## Issue Guidelines

Before opening a new issue:

- **Search existing issues** to avoid duplicates.
- Use the appropriate issue template if available.

**For Bug Reports, include:**
- Steps to reproduce the bug
- Expected vs actual behaviour
- Your OS, Python version, Node.js version
- Relevant error messages or screenshots

**For Feature Requests, include:**
- A clear description of the feature
- Why it benefits the project
- Any technical approach you have in mind

**Claiming an issue (GSSoC26):**
- Comment `"I'd like to work on this"` on the issue.
- Wait for a maintainer to assign it to you.
- Do not open a PR for an issue that hasn't been assigned to you.

---

## Coding Standards

### Python (Backend & ML)

- Follow [PEP 8](https://pep8.org/) style guidelines.
- Use meaningful variable and function names.
- Add docstrings to all functions and classes.
- Keep functions focused — one responsibility per function.
- Do not commit unused imports or debug `print()` statements.
- Environment-specific values (API keys, URLs) must go in `.env` — never hardcode secrets.

```python
# Good
def fetch_vehicle_details(plate_number: str) -> dict:
    """
    Fetches vehicle owner and emergency contact from the VAHAN registry.

    Args:
        plate_number: The detected number plate string.

    Returns:
        A dictionary containing owner name, contact, and vehicle details.
    """
    ...
```

### JavaScript / React (Frontend)

- Use **functional components** with React Hooks.
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) where practical.
- Use **Tailwind CSS utility classes** — avoid writing custom CSS unless necessary.
- Name components in **PascalCase** and files to match (`LiveFeed.jsx`).
- Keep components small and focused; extract reusable logic into custom hooks.
- Do not commit `console.log()` statements.

```jsx
// Good
const AccidentCard = ({ location, severity, timestamp }) => {
  return (
    <div className="rounded-lg bg-red-100 p-4 shadow-md">
      <h3 className="font-semibold text-red-800">{location}</h3>
      <p className="text-sm text-gray-600">Severity: {severity}</p>
      <span className="text-xs text-gray-400">{timestamp}</span>
    </div>
  );
};
```

---

## Areas Open for Contribution

The following areas are actively looking for contributors. Check the [Issues tab](https://github.com/Ann-Maria-Jaison/SANJEEVANI/issues) for specific tasks:

| Area | Description |
|---|---|
| 🧠 ML — Severity Prediction | Build a model to classify accident severity from CCTV frames |
| 🎨 UI/UX Enhancement | Improve dashboard design, accessibility, and mobile responsiveness |
| 🐞 False Positive Reporting | Add a feedback button on live feed cards to flag false detections |
| 📄 Documentation | Add CODE_OF_CONDUCT.md, improve README sections, add API docs |
| 🧪 Testing | Write pytest tests for FastAPI endpoints; Jest tests for React components |
| 🗺️ Geospatial Expansion | Add CCTV mappings for states beyond Kerala |
| 🔗 VAHAN API Integration | Move from simulated registry to real Parivahan API |
| 🚑 Ambulance Tracking UI | Improve the live ambulance tracking view |
| 📊 Analytics Dashboard | Add more visualizations to accident trend charts |
| 🐳 DevOps | Add Docker support and GitHub Actions CI workflow |

---

## Community & Communication

- **GitHub Issues** — Primary place for bug reports, feature discussions, and task tracking.
- **GitHub Discussions** — For open-ended questions, ideas, and community interaction.
- **Pull Request comments** — For code-specific discussion.

Please keep all communication respectful and on-topic. When in doubt, open an issue rather than guessing.

---

## Recognition

Every contributor who gets a PR merged will be acknowledged in the project. GSSoC26 participants will receive recognition per program guidelines.

Your contribution — however small — helps make emergency response faster, smarter, and more reliable. Every second saved could be a life saved.

---

<div align="center">

Made with ❤️ for SANJEEVANI

**[⬆ Back to Top](#contributing-to-sanjeevani-)**

</div>