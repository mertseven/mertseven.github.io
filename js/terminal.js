class TerminalEmulator {
    constructor() {
        this.terminal = document.getElementById('terminal');
        this.content = document.getElementById('terminal-content');
        this.input = document.getElementById('terminal-input');
        this.toggleBtn = document.getElementById('terminal-toggle');
        this.isVisible = false;
        this.commandHistory = [];
        this.historyIndex = -1;

        this.commands = {
            help: () => this.showHelp(),
            ls: () => this.listSections(),
            cat: (args) => this.showContent(args),
            clear: () => this.clearTerminal(),
            about: () => this.showAbout(),
            pwd: () => this.showCurrentPath(),
            echo: (args) => this.echo(args),
            date: () => this.showDate()
        };

        this.init();
    }

    init() {
        this.toggleBtn.addEventListener('click', () => this.toggleTerminal());
        this.input.addEventListener('keydown', (e) => this.handleInput(e));
        document.getElementById('terminal-minimize').addEventListener('click', () => this.toggleTerminal());
    }

    toggleTerminal() {
        this.isVisible = !this.isVisible;
        this.terminal.classList.toggle('show');
        this.toggleBtn.textContent = this.isVisible ? 'Hide Terminal' : 'Show Terminal';
        if (this.isVisible) {
            this.input.focus();
        }
    }

    handleInput(e) {
        if (e.key === 'Enter') {
            const command = this.input.value.trim();
            if (command) {
                this.executeCommand(command);
                this.commandHistory.push(command);
                this.historyIndex = this.commandHistory.length;
            }
            this.input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.commandHistory[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.input.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                this.input.value = '';
            }
        }
    }

    executeCommand(commandStr) {
        const [cmd, ...args] = commandStr.split(' ');
        this.addToTerminal(`<span class="terminal-prompt">moonbase:~$</span> ${commandStr}`);

        if (this.commands[cmd]) {
            this.commands[cmd](args);
        } else {
            this.addToTerminal(`Command not found: ${cmd}`, 'error');
        }
    }

    addToTerminal(text, type = 'output') {
        const line = document.createElement('p');
        line.className = `terminal-line terminal-${type}`;
        line.innerHTML = text;
        
        this.content.insertBefore(line, this.content.lastElementChild);
        
        requestAnimationFrame(() => {
            const inputLine = this.content.lastElementChild;
            const inputBottom = inputLine.offsetTop + inputLine.offsetHeight;
            const containerHeight = this.content.clientHeight;
            const currentScroll = this.content.scrollTop;
            
            if (inputBottom > currentScroll + containerHeight) {
                this.content.scrollTop = inputBottom - containerHeight;
            }
        });
    }

    showHelp() {
        const help = `
            Available commands:
            - help: Show this help message
            - ls: List all sections
            - cat <section>: Show content of a section
            - clear: Clear terminal
            - about: Show information about this site
            - pwd: Show current path
            - echo <text>: Display text
            - date: Show current date and time
        `;
        this.addToTerminal(help);
    }

    listSections() {
        const sections = Array.from(document.querySelectorAll('section'))
            .map(section => section.id || 'unnamed-section');
        this.addToTerminal('Available sections:');
        sections.forEach(section => {
            this.addToTerminal(`- ${section}`);
        });
    }

    showContent(args) {
        if (!args.length) {
            this.addToTerminal('Usage: cat <section-name>', 'error');
            return;
        }
        const sectionId = args[0];
        const section = document.getElementById(sectionId);
        if (section) {
            this.addToTerminal(`Content of ${sectionId}:`);
            this.addToTerminal(section.textContent.trim());
        } else {
            this.addToTerminal(`Section not found: ${sectionId}`, 'error');
        }
    }

    clearTerminal() {
        const children = Array.from(this.content.children);
        children.slice(0, -1).forEach(child => child.remove());
    }

    showAbout() {
        this.addToTerminal('MOONBASE - A monospace mono space');
        this.addToTerminal('Created by Mert Seven');
    }

    showCurrentPath() {
        this.addToTerminal('/moonbase' + (location.hash || '/home'));
    }

    echo(args) {
        if (args.length) {
            this.addToTerminal(args.join(' '));
        }
    }

    showDate() {
        this.addToTerminal(new Date().toLocaleString());
    }
}

// Initialize the terminal when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TerminalEmulator();
});