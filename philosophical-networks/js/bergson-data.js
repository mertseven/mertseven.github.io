// js/bergson-data.js
// Data structure for the Bergson visualization
const bergsonData = {
    nodes: [
        // Core Concepts
        {
            id: "duree",
            name: "Durée (Duration)",
            category: "concept",
            description: "Bergson's central concept of time as a continuous, flowing, qualitative experience that cannot be divided into discrete units. Duration is our direct experience of time as an organic whole where past, present, and future interpenetrate."
        },
        {
            id: "continuous_time",
            name: "Continuous Time",
            category: "concept",
            description: "Bergson argues that real time is continuous rather than discrete. It cannot be divided into separate instants or measured like space. It is experienced as an unbroken flow where moments melt into each other."
        },
        {
            id: "qualitative_multiplicity",
            name: "Qualitative Multiplicity",
            category: "concept",
            description: "A form of multiplicity that cannot be counted or measured, characterized by interpenetration and organic unity. Contrasted with quantitative multiplicity, which can be divided into discrete units."
        },
        {
            id: "free_will",
            name: "Free Will",
            category: "concept",
            description: "Bergson connects the continuity of time to the possibility of free will. He argues that our experience of duration creates the conditions for genuine freedom and spontaneous acts that cannot be determined in advance."
        },
        {
            id: "elan_vital",
            name: "Élan Vital",
            category: "concept",
            description: "The vital impulse or life force that Bergson sees as the creative principle behind evolution. This force drives evolution in multiple, unpredictable directions rather than along a predetermined path."
        },
        {
            id: "intuition",
            name: "Intuition (Bergson)", // Clarified
            category: "concept",
            description: "A direct, immediate form of knowledge that grasps reality from within rather than analyzing it from without. Bergson contrasts intuition with intellect, arguing that intuition is better suited to understanding life, consciousness, and duration."
        },
        {
            id: "intellect",
            name: "Intellect",
            category: "concept",
            description: "The analytical faculty of mind that breaks things into parts, suited for understanding inert matter and spatial relations. Bergson argues that while useful for practical purposes, intellect alone cannot grasp the flowing nature of reality."
        },
        {
            id: "contingency",
            name: "Contingency",
            category: "concept",
            description: "The openness of the future to multiple possibilities rather than a predetermined path. For Bergson, contingency is essential to freedom and creativity, opposing both mechanistic determinism and teleological finalism."
        },
        {
            id: "creative_evolution",
            name: "Creative Evolution",
            category: "concept",
            description: "Bergson's theory that evolution proceeds through creative acts and unpredictable divergences rather than following a predetermined path. Evolution is pluridimensional, going off in multiple directions through creative acts."
        },
        {
            id: "laughter",
            name: "Laughter (Bergson)", // Clarified
            category: "concept",
            description: "Bergson analyzes laughter as a social corrective to mechanical rigidity in human behavior. He argues that what is comic is often what is mechanical and lacks awareness, and laughter serves to break up rigid patterns of thinking."
        },
        
        // Shared Concepts with Other Philosophers
        {
            id: "critique_of_positivism",
            name: "Critique of Positivism (B)", // Clarified
            category: "shared_concept",
            description: "Bergson, like Nietzsche, critiqued scientific positivism's claim that all valid knowledge comes from empirical observation. He argued that positivism fails to capture important aspects of human experience, especially the nature of time and consciousness."
        },
        {
            id: "becoming",
            name: "Becoming (Bergson)", // Clarified
            category: "shared_concept",
            description: "The emphasis on process, change, and transformation over static being. This concept was important to Hegel, Nietzsche, and Bergson, though each understood it differently. For Bergson, becoming is tied to his notion of duration."
        },
        {
            id: "anti_mechanism",
            name: "Anti-Mechanism",
            category: "shared_concept",
            description: "The rejection of the idea that nature works like a machine with component parts. Bergson, like the Romantics, opposed mechanistic explanations of life, arguing they fail to grasp the organic wholeness of living beings."
        },
        
        // Key Texts
        {
            id: "time_free_will",
            name: "Time and Free Will",
            category: "text",
            date: "1889",
            description: "Bergson's first major work where he introduces his concept of duration (durée) and argues that real time is experienced qualitatively rather than quantitatively. He distinguishes between time as we live it and time as it is represented spatially."
        },
        {
            id: "matter_memory",
            name: "Matter and Memory",
            category: "text",
            date: "1896",
            description: "Explores the relationship between body and mind, particularly focusing on memory. Bergson argues that memories exist in a virtual state and are actualized when needed, challenging simplistic materialist accounts of the mind."
        },
        {
            id: "creative_evolution_text",
            name: "Creative Evolution (Text)", // Clarified from concept
            category: "text",
            date: "1907",
            description: "Bergson's influential work on evolution that critiques both mechanistic and teleological views of life. He introduces his concept of élan vital and argues that evolution proceeds through unpredictable creative acts rather than following a predetermined path."
        },
        {
            id: "laughter_essay",
            name: "Laughter: An Essay", // Shortened
            category: "text",
            date: "1900",
            description: "Analyzes humor as a social phenomenon and argues that what is comic is often what is mechanical and rigid when we expect the living and flexible. Laughter serves as a social corrective to rigidity."
        },
        {
            id: "duration_simultaneity",
            name: "Duration & Simultaneity", // Shortened
            category: "text",
            date: "1922",
            description: "Bergson's engagement with Einstein's theory of relativity, where he defends his view of time as duration against the scientific understanding of time as a fourth dimension of space-time."
        },
        {
            id: "two_sources",
            name: "The Two Sources", // Shortened
            category: "text",
            date: "1932",
            description: "Bergson's last major work, applying his philosophy to ethics, religion, and politics. He distinguishes between closed and open morality/religion, arguing that the latter stems from mystical intuition and love."
        },
        
        // Key Figures
        {
            id: "bergson",
            name: "Henri Bergson",
            category: "philosopher",
            years: "1859-1941",
            description: "French philosopher known for his concepts of durée (duration), élan vital, and creative evolution. Bergson critiqued scientific positivism and emphasized the importance of intuition for understanding reality, especially consciousness and time."
        },
        {
            id: "einstein",
            name: "Albert Einstein",
            category: "influence",
            years: "1879-1955",
            description: "Physicist whose theory of relativity challenged traditional notions of time. Bergson engaged in a notable debate with Einstein, criticizing Einstein's conception of time as spatializing what should be understood as pure duration."
        },
        {
            id: "spencer",
            name: "Herbert Spencer",
            category: "influence",
            years: "1820-1903",
            description: "English philosopher and positivist thinker who influenced the young Bergson before the latter revolted against his mechanistic conception of evolution and quantitative understanding of time."
        },
        {
            id: "hegel",
            name: "G.W.F. Hegel", // Already exists in Hegel data, but here as influence
            category: "influence", 
            years: "1770-1831",
            description: "German philosopher whose dialectical method and emphasis on becoming influenced philosophical discussions about time and historical process. Bergson shared Hegel's concern with wholeness but rejected his teleological approach."
        },
        {
            id: "freud",
            name: "Sigmund Freud",
            category: "influence",
            years: "1856-1939",
            description: "Austrian neurologist who founded psychoanalysis. Like Bergson, Freud challenged positivism by exploring dimensions of consciousness not accessible through purely rational or empirical methods."
        },
        {
            id: "husserl",
            name: "Edmund Husserl",
            category: "influence",
            years: "1859-1938",
            description: "German philosopher who founded phenomenology. Like Bergson, Husserl moved from mathematics to philosophy and sought to understand consciousness on its own terms rather than reducing it to material processes."
        },
        {
            id: "cantor",
            name: "Georg Cantor",
            category: "influence",
            years: "1845-1918",
            description: "German mathematician whose work on set theory and the continuum hypothesis influenced philosophical thinking about the continuous versus the discrete, a distinction central to Bergson's concept of duration."
        },
        
        // Movements/Schools
        {
            id: "positivism",
            name: "Positivism",
            category: "movement",
            description: "The philosophical view that knowledge should be based solely on empirical observation and scientific methods. Bergson critiqued positivism's limited understanding of reality, particularly its inability to grasp the nature of time and consciousness."
        },
        {
            id: "vitalism",
            name: "Vitalism",
            category: "movement",
            description: "The philosophical doctrine that living organisms possess a non-physical vital force. Bergson's concept of élan vital is often associated with vitalism, though his views were more sophisticated than traditional vitalistic theories."
        },
        {
            id: "existentialism",
            name: "Existentialism",
            category: "movement", // Already in Nietzsche data, here as influenced by Bergson
            description: "A philosophical movement emphasizing individual existence, freedom, and choice. Bergson's focus on duration, free will, and the creativity of life influenced existentialist thinkers, especially Merleau-Ponty and Sartre."
        },
        {
            id: "french_spiritualism",
            name: "French Spiritualism",
            category: "movement",
            description: "A philosophical tradition emphasizing the spiritual nature of reality and the importance of introspection. Bergson is considered part of this tradition, along with figures like Maine de Biran and Félix Ravaisson."
        },
        {
            id: "phenomenology",
            name: "Phenomenology",
            category: "movement", // Distinct from Hegel's use
            description: "A philosophical method focusing on the structure of consciousness and experience. Though developed primarily by Husserl, there are significant parallels with Bergson's approach to investigating consciousness directly."
        },
        
        // Fields or Domains
        {
            id: "philosophy_of_time",
            name: "Philosophy of Time",
            category: "field",
            description: "The branch of philosophy concerned with the nature of time and temporal experience. Bergson's concept of duration revolutionized philosophical thinking about time, challenging spatial metaphors and quantitative models."
        },
        {
            id: "philosophy_of_mind",
            name: "Philosophy of Mind",
            category: "field",
            description: "The branch of philosophy exploring the nature of consciousness and its relationship to the physical world. Bergson made significant contributions through his analysis of memory, perception, and the mind-body relationship."
        },
        {
            id: "metaphysics",
            name: "Metaphysics",
            category: "field",
            description: "The branch of philosophy concerned with the fundamental nature of reality. Bergson sought to revitalize metaphysical inquiry against positivistic reductions, arguing for the reality of time, change, and creative becoming."
        }
    ],
    
    links: [
        // Bergson's relationship to his concepts
        { source: "bergson", target: "duree", description: "Developed" },
        { source: "bergson", target: "elan_vital", description: "Introduced" },
        { source: "bergson", target: "intuition", description: "Privileged" },
        { source: "bergson", target: "creative_evolution", description: "Theorized" },
        { source: "bergson", target: "laughter", description: "Analyzed" },
        
        // Bergson's relationship to shared concepts
        { source: "bergson", target: "critique_of_positivism", description: "Advanced" },
        { source: "bergson", target: "becoming", description: "Emphasized" },
        { source: "bergson", target: "anti_mechanism", description: "Advocated" },
        
        // Bergson's works
        { source: "bergson", target: "time_free_will", description: "Authored" },
        { source: "bergson", target: "matter_memory", description: "Authored" },
        { source: "bergson", target: "creative_evolution_text", description: "Authored" },
        { source: "bergson", target: "laughter_essay", description: "Authored" },
        { source: "bergson", target: "duration_simultaneity", description: "Authored" },
        { source: "bergson", target: "two_sources", description: "Authored" },
        
        // Key concepts in works
        { source: "time_free_will", target: "duree", description: "Introduces" },
        { source: "time_free_will", target: "qualitative_multiplicity", description: "Explains" },
        { source: "time_free_will", target: "free_will", description: "Connects to duration" },
        { source: "matter_memory", target: "duree", description: "Applies to memory" },
        { source: "matter_memory", target: "philosophy_of_mind", description: "Contributes to" },
        { source: "creative_evolution_text", target: "elan_vital", description: "Introduces" },
        { source: "creative_evolution_text", target: "creative_evolution", description: "Develops" },
        { source: "creative_evolution_text", target: "anti_mechanism", description: "Critiques" },
        { source: "laughter_essay", target: "laughter", description: "Analyzes" },
        { source: "duration_simultaneity", target: "duree", description: "Defends against Einstein" },
        { source: "duration_simultaneity", target: "einstein", description: "Responds to" },
        { source: "two_sources", target: "intuition", description: "Applies to religion & morality" }, // Adjusted
        
        // Influence relationships
        { source: "spencer", target: "bergson", description: "Initially influenced, then rejected by" },
        { source: "einstein", target: "bergson", description: "Debated with" }, // Mutual interaction
        { source: "cantor", target: "bergson", description: "Mathematical ideas influenced" }, // Adjusted
        { source: "hegel", target: "bergson", description: "Shared interest in becoming, different approach by" },
        { source: "freud", target: "bergson", description: "Contemporary challenging positivism with" },
        { source: "husserl", target: "bergson", description: "Contemporary, similar focus on consciousness to" },
        
        // Movement relationships
        { source: "positivism", target: "bergson", description: "Object of critique for" }, // Adjusted
        { source: "vitalism", target: "bergson", description: "Associated with philosophy of" }, // Adjusted
        { source: "french_spiritualism", target: "bergson", description: "Key figure in" }, // Adjusted
        { source: "bergson", target: "existentialism", description: "Influenced" },
        { source: "bergson", target: "phenomenology", description: "Ideas parallel to" }, // Adjusted
        
        // Field relationships
        { source: "bergson", target: "philosophy_of_time", description: "Revolutionized" },
        { source: "bergson", target: "philosophy_of_mind", description: "Contributed to" },
        { source: "bergson", target: "metaphysics", description: "Revitalized" },
        
        // Concept interrelationships
        { source: "duree", target: "continuous_time", description: "Is experienced as" }, // Adjusted
        { source: "duree", target: "free_will", description: "Grounds possibility of" }, // Adjusted
        { source: "duree", target: "qualitative_multiplicity", description: "Characterized by" }, // Adjusted
        { source: "intuition", target: "duree", description: "Method to grasp" }, // Adjusted
        { source: "intellect", target: "duree", description: "Spatializes and misrepresents" }, // Adjusted
        { source: "elan_vital", target: "creative_evolution", description: "Driving force of" }, // Adjusted
        { source: "creative_evolution", target: "contingency", description: "Emphasizes" }, // Adjusted
        { source: "intellect", target: "intuition", description: "Contrasted with, complemented by" }, // Adjusted
        { source: "continuous_time", target: "contingency", description: "Implies" }, // Adjusted
        { source: "laughter", target: "anti_mechanism", description: "Social corrective against" } // Adjusted
    ]
};