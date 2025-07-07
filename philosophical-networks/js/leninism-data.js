// js/leninism-data.js
// Data structure for the Leninism visualization
const leninismData = {
    nodes: [
        // Core Concepts
        {
            id: "vanguard_party",
            name: "Vanguard Party",
            category: "concept",
            description: "Lenin's innovation of a disciplined elite of professional revolutionaries who would bring class consciousness to the workers from without. This centralized party would serve as the leading force in revolutionary struggle, compensating for workers' tendency toward 'trade union consciousness.'"
        },
        {
            id: "professional_revolutionaries",
            name: "Professional Revolutionaries",
            category: "concept",
            description: "Lenin's conception of dedicated individuals who make revolutionary activity their profession. These militants devote their entire lives to revolutionary struggle, operating under conditions of secrecy and discipline to advance the revolution."
        },
        {
            id: "democratic_centralism",
            name: "Democratic Centralism",
            category: "concept",
            description: "The organizational principle of Leninism combining democratic discussion with centralized authority. Once a decision is made through democratic deliberation, all party members must adhere to it, ensuring unity of action and discipline."
        },
        {
            id: "rushing_history",
            name: "Rushing History",
            category: "concept",
            description: "Lenin's belief that historical development could be accelerated through the conscious intervention of the vanguard party. Rather than waiting for historical conditions to mature naturally, revolutionaries could jumpstart the process by bringing consciousness to the masses."
        },
        {
            id: "dual_power",
            name: "Dual Power",
            category: "concept",
            description: "The situation after the February Revolution where power was split between the Provisional Government and the Soviets (workers' councils). Lenin identified this as a transitional state that would inevitably resolve in favor of one class or another."
        },
        {
            id: "revolutionary_defeatism",
            name: "Revolutionary Defeatism",
            category: "concept",
            description: "Lenin's position during World War I that workers should oppose their own governments' war efforts and transform the imperialist war into a civil war against the bourgeoisie. This internationalist stance rejected national unity during wartime."
        },
        {
            id: "imperialism",
            name: "Imperialism (Lenin)", // Clarified
            category: "concept",
            description: "Lenin's theory that capitalism had evolved into a higher stage characterized by monopoly capital, finance capital, export of capital, and colonial division of the world. He described imperialism as the 'highest stage of capitalism.'"
        },
        {
            id: "consciousness_from_without",
            name: "Consciousness From Without",
            category: "concept",
            description: "Lenin's argument that workers by themselves could only develop trade union consciousness, and that revolutionary consciousness must be brought to them by intellectuals outside the working class. This justified the role of the vanguard party."
        },
        
        // Shared Concepts with Marxism
        {
            id: "class_consciousness",
            name: "Class Consciousness (L)", // Clarified for Lenin's take
            category: "shared_concept",
            description: "The awareness of one's position within class relations and the understanding of collective class interests. While Marx believed this would develop naturally through workers' experience, Lenin argued it needed to be brought from without by the party."
        },
        {
            id: "dictatorship_of_proletariat",
            name: "Dictatorship of Proletariat",
            category: "shared_concept",
            description: "The concept that after the revolution, the working class must establish its political rule to suppress counter-revolution and lay the groundwork for socialism. In Lenin's interpretation, this was exercised through the party as representative of the class."
        },
        {
            id: "dialectical_materialism",
            name: "Dialectical Materialism (L)", // Clarified
            category: "shared_concept",
            description: "The philosophical foundation of Marxist theory viewing history as the result of material conditions and class struggle. Lenin maintained this framework while emphasizing the role of conscious revolutionary activity in the dialectical process."
        },
        {
            id: "revolutionary_theory",
            name: "Revolutionary Theory",
            category: "shared_concept",
            description: "The systematic body of ideas guiding revolutionary practice. Lenin emphasized that 'without revolutionary theory, there can be no revolutionary movement,' highlighting the importance of theoretical clarity for successful action."
        },
        
        // Key Texts
        {
            id: "what_is_to_be_done",
            name: "What Is To Be Done?",
            category: "text",
            date: "1902",
            description: "Lenin's seminal work outlining his theory of the vanguard party and arguing against 'economism' (focusing only on economic struggles). He contends that revolutionary consciousness must be brought to workers from without by professional revolutionaries."
        },
        {
            id: "imperialism_highest_stage",
            name: "Imperialism (Text)", // Shortened
            category: "text",
            date: "1916",
            description: "Lenin's analysis of capitalism's evolution into imperialism, characterized by monopoly, finance capital, and colonial division of the world. He argued that imperialism creates conditions for revolution in both advanced and colonized countries."
        },
        {
            id: "state_and_revolution",
            name: "State and Revolution",
            category: "text",
            date: "1917",
            description: "Written during the 1917 revolutions, this text outlines Lenin's theory of the state as an instrument of class rule and the need to smash the bourgeois state apparatus rather than simply taking it over. It explains his vision of the dictatorship of the proletariat."
        },
        {
            id: "april_theses",
            name: "April Theses",
            category: "text",
            date: "1917",
            description: "Lenin's program upon returning to Russia in April 1917, calling for Soviet power, no support for the Provisional Government, confiscation of landed estates, nationalization of banks, and immediate steps toward socialism."
        },
        {
            id: "left_wing_communism",
            name: "\"Left-Wing\" Communism", // Shortened
            category: "text",
            date: "1920",
            description: "Lenin's critique of 'ultra-left' tendencies in the international communist movement, arguing for tactical flexibility including participation in bourgeois parliaments and work in reactionary trade unions to win the masses."
        },
        
        // Key Figures
        {
            id: "lenin",
            name: "Vladimir Lenin",
            category: "philosopher", // Key figure of this viz
            years: "1870-1924",
            description: "Russian revolutionary, political theorist, and founder of the Bolshevik Party who led the October Revolution of 1917. Lenin developed Marxist theory to address conditions in less developed countries and emphasized the role of the vanguard party in revolutionary struggle."
        },
        {
            id: "trotsky",
            name: "Leon Trotsky",
            category: "philosopher", // Key contemporary/ally/opponent
            years: "1879-1940",
            description: "Originally a Menshevik who joined the Bolsheviks in 1917, became a key leader of the October Revolution. Developed the theory of permanent revolution and organized the Red Army. After Lenin's death, opposed Stalin and was eventually assassinated in exile."
        },
        {
            id: "luxembourg",
            name: "Rosa Luxemburg",
            category: "philosopher", // Key critic
            years: "1871-1919",
            description: "Polish-German revolutionary who criticized Lenin's centralism, arguing that revolutionary energy must come from the proletariat itself rather than being imposed by an elite. She believed in the spontaneity of the masses while maintaining commitment to revolutionary socialism."
        },
        {
            id: "lukacs",
            name: "György Lukács",
            category: "philosopher", // Theorist of Leninism
            years: "1885-1971",
            description: "Hungarian Marxist philosopher who defended Lenin's concept of the party as the embodiment of proletarian class consciousness. Developed the theory of reification and contributed to Western Marxism while maintaining support for Leninism."
        },
        {
            id: "marx",
            name: "Karl Marx", // Already in Marxism data, here as influence
            category: "influence", 
            years: "1818-1883",
            description: "German philosopher, economist, and revolutionary whose theories of historical materialism, class struggle, and capitalism formed the basis of communist theory. Lenin adapted Marx's ideas to conditions in less developed countries like Russia."
        },
        {
            id: "hegel",
            name: "G.W.F. Hegel", // Already in Hegel data, here as influence
            category: "influence", 
            years: "1770-1831",
            description: "German philosopher whose dialectical method influenced Marx and subsequently Lenin. Lenin studied Hegel's Logic during World War I, emphasizing the importance of dialectics for understanding revolutionary change and development."
        },
        {
            id: "nicholas_ii",
            name: "Tsar Nicholas II",
            category: "influence", // Contextual figure
            years: "1868-1918",
            description: "The last Emperor of Russia whose autocratic rule, military failures in World War I, and inability to address social problems led to revolution. His abdication in February 1917 created the power vacuum that eventually enabled the Bolshevik seizure of power."
        },
        {
            id: "kerensky",
            name: "Alexander Kerensky",
            category: "influence", // Contextual figure
            years: "1881-1970",
            description: "Russian revolutionary who served as the head of the Provisional Government after the February Revolution. His decision to continue Russia's participation in World War I and delay social reforms contributed to the Bolsheviks' rise to power."
        },
        
        // Events
        {
            id: "1903_congress",
            name: "RSDLP Congress (1903)", // Clarified
            category: "event",
            date: "1903",
            description: "The congress where the Russian Social Democratic Labor Party split into Bolshevik (majority) and Menshevik (minority) factions over questions of party organization. Lenin's faction advocated for a disciplined party of professional revolutionaries."
        },
        {
            id: "1905_revolution",
            name: "1905 Revolution",
            category: "event",
            date: "1905",
            description: "A wave of mass political and social unrest in the Russian Empire, triggered by the Bloody Sunday massacre. Though unsuccessful in overthrowing tsarism, it demonstrated revolutionary potential and led to the formation of the first soviets."
        },
        {
            id: "february_revolution",
            name: "February Revolution",
            category: "event",
            date: "Feb 1917", // Shortened
            description: "The first of two revolutions in Russia in 1917, resulting in the abdication of Tsar Nicholas II and establishment of the Provisional Government alongside the Petrograd Soviet, creating a situation of dual power."
        },
        {
            id: "october_revolution",
            name: "October Revolution",
            category: "event",
            date: "Oct 1917", // Shortened
            description: "The Bolshevik seizure of power from the Provisional Government, led by Lenin. Often called the Bolshevik Revolution, it established the world's first socialist state and marked the beginning of the Soviet era in Russia."
        },
        {
            id: "civil_war",
            name: "Russian Civil War",
            category: "event",
            date: "1918-1922",
            description: "A multi-party war following the October Revolution, fought between the Red Army (Bolsheviks) and the White Army (anti-Bolshevik forces). The Bolshevik victory consolidated Soviet power but at enormous human and economic cost."
        },
        {
            id: "brest_litovsk",
            name: "Treaty of Brest-Litovsk",
            category: "event",
            date: "Mar 1918", // Shortened
            description: "The peace treaty between the new Bolshevik government and the Central Powers, ending Russia's participation in World War I. Lenin agreed to harsh terms, believing world revolution was imminent and territorial losses temporary."
        },
        
        // Movements/Organizations
        {
            id: "bolsheviks",
            name: "Bolsheviks",
            category: "movement",
            description: "The majority faction of the Russian Social Democratic Labor Party after the 1903 split, led by Lenin. Advocates of a disciplined, centralized revolutionary party, the Bolsheviks seized power in October 1917 and established Soviet rule."
        },
        {
            id: "mensheviks",
            name: "Mensheviks",
            category: "movement",
            description: "The minority faction of the Russian Social Democratic Labor Party after the 1903 split. They advocated for a broader, more democratic party structure and believed Russia needed to complete its bourgeois-democratic revolution before socialism was possible."
        },
        {
            id: "comintern",
            name: "Comintern", // Shortened
            category: "movement",
            date: "1919-1943",
            description: "Also known as the Third International, an organization founded by Lenin to coordinate revolutionary activity worldwide and support the development of communist parties. It aimed to promote world revolution following the Bolshevik model."
        },
        {
            id: "soviets",
            name: "Soviets",
            category: "movement", // Or 'concept' of workers' councils
            description: "Workers' councils that emerged during the 1905 and 1917 revolutions, representing a form of direct democracy. Lenin recognized their revolutionary potential and articulated the slogan 'All Power to the Soviets' as an alternative to the Provisional Government."
        },
        {
            id: "russian_sdlp",
            name: "Russian SDLP", // Shortened
            category: "movement",
            description: "The Marxist political party established in 1898 that split in 1903 into Bolshevik and Menshevik factions. The party attempted to apply Marxist theory to conditions in the Russian Empire and organize the emerging working class."
        },
        
        // Opposition/Critiques
        {
            id: "spontaneity",
            name: "Spontaneity Theory",
            category: "critique",
            description: "The view, criticized by Lenin, that revolutionary consciousness would develop spontaneously among workers through their experiences of exploitation. Luxembourg advocated a modified version of this, emphasizing mass action while maintaining revolutionary goals."
        },
        {
            id: "economism",
            name: "Economism",
            category: "critique",
            description: "The tendency, strongly criticized by Lenin, to focus exclusively on economic struggles and immediate demands of workers rather than political revolution. Lenin saw this as limiting workers to 'trade union consciousness' instead of revolutionary consciousness."
        },
        {
            id: "centralism_critique",
            name: "Critique of Centralism",
            category: "critique",
            description: "The criticism, articulated by figures like Rosa Luxemburg, that Lenin's centralized party structure would lead to bureaucratization, separation from the masses, and eventually conservatism rather than revolutionary energy."
        },
        {
            id: "substitutionism",
            name: "Substitutionism",
            category: "critique",
            description: "The critique that Leninism substitutes the party for the class, with the party claiming to represent the 'true interests' of the proletariat regardless of what actual workers think or want. This was seen as potentially leading to authoritarianism."
        }
    ],
    
    links: [
        // Lenin's relationship to his concepts
        { source: "lenin", target: "vanguard_party", description: "Developed" },
        { source: "lenin", target: "professional_revolutionaries", description: "Advocated for" },
        { source: "lenin", target: "democratic_centralism", description: "Formulated principle of" },
        { source: "lenin", target: "rushing_history", description: "Believed in" },
        { source: "lenin", target: "dual_power", description: "Analyzed concept of" },
        { source: "lenin", target: "revolutionary_defeatism", description: "Advocated" },
        { source: "lenin", target: "imperialism", description: "Theorized" },
        { source: "lenin", target: "consciousness_from_without", description: "Argued for" },
        
        // Lenin's relationship to shared concepts
        { source: "lenin", target: "class_consciousness", description: "Reinterpreted role of" },
        { source: "lenin", target: "dictatorship_of_proletariat", description: "Implemented version of" },
        { source: "lenin", target: "dialectical_materialism", description: "Applied" },
        { source: "lenin", target: "revolutionary_theory", description: "Emphasized importance of" },
        
        // Lenin's works
        { source: "lenin", target: "what_is_to_be_done", description: "Authored" },
        { source: "lenin", target: "imperialism_highest_stage", description: "Authored" },
        { source: "lenin", target: "state_and_revolution", description: "Authored" },
        { source: "lenin", target: "april_theses", description: "Authored" },
        { source: "lenin", target: "left_wing_communism", description: "Authored" },
        
        // Key concepts in works
        { source: "what_is_to_be_done", target: "vanguard_party", description: "Introduces" },
        { source: "what_is_to_be_done", target: "professional_revolutionaries", description: "Defines role of" },
        { source: "what_is_to_be_done", target: "consciousness_from_without", description: "Argues for" },
        { source: "what_is_to_be_done", target: "economism", description: "Critiques" },
        { source: "imperialism_highest_stage", target: "imperialism", description: "Analyzes" },
        { source: "state_and_revolution", target: "dictatorship_of_proletariat", description: "Elaborates on" },
        { source: "april_theses", target: "dual_power", description: "Addresses issue of" },
        { source: "april_theses", target: "soviets", description: "Called for power to" },
        { source: "left_wing_communism", target: "revolutionary_theory", description: "Discusses application of" },
        
        // Relationships with other figures
        { source: "marx", target: "lenin", description: "Foundation for" },
        { source: "hegel", target: "lenin", description: "Methodological influence on (via Marx)" },
        { source: "lenin", target: "trotsky", description: "Collaborated with, later opposed by Stalin with" },
        { source: "lenin", target: "luxembourg", description: "Debated with on party organization" },
        { source: "lenin", target: "lukacs", description: "Influenced writings of" },
        { source: "luxembourg", target: "centralism_critique", description: "Articulated" },
        { source: "luxembourg", target: "spontaneity", description: "Advocated for role of" },
        { source: "lukacs", target: "vanguard_party", description: "Theorized role of" }, // Lukacs on vanguard party
        
        // Event relationships
        { source: "lenin", target: "1903_congress", description: "Led Bolshevik faction at" },
        { source: "lenin", target: "february_revolution", description: "Returned to Russia after" },
        { source: "lenin", target: "october_revolution", description: "Led" },
        { source: "lenin", target: "civil_war", description: "Led Bolsheviks during" },
        { source: "lenin", target: "brest_litovsk", description: "Advocated for signing" },
        { source: "february_revolution", target: "dual_power", description: "Created situation of" },
        { source: "kerensky", target: "february_revolution", description: "Key figure in Provisional Gov. after" },
        { source: "nicholas_ii", target: "february_revolution", description: "Overthrown by" },
        { source: "1905_revolution", target: "soviets", description: "Led to emergence of first" },
        { source: "1905_revolution", target: "lenin", description: "Provided lessons for" },
        
        // Organization relationships
        { source: "lenin", target: "bolsheviks", description: "Leader of" },
        { source: "lenin", target: "comintern", description: "Founded" },
        { source: "trotsky", target: "bolsheviks", description: "Joined" },
        { source: "bolsheviks", target: "october_revolution", description: "Executed" },
        { source: "mensheviks", target: "bolsheviks", description: "Opposed faction to" },
        { source: "russian_sdlp", target: "bolsheviks", description: "Split into (and Mensheviks)" },
        { source: "russian_sdlp", target: "mensheviks", description: "Split from (with Bolsheviks)" },
        { source: "bolsheviks", target: "comintern", description: "Dominated" },
        { source: "soviets", target: "dual_power", description: "One center of power in" },
        
        // Critique relationships
        { source: "lenin", target: "economism", description: "Strongly opposed" },
        { source: "lenin", target: "spontaneity", description: "Argued against pure reliance on" },
        { source: "luxembourg", target: "vanguard_party", description: "Criticized concept of" }, // Explicit critique
        { source: "substitutionism", target: "vanguard_party", description: "Is a critique of" },
        { source: "centralism_critique", target: "democratic_centralism", description: "Targets principle of" },
        
        // Concept interrelationships
        { source: "vanguard_party", target: "professional_revolutionaries", description: "Composed of" },
        { source: "vanguard_party", target: "democratic_centralism", description: "Organized by principle of" },
        { source: "vanguard_party", target: "consciousness_from_without", description: "Justified by need for" },
        { source: "rushing_history", target: "vanguard_party", description: "Achieved through action of" },
        { source: "class_consciousness", target: "consciousness_from_without", description: "Developed through (Lenin's view)" },
        { source: "revolutionary_defeatism", target: "imperialism", description: "Strategy during era of" },
        { source: "dictatorship_of_proletariat", target: "state_and_revolution", description: "Elaborated in" },
        { source: "bolsheviks", target: "vanguard_party", description: "Exemplified model of" }
    ]
};