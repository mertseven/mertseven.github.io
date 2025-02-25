document.addEventListener('DOMContentLoaded', () => {
    const students = [
        { name: "Alice Smith", project: "Digital Democracy"},
        { name: "Bob Johnson", project: "Environmental Reporting" },
        { name: "Carol Williams", project: "Social Media Impact" },
        { name: "David Brown", project: "Local News Revival" },
        { name: "Emma Davis", project: "Tech Ethics" },
        { name: "Frank Miller", project: "Sports Analytics" },
        { name: "Grace Wilson", project: "Cultural Heritage" },
        { name: "Henry Garcia", project: "Education Reform" },
        { name: "Isabel Lee", project: "Healthcare Access" },
        { name: "Jack Thompson", project: "Urban Development" },
        { name: "Kelly Martinez", project: "Food Security" },
        { name: "Liam Anderson", project: "Climate Change" },
        { name: "Maria Rodriguez", project: "Immigration Stories" },
        { name: "Noah Taylor", project: "Youth Movement" },
        { name: "Olivia White", project: "Arts & Culture" },
        { name: "Peter Chang", project: "Economic Inequality" },
        { name: "Quinn Foster", project: "Transportation" },
        { name: "Rachel Kim", project: "Mental Health" },
        { name: "Samuel Patel", project: "Technology Impact" },
        { name: "Tara Johnson", project: "Community Voices" },
        { name: "Uma Sharma", project: "Digital Privacy" }
    ];

    const studentsGrid = document.getElementById('studentsGrid');

    students.forEach(student => {
        const studentCard = document.createElement('article');
        studentCard.className = 'student-card';
        
        studentCard.innerHTML = `
            <div class="profile-image">
                <img src="/api/placeholder/300/300" alt="${student.name}">
            </div>
            <div class="profile-content">
                <h3>${student.name}</h3>
                <p class="project-title">Project: ${student.project}</p>
                <div class="contact-links">
                    <a href="mailto:${student.name.toLowerCase().replace(' ', '.')}@std.yasar.edu.tr">Contact</a>
                </div>
            </div>
        `;

        studentsGrid.appendChild(studentCard);
    });
});