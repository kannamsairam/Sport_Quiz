const express = require('express');
const router = express.Router();

const Quiz = require('../models/Quiz');
const { error } = require('console');
//const Game = require('../models/Game');

//const authenticateUser = require('../middleware/authenticateUser');
const QuizTimer = require('../utils/timer');

const scores = require('../models/score');

let score = 0;
//const userTimers = {};

// Timer instance for each quiz session
const activeTimers = {};

// Add questions and answers for a specific sport
router.post("/quiz/add", async (req, res) => {
  const { sport, questions } = req.body;

  if (!sport || !questions || questions.length === 0) {
    return res
      .status(400)
      .json({ error: "Sport and a non-empty questions array are required." });
  }

  try {
    // Find existing sport quiz or create a new one
    let quiz = await Quiz.findOne({ sport });

    if (!quiz) {
      quiz = new Quiz({ sport, questions });
    } else {
      quiz.questions.push(...questions);
    }

    await quiz.save();
    res.json({ message: "Questions added successfully.", quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add questions." });
  }
});

// Get all sports
router.get('/sports', async (req, res) => {
    try {
        const sports = await Quiz.find().select("sport -_id");
        res.json(sports.map((s) => s.sport));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sports' });
    }
});


// Start Quiz with a Timer
router.post('/quiz/:sport/start', async (req, res) => {
    const { sport } = req.params;

    try {
        // Initialize a timer for the session
        const sessionId = new Date().getTime().toString(); // Generate a unique session ID
        activeTimers[sessionId] = new QuizTimer();

        // Fetch quiz questions for the specified sport
        const quiz = await Quiz.findOne({ sport });
        if (!quiz) {
            return res.status(404).json({ error: "Sport not found" });
        }

        // Randomly select 5 questions for the quiz
        const questions = quiz.questions.sort(() => 0.5 - Math.random()).slice(0, 5);

        // Start the timer for the first question
        activeTimers[sessionId].startQuestion();

        res.json({ sessionId, questions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit Answer with Timer
// router.post('/quiz/:sport/answer', async (req, res) => {
//     const { sessionId, questionId, answer } = req.body;

//     //let sc = scores.score;

//     try {
//         const timer = activeTimers[sessionId];
//         if (!timer || !timer.hasTimeRemaining()) {
//             return res.status(403).json({ error: "No time left for the quiz" });
//         }

//         const rolloverTime = timer.stopQuestion();

//         const quiz = await Quiz.findOne({ "questions._id": questionId });
//         if (!quiz) {
//             return res.status(404).json({ error: "Question not found" });
//         }

//         const question = quiz.questions.id(questionId);
//         const isCorrect = question.answer === answer;
//         // if(isCorrect) {
//         //     // score += 1;
//         //     // //await scores.save(score);
//         //     // await scores.push(score);

//         //     await scores.findOneAndUpdate(
//         //         { sessionId },
//         //         { $inc: { score: 1 } }
//         //     );
//         // }

//         const sessionScore = await scores.findOneAndUpdate(
//             { sessionId },
//             { $inc: { score: isCorrect ? 1 : 0 } },
//             { upsert: true, new: true, setDefaultsOnInsert: true }
//         );

//         console.log('isCorrect:', isCorrect);
//         console.log('Score is:', sessionScore.score);
        
//         if (timer.hasTimeRemaining()) {
//             timer.startQuestion();
//         }

//         //const updatedScore = await scores.findOne({sessionId});

//         res.json({
//             isCorrect,
//             score: sessionScore.score,
//             remainingTime: timer.getRemainingTime(),
//             rolloverTime
//             });

//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

router.post('/quiz/:sport/answer', async (req, res) => {
    const { sessionId, answers } = req.body; // Expect multiple answers

    try {
        const timer = activeTimers[sessionId];
        if (!timer || !timer.hasTimeRemaining()) {
            return res.status(403).json({ error: "No time left for the quiz" });
        }

        const results = [];
        let totalScore = 0;

        for (const { questionId, answer } of answers) {
            const quiz = await Quiz.findOne({ "questions._id": questionId });
            if (!quiz) {
                results.push({ questionId, isCorrect: false, error: "Question not found", correctAnswer: null, question: null });
                continue;
            }

            const question = quiz.questions.id(questionId);
            const isCorrect = question.answer === answer;

            const sessionScore = await scores.findOneAndUpdate(
                { sessionId },
                { $inc: { score: isCorrect ? 1 : 0 } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            totalScore = sessionScore.score; // Keep the latest score
            results.push({ questionId, isCorrect, question: question, userAnswer: answer || null, correctAnswer: question.answer });
        }

        if (timer.hasTimeRemaining()) {
            timer.startQuestion();
        }

        res.json({
            results, // Individual correctness for each answer
            score: totalScore, // Total score
            remainingTime: timer.getRemainingTime(),
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// router.get('/getScore', async (req, res) => {
//     res.json(`Your current score is ${score}`);
// });


router.get('/quiz/:sessionId/score', async (req, res) => {
    const { sessionId } = req.params;

    try {
        const scoreDoc = await scores.findOne({ sessionId });
        if (!scoreDoc) {
            return res.status(404).json({ error: "Score not found" });
        }

        res.json({ score: scoreDoc.score });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// router.post('/quiz/:sport/start', async (req, res) => {
//     const { sport } = req.params;
//     //const userId = req.user.id;

//     try {
//         // Initialize a timer for the user
//         //userTimers[userId] = new QuizTimer();

//         // Fetch quiz questions for the specified sport
//         const quiz = await Quiz.findOne({ sport });
//         if (!quiz) {
//             return res.status(404).json({ error: "Sport not found" });
//         }

//         // Randomly select 5 questions for the quiz
//         const questions = quiz.questions.sort(() => 0.5 - Math.random()).slice(0, 5);

//         // Start the timer for the first question
//         userTimers[userId].startQuestion();

//         res.json({ questions });
//         // Fetch quiz data (e.g., random questions)
//         // Quiz.findOne({ sport }).then(quiz => {
//         //     if (!quiz) return res.status(404).json({ error: "Sport not found" });

//         //     const questions = quiz.questions.sort(() => 0.5 - Math.random()).slice(0, 5);
//         //     res.json({ questions });
        
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// //with timer and authentication
// router.post('/quiz/:sport/start', authenticateUser, async (req, res) => {
//     const { sport } = req.params;
//     const userId = req.user.id;

//     try {
//         // Initialize a timer for the user
//         userTimers[userId] = new QuizTimer();

//         // Fetch quiz questions for the specified sport
//         const quiz = await Quiz.findOne({ sport });
//         if (!quiz) {
//             return res.status(404).json({ error: "Sport not found" });
//         }

//         // Randomly select 5 questions for the quiz
//         const questions = quiz.questions.sort(() => 0.5 - Math.random()).slice(0, 5);

//         // Start the timer for the first question
//         userTimers[userId].startQuestion();

//         res.json({ questions });
//         // Fetch quiz data (e.g., random questions)
//         // Quiz.findOne({ sport }).then(quiz => {
//         //     if (!quiz) return res.status(404).json({ error: "Sport not found" });

//         //     const questions = quiz.questions.sort(() => 0.5 - Math.random()).slice(0, 5);
//         //     res.json({ questions });
        
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

//without timer
// Start Quiz
// router.post('/quiz/:sport/start', authenticateUser, async (req, res) => {
//     const { sport } = req.params;
//     const { username } = req.user;

//     try {
//         const quiz = await Quiz.findOne({ sport });
//         if (!quiz) return res.status(404).json({ error: "Sport not found" });

//         // Fetch 5 random questions
//         const questions = quiz.questions.sort(() => 0.5 - Math.random()).slice(0, 5);

//         res.json({ questions });
//     } catch (error) {
//         res.status(500).json({ error: "Failed to fetch quiz" });
//     }
// });

// //with timer and authentication
// router.post('/quiz/:sport/answer', authenticateUser, async (req, res) => {
//     const { questionId, answer } = req.body;
//     const userId = req.user.id;

//     try {
//         const timer = userTimers[userId];
//         if (!timer || !timer.hasTimeRemaining()) {
//             return res.status(403).json({ error: "No time left for the quiz" });
//         }

//         const rolloverTime = timer.stopQuestion();

//         // Validate the answer
//         const quiz = await Quiz.findOne({ "questions._id": questionId });
//         if (!quiz) {
//             return res.status(404).json({ error: "Question not found" });
//         }

//         const question = quiz.questions.id(questionId);
//         const isCorrect = question.answer === answer;

//         // Start timer for the next question
//         if (timer.hasTimeRemaining()) {
//             timer.startQuestion();
//         }

//         res.json({
//             isCorrect,
//             remainingTime: timer.getRemainingTime(),
//             rolloverTime,
//         });

//         // Validate the answer (example logic)
//         // Quiz.findOne({ "questions._id": questionId }).then(quiz => {
//         //     const question = quiz.questions.id(questionId);
//         //     if (!question) return res.status(404).json({ error: "Question not found" });

//         //     const isCorrect = question.answer === answer;

//         //     // Start timer for the next question
//         //     if (timer.hasTimeRemaining()) {
//         //         timer.startQuestion();
//         //     }

//         //     res.json({ isCorrect, remainingTime: timer.getRemainingTime(), rolloverTime });
//         // });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

//without timer
// Submit Answer
// router.post('/quiz/:sport/submit', authenticateUser, async (req, res) => {
//     const { sport } = req.params;
//     const { questionId, answer } = req.body;
//     const { username } = req.user;

//     try {
//         const quiz = await Quiz.findOne({ sport });
//         if (!quiz) return res.status(404).json({ error: "Sport not found" });

//         const question = quiz.questions.id(questionId);
//         if (!question) return res.status(404).json({ error: "Question not found" });

//         const isCorrect = question.answer === answer;
//         res.json({ isCorrect });
//     } catch (error) {
//         res.status(500).json({ error: "Submission failed" });
//     }
// });

// try {
//     // Find user's previous game data, or create new entry if not found
//     let userGame = await UserGameScore.findOne({ userId, sport });

//     if (!userGame) {
//         userGame = new UserGameScore({ userId, sport, score: 0, answeredQuestions: [] });
//         await userGame.save();
//     }

//     const quiz = await Quiz.findOne({ sport });

//     if (!quiz) return res.status(404).json({ error: 'Sport not found' });

//     // Get random questions, excluding the ones that have already been answered by the user
//     const availableQuestions = quiz.questions.filter((_, index) => !userGame.answeredQuestions.includes(index));

//     // If there are no more questions to ask, return a message
//     if (availableQuestions.length === 0) {
//         return res.status(400).json({ message: 'No more questions available' });
//     }

//     // Select a random question from the available ones
//     const randomIndex = Math.floor(Math.random() * availableQuestions.length);
//     const selectedQuestion = availableQuestions[randomIndex];

//     // Return the selected question
//     res.json({ question: selectedQuestion, index: quiz.questions.indexOf(selectedQuestion) });
// } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch quiz' });
// }
// Get questions for a specific sport
// router.get('/quiz/:sport', async (req, res) => {
//     const { sport } = req.params;
//     try {
//         const quiz = await Quiz.findOne({ sport });
//         if(!quiz) return res.status(404).json({ error: 'Sport not found' });
//         res.json(quiz.questions);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to fetch quiz' });
//     }
// });

// router.post('/quiz/:sport/answer', async (req, res) => {
//     const { sport } = req.params;
//     const { questionIndex, selectedOption } = req.body;
//     try {
//         const quiz = await Quiz.findOne({ sport });
//         if(!quiz) return res.status(404).json({ error: 'Sport not found' });

//         const question = quiz.questions[questionIndex];
//         if(!question) return res.status(404).json({ error: 'Question not found' });

//         const isCorrect = question.answer === selectedOption;
//         res.json({ isCorrect, correctAnswer: question.answer });
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to verify answer' });
//     }
// });

module.exports = router;