// js/enlightenment-data.js
// (Formerly data.js)
// Data structure for the Enlightenment concept map
const enlightenmentData = {
    nodes: [
        // Core concepts
        { id: "reason", name: "Reason", category: "concept", description: "The central concept of the Enlightenment, exalted above tradition and religious authority. Seen as the defining human characteristic that allows understanding of the world. Kant defined Enlightenment as humankind's release from self-incurred immaturity through the use of reason. The Enlightenment saw reason as the primary means of understanding the world and improving human life, replacing religious dogma and traditional authority." },
        { id: "empiricism", name: "Empiricism", category: "concept", description: "Knowledge gained through sensory experience and observation rather than pure theory. Newton's approach to understanding physical laws through observation exemplifies this. Locke's Essay Concerning Human Understanding (1690) established empiricism as a major force in Enlightenment thought, arguing that all ideas come from experience. This approach influenced the development of modern science and challenged traditional metaphysical systems." },
        { id: "social_contract", name: "Social Contract", category: "concept", description: "Theory that people's moral and political obligations are dependent upon an agreement to form society. Different versions proposed by Hobbes, Locke, and Rousseau. Hobbes saw it as a means to escape the state of nature's chaos, Locke as a way to protect natural rights, and Rousseau as a way to achieve collective freedom through the general will. This concept fundamentally changed how people thought about political authority and legitimacy." },
        { id: "state_of_nature", name: "State of Nature", category: "concept", description: "Hypothetical condition of humanity before social contracts and civilization. Viewed as war (Hobbes), freedom (Locke), or virtue (Rousseau). This concept was central to Enlightenment political thought, serving as a thought experiment to understand human nature and justify different forms of government. It helped thinkers imagine how society might be organized on rational principles rather than traditional authority." },
        { id: "epistemology", name: "Epistemology", category: "concept", description: "The study of knowledge - how we know what we know. Central preoccupation of modern philosophy beginning with Descartes. The Enlightenment saw a fundamental shift in how knowledge was understood, moving from reliance on authority and tradition to emphasis on reason and experience. This led to new questions about the limits of human knowledge and the relationship between mind and world." },
        { id: "deism", name: "Deism", category: "concept", description: "Belief that God created the world but then stepped aside, endowing humans with reason. A middle ground between Christianity and atheism promoted by Voltaire. Deists believed in a rational, natural religion based on reason rather than revelation. This belief system was particularly influential in the American Enlightenment and helped promote religious tolerance and separation of church and state." },
        { id: "disenchantment", name: "Disenchantment", category: "concept", description: "Weber's term for the Enlightenment's removal of magic, miracles, and supernatural forces from understanding the world. This process involved the systematic application of reason and scientific method to explain phenomena that were previously attributed to supernatural causes. It led to a more secular, rational understanding of the world." },
        { id: "rationality", name: "Rationality", category: "concept", description: "The quality of being based on reason rather than emotions or feelings. Central to Enlightenment thinking. The Enlightenment saw rationality as the key to human progress and the means to overcome superstition and prejudice. This emphasis on rationality influenced everything from scientific method to political theory to moral philosophy." },
        { id: "positivism", name: "Positivism", category: "concept", description: "Understanding the world based on empirical observation without supernatural explanations. This approach, exemplified by Newton's scientific method, sought to explain phenomena through natural laws rather than divine intervention. It became a model for understanding both the physical and social world." },
        { id: "cogito", name: "Cogito, ergo sum", category: "concept", description: "Descartes' famous conclusion: 'I think, therefore I am.' The foundation of modern philosophy and the only certainty after radical doubt. This principle established the primacy of individual consciousness and reason as the starting point for philosophical inquiry. It marked a shift from medieval philosophy's reliance on authority to modern philosophy's emphasis on individual reason." },
        { id: "consent", name: "Consent of the Governed", category: "concept", description: "Locke's idea that legitimate government authority comes from the consent of those governed, not divine right. This concept challenged traditional notions of political authority based on divine right or hereditary privilege. It became a fundamental principle of modern democratic theory and influenced the American and French revolutions." },
        { id: "general_will", name: "General Will", category: "concept", description: "Rousseau's concept of the collective will that is not simply the sum of individual wills but represents the common good. This idea influenced both democratic theory and totalitarian thought. It raised important questions about the relationship between individual freedom and collective decision-making." },
        { id: "tolerance", name: "Religious Tolerance", category: "concept", description: "Advocacy for freedom of religious belief and practice. Championed by Voltaire in his Treatise on Toleration. This concept emerged from the religious wars of the early modern period and became a central Enlightenment value. It influenced the development of modern secular states and the separation of church and state." },
        { id: "liberty", name: "Liberty, Equality, Fraternity", category: "concept", description: "Slogan of the French Revolution embodying Enlightenment ideals of freedom, equal rights, and brotherhood. These principles represented the Enlightenment's vision of a just society based on reason rather than tradition. They continue to influence modern political thought and democratic movements." },
        { id: "sapere_aude", name: "Sapere Aude", category: "concept", description: "Kant's motto for the Enlightenment: 'Dare to know' or 'Have courage to use your own reason.' This phrase captured the Enlightenment's spirit of intellectual independence and the rejection of authority. It encouraged individuals to think for themselves rather than relying on tradition or authority." },
        { id: "copernican_revolution", name: "Copernican Revolution", category: "concept", description: "Kant's philosophical revolution: it's not our minds that conform to the world, but the world as we experience it conforms to our minds. This idea fundamentally changed how philosophers understood the relationship between human knowledge and reality. It influenced the development of modern epistemology and philosophy of science." },
        
        // Philosophers (and one Scientist treated similarly)
        { id: "descartes", name: "René Descartes", years: "1596-1650", category: "philosopher", description: "Father of modern philosophy who began with radical doubt. Established 'Cogito, ergo sum' (I think, therefore I am) as the foundation of knowledge. His method of systematic doubt and emphasis on reason influenced the entire Enlightenment period. He sought to establish a secure foundation for knowledge based on clear and distinct ideas." },
        { id: "hobbes", name: "Thomas Hobbes", years: "1588-1679", category: "philosopher", description: "Viewed the state of nature as a state of war with life being 'nasty, brutish, and short.' Argued for the Leviathan, an absolute authority to maintain peace. His materialist philosophy and social contract theory influenced both political thought and the development of modern science. He was one of the first to apply scientific method to the study of politics." },
        { id: "locke", name: "John Locke", years: "1632-1704", category: "philosopher", description: "Saw the state of nature as one of freedom and equality. Proposed government based on the consent of the governed, not divine right. His empiricist epistemology and political theory influenced both the American and French revolutions. He developed influential theories of knowledge, education, and religious tolerance." },
        { id: "newton", name: "Isaac Newton", years: "1642-1727", category: "scientist", description: "Pioneer of empirical observation to discover laws of physics, gravity, and motion through careful experimentation. His scientific method and discoveries became a model for Enlightenment thinkers in all fields. He demonstrated the power of reason and observation to understand the natural world." },
        { id: "voltaire", name: "Voltaire", years: "1694-1778", category: "philosopher", description: "Advocated for religious tolerance and deism. Opposed religious oppression while believing in God as creator. His wit and criticism of traditional authority made him one of the most influential Enlightenment thinkers. He championed freedom of thought and expression." },
        { id: "rousseau", name: "Jean-Jacques Rousseau", years: "1712-1778", category: "philosopher", description: "Believed the state of nature was a state of virtue corrupted by property and society. Developed the concept of the 'general will.' His ideas about education, politics, and human nature influenced both democratic and romantic thought. He challenged Enlightenment optimism about progress while remaining committed to Enlightenment ideals." },
        { id: "kant", name: "Immanuel Kant", years: "1724-1804", category: "philosopher", description: "Defined Enlightenment as 'man's exit from immaturity' with the motto 'Sapere aude' (Dare to know). Performed the 'Copernican revolution' in philosophy. His critical philosophy sought to establish the limits and conditions of human knowledge. He attempted to reconcile rationalism and empiricism while preserving human freedom." },
        { id: "mendelssohn", name: "Moses Mendelssohn", years: "1729-1786", category: "philosopher", description: "German-Jewish philosopher who won first prize in the Berlin Monthly's essay contest on 'What is Enlightenment?' Emphasized humanism. He sought to reconcile Jewish tradition with Enlightenment values and promoted religious tolerance. His work influenced both Jewish and general Enlightenment thought." },
        { id: "diderot", name: "Denis Diderot", years: "1713-1784", category: "philosopher", description: "Led the Encyclopedia project with d'Alembert, which aimed to categorize and organize all human knowledge. His materialist philosophy and commitment to spreading knowledge influenced the French Enlightenment. He was a central figure in the development of modern encyclopedias and the democratization of knowledge." },
        
        // Events and texts
        { id: "leviathan", name: "Leviathan", date: "1651", category: "text", description: "Hobbes' work describing social contract theory where people surrender rights to an absolute authority for security." },
        { id: "treatise", name: "Treatise on Toleration", date: "1763", category: "text", description: "Voltaire's work advocating for religious tolerance and opposing dogmatism." },
        { id: "essay_contest", name: "Essay Contest: What is Enlightenment?", date: "1784", category: "event", description: "The Berlin Monthly's famous essay contest with submissions from Mendelssohn and Kant defining Enlightenment." },
        { id: "encyclopedia", name: "Encyclopedia Project", date: "1751-1772", category: "text", description: "Massive project led by Diderot to categorize and make accessible all human knowledge." },
        { id: "french_revolution", name: "French Revolution", date: "1789", category: "event", description: "Culmination of Enlightenment ideas with the motto 'Liberty, Equality, Fraternity.' Transformed subjects of a monarch into citizens." },
        { id: "rights_declaration", name: "Declaration of Rights of Man", date: "August 1789", category: "text", description: "Document declaring men are born free and equal in rights, with liberty, property, security, and resistance to oppression as natural rights." },
        { id: "terror", name: "Reign of Terror", date: "1793-1794", category: "event", description: "Period following the French Revolution when revolutionary ideals turned to violence, sometimes blamed on Rousseau's 'general will.'" },
        
        // Additional Core Concepts from original data.js (some were duplicates or rephrased, I've tried to integrate unique ones)
        { id: "natural_law", name: "Natural Law", category: "concept", description: "The belief that there are universal moral principles that can be discovered through reason, independent of religious revelation. This concept was central to Enlightenment political and moral thought, providing a secular foundation for ethics and law. It influenced the development of human rights theory and international law." },
        { id: "moral_sense", name: "Moral Sense", category: "concept", description: "The innate human capacity to perceive moral truths through sentiment rather than reason alone. This concept, developed by thinkers like Shaftesbury and Hutcheson, challenged the Enlightenment's emphasis on reason. It influenced the development of moral psychology and theories of human nature." }, // Note: Shaftesbury/Hutcheson not in nodes yet.
        { id: "civil_society", name: "Civil Society", category: "concept", description: "The realm of social life outside of government, characterized by voluntary associations and economic exchange. This concept emerged from Enlightenment thinking about the relationship between individuals and society. It influenced modern theories of democracy and economic organization." },
        { id: "aesthetics", name: "Aesthetics", category: "concept", description: "The study of beauty and artistic experience, which emerged as a distinct philosophical discipline during the Enlightenment. This field developed alongside the Enlightenment's interest in human nature and experience. It influenced the development of modern art theory and criticism." },
        { id: "skepticism", name: "Skepticism", category: "concept", description: "The questioning of traditional beliefs and authorities, a key characteristic of Enlightenment thought. This approach, exemplified by thinkers like Hume and Bayle, challenged traditional certainties while promoting critical thinking. It influenced the development of modern scientific method and philosophical inquiry." }, // Note: Hume/Bayle not in nodes yet.
        { id: "materialism", name: "Materialism", category: "concept", description: "The philosophical position that everything in the universe is composed of matter and governed by natural laws. This view, developed by thinkers like d'Holbach and Helvétius, challenged traditional religious and metaphysical views. It influenced the development of modern science and secular thought." }, // Note: d'Holbach/Helvetius not in nodes yet.

        // Additional Philosophers from original data.js (only adding if they have direct links in the provided links array for now)
        // { id: "spinoza", name: "Baruch Spinoza", years: "1632-1677", category: "philosopher", description: "..." }, // Will add if links require
        // { id: "leibniz", name: "Gottfried Wilhelm Leibniz", years: "1646-1716", category: "philosopher", description: "..." },
        // { id: "hume", name: "David Hume", years: "1711-1776", category: "philosopher", description: "..." },
        // { id: "smith", name: "Adam Smith", years: "1723-1790", category: "philosopher", description: "..." },
        // { id: "wolff", name: "Christian Wolff", years: "1679-1754", category: "philosopher", description: "..." },
        // { id: "bayle", name: "Pierre Bayle", years: "1647-1706", category: "philosopher", description: "..." },
        // { id: "condillac", name: "Étienne Bonnot de Condillac", years: "1714-1780", category: "philosopher", description: "..." },
        // { id: "helvetius", name: "Claude-Adrien Helvétius", years: "1715-1771", category: "philosopher", description: "..." },
        // { id: "dholbach", name: "Baron d'Holbach", years: "1723-1789", category: "philosopher", description: "..." },
        
        // Additional Events and Texts from original data.js (only adding if they have direct links for now)
        // { id: "ethics", name: "Ethics", date: "1677", category: "text", description: "..." },
        // { id: "monadology", name: "Monadology", date: "1714", category: "text", description: "..." },
        // { id: "treatise_human_nature", name: "A Treatise of Human Nature", date: "1739-1740", category: "text", description: "..." },
        // { id: "moral_sentiments", name: "The Theory of Moral Sentiments", date: "1759", category: "text", description: "..." },
        // { id: "wealth_nations", name: "The Wealth of Nations", date: "1776", category: "text", description: "..." },
        // { id: "historical_dictionary", name: "Historical and Critical Dictionary", date: "1697", category: "text", description: "..." },
        // { id: "treatise_sensations", name: "Treatise on Sensations", date: "1754", category: "text", description: "..." },
        // { id: "system_nature", name: "System of Nature", date: "1770", category: "text", description: "..." },
        
        // Regional Enlightenments / Movements
        { id: "scottish_enlightenment", name: "Scottish Enlightenment", category: "movement", description: "The Enlightenment in Scotland, characterized by empiricism and moral philosophy. This movement produced influential thinkers like Hume and Smith. It was known for its practical approach to philosophy and its influence on economics and social theory." }, // Hume/Smith not yet in nodes
        { id: "german_enlightenment", name: "German Enlightenment", category: "movement", description: "The Aufklärung in Germany, influenced by Leibniz and Wolff. This movement was characterized by systematic philosophy and emphasis on reason. It produced influential thinkers like Kant and influenced the development of German idealism." }, // Leibniz/Wolff not yet in nodes
        { id: "french_enlightenment", name: "French Enlightenment", category: "movement", description: "The Enlightenment in France, characterized by radical materialism and social reform. This movement produced influential thinkers like Voltaire and Diderot. It was known for its criticism of traditional authority and its influence on the French Revolution." }
    ],
    links: [
        // Connections to Reason
        { source: "reason", target: "empiricism", description: "Informed by" },
        { source: "reason", target: "disenchantment", description: "Leads to" },
        { source: "reason", target: "epistemology", description: "Central to" },
        { source: "reason", target: "kant", description: "Championed by" },
        { source: "reason", target: "deism", description: "Foundation of" },
        { source: "reason", target: "rationality", description: "Synonymous with" },
        { source: "reason", target: "mendelssohn", description: "Emphasized by" },
        { source: "reason", target: "sapere_aude", description: "Encourages use of" },
        { source: "reason", target: "natural_law", description: "Discovers" },
        
        // Connections to Empiricism
        { source: "empiricism", target: "newton", description: "Exemplified by" },
        { source: "empiricism", target: "positivism", description: "Leads to" },
        { source: "empiricism", target: "locke", description: "Developed by" },
        // { source: "empiricism", target: "hume", description: "Radicalized by" }, // Hume not in nodes yet
        // { source: "empiricism", target: "treatise_sensations", description: "Explores" }, // Text not in nodes

        // Social Contract connections
        { source: "social_contract", target: "state_of_nature", description: "Arises from" },
        { source: "social_contract", target: "hobbes", description: "Theorized by" },
        { source: "social_contract", target: "locke", description: "Theorized by" },
        { source: "social_contract", target: "rousseau", description: "Theorized by" },
        { source: "social_contract", target: "consent", description: "Based on" },
        { source: "social_contract", target: "general_will", description: "Aimed at by (Rousseau)" },
        
        // State of Nature connections
        { source: "state_of_nature", target: "hobbes", description: "Described by" },
        { source: "state_of_nature", target: "locke", description: "Described by" },
        { source: "state_of_nature", target: "rousseau", description: "Described by" },
        
        // Epistemology connections
        { source: "epistemology", target: "descartes", description: "Central to" },
        { source: "epistemology", target: "kant", description: "Revolutionized by" },
        { source: "epistemology", target: "cogito", description: "Foundation for (Descartes)" },
        { source: "epistemology", target: "copernican_revolution", description: "Key concept in (Kant)" },
        { source: "epistemology", target: "locke", description: "Contributed to" },
        
        // Deism connections
        { source: "deism", target: "voltaire", description: "Promoted by" },
        { source: "deism", target: "tolerance", description: "Supports" },
        
        // Philosopher works and concepts
        { source: "descartes", target: "cogito", description: "Formulated" },
        { source: "descartes", target: "rationality", description: "Emphasized" },
        { source: "hobbes", target: "leviathan", description: "Authored" },
        { source: "hobbes", target: "materialism", description: "Advocated early form of" },
        { source: "locke", target: "consent", description: "Championed" },
        { source: "locke", target: "empiricism", description: "Key proponent of" },
        { source: "newton", target: "positivism", description: "Method influenced" },
        { source: "voltaire", target: "tolerance", description: "Advocated for" },
        { source: "voltaire", target: "treatise", description: "Authored" },
        { source: "rousseau", target: "general_will", description: "Developed concept of" },
        { source: "rousseau", target: "social_contract", description: "Wrote on" },
        { source: "kant", target: "sapere_aude", description: "Defined Enlightenment with" },
        { source: "kant", target: "copernican_revolution", description: "Introduced" },
        { source: "kant", target: "essay_contest", description: "Participated in" },
        { source: "kant", target: "aesthetics", description: "Developed theory of" },
        { source: "mendelssohn", target: "essay_contest", description: "Participated in" },
        { source: "diderot", target: "encyclopedia", description: "Edited" },
        { source: "diderot", target: "materialism", description: "Associated with" },
        
        // French Revolution connections
        { source: "french_revolution", target: "liberty", description: "Slogan of" },
        { source: "french_revolution", target: "rights_declaration", description: "Produced" },
        { source: "french_revolution", target: "terror", description: "Led to" },
        { source: "french_revolution", target: "general_will", description: "Influenced by (Rousseau)" },
        { source: "french_revolution", target: "consent", description: "Based on ideal of" },
        { source: "french_enlightenment", target: "french_revolution", description: "Influenced" },
        
        // Other connections
        { source: "terror", target: "general_will", description: "Misapplication of (critique)" },
        { source: "tolerance", target: "treatise", description: "Argued in" },
        { source: "encyclopedia", target: "diderot", description: "Key figure for" }, // Reversed from Diderot -> Encyclopedia for variation
        
        // New Concept Connections from original data.js
        { source: "natural_law", target: "locke", description: "Used by" },
        { source: "natural_law", target: "social_contract", description: "Underpins (Locke)" },
        // { source: "moral_sense", target: "smith", description: "Theorized by" }, // Smith not in nodes
        // { source: "civil_society", target: "smith", description: "Analyzed by" }, // Smith not in nodes
        { source: "skepticism", target: "empiricism", description: "Can arise from" },
        // { source: "skepticism", target: "hume", description: "Championed by" }, // Hume not in nodes
        { source: "materialism", target: "disenchantment", description: "Contributes to" },
        // { source: "materialism", target: "dholbach", description: "Advocated by" }, // D'Holbach not in nodes

        // Regional Movement Connections
        // { source: "scottish_enlightenment", target: "hume", description: "Central figure of" },
        // { source: "scottish_enlightenment", target: "smith", description: "Central figure of" },
        { source: "scottish_enlightenment", target: "empiricism", description: "Characterized by" },
        { source: "german_enlightenment", target: "kant", description: "Culmination of" },
        // { source: "german_enlightenment", target: "wolff", description: "Influenced by" },
        { source: "german_enlightenment", target: "rationality", description: "Emphasized" },
        { source: "french_enlightenment", target: "voltaire", description: "Key figure of" },
        { source: "french_enlightenment", target: "diderot", description: "Key figure of" },
        { source: "french_enlightenment", target: "materialism", description: "Prominent in" },

        // Additional Cross-Category Connections based on descriptions
        { source: "positivism", target: "disenchantment", description: "Reinforces" },
        { source: "rationality", target: "disenchantment", description: "Drives" },
        { source: "disenchantment", target: "materialism", description: "Associated with" },
        { source: "civil_society", target: "locke", description: "Concept developed by" },
        { source: "aesthetics", target: "kant", description: "Systematized by" }, // Already exists
        { source: "natural_law", target: "reason", description: "Discoverable through"}, // Already exists
        { source: "copernican_revolution", target: "epistemology", description: "Impacted"}, // Already exists
    ]
};