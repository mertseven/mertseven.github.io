// js/nietzsche-data.js
// Data structure for the Nietzsche visualization
const nietzscheData = {
    nodes: [
        // Core Concepts
        {
            id: "will_to_power",
            name: "Will to Power",
            category: "concept",
            description: "One of Nietzsche's central concepts, describing the primary driving force in humans: achievement, ambition, the striving to reach the highest possible position in life. Not simply a will to exist, but to assert one's strength and superiority."
        },
        {
            id: "eternal_recurrence",
            name: "Eternal Recurrence",
            category: "concept",
            description: "The idea that all events will repeat themselves endlessly in exactly the same sequence. Nietzsche proposes it as a thought experiment: would you be willing to live your life over and over, exactly the same way? Only the Übermensch could embrace this concept."
        },
        {
            id: "ubermensch",
            name: "Übermensch",
            category: "concept",
            description: "The 'Overman' or 'Superman' who transcends conventional morality and creates their own values. Not a biological evolution but a cultural/spiritual one—someone who can live authentically in a world without meaning imposed from outside themselves."
        },
        {
            id: "death_of_god",
            name: "Death of God",
            category: "concept",
            description: "Nietzsche's declaration that 'God is dead' signifies the end of belief in cosmic order or objective meaning in the universe. This creates both a crisis (nihilism) and an opportunity for humans to create their own values and meaning."
        },
        {
            id: "nihilism",
            name: "Nihilism",
            category: "concept",
            description: "The state resulting from the 'death of God' where traditional values become devalued and life appears to have no inherent meaning. Nietzsche saw nihilism as both a crisis and a necessary transitional stage toward the creation of new values."
        },
        {
            id: "master_slave_morality",
            name: "Master-Slave Morality",
            category: "concept",
            description: "Nietzsche's distinction between 'master morality' (centered on nobility, strength, and power) and 'slave morality' (centered on resentment, with values like humility, sympathy, and equality). Christianity, according to Nietzsche, represents slave morality."
        },
        {
            id: "perspectivism",
            name: "Perspectivism",
            category: "concept",
            description: "The philosophical view that all knowledge is perspective-dependent—there are no objective facts, only interpretations. Nietzsche rejected the idea of absolute truth, seeing knowledge claims as expressions of power and perspective."
        },
        {
            id: "ressentiment",
            name: "Ressentiment",
            category: "concept",
            description: "A form of resentment that involves redirecting feelings of hostility and hatred toward the object that created those feelings. Nietzsche associated ressentiment with slave morality, which he saw as originating from the weak's inability to express power directly."
        },
        {
            id: "apollonian_dionysian",
            name: "Apollonian-Dionysian",
            category: "concept",
            description: "Two opposing creative tendencies or forces in Greek culture: the Apollonian (rational, ordered, restrained) and the Dionysian (ecstatic, instinctual, chaotic). Nietzsche argued that the tension between these forces produced Greek tragedy and true artistic creation."
        },
        {
            id: "self_overcoming",
            name: "Self-Overcoming",
            category: "concept",
            description: "The process by which an individual might transform themselves to reach a higher state. For Nietzsche, self-overcoming meant conquering one's weaknesses, overcoming conventional morality, and creating one's own values in pursuit of becoming the Übermensch."
        },
        
        // Shared Concepts with Other Philosophers
        {
            id: "dialectical_thinking",
            name: "Dialectical Thinking (N)", // Clarified for Nietzsche
            category: "shared_concept",
            description: "Though Nietzsche criticized Hegel, his thought displays dialectical elements in the way he describes how concepts contain their opposites and great things bring about their own destruction through 'self-overcoming'."
        },
        {
            id: "aestheticism",
            name: "Aestheticism (N)", // Clarified
            category: "shared_concept",
            description: "The view that art and aesthetic experience are central to human life. Nietzsche shared with the Romantics the belief that 'only as an aesthetic phenomenon is existence and the world justified,' emphasizing creation over moral conformity."
        },
        {
            id: "critique_of_reason",
            name: "Critique of Reason (N)", // Clarified
            category: "shared_concept",
            description: "Like many post-Enlightenment thinkers, Nietzsche questioned the supremacy of reason, highlighting its limitations and challenging the idea that rationality alone could provide a foundation for values or knowledge."
        },
        
        // Key Texts
        {
            id: "birth_of_tragedy",
            name: "The Birth of Tragedy",
            category: "text",
            date: "1872",
            description: "Nietzsche's first major work, exploring the development of art through the tension between Apollonian and Dionysian impulses. Dedicated to Wagner, it presented Wagner's music as the rebirth of tragic art in modern culture."
        },
        {
            id: "untimely_meditations",
            name: "Untimely Meditations",
            category: "text",
            date: "1873-1876",
            description: "A series of four essays including 'The Uses and Disadvantages of History for Life,' where Nietzsche argues that excessive historical awareness can paralyze action, and that only the strong can properly digest history."
        },
        {
            id: "human_all_too_human",
            name: "Human, All Too Human",
            category: "text",
            date: "1878",
            description: "Marked Nietzsche's break with Wagner and romanticism, moving toward a more positivistic, scientific approach. Written after his health deteriorated, it explores psychological insights into human behavior and morality."
        },
        {
            id: "gay_science",
            name: "The Gay Science",
            category: "text",
            date: "1882",
            description: "Contains Nietzsche's first proclamation that 'God is dead' and introduces eternal recurrence. The title references the medieval concept of 'joyous science,' suggesting knowledge mixed with creativity, humor, and delight."
        },
        {
            id: "thus_spoke_zarathustra",
            name: "Thus Spoke Zarathustra",
            category: "text",
            date: "1883-1885",
            description: "Nietzsche's most poetic work, written in biblical style, featuring the prophet Zarathustra who comes down from his mountain to teach humanity about the Übermensch, will to power, and eternal recurrence."
        },
        {
            id: "beyond_good_and_evil",
            name: "Beyond Good and Evil",
            category: "text",
            date: "1886",
            description: "A critique of traditional morality and philosophy, arguing for perspectivism—that there are no objective facts, only interpretations. Nietzsche challenges philosophers to move 'beyond good and evil' in their thinking."
        },
        {
            id: "genealogy_of_morals",
            name: "On the Genealogy of Morals", // Full title for clarity
            category: "text",
            date: "1887",
            description: "A study of the origins of morality, particularly how 'slave morality' arises from ressentiment. Nietzsche traces the historical transformation of values, challenging the assumption that 'good' has always meant the same thing."
        },
        
        // Key Figures
        {
            id: "nietzsche",
            name: "Friedrich Nietzsche",
            category: "philosopher",
            years: "1844-1900",
            description: "German philosopher, cultural critic, poet, and philologist whose work has exerted a profound influence on modern intellectual history. Known for his critique of religion and morality, perspectivism, and concepts like the death of God, will to power, and eternal recurrence."
        },
        {
            id: "wagner",
            name: "Richard Wagner",
            category: "influence", // This category is for people/ideas that influenced Nietzsche
            years: "1813-1883",
            description: "German composer whose music dramas Nietzsche initially championed as the rebirth of tragic art. Their relationship later soured, with Nietzsche criticizing Wagner's German nationalism, anti-Semitism, and what he saw as a surrender to Christian values."
        },
        {
            id: "schopenhauer",
            name: "Arthur Schopenhauer",
            category: "influence",
            years: "1788-1860",
            description: "German philosopher whose concept of 'will' as the essence of existence profoundly influenced Nietzsche. Though Nietzsche eventually rejected Schopenhauer's pessimistic conclusions, the elder philosopher's emphasis on will and critique of rationalism remained important."
        },
        {
            id: "socrates",
            name: "Socrates",
            category: "influence", // Socrates as an influence (mostly negative, but formative)
            years: "c. 470-399 BCE", // BCE
            description: "Greek philosopher whom Nietzsche critiqued as representing the triumph of rationality over instinct in Western thought. In 'The Birth of Tragedy,' Nietzsche associated Socrates with the Apollonian principle that he believed had overwhelmed the Dionysian spirit."
        },
        {
            id: "zarathustra",
            name: "Zarathustra (Character)", // Clarified
            category: "character", // A distinct category for fictional/allegorical figures
            description: "The prophet-like figure and protagonist of Nietzsche's most famous work 'Thus Spoke Zarathustra.' An alter ego of Nietzsche himself, Zarathustra descends from his mountain solitude to teach humanity about the Übermensch and the death of God."
        },
        {
            id: "lou_salome",
            name: "Lou Salomé",
            category: "influence", // Influence on Nietzsche's life/thought
            years: "1861-1937",
            description: "Russian-born intellectual with whom Nietzsche fell in love and proposed marriage (through a friend) in 1882. Her rejection deeply affected him. Later she became a psychoanalyst, writer, and collaborator with both Freud and Rilke."
        },
        
        // Movements/Schools
        {
            id: "romanticism",
            name: "Romanticism",
            category: "movement", // Romanticism as a broader movement
            description: "Artistic and intellectual movement that Nietzsche both drew from and critiqued. He shared the Romantics' emphasis on passion, creativity, and skepticism toward rationalism, while later rejecting what he saw as their sentimentality and idealism."
        },
        {
            id: "existentialism",
            name: "Existentialism",
            category: "movement", // Movement influenced BY Nietzsche
            description: "Philosophical movement that emerged after Nietzsche but was profoundly influenced by his work. Existentialists share Nietzsche's concern with authenticity, the absence of objective meaning, and the task of creating value in a godless world."
        },
        {
            id: "postmodernism",
            name: "Postmodernism",
            category: "movement", // Movement influenced BY Nietzsche
            description: "Later intellectual movement that drew on Nietzsche's perspectivism, critique of absolute truth, and genealogical method. Postmodernists expanded Nietzsche's questioning of foundations into a broader skepticism toward grand narratives and universal claims."
        },
        {
            id: "philology",
            name: "Philology",
            category: "field", // Nietzsche's academic field
            description: "The study of language in historical texts, which was Nietzsche's academic discipline. His philological training informed his genealogical approach to morality and his attention to how concepts evolve and transform through history."
        }
    ],
    
    links: [
        // Nietzsche's relationship to his concepts
        { source: "nietzsche", target: "will_to_power", description: "Developed concept of" },
        { source: "nietzsche", target: "eternal_recurrence", description: "Proposed concept of" },
        { source: "nietzsche", target: "ubermensch", description: "Conceptualized" },
        { source: "nietzsche", target: "death_of_god", description: "Proclaimed" },
        { source: "nietzsche", target: "nihilism", description: "Analyzed" },
        { source: "nietzsche", target: "master_slave_morality", description: "Distinguished" },
        { source: "nietzsche", target: "perspectivism", description: "Advocated" },
        { source: "nietzsche", target: "ressentiment", description: "Identified" },
        { source: "nietzsche", target: "apollonian_dionysian", description: "Explored" },
        { source: "nietzsche", target: "self_overcoming", description: "Emphasized" },
        
        // Nietzsche's relationship to shared concepts
        { source: "nietzsche", target: "dialectical_thinking", description: "Employed elements of" },
        { source: "nietzsche", target: "aestheticism", description: "Embraced form of" },
        { source: "nietzsche", target: "critique_of_reason", description: "Advanced" },
        
        // Nietzsche's works
        { source: "nietzsche", target: "birth_of_tragedy", description: "Authored" },
        { source: "nietzsche", target: "untimely_meditations", description: "Authored" },
        { source: "nietzsche", target: "human_all_too_human", description: "Authored" },
        { source: "nietzsche", target: "gay_science", description: "Authored" },
        { source: "nietzsche", target: "thus_spoke_zarathustra", description: "Authored" },
        { source: "nietzsche", target: "beyond_good_and_evil", description: "Authored" },
        { source: "nietzsche", target: "genealogy_of_morals", description: "Authored" },
        
        // Key concepts in works
        { source: "birth_of_tragedy", target: "apollonian_dionysian", description: "Introduces" },
        { source: "gay_science", target: "death_of_god", description: "First proclaims" },
        { source: "gay_science", target: "eternal_recurrence", description: "Introduces" },
        { source: "thus_spoke_zarathustra", target: "ubermensch", description: "Teaches about" },
        { source: "thus_spoke_zarathustra", target: "eternal_recurrence", description: "Develops" },
        { source: "beyond_good_and_evil", target: "perspectivism", description: "Elaborates" },
        { source: "beyond_good_and_evil", target: "master_slave_morality", description: "Examines" },
        { source: "genealogy_of_morals", target: "ressentiment", description: "Analyzes role of" },
        { source: "genealogy_of_morals", target: "master_slave_morality", description: "Traces origins of" },
        
        // Influence relationships
        { source: "schopenhauer", target: "nietzsche", description: "Profoundly influenced" },
        { source: "wagner", target: "nietzsche", description: "Initially inspired, later rejected by" },
        // { source: "nietzsche", target: "wagner", description: "Later critiqued" }, // Covered by above
        { source: "socrates", target: "nietzsche", description: "Object of critique for" },
        // { source: "nietzsche", target: "socrates", description: "Critiqued" }, // Covered by above
        { source: "lou_salome", target: "nietzsche", description: "Intellectual peer & unrequited love for" },
        
        // Movement relationships
        { source: "romanticism", target: "nietzsche", description: "Influenced and critiqued by" },
        // { source: "nietzsche", target: "romanticism", description: "Critiqued" }, // Covered by above
        { source: "nietzsche", target: "existentialism", description: "Major precursor to" },
        { source: "nietzsche", target: "postmodernism", description: "Major precursor to" },
        { source: "philology", target: "nietzsche", description: "Academic training of" },
        
        // Concept interrelationships
        { source: "death_of_god", target: "nihilism", description: "Leads to potential for" },
        { source: "death_of_god", target: "ubermensch", description: "Creates necessity for" },
        { source: "nihilism", target: "will_to_power", description: "Can be overcome through" },
        { source: "will_to_power", target: "self_overcoming", description: "Is driving force of" },
        { source: "self_overcoming", target: "ubermensch", description: "Process towards" },
        { source: "ressentiment", target: "master_slave_morality", description: "Motivates slave morality in" },
        { source: "eternal_recurrence", target: "ubermensch", description: "Affirmed by" },
        { source: "perspectivism", target: "critique_of_reason", description: "Underpins" },
        { source: "apollonian_dionysian", target: "aestheticism", description: "Central to Nietzsche's" },
        
        // Character connections
        { source: "zarathustra", target: "ubermensch", description: "Proclaims" },
        { source: "zarathustra", target: "death_of_god", description: "Announces" },
        { source: "zarathustra", target: "eternal_recurrence", description: "Teaches" },
        { source: "nietzsche", target: "zarathustra", description: "Created character of" }
    ]
};