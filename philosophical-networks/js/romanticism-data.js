// js/romanticism-data.js
// Data structure for the Romanticism concept map
const romanticismData = {
    nodes: [
        // Core concepts
        { id: "passion", name: "Passion", category: "concept", description: "A central concept of Romanticism that emphasizes intense emotions and feelings over rational thought. Romantics valued emotional intensity and authenticity as a way to experience life more fully and as a source of creative inspiration. This stood in contrast to Enlightenment's emphasis on reason and rationality." },
        { id: "imagination", name: "Imagination", category: "concept", description: "The creative faculty that allows humans to envision possibilities beyond the empirical world. For Romantics, imagination was a transformative power that could reveal deeper truths than reason alone. It was considered essential for artistic creation and for understanding the sublime aspects of nature and human experience." },
        { id: "nature", name: "Nature", category: "concept", description: "Idealized as a source of truth, beauty, and spiritual renewal in Romanticism. Nature was seen as organic, dynamic, and mysterious rather than mechanical and knowable. Romantics sought communion with nature as an escape from the artificiality of civilization and as a way to connect with something greater than themselves." },
        { id: "sublime", name: "The Sublime", category: "concept", description: "An aesthetic concept referring to overwhelming experiences that inspire awe, terror, and wonder. The sublime was found in vast landscapes, powerful storms, and other natural phenomena that evoked emotional responses beyond rational comprehension. It represented the limits of human understanding and the power of emotional experience." },
        { id: "individualism", name: "Individualism", category: "concept", description: "The celebration of the unique, authentic self and personal expression. Romantics valued individual genius, originality, and the expression of one's true nature over conformity to social conventions. This emphasis on individuality influenced artistic creation and political thought, challenging traditional hierarchies and institutions." },
        { id: "authenticity", name: "Authenticity", category: "concept", description: "The virtue of being true to one's inner nature and emotions rather than conforming to social expectations. Derived from Rousseau's critique of social artifice, authenticity became a central Romantic value. It emphasized sincerity, emotional honesty, and the rejection of superficial politeness and social conventions." },
        { id: "will", name: "Will", category: "concept", description: "The faculty of desire and choice that defines human freedom and agency. Inspired by Kant's moral philosophy, Romantics elevated will (volo ergo sum - 'I will, therefore I am') over reason (cogito ergo sum - 'I think, therefore I am'). Will represented the power to create, to act according to one's ideals, and to transform oneself and the world." },
        { id: "becoming", name: "Becoming", category: "concept", description: "The process of transformation and self-creation, contrasted with static being. Romantics emphasized becoming over being, focusing on human potential, growth, and creative development rather than fixed essences. This concept highlighted the dynamic, evolving nature of human existence and the importance of striving toward ideals." },
        { id: "longing", name: "Longing (Sehnsucht)", category: "concept", description: "A profound yearning for something unattainable or indefinable. This German concept of Sehnsucht captured the Romantic preoccupation with unfulfilled desire and nostalgia. The emotion of longing itself was valued, sometimes more than its object, as an authentic expression of the human condition." },
        { id: "expressivism", name: "Expressivism", category: "concept", description: "The belief that art should express the authentic emotions and inner life of the artist. Romantics valued art that revealed the artist's soul rather than adhering to classical rules or imitating nature. This approach to art emphasized originality, emotional intensity, and subjective experience over formal perfection." },
        { id: "nationalism", name: "Nationalism", category: "concept", description: "The belief in the unique character and value of national cultures and languages. Emerging from Herder's ideas about cultural expression, Romantic nationalism emphasized the organic unity of a people through shared language, traditions, and historical experience. It contrasted with Enlightenment cosmopolitanism and influenced 19th-century political movements." },
        { id: "nostalgia", name: "Nostalgia", category: "concept", description: "A longing for an idealized past that never truly existed. Inspired by Rousseau's idealization of the state of nature, Romantic nostalgia represented a yearning for lost innocence, simplicity, and authenticity. It reflected dissatisfaction with modern civilization and a desire to recover something essential that had been lost." },
        { id: "irrationalism", name: "Irrationalism", category: "concept", description: "The validation of non-rational aspects of human experience such as emotion, intuition, and will. Romantics challenged Enlightenment rationality by emphasizing the limits of reason and the value of irrational elements in human life. This perspective is exemplified in Dostoevsky's 'Notes from Underground,' which critiques the reduction of human experience to rational calculation." },
        
        // Shared concepts with Enlightenment
        { id: "reason", name: "Reason", category: "shared_concept", description: "While central to Enlightenment thought, reason was recontextualized in Romanticism as limited in its ability to comprehend the full depth of human experience. Romantics did not reject reason entirely but questioned its supremacy and emphasized its limitations in understanding emotions, beauty, and the sublime. This represented a shift from seeing reason as the primary human faculty to one among many." },
        { id: "freedom", name: "Freedom", category: "shared_concept", description: "A concept valued in both Enlightenment and Romanticism but understood differently. In Enlightenment thought, freedom was primarily political and social, based on rational principles. In Romanticism, freedom became more personal and existential, emphasizing creative expression, authenticity, and the will to shape one's own destiny regardless of social conventions." },
        { id: "nature_vs_civilization", name: "Nature vs. Civilization", category: "shared_concept", description: "The relationship between natural and civilized states was explored in both movements. Enlightenment thinkers like Hobbes, Locke, and Rousseau developed different theories about the transition from nature to civilization. Romantics, influenced by Rousseau, often idealized nature as pure and authentic while viewing civilization as potentially corrupting and alienating." },
        
        // Key figures
        { id: "rousseau", name: "Jean-Jacques Rousseau", years: "1712-1778", category: "philosopher", description: "A transitional figure between Enlightenment and Romanticism. His political theory in 'The Social Contract' belongs to Enlightenment thought, while his autobiographical 'Confessions' and his idealization of nature anticipate Romantic themes. His critique of civilization's corrupting influence on natural human goodness and his emphasis on authenticity strongly influenced Romantic thought." },
        { id: "kant", name: "Immanuel Kant", years: "1724-1804", category: "philosopher", description: "A pivotal philosopher whose work bridges Enlightenment and Romanticism. His epistemology in 'Critique of Pure Reason' explores the limits of human knowledge, while his moral philosophy emphasizes free will, intention, and human dignity. Romantics were particularly influenced by his ideas about human freedom, moral autonomy, and the creative role of the mind in shaping experience." },
        { id: "fichte", name: "Johann Gottlieb Fichte", years: "1762-1814", category: "philosopher", description: "A German philosopher who developed Kant's ideas in a more idealist direction. His emphasis on freedom, self-determination, and the creative power of the self strongly influenced Romantic thought. His statement 'To be free is nothing, to become free is heaven' captures the Romantic emphasis on becoming rather than being." },
        { id: "herder", name: "Johann Gottfried Herder", years: "1744-1803", category: "philosopher", description: "A German philosopher who developed theories of cultural expression and national identity. His ideas about the unique character of different cultures, expressed through language and traditions, laid the groundwork for Romantic nationalism. He emphasized the value of cultural diversity and the importance of belonging to an organic community." },
        { id: "goethe", name: "Johann Wolfgang von Goethe", years: "1749-1832", category: "poet", description: "A towering figure in German literature whose work spans Enlightenment and Romanticism. His novel 'The Sorrows of Young Werther' became a defining text of early Romanticism with its emotional intensity and tragic love story. His critique of scientific rationalism as draining the life from beauty (comparing it to an entomologist pinning butterflies) exemplifies Romantic attitudes toward Enlightenment thought." },
        { id: "byron", name: "Lord Byron", years: "1788-1824", category: "poet", description: "A leading British Romantic poet known for his passionate verse and dramatic life. His poetry, including 'Manfred,' explores themes of individualism, rebellion against convention, and the sublime beauty and terror of nature. His life embodied the Romantic ideal of the passionate, creative individual living authentically despite social disapproval." },
        { id: "wordsworth", name: "William Wordsworth", years: "1770-1850", category: "poet", description: "A major English Romantic poet who celebrated nature and the common man. His poetry, often written in collaboration with Samuel Taylor Coleridge, emphasized emotional response to nature and the importance of imagination. His 'Preface to Lyrical Ballads' served as a manifesto for Romantic poetry, advocating for natural language and emotional authenticity." },
        { id: "dostoevsky", name: "Fyodor Dostoevsky", years: "1821-1881", category: "writer", description: "A Russian novelist whose work represents a post-Romantic critique of Enlightenment rationality. His 'Notes from Underground' directly challenges the Enlightenment belief in reason and progress, asserting the value of irrational desires and suffering as essential aspects of human freedom. His work explores the psychological depths and contradictions of human nature that reason alone cannot comprehend." },
        { id: "mickiewicz", name: "Adam Mickiewicz", years: "1798-1855", category: "poet", description: "Poland's national poet and a leading figure in Romantic nationalism. His work, including 'Pan Tadeusz,' expressed Polish national identity and aspirations for independence during a period of foreign domination. His messianic vision of Poland's resurrection and liberation of other European peoples exemplifies the spiritual and political dimensions of Romantic nationalism." },
        { id: "coleridge", name: "Samuel Taylor Coleridge", years: "1772-1834", category: "poet", description: "An English poet, critic, and philosopher who helped establish Romantic theory and practice. His poems like 'The Rime of the Ancient Mariner' explore supernatural themes and the mysterious aspects of nature. His concept of imagination as a creative, transformative power that reveals deeper truths than reason alone was influential in Romantic aesthetics." },
        { id: "blake", name: "William Blake", years: "1757-1827", category: "poet", description: "An English poet, painter, and printmaker who combined visual art and poetry in works that challenged conventional thinking. His visionary works like 'Songs of Innocence and Experience' explored the tensions between innocence and experience, freedom and constraint. His critique of Enlightenment rationalism and industrial society anticipated many Romantic themes." },
        { id: "shelley", name: "Percy Bysshe Shelley", years: "1792-1822", category: "poet", description: "An English Romantic poet known for his lyrical expression and radical politics. His poetry, including 'Prometheus Unbound,' combined revolutionary political ideals with sublime natural imagery. His essay 'A Defence of Poetry' argued for the essential role of imagination in human life and the poet as an unacknowledged legislator of the world." },
        
        // Important works
        { id: "notes_underground", name: "Notes from Underground", date: "1864", category: "text", description: "Dostoevsky's novella that presents a radical critique of Enlightenment rationality. The unnamed narrator rejects the idea that human behavior can be reduced to rational calculation, asserting the value of irrational desires, suffering, and free will. The work has been called 'the true critique of pure reason' for its challenge to Enlightenment assumptions about human nature." },
        { id: "sorrows_werther", name: "The Sorrows of Young Werther", date: "1774", category: "text", description: "Goethe's epistolary novel that became a defining text of early Romanticism. It tells the story of a sensitive young artist who falls in love with a woman engaged to another man and ultimately commits suicide. The novel's emotional intensity, celebration of individual feeling, and tragic ending exemplify Romantic sensibilities and inspired a cultural phenomenon across Europe." },
        { id: "lyrical_ballads", name: "Lyrical Ballads", date: "1798", category: "text", description: "A collection of poems by Wordsworth and Coleridge that marked the beginning of the Romantic movement in English literature. The preface, written by Wordsworth, served as a manifesto for Romantic poetry, advocating for natural language, emotional authenticity, and attention to ordinary life and nature rather than classical forms and subjects." },
        { id: "confessions_rousseau", name: "Confessions", date: "1782", category: "text", description: "Rousseau's autobiographical work that established a new model of introspective, emotionally revealing writing. Unlike previous autobiographies focused on external events or spiritual development, Rousseau's Confessions explored his inner emotional life with unprecedented candor. This work exemplifies the Romantic value of authenticity and emotional expression." },
        { id: "manfred", name: "Manfred", date: "1817", category: "text", description: "Byron's dramatic poem about a Romantic hero who seeks to transcend human limitations through supernatural means. The protagonist, tormented by guilt over an unnamed sin, rejects conventional morality and religious consolation, embodying the Romantic ideal of the defiant individual. The work explores themes of forbidden knowledge, the sublime, and the tragic consequences of unbounded ambition." },
        { id: "pan_tadeusz", name: "Pan Tadeusz", date: "1834", category: "text", description: "Mickiewicz's epic poem that became a cornerstone of Polish national literature. Set during the Napoleonic era, it presents an idealized vision of Polish noble life and national character. The work exemplifies Romantic nationalism, preserving cultural memory and identity during a period when Poland had been partitioned among foreign powers." },
        
        // Movements
        { id: "german_romanticism", name: "German Romanticism", category: "movement", description: "The intellectual and artistic movement centered in Germany from the late 18th to mid-19th century. German Romanticism emphasized the spiritual dimensions of nature, the power of imagination, and the value of folk culture and national identity. It developed in opposition to French Enlightenment rationalism and had profound influence on philosophy, literature, music, and the visual arts throughout Europe." },
        { id: "british_romanticism", name: "British Romanticism", category: "movement", description: "The literary and artistic movement in Britain from approximately 1785-1832. British Romanticism was characterized by a focus on nature, imagination, emotion, and individualism. Major figures included Wordsworth, Coleridge, Blake, Byron, Shelley, and Keats, whose work transformed English poetry and established new approaches to landscape, emotion, and creative expression." },
        { id: "sturm_und_drang", name: "Sturm und Drang", category: "movement", description: "A proto-Romantic German literary movement of the late 18th century whose name means 'Storm and Stress.' It emphasized emotional extremes, individual subjectivity, and the rejection of rational constraints. Goethe's 'The Sorrows of Young Werther' exemplifies this movement, which laid the groundwork for full-fledged Romanticism with its celebration of passion, genius, and authentic expression." },
        { id: "gothic", name: "Gothic", category: "movement", description: "A literary and artistic style that explored the dark, mysterious, and supernatural. Gothic literature, with its haunted castles, doomed romances, and psychological terror, expressed Romantic fascination with extreme emotions, the sublime, and the irrational. This aesthetic sensibility challenged Enlightenment rationality by emphasizing the power of fear, wonder, and the unknown." },
        { id: "transcendentalism", name: "Transcendentalism", category: "movement", description: "An American philosophical and literary movement influenced by European Romanticism. Led by figures like Ralph Waldo Emerson and Henry David Thoreau, Transcendentalism emphasized individual intuition, the divinity of nature, and self-reliance. It represented an American adaptation of Romantic ideas about nature, spirituality, and individual conscience." }
    ],
    links: [
        // Core concept connections
        { source: "passion", target: "reason", description: "Opposes" },
        { source: "imagination", target: "reason", description: "Transcends" },
        { source: "nature", target: "nature_vs_civilization", description: "Idealized in" },
        { source: "sublime", target: "nature", description: "Experienced in" },
        { source: "individualism", target: "freedom", description: "Expresses" },
        { source: "authenticity", target: "rousseau", description: "Developed by" },
        { source: "will", target: "kant", description: "Derived from" },
        { source: "becoming", target: "fichte", description: "Emphasized by" },
        { source: "longing", target: "nostalgia", description: "Related to" },
        { source: "expressivism", target: "herder", description: "Developed by" },
        { source: "nationalism", target: "herder", description: "Founded by" },
        { source: "irrationalism", target: "dostoevsky", description: "Championed by" },
        
        // Philosopher connections
        { source: "rousseau", target: "nature_vs_civilization", description: "Theorized" },
        { source: "rousseau", target: "authenticity", description: "Advocated" },
        { source: "rousseau", target: "nostalgia", description: "Inspired" },
        { source: "rousseau", target: "confessions_rousseau", description: "Wrote" },
        { source: "kant", target: "reason", description: "Critiqued limits of" }, // Adjusted description
        { source: "kant", target: "will", description: "Emphasized in ethics" },
        { source: "kant", target: "freedom", description: "Theorized" },
        { source: "fichte", target: "will", description: "Developed" },
        { source: "fichte", target: "becoming", description: "Emphasized" },
        { source: "fichte", target: "freedom", description: "Celebrated" },
        { source: "herder", target: "nationalism", description: "Developed" },
        { source: "herder", target: "expressivism", description: "Theorized" },
        { source: "goethe", target: "sturm_und_drang", description: "Led" },
        { source: "goethe", target: "sorrows_werther", description: "Wrote" },
        { source: "goethe", target: "german_romanticism", description: "Influenced" },
        { source: "byron", target: "individualism", description: "Embodied" },
        { source: "byron", target: "british_romanticism", description: "Led" },
        { source: "byron", target: "manfred", description: "Wrote" },
        { source: "wordsworth", target: "nature", description: "Celebrated" },
        { source: "wordsworth", target: "lyrical_ballads", description: "Co-wrote" },
        { source: "wordsworth", target: "british_romanticism", description: "Defined" },
        { source: "dostoevsky", target: "irrationalism", description: "Defended" },
        { source: "dostoevsky", target: "notes_underground", description: "Wrote" },
        { source: "mickiewicz", target: "nationalism", description: "Embodied" },
        { source: "mickiewicz", target: "pan_tadeusz", description: "Wrote" },
        { source: "coleridge", target: "imagination", description: "Theorized" },
        { source: "coleridge", target: "lyrical_ballads", description: "Co-wrote" },
        { source: "coleridge", target: "british_romanticism", description: "Defined" },
        { source: "blake", target: "imagination", description: "Celebrated" },
        { source: "blake", target: "british_romanticism", description: "Pioneered" },
        { source: "shelley", target: "individualism", description: "Championed" },
        { source: "shelley", target: "british_romanticism", description: "Exemplified" },
        
        // Work connections
        { source: "notes_underground", target: "irrationalism", description: "Expresses" },
        { source: "notes_underground", target: "reason", description: "Critiques" },
        { source: "sorrows_werther", target: "passion", description: "Celebrates" },
        { source: "sorrows_werther", target: "sturm_und_drang", description: "Exemplifies" },
        { source: "lyrical_ballads", target: "nature", description: "Celebrates" },
        { source: "lyrical_ballads", target: "british_romanticism", description: "Launched" },
        { source: "confessions_rousseau", target: "authenticity", description: "Exemplifies" },
        { source: "manfred", target: "sublime", description: "Explores" },
        { source: "manfred", target: "individualism", description: "Portrays" },
        { source: "pan_tadeusz", target: "nationalism", description: "Expresses" },
        
        // Movement connections
        { source: "german_romanticism", target: "nature", description: "Celebrated" },
        { source: "german_romanticism", target: "imagination", description: "Valued" },
        { source: "german_romanticism", target: "nationalism", description: "Fostered" },
        { source: "british_romanticism", target: "nature", description: "Celebrated" },
        { source: "british_romanticism", target: "imagination", description: "Valued" },
        { source: "british_romanticism", target: "individualism", description: "Emphasized" },
        { source: "sturm_und_drang", target: "passion", description: "Emphasized" },
        { source: "sturm_und_drang", target: "german_romanticism", description: "Preceded" },
        { source: "gothic", target: "sublime", description: "Explored" },
        { source: "gothic", target: "british_romanticism", description: "Influenced" }, // or "Part of"
        { source: "transcendentalism", target: "nature", description: "Revered" },
        { source: "transcendentalism", target: "individualism", description: "Championed" },
        { source: "transcendentalism", target: "german_romanticism", description: "Influenced by" } // Added
    ]
};