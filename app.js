document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-timer");
  const restartButton = document.getElementById("restart-timer");
  const resetProgressButton = document.getElementById("reset-progress");
  const timerDisplay = document.getElementById("timer");
  const circleContainer = document.getElementById("circle-container");
  let timeLeft = 20 * 60;
  let timerInterval;
  let circles = [];
  let timerRunning = false;
  let timerPaused = false;
  let recordCounter = 0;

  function createCircles() {
    for (let i = 0; i < 20; i++) {
      const circle = document.createElement("div");
      circle.classList.add("circle");
      circleContainer.appendChild(circle);
      circles.push(circle);
    }
  }

  createCircles();
  updateCircles(0);

  function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }

  function announceMinute(minutesLeft, frequency = 440) {
    // Default frequency to 440 for minutes beeps
    if (timeLeft <= 20 * 60 && timeLeft > 0) {
      // corrected condition - beep always when timeLeft > 0 and within 20 min
      // Play beep sound
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  }

  function playFanfare() {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const frequencies = [523, 659, 784, 880, 988, 1047, 880, 988, 1047, 1047]; // Example fanfare frequencies
    let startTime = audioContext.currentTime;

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      gainNode.gain.setValueAtTime(0.7, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.1);

      startTime += 0.2; // Space between notes
    });
  }

  function updateCircles(minutesElapsed) {
    circles.forEach((circle, index) => {
      if (index < minutesElapsed) {
        circle.classList.add("active");
      } else {
        circle.classList.remove("active");
      }
    });
  }

  function startTimer() {
    if (timerRunning) return;

    startButton.disabled = true; // Disable start button during countdown
    let countdown = 5;

    function beepCountdown() {
      if (countdown > 1) {
        announceMinute(countdown); // Use announceMinute for beep sound, default frequency
        countdown--;
        setTimeout(beepCountdown, 1000); // Beep every second
      } else if (countdown === 1) {
        announceMinute(countdown, 880); // Different frequency for the last beep
        countdown--;
        setTimeout(beepCountdown, 1000); // Beep every second
      } else {
        timerRunning = true;
        timerPaused = false;
        startButton.textContent = "Pause";
        startButton.disabled = false; // Re-enable start button after countdown
        restartButton.style.display = "none";
        timeLeft = 20 * 60;
        updateTimerDisplay();
        updateCircles(1); // Initialize with 1 active circle on start
        startMainTimer(); // Start the main 20-minute timer
      }
    }

    beepCountdown(); // Start the 5-second beep countdown
  }

  function startMainTimer() {
    // Separate function for the main timer interval

    timerInterval = setInterval(() => {
      if (!timerPaused) {
        timeLeft--;
        updateTimerDisplay();

        const minutesLeft = Math.ceil(timeLeft / 60);

        if (timeLeft % 60 === 0 && timeLeft > 0) {
          announceMinute(minutesLeft); // Announce with beep every minute, corrected to use minutesLeft
          updateCircles(20 - minutesLeft + 1);
        }

        if (timeLeft <= 0) {
          // Changed from timeLeft < 0 to timeLeft <= 0
          clearInterval(timerInterval);
          timerDisplay.textContent = "00:00";
          startButton.textContent = "Start";
          restartButton.style.display = "inline-block"; // Show restart button after timer ends
          timerRunning = false;
          playFanfare(); // Play fanfare when timer ends

          // Automate record function after timer ends
          const weekRows = document.querySelectorAll(
            ".table .row:not(.header):not(.total)"
          );
          const days = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
          const totalCellsPerWeek = days.length;

          if (recordCounter < weekRows.length * totalCellsPerWeek) {
            const weekIndex = Math.floor(recordCounter / totalCellsPerWeek);
            const dayIndex = recordCounter % totalCellsPerWeek;
            const rowToColor = weekRows[weekIndex];
            const cellToColor =
              rowToColor.querySelectorAll(".cell")[dayIndex + 1]; // +1 to skip the "week" cell
            if (cellToColor) {
              cellToColor.style.backgroundColor = "lightgreen";
              recordCounter++;
              localStorage.setItem("recordCounter", recordCounter.toString()); // Save to local storage
              updateTotalSumDisplay();
            }
          }
        }
      }
    }, 1000);
  }

  function updateTotalSumDisplay() {
    const totalSumElement = document.getElementById("total-sum");
    if (totalSumElement) {
      totalSumElement.textContent = calculateTotalColoredCells();
    }
    updateTotalSumDisplay(); // Initial update on load
  }

  function calculateTotalColoredCells() {
    let totalSum = 0;
    const weekRows = document.querySelectorAll(
      ".table .row:not(.header):not(.total)"
    );

    weekRows.forEach((row) => {
      const cells = row.querySelectorAll(".cell:not(:first-child)"); // Skip the first cell (week name)
      cells.forEach((cell) => {
        if (cell.style.backgroundColor === "lightgreen") {
          const cellValue = parseInt(cell.textContent);
          if (!isNaN(cellValue)) {
            totalSum += cellValue;
          }
        }
      });
    });
    return totalSum;
  }

  function pauseTimer() {
    timerPaused = true;
    startButton.textContent = "Continue";
    restartButton.style.display = "inline-block";
    clearInterval(timerInterval);
  }

  function resumeTimer() {
    timerPaused = false;
    startButton.textContent = "Pause";
    restartButton.style.display = "none";
    timerInterval = setInterval(() => {
      if (!timerPaused) {
        timeLeft--;
        updateTimerDisplay();

        const minutesLeft = Math.ceil(timeLeft / 60);

        if (timeLeft % 60 === 0 && timeLeft > 0) {
          announceMinute(minutesLeft); // Announce with beep every minute, corrected to use minutesLeft
          updateCircles(20 - minutesLeft + 1);
        }

        if (timeLeft <= 0) {
          // Changed from timeLeft < 0 to timeLeft <= 0
          clearInterval(timerInterval);
          timerDisplay.textContent = "00:00";
          startButton.textContent = "Start";
          restartButton.style.display = "none";
          timerRunning = false;
        }
      }
    }, 1000);
  }

  function restartTimer() {
    timerRunning = false;
    timerPaused = false;
    startButton.textContent = "Start";
    restartButton.style.display = "none";
    clearInterval(timerInterval);
    timeLeft = 20 * 60;
    updateTimerDisplay();
    updateCircles(0); // Initialize with 0 active circles on restart
  }

  startButton.addEventListener("click", () => {
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

  restartButton.addEventListener("click", restartTimer);

  resetProgressButton.addEventListener("click", () => {
    localStorage.removeItem("recordCounter");
    recordCounter = 0;
    // Reset cell colors
    const cells = document.querySelectorAll(".table .cell");
    cells.forEach((cell) => {
      cell.style.backgroundColor = "";
    });
    updateTotalSumDisplay(); // Update total sum after reset
  });

  // Load recordCounter from local storage on page load
  const storedCounter = localStorage.getItem("recordCounter");
  if (storedCounter) {
    recordCounter = parseInt(storedCounter);
    const weekRows = document.querySelectorAll(
      ".table .row:not(.header):not(.total)"
    );
    const days = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
    const totalCellsPerWeek = days.length;

    for (let i = 0; i < recordCounter; i++) {
      if (i < weekRows.length * totalCellsPerWeek) {
        const weekIndex = Math.floor(i / totalCellsPerWeek);
        const dayIndex = i % totalCellsPerWeek;
        const rowToColor = weekRows[weekIndex];
        const cellToColor = rowToColor.querySelectorAll(".cell")[dayIndex + 1];
        if (cellToColor) {
          cellToColor.style.backgroundColor = "lightgreen";
        }
      }
    }
    updateTotalSumDisplay(); // Initial update on load
  }
});
