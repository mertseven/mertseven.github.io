// js/hegel-data.js
// Data structure for Hegel Visualization
const hegelData = {
  nodes: [
    // Core Hegelian Concepts
    {
      id: "geist",
      name: "Geist (Spirit)",
      category: "concept",
      description: "The central concept in Hegel's philosophy, sometimes translated as 'Mind' or 'Spirit'. Represents the collective consciousness that develops through history. Geist is like 'team spirit' - the 'I' that is a 'we' and the 'we' that is an 'I'. It embodies the relationship between individual consciousness and the larger whole of human experience."
    },
    {
      id: "dialectic",
      name: "Dialectic",
      category: "concept",
      description: "The process through which history and thought progress through contradictions. In Hegel's view, a thesis encounters its antithesis, creating a contradiction that is resolved in a synthesis (though Hegel didn't use these exact terms). This movement drives all historical development."
    },
    {
      id: "aufheben",
      name: "Aufheben",
      category: "concept",
      description: "A key term in Hegelian philosophy that means simultaneously to negate, preserve, and elevate. When a dialectical progression moves forward, the previous state is 'aufgehoben' - canceled yet preserved as it's taken to a higher level, like a bud being replaced by a blossom."
    },
    {
      id: "phenomenology",
      name: "Phenomenology (Hegel)", // Clarified for Hegel's specific use
      category: "concept",
      description: "Hegel's approach to understanding consciousness through examining how it appears or manifests itself. The study of phenomena as they appear to consciousness and how consciousness itself develops through various stages."
    },
    {
      id: "absolute_knowledge",
      name: "Absolute Knowledge",
      category: "concept",
      description: "The culmination of Geist's journey in Hegel's Phenomenology, representing complete self-knowledge. The point at which Spirit understands itself fully and overcomes all alienation, recognizing itself in everything."
    },
    {
      id: "becoming",
      name: "Becoming (Werden)",
      category: "concept",
      description: "Contrasted with 'Being' (Sein), becoming represents Hegel's focus on process and development rather than static existence. For Hegel, everything is always in motion, always becoming rather than simply being."
    },
    {
      id: "alienation",
      name: "Alienation (Hegel)", // Clarified
      category: "concept",
      description: "The condition in which consciousness sees the world as separate from itself, creating a subject-object divide. The history of Spirit in Hegel is an attempt to overcome this alienation and recognize itself in everything."
    },
    {
      id: "quantity_quality",
      name: "Quantity into Quality",
      category: "concept",
      description: "Hegel's idea that quantitative changes, when reaching a certain threshold, produce qualitative change. Like water heating gradually until it suddenly boils, small incremental changes can lead to fundamental transformations."
    },
    {
      id: "self_consciousness",
      name: "Self-Consciousness",
      category: "concept",
      description: "The stage of consciousness that reflects upon itself, crucial for the development of Geist. It emerges through the recognition of other consciousnesses in a dynamic of mutual recognition."
    },
    {
      id: "master_slave",
      name: "Master-Slave Dialectic",
      category: "concept",
      description: "Hegel's famous analysis of how self-consciousness develops through the struggle between two consciousnesses, resulting in a master-slave relationship that ultimately proves unsatisfactory for both parties and must be overcome."
    },
    {
      id: "world_spirit",
      name: "World Spirit",
      category: "concept",
      description: "Hegel's conception of history as the manifestation of Geist working itself out. When he saw Napoleon on horseback, he reportedly called him 'world spirit on horseback,' seeing in Napoleon the embodiment of historical forces."
    },
    {
      id: "history",
      name: "Philosophy of History",
      category: "concept",
      description: "Hegel's view that history has a rational structure and direction, moving toward greater freedom and self-consciousness. History is not random but follows a logical pattern as Geist develops."
    },
    {
      id: "owl_minerva",
      name: "Owl of Minerva",
      category: "concept",
      description: "Hegel's metaphor that 'the owl of Minerva spreads its wings only with the falling of the dusk,' meaning that philosophical understanding only comes after events have transpired, not before. We can only understand history looking backward."
    },
    
    // Shared concepts with Enlightenment/Romanticism
    {
      id: "reason",
      name: "Reason (Hegel)", // Clarified
      category: "shared_concept",
      description: "For Hegel, reason is not just subjective human thinking but objective reality itself. He sought to overcome the Enlightenment divide between reason and reality by showing that the rational is real and the real is rational."
    },
    {
      id: "freedom",
      name: "Freedom (Hegel)", // Clarified
      category: "shared_concept",
      description: "Unlike Kantian freedom based on individual moral intention, Hegelian freedom is 'the recognition of necessity.' True freedom comes through understanding the rational necessities that drive history and aligning oneself with them."
    },
    {
      id: "consciousness",
      name: "Consciousness (Hegel)", // Clarified
      category: "shared_concept",
      description: "The starting point of Hegel's Phenomenology, which develops through various stages toward Absolute Knowledge. Unlike Enlightenment thinkers, Hegel sees consciousness as historically situated and developing, not static."
    },
    {
      id: "subject_object",
      name: "Subject-Object Divide",
      category: "shared_concept",
      description: "The problem of how consciousness (subject) relates to the external world (object). Hegel attempts to overcome this 'problem of the bridge' by showing how subject and object are ultimately manifestations of the same Geist."
    },
    {
      id: "nature",
      name: "Nature (Hegel)", // Clarified
      category: "shared_concept",
      description: "For Hegel, nature is not merely mechanical as in Enlightenment thought, nor purely spiritual as in Romanticism. Instead, it's an externalization of Geist that Spirit must recognize itself in and overcome its alienation from."
    },
    
    // Key Figures
    {
      id: "hegel",
      name: "G.W.F. Hegel",
      category: "philosopher", // Changed from 'philosopher' to 'philosopher' to match legend
      years: "1770-1831", // Added years
      description: "Georg Wilhelm Friedrich Hegel (1770-1831) was a German philosopher who developed a comprehensive philosophical system that attempted to overcome the divisions in Enlightenment and Romantic thought. Born during the tumultuous period of the French Revolution, his thinking was profoundly shaped by these historical events."
    },
    {
      id: "kant",
      name: "Immanuel Kant",
      category: "philosopher",
      years: "1724-1804", // Added years
      description: "Hegel's predecessor whose critical philosophy Hegel both built upon and criticized. Hegel sought to overcome what he saw as limitations in Kant's thought, particularly the division between phenomena and noumena, and Kant's emphasis on subjective intention in morality."
    },
    {
      id: "napoleon",
      name: "Napoleon Bonaparte",
      category: "event", // Categorizing Napoleon as an 'event' or 'influence' makes more sense in this context than shared_concept. Let's use 'event' to tie him to historical occurrences.
      years: "1769-1821", // Added years
      description: "Napoleon was seen by Hegel as the embodiment of World Spirit on horseback, representing the historical forces of the French Revolution transformed into imperial power. Hegel reportedly saw Napoleon in Jena before completing his Phenomenology."
    },
    {
      id: "rousseau",
      name: "Jean-Jacques Rousseau",
      category: "philosopher",
      years: "1712-1778", // Added years
      description: "An influence on Hegel through his concepts of general will and social contract. Hegel incorporated aspects of Rousseau's social thinking while criticizing what he saw as overly individualistic elements."
    },
    {
      id: "fichte",
      name: "Johann Gottlieb Fichte",
      category: "philosopher",
      years: "1762-1814", // Added years
      description: "A post-Kantian idealist philosopher who influenced Hegel with his emphasis on the self-positing 'I'. Hegel built upon Fichte's ideas while criticizing his subjective idealism."
    },
    {
      id: "schelling",
      name: "Friedrich Schelling",
      category: "philosopher",
      years: "1775-1854", // Added years
      description: "Hegel's contemporary and former roommate at the Tübingen Seminary. Their philosophical relationship evolved from collaboration to criticism, with Hegel eventually rejecting Schelling's Romantic Naturphilosophie."
    },
    {
      id: "herder",
      name: "Johann Gottfried Herder",
      category: "philosopher",
      years: "1744-1803", // Added years
      description: "A key thinker in German Romanticism whose ideas about culture, language, and history influenced Hegel. Herder's emphasis on historical development and cultural particularity was incorporated into Hegel's historical thinking."
    },
    
    // Major Works
    {
      id: "phenomenology_of_spirit",
      name: "Phenomenology of Spirit",
      category: "text",
      date: "1807", // Added date
      description: "Hegel's first major work (1807), described as a 'Bildungsroman of consciousness.' The text traces the development of consciousness through various stages toward Absolute Knowledge, serving as an introduction to his entire philosophical system."
    },
    {
      id: "science_of_logic",
      name: "Science of Logic",
      category: "text",
      date: "1812-1816", // Added date
      description: "Hegel's attempt to develop a presuppositionless science of pure thought. Published between 1812-1816, it outlines his dialectical logic and the categories of thought that underlie reality."
    },
    {
      id: "philosophy_of_right",
      name: "Philosophy of Right",
      category: "text",
      date: "1821", // Added date
      description: "Hegel's 1821 work on political philosophy that outlines his theory of the modern state and ethical life. It contains his famous statement that 'the rational is actual and the actual is rational.'"
    },
    {
      id: "lectures_philosophy_history",
      name: "Lectures on P. of History", // Shortened for display
      category: "text",
      date: "posth. 1837", // Added date
      description: "Compiled from Hegel's lecture notes and published posthumously, these lectures present his view that world history represents the development of Spirit toward freedom, moving from East to West."
    },
    {
      id: "encyclopedia",
      name: "Encyclopedia of Phil. Sci.", // Shortened
      category: "text",
      date: "1817, rev. 1827, 1830", // Added date
      description: "Hegel's systematic presentation of his entire philosophy, divided into Logic, Philosophy of Nature, and Philosophy of Spirit. Published in 1817 and revised in 1827 and 1830."
    },
    
    // Historical Events
    {
      id: "french_revolution",
      name: "French Revolution",
      category: "event",
      date: "1789-1799", // Added date
      description: "The 1789 Revolution profoundly influenced Hegel, who was 18-19 at the time. He saw it as a world-historical event that marked the emergence of modern freedom and the end of the ancien régime. The Revolution and its aftermath exemplified dialectical development through the Terror."
    },
    {
      id: "battle_jena",
      name: "Battle of Jena",
      category: "event",
      date: "1806", // Added date
      description: "The 1806 battle in which Napoleon defeated the Prussian army. Hegel was in Jena completing his Phenomenology of Spirit at the time and reportedly saw Napoleon ride through the town, calling him 'world spirit on horseback.'"
    },
    {
      id: "terror",
      name: "The Terror",
      category: "event",
      date: "1793-1794", // Added date
      description: "The violent phase of the French Revolution that for Hegel represented the dialectical inversion of abstract freedom into its opposite. The Terror exemplified for Hegel how abstract principles divorced from concrete reality lead to destruction."
    },
    
    // Movements and Schools
    {
      id: "german_idealism",
      name: "German Idealism",
      category: "movement",
      description: "The philosophical movement that emerged in Germany in the late 18th and early 19th centuries, of which Hegel was a central figure. It developed from Kant's critical philosophy and emphasized the active role of mind in constructing experience."
    },
    {
      id: "left_hegelians",
      name: "Left Hegelians",
      category: "movement",
      description: "A group of Hegel's followers who interpreted his philosophy in a progressive, secular direction. Included thinkers like Ludwig Feuerbach, Bruno Bauer, and the young Karl Marx, who used Hegelian dialectics to critique existing social and religious institutions."
    },
    {
      id: "right_hegelians",
      name: "Right Hegelians",
      category: "movement",
      description: "Conservative interpreters of Hegel who emphasized the compatibility of his philosophy with Christianity and the Prussian state. They read Hegel as affirming existing institutions rather than calling for radical change."
    },
    {
      id: "marxism",
      name: "Marxism",
      category: "movement",
      description: "The political and economic theory developed by Karl Marx, who adapted Hegel's dialectical method while 'turning it on its head.' Marx transformed Hegel's idealist dialectic into a materialist one focused on class struggle and economic forces."
    },
    {
      id: "enlightenment_critique",
      name: "Critique of Enlightenment", // More of a stance/theme than a 'movement' itself. Could be 'concept'.
      category: "concept", // Changed category
      description: "Hegel's critical engagement with Enlightenment thinking, which he saw as too abstract and one-sided. While respecting Enlightenment rationality, he criticized its superficial skepticism and its failure to provide substantive spiritual content."
    },
    {
      id: "romanticism_critique",
      name: "Critique of Romanticism", // Same as above
      category: "concept", // Changed category
      description: "Hegel's engagement with Romanticism, which he saw as correctly emphasizing feeling and particularity but failing to achieve rational clarity. He sought to incorporate Romantic insights while overcoming their one-sidedness through dialectical thought."
    }
  ],
  
  links: [
    // Core concept connections
    { source: "geist", target: "dialectic", description: "Develops through", value: 8 },
    { source: "geist", target: "world_spirit", description: "Manifests as", value: 8 },
    { source: "geist", target: "phenomenology", description: "Subject of", value: 7 },
    { source: "geist", target: "history", description: "Unfolds in", value: 7 },
    { source: "geist", target: "absolute_knowledge", description: "Achieves", value: 6 },
    { source: "geist", target: "self_consciousness", description: "Attains", value: 6 },
    { source: "dialectic", target: "aufheben", description: "Characterized by", value: 7 },
    { source: "dialectic", target: "quantity_quality", description: "Includes transformation of", value: 5 },
    { source: "dialectic", target: "becoming", description: "Is logic of", value: 6 },
    { source: "dialectic", target: "master_slave", description: "Example of", value: 5 },
    { source: "phenomenology", target: "self_consciousness", description: "Traces development to", value: 5 },
    { source: "phenomenology", target: "absolute_knowledge", description: "Culminates in", value: 5 },
    { source: "phenomenology", target: "alienation", description: "Overcomes", value: 4 },
    { source: "self_consciousness", target: "master_slave", description: "Arises through", value: 6 },
    { source: "self_consciousness", target: "alienation", description: "Experiences", value: 5 },
    { source: "master_slave", target: "alienation", description: "Involves", value: 4 },
    { source: "world_spirit", target: "history", description: "Drives", value: 5 },
    { source: "history", target: "owl_minerva", description: "Understood via", value: 4 },
    
    // Connections to shared concepts
    { source: "geist", target: "reason", description: "Is ultimate expression of", value: 5 },
    { source: "geist", target: "freedom", description: "Realizes", value: 5 },
    { source: "dialectic", target: "reason", description: "Method of", value: 4 },
    { source: "consciousness", target: "subject_object", description: "Experiences", value: 4 },
    { source: "subject_object", target: "alienation", description: "Defines", value: 4 },
    { source: "nature", target: "geist", description: "Is otherness of", value: 3 },
    { source: "consciousness", target: "self_consciousness", description: "Develops into", value: 5 },
    { source: "consciousness", target: "phenomenology", description: "Starting point of", value: 6 },
    
    // Connections to Hegel
    { source: "hegel", target: "geist", description: "Central concept of", value: 9 },
    { source: "hegel", target: "dialectic", description: "Method of", value: 9 },
    { source: "hegel", target: "phenomenology_of_spirit", description: "Authored", value: 9 },
    { source: "hegel", target: "science_of_logic", description: "Authored", value: 8 },
    { source: "hegel", target: "philosophy_of_right", description: "Authored", value: 8 },
    { source: "hegel", target: "lectures_philosophy_history", description: "Delivered", value: 7 },
    { source: "hegel", target: "encyclopedia", description: "Authored", value: 7 },
    { source: "hegel", target: "enlightenment_critique", description: "Formulated", value: 6 },
    { source: "hegel", target: "romanticism_critique", description: "Formulated", value: 6 },
    
    // Connections to other philosophers
    { source: "hegel", target: "kant", description: "Responded to", value: 7 },
    { source: "hegel", target: "fichte", description: "Influenced by & critiqued", value: 5 },
    { source: "hegel", target: "schelling", description: "Collaborated with & critiqued", value: 6 },
    { source: "hegel", target: "rousseau", description: "Influenced by", value: 4 },
    { source: "hegel", target: "herder", description: "Influenced by", value: 3 },
    { source: "kant", target: "reason", description: "Central to", value: 6 },
    { source: "kant", target: "freedom", description: "Theorized", value: 6 },
    { source: "fichte", target: "self_consciousness", description: "Emphasized", value: 4 },
    { source: "schelling", target: "nature", description: "Theorized", value: 5 },
    
    // Connections to historical events
    { source: "hegel", target: "french_revolution", description: "Interpreted", value: 6 },
    { source: "hegel", target: "battle_jena", description: "Witnessed", value: 5 },
    { source: "hegel", target: "napoleon", description: "Saw as World Spirit", value: 5 },
    { source: "french_revolution", target: "terror", description: "Led to", value: 7 },
    { source: "french_revolution", target: "freedom", description: "Aimed for", value: 5 },
    { source: "battle_jena", target: "world_spirit", description: "Revealed", value: 4 },
    { source: "battle_jena", target: "napoleon", description: "Central figure in", value: 6 },
    { source: "phenomenology_of_spirit", target: "battle_jena", description: "Completed during", value: 3 },
    
    // Connections to works
    { source: "phenomenology_of_spirit", target: "geist", description: "Traces development of", value: 8 },
    { source: "phenomenology_of_spirit", target: "phenomenology", description: "Exemplifies", value: 8 },
    { source: "phenomenology_of_spirit", target: "master_slave", description: "Includes", value: 6 },
    { source: "phenomenology_of_spirit", target: "absolute_knowledge", description: "Culminates in", value: 7 },
    { source: "science_of_logic", target: "dialectic", description: "Details", value: 8 },
    { source: "science_of_logic", target: "becoming", description: "Analyzes", value: 6 },
    { source: "philosophy_of_right", target: "freedom", description: "Explores realization of", value: 7 },
    { source: "philosophy_of_right", target: "owl_minerva", description: "Contains metaphor of", value: 5 },
    { source: "lectures_philosophy_history", target: "history", description: "Presents philosophy of", value: 8 },
    { source: "lectures_philosophy_history", target: "world_spirit", description: "Shows unfolding of", value: 6 },
    { source: "encyclopedia", target: "geist", description: "Systematizes", value: 6 },
    
    // Connections to movements
    { source: "german_idealism", target: "hegel", description: "Key figure of", value: 7 },
    { source: "german_idealism", target: "kant", description: "Originates with", value: 6 },
    { source: "left_hegelians", target: "hegel", description: "Interpreted", value: 5 },
    { source: "right_hegelians", target: "hegel", description: "Interpreted", value: 5 },
    { source: "marxism", target: "hegel", description: "Critically adapted", value: 6 },
    { source: "marxism", target: "dialectic", description: "Transformed", value: 5 },
    { source: "left_hegelians", target: "marxism", description: "Influenced", value: 4 }
  ]
};