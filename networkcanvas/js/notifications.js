// js/notifications.js

const notificationContainer = document.getElementById("notification-container");

/**
 * Displays a notification message on the screen.
 * @param {string} message The message to display.
 * @param {string} type The type of notification ('info', 'success', 'error'). Defaults to 'info'.
 * @param {number} duration The duration in milliseconds to show the notification. Defaults to 3000.
 */
export function showNotification(
  message,
  type = "info",
  duration = 3000,
  actionButton = null,
) {
  if (!notificationContainer) return;

  // Create the notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  const p = document.createElement("p");
  p.textContent = message;
  notification.appendChild(p);

  if (actionButton) {
    const button = document.createElement("button");
    button.textContent = actionButton.text;
    button.classList.add("notification-button"); // Add a class for styling
    button.addEventListener("click", () => {
      actionButton.onClick();
      notification.remove(); // Remove notification when button is clicked
    });
    notification.appendChild(button);
  }

  // Add to the container
  notificationContainer.appendChild(notification);

  // Trigger the transition
  setTimeout(() => {
    notification.classList.add("visible");
  }, 10); // A small delay to allow the element to be added to the DOM first

  // Set a timeout to remove the notification
  setTimeout(() => {
    notification.classList.remove("visible");
    // Remove the element from the DOM after the transition ends
    notification.addEventListener("transitionend", () => {
      notification.remove();
    });
  }, duration);
}
