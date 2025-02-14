class WritingsSystem {
    constructor() {
        // Core elements
        this.grid = document.querySelector('.writings-grid');
        this.modal = document.getElementById('writing-modal');
        this.filters = document.querySelectorAll('.filter-btn');
        
        // Current state
        this.activeFilters = {
            language: 'all',
            type: 'all'
        };

        // Fetch and initialize
        this.fetchWritings().then(() => {
            this.initializeSystem();
        });
    }

    async fetchWritings() {
        // In practice, you'd fetch this from a JSON file or API
        // For now, using static data
        this.writings = [
            {
                id: "gokyuzu",
                title: "Gökyüzü",
                date: "2013-03-04",
                language: "tr",
                type: "prose",
                excerpt: "Gökyüzünü boyayan adamın ölümünü ve sonrasını anlatan bir yazı...",
                content: `Gökyüzünü boyayan adam öldü duydunuz mu? Buna en çok her gün faytonuyla güneşi çeken adam üzüldü...`,
                related: ["gokyuzu-ii"]
            },
            {
                id: "hand-revisited",
                title: "The Hand Revisited",
                date: "2023-04-16",
                language: "en",
                type: "poetry",
                excerpt: "An extended meditation on the meaning of creation...",
                content: `I envision a hand so transparent,
Weaving the threads of the conscious mind,
Pouring forth ideas, ever relentless,
Surrendering to the truth it finds,
Weightless and unconfined.

The thoughts cascading from that hand,
Must choose their path, to nurture or destroy,
To bring life to soil or burn the land,
Affecting past, present, and futures yet deployed.

A tree's branch must mimic its shadow,
Defying the ever-changing light,
And even if severed by life's harsh blow,
Still pointing to the same truth, both day and night.

In the palm of this ethereal hand,
A world of possibilities begins to unfurl,
Shaping destinies, like grains of sand,
That form a tapestry, complex and eternal.

The hand reaches out, transcending space,
Uniting minds and hearts across the divide,
With a touch, it can heal or retrace,
The memories etched within, that we often hide.

A catalyst for change, the hand's gentle sweep,
Can alter the course of life's uncertain stream,
Guiding us through darkness, both shallow and deep,
Nurturing hope and the power to dream.

The ethereal hand, a force unseen,
Holds the power to create, inspire and mend,
A reminder that amidst the chaos, we must glean,
The beauty of the connections that transcend.

And when the hand grasps the pen of fate,
Stories unfold in elegant prose,
The pages of life, both joyous and sedate,
Carry the tales that the ethereal hand knows.`,
                related: ["el"]
            }
            // More entries would be here...
        ];
    }

    initializeSystem() {
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Initial render
        this.renderWritings();
        
        // Set up terminal commands
        this.setupTerminalCommands();
    }

    initializeEventListeners() {
        // Filter clicks
        this.filters.forEach(filter => {
            filter.addEventListener('click', () => {
                this.handleFilter(filter);
            });
        });

        // Modal close
        document.querySelector('.close-btn').addEventListener('click', () => {
            this.closeWriting();
        });

        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeWriting();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeWriting();
            }
        });
    }

    handleFilter(filterBtn) {
        // Update active state
        this.filters.forEach(btn => btn.classList.remove('active'));
        filterBtn.classList.add('active');

        // Update filter state
        if (filterBtn.dataset.lang) {
            this.activeFilters.language = filterBtn.dataset.lang;
        }
        if (filterBtn.dataset.type) {
            this.activeFilters.type = filterBtn.dataset.type;
        }

        // Re-render with new filters
        this.renderWritings();
    }

    renderWritings() {
        // Clear existing content
        this.grid.innerHTML = '';

        // Filter writings
        const filtered = this.writings.filter(writing => {
            const langMatch = this.activeFilters.language === 'all' || 
                            writing.language === this.activeFilters.language;
            const typeMatch = this.activeFilters.type === 'all' || 
                            writing.type === this.activeFilters.type;
            return langMatch && typeMatch;
        });

        // Create and append cards
        filtered.forEach(writing => {
            this.grid.appendChild(this.createWritingCard(writing));
        });
    }

    createWritingCard(writing) {
        const card = document.createElement('div');
        card.className = 'writing-card';
        
        card.innerHTML = `
            <div class="writing-meta">
                <span class="writing-tag">${writing.language.toUpperCase()}</span>
                <span class="writing-tag">${writing.type}</span>
            </div>
            <h3 class="writing-title">${writing.title}</h3>
            <p class="writing-excerpt">${writing.excerpt}</p>
            <div class="writing-date">${new Date(writing.date).toLocaleDateString()}</div>
        `;

        // Add click handler
        card.addEventListener('click', () => this.openWriting(writing));
        
        return card;
    }

    openWriting(writing) {
        const content = document.getElementById('modal-text');
        const title = document.getElementById('modal-title');
        const meta = document.getElementById('modal-meta');

        // Set content
        title.textContent = writing.title;
        content.textContent = writing.content;
        meta.innerHTML = `
            <span class="writing-tag">${writing.language.toUpperCase()}</span>
            <span class="writing-tag">${writing.type}</span>
            <span class="writing-tag">${new Date(writing.date).toLocaleDateString()}</span>
        `;

        // Show modal
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeWriting() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    setupTerminalCommands() {
        if (typeof TerminalEmulator !== 'undefined') {
            TerminalEmulator.prototype.commands.writings = (args) => {
                if (!args.length) {
                    this.showWritingsList();
                    return;
                }

                switch(args[0]) {
                    case 'list':
                        this.showWritingsList();
                        break;
                    case 'show':
                        if (args[1]) {
                            this.showWritingInTerminal(args[1]);
                        } else {
                            this.terminal.addToTerminal('Usage: writings show <id>', 'error');
                        }
                        break;
                    case 'search':
                        if (args[1]) {
                            this.searchWritings(args.slice(1).join(' '));
                        } else {
                            this.terminal.addToTerminal('Usage: writings search <term>', 'error');
                        }
                        break;
                    case 'help':
                        this.showWritingsHelp();
                        break;
                    default:
                        this.terminal.addToTerminal('Unknown command. Type "writings help" for usage.', 'error');
                }
            };
        }
    }

    showWritingsList() {
        this.terminal.addToTerminal('Available writings:');
        this.writings.forEach(writing => {
            this.terminal.addToTerminal(
                `- ${writing.id}: ${writing.title} (${writing.language}/${writing.type})`
            );
        });
    }

    showWritingInTerminal(id) {
        const writing = this.writings.find(w => w.id === id);
        if (writing) {
            this.terminal.addToTerminal(`Title: ${writing.title}`);
            this.terminal.addToTerminal(`Date: ${writing.date}`);
            this.terminal.addToTerminal(`Type: ${writing.type}`);
            this.terminal.addToTerminal('---');
            this.terminal.addToTerminal(writing.content);
        } else {
            this.terminal.addToTerminal(`Writing "${id}" not found.`, 'error');
        }
    }

    searchWritings(term) {
        const results = this.writings.filter(writing => 
            writing.title.toLowerCase().includes(term.toLowerCase()) ||
            writing.content.toLowerCase().includes(term.toLowerCase())
        );

        if (results.length) {
            this.terminal.addToTerminal(`Found ${results.length} matching writings:`);
            results.forEach(writing => {
                this.terminal.addToTerminal(`- ${writing.id}: ${writing.title}`);
            });
        } else {
            this.terminal.addToTerminal('No matching writings found.');
        }
    }

    showWritingsHelp() {
        this.terminal.addToTerminal(`
Available commands:
  writings list              - List all writings
  writings show <id>         - Show full content of a writing
  writings search <term>     - Search writings for term
  writings help             - Show this help message
        `);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.writingsSystem = new WritingsSystem();
});