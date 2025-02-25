document.addEventListener('DOMContentLoaded', () => {
  initializeVideoPlayer();
  initializeShareButtons();
  populateRelatedArticles();
});

function initializeVideoPlayer() {
  const video = document.getElementById('featured-video');
  const playButton = document.querySelector('.video-control');
  
  if (video && playButton) {
      playButton.addEventListener('click', () => {
          if (video.paused) {
              video.play();
              playButton.innerHTML = '❚❚';
          } else {
              video.pause();
              playButton.innerHTML = '▶';
          }
      });

      // Pause video when out of viewport
      const observer = new IntersectionObserver(
          (entries) => {
              entries.forEach((entry) => {
                  if (!entry.isIntersecting && !video.paused) {
                      video.pause();
                      playButton.innerHTML = '▶';
                  }
              });
          },
          { threshold: 0.5 }
      );

      observer.observe(video);
  }
}

function initializeShareButtons() {
  const shareButton = document.querySelector('.share-button');
  const saveButton = document.querySelector('.save-button');

  if (shareButton) {
      shareButton.addEventListener('click', () => {
          if (navigator.share) {
              navigator.share({
                  title: document.title,
                  url: window.location.href
              }).catch(console.error);
          } else {
              // Fallback copy to clipboard
              navigator.clipboard.writeText(window.location.href)
                  .then(() => {
                      shareButton.textContent = 'Copied!';
                      setTimeout(() => {
                          shareButton.textContent = 'Share';
                      }, 2000);
                  })
                  .catch(console.error);
          }
      });
  }

  if (saveButton) {
      saveButton.addEventListener('click', () => {
          saveButton.textContent = 'Saved';
          saveButton.style.backgroundColor = 'var(--color-black)';
          saveButton.style.color = 'var(--color-white)';
          setTimeout(() => {
              saveButton.textContent = 'Save';
              saveButton.style.backgroundColor = 'var(--color-white)';
              saveButton.style.color = 'var(--color-black)';
          }, 2000);
      });
  }
}

function populateRelatedArticles() {
  const relatedGrid = document.querySelector('.related-grid');
  if (!relatedGrid) return;

  const relatedArticles = [
      {
          title: "How AI is Transforming Investigative Journalism",
          author: "Michael Chen",
          date: "2025-02-18",
          link: "investigative-ai.html"
      },
      {
          title: "The Future of News: Digital Transformation in Media",
          author: "Emma Wilson",
          date: "2025-02-17",
          link: "digital-transformation.html"
      }
  ];

  relatedArticles.forEach(article => {
      const articleElement = document.createElement('a');
      articleElement.href = article.link;
      articleElement.className = 'related-article';
      
      articleElement.innerHTML = `
          <h3>${article.title}</h3>
          <div class="article-meta">
              <span class="author">${article.author}</span>
              <span class="date">${new Date(article.date).toLocaleDateString()}</span>
          </div>
      `;

      relatedGrid.appendChild(articleElement);
  });
}