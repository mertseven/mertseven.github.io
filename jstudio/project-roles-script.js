document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    handleActiveSection();
    initializeExampleModal();
});

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.roles-nav a');
    
    // Add smooth scrolling to nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 150, // Adjust for header and nav height
                    behavior: 'smooth'
                });
                
                // Update URL without scrolling
                history.pushState(null, null, targetId);
                
                // Update active class
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
}

function handleActiveSection() {
    const sections = document.querySelectorAll('.role-section');
    const navLinks = document.querySelectorAll('.roles-nav a');
    
    // Set active nav item on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 180; // Adjust for header and nav height
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = '#' + section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === current) {
                link.classList.add('active');
            }
        });
    });
    
    // Initialize active section on page load
    if (window.location.hash) {
        const initialLink = document.querySelector(`.roles-nav a[href="${window.location.hash}"]`);
        if (initialLink) {
            initialLink.classList.add('active');
            
            // Scroll to the right position after page loads
            setTimeout(() => {
                const targetElement = document.querySelector(window.location.hash);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 150,
                        behavior: 'auto'
                    });
                }
            }, 100);
        }
    } else {
        // If no hash, set first nav item as active
        const firstLink = document.querySelector('.roles-nav a');
        if (firstLink) {
            firstLink.classList.add('active');
        }
    }
}

function initializeExampleModal() {
    const modal = document.getElementById('exampleModal');
    const closeBtn = document.querySelector('.close-modal');
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const exampleButtons = document.querySelectorAll('.example-btn');
    
    // Close the modal when clicking the close button
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    });
    
    // Close the modal when clicking outside the content
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        }
    });
    
    // Open the modal when clicking "See Example" buttons
    exampleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const deliverableCard = button.closest('.deliverable-card');
            const exampleType = deliverableCard.getAttribute('data-example');
            const deliverableTitle = deliverableCard.querySelector('h4').textContent;
            
            // Set modal title
            modalTitle.textContent = deliverableTitle + ' Example';
            
            // Load appropriate content based on example type
            loadExampleContent(exampleType, modalBody);
            
            // Show the modal
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });
}

function loadExampleContent(exampleType, modalBody) {
    // Clear previous content
    modalBody.innerHTML = '';
    
    // Load example content based on the example type
    switch(exampleType) {
        // Researcher examples
        case 'interview-source':
            modalBody.innerHTML = `
                <p>This template helps you organize and track all interview sources for your story. It ensures proper documentation and follow-up.</p>
                <table>
                    <thead>
                        <tr>
                            <th>Source Name</th>
                            <th>Role/Expertise</th>
                            <th>Contact Info</th>
                            <th>Status</th>
                            <th>Notes</th>
                            <th>Interview Date</th>
                            <th>Follow-up</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Ayşe Yılmaz</td>
                            <td>Remote Software Developer</td>
                            <td>ayse@email.com</td>
                            <td>Completed</td>
                            <td>Works for international company, 2 years remote experience</td>
                            <td>15/02/2025</td>
                            <td>Send transcript</td>
                        </tr>
                        <tr>
                            <td>Mehmet Can</td>
                            <td>HR Manager</td>
                            <td>mehmet@corp.com</td>
                            <td>Scheduled</td>
                            <td>Hiring manager at tech startup</td>
                            <td>18/02/2025</td>
                            <td>Confirm time</td>
                        </tr>
                        <tr>
                            <td>Zeynep Kaya</td>
                            <td>Digital Nomad Coach</td>
                            <td>zeynep@nomad.com</td>
                            <td>Completed</td>
                            <td>Runs community of 500+ digital nomads</td>
                            <td>14/02/2025</td>
                            <td>Share quotes</td>
                        </tr>
                    </tbody>
                </table>
            `;
            break;
            
        case 'observation-logs':
            modalBody.innerHTML = `
                <p>Observation logs document your field research. They capture real-world observations that provide context and depth to your story.</p>
                <table>
                    <thead>
                        <tr>
                            <th>Location</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Observations</th>
                            <th>Demographics</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Impact Hub</td>
                            <td>11/02/2025</td>
                            <td>10:00-14:00</td>
                            <td>85% occupancy, mostly 20-30 age group</td>
                            <td>60% male, 40% female</td>
                            <td>High collaboration observed</td>
                        </tr>
                        <tr>
                            <td>Workinton</td>
                            <td>12/02/2025</td>
                            <td>13:00-17:00</td>
                            <td>90% occupancy, various ages</td>
                            <td>55% female, 45% male</td>
                            <td>Many international calls</td>
                        </tr>
                        <tr>
                            <td>Kolektif House</td>
                            <td>13/02/2025</td>
                            <td>09:00-13:00</td>
                            <td>75% occupancy, young professionals</td>
                            <td>50% male, 50% female</td>
                            <td>Regular community events</td>
                        </tr>
                    </tbody>
                </table>
            `;
            break;
            
        case 'data-analysis':
            modalBody.innerHTML = `
                <p>This template helps you organize statistics and research data from various sources to support your story with credible information.</p>
                <table>
                    <thead>
                        <tr>
                            <th>Source</th>
                            <th>Data Type</th>
                            <th>Date Published</th>
                            <th>Key Statistics</th>
                            <th>Relevance</th>
                            <th>Verification</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>TÜİK</td>
                            <td>Employment Statistics</td>
                            <td>2024</td>
                            <td>35% increase in remote work</td>
                            <td>National trends</td>
                            <td>Official data</td>
                        </tr>
                        <tr>
                            <td>LinkedIn Report</td>
                            <td>Industry Analysis</td>
                            <td>2024</td>
                            <td>70% of new job postings offer remote options</td>
                            <td>Job market trends</td>
                            <td>Report archived</td>
                        </tr>
                        <tr>
                            <td>World Economic Forum</td>
                            <td>Global Study</td>
                            <td>2024</td>
                            <td>45% of Gen Z prefer fully remote work</td>
                            <td>International context</td>
                            <td>Study downloaded</td>
                        </tr>
                    </tbody>
                </table>
            `;
            break;
            
        case 'data-integration':
            modalBody.innerHTML = `
                <p>The Data Integration Matrix shows how different data sources connect and support your narrative. It helps identify strong correlations and areas that need more research.</p>
                <table>
                    <thead>
                        <tr>
                            <th>Finding</th>
                            <th>First-Hand Source</th>
                            <th>Second-Hand Source</th>
                            <th>Correlation</th>
                            <th>Action Items</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Preference for Remote Work</td>
                            <td>Survey: 78%</td>
                            <td>TÜİK: 35% increase</td>
                            <td>Strong</td>
                            <td>Deep dive needed</td>
                        </tr>
                        <tr>
                            <td>Work-Life Balance</td>
                            <td>Focus Group</td>
                            <td>Academic Research</td>
                            <td>Strong</td>
                            <td>Quote selection</td>
                        </tr>
                        <tr>
                            <td>Job Market Trends</td>
                            <td>HR Interviews</td>
                            <td>LinkedIn Report</td>
                            <td>Strong</td>
                            <td>Data visualization</td>
                        </tr>
                    </tbody>
                </table>
            `;
            break;
            
        case 'visualization-suggestions':
            modalBody.innerHTML = `
                <p>This template outlines data visualization concepts to help the Multimedia Editor create effective graphics that support the story.</p>
                <h4>Visualization 1: Remote Work Adoption Timeline</h4>
                <p><strong>Type:</strong> Interactive Line Graph</p>
                <p><strong>Purpose:</strong> Show growth trend of remote work adoption</p>
                <p><strong>Data Points:</strong></p>
                <ul>
                    <li>Year-over-year remote work statistics (2020-2025)</li>
                    <li>Industry-specific trend lines</li>
                    <li>Key event markers (pandemic, policy changes, tech innovations)</li>
                </ul>
                <p><strong>Technical Specifications:</strong></p>
                <ul>
                    <li>Tool: D3.js or Flourish</li>
                    <li>Interactive hover states</li>
                    <li>Color-coded industry lines</li>
                    <li>Responsive design</li>
                    <li>Mobile-friendly tooltips</li>
                </ul>
                
                <h4>Visualization 2: Digital Nomad Demographics</h4>
                <p><strong>Type:</strong> Interactive Stacked Bar Chart</p>
                <p><strong>Purpose:</strong> Break down digital nomad demographics</p>
                <p><strong>Data Points:</strong></p>
                <ul>
                    <li>Age groups</li>
                    <li>Education levels</li>
                    <li>Industry sectors</li>
                    <li>Income brackets</li>
                    <li>Geographic distribution</li>
                </ul>
            `;
            break;
            
        case 'quality-control':
            modalBody.innerHTML = `
                <p>The Quality Control Checklist ensures your research meets journalistic standards of accuracy, balance, and thoroughness.</p>
                <h4>Data Verification:</h4>
                <ul>
                    <li>□ Primary sources contacted: Complete</li>
                    <li>□ Statistics cross-referenced: Complete</li>
                    <li>□ Expert opinions verified: In Progress</li>
                    <li>□ Methodology documented: Complete</li>
                </ul>
                
                <h4>Balance Check:</h4>
                <ul>
                    <li>□ Multiple perspectives represented</li>
                    <li>□ Age groups covered</li>
                    <li>□ Industry sectors included</li>
                    <li>□ Geographic diversity considered</li>
                </ul>
                
                <h4>Documentation:</h4>
                <ul>
                    <li>□ Interview transcripts saved</li>
                    <li>□ Survey raw data archived</li>
                    <li>□ Sources properly cited</li>
                    <li>□ Contact information updated</li>
                </ul>
            `;
            break;
            
        // Strategist examples
        case 'team-coordination':
            modalBody.innerHTML = `
                <p>The Team Coordination Matrix helps track the status, dependencies, and deadlines for each role in the project.</p>
                <table>
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Status Tracking</th>
                            <th>Dependencies</th>
                            <th>Deadlines</th>
                            <th>Support Needed</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Researcher</td>
                            <td>• Source interviews<br>• Data analysis<br>• Fact verification</td>
                            <td>Content outline needs</td>
                            <td>Feb 15: Initial research</td>
                            <td>Schedule coordination</td>
                        </tr>
                        <tr>
                            <td>Content Writer</td>
                            <td>• Draft status<br>• Revisions<br>• Final edits</td>
                            <td>Research findings</td>
                            <td>Feb 18: First draft</td>
                            <td>Interview transcripts</td>
                        </tr>
                        <tr>
                            <td>Multimedia Editor</td>
                            <td>• Visual assets<br>• Video production<br>• Graphics</td>
                            <td>Story requirements</td>
                            <td>Feb 20: Visual assets</td>
                            <td>Technical specifications</td>
                        </tr>
                    </tbody>
                </table>
            `;
            break;
            
        case 'project-timeline':
            modalBody.innerHTML = `
                <p>The Project Timeline organizes all project activities into a structured schedule with clear milestones and deadlines.</p>
                <h4>Week 1: Research & Planning</h4>
                <ul>
                    <li>□ Day 1: Team kickoff meeting</li>
                    <li>□ Day 2: Research begins</li>
                    <li>□ Day 3: Initial interviews scheduled</li>
                    <li>□ Day 4: Content outline review</li>
                    <li>□ Day 5: Visual strategy approval</li>
                </ul>
                
                <h4>Week 2: Content Development</h4>
                <ul>
                    <li>□ Day 1-2: Interview process</li>
                    <li>□ Day 3: Draft writing begins</li>
                    <li>□ Day 4: Visual asset creation</li>
                    <li>□ Day 5: Progress review meeting</li>
                </ul>
                
                <h4>Week 3: Production & Review</h4>
                <ul>
                    <li>□ Day 1: Content assembly</li>
                    <li>□ Day 2: Team review session</li>
                    <li>□ Day 3: Revisions</li>
                    <li>□ Day 4: Final approval</li>
                    <li>□ Day 5: Publication prep</li>
                </ul>
            `;
            break;
            
        case 'communication-plan':
            modalBody.innerHTML = `
                <p>The Communication Plan establishes how the team will collaborate, share updates, and address issues throughout the project.</p>
                <table>
                    <thead>
                        <tr>
                            <th>Channel</th>
                            <th>Purpose</th>
                            <th>Response Time</th>
                            <th>Usage Guidelines</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Slack</td>
                            <td>Quick updates</td>
                            <td>< 2 hours</td>
                            <td>Daily coordination</td>
                        </tr>
                        <tr>
                            <td>Email</td>
                            <td>Official communications</td>
                            <td>< 24 hours</td>
                            <td>External contact</td>
                        </tr>
                        <tr>
                            <td>Meetings</td>
                            <td>Detailed discussions</td>
                            <td>Scheduled</td>
                            <td>Team alignment</td>
                        </tr>
                        <tr>
                            <td>Project Management Tool</td>
                            <td>Task tracking</td>
                            <td>Daily updates</td>
                            <td>Progress monitoring</td>
                        </tr>
                    </tbody>
                </table>
                
                <h4>Team Meeting Schedule</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Meeting Type</th>
                            <th>Frequency</th>
                            <th>Purpose</th>
                            <th>Deliverables</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Daily Standup</td>
                            <td>15 mins, daily</td>
                            <td>Quick updates</td>
                            <td>Blockers identified</td>
                        </tr>
                        <tr>
                            <td>Progress Review</td>
                            <td>1 hour, weekly</td>
                            <td>Detailed review</td>
                            <td>Status report</td>
                        </tr>
                    </tbody>
                </table>
            `;
            break;
            
        case 'platform-strategy':
            modalBody.innerHTML = `
                <p>The Platform Strategy Matrix details how to adapt your story for different social media platforms to maximize reach and engagement.</p>
                <h4>Instagram Strategy</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Content Type</th>
                            <th>Format</th>
                            <th>Specifications</th>
                            <th>Engagement Goal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Feed Posts</td>
                            <td>Square/Portrait</td>
                            <td>1080x1080px/1080x1350px</td>
                            <td>Build narrative</td>
                        </tr>
                        <tr>
                            <td>Stories</td>
                            <td>Vertical</td>
                            <td>1080x1920px</td>
                            <td>Drive interaction</td>
                        </tr>
                        <tr>
                            <td>Reels</td>
                            <td>Vertical</td>
                            <td>1080x1920px</td>
                            <td>Reach expansion</td>
                        </tr>
                        <tr>
                            <td>Carousels</td>
                            <td>Square</td>
                            <td>1080x1080px</td>
                            <td>Save/Share rates</td>
                        </tr>
                    </tbody>
                </table>
                
                <h4>Twitter Strategy</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Content Type</th>
                            <th>Format</th>
                            <th>Length</th>
                            <th>Purpose</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Main Tweets</td>
                            <td>Text/Image</td>
                            <td>280 chars</td>
                            <td>Key insights</td>
                        </tr>
                        <tr>
                            <td>Thread Posts</td>
                            <td>Text series</td>
                            <td>2-5 tweets</td>
                            <td>Deep dive</td>
                        </tr>
                    </tbody>
                </table>
            `;
            break;
            
        case 'content-adaptation':
            modalBody.innerHTML = `
                <p>The Content Adaptation Framework guides how to transform your story elements for different platforms and formats.</p>
                <table>
                    <thead>
                        <tr>
                            <th>Original Asset</th>
                            <th>Platform</th>
                            <th>Adaptation Needs</th>
                            <th>Key Elements</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Hero Image</td>
                            <td>Instagram</td>
                            <td>• Crop to 1:1<br>• Enhance vibrancy<br>• Add text overlay</td>
                            <td>Engagement focus</td>
                        </tr>
                        <tr>
                            <td>Data Visual</td>
                            <td>Twitter</td>
                            <td>• Simplify<br>• Add bold text<br>• Include branding</td>
                            <td>Quick comprehension</td>
                        </tr>
                        <tr>
                            <td>Interview Clip</td>
                            <td>LinkedIn</td>
                            <td>• Professional edit<br>• Add subtitles<br>• Brand frames</td>
                            <td>Industry relevance</td>
                        </tr>
                    </tbody>
                </table>
                
                <h4>Message Adaptation</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Platform</th>
                            <th>Tone</th>
                            <th>Length</th>
                            <th>Style Elements</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Instagram</td>
                            <td>Casual/Friendly</td>
                            <td>125-150 words</td>
                            <td>Emojis, storytelling</td>
                        </tr>
                        <tr>
                            <td>Twitter</td>
                            <td>Direct/Engaging</td>
                            <td>280 chars</td>
                            <td>Hashtags, hooks</td>
                        </tr>
                        <tr>
                            <td>LinkedIn</td>
                            <td>Professional/Informative</td>
                            <td>200-250 words</td>
                            <td>Industry terms</td>
                        </tr>
                    </tbody>
                </table>
            `;
            break;
            
        case 'engagement-strategy':
            modalBody.innerHTML = `
                <p>The Engagement Strategy outlines how to interact with your audience and build community around your story.</p>
                <h4>Content Calendar</h4>
                <p><strong>Daily Schedule Template:</strong></p>
                <ul>
                    <li>09:00 - LinkedIn main post</li>
                    <li>11:00 - Twitter thread start</li>
                    <li>13:00 - Instagram main post</li>
                    <li>15:00 - Story updates</li>
                    <li>17:00 - Engagement responses</li>
                    <li>19:00 - Performance check</li>
                </ul>
                
                <h4>Hashtag Strategy</h4>
                <p><strong>Primary Tags:</strong></p>
                <ul>
                    <li>#UzaktanÇalışma</li>
                    <li>#DijitalGöçebe</li>
                    <li>#YeniNesilÇalışma</li>
                </ul>
                
                <p><strong>Secondary Tags:</strong></p>
                <ul>
                    <li>#RemoteWorkTR</li>
                    <li>#ÇalışmaHayatı</li>
                    <li>#İşYaşamDengesi</li>
                </ul>
                
                <h4>Engagement Tactics</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Action</th>
                            <th>Response Plan</th>
                            <th>Goal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Questions</td>
                            <td>Ask audience experience</td>
                            <td>Reply within 2 hours</td>
                            <td>Discussion</td>
                        </tr>
                        <tr>
                            <td>Polls</td>
                            <td>Industry trends</td>
                            <td>Share results</td>
                            <td>Participation</td>
                        </tr>
                        <tr>
                            <td>Tags</td>
                            <td>Community building</td>
                            <td>Thank participants</td>
                            <td>Network growth</td>
                        </tr>
                    </tbody>
                </table>
            `;
            break;
            
                // Content Writer examples
                case 'story-planning':
                    modalBody.innerHTML = `
                        <p>The Story Planning Matrix helps organize your story into logical sections with specific content plans for each segment.</p>
                        <table>
                            <thead>
                                <tr>
                                    <th>Section</th>
                                    <th>Key Points</th>
                                    <th>Data Integration</th>
                                    <th>Human Element</th>
                                    <th>Word Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Introduction</td>
                                    <td>Hook, thesis statement</td>
                                    <td>Key statistic (e.g., TÜİK data)</td>
                                    <td>Brief anecdote (Ayşe's experience)</td>
                                    <td>~150 words</td>
                                </tr>
                                <tr>
                                    <td>Body 1: The Rise</td>
                                    <td>Growth factors, benefits</td>
                                    <td>LinkedIn report, survey data</td>
                                    <td>Quote from Mehmet Can (HR Manager)</td>
                                    <td>~250 words</td>
                                </tr>
                                <tr>
                                    <td>Body 2: Challenges</td>
                                    <td>Isolation, tech issues</td>
                                    <td>Observation logs, expert opinion</td>
                                    <td>Quote from Zeynep Kaya (Coach)</td>
                                    <td>~250 words</td>
                                </tr>
                                <tr>
                                    <td>Conclusion</td>
                                    <td>Summary, future outlook</td>
                                    <td>WEF study prediction</td>
                                    <td>Call to action/final thought</td>
                                    <td>~100 words</td>
                                </tr>
                            </tbody>
                        </table>
                    `; // <<< Added closing backtick and semicolon
                    break; // <<< Added break statement
                    
                    case 'lead-options':
    modalBody.innerHTML = `
        <p>The Lead Options document presents several potential story openings to help you select the most compelling approach for your audience.</p>
        <h4>Option 1: Personal Story</h4>
        <blockquote>
            At 8:30 AM, Ayşe Yılmaz opens her laptop at a bustling İzmir cafe. As commuters rush to office buildings, she sips her coffee and begins her workday. She hasn't been to a traditional office in three years—and she's not alone. Across Turkey, thousands of young professionals are embracing remote work, transforming both careers and communities.
        </blockquote>
        <p><strong>Strengths:</strong> Human connection, immediate engagement, relatable scenario<br>
        <strong>Audience Appeal:</strong> General readers, those curious about lifestyle changes</p>
        
        <h4>Option 2: Statistical Impact</h4>
        <blockquote>
            Remote work in Turkey has surged 35% since 2023, with over half a million professionals now working primarily from home or third spaces. This shift represents the most significant transformation in Turkish work culture since mass urbanization, with profound implications for everything from real estate to family structures.
        </blockquote>
        <p><strong>Strengths:</strong> Establishes significance, data-backed credibility<br>
        <strong>Audience Appeal:</strong> Business readers, policy makers, data-driven audience</p>
        
        <h4>Option 3: Contrast Approach</h4>
        <blockquote>
            Two years ago, İstanbul's business districts were crowded with commuters, office buildings were at capacity, and "working from home" was considered a temporary pandemic solution. Today, a starkly different reality has emerged: hybrid work policies dominate job listings, co-working spaces are expanding, and employees are questioning the very nature of workplace requirements.
        </blockquote>
        <p><strong>Strengths:</strong> Creates drama through comparison, establishes change over time<br>
        <strong>Audience Appeal:</strong> Readers interested in social transformation, business trends</p>
        
        <h4>Option 4: Question-Based</h4>
        <blockquote>
            What happens when an entire generation decides traditional office work isn't worth the commute? As digital natives enter Turkey's professional workforce, they're bringing new expectations about when, where, and how work gets done—and employers are increasingly adapting to these demands or risking talent loss.
        </blockquote>
        <p><strong>Strengths:</strong> Thought-provoking, poses a central question for exploration<br>
        <strong>Audience Appeal:</strong> Analytical readers, those interested in generational shifts</p>
        
        <h4>Selection Criteria:</h4>
        <table>
            <thead>
                <tr>
                    <th>Consideration</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Audience</td>
                    <td>Consider primary publication demographics and interests</td>
                </tr>
                <tr>
                    <td>Platform</td>
                    <td>Different leads may work better for print vs. digital</td>
                </tr>
                <tr>
                    <td>Core Message</td>
                    <td>Ensure lead supports the central thesis of the story</td>
                </tr>
                <tr>
                    <td>Tone Alignment</td>
                    <td>Match publication style and overall story approach</td>
                </tr>
            </tbody>
        </table>
    `;
    break;
    
                    case 'quote-integration':
                        modalBody.innerHTML = `
                            <p>The Quote Integration Plan strategically places impactful quotes throughout your story to support key points and add human voices.</p>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Theme</th>
                                        <th>Quote</th>
                                        <th>Source</th>
                                        <th>Context</th>
                                        <th>Placement</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Freedom</td>
                                        <td>"I can work from my hometown, spend time with family, and still excel in my career."</td>
                                        <td>Can Demir</td>
                                        <td>Work-life balance section</td>
                                        <td>After statistics</td>
                                    </tr>
                                    <tr>
                                        <td>Productivity</td>
                                        <td>"Our remote teams show 30% higher productivity rates."</td>
                                        <td>Mehmet Can</td>
                                        <td>Economic impact section</td>
                                        <td>Supporting data</td>
                                    </tr>
                                    <tr>
                                        <td>Challenges</td>
                                        <td>"Internet infrastructure remains a key concern."</td>
                                        <td>Esra Şahin</td>
                                        <td>Practical considerations</td>
                                        <td>Balance perspective</td>
                                    </tr>
                                    <tr>
                                        <td>Future</td>
                                        <td>"This isn't a trend; it's the new normal."</td>
                                        <td>Zeynep Kaya</td>
                                        <td>Closing section</td>
                                        <td>Expert insight</td>
                                    </tr>
                                </tbody>
                            </table>
                        `;
                        break;
                        case 'story-structure':
                            modalBody.innerHTML = `
                                <p>The Story Structure details the organization and flow of your article, ensuring a logical progression and comprehensive coverage.</p>
                                <h4>Opening Section</h4>
                                <ul>
                                    <li>Scene-setting with Ayşe</li>
                                    <li>Key statistics introduction</li>
                                    <li>Story promise</li>
                                </ul>
                                
                                <h4>Context Block</h4>
                                <ul>
                                    <li>Brief history of remote work in Turkey</li>
                                    <li>Pandemic impact</li>
                                    <li>Current state</li>
                                    <li>[Insert Timeline Visualization]</li>
                                </ul>
                                
                                <h4>Main Analysis Sections</h4>
                                <h5>1. Why Remote Work?</h5>
                                <ul>
                                    <li>Survey findings</li>
                                    <li>Personal testimonies</li>
                                    <li>Economic factors</li>
                                    <li>[Insert Demographics Visualization]</li>
                                </ul>
                                
                                <h5>2. Geographic Impact</h5>
                                <ul>
                                    <li>Regional differences</li>
                                    <li>Infrastructure challenges</li>
                                    <li>Opportunities</li>
                                    <li>[Insert Heat Map]</li>
                                </ul>
                                
                                <h5>3. Satisfaction and Challenges</h5>
                                <ul>
                                    <li>Comparative analysis</li>
                                    <li>Company perspective</li>
                                    <li>Worker perspective</li>
                                    <li>[Insert Satisfaction Metrics]</li>
                                </ul>
                                
                                <h4>Future Implications</h4>
                                <ul>
                                    <li>Industry trends</li>
                                    <li>Expert predictions</li>
                                    <li>Societal impact</li>
                                </ul>
                                
                                <h4>Closing</h4>
                                <ul>
                                    <li>Return to personal story</li>
                                    <li>Forward-looking statement</li>
                                    <li>Call to reflection</li>
                                </ul>
                            `;
                            break;
                            
                            case 'seo-elements':
    modalBody.innerHTML = `
        <p>SEO and Digital Elements help optimize your story for search engines and digital platforms to increase visibility and engagement.</p>
        <h4>Keywords:</h4>
        <ul>
            <li>uzaktan çalışma (remote work)</li>
            <li>dijital göçebe (digital nomad)</li>
            <li>esnek çalışma (flexible work)</li>
            <li>iş-yaşam dengesi (work-life balance)</li>
            <li>yeni nesil çalışma (new generation work)</li>
        </ul>
        
        <h4>Meta Description:</h4>
        <blockquote>
            Türkiye'de genç profesyoneller neden uzaktan çalışmayı tercih ediyor? Dijital göçebelik ve esnek çalışma modellerinin yükselişini araştırdık. İstatistikler, kişisel deneyimler ve uzman görüşleriyle kapsamlı bir analiz.
        </blockquote>
        
        <h4>Social Media Hooks:</h4>
        <ol>
            <li>"İş artık bir yer değil, bir aktivite" #UzaktanÇalışma</li>
            <li>"Yeni nesil ofisi reddediyor mu?" #YeniNesilÇalışma</li>
            <li>"Dijital göçebelik: Türk gençlerinin yeni trendi" #DijitalGöçebe</li>
        </ol>
    `;
    break;

    case 'multimedia-integration':
    modalBody.innerHTML = `
        <p>The Multimedia Integration Points plan identifies where and how visual and audio elements should be incorporated to enhance the story.</p>
        <h4>Video Elements:</h4>
        <ul>
            <li>Day-in-life of digital nomad</li>
            <li>Co-working space tour</li>
            <li>Expert interview clips</li>
        </ul>
        
        <h4>Photo Opportunities:</h4>
        <ul>
            <li>Remote workers in various settings</li>
            <li>Co-working space activities</li>
            <li>Technology setup shots</li>
            <li>Contrast shots (traditional office vs. remote)</li>
        </ul>
        
        <h4>Audio Elements:</h4>
        <ul>
            <li>Interview snippets</li>
            <li>Ambient sounds from different work locations</li>
            <li>Podcast-style expert discussions</li>
        </ul>
        
        <h4>Infographic Placements:</h4>
        <ul>
            <li>Timeline visualization after context section</li>
            <li>Demographics visualization in core analysis</li>
            <li>Heat map in geographic impact section</li>
            <li>Satisfaction metrics in comparative analysis</li>
        </ul>
    `;
    break;

         // Multimedia Editor Examples

// Photography Production Plan
case 'photography-plan':
    modalBody.innerHTML = `
        <p>The Photography Production Plan outlines the images needed for your story, including technical specifications and logistical details.</p>
        <h4>Shot List:</h4>
        <table>
            <thead>
                <tr>
                    <th>Shot Type</th>
                    <th>Subject</th>
                    <th>Location</th>
                    <th>Technical Notes</th>
                    <th>Purpose</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Hero Image</td>
                    <td>Remote worker at cafe</td>
                    <td>Bağdat Caddesi cafe</td>
                    <td>Natural light, shallow depth</td>
                    <td>Story opener</td>
                </tr>
                <tr>
                    <td>Portrait</td>
                    <td>Ayşe Yılmaz (interviewee)</td>
                    <td>Her home workspace</td>
                    <td>Environmental portrait</td>
                    <td>Personal element</td>
                </tr>
                <tr>
                    <td>Sequence</td>
                    <td>Daily routine</td>
                    <td>Co-working space</td>
                    <td>5-8 shots, storytelling</td>
                    <td>Visual narrative</td>
                </tr>
                <tr>
                    <td>Detail</td>
                    <td>Technology setup</td>
                    <td>Multiple locations</td>
                    <td>Macro lens, detail focus</td>
                    <td>Equipment context</td>
                </tr>
            </tbody>
        </table>
        
        <h4>Technical Specifications:</h4>
        <ul>
            <li><strong>Format:</strong> RAW + JPEG</li>
            <li><strong>Resolution:</strong> Minimum 24MP</li>
            <li><strong>Aspect Ratio:</strong> 3:2 (horizontal) and 4:5 (vertical for social)</li>
            <li><strong>Style:</strong> Documentary with monochrome option</li>
            <li><strong>Post-Processing:</strong> Journalism standard, minimal enhancement</li>
        </ul>
        
        <h4>Location Planning:</h4>
        <table>
            <thead>
                <tr>
                    <th>Location</th>
                    <th>Date/Time</th>
                    <th>Permits Required</th>
                    <th>Contact Person</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Impact Hub</td>
                    <td>15/02/2025, 10:00</td>
                    <td>Yes (confirmed)</td>
                    <td>Ali Türk</td>
                    <td>Community day, busy environment</td>
                </tr>
                <tr>
                    <td>Ayşe's Home Office</td>
                    <td>16/02/2025, 14:00</td>
                    <td>No</td>
                    <td>Ayşe Yılmaz</td>
                    <td>Natural light best in afternoon</td>
                </tr>
                <tr>
                    <td>Seaside Cafe</td>
                    <td>17/02/2025, 08:30</td>
                    <td>Yes (pending)</td>
                    <td>Mehmet Aydın</td>
                    <td>Morning rush, digital nomad hub</td>
                </tr>
            </tbody>
        </table>
    `;
    break;

// Video Production Plan
case 'video-plan':
    modalBody.innerHTML = `
        <p>The Video Production Plan details all aspects of creating video content for your story, from pre-production to final delivery.</p>
        <h4>Storyboard/Shot List:</h4>
        <table>
            <thead>
                <tr>
                    <th>Scene</th>
                    <th>Shot Type</th>
                    <th>Description</th>
                    <th>Audio</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Intro</td>
                    <td>Wide establishing</td>
                    <td>City view, morning commute</td>
                    <td>Ambient city sounds</td>
                    <td>5 seconds</td>
                </tr>
                <tr>
                    <td>Contrast</td>
                    <td>Split screen</td>
                    <td>Office worker vs. remote worker</td>
                    <td>Transition music</td>
                    <td>8 seconds</td>
                </tr>
                <tr>
                    <td>Interview 1</td>
                    <td>Medium close-up</td>
                    <td>Ayşe discussing flexibility</td>
                    <td>Interview audio</td>
                    <td>15 seconds</td>
                </tr>
                <tr>
                    <td>B-roll</td>
                    <td>Various</td>
                    <td>Remote work environment</td>
                    <td>Soft background music</td>
                    <td>10 seconds</td>
                </tr>
                <tr>
                    <td>Expert View</td>
                    <td>Medium shot</td>
                    <td>HR Manager Mehmet Can</td>
                    <td>Interview audio</td>
                    <td>15 seconds</td>
                </tr>
                <tr>
                    <td>Conclusion</td>
                    <td>Slow motion, wide</td>
                    <td>Digital nomad packing up</td>
                    <td>Music crescendo</td>
                    <td>7 seconds</td>
                </tr>
            </tbody>
        </table>
        
        <h4>Technical Requirements:</h4>
        <ul>
            <li><strong>Resolution:</strong> 4K (3840x2160)</li>
            <li><strong>Frame Rate:</strong> 25fps</li>
            <li><strong>Codec:</strong> H.264/ProRes 422</li>
            <li><strong>Aspect Ratio:</strong> 16:9 (horizontal), 9:16 (vertical for social)</li>
            <li><strong>Audio:</strong> 48kHz, 24-bit, stereo</li>
            <li><strong>Delivery Formats:</strong> MP4 (web), MOV (archive)</li>
        </ul>
        
        <h4>Shooting Schedule:</h4>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Location</th>
                    <th>Content</th>
                    <th>Equipment Needs</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>18/02/2025</td>
                    <td>07:00-09:00</td>
                    <td>City center</td>
                    <td>Establishing shots</td>
                    <td>Drone, tripod</td>
                </tr>
                <tr>
                    <td>18/02/2025</td>
                    <td>10:00-12:00</td>
                    <td>Ayşe's workspace</td>
                    <td>Interview, B-roll</td>
                    <td>Lighting kit, lapel mic</td>
                </tr>
                <tr>
                    <td>19/02/2025</td>
                    <td>14:00-16:00</td>
                    <td>Corporate office</td>
                    <td>Expert interview</td>
                    <td>Tripod, shotgun mic</td>
                </tr>
                <tr>
                    <td>20/02/2025</td>
                    <td>16:00-18:00</td>
                    <td>Co-working space</td>
                    <td>B-roll, atmosphere</td>
                    <td>Gimbal, slider</td>
                </tr>
            </tbody>
        </table>
    `;
    break;

// Audio Production Plan
case 'audio-plan':
    modalBody.innerHTML = `
        <p>The Audio Production Plan outlines the recording, editing, and integration of audio elements for your story.</p>
        <h4>Recording Schedule:</h4>
        <table>
            <thead>
                <tr>
                    <th>Audio Type</th>
                    <th>Subject/Source</th>
                    <th>Date/Time</th>
                    <th>Location</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Interview</td>
                    <td>Ayşe Yılmaz</td>
                    <td>18/02/2025, 10:30</td>
                    <td>Quiet room, home office</td>
                    <td>30 minutes</td>
                </tr>
                <tr>
                    <td>Expert Commentary</td>
                    <td>Mehmet Can (HR)</td>
                    <td>19/02/2025, 15:00</td>
                    <td>Corporate meeting room</td>
                    <td>20 minutes</td>
                </tr>
                <tr>
                    <td>Ambient Sound</td>
                    <td>Co-working space</td>
                    <td>20/02/2025, 11:00</td>
                    <td>Impact Hub main area</td>
                    <td>15 minutes</td>
                </tr>
                <tr>
                    <td>Ambient Sound</td>
                    <td>Cafe work environment</td>
                    <td>20/02/2025, 14:00</td>
                    <td>Bağdat Caddesi cafe</td>
                    <td>15 minutes</td>
                </tr>
                <tr>
                    <td>Narration</td>
                    <td>Story voiceover</td>
                    <td>22/02/2025, 09:00</td>
                    <td>Studio booth</td>
                    <td>10 minutes</td>
                </tr>
            </tbody>
        </table>
        
        <h4>Equipment Needs:</h4>
        <ul>
            <li><strong>Microphones:</strong>
                <ul>
                    <li>Rode NTG4+ Shotgun (interviews)</li>
                    <li>Lavalier mics (interviews)</li>
                    <li>Zoom H6 field recorder (ambient)</li>
                </ul>
            </li>
            <li><strong>Accessories:</strong>
                <ul>
                    <li>Windshields/deadcats</li>
                    <li>Shock mounts</li>
                    <li>Headphones</li>
                    <li>Stands/booms</li>
                </ul>
            </li>
        </ul>
        
        <h4>Format Specifications:</h4>
        <table>
            <thead>
                <tr>
                    <th>Purpose</th>
                    <th>Format</th>
                    <th>Sample Rate</th>
                    <th>Bit Depth</th>
                    <th>Special Requirements</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Web Audio Player</td>
                    <td>MP3</td>
                    <td>44.1kHz</td>
                    <td>16-bit</td>
                    <td>128-320kbps bitrate</td>
                </tr>
                <tr>
                    <td>Video Integration</td>
                    <td>WAV</td>
                    <td>48kHz</td>
                    <td>24-bit</td>
                    <td>Sync markers</td>
                </tr>
                <tr>
                    <td>Podcasting</td>
                    <td>MP3</td>
                    <td>44.1kHz</td>
                    <td>16-bit</td>
                    <td>ID3 tags, chapter markers</td>
                </tr>
                <tr>
                    <td>Archive</td>
                    <td>WAV</td>
                    <td>96kHz</td>
                    <td>24-bit</td>
                    <td>Uncompressed</td>
                </tr>
            </tbody>
        </table>
    `;
    break;

// Infographic Production Plan
case 'infographic-plan':
    modalBody.innerHTML = `
        <p>The Infographic Production Plan outlines the data visualizations that will enhance your story and make complex information accessible.</p>
        <h4>Design Concepts:</h4>
        <table>
            <thead>
                <tr>
                    <th>Visualization Type</th>
                    <th>Data Focus</th>
                    <th>Style/Approach</th>
                    <th>Placement</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Timeline</td>
                    <td>Remote work evolution in Turkey</td>
                    <td>Interactive, horizontal</td>
                    <td>Context section</td>
                </tr>
                <tr>
                    <td>Bar Chart</td>
                    <td>Industry adoption rates</td>
                    <td>Comparative, grouped</td>
                    <td>Analysis section</td>
                </tr>
                <tr>
                    <td>Pie/Donut Chart</td>
                    <td>Demographics breakdown</td>
                    <td>Segmented, labeled</td>
                    <td>Demographics section</td>
                </tr>
                <tr>
                    <td>Heat Map</td>
                    <td>Geographic distribution</td>
                    <td>Turkey map overlay</td>
                    <td>Geographic impact section</td>
                </tr>
                <tr>
                    <td>Flow Diagram</td>
                    <td>Remote work process</td>
                    <td>Illustrated workflow</td>
                    <td>Practical section</td>
                </tr>
            </tbody>
        </table>
        
        <h4>Data Sources:</h4>
        <ul>
            <li><strong>Primary:</strong>
                <ul>
                    <li>Survey results (n=250)</li>
                    <li>Interview insights</li>
                    <li>Field observations</li>
                </ul>
            </li>
            <li><strong>Secondary:</strong>
                <ul>
                    <li>TÜİK employment data</li>
                    <li>LinkedIn market report</li>
                    <li>World Economic Forum study</li>
                    <li>Industry white papers</li>
                </ul>
            </li>
        </ul>
        
        <h4>Technical Specifications:</h4>
        <table>
            <thead>
                <tr>
                    <th>Visualization</th>
                    <th>Format</th>
                    <th>Dimensions</th>
                    <th>Tool</th>
                    <th>Special Features</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Timeline</td>
                    <td>SVG/HTML5</td>
                    <td>800x300px</td>
                    <td>D3.js</td>
                    <td>Interactive tooltips</td>
                </tr>
                <tr>
                    <td>Bar Chart</td>
                    <td>SVG</td>
                    <td>600x400px</td>
                    <td>Flourish</td>
                    <td>Animation on load</td>
                </tr>
                <tr>
                    <td>Heat Map</td>
                    <td>PNG/SVG</td>
                    <td>700x500px</td>
                    <td>QGIS/Illustrator</td>
                    <td>Zoom regions</td>
                </tr>
                <tr>
                    <td>Flow Diagram</td>
                    <td>SVG</td>
                    <td>500x600px</td>
                    <td>Illustrator</td>
                    <td>Iconography</td>
                </tr>
                <tr>
                    <td>Static Exports</td>
                    <td>PNG</td>
                    <td>Various</td>
                    <td>Various</td>
                    <td>Social media optimized</td>
                </tr>
            </tbody>
        </table>
    `;
    break;

// Asset Management Plan
case 'asset-management':
    modalBody.innerHTML = `
        <p>The Asset Management Plan establishes an organized system for file organization, naming conventions, and quality control procedures.</p>
        <h4>File Organization System:</h4>
        <pre style="background: #f5f5f5; padding: 10px; font-family: monospace;">
PROJECT_ROOT/
├── 01_PHOTO/
│   ├── RAW/
│   ├── EDITED/
│   └── FINAL/
├── 02_VIDEO/
│   ├── FOOTAGE/
│   ├── AUDIO/
│   ├── GRAPHICS/
│   └── EXPORTS/
├── 03_AUDIO/
│   ├── RAW/
│   ├── EDITED/
│   └── FINAL/
├── 04_GRAPHICS/
│   ├── DATA/
│   ├── DRAFTS/
│   └── FINAL/
└── 05_DELIVERABLES/
    ├── WEB/
    ├── PRINT/
    └── SOCIAL/
</pre>
        
        <h4>Naming Conventions:</h4>
        <table>
            <thead>
                <tr>
                    <th>Asset Type</th>
                    <th>Naming Format</th>
                    <th>Example</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Photos</td>
                    <td>DATE_LOCATION_SUBJECT_VERSION</td>
                    <td>20250215_IMPACT_INTERVIEW_V1.jpg</td>
                </tr>
                <tr>
                    <td>Video Clips</td>
                    <td>DATE_SCENE_SHOT_VERSION</td>
                    <td>20250218_INTRO_WIDE_V2.mp4</td>
                </tr>
                <tr>
                    <td>Audio Files</td>
                    <td>DATE_TYPE_SUBJECT_VERSION</td>
                    <td>20250218_INT_AYSE_V1.wav</td>
                </tr>
                <tr>
                    <td>Graphics</td>
                    <td>TYPE_SUBJECT_VERSION</td>
                    <td>CHART_DEMOGRAPHICS_V3.ai</td>
                </tr>
                <tr>
                    <td>Final Deliverables</td>
                    <td>PLATFORM_TYPE_DATE</td>
                    <td>WEB_TIMELINE_20250222.svg</td>
                </tr>
            </tbody>
        </table>
        
        <h4>Quality Control Checklist:</h4>
        <table>
            <thead>
                <tr>
                    <th>Asset Type</th>
                    <th>Quality Check</th>
                    <th>Approval Process</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Photography</td>
                    <td>
                        <ul>
                            <li>□ Focus sharpness</li>
                            <li>□ Exposure/color accuracy</li>
                            <li>□ Composition/framing</li>
                            <li>□ Resolution requirements</li>
                            <li>□ Caption accuracy</li>
                        </ul>
                    </td>
                    <td>Photo Editor → Team Review</td>
                </tr>
                <tr>
                    <td>Video</td>
                    <td>
                        <ul>
                            <li>□ Visual quality</li>
                            <li>□ Audio synchronization</li>
                            <li>□ Color grading consistency</li>
                            <li>□ Caption/subtitle accuracy</li>
                            <li>□ Playback testing</li>
                        </ul>
                    </td>
                    <td>Video Editor → Writer → Strategist</td>
                </tr>
                <tr>
                    <td>Graphics</td>
                    <td>
                        <ul>
                            <li>□ Data accuracy</li>
                            <li>□ Visual clarity</li>
                            <li>□ Accessibility features</li>
                            <li>□ Responsiveness testing</li>
                            <li>□ Source attribution</li>
                        </ul>
                    </td>
                    <td>Designer → Researcher → Team</td>
                </tr>
            </tbody>
        </table>
    `;
    break;

// Production Timeline
case 'production-timeline':
    modalBody.innerHTML = `
        <p>The Production Timeline outlines all phases of multimedia creation from planning through delivery, ensuring organized workflow and on-time completion.</p>
        <h4>Pre-Production Phase:</h4>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Task</th>
                    <th>Responsible</th>
                    <th>Deliverable</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>10/02/2025</td>
                    <td>Initial content planning</td>
                    <td>Full team</td>
                    <td>Content brief</td>
                    <td>Complete</td>
                </tr>
                <tr>
                    <td>11/02/2025</td>
                    <td>Equipment inventory</td>
                    <td>Multimedia Editor</td>
                    <td>Equipment list</td>
                    <td>Complete</td>
                </tr>
                <tr>
                    <td>12/02/2025</td>
                    <td>Location scouting</td>
                    <td>Multimedia Editor</td>
                    <td>Location report</td>
                    <td>Complete</td>
                </tr>
                <tr>
                    <td>13/02/2025</td>
                    <td>Shot list/storyboarding</td>
                    <td>Multimedia Editor</td>
                    <td>Production plans</td>
                    <td>In Progress</td>
                </tr>
                <tr>
                    <td>14/02/2025</td>
                    <td>Technical preparation</td>
                    <td>Multimedia Editor</td>
                    <td>Equipment checkout</td>
                    <td>Scheduled</td>
                </tr>
            </tbody>
        </table>
        
        <h4>Production Phase:</h4>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Activity</th>
                    <th>Location</th>
                    <th>Team Members</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>15/02/2025</td>
                    <td>Photography day 1</td>
                    <td>Impact Hub</td>
                    <td>Photographer, Assistant</td>
                    <td>Morning light optimal</td>
                </tr>
                <tr>
                    <td>16/02/2025</td>
                    <td>Photography day 2</td>
                    <td>Home office</td>
                    <td>Photographer, Researcher</td>
                    <td>Subject interview same day</td>
                </tr>
                <tr>
                    <td>18/02/2025</td>
                    <td>Video production day 1</td>
                    <td>City center, home office</td>
                    <td>Videographer, Sound, Assistant</td>
                    <td>7:00 AM call time</td>
                </tr>
                <tr>
                    <td>19/02/2025</td>
                    <td>Video production day 2</td>
                    <td>Corporate office</td>
                    <td>Videographer, Sound</td>
                    <td>Expert interviews</td>
                </tr>
                <tr>
                    <td>20/02/2025</td>
                    <td>Audio recording</td>
                    <td>Co-working space, cafe</td>
                    <td>Sound engineer</td>
                    <td>Ambient sound collection</td>
                </tr>
            </tbody>
        </table>
        
        <h4>Post-Production Phase:</h4>
        <table>
            <thead>
                <tr>
                    <th>Date Range</th>
                    <th>Task</th>
                    <th>Responsible</th>
                    <th>Review Date</th>
                    <th>Deadline</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>21-22/02/2025</td>
                    <td>Photo selection & editing</td>
                    <td>Photographer</td>
                    <td>22/02/2025</td>
                    <td>23/02/2025</td>
                </tr>
                <tr>
                    <td>21-23/02/2025</td>
                    <td>Video editing & assembly</td>
                    <td>Video Editor</td>
                    <td>23/02/2025</td>
                    <td>24/02/2025</td>
                </tr>
                <tr>
                    <td>21-22/02/2025</td>
                    <td>Audio editing & mixing</td>
                    <td>Sound Engineer</td>
                    <td>22/02/2025</td>
                    <td>23/02/2025</td>
                </tr>
                <tr>
                    <td>21-24/02/2025</td>
                    <td>Data visualization creation</td>
                    <td>Graphic Designer</td>
                    <td>24/02/2025</td>
                    <td>25/02/2025</td>
                </tr>
                <tr>
                    <td>25/02/2025</td>
                    <td>Full media package integration</td>
                    <td>Multimedia Editor</td>
                    <td>25/02/2025</td>
                    <td>26/02/2025</td>
                </tr>
            </tbody>
        </table>
    `;
    break;
        
                default:
                    modalBody.innerHTML = '<p>Example content not found.</p>';
            } // Closing brace for the switch statement
        } // Closing brace for the loadExampleContent function