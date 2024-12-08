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


function fetchOrdersAndRender() {
  fetch('/orders')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      renderOrders(data.orders);
    })
    .catch(error => {
      console.error('Error fetching orders:', error);
    });
}

function renderOrders(orders) {
  // Example rendering function, replace with your actual rendering logic
  const ordersList = document.getElementById('orders-list');
  if (!ordersList) return;
  ordersList.innerHTML = '';
  orders.forEach(order => {
    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';
    orderItem.innerHTML = `
      <h5>Order ID: ${order.id}</h5>
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Estimated Delivery:</strong> ${order.delivery}</p>
      <ul>
        ${order.items.map(item => `
          <li>
            <img src="${item.image}" alt="${item.name}" style="width:50px;height:50px;"/>
            <strong>Product Name:</strong> ${item.name} - <strong>Quantity:</strong> ${item.quantity}
          </li>
        `).join('')}
      </ul>
    `;
    ordersList.appendChild(orderItem);
  });
}

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

  // Unsubscribe
  if (userMessage.includes("unsubscribe")) {
    appendHTMLMessage(
      "bot",
      `Are you sure you want to unsubscribe? You'll lose access to exclusive deals and updates!<br>
      <a href='#' class='unsubscribe-option' data-action='stay'>Click here to stay subscribed</a><br>
      <a href='#' class='unsubscribe-option' data-action='proceed'>Click here to proceed with unsubscribe</a>`
    );

    document.body.addEventListener("click", handleUnsubscribeOptions, {
      once: true,
    });
    return;
  }

  // Refund
  if (userMessage.includes("refund")) {
    appendHTMLMessage(
      "bot",
      `Requesting a refund can take up to 30 minutes of your time. Are you sure? <a href='#yes'>Yes</a> | <a href='#no'>No</a>`
    );

    document.body.addEventListener("click", handleRefundProcess, {
      once: true,
    });
    return;
  }

  // Default fallback response
  appendHTMLMessage(
    "bot",
    "I'm here to assist you! Can you provide more details about what you're looking for?"
  );
}

// Handle Refund Process
let refundStep = 0; // Track refund steps globally

function processMessage(message) {
  const userMessage = message.trim().toLowerCase();

  // Refund case
  if (userMessage.includes("refund")) {
    appendHTMLMessage(
      "bot",
      `Requesting a refund can take up to 30 minutes of your time. Are you sure? 
      <a href='#' id='refund-yes'>Yes</a> | <a href='#' id='refund-no'>No</a>`
    );

    // Add a single event listener for Yes/No
    document.body.addEventListener("click", handleRefundDecision);
    return;
  }

  // Default fallback response
  appendHTMLMessage(
    "bot",
    "I'm here to assist you! Can you provide more details about what you're looking for?"
  );
}

// Handle Refund Decision
function handleRefundDecision(event) {
  if (event.target && event.target.id === "refund-yes") {
    event.preventDefault();

    refundStep = 1; // Start refund process at step 1
    document.body.removeEventListener("click", handleRefundDecision); // Remove Yes/No listener
    showRefundStep(refundStep); // Show first step
  } else if (event.target && event.target.id === "refund-no") {
    event.preventDefault();

    appendHTMLMessage("bot", "Great! Keep enjoying your product.");
    document.body.removeEventListener("click", handleRefundDecision); // Remove Yes/No listener
  }
}

// Show Refund Step
function showRefundStep(step) {
  const stepsContent = [
    `Step 1/5: Please confirm your order details:<br>
    <ul>
      <li>Order ID: 12345</li>
      <li>Item: Laptop</li>
      <li>Quantity: 1</li>
      <li>Price: $999</li>
      <li>Status: Delivered</li>
    </ul>
    <a href='#' id='refund-next'>Confirm</a>`,

    "Step 2/5: Please upload a photo of the product to verify its condition. <input type='file' /><br><a href='#' id='refund-next'>Next</a>",

    "Step 3/5: Provide a detailed explanation of why you're requesting a refund.<br><textarea placeholder='Explain here...' rows='3'></textarea><br><a href='#' id='refund-next'>Next</a>",

    "Step 4/5: Provide proof of payment and delivery.<br><input type='file' /><br><a href='#' id='refund-next'>Next</a>",

    "Step 5/5: Submit your bank details for the refund transfer.<br><input type='text' placeholder='Bank Name'><br><input type='text' placeholder='Account Number'><br><a href='#' id='refund-submit'>Submit</a>",
  ];

  if (step <= stepsContent.length) {
    appendHTMLMessage("bot", stepsContent[step - 1]);

    // Add event listener for next steps
    document.body.addEventListener("click", handleRefundNextStep);
  } else {
    // Complete the refund process
    appendHTMLMessage(
      "bot",
      "Your refund is now under review. This may take 7-14 business days."
    );

    // Reset and remove listeners
    refundStep = 0;
    document.body.removeEventListener("click", handleRefundNextStep);
  }
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
