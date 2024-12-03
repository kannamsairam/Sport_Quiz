import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getQuestions, submitAnswers } from '../services/api';

const Quiz = () => {
    const { sport } = useParams(); // Get the sport parameter from the URL
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [score, setScore] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timers, setTimers] = useState([]); // Array to store timer values for each question
    const [overallTime, setOverallTime] = useState(150); // Overall time for the quiz (150 seconds)
    const [quizFinished, setQuizFinished] = useState(false); // To check if quiz has finished
    const [scoreMessage, setScoreMessage] = useState(''); // To store the score message

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const data = await getQuestions(sport); // Fetch questions dynamically based on the sport
                setQuestions(data.questions);
                setSessionId(data.sessionId);
                setUserAnswers(new Array(data.questions.length).fill(null));
                setTimers(new Array(data.questions.length).fill(30)); // Initialize timers for each question to 30 seconds
            } catch (error) {
                console.error("Failed to fetch questions:", error);
            }
        };
        fetchQuestions();
    }, [sport]); // Fetch questions whenever the sport changes

    useEffect(() => {
        if (questions.length > 0 && overallTime > 0) {
            // Start the overall timer countdown
            const overallTimerInterval = setInterval(() => {
                setOverallTime((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(overallTimerInterval);
                        handleSubmit(); // Submit quiz when overall time reaches 0
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => clearInterval(overallTimerInterval); // Cleanup interval on unmount
        }
    }, [questions.length, overallTime]);

    useEffect(() => {
        if (questions.length > 0 && timers[currentIndex] > 0) {
            // Start individual question timer countdown
            const countdown = setInterval(() => {
                setTimers((prevTimers) => {
                    const updatedTimers = [...prevTimers];
                    updatedTimers[currentIndex] -= 1;
                    if (updatedTimers[currentIndex] <= 0) {
                        clearInterval(countdown);
                        goToNext(); // Move to next question when time for this question is up
                    }
                    return updatedTimers;
                });
            }, 1000);

            return () => clearInterval(countdown);
        }
    }, [currentIndex, questions.length, timers]);

    const handleSubmit = async () => {
        const answersToSubmit = userAnswers.map((answer, index) => ({
            questionId: questions[index]._id,
            answer,
        }));

        try {
            const response = await fetch(`http://localhost:5000/api/quiz/${sport}/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId, answers: answersToSubmit }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit answers");
            }

            const { results, score } = await response.json();
            setScore(score);
            setUserAnswers(results);

            // Set the score message based on the score
            setScoreMessage(getScoreMessage(score));

            alert(`Your score is: ${score}`);
        } catch (error) {
            console.error("Failed to submit answers:", error);
            alert("Failed to submit answers. Please try again.");
        }
    };

    // Function to get a message based on the score
    const getScoreMessage = (score) => {
        if (score === 100) {
            return "Excellent! Perfect score!";
        } else if (score >= 80) {
            return "Great job! Keep it up!";
        } else if (score >= 60) {
            return "Good job! You can do even better!";
        } else {
            return "Better luck next time!";
        }
    };

    const handleAnswerChange = (index, answer) => {
        const updatedAnswers = [...userAnswers];
        updatedAnswers[index] = answer;
        setUserAnswers(updatedAnswers);
    };

    const goToNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const goToQuestion = (index) => {
        setCurrentIndex(index); // Navigate to the specific question
    };

    if (quizFinished || score !== null) {
        return (
            <div>
                <h2>Your Score: {score}</h2>
                <p>{scoreMessage}</p>
            </div>
        );
    }

    return (
        <div>
            <h1>{sport.charAt(0).toUpperCase() + sport.slice(1)} Quiz</h1>

            {/* Display Overall Timer */}
            <p>Overall Time Remaining: {overallTime} seconds</p>

            {questions.length > 0 && (
                <div>
                    {/* Display Question Number and Timer */}
                    <p>Question {currentIndex + 1} of {questions.length}</p>
                    <p>Time Left: {timers[currentIndex]} seconds</p>

                    <p>{questions[currentIndex].question}</p>

                    {/* Display options as buttons */}
                    <div>
                        {questions[currentIndex].options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswerChange(currentIndex, option)} 
                                style={{
                                    backgroundColor: userAnswers[currentIndex] === option ? 'lightblue' : 'white',
                                    border: '1px solid #ccc',
                                    padding: '10px',
                                    margin: '5px',
                                    cursor: 'pointer',
                                    width: '10%'
                                }}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    <div>
                        <button onClick={goToPrevious} disabled={currentIndex === 0}>Prev</button>

                        {/* Only show the Next button if not on the last question */}
                        {currentIndex < questions.length - 1 && (
                            <button onClick={goToNext}>Next</button>
                        )}
                    </div>

                    {/* Display question numbers as clickable buttons */}
                    <div>
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToQuestion(index)}
                                style={{
                                    margin: '5px',
                                    backgroundColor: currentIndex === index ? 'lightblue' : 'white',
                                    border: '1px solid #ccc',
                                    padding: '10px',
                                    cursor: 'pointer',
                                }}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Only show the Submit button on the last question */}
            {currentIndex === questions.length - 1 && (
                <button onClick={handleSubmit}>Submit</button>
            )}
        </div>
    );
};

export default Quiz;
