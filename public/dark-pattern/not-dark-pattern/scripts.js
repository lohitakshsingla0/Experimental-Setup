// scripts.js

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded and parsed");

  // Fetch orders from server and then render them
  fetchOrdersAndRender();

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
      `I understand you want to cancel your subscription. May I know the reason? Is it due to content, time, or price? Your feedback helps us improve!`
    );
    return;
  }

  // Case 3: User provides a reason for canceling
  if (
    userMessage.includes("content") ||
    userMessage.includes("price") ||
    userMessage.includes("not needed") ||
    userMessage.includes("other") ||
    userMessage.includes("time")
  ) {
    appendHTMLMessage(
      "bot",
      `Thank you for sharing your feedback! Did you know we can offer you exclusive benefits such as $1/month for the next 52 weeks or free access to premium features for 3 months? Would you like to reconsider?`
    );
    return;
  }

  // Case 4: User insists on canceling
  if (
    userMessage.includes("no") ||
    userMessage.includes("cancel") &&
    userMessage.includes("subscription")
  ) {
    appendHTMLMessage(
      "bot",
      `I’m really sorry to see you go! Just to remind you, canceling will remove access to features like Unlimited Articles, Times Machine Archives, and Premium Newsletters. Are you absolutely sure?`
    );
    return;
  }

  // Case 5: User explicitly states "I just want to cancel" or uses the "IJWTC" acronym
  if (
    userMessage.includes("ijwtc") ||
    userMessage.includes("just") ||
    userMessage.includes("just cancel") ||
    userMessage.includes("i just want to cancel")
  ) {
    appendHTMLMessage(
      "bot",
      `We completely understand. However, as a final offer, how about 6 months of premium access completely free? Would that work for you?`
    );
    return;
  }

  // Case 6: User confirms cancellation for the final time
  if (userMessage.includes("please") || userMessage.includes("mad")|| userMessage.includes("don't")|| userMessage.includes("dont")|| userMessage.includes("need")) {
    appendHTMLMessage(
      "bot",
      `We can make offer to make it free for 1 month😊`
    );
    return;
  }

  if (userMessage.includes("final") || userMessage.includes("last")) {
    appendHTMLMessage(
      "bot",
      `Your subscription has been marked for cancellation. You will receive a confirmation email shortly. If you change your mind within the next 7 days, we’ll be happy to reactivate your account! 😊`
    );
    return;
  }
  // Case 7: User asks about features or benefits
  if (userMessage.includes("features") || userMessage.includes("benefits")) {
    appendHTMLMessage(
      "bot",
      `With your subscription, you get Unlimited Article Access, access to the Times Machine Archives, Premium Newsletters, and much more. Are you sure you want to lose these amazing benefits?`
    );
    return;
  }

  // Case 8: User asks about pricing or deals
  if (userMessage.includes("pricing") || userMessage.includes("deals")) {
    appendHTMLMessage(
      "bot",
      `We currently have amazing offers! For example, $1/month for the next 52 weeks or a 50% discount on your current plan. Would you like to explore these options?`
    );
    return;
  }

  // Case 9: Default fallback response
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