class QuizTimer {
    constructor(totalTime = 150, questionTime = 30) {
        this.totalTime = totalTime; // Total time for the quiz in seconds
        this.remainingTime = totalTime; // Remaining time for the quiz
        this.questionTime = questionTime; // Time allocated per question
        this.startTime = null; // Start time of the current question
    }

    // Start the timer for the current question
    startQuestion() {
        if (this.remainingTime <= 0) {
            throw new Error("No time left for the quiz");
        }
        this.startTime = Date.now();
    }

    // Stop the timer for the current question and calculate the rollover time
    stopQuestion() {
        if (!this.startTime) {
            throw new Error("Timer has not started");
        }

        const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        const timeUsed = Math.min(elapsedTime, this.questionTime);

        this.remainingTime -= timeUsed;

        // Reset start time
        this.startTime = null;

        // Return the remaining time for this question
        return this.questionTime - timeUsed;
    }

    // Check if there's enough time for the quiz
    hasTimeRemaining() {
        return this.remainingTime > 0;
    }

    // Get the remaining time for the quiz
    getRemainingTime() {
        return this.remainingTime;
    }
}

module.exports = QuizTimer;