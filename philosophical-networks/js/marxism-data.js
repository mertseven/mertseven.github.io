// js/marxism-data.js
// Data structure for the Marxism visualization
const marxismData = {
    nodes: [
        // Core Concepts
        {
            id: "dialectical_materialism",
            name: "Dialectical Materialism",
            category: "concept",
            description: "Marx's adaptation of Hegel's dialectics, bringing it from the abstract realm of ideas to concrete material conditions. It views history as developing through contradictions in material forces, particularly economic ones."
        },
        {
            id: "historical_materialism",
            name: "Historical Materialism",
            category: "concept",
            description: "The materialist conception of history, asserting that socioeconomic factors and class struggle are the primary drivers of historical development, not ideas or consciousness."
        },
        {
            id: "class_struggle",
            name: "Class Struggle",
            category: "concept",
            description: "The theory that history moves forward through conflicts between economic classes, specifically the exploiters and the exploited. According to Marx, 'The history of all hitherto existing society is the history of class struggles.'"
        },
        {
            id: "alienation",
            name: "Alienation (Marx)", // Clarified for Marx
            category: "concept",
            description: "The separation of workers from the products of their labor, from the process of production, from their human nature (species-being), and from other people. In industrial capitalism, workers become disconnected from what they produce."
        },
        {
            id: "exploitation",
            name: "Exploitation",
            category: "concept",
            description: "The extraction of surplus value from workers by capitalists. Workers produce more value than they receive in wages, with the excess appropriated by the owning class."
        },
        {
            id: "base_superstructure",
            name: "Base & Superstructure",
            category: "concept",
            description: "The theory that the economic 'base' (means of production, relations of production) determines the 'superstructure' (culture, ideology, politics, law). The economic foundation shapes consciousness rather than vice versa."
        },
        {
            id: "capital",
            name: "Capital",
            category: "concept",
            description: "Money used to make more money, not simply for purchasing commodities. Capital is invested to accumulate more wealth through the exploitation of labor."
        },
        {
            id: "class_consciousness",
            name: "Class Consciousness",
            category: "concept",
            description: "The awareness of one's socioeconomic class interests, particularly the proletariat's recognition of their shared exploitation and the need for collective action against the capitalist system."
        },
        {
            id: "revolution",
            name: "Revolution (Marxist)", // Clarified
            category: "concept",
            description: "The forcible overthrow of the bourgeoisie by the proletariat, seen as a necessary step to abolish private property and establish socialist society. Marx believed revolution was inevitable as class antagonisms intensified."
        },
        {
            id: "communism",
            name: "Communism (Goal)", // Clarified
            category: "concept",
            description: "The final stage of historical development according to Marx, a classless society where private property is abolished, the means of production are communally owned, and people contribute according to ability and receive according to need."
        },

        // Shared Concepts with Hegelianism
        {
            id: "dialectics",
            name: "Dialectics (Hegel/Marx)", // Clarified
            category: "shared_concept",
            description: "The method of reasoning that understands development through contradictions and their resolutions. In Hegel, it applied to ideas; in Marx, to material conditions. Everything contains the seeds of its own negation."
        },
        {
            id: "historical_development",
            name: "Historical Development",
            category: "shared_concept",
            description: "The idea that history moves forward through stages, not randomly but according to identifiable patterns or laws. Both Hegel and Marx saw history as progressing through conflicts toward a final resolution."
        },
        {
            id: "totality",
            name: "Totality",
            category: "shared_concept",
            description: "The principle that phenomena must be understood as parts of a larger whole, not in isolation. 'The true is the whole' was Hegel's phrase, adapted by Marx to understand socioeconomic systems."
        },

        // Key Figures
        {
            id: "marx",
            name: "Karl Marx",
            category: "philosopher",
            years: "1818-1883",
            description: "German philosopher, economist, historian, and revolutionary who developed the theories of scientific socialism, historical materialism, and class struggle. Co-author of 'The Communist Manifesto' and author of 'Das Kapital.'"
        },
        {
            id: "engels",
            name: "Friedrich Engels",
            category: "philosopher",
            years: "1820-1895",
            description: "German philosopher, social scientist, and Marx's close collaborator. Co-author of 'The Communist Manifesto' and supporter of Marx's work. Developed theories on dialectics and political economy."
        },
        {
            id: "hegel",
            name: "G.W.F. Hegel",
            category: "philosopher", // Influence, but listed as philosopher as he is a key figure in his own right
            years: "1770-1831",
            description: "German idealist philosopher whose dialectical method and philosophy of history significantly influenced Marx, though Marx 'turned Hegel on his head' by applying dialectics to material conditions rather than ideas."
        },
        {
            id: "feuerbach",
            name: "Ludwig Feuerbach",
            category: "philosopher", // Influence
            years: "1804-1872",
            description: "German philosopher and anthropologist whose critique of religion and materialism influenced Marx's early thought. Marx later criticized Feuerbach for not extending his materialism to social and historical analysis."
        },
        {
            id: "lenin",
            name: "Vladimir Lenin",
            category: "philosopher", // Later figure influenced by Marx
            years: "1870-1924",
            description: "Russian revolutionary and political theorist who developed Marxism into Marxism-Leninism, adding the concept of a vanguard party to lead the revolution when the proletariat didn't spontaneously develop class consciousness."
        },

        // Key Groups/Classes (treated as 'concept' for coloring/filtering, could be 'movement' too)
        {
            id: "bourgeoisie",
            name: "Bourgeoisie",
            category: "concept", // Or 'group' if a new category is desired
            description: "The capitalist class who own the means of production and employ wage laborers. In Marx's theory, they appropriate surplus value from workers and form the ruling class in capitalist society."
        },
        {
            id: "proletariat",
            name: "Proletariat",
            category: "concept", // Or 'group'
            description: "The working class who must sell their labor to survive and don't own means of production. Marx saw them as the revolutionary class destined to overthrow capitalism and establish socialism."
        },
        {
            id: "left_hegelians",
            name: "Left Hegelians",
            category: "movement",
            description: "A group of German intellectuals who applied Hegel's methods to radical political ends, criticizing religion and the state. Marx was initially associated with this group before developing his own theories."
        },

        // Key Works
        {
            id: "communist_manifesto",
            name: "Communist Manifesto",
            category: "text",
            date: "1848",
            description: "Pamphlet written by Marx and Engels that articulated the communist program, analyzed capitalism, and called for workers of all countries to unite. Famous for its opening line: 'A specter is haunting Europe—the specter of communism.'"
        },
        {
            id: "das_kapital",
            name: "Das Kapital",
            category: "text",
            date: "1867 (Vol. 1)", // Clarified date for Vol 1
            description: "Marx's comprehensive critique of political economy that analyzed capitalism, the exploitation of labor, and the generation of surplus value. Only the first volume was published in Marx's lifetime."
        },
        {
            id: "german_ideology",
            name: "The German Ideology",
            category: "text",
            date: "written 1845-46, pub. 1932", // Clarified dates
            description: "Work by Marx and Engels that developed the concept of historical materialism, critiqued German idealism, and emphasized how material conditions shape consciousness rather than vice versa."
        },

        // Movements/Ideologies
        {
            id: "scientific_socialism",
            name: "Scientific Socialism",
            category: "movement", // Or 'concept'
            description: "Marx and Engels' approach to socialism based on scientific analysis of historical and economic conditions, contrasted with utopian socialism which they saw as idealistic and impractical."
        },
        {
            id: "capitalism",
            name: "Capitalism",
            category: "movement", // Or 'concept' representing the system
            description: "The economic system based on private ownership of the means of production and the exploitation of wage labor. Marx analyzed it as a historically specific mode of production destined to be overthrown."
        },
        {
            id: "communism_movement",
            name: "Communist Movement",
            category: "movement",
            description: "The international political movement seeking to establish socialism and eventually communism. Following Marx's ideas about the inevitability of proletarian revolution and the abolition of private property."
        },
        {
            id: "industrialization",
            name: "Industrialization",
            category: "event",
            description: "The transformation of manufacturing processes from hand production to machine production in factories. Marx saw this as the material foundation of capitalism and the creation of the modern proletariat."
        }
    ],
    
    links: [
        // Connecting Marx to his concepts
        { source: "marx", target: "dialectical_materialism", description: "Developed" },
        { source: "marx", target: "historical_materialism", description: "Formulated" },
        { source: "marx", target: "class_struggle", description: "Theorized" },
        { source: "marx", target: "alienation", description: "Analyzed" },
        { source: "marx", target: "base_superstructure", description: "Conceptualized" },
        { source: "marx", target: "capital", description: "Analyzed critically" },
        { source: "marx", target: "class_consciousness", description: "Theorized development of" },
        { source: "marx", target: "revolution", description: "Called for" },
        { source: "marx", target: "communism", description: "Envisioned" },
        
        // Marx and Engels collaboration
        { source: "marx", target: "engels", description: "Collaborated with" },
        { source: "engels", target: "dialectical_materialism", description: "Further developed" },
        { source: "engels", target: "scientific_socialism", description: "Co-developed" },
        
        // Influences on Marx
        { source: "hegel", target: "marx", description: "Influenced" },
        { source: "hegel", target: "dialectics", description: "Developed idealist version of" },
        { source: "marx", target: "dialectics", description: "Materialized" },
        { source: "feuerbach", target: "marx", description: "Influenced early thought of" },
        { source: "left_hegelians", target: "marx", description: "Initially influenced by" }, // Corrected desc.
        
        // Marx's works
        { source: "marx", target: "communist_manifesto", description: "Co-authored" },
        { source: "engels", target: "communist_manifesto", description: "Co-authored" },
        { source: "marx", target: "das_kapital", description: "Authored" },
        { source: "marx", target: "german_ideology", description: "Co-authored" },
        { source: "engels", target: "german_ideology", description: "Co-authored" },
        
        // Relationships between concepts
        { source: "dialectical_materialism", target: "historical_materialism", description: "Applied to history as" },
        { source: "historical_materialism", target: "class_struggle", description: "Identifies as primary driver" },
        { source: "alienation", target: "exploitation", description: "Accompanies" },
        { source: "capital", target: "exploitation", description: "Enables" },
        { source: "exploitation", target: "class_consciousness", description: "Eventually produces" },
        { source: "class_consciousness", target: "revolution", description: "Leads to" },
        { source: "revolution", target: "communism", description: "Aims to establish" },
        { source: "capitalism", target: "alienation", description: "Creates" },
        { source: "capitalism", target: "exploitation", description: "Is based on" },
        { source: "capitalism", target: "proletariat", description: "Creates" },
        { source: "capitalism", target: "bourgeoisie", description: "Empowers" },
        { source: "base_superstructure", target: "historical_materialism", description: "Core component of" },

        
        // Class relations
        { source: "bourgeoisie", target: "proletariat", description: "Exploits" },
        { source: "proletariat", target: "revolution", description: "Carries out" },
        { source: "proletariat", target: "class_consciousness", description: "Develops" },
        
        // Shared concepts with Hegelianism
        { source: "dialectics", target: "historical_development", description: "Drives" },
        { source: "historical_development", target: "totality", description: "Understood through" },
        { source: "dialectical_materialism", target: "dialectics", description: "Applies" },
        
        // Later developments
        { source: "lenin", target: "marx", description: "Developed ideas of" },
        { source: "lenin", target: "communism_movement", description: "Led part of" }, // Adjusted desc
        { source: "marx", target: "scientific_socialism", description: "Founded" },
        { source: "marx", target: "communism_movement", description: "Inspired" },
        
        // Material conditions
        { source: "industrialization", target: "capitalism", description: "Enabled growth of" }, // Adjusted
        { source: "industrialization", target: "proletariat", description: "Expanded" }, // Adjusted
        { source: "industrialization", target: "alienation", description: "Intensified" },
        
        // Intersecting concepts
        { source: "class_struggle", target: "historical_development", description: "Drives" },
        { source: "das_kapital", target: "capital", description: "Analyzes nature of" }, // Added
        { source: "german_ideology", target: "historical_materialism", description: "Develops concept of" }, // Added
        { source: "communist_manifesto", target: "class_struggle", description: "Outlines theory of" } // Added
    ]
};