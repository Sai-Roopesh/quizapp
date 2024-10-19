# backend/server.py

from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from langchain_community.chat_models import ChatOpenAI
import json
import io
from pdfminer.high_level import extract_text
import logging
from langchain_community.utilities import WikipediaAPIWrapper
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize the FastAPI app
app = FastAPI()

# Define allowed origins directly (hard-coded)
origins = ["https://quizapp-frontend-chi.vercel.app"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # This should be a list of origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the request body model


class QuizRequest(BaseModel):
    text: Optional[str] = None
    topic: Optional[str] = None
    num_questions: int = 5  # Default value


# Load the OpenAI API key once
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY is not set in the environment variables")

# Initialize the language model (LLM)
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",
    temperature=0,        # Ensure determinism in output
    openai_api_key=openai_api_key  # Pass the API key to the LLM
)

# Middleware to log incoming requests


@app.middleware("http")
async def log_requests(request: Request, call_next):
    origin = request.headers.get('origin')
    logger.info(f"Incoming request from origin: {origin}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response


@app.get("/")
async def root():
    return {"message": "Hello, welcome to the quiz generator!"}


@app.post("/generate_quiz")
async def generate_quiz(input_data: QuizRequest):
    if input_data.text:
        text = input_data.text
    elif input_data.topic:
        # Fetch content from Wikipedia
        wikipedia = WikipediaAPIWrapper()
        text = wikipedia.run(input_data.topic)
        if not text.strip():
            raise HTTPException(
                status_code=404, detail="No content found for the given topic."
            )
    else:
        raise HTTPException(
            status_code=400, detail="Either text or topic is required for quiz generation."
        )

    # Updated prompt for quiz generation
    prompt = f"""This is the text: {text}
Generate a quiz with {input_data.num_questions} questions for this text.
Return **only** the quiz in **valid JSON format** as a list of questions with the following fields:
- question_number: The question number.
- question: The quiz question.
- options: A list of answer choices.
- answer: The correct answer.
- explanation: A brief explanation for why the answer is correct.

Do not include any explanations, code snippets, or additional text.
Do not wrap the JSON in code blocks or use triple backticks.
Do not include a top-level key; just return the list of questions."""

    try:
        # Invoke the LLM to generate the quiz
        ai_response = llm.predict(prompt)

        # Extract the content
        raw_content = ai_response.strip()

        logger.info("Raw AI response content: %s", raw_content)

        # Remove code block formatting if present
        if raw_content.startswith('```') and raw_content.endswith('```'):
            raw_content = raw_content[3:-3].strip()
            if raw_content.startswith('json'):
                raw_content = raw_content[4:].strip()

        # Now, parse the JSON
        quiz_data = json.loads(raw_content)

        # Ensure that quiz_data is a list
        if not isinstance(quiz_data, list):
            raise ValueError("Quiz data must be a list of questions.")

        logger.info("Processed quiz data: %s", quiz_data)

        # Return the quiz data
        return quiz_data

    except json.JSONDecodeError as e:
        logger.exception("JSON Decode Error")
        logger.error("Failed to parse JSON. AI Response: %s", raw_content)
        raise HTTPException(
            status_code=500, detail=f"Failed to parse the quiz JSON: {str(e)}"
        )
    except Exception as e:
        logger.exception("Error during quiz generation")
        logger.error("AI Response: %s", raw_content)
        raise HTTPException(
            status_code=500, detail=f"An error occurred during quiz generation: {str(e)}"
        )


@app.post("/upload_pdf")
async def upload_pdf(file: UploadFile = File(...), num_questions: int = 5):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400, detail="Only PDF files are allowed."
        )

    try:
        # Read PDF file contents
        contents = await file.read()
        text = extract_text(io.BytesIO(contents))

        if not text.strip():
            raise ValueError("No text found in the uploaded PDF.")

        # Generate the quiz using the extracted text
        response = await generate_quiz(QuizRequest(text=text, num_questions=num_questions))
        return response

    except Exception as e:
        logger.exception("Error processing PDF")
        raise HTTPException(
            status_code=500, detail=f"An error occurred while processing the PDF: {str(e)}"
        )
