document.addEventListener('DOMContentLoaded', function() {
            // DOM elements
            const topicInput = document.getElementById('topic');
            const studentCountSelect = document.getElementById('student-count');
            const generateBtn = document.getElementById('generate-btn');
            const randomBtn = document.getElementById('random-btn');
            const resetBtn = document.getElementById('reset-btn');
            const randomNumberDiv = document.getElementById('random-number');
            const studentsContainer = document.getElementById('students-container');
            
            // Quiz data
            let quizData = null;
            let studentViews = [];
            
            // Sample quiz data structure (would come from API in real implementation)
            const sampleQuiz = {
                title: "Photosynthesis",
                sentences: [
                    {
                        text: "Photosynthesis is the process used by plants to convert {0} energy into {1} energy.",
                        blanks: ["light", "chemical"]
                    },
                    {
                        text: "This process occurs in the {0} of plant cells.",
                        blanks: ["chloroplasts"]
                    },
                    {
                        text: "The main pigments involved in capturing light are called {0}.",
                        blanks: ["chlorophyll"]
                    },
                    {
                        text: "The two main products of photosynthesis are {0} and {1}.",
                        blanks: ["glucose", "oxygen"]
                    }
                ]
            };
            
            // Initialize student views
            function initStudentViews(count) {
                studentsContainer.innerHTML = '';
                studentViews = [];
                
                // Update container class for split view
                studentsContainer.className = `students-container split-${count}`;
                
                for (let i = 1; i <= count; i++) {
                    const studentView = document.createElement('div');
                    studentView.className = 'student-view';
                    studentView.innerHTML = `
                        <div class="student-header">Student ${i}</div>
                        <div class="quiz-content" id="quiz-content-${i}">
                            <p>Quiz will appear here once generated</p>
                        </div>
                        <div class="student-controls">
                            <div class="student-score">Score: 0/0</div>
                            <button class="check-btn">Check Answers</button>
                        </div>
                    `;
                    studentsContainer.appendChild(studentView);
                    studentViews.push(studentView);
                }
            }
            
            // Generate quiz for all students
            function generateQuiz() {
                const topic = topicInput.value.trim() || "photosynthesis";
                
                // In a real implementation, we would fetch from:
                // fetch(`https://text.pollinations.ai/${topic}`)
                // .then(response => response.json())
                // .then(data => { ... });
                
                // For this demo, we'll use the sample quiz
                quizData = sampleQuiz;
                
                // Update each student view with the quiz
                studentViews.forEach((studentView, index) => {
                    const quizContent = studentView.querySelector('.quiz-content');
                    quizContent.innerHTML = '';
                    
                    // Add title
                    const title = document.createElement('h3');
                    title.textContent = quizData.title;
                    quizContent.appendChild(title);
                    
                    // Add sentences with blanks
                    quizData.sentences.forEach(sentenceData => {
                        const sentenceDiv = document.createElement('div');
                        sentenceDiv.className = 'sentence';
                        
                        // Split sentence by placeholders and create blanks
                        const parts = sentenceData.text.split(/\{\d+\}/);
                        sentenceDiv.innerHTML = parts[0];
                        
                        for (let i = 0; i < sentenceData.blanks.length; i++) {
                            const blank = document.createElement('span');
                            blank.className = 'blank';
                            blank.dataset.correct = sentenceData.blanks[i];
                            blank.dataset.filled = 'false';
                            
                            sentenceDiv.appendChild(blank);
                            sentenceDiv.appendChild(document.createTextNode(parts[i + 1]));
                        }
                        
                        quizContent.appendChild(sentenceDiv);
                    });
                    
                    // Add word bank
                    const wordBank = document.createElement('div');
                    wordBank.className = 'word-bank';
                    
                    // Collect all words and shuffle them
                    const allWords = [];
                    quizData.sentences.forEach(sentence => {
                        sentence.blanks.forEach(word => {
                            allWords.push(word);
                        });
                    });
                    
                    // Shuffle words
                    const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
                    
                    // Create word elements
                    shuffledWords.forEach(word => {
                        const wordSpan = document.createElement('span');
                        wordSpan.className = 'word';
                        wordSpan.textContent = word;
                        wordSpan.draggable = true;
                        
                        // Drag event handlers
                        wordSpan.addEventListener('dragstart', handleDragStart);
                        wordSpan.addEventListener('dragend', handleDragEnd);
                        
                        wordBank.appendChild(wordSpan);
                    });
                    
                    quizContent.appendChild(wordBank);
                    
                    // Set up blank drop zones
                    const blanks = studentView.querySelectorAll('.blank');
                    blanks.forEach(blank => {
                        blank.addEventListener('dragover', handleDragOver);
                        blank.addEventListener('dragenter', handleDragEnter);
                        blank.addEventListener('dragleave', handleDragLeave);
                        blank.addEventListener('drop', handleDrop);
                    });
                    
                    // Set up check answers button
                    const checkBtn = studentView.querySelector('.check-btn');
                    checkBtn.addEventListener('click', () => checkAnswers(index));
                });
            }
            
            // Drag and drop functions
            function handleDragStart(e) {
                this.classList.add('dragging');
                e.dataTransfer.setData('text/plain', this.textContent);
            }
            
            function handleDragEnd() {
                this.classList.remove('dragging');
            }
            
            function handleDragOver(e) {
                e.preventDefault();
            }
            
            function handleDragEnter(e) {
                e.preventDefault();
                this.classList.add('hovered');
            }
            
            function handleDragLeave() {
                this.classList.remove('hovered');
            }
            
            function handleDrop(e) {
                e.preventDefault();
                this.classList.remove('hovered');
                
                const word = e.dataTransfer.getData('text/plain');
                this.textContent = word;
                this.dataset.filled = 'true';
                this.classList.add('filled');
            }
            
            // Check answers for a specific student
            function checkAnswers(studentIndex) {
                const studentView = studentViews[studentIndex];
                const blanks = studentView.querySelectorAll('.blank');
                let correctCount = 0;
                
                blanks.forEach(blank => {
                    if (blank.dataset.filled === 'true') {
                        if (blank.textContent === blank.dataset.correct) {
                            blank.style.color = 'green';
                            correctCount++;
                        } else {
                            blank.style.color = 'red';
                        }
                    }
                });
                
                const scoreDiv = studentView.querySelector('.student-score');
                scoreDiv.textContent = `Score: ${correctCount}/${blanks.length}`;
            }
            
            // Select random student
            function selectRandomStudent() {
                const studentCount = parseInt(studentCountSelect.value);
                const randomNum = Math.floor(Math.random() * studentCount) + 1;
                
                randomNumberDiv.textContent = `Student ${randomNum}`;
                randomNumberDiv.style.display = 'block';
                
                // Hide after 5 seconds
                setTimeout(() => {
                    randomNumberDiv.style.display = 'none';
                }, 5000);
            }
            
            // Reset all quizzes
            function resetQuiz() {
                generateQuiz();
            }
            
            // Event listeners
            generateBtn.addEventListener('click', generateQuiz);
            randomBtn.addEventListener('click', selectRandomStudent);
            resetBtn.addEventListener('click', resetQuiz);
            studentCountSelect.addEventListener('change', function() {
                initStudentViews(parseInt(this.value));
            });
            
            // Initialize with 4 students
            initStudentViews(4);
        });
