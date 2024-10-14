// App.jsx

import { useState } from 'react';
import axios from 'axios';
import {
  Button,
  TextField,
  Typography,
  Container,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import './App.css';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [inputText, setInputText] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizData, setQuizData] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 5;

  // State for Snackbar
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' | 'error' | 'warning' | 'info'

  // Handle Snackbar close
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPdfFile(file);
      setInputText('');
      setQuizData([]);
      setUserAnswers({});
      setScore(null);
      setIsSubmitted(false);
      setErrorMessage('');
      setCurrentPage(0);

      // Show acknowledgment for PDF selection
      setSnackbarMessage(`PDF "${file.name}" chosen successfully!`);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    }
  };

  // Generate the quiz
  const handleGenerateQuiz = async () => {
    const BACKEND_URL = 'https://your-backend-domain.com'

    if (!pdfFile && !inputText) {
      alert('Please select a PDF file or enter text.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      let response;
      if (inputText) {
        // Send text input to backend
        response = await axios.post(`${BACKEND_URL}/generate_quiz`, {
          text: inputText,
          num_questions: numQuestions,
        });
        // Show acknowledgment for text input
        setSnackbarMessage('Quiz generated successfully from text input!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      } else {
        // Send PDF file to backend
        const formData = new FormData();
        formData.append('file', pdfFile);
        formData.append('num_questions', numQuestions);

        response = await axios.post('http://localhost:8000/upload_pdf', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        // Show acknowledgment for PDF upload and quiz generation
        setSnackbarMessage('PDF uploaded and quiz generated successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      }

      // Log the response data for debugging
      console.log('Quiz Data:', response.data);

      // Ensure that response.data is an array
      if (Array.isArray(response.data)) {
        setQuizData(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setSnackbarMessage('Received unexpected data format from the server.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error generating quiz:', error);
      setErrorMessage(
        error.response?.data?.detail || 'An error occurred while generating the quiz.'
      );
      setSnackbarMessage(error.response?.data?.detail || 'An error occurred while generating the quiz.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  // Handle answer selection
  const handleAnswerChange = (questionNumber, selectedOption) => {
    setUserAnswers({
      ...userAnswers,
      [questionNumber]: selectedOption,
    });
  };

  // Submit the quiz and calculate score
  const handleSubmitQuiz = () => {
    let correctAnswers = 0;
    quizData.forEach((question) => {
      if (userAnswers[question.question_number] === question.answer) {
        correctAnswers += 1;
      }
    });
    setScore(correctAnswers);
    setIsSubmitted(true);
    // Show acknowledgment for quiz submission
    setSnackbarMessage('Quiz submitted successfully!');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  // Reset the quiz
  const handleResetQuiz = () => {
    setQuizData([]);
    setUserAnswers({});
    setScore(null);
    setIsSubmitted(false);
    setPdfFile(null);
    setInputText('');
    setErrorMessage('');
    setCurrentPage(0);
    // Show acknowledgment for quiz reset
    setSnackbarMessage('Quiz has been reset. You can start a new quiz.');
    setSnackbarSeverity('info');
    setOpenSnackbar(true);
  };

  const indexOfLastQuestion = (currentPage + 1) * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = quizData.slice(indexOfFirstQuestion, indexOfLastQuestion);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Quiz Generator
      </Typography>

      {!quizData.length ? (
        <div>
          {/* Centered Upload PDF Button */}
          <div className="center-button">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="upload-pdf"
            />
            <label htmlFor="upload-pdf">
              <Button variant="contained" component="span">
                Upload PDF
              </Button>
            </label>
          </div>

          <Typography variant="body1" gutterBottom align="center" style={{ margin: '20px 0' }}>
            Or paste text below:
          </Typography>

          <TextField
            multiline
            rows={6}
            variant="outlined"
            fullWidth
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text here..."
          />

          <TextField
            label="Number of Questions"
            type="number"
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            InputProps={{ inputProps: { min: 1, max: 20 } }}
            style={{ marginTop: '20px' }}
            fullWidth
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateQuiz}
            disabled={loading}
            style={{ marginTop: '20px' }}
            fullWidth
          >
            {loading ? 'Generating Quiz...' : 'Generate Quiz'}
          </Button>

          {loading && (
            <div className="loading-spinner">
              <CircularProgress />
            </div>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      ) : (
        <div>
          {currentQuestions.map((question) => {
            const userAnswer = userAnswers[question.question_number];
            return (
              <div key={question.question_number}>
                <Typography variant="h6">
                  {question.question_number}. {question.question}
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={userAnswer || ''}
                    onChange={(e) =>
                      handleAnswerChange(question.question_number, e.target.value)
                    }
                  >
                    {question.options.map((option, index) => {
                      let optionClass = '';
                      if (isSubmitted) {
                        if (option === question.answer) {
                          optionClass = 'correct';
                        } else if (option === userAnswer && option !== question.answer) {
                          optionClass = 'incorrect';
                        }
                      }

                      return (
                        <FormControlLabel
                          key={index}
                          value={option}
                          control={<Radio disabled={isSubmitted} />}
                          label={option}
                          className={`option ${optionClass}`}
                        />
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                {isSubmitted && (
                  <div
                    className={`feedback ${
                      userAnswer === question.answer ? 'correct' : 'incorrect'
                    }`}
                  >
                    <Typography variant="body1">
                      {userAnswer === question.answer
                        ? 'Correct!'
                        : `Incorrect! The correct answer is: ${question.answer}`}
                    </Typography>
                    <Typography variant="body2" className="explanation">
                      Explanation: {question.explanation}
                    </Typography>
                  </div>
                )}
                <hr />
              </div>
            );
          })}

          {/* Pagination Controls */}
          <div className="pagination">
            <Button
              variant="contained"
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Typography variant="body1" style={{ margin: '0 10px' }}>
              Page {currentPage + 1} of {Math.ceil(quizData.length / questionsPerPage)}
            </Typography>
            <Button
              variant="contained"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={indexOfLastQuestion >= quizData.length}
            >
              Next
            </Button>
          </div>

          {!isSubmitted ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitQuiz}
              style={{ marginTop: '20px' }}
              fullWidth
            >
              Submit Quiz
            </Button>
          ) : (
            <div>
              <Typography variant="h6" align="center" style={{ marginTop: '20px' }}>
                Your score: {score} out of {quizData.length}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleResetQuiz}
                style={{ marginTop: '20px' }}
                fullWidth
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Snackbar for Acknowledgments */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
