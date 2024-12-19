// scripts.js

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded and parsed");

  // Fetch orders from server and then render them
  //fetchOrdersAndRender();

  // Event listener for Enter key in chat input
  const userInput = document.getElementById('user-input');
  userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      console.log("Enter key pressed");
      sendMessage();
      event.preventDefault();
    }
  });

  // Event listener for send button
  const sendButton = document.getElementById('send-button');
  if (sendButton) {
    sendButton.addEventListener('click', () => {
      console.log("Send button clicked");
      sendMessage();
    });
  } else {
    console.log("Send button not found");
  }
});

// function activateSection(sectionId) {
//   // Deactivate all sections
//   document.querySelectorAll('.page').forEach(section => {
//       section.classList.remove('active');
//   });

//   // Activate the selected section
//   document.getElementById(sectionId).classList.add('active');
// }

// Helper function to append HTML message to chat box
function appendHTMLMessage(sender, htmlMessage) {
  const messageElement = document.createElement('div');
  messageElement.className = sender;
  messageElement.innerHTML = htmlMessage;
  const chatBox = document.getElementById('chat-box'); // Adjust according to your HTML structure
  if (chatBox) {
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    console.log("Appended HTML message:", htmlMessage);
  } else {
    console.error("Chat box element not found.");
  }
}

function sendMessage() {
  const userInput = document.getElementById('user-input');
  const userMessage = userInput.value.trim();
  console.log("User message:", userMessage);
  if (userMessage) {
    appendMessage('user', userMessage);
    processMessage(userMessage); // Send message to server
    userInput.value = '';
  }
}

function appendMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.className = sender;
  messageElement.innerText = message;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
  console.log("Appended message:", message);
}

const chatBox = document.getElementById('chat-box');

function processMessage(message) {
  const userMessage = message.trim().toLowerCase();

  // Case 1: Greeting
  if (userMessage.includes("Hi") || userMessage.includes("hello")|| userMessage.includes("Hey")|| userMessage.includes("hey")) {
    appendHTMLMessage(
      "bot",
      `Hello! Welcome to our support chat. How can I assist you today? 😊`
    );
    return;
  }

  // Case 2: Cancel subscription - Initial request
  if (userMessage.includes("cancel") || userMessage.includes("unsubscribe")) {
    appendHTMLMessage(
      "bot",
      `I understand you want to cancel your subscription. May I know the reason for cancellation?`
    );
    return;
  }

  // Case 3: User provides a reason for canceling
  if (
    userMessage.includes("content") ||
    userMessage.includes("price") ||
    userMessage.includes("time") ||
    userMessage.includes("personal") ||
    userMessage.includes("not useful")
  ) {
    appendHTMLMessage(
      "bot",
      `Thank you for letting us know. Your feedback helps us improve! I’ll proceed with canceling your subscription.`
    );
    return;
  }

  // Case 4: Confirm unsubscription
  if (
    userMessage.includes("ok") ||
    userMessage.includes("yes") ||
    userMessage.includes("proceed")
  ) {
    appendHTMLMessage(
      "bot",
      `Your subscription has been successfully canceled. We're sorry to see you go, but we hope to see you again in the future. Take care! 😊`
    );
    return;
  }

  // Default fallback response
  appendHTMLMessage(
    "bot",
    `I'm here to assist you! Can you provide more details about what you're looking for?`
  );
}


// Handle Refund Next Step
function handleRefundNextStep(event) {
  if (event.target && event.target.id === "refund-next") {
    event.preventDefault();

    refundStep++; // Increment to the next step
    document.body.removeEventListener("click", handleRefundNextStep); // Remove current listener
    showRefundStep(refundStep); // Show the next step
  } else if (event.target && event.target.id === "refund-submit") {
    event.preventDefault();

    appendHTMLMessage(
      "bot",
      "Thank you for the details. Now please call our customer care at +49-123456789 to process your refund further."
    );

    // Reset and remove listeners
    refundStep = 0;
    document.body.removeEventListener("click", handleRefundNextStep);
  }
}

function toggleChat() {
  const chatContainer = document.querySelector('.chat-container');
  const chatToggleBtn = document.querySelector('.chat-toggle-btn');
  if (chatContainer.style.display === 'none' || chatContainer.style.display === '') {
    chatContainer.style.display = 'block';
    chatToggleBtn.style.display = 'none';
  } else {
    chatContainer.style.display = 'none';
    chatToggleBtn.style.display = 'block';
  }
  console.log("Toggled chat visibility");
}


function endExperiment() {
  // Save interaction logs
  const chatBox = document.getElementById('chat-box');
  const interactionLogs = Array.from(chatBox.children).map(child => ({
    sender: child.className,
    message: child.innerText.trim()
  }));

  // Generate UUID
  const uuid = crypto.randomUUID();
  const filename = `dark_pattern1_${uuid}.json`;

  // Step 1: Save logs on the server
  fetch('/save-user-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: filename, data: interactionLogs })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to save user feedback');
      }
      return response.json();
    })
    .then(data => {
      console.log('User feedback saved successfully:', data);

      // Step 2: Send the saved user log via email
      return fetch('/send-user-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: filename })
      });
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to send user log email');
      }
      return response.json();
    })
    .then(data => {
      console.log('User log email sent successfully:', data);

      // Step 3: Redirect to feedback form
      window.location.href = 'https://experimental-setup.onrender.com/user-feedback?title=Dark%20Patterns%20in%20Chatbots&chatbotName=dark-pattern-one';
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred. Please try again. ' + error);
    });
}


document.addEventListener('DOMContentLoaded', () => {
  // Show the consent modal on page load
  $('#consentModal').modal({ backdrop: 'static', keyboard: false });

  // Handle the Decline button
  document.getElementById('declineConsent').addEventListener('click', () => {
      alert('You must consent to proceed.');
      window.location.href = 'https://example.com'; // Redirect if consent is declined
  });

  // Handle the Accept button
  document.getElementById('acceptConsent').addEventListener('click', () => {
      $('#consentModal').modal('hide'); // Hide the modal if consent is given
  });
});