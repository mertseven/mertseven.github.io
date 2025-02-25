document.addEventListener('DOMContentLoaded', () => {
  initializeVideoFrames();
});

function initializeVideoFrames() {
  // Initialize all frame videos
  document.querySelectorAll('.frame').forEach(frame => {
      const video = frame.querySelector('video');
      if (!video) return;

      // Handle hover states
      frame.addEventListener('mouseenter', () => {
          video.play().catch(err => console.warn("Video autoplay failed:", err));
      });

      frame.addEventListener('mouseleave', () => {
          video.pause();
          video.currentTime = 0;
      });

      // Add loading state
      video.addEventListener("loadstart", () => {
          frame.classList.add("loading");
      });

      video.addEventListener("canplay", () => {
          frame.classList.remove("loading");
      });
  });
}