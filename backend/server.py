# server.py

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
import json
import io
from pdfminer.high_level import extract_text
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize the FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://quizapp-frontend-chi.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Define the request body model


class Text(BaseModel):
    text: str
    num_questions: int = 5  # Default value


# Load the OpenAI API key once
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY is not set in the environment variables")

# Initialize the language model (LLM)
llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0,        # Ensure determinism in output
    max_tokens=None,      # No limit on tokens (optional)
    timeout=None,         # Use default timeout
    max_retries=2,        # Retry twice on failures
    api_key=openai_api_key  # Pass the API key to the LLM
)


@app.get("/")
async def root():
    return {"message": "Hello, welcome to the quiz generator!"}


@app.post("/generate_quiz")
async def generate_quiz(input_text: Text):
    if not input_text.text:
        raise HTTPException(
            status_code=400, detail="Input text is required for quiz generation."
        )

    # Updated prompt for quiz generation
    prompt = f"""
    This is the text: {input_text.text}
    Generate a quiz with {input_text.num_questions} questions for this text. Return **only** the quiz in **valid JSON format** with the following fields:
    - question_number: The question number.
    - question: The quiz question.
    - options: A list of answer choices.
    - answer: The correct answer.
    - explanation: A brief explanation for why the answer is correct.

    Do not include any explanations, code snippets, or additional text. Do not wrap the JSON in code blocks or use triple backticks.
    """

    try:
        # Invoke the LLM to generate the quiz
        ai_response = llm.invoke(prompt)

        # Extract the content
        raw_content = ai_response.content

        logger.info("Raw AI response content: %s", raw_content)

        # Remove code block formatting if present
        if raw_content.startswith('```'):
            # Remove the opening triple backticks and language identifier
            raw_content = raw_content.strip('`').strip()
            if raw_content.startswith('json'):
                raw_content = raw_content[4:].strip()  # Remove 'json'
            # Remove the closing triple backticks
            if raw_content.endswith('```'):
                raw_content = raw_content[:-3].strip()

        # Now, parse the JSON
        quiz_data = json.loads(raw_content)

        # Check if the response is wrapped in a 'quiz' key
        if isinstance(quiz_data, dict) and "quiz" in quiz_data:
            quiz_data = quiz_data["quiz"]

        # Ensure that quiz_data is a list
        if not isinstance(quiz_data, list):
            raise ValueError("Quiz data must be a list of questions.")

        logger.info("Processed quiz data: %s", quiz_data)

        # Return the quiz data
        return quiz_data

    except json.JSONDecodeError as e:
        logger.error("JSON Decode Error: %s", str(e))
        raise HTTPException(
            status_code=500, detail=f"Failed to parse the quiz JSON: {str(e)}"
        )
    except Exception as e:
        logger.error("Error during quiz generation: %s", str(e))
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
        response = await generate_quiz(Text(text=text, num_questions=num_questions))
        return response

    except Exception as e:
        logger.error("Error processing PDF: %s", str(e))
        raise HTTPException(
            status_code=500, detail=f"An error occurred while processing the PDF: {str(e)}"
        )
