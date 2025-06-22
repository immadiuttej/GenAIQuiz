        // GenAI Jungle Quest Game with Integrated Form Submission
        
        console.log('GenAI Jungle Quest script started');

        const API_BASE = 'https://epam-genai-dashboard.azurewebsites.net';
        
        // Game state
        const gameState = {
            selectedCharacter: null,
            questions: [],
            currentQuestionIndex: 0,
            lives: 3,
            score: 0,
            startTime: 0,
            endTime: 0,
            gameStartTime: 0,
            attempts: 0,
            questionsAnswered: 0,
            factIsLeft: false,
            demonAppeared: false,
            formSubmitted: false,
            activeSlot: null
        };
        

        // Background images for each question (cycle through a few variations)
        const backgroundImagesDesktop = [
            'assets/images/scenes/desktop/jungle_2paths_1.png',
            'assets/images/scenes/desktop/jungle_2paths_2.png',
            'assets/images/scenes/desktop/jungle_2paths_3.png',
            'assets/images/scenes/desktop/jungle_2paths_4.png',
            'assets/images/scenes/desktop/jungle_2paths_5.png',
            'assets/images/scenes/desktop/jungle_2paths_6.png',
            'assets/images/scenes/desktop/jungle_2paths_7.png',
            'assets/images/scenes/desktop/jungle_2paths_8.png',
            'assets/images/scenes/desktop/jungle_2paths_9.png',
            'assets/images/scenes/desktop/jungle_2paths_10.png'
        ];

        // Mobile background images (cycle through variations)
        const backgroundImagesMobile = [
            'assets/images/scenes/mobile/jungle_2paths_mobile_1.png',
            'assets/images/scenes/mobile/jungle_2paths_mobile_2.png',
            'assets/images/scenes/mobile/jungle_2paths_mobile_3.png',
            'assets/images/scenes/mobile/jungle_2paths_mobile_4.png',
            'assets/images/scenes/mobile/jungle_2paths_mobile_5.png',
            'assets/images/scenes/mobile/jungle_2paths_mobile_6.png',
            'assets/images/scenes/mobile/jungle_2paths_mobile_7.png',
            'assets/images/scenes/mobile/jungle_2paths_mobile_8.png',
            'assets/images/scenes/mobile/jungle_2paths_mobile_9.png',
            'assets/images/scenes/mobile/jungle_2paths_mobile_10.png'
        ];

        // Helper to determine if we are on a mobile sized screen
        function isMobileScreen() {
            return window.matchMedia('(max-width: 768px)').matches;
        }

        // Get correct winner/loser image based on device
        function getResultImage(type) {
            const suffix = isMobileScreen() ? 'mobile' : 'desktop';
            return `assets/images/${type}_screen_${suffix}.png`;
        }
        // Preload an image to avoid flicker during transitions
        function preloadImage(src) {
            const img = new Image();
            img.src = src;
        }

        // Preload all background images on startup
        function preloadAllBackgroundImages() {
            backgroundImagesDesktop.forEach(preloadImage);
            backgroundImagesMobile.forEach(preloadImage);
        }


async function fetchActiveSlot() {
    try {
        const res = await fetch(`${API_BASE}/api/slots`);
        const data = await res.json();
        return data.find(s => s.status === 'active' || s.active) || null;
    } catch (err) {
        console.error('Error fetching slots:', err);
        return null;
    }
}

async function monitorSlot() {
    while (true) {
        await new Promise(r => setTimeout(r, 15000));
        const slot = await fetchActiveSlot();
        if (!slot || !gameState.activeSlot || slot.id !== gameState.activeSlot.id) {
            await waitForActiveSlot();
        } else {
            gameState.activeSlot = slot;
        }
    }
}

        async function waitForActiveSlot() {
            const overlay = document.getElementById('standby-overlay');
            let slot = await fetchActiveSlot();
            if (!slot && overlay) overlay.style.display = 'flex';
            while (!slot) {
                await new Promise(r => setTimeout(r, 10000));
                slot = await fetchActiveSlot();
            }
            if (overlay) overlay.style.display = 'none';
            gameState.activeSlot = slot;
        }
        
        // Audio elements
        let correctSound, wrongSound, winnerSound;
        let desktopBg, mobileBg, correctOverlay;
        
        // DOM elements
        let loadingScreen, characterSelection, gameScreen, resultScreen, incorrectPopup, formModal;
        
        // Initialize DOM elements after page load
        function initializeDOMElements() {
            try {
                correctSound = document.getElementById('correct-sound');
                wrongSound = document.getElementById('wrong-sound');
                winnerSound = document.getElementById('winner-sound');
                
                loadingScreen = document.getElementById('loading');
                characterSelection = document.getElementById('character-selection');
                gameScreen = document.getElementById('game-screen');
                resultScreen = document.getElementById('result-screen');
                incorrectPopup = document.getElementById('incorrect-popup');
                formModal = document.getElementById('form-modal');
                desktopBg = document.querySelector('.jungle-background-desktop');
                mobileBg = document.querySelector('.jungle-background-mobile');
                correctOverlay = document.getElementById('correct-overlay');
                
                console.log('DOM elements initialized successfully');
            } catch (error) {
                console.error('Error initializing DOM elements:', error);
            }
        }
        
        // Sample questions data
        const sampleQuestions = {
            questions: [
                {
                    "fact": "GenAI can help automate repetitive tasks",
                    "myth": "GenAI will completely replace all human jobs"
                },
                {
                    "fact": "GenAI requires quality data to produce good results",
                    "myth": "GenAI can work perfectly without any training data"
                },
                {
                    "fact": "GenAI can assist in creative processes",
                    "myth": "GenAI has consciousness and feelings"
                },
                {
                    "fact": "GenAI models need regular updates and maintenance",
                    "myth": "GenAI is 100% accurate all the time"
                },
                {
                    "fact": "GenAI can help with code generation and debugging",
                    "myth": "GenAI can solve any problem without human oversight"
                },
                {
                    "fact": "GenAI can analyze patterns in large datasets",
                    "myth": "GenAI understands context like humans do"
                },
                {
                    "fact": "GenAI can generate text in multiple languages",
                    "myth": "GenAI can predict the future with certainty"
                },
                {
                    "fact": "GenAI requires computational resources to run",
                    "myth": "GenAI works without any energy consumption"
                },
                {
                    "fact": "GenAI can help with content summarization",
                    "myth": "GenAI creates original ideas from nothing"
                },
                {
                    "fact": "GenAI models have limitations and biases",
                    "myth": "GenAI is completely unbiased and neutral"
                },
                {
                    "fact": "GenAI can assist in medical diagnosis support",
                    "myth": "GenAI can replace doctors entirely"
                },
                {
                    "fact": "GenAI can help with language translation",
                    "myth": "GenAI translations are always culturally perfect"
                },
                {
                    "fact": "GenAI can generate realistic images",
                    "myth": "GenAI images are legally yours to use freely"
                },
                {
                    "fact": "GenAI can help with educational content",
                    "myth": "GenAI makes human teachers obsolete"
                },
                {
                    "fact": "GenAI requires ethical guidelines for use",
                    "myth": "GenAI can be used without any restrictions"
                },
                {
                    "fact": "GenAI can help identify patterns in data",
                    "myth": "GenAI can read and understand minds"
                },
                {
                    "fact": "GenAI models can be fine-tuned for specific tasks",
                    "myth": "GenAI works the same for every use case"
                },
                {
                    "fact": "GenAI can assist in customer service",
                    "myth": "GenAI chatbots are indistinguishable from humans"
                },
                {
                    "fact": "GenAI can help with research and analysis",
                    "myth": "GenAI eliminates the need for human expertise"
                },
                {
                    "fact": "GenAI development requires significant resources",
                    "myth": "Anyone can build advanced AI with no expertise"
                }
            ]
        };

        // Get random questions
        function getRandomQuestions(allQuestions, count) {
            const result = [];
            const takenIndexes = new Set();
            const total = allQuestions.length;
            const max = Math.min(count, total);

            while (result.length < max) {
                const idx = Math.floor(Math.random() * total);
                if (!takenIndexes.has(idx)) {
                    takenIndexes.add(idx);
                    result.push(allQuestions[idx]);
                }
            }

            return result;
        }
        
        // Select character
        function selectCharacter(character) {
            gameState.selectedCharacter = character;
            gameState.startTime = Date.now();
            gameState.gameStartTime = Date.now();
            
            // Set character image
            document.getElementById('character-back').src = `assets/images/${character}_character_backwards_wo_bg.png`;
            
            // Hide character selection and show game screen
            if (characterSelection) characterSelection.style.display = 'none';
            if (gameScreen) gameScreen.style.display = 'block';
            
            // Load first question
            loadQuestion();
        }
        
        // Load question
        function loadQuestion() {
            const question = gameState.questions[gameState.currentQuestionIndex];
            
            // Randomly decide which road (left or right) will have the fact
            gameState.factIsLeft = Math.random() > 0.5;

            // Update background images
            if (desktopBg) desktopBg.src = backgroundImagesDesktop[gameState.currentQuestionIndex % backgroundImagesDesktop.length];
            if (mobileBg) mobileBg.src = backgroundImagesMobile[gameState.currentQuestionIndex % backgroundImagesMobile.length];
            
            // Set question texts
            document.getElementById('left-text').textContent = gameState.factIsLeft ? question.fact : question.myth;
            document.getElementById('right-text').textContent = gameState.factIsLeft ? question.myth : question.fact;
            
            // Update score and lives display
            document.getElementById('score-container').textContent = `Score: ${gameState.score}`;
            document.getElementById('lives-container').textContent = `Lives: ${Array(gameState.lives).fill('❤️').join('')}`;
        }
        
        // Select answer
        function selectAnswer(choice) {
            // Check if answer is correct (fact)
            const isCorrect = (choice === 'left' && gameState.factIsLeft) || (choice === 'right' && !gameState.factIsLeft);
            
            if (isCorrect) {
                if (correctSound) correctSound.play();

                // Calculate score based on time and attempts
                const timeTaken = Date.now() - gameState.startTime;
                gameState.score += calculateScore(gameState.attempts, timeTaken);

                // Reset attempts and update questions answered
                gameState.attempts = 0;
                gameState.questionsAnswered++;

                // Preload background for the next question during the transition
                const nextIndex = gameState.currentQuestionIndex + 1;
                const nextDesktop = backgroundImagesDesktop[nextIndex % backgroundImagesDesktop.length];
                const nextMobile = backgroundImagesMobile[nextIndex % backgroundImagesMobile.length];
                preloadImage(nextDesktop);
                preloadImage(nextMobile);

                showCorrectAnimation();
                setTimeout(() => {
                    swipeTransition(() => {
                        if (gameState.questionsAnswered >= gameState.questions.length) {
                            gameState.endTime = Date.now();
                            gameWon();
                        } else {
                            gameState.currentQuestionIndex++;
                            gameState.startTime = Date.now();
                            loadQuestion();
                        }
                    });
                }, 150);
            } else {
                if (wrongSound) wrongSound.play();
                
                // Show the demon if it hasn't appeared yet
                if (!gameState.demonAppeared) {
                    document.getElementById('demon').style.display = 'block';
                    gameState.demonAppeared = true;
                }
                
                // Decrease lives and increase attempts
                gameState.lives--;
                gameState.attempts++;
                
                // Update lives display immediately
                document.getElementById('lives-container').textContent = `Lives: ${Array(gameState.lives).fill('❤️').join('')}`;
                
                // Check if game is over
                if (gameState.lives <= 0) {
                    gameState.endTime = Date.now();
                    gameOver();
                } else {
                    // Show incorrect popup
                    document.getElementById('lives-remaining').textContent = `Lives remaining: ${Array(gameState.lives).fill('❤️').join('')}`;
                    if (incorrectPopup) incorrectPopup.style.display = 'flex';
                }
            }
        }
        
        // Calculate score
        function calculateScore(attempts, timeTaken) {
            // Base score for correct answer
            const correctAnswerPoints = 100;
            
            // Penalty for attempts (10 points per wrong attempt)
            const attemptsPenalty = attempts * 10;
            
            // Time penalty (1 point per second)
            const timePenalty = Math.floor(timeTaken / 1000);
            
            // Calculate final score
            const finalScore = correctAnswerPoints - attemptsPenalty - timePenalty;
            
            // Ensure score doesn't go below 0
            return Math.max(finalScore, 0);
        }
        
        // Try again after incorrect answer
        function tryAgain() {
            if (incorrectPopup) incorrectPopup.style.display = 'none';
        }

        function showCorrectAnimation() {
            if (correctOverlay) {
                correctOverlay.classList.add('correct-show');
                setTimeout(() => {
                    correctOverlay.classList.remove('correct-show');
                }, 800);
            }
        }

        function swipeTransition(callback) {
            if (gameScreen) {
                gameScreen.classList.add('swipe-transition');
                if (callback) callback();
                setTimeout(() => {
                    gameScreen.classList.remove('swipe-transition');
                }, 400);
            } else if (callback) {
                callback();
            }
        }
        
        // Game over
        function gameOver() {
            // Show result screen with loser image
            document.getElementById('result-image').src = getResultImage('loser');
            document.getElementById('result-title').textContent = 'You Got Lost!';
            document.getElementById('result-message').textContent = 'Better luck next time navigating the GenAI Jungle!';
            document.getElementById('final-score').textContent = `Final Score: ${gameState.score}`;
            
            if (gameScreen) gameScreen.style.display = 'none';
            if (resultScreen) resultScreen.style.display = 'block';
        }
        
        // Game won
        function gameWon() {
            // Play winner sound
            if (winnerSound) winnerSound.play();

            // Show result screen with winner image
            document.getElementById('result-image').src = getResultImage('winner');
            document.getElementById('result-title').textContent = 'Congratulations!';
            document.getElementById('result-message').textContent = 'You successfully navigated the GenAI Jungle!';
            document.getElementById('final-score').textContent = `Final Score: ${gameState.score}`;
            
            if (gameScreen) gameScreen.style.display = 'none';
            if (resultScreen) resultScreen.style.display = 'block';
        }
        
        // Format time taken
        function formatTimeTaken(milliseconds) {
            const totalSeconds = Math.floor(milliseconds / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            
            if (minutes > 0) {
                return `${minutes}m ${seconds}s`;
            } else {
                return `${seconds}s`;
            }
        }
        
        // Open form modal
        function openFormModal() {
            const timeTaken = gameState.endTime - gameState.gameStartTime;
            const currentDate = new Date();
            
            // Populate form info
            document.getElementById('form-score').textContent = gameState.score;
            document.getElementById('form-time').textContent = formatTimeTaken(timeTaken);
            document.getElementById('form-date').textContent = currentDate.toLocaleString();
            
            // Show modal
            if (formModal) formModal.style.display = 'flex';
        }
        
        // Close form modal
        function closeFormModal() {
            if (formModal) formModal.style.display = 'none';
            
            // Reset form
            document.getElementById('score-form').reset();
            
            // Hide any messages
            const messageDiv = document.getElementById('submission-message');
            messageDiv.style.display = 'none';
        }
        
        // Submit to Google Form using iframe method (CSP-friendly)
        async function submitToGoogleForm(name, email, location) {
            const timeTaken = gameState.endTime - gameState.gameStartTime;
            const currentDate = new Date();
            const submissionDateTime = currentDate.toLocaleString();
            const timeTakenStr = formatTimeTaken(timeTaken);
            
            try {
                // Create a hidden iframe for form submission
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.name = 'google-form-submit';
                document.body.appendChild(iframe);
                
                // Create a form element
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdy-cqlK-EKu-fboPiMHN47J30BMd2NRbU95tu0TC63p4Gbxw/formResponse';
                form.target = 'google-form-submit';
                form.style.display = 'none';
                
                // Create form fields
                const fields = [
                    { name: 'entry.537251900', value: submissionDateTime }, // Date/Time
                    { name: 'entry.2062066101', value: name }, // Name
                    { name: 'entry.619908854', value: email }, // Email
                    { name: 'entry.439563429', value: timeTakenStr }, // Time Taken
                    { name: 'entry.1699034838', value: gameState.score.toString() }, // Score
                    { name: 'entry.0000000000', value: location } // Location (placeholder ID)
                ];
                
                // Create input elements
                fields.forEach(field => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = field.name;
                    input.value = field.value;
                    form.appendChild(input);
                });
                
                // Add form to document and submit
                document.body.appendChild(form);
                
                // Submit the form
                form.submit();
                
                // Clean up after a delay
                setTimeout(() => {
                    document.body.removeChild(form);
                    document.body.removeChild(iframe);
                }, 3000);
                
                return { success: true };
            } catch (error) {
                console.error('Error submitting to Google Form:', error);
                return { success: false, error: error.message };
            }
        }

        async function submitToDashboard(name, email, location) {
            const timeTakenMs = gameState.endTime - gameState.gameStartTime;
            const payload = {
                name,
                email,
                score: gameState.score,
                timetaken: Math.floor(timeTakenMs / 1000),
                displaytime: new Date(timeTakenMs).toISOString().substring(14, 19),
                location
            };
            try {
                const res = await fetch(`${API_BASE}/api/player`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                console.log('Dashboard submit', data);
            } catch (err) {
                console.error('Error submitting to dashboard:', err);
            }
        }
        
        // Handle form submission
        document.addEventListener('DOMContentLoaded', function() {
            const scoreForm = document.getElementById('score-form');
            if (scoreForm) {
                scoreForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const name = document.getElementById('player-name').value.trim();
                    const email = document.getElementById('player-email').value.trim();
                    const location = document.getElementById('player-location').value;
                    const submitButton = e.target.querySelector('.form-submit-button');
                    const messageDiv = document.getElementById('submission-message');
                    
                    // Validate inputs
                    if (!name || !email || !location) {
                        messageDiv.textContent = 'Please fill in all required fields.';
                        messageDiv.className = 'submission-message submission-error';
                        messageDiv.style.display = 'block';
                        return;
                    }
                    
                    // Disable submit button
                    submitButton.disabled = true;
                    submitButton.textContent = 'Submitting...';
                    
                    // Clear any previous messages
                    messageDiv.style.display = 'none';
                    
                    try {
                        
                        // Submit to Google Form using iframe method
                        const googleFormResult = await submitToGoogleForm(name, email, location);
                        // Also submit to dashboard
                        submitToDashboard(name, email, location);
                        
                        if (googleFormResult.success) {
                            gameState.formSubmitted = true;
                            messageDiv.textContent = 'Score submitted successfully! Thank you for playing!';
                            messageDiv.className = 'submission-message submission-success';
                            messageDiv.style.display = 'block';
                            
                            // Close modal after 3 seconds
                            setTimeout(() => {
                                closeFormModal();
                                submitButton.disabled = false;
                                submitButton.textContent = 'Submit';
                            }, 3000);
                        } else {
                            // If Google Form submission failed
                            messageDiv.textContent = 'Score submission failed. Please try again.';
                            messageDiv.className = 'submission-message submission-error';
                            messageDiv.style.display = 'block';
                            
                            // Re-enable submit button
                            submitButton.disabled = false;
                            submitButton.textContent = 'Submit';
                        }
                    } catch (error) {
                        console.error('Error submitting score:', error);
                        messageDiv.textContent = 'Failed to submit score. Please try again.';
                        messageDiv.className = 'submission-message submission-error';
                        messageDiv.style.display = 'block';
                        
                        // Re-enable submit button
                        submitButton.disabled = false;
                        submitButton.textContent = 'Submit';
                    }
                });
            }
        });
        
        // Restart game
        function restartGame() {
            // Reset game state
            gameState.currentQuestionIndex = 0;
            gameState.lives = 3;
            gameState.score = 0;
            gameState.startTime = Date.now();
            gameState.gameStartTime = Date.now();
            gameState.endTime = 0;
            gameState.attempts = 0;
            gameState.questionsAnswered = 0;
            gameState.demonAppeared = false;
            gameState.formSubmitted = false;
            
            // Hide the demon
            document.getElementById('demon').style.display = 'none';
            
            // Hide result screen and show game screen
            if (resultScreen) resultScreen.style.display = 'none';
            if (gameScreen) gameScreen.style.display = 'block';
            
            // Load first question
            loadQuestion();
        }
        
        // Skip loading function
        async function skipLoading() {
            console.log('Manually starting game');

            // Make sure DOM elements are initialized
            if (!loadingScreen) {
                initializeDOMElements();
            }

            if (!gameState.activeSlot) {
                await waitForActiveSlot();

            }
            
            // Make sure we have questions
            if (!gameState.questions || gameState.questions.length === 0) {
                gameState.questions = getRandomQuestions(sampleQuestions.questions, 10);
            }
            
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (characterSelection) characterSelection.style.display = 'flex';
        }
        
        // Simple initialization
        setTimeout(async function() {
            console.log('Initializing game...');
            initializeDOMElements();
            preloadAllBackgroundImages();

            await waitForActiveSlot();
            monitorSlot();

            console.log('Attempting to load questions from: ./genai_myths_facts.json');
            fetch('./genai_myths_facts.json')
                .then(response => {
                    console.log('JSON fetch response:', response.status, response.statusText);
                    if (!response.ok) throw new Error('JSON not found');
                    return response.json();
                })
                .then(data => {
                    console.log('Successfully loaded', data.questions.length, 'questions from JSON file');
                    gameState.questions = getRandomQuestions(data.questions, 10);
                    showCharacterSelection();
                })
                .catch(err => {
                    console.log('Could not load JSON file:', err.message);
                    console.log('Using built-in questions instead');
                    gameState.questions = getRandomQuestions(sampleQuestions.questions, 10);
                    showCharacterSelection();
                });
        }, 500);
        
        function showCharacterSelection() {
            // Hide loading and show character selection
            const loading = document.getElementById('loading');
            const charSelect = document.getElementById('character-selection');
            
            if (loading) loading.style.display = 'none';
            if (charSelect) charSelect.style.display = 'flex';
        }