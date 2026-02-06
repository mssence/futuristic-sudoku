class SudokuGame {
      constructor() {
                this.grid = Array(81).fill(0);
                this.solution = Array(81).fill(0);
                this.fixedIndices = new Set();
                this.selectedCell = null;
                this.difficulty = 'medium';
                this.mistakes = 0;
                this.maxMistakes = 3;
                this.timer = 0;
                this.timerInterval = null;
                this.isGameOver = false;
                this.init();
      }
      init() {
                this.setupEventListeners();
                this.startNewGame();
      }
      setupEventListeners() {
                const gridElement = document.getElementById('grid');
                gridElement.addEventListener('click', (e) => {
                              const cell = e.target.closest('.cell');
                              if (cell) this.selectCell(parseInt(cell.dataset.index));
                });
                document.querySelectorAll('.num-btn').forEach(btn => {
                              btn.addEventListener('click', () => {
                                                if (btn.id === 'erase-btn') {
                                                                      this.handleInput(0);
                                                } else {
                                                                      this.handleInput(parseInt(btn.dataset.value));
                                                }
                              });
                });
                document.querySelectorAll('.diff-btn').forEach(btn => {
                              btn.addEventListener('click', () => {
                                                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                                                btn.classList.add('active');
                                                this.difficulty = btn.dataset.level;
                                                this.startNewGame();
                              });
                });
                document.getElementById('new-game-btn').addEventListener('click', () => this.startNewGame());
                document.getElementById('modal-action').addEventListener('click', () => {
                              document.getElementById('modal-overlay').classList.add('hidden');
                              this.startNewGame();
                });
                document.getElementById('hint-btn').addEventListener('click', () => this.provideHint());
                document.addEventListener('keydown', (e) => {
                              if (this.isGameOver) return;
                              if (e.key >= '1' && e.key <= '9') this.handleInput(parseInt(e.key));
                              if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') this.handleInput(0);
                              if (e.key.startsWith('Arrow')) this.handleArrowKey(e.key);
                });
      }

    startNewGame() {
              this.isGameOver = false;
              this.mistakes = 0;
              this.timer = 0;
              this.updateStats();
              clearInterval(this.timerInterval);
              this.startTimer();
              this.generateSolution();
              this.createPuzzle();
              this.renderGrid();
              this.selectCell(null);
              document.getElementById('difficulty-display').innerText = this.difficulty.toUpperCase();
              document.getElementById('modal-overlay').classList.add('hidden');
    }
      startTimer() {
                this.timerInterval = setInterval(() => {
                              this.timer++;
                              const mins = Math.floor(this.timer / 60).toString().padStart(2, '0');
                              const secs = (this.timer % 60).toString().padStart(2, '0');
                              document.getElementById('timer').innerText = `${mins}:${secs}`;
                }, 1000);
      }
      generateSolution() {
                this.solution = Array(81).fill(0);
                this.solve(this.solution);
      }
      solve(grid) {
                for (let i = 0; i < 81; i++) {
                              if (grid[i] === 0) {
                                                const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                                                for (let n of numbers) {
                                                                      if (this.isValid(grid, i, n)) {
                                                                                                grid[i] = n;
                                                                                                if (this.solve(grid)) return true;
                                                                                                grid[i] = 0;
                                                                      }
                                                }
                                                return false;
                              }
                }
                return true;
      }
      isValid(grid, index, num) {
                const row = Math.floor(index / 9);
                const col = index % 9;
                for (let i = 0; i < 9; i++) if (grid[row * 9 + i] === num) return false;
                for (let i = 0; i < 9; i++) if (grid[i * 9 + col] === num) return false;
                const boxRow = Math.floor(row / 3) * 3;
                const boxCol = Math.floor(col / 3) * 3;
                for (let r = 0; r < 3; r++) {
                              for (let c = 0; c < 3; c++) {
                                                if (grid[(boxRow + r) * 9 + (boxCol + c)] === num) return false;
                              }
                }
                return true;
      }

    createPuzzle() {
              this.grid = [...this.solution];
              this.fixedIndices.clear();
              let count;
              switch(this.difficulty) {
                case 'easy': count = 38; break;
                case 'medium': count = 30; break;
                case 'hard': count = 24; break;
                default: count = 30;
              }
              const toRemove = 81 - count;
              let removed = 0;
              let attempts = 0;
              while (removed < toRemove && attempts < 200) {
                            const index = Math.floor(Math.random() * 81);
                            if (this.grid[index] !== 0) {
                                              this.grid[index] = 0;
                                              removed++;
                            }
                            attempts++;
              }
              for (let i = 0; i < 81; i++) {
                            if (this.grid[i] !== 0) this.fixedIndices.add(i);
              }
    }
      renderGrid() {
                const container = document.getElementById('grid');
                container.innerHTML = '';
                for (let i = 0; i < 81; i++) {
                              const cell = document.createElement('div');
                              cell.className = 'cell';
                              cell.dataset.index = i;
                              if (this.fixedIndices.has(i)) {
                                                cell.classList.add('fixed');
                                                cell.innerText = this.grid[i];
                              } else if (this.grid[i] !== 0) {
                                                cell.innerText = this.grid[i];
                              }
                              container.appendChild(cell);
                }
      }
      selectCell(index) {
                this.selectedCell = index;
                const cells = document.querySelectorAll('.cell');
                cells.forEach(c => {
                              c.classList.remove('selected', 'highlighted', 'same-number');
                              const idx = parseInt(c.dataset.index);
                              if (index !== null) {
                                                const targetRow = Math.floor(index / 9);
                                                const targetCol = index % 9;
                                                const cellRow = Math.floor(idx / 9);
                                                const cellCol = idx % 9;
                                                const inBox = Math.floor(targetRow/3) === Math.floor(cellRow/3) && 
                                                                                Math.floor(targetCol/3) === Math.floor(cellCol/3);
                                                if (idx === index) {
                                                                      c.classList.add('selected');
                                                } else if (cellRow === targetRow || cellCol === targetCol || inBox) {
                                                                      c.classList.add('highlighted');
                                                }
                                                const targetVal = this.grid[index];
                                                if (targetVal !== 0 && this.grid[idx] === targetVal) {
                                                                      c.classList.add('same-number');
                                                }
                              }
                });
      }

    handleInput(num) {
              if (this.selectedCell === null || this.fixedIndices.has(this.selectedCell) || this.isGameOver) return;
              const cellElement = document.querySelector(`.cell[data-index="${this.selectedCell}"]`);
              if (num === 0) {
                            this.grid[this.selectedCell] = 0;
                            cellElement.innerText = '';
                            cellElement.classList.remove('wrong');
              } else {
                            if (this.solution[this.selectedCell] === num) {
                                              this.grid[this.selectedCell] = num;
                                              cellElement.innerText = num;
                                              cellElement.classList.remove('wrong');
                                              this.checkWin();
                            } else {
                                              this.grid[this.selectedCell] = num;
                                              cellElement.innerText = num;
                                              cellElement.classList.add('wrong');
                                              this.mistakes++;
                                              this.updateStats();
                                              if (this.mistakes >= this.maxMistakes) {
                                                                    this.endGame(false);
                                              }
                            }
              }
              this.selectCell(this.selectedCell);
    }
      handleArrowKey(key) {
                if (this.selectedCell === null) {
                              this.selectCell(0);
                              return;
                }
                let newIdx = this.selectedCell;
                if (key === 'ArrowUp') newIdx -= 9;
                if (key === 'ArrowDown') newIdx += 9;
                if (key === 'ArrowLeft') newIdx -= 1;
                if (key === 'ArrowRight') newIdx += 1;
                if (newIdx >= 0 && newIdx < 81) {
                              this.selectCell(newIdx);
                }
      }
      provideHint() {
                if (this.selectedCell === null || this.isGameOver || this.grid[this.selectedCell] !== 0) return;
                const correctVal = this.solution[this.selectedCell];
                this.handleInput(correctVal);
      }
      updateStats() {
                document.getElementById('mistakes').innerText = `MISTAKES: ${this.mistakes}/${this.maxMistakes}`;
      }
      checkWin() {
                if (!this.grid.includes(0)) {
                              const isCorrect = this.grid.every((val, i) => val === this.solution[i]);
                              if (isCorrect) this.endGame(true);
                }
      }
      endGame(win) {
                this.isGameOver = true;
                clearInterval(this.timerInterval);
                const overlay = document.getElementById('modal-overlay');
                const title = document.getElementById('modal-title');
                const msg = document.getElementById('modal-message');
                const action = document.getElementById('modal-action');
                overlay.classList.remove('hidden');
                if (win) {
                              title.innerText = 'VICTORY';
                              msg.innerText = `System integrity restored. Time: ${document.getElementById('timer').innerText}`;
                              action.innerText = 'REBOOT';
                } else {
                              title.innerText = 'CRITICAL FAILURE';
                              msg.innerText = 'Grid collapse detected. Too many logical errors.';
                              action.innerText = 'REINITIALIZE';
                }
      }
}
window.addEventListener('DOMContentLoaded', () => {
      new SudokuGame();
});
