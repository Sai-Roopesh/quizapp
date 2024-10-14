# Quiz Generator Application

An application that generates quizzes based on provided text input or uploaded PDF files using OpenAI's GPT-4 API. The application consists of a frontend built with React and a backend built with FastAPI.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Usage](#usage)
- [Deployment](#deployment)
  - [Backend Deployment on Render](#backend-deployment-on-render)
  - [Frontend Deployment on Vercel](#frontend-deployment-on-vercel)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Features

- Generate multiple-choice quizzes based on text input or uploaded PDF files.
- Specify the number of questions to generate.
- Interactive quiz interface with immediate feedback on answers.
- Pagination for quizzes with many questions.
- Responsive design suitable for various devices.
- Snackbar notifications for user actions (e.g., quiz generation, submission).

## Demo

- **Frontend URL:** [quizapp-frontend-chi.vercel.app](https://quizapp-frontend-chi.vercel.app)
- **Backend URL:** [quizapp-backend-5j6t.onrender.com](https://quizapp-backend-5j6t.onrender.com)

## Technologies Used

- **Frontend:**
  - React
  - Material-UI (MUI)
  - Axios

- **Backend:**
  - FastAPI
  - OpenAI API (GPT-4)
  - LangChain
  - PDFMiner.six
  - Uvicorn with Gunicorn
  - Render (Deployment)

## Project Structure

```
quizgen/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   ├── Procfile
│   └── .env (not committed)
└── frontend/
    └── quiz-app/
        ├── src/
        │   ├── App.jsx
        │   └── ...
        ├── public/
        ├── package.json
        ├── .env (not committed)
        └── ...
```

## Installation

### Prerequisites

- **Node.js** (v14 or later)
- **Python** (3.8 or later)
- **Git**

### Backend Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/quizgen.git
   cd quizgen/backend
   ```

2. **Create a Virtual Environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set Up Environment Variables**

   Create a `.env` file in the `backend` directory:

   ```bash
   touch .env
   ```

   Add your OpenAI API key:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. **Run the Application**

   ```bash
   uvicorn server:app --reload
   ```

   The backend should now be running at `http://localhost:8000`.

### Frontend Setup

1. **Navigate to Frontend Directory**

   ```bash
   cd ../frontend/quiz-app
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Update Backend URL in `App.jsx`**

   Open `src/App.jsx` and set the `BACKEND_URL` to your local backend URL:

   ```jsx
   const BACKEND_URL = 'http://localhost:8000';
   ```

   **Note:** In production, you will set this to your deployed backend URL.

4. **Run the Application**

   ```bash
   npm start
   ```

   The frontend should now be running at `http://localhost:3000`.

## Usage

1. **Access the Application**

   Open your browser and navigate to `http://localhost:3000`.

2. **Generate a Quiz**

   - **Upload PDF**: Click on the "Upload PDF" button and select a PDF file.
   - **Enter Text**: Or, paste text into the provided text area.

3. **Specify Number of Questions**

   Enter the desired number of questions (default is 5, minimum 1, maximum 20).

4. **Generate Quiz**

   Click on "Generate Quiz" to create the quiz based on the provided content.

5. **Take the Quiz**

   - Select answers for each question.
   - Use the "Previous" and "Next" buttons to navigate between pages.
   - Submit the quiz to see your score and correct answers.
   - View explanations for each question after submission.

6. **Reset the Quiz**

   Click on "Try Again" to reset the quiz and generate a new one.

## Deployment

### Backend Deployment on Render

1. **Create a Render Account**

   Sign up at [Render](https://render.com/).

2. **Create a New Web Service**

   - Connect your GitHub repository.
   - Set the root directory to `backend/`.
   - Set the environment to **Python 3**.
   - Set the build command to:

     ```bash
     pip install -r requirements.txt
     ```

   - Set the start command:

     ```bash
     gunicorn server:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
     ```

3. **Set Environment Variables**

   Add `OPENAI_API_KEY` in the Render dashboard under **Environment**.

4. **Deploy**

   Render will automatically build and deploy your backend.

### Frontend Deployment on Vercel

1. **Create a Vercel Account**

   Sign up at [Vercel](https://vercel.com/).

2. **Import Your Repository**

   - Connect your GitHub repository.
   - Set the project settings:
     - **Framework Preset**: React
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`

3. **Update Backend URL in `App.jsx`**

   In `src/App.jsx`, set the `BACKEND_URL` to your deployed backend URL:

   ```jsx
   const BACKEND_URL = 'https://quizapp-backend-5j6t.onrender.com';
   ```

   **Note:** This hardcodes the backend URL for production use.

4. **Deploy**

   Vercel will build and deploy your frontend.

## Environment Variables

- **Backend**

  - `OPENAI_API_KEY`: Your OpenAI API key.

- **Frontend**

  - If you prefer to use environment variables (optional):

    - Create a `.env` file in `frontend/quiz-app`:

      ```bash
      touch .env
      ```

    - Add the backend URL:

      ```env
      REACT_APP_BACKEND_URL=https://quizapp-backend-5j6t.onrender.com
      ```

    - Update `App.jsx`:

      ```jsx
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      ```

    - **Note:** Ensure to set the `REACT_APP_BACKEND_URL` environment variable in your deployment platform (e.g., Vercel).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- [OpenAI](https://openai.com/) for the GPT-4 API.
- [FastAPI](https://fastapi.tiangolo.com/) for the web framework.
- [React](https://reactjs.org/) for the frontend library.
- [Material-UI](https://mui.com/) for UI components.
- [LangChain](https://github.com/hwchase17/langchain) for language model integration.
- [PDFMiner.six](https://pdfminersix.readthedocs.io/) for PDF text extraction.

---

**Additional Notes:**

- **CORS Configuration:** In `server.py`, the backend is configured to allow requests from your frontend domain:

  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["https://quizapp-frontend-chi.vercel.app"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"]
  )
  ```

  If you deploy your frontend to a different domain, update `allow_origins` accordingly.

- **OpenAI Model Selection:** In `server.py`, the model is set to `"gpt-4o"`. Ensure that this is the correct model identifier for your OpenAI API access. If not, update it to the appropriate model name (e.g., `"gpt-4"`).

  ```python
  llm = ChatOpenAI(
      model="gpt-4",
      temperature=0,
      api_key=openai_api_key
  )
  ```

- **Backend Logging:** The backend uses Python's logging module for debugging. Logs will be output to the console and can be viewed in the Render dashboard.

- **Frontend Notifications:** The frontend uses Material-UI's `Snackbar` and `Alert` components to provide user feedback on actions like quiz generation, submission, and errors.

- **Error Handling:** Both the frontend and backend include error handling to manage unexpected inputs and API failures gracefully.

---

**Setup Summary:**

- **Backend:**
  - Ensure `OPENAI_API_KEY` is set in `.env`.
  - Install dependencies from `requirements.txt`.
  - Run the app locally with Uvicorn.
  - Deploy to Render with the specified `Procfile` and environment variables.

- **Frontend:**
  - Install dependencies with `npm install`.
  - Update `BACKEND_URL` in `App.jsx` to point to your backend.
  - Run locally with `npm start`.
  - Deploy to Vercel, ensuring the backend URL is correctly set for production.

**Security Reminder:**

- **Do Not Commit Sensitive Information:** Ensure that `.env` files and any other files containing sensitive information are included in `.gitignore` and not committed to your repository.

- **API Keys:** Keep your OpenAI API key secure. Do not expose it in frontend code or commit it to version control.
