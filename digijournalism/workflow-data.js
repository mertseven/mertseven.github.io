// Workflow steps data with precise coordinates
const steps = [
    {
        id: 1,
        name: "Research",
        x: 50,
        y: 15,
        color: "#ff0066",
        textColor: "white",
        examples: [
            {
                title: "ProPublica's Dollars for Docs",
                description: "Used extensive data mining to reveal financial relationships between doctors and pharmaceutical companies, demonstrating how thorough research can expose hidden patterns.",
                source: "ProPublica"
            },
            {
                title: "The Panama Papers",
                description: "ICIJ's collaborative investigation used document analysis and data journalism to expose offshore financial holdings, showcasing the power of systematic research methods.",
                source: "International Consortium of Investigative Journalists"
            }
        ],
        tools: [
            {
                name: "Feedly",
                description: "RSS feed aggregator to track news sources and set alerts for specific topics."
            },
            {
                name: "Google Dataset Search",
                description: "Find public datasets for data journalism and in-depth research projects."
            },
            {
                name: "Nexis Uni",
                description: "Academic database for news archives and comprehensive research materials."
            },
            {
                name: "OSINT Framework",
                description: "Collection of open-source intelligence tools for digital investigation."
            },
            {
                name: "Statista",
                description: "Statistics and data visualization platform with ready-to-use charts."
            },
            {
                name: "Datawrapper",
                description: "Interactive data visualization tool that turns data into engaging charts."
            }
        ]
    },
    {
        id: 2,
        name: "Report",
        x: 20,
        y: 40,
        color: "white",
        textColor: "black",
        examples: [
            {
                title: "The New York Times' COVID-19 Tracking",
                description: "Comprehensive reporting that combined data visualization with human stories to contextualize statistics, showing how to balance data and narrative.",
                source: "The New York Times"
            },
            {
                title: "NPR's Audio Reporting on Community Issues",
                description: "Intimate audio stories that capture community voices directly, demonstrating effective interview techniques and compelling narrative structure.",
                source: "National Public Radio"
            }
        ],
        tools: [
            {
                name: "Otter.ai",
                description: "Automatic transcription for interviews with real-time note-taking capabilities."
            },
            {
                name: "Rev",
                description: "Professional transcription and caption services for audio and video files."
            },
            {
                name: "Trint",
                description: "AI-powered transcription with editing capabilities and collaboration features."
            },
            {
                name: "Evernote",
                description: "Note-taking and organization tool for collecting research and organizing sources."
            },
            {
                name: "Google Forms",
                description: "Create surveys for community input and data collection."
            },
            {
                name: "Slack",
                description: "Team communication and organization tool for collaborative reporting."
            }
        ]
    },
    {
        id: 3,
        name: "Organize",
        x: 70,
        y: 40,
        color: "#ff0066",
        textColor: "white",
        examples: [
            {
                title: "Bellingcat's Open Source Investigations",
                description: "Pioneering methodology for organizing digital evidence from social media and satellite imagery, demonstrating systematic approaches to information management.",
                source: "Bellingcat"
            },
            {
                title: "The Guardian's Structured Journalism Projects",
                description: "Database-driven reporting that organizes information into searchable, interactive formats, showing how structured data can enhance storytelling.",
                source: "The Guardian"
            }
        ],
        tools: [
            {
                name: "Airtable",
                description: "Flexible database to organize sources, contacts, and story elements."
            },
            {
                name: "Milanote",
                description: "Visual board for organizing research, interviews, and media assets."
            },
            {
                name: "FigJam",
                description: "Collaborative whiteboard for story planning and visual organization."
            },
            {
                name: "Notion",
                description: "All-in-one workspace for notes, tasks, and content planning with templates."
            },
            {
                name: "Miro",
                description: "Visual collaboration tool for story mapping and content planning."
            },
            {
                name: "Padlet",
                description: "Virtual bulletin board for organizing multimedia content and research."
            }
        ]
    },
    {
        id: 4,
        name: "Make",
        x: 45,
        y: 50,
        color: "white",
        textColor: "black",
        examples: [
            {
                title: "Reuters Graphics' Data Visualizations",
                description: "Interactive data stories that combine visual design with journalistic narrative, showing how to transform complex information into accessible formats.",
                source: "Reuters Graphics"
            },
            {
                title: "AJ+ Short Form Video Journalism",
                description: "Concise, visually striking digital videos optimized for social media consumption, demonstrating effective techniques for platform-specific content creation.",
                source: "AJ+"
            }
        ],
        tools: [
            {
                name: "Adobe Creative Cloud",
                description: "Suite including Premiere Pro, Photoshop, and Audition for multimedia content creation."
            },
            {
                name: "Canva",
                description: "Graphic design platform for creating infographics and social media visuals."
            },
            {
                name: "Audacity",
                description: "Free audio editing software for podcast production and audio stories."
            },
            {
                name: "DaVinci Resolve",
                description: "Professional video editing software with a comprehensive free version."
            },
            {
                name: "Flourish",
                description: "Data visualization and interactive storytelling tool for engaging presentations."
            },
            {
                name: "WordPress",
                description: "Content management system for publishing and organizing digital content."
            }
        ]
    },
    {
        id: 5,
        name: "Feedback",
        x: 20,
        y: 70,
        color: "#ff0066",
        textColor: "white",
        examples: [
            {
                title: "The Coral Project's Community Engagement",
                description: "Tools and strategies for meaningful audience interaction, demonstrating how to build two-way communication with readers.",
                source: "The Coral Project (Vox Media)"
            },
            {
                title: "De Correspondent's Member-Driven Journalism",
                description: "Collaborative approach that incorporates reader expertise throughout the reporting process, showing how audience participation can enhance journalistic quality.",
                source: "De Correspondent"
            }
        ],
        tools: [
            {
                name: "Google Docs",
                description: "Collaborative editing with comments and suggestions for team feedback."
            },
            {
                name: "Loom",
                description: "Video feedback tool for detailed visual explanations and critiques."
            },
            {
                name: "SurveyMonkey",
                description: "Create audience feedback surveys to gather reader responses."
            },
            {
                name: "Typeform",
                description: "Interactive surveys and forms with engaging user experience."
            },
            {
                name: "Hypothes.is",
                description: "Web annotation tool for collaborative feedback on published content."
            },
            {
                name: "Flipgrid",
                description: "Video discussion platform for peer review and editorial feedback."
            }
        ]
    },
    {
        id: 6,
        name: "Refine",
        x: 70,
        y: 70,
        color: "#ff0066",
        textColor: "white",
        examples: [
            {
                title: "The Washington Post's Story Testing",
                description: "Rigorous fact-checking and editorial processes that ensure accuracy and clarity, demonstrating professional standards for content verification.",
                source: "The Washington Post"
            },
            {
                title: "Buzzfeed News' Evolution of Stories",
                description: "Stories that develop over time with ongoing updates and improvements, showing how digital journalism can be iterative and responsive.",
                source: "Buzzfeed News"
            }
        ],
        tools: [
            {
                name: "Grammarly",
                description: "Grammar and style checking tool for polishing written content."
            },
            {
                name: "Hemingway Editor",
                description: "Readability improvement tool that highlights complex sentences and common errors."
            },
            {
                name: "Headline Analyzer",
                description: "Tool for testing headline effectiveness and emotional impact."
            },
            {
                name: "ProWritingAid",
                description: "Advanced editing and style suggestions for improving content quality."
            },
            {
                name: "Readable",
                description: "Analyze content readability and SEO potential for digital optimization."
            },
            {
                name: "Descript",
                description: "Audio/video editing with text-based editing for precise refinement."
            }
        ]
    },
    {
        id: 7,
        name: "Reflect",
        x: 45,
        y: 85,
        color: "#ff0066",
        textColor: "white",
        examples: [
            {
                title: "Nieman Lab's Journalism Analysis",
                description: "Critical examination of industry practices and innovations, demonstrating the importance of self-assessment in journalism.",
                source: "Nieman Lab (Harvard)"
            },
            {
                title: "NYT's The Daily Podcast Post-Mortems",
                description: "Behind-the-scenes discussions about reporting processes and editorial decisions, showing the value of transparency and learning from experience.",
                source: "The New York Times"
            }
        ],
        tools: [
            {
                name: "Jamboard",
                description: "Digital whiteboard for team reflection and post-project analysis."
            },
            {
                name: "Mentimeter",
                description: "Interactive presentation software with polls for team discussions."
            },
            {
                name: "Wakelet",
                description: "Content curation platform for creating project portfolios and archives."
            },
            {
                name: "Google Analytics",
                description: "Track audience engagement and content performance metrics."
            },
            {
                name: "Hootsuite Analytics",
                description: "Social media performance metrics for tracking content distribution."
            },
            {
                name: "Medium",
                description: "Publishing platform with engagement metrics for reflection on reader interaction."
            }
        ]
    },
    {
        id: 8,
        name: "Cross-platform",
        x: 85,
        y: 15,
        color: "#00c3ff",
        textColor: "black",
        examples: [
            {
                title: "Minecraft Uncensored Library",
                description: "A virtual library built in Minecraft containing banned journalism and censored articles from around the world, making them accessible in countries where press freedom is restricted.",
                source: "Reporters Without Borders"
            },
            {
                title: "Following the Trail of Trash",
                description: "GPS trackers embedded in plastic waste to reveal where 'recycled' materials actually end up, exposing global waste management issues through real-time tracking.",
                source: "MIT Senseable City Lab"
            },
            {
                title: "Beirut After the Blast",
                description: "3D visualization of the Beirut port explosion using architectural software to create an immersive recreation of the event's impact on the city.",
                source: "Forensic Architecture"
            },
            {
                title: "Snow Fall: The Avalanche at Tunnel Creek",
                description: "Pioneering multimedia longform that seamlessly integrated text, video, animation and interactive elements to create an immersive narrative experience.",
                source: "The New York Times"
            },
            {
                title: "Syria's Disappeared",
                description: "AR experience that transformed physical spaces into virtual memorials for those who disappeared during Syria's civil war, bringing unseen stories into public spaces.",
                source: "The Guardian"
            }
        ],
        tools: [
            {
                name: "Unity",
                description: "Game engine used for creating interactive 3D environments and immersive journalism experiences."
            },
            {
                name: "MapBox",
                description: "Customizable mapping platform for location-based storytelling and data visualization."
            },
            {
                name: "A-Frame",
                description: "Web framework for building virtual reality experiences accessible through browsers."
            },
            {
                name: "Blender",
                description: "Open-source 3D creation software for modeling environments and creating animations."
            },
            {
                name: "ThingLink",
                description: "Tool for creating interactive images, videos, and 360° media with embedded information."
            },
            {
                name: "Twine",
                description: "Open-source tool for creating non-linear, interactive storytelling experiences."
            }
        ]
    }
];