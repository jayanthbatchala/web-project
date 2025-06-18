class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
        this.loadHistory();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }

    delete() {
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') {
            this.currentOperand = '0';
        }
        this.updateDisplay();
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '0') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
        this.updateDisplay();
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                computation = prev / current;
                break;
            case '%':
                computation = prev % current;
                break;
            default:
                return;
        }

        // Create history entry
        const historyEntry = {
            calculation: `${this.previousOperand} ${this.operation} ${this.currentOperand}`,
            result: computation,
            date: new Date().toLocaleString()
        };

        this.addToHistory(historyEntry);
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.updateDisplay();
    }

    addToHistory(entry) {
        let history = this.getHistory();
        history.unshift(entry);
        if (history.length > 10) history = history.slice(0, 10);
        localStorage.setItem('calculatorHistory', JSON.stringify(history));
        this.updateHistoryDisplay();
    }

    getHistory() {
        return JSON.parse(localStorage.getItem('calculatorHistory')) || [];
    }

    clearHistory() {
        localStorage.removeItem('calculatorHistory');
        this.updateHistoryDisplay();
    }

    loadHistory() {
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        const historyCount = document.getElementById('history-count');
        const history = this.getHistory();
        
        historyCount.textContent = history.length;
        
        if (history.length === 0) {
            historyList.innerHTML = '<div class="empty-history">No history yet</div>';
            return;
        }

        historyList.innerHTML = '';
        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <div class="history-calculation">${item.calculation}</div>
                <div class="history-result">= ${item.result}</div>
                <div class="history-date">${item.date}</div>
            `;
            li.addEventListener('click', () => {
                this.currentOperand = item.result.toString();
                this.updateDisplay();
                document.getElementById('history-panel').classList.remove('active');
            });
            historyList.appendChild(li);
        });
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.currentOperand;
        if (this.operation != null) {
            this.previousOperandTextElement.innerText = 
                `${this.previousOperand} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

// Initialize Calculator
const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');
const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Button Event Listeners
document.querySelectorAll('.number').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
    });
});

document.querySelectorAll('.operator').forEach(button => {
    button.addEventListener('click', () => {
        if (button.id !== 'equals') {
            calculator.chooseOperation(button.innerText);
        }
    });
});

document.getElementById('equals').addEventListener('click', () => {
    calculator.compute();
});

document.getElementById('clear').addEventListener('click', () => {
    calculator.clear();
});

document.getElementById('delete').addEventListener('click', () => {
    calculator.delete();
});

document.getElementById('percent').addEventListener('click', () => {
    calculator.chooseOperation('%');
});

// History Panel Controls
document.getElementById('history-btn').addEventListener('click', () => {
    document.getElementById('history-panel').classList.add('active');
});

document.getElementById('close-history').addEventListener('click', () => {
    document.getElementById('history-panel').classList.remove('active');
});

document.getElementById('clear-history').addEventListener('click', () => {
    calculator.clearHistory();
});

// Keyboard Support
document.addEventListener('keydown', (e) => {
    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
        calculator.appendNumber(e.key);
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        calculator.chooseOperation(
            e.key === '*' ? '×' : 
            e.key === '/' ? '÷' : e.key
        );
    } else if (e.key === 'Enter' || e.key === '=') {
        calculator.compute();
    } else if (e.key === 'Escape') {
        calculator.clear();
    } else if (e.key === 'Backspace') {
        calculator.delete();
    } else if (e.key === '%') {
        calculator.chooseOperation('%');
    }
});

// Close history when clicking outside
document.addEventListener('click', (e) => {
    const historyPanel = document.getElementById('history-panel');
    if (!historyPanel.contains(e.target) && 
        e.target.id !== 'history-btn' && 
        !e.target.closest('#history-btn')) {
        historyPanel.classList.remove('active');
    }
});