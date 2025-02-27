document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-timer');
    const restartButton = document.getElementById('restart-timer');
    const timerDisplay = document.getElementById('timer');
    const circleContainer = document.getElementById('circle-container');
    let timeLeft = 20 * 60;
    let timerInterval;
    let circles = [];
    let timerRunning = false;
    let timerPaused = false;

    function createCircles() {
        for (let i = 0; i < 20; i++) {
            const circle = document.createElement('div');
            circle.classList.add('circle');
            circleContainer.appendChild(circle);
            circles.push(circle);
        }
    }

    createCircles(); // Create circles on page load
    updateCircles(0); // Initialize circles to be empty on page load

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function announceMinute(minutesLeft) {
        if (minutesLeft > 0) {
            const announcement = new SpeechSynthesisUtterance(`Zbývá ${minutesLeft} minut`);
            speechSynthesis.speak(announcement);
        } else {
            const announcement = new SpeechSynthesisUtterance("Čas vypršel!");
            speechSynthesis.speak(announcement);
        }
    }

    function updateCircles(minutesElapsed) {
        circles.forEach((circle, index) => {
            if (index < minutesElapsed) {
                circle.classList.add('active');
            } else {
                circle.classList.remove('active');
            }
        });
    }

    function startTimer() {
        if (timerRunning) return;
        timerRunning = true;
        timerPaused = false;
        startButton.textContent = 'Pozastavit';
        restartButton.style.display = 'none';
        timeLeft = 20 * 60;
        updateTimerDisplay();
        updateCircles(1); // Initialize with 1 active circle on start


        timerInterval = setInterval(() => {
            if (!timerPaused) {
                timeLeft--;
                updateTimerDisplay();

                const minutesLeft = Math.ceil(timeLeft / 60);

                if (timeLeft % 60 === 0 && timeLeft > 0) {
                announceMinute(minutesLeft - 1);
                updateCircles(20 - minutesLeft + 1); // Update circles with elapsed minutes
            }

                if (timeLeft < 0) {
                    clearInterval(timerInterval);
                    timerDisplay.textContent = '00:00';
                    announceMinute(0);
                    startButton.textContent = 'Spustit Timer';
                    restartButton.style.display = 'none';
                    timerRunning = false;
                }
            }
        }, 1000);
    }

    function pauseTimer() {
        timerPaused = true;
        startButton.textContent = 'Pokračovat';
        restartButton.style.display = 'inline-block';
        clearInterval(timerInterval);
    }

    function resumeTimer() {
        timerPaused = false;
        startButton.textContent = 'Pozastavit';
        restartButton.style.display = 'none';
        timerInterval = setInterval(() => {
            if (!timerPaused) {
                timeLeft--;
                updateTimerDisplay();

                const minutesLeft = Math.ceil(timeLeft / 60);

                if (timeLeft % 60 === 0 && timeLeft > 0) {
                    announceMinute(minutesLeft - 1);
                    updateCircles(20 - minutesLeft + 1);
                }

                if (timeLeft < 0) {
                    clearInterval(timerInterval);
                    timerDisplay.textContent = '00:00';
                    announceMinute(0);
                    startButton.textContent = 'Spustit Timer';
                    restartButton.style.display = 'none';
                    timerRunning = false;
                }
            }
        }, 1000);
    }

    function restartTimer() {
        timerRunning = false;
        timerPaused = false;
        startButton.textContent = 'Spustit Timer';
        restartButton.style.display = 'none';
        clearInterval(timerInterval);
        timeLeft = 20 * 60;
        updateTimerDisplay();
        updateCircles(0); // Initialize with 0 active circles on restart
    }



    startButton.addEventListener('click', () => {
        if (!timerRunning || timerPaused) {
            if (timerPaused) {
                resumeTimer();
            } else {
                startTimer();
            }
        } else {
            pauseTimer();
        }
    });

    restartButton.addEventListener('click', restartTimer);
});
