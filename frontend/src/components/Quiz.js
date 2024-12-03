import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getQuestions } from '../services/api';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import styles from './Quiz.module.scss';
import {useNavigate} from 'react-router-dom';

const Quiz = () => {
    const navigate = useNavigate();
    const { sport } = useParams();
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [score, setScore] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [overallTime, setOverallTime] = useState(150); // Overall time for the quiz
    const [timers, setTimers] = useState([]); // Individual question timers
    const [quizFinished, setQuizFinished] = useState(false);
    const [scoreMessage, setScoreMessage] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const data = await getQuestions(sport);
                setQuestions(data.questions);
                setSessionId(data.sessionId);
                setUserAnswers(new Array(data.questions.length).fill(null));
                setTimers(new Array(data.questions.length).fill(30)); // Each question gets 30 seconds
            } catch (error) {
                console.error('Failed to fetch questions:', error);
            }
        };
        fetchQuestions();
    }, [sport]);

    useEffect(() => {
        if (questions.length > 0 && overallTime > 0) {
            const overallTimerInterval = setInterval(() => {
                setOverallTime((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(overallTimerInterval);
                        handleSubmit();
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => clearInterval(overallTimerInterval);
        }
    }, [questions.length, overallTime]);

    useEffect(() => {
        if (questions.length > 0 && timers[currentIndex] > 0) {
            const questionTimerInterval = setInterval(() => {
                setTimers((prevTimers) => {
                    const updatedTimers = [...prevTimers];
                    updatedTimers[currentIndex] -= 1;
                    if (updatedTimers[currentIndex] <= 0) {
                        clearInterval(questionTimerInterval);
                        goToNext(); // Automatically move to the next question when timer runs out
                    }
                    return updatedTimers;
                });
            }, 1000);

            return () => clearInterval(questionTimerInterval);
        }
    }, [currentIndex, questions.length, timers]);

    const handleSubmit = async () => {
        const answersToSubmit = userAnswers.map((answer, index) => ({
            questionId: questions[index]._id,
            answer,
        }));

        try {
            const response = await fetch(`https://render.com/docs/web-services#port-binding/api/quiz/${sport}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, answers: answersToSubmit }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit answers');
            }

            const { results, score } = await response.json();
            setScore(score);
            setResults(results);
            setQuizFinished(true);
            setScoreMessage(getScoreMessage(score));
        } catch (error) {
            console.error('Failed to submit answers:', error);
            alert('Failed to submit answers. Please try again.');
        }
    };

    const getScoreMessage = (score) => {
        if (score === 5) return 'Excellent! Perfect score!';
        if (score ==4) return 'Great job! Keep it up!';
        if (score ==3) return 'Good job! You can do even better!';
        return 'Better luck next time!';
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
        setCurrentIndex(index);
    };

    const handleBack = () => {
        navigate('/');
      }

    return (
        <div className={styles.quizContainer}>
            <aside className={styles.sidebar}>
                <h1>{sport.charAt(0).toUpperCase() + sport.slice(1)} Quiz</h1>

                {quizFinished ? (
                    <div className={styles.quizSummary}>
                        <h2>Your Score: {score}</h2>
                        <p>{scoreMessage}</p>
                        <h3>Quiz Summary</h3>
                        {questions.map((question, index) => {
                            const userAnswer = results[index]?.userAnswer || 'No answer';
                            const correctAnswer = results[index]?.correctAnswer || 'N/A';
                            return (
                                <div key={index} className={styles.questionSummary}>
                                    <p>
                                        <strong>Question {index + 1}:</strong> <strong>{question.question}</strong>
                                    </p>
                                    <p>
                                        <strong>Your Answer:</strong>{' '}
                                        <span
                                            style={{
                                                color: userAnswer === correctAnswer ? 'green' : 'red',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {userAnswer}
                                        </span>
                                    </p>
                                    {userAnswer !== correctAnswer && (
                                        <p>
                                            <strong>Correct Answer:</strong> {correctAnswer}
                                        </p>
                                    )}
                                </div>
                                
                            );
                        })}
                        <div><button className={styles.submitButton1} onClick={handleBack}>
                            Back Home
                        </button></div>
                    </div>
                ) : (
                    <div>
                        {questions.length > 0 && (
                            <div className={styles.questionDetails}>
                                <p className={styles.timer}>Overall Time Remaining: {overallTime} seconds</p>

                                <h3>Question {currentIndex + 1}</h3>

                                {/* Circular Timer */}
                                <div className={styles.circularTimer}>
                                    <CircularProgressbar
                                        value={(timers[currentIndex] / 30) * 100}
                                        text={`${timers[currentIndex]}s`}
                                        styles={buildStyles({
                                            pathColor: timers[currentIndex] <= 10 ? 'red' : '#1bae27',
                                            textColor: timers[currentIndex] <= 10 ? 'red' : '#f5f5f5',
                                            trailColor: '#d6d6d6',
                                        })}
                                    />
                                </div>

                                <p>Time Remaining: {timers[currentIndex]} seconds</p>
                                <h3>{questions[currentIndex].question}</h3>
                                <div className={styles.options}>
                                    {questions[currentIndex].options.map((option, idx) => (
                                        <button
                                            key={idx}
                                            className={`${styles.optionButton} ${
                                                userAnswers[currentIndex] === option
                                                    ? styles.selected
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                handleAnswerChange(currentIndex, option)
                                            }
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation and Submit buttons */}
                {!quizFinished && (
                    <div className={styles.navigationButtons}>
                        <button
                            onClick={goToPrevious}
                            disabled={currentIndex === 0}
                            className={styles.prevButton}
                        >
                            Prev
                        </button>
                        {currentIndex < questions.length - 1 ? (
                            <button onClick={goToNext} className={styles.nextButton}>
                                Next
                            </button>
                        ) : (
                            <button onClick={handleSubmit} className={styles.submitButton}>
                                Submit
                            </button>
                        )}
                    </div>
                )}

                {/* Question navigation buttons */}
                {!quizFinished && (
                    <div className={styles.questionNavigation}>
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                className={`${styles.navButton} ${
                                    currentIndex === index ? styles.activeButton : ''
                                }`}
                                onClick={() => goToQuestion(index)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                )}
            </aside>

            <main className={styles.quizMain}></main>
        </div>
    );
};

export default Quiz;



// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { getQuestions } from '../services/api';
// import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
// import 'react-circular-progressbar/dist/styles.css';
// import styles from './Quiz.module.scss';

// const Quiz = () => {
//     const { sport } = useParams();
//     const [questions, setQuestions] = useState([]);
//     const [userAnswers, setUserAnswers] = useState([]);
//     const [score, setScore] = useState(null);
//     const [sessionId, setSessionId] = useState(null);
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const [overallTime, setOverallTime] = useState(150); // Overall time for the quiz
//     const [timers, setTimers] = useState([]); // Individual question timers
//     const [quizFinished, setQuizFinished] = useState(false);
//     const [scoreMessage, setScoreMessage] = useState('');
//     const [results, setResults] = useState([]);

//     useEffect(() => {
//         const fetchQuestions = async () => {
//             try {
//                 const data = await getQuestions(sport);
//                 setQuestions(data.questions);
//                 setSessionId(data.sessionId);
//                 setUserAnswers(new Array(data.questions.length).fill(null));
//                 setTimers(new Array(data.questions.length).fill(30)); // Each question gets 30 seconds
//             } catch (error) {
//                 console.error('Failed to fetch questions:', error);
//             }
//         };
//         fetchQuestions();
//     }, [sport]);

//     useEffect(() => {
//         if (questions.length > 0 && overallTime > 0) {
//             const overallTimerInterval = setInterval(() => {
//                 setOverallTime((prevTime) => {
//                     if (prevTime <= 1) {
//                         clearInterval(overallTimerInterval);
//                         handleSubmit();
//                     }
//                     return prevTime - 1;
//                 });
//             }, 1000);

//             return () => clearInterval(overallTimerInterval);
//         }
//     }, [questions.length, overallTime]);

//     useEffect(() => {
//         if (questions.length > 0 && timers[currentIndex] > 0) {
//             const questionTimerInterval = setInterval(() => {
//                 setTimers((prevTimers) => {
//                     const updatedTimers = [...prevTimers];
//                     updatedTimers[currentIndex] -= 1;
//                     if (updatedTimers[currentIndex] <= 0) {
//                         clearInterval(questionTimerInterval);
//                         goToNext(); // Automatically move to the next question when timer runs out
//                     }
//                     return updatedTimers;
//                 });
//             }, 1000);

//             return () => clearInterval(questionTimerInterval);
//         }
//     }, [currentIndex, questions.length, timers]);

//     const handleSubmit = async () => {
//         const answersToSubmit = userAnswers.map((answer, index) => ({
//             questionId: questions[index]._id,
//             answer,
//         }));

//         try {
//             const response = await fetch(`http://localhost:5000/api/quiz/${sport}/answer`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ sessionId, answers: answersToSubmit }),
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to submit answers');
//             }

//             const { results, score } = await response.json();
//             setScore(score);
//             setResults(results);
//             setQuizFinished(true);
//             setScoreMessage(getScoreMessage(score));
//         } catch (error) {
//             console.error('Failed to submit answers:', error);
//             alert('Failed to submit answers. Please try again.');
//         }
//     };

//     const getScoreMessage = (score) => {
//         if (score === 5) return 'Excellent! Perfect score!';
//         if (score ==4) return 'Great job! Keep it up!';
//         if (score ==3) return 'Good job! You can do even better!';
//         return 'Better luck next time!';
//     };

//     const handleAnswerChange = (index, answer) => {
//         const updatedAnswers = [...userAnswers];
//         updatedAnswers[index] = answer;
//         setUserAnswers(updatedAnswers);
//     };

//     const goToNext = () => {
//         if (currentIndex < questions.length - 1) {
//             setCurrentIndex(currentIndex + 1);
//         }
//     };

//     const goToPrevious = () => {
//         if (currentIndex > 0) {
//             setCurrentIndex(currentIndex - 1);
//         }
//     };

//     const goToQuestion = (index) => {
//         setCurrentIndex(index);
//     };

//     return (
//         <div className={styles.quizContainer}>
//             <aside className={styles.sidebar}>
//                 <h1>{sport.charAt(0).toUpperCase() + sport.slice(1)} Quiz</h1>

//                 {quizFinished ? (
//                     <div className={styles.quizSummary}>
//                         <h2>Your Score: {score}</h2>
//                         <p>{scoreMessage}</p>
//                         <h3>Quiz Summary</h3>
//                         {questions.map((question, index) => {
//                             const userAnswer = results[index]?.userAnswer || 'No answer';
//                             const correctAnswer = results[index]?.correctAnswer || 'N/A';
//                             return (
//                                 <div key={index} className={styles.questionSummary}>
//                                     <p>
//                                         <strong>Question {index + 1}:</strong> <strong>{question.question}</strong>
//                                     </p>
//                                     <p>
//                                         <strong>Your Answer:</strong>{' '}
//                                         <span
//                                             style={{
//                                                 color: userAnswer === correctAnswer ? 'green' : 'red',
//                                                 fontWeight: 'bold',
//                                             }}
//                                         >
//                                             {userAnswer}
//                                         </span>
//                                     </p>
//                                     {userAnswer !== correctAnswer && (
//                                         <p>
//                                             <strong>Correct Answer:</strong> {correctAnswer}
//                                         </p>
//                                     )}
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 ) : (
//                     <div>
//                         {questions.length > 0 && (
//                             <div className={styles.questionDetails}>
//                                 <p className={styles.timer}>Overall Time Remaining: {overallTime} seconds</p>

//                                 <h3>Question {currentIndex + 1}</h3>

//                                 {/* Circular Timer */}
//                                 <div className={styles.circularTimer}>
//                                     <CircularProgressbar
//                                         value={(timers[currentIndex] / 30) * 100}
//                                         text={`${timers[currentIndex]}s`}
//                                         styles={buildStyles({
//                                             pathColor: timers[currentIndex] <= 10 ? 'red' : '#1bae27',
//                                             textColor: timers[currentIndex] <= 10 ? 'red' : '#f5f5f5',
//                                             trailColor: '#d6d6d6',
//                                         })}
//                                     />
//                                 </div>

//                                 <p>Time Remaining: {timers[currentIndex]} seconds</p>
//                                 <h3>{questions[currentIndex].question}</h3>
//                                 <div className={styles.options}>
//                                     {questions[currentIndex].options.map((option, idx) => (
//                                         <button
//                                             key={idx}
//                                             className={`${styles.optionButton} ${
//                                                 userAnswers[currentIndex] === option
//                                                     ? styles.selected
//                                                     : ''
//                                             }`}
//                                             onClick={() =>
//                                                 handleAnswerChange(currentIndex, option)
//                                             }
//                                         >
//                                             {option}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Navigation and Submit buttons */}
//                 {!quizFinished && (
//                     <div className={styles.navigationButtons}>
//                         <button
//                             onClick={goToPrevious}
//                             disabled={currentIndex === 0}
//                             className={styles.prevButton}
//                         >
//                             Prev
//                         </button>
//                         {currentIndex < questions.length - 1 ? (
//                             <button onClick={goToNext} className={styles.nextButton}>
//                                 Next
//                             </button>
//                         ) : (
//                             <button onClick={handleSubmit} className={styles.submitButton}>
//                                 Submit
//                             </button>
//                         )}
//                     </div>
//                 )}

//                 {/* Question navigation buttons */}
//                 {!quizFinished && (
//                     <div className={styles.questionNavigation}>
//                         {questions.map((_, index) => (
//                             <button
//                                 key={index}
//                                 className={`${styles.navButton} ${
//                                     currentIndex === index ? styles.activeButton : ''
//                                 }`}
//                                 onClick={() => goToQuestion(index)}
//                             >
//                                 {index + 1}
//                             </button>
//                         ))}
//                     </div>
//                 )}
//             </aside>

//             <main className={styles.quizMain}></main>
//         </div>
//     );
// };

// export default Quiz;
