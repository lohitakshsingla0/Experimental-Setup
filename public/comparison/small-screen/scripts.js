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
  fetch('/process-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: message })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Response from server:', data.response);
      appendHTMLMessage('bot', data.response); // Assuming you have an appendHTMLMessage function
    })
    .catch(error => {
      console.error('Error processing message:', error);
    });
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

  // Send logs to server to save as JSON file
  fetch('/save-user-log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filename: `smallScreen_${uuid}.json`,
      data: interactionLogs
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to save user feedback');
      }
      console.log('User feedback saved successfully');
      // Redirect to feedback form
      window.location.href = 'http://localhost:3000/user-feedback?title=Comparison%20of%20Chatbot%20Interfaces&chatbotName=Small-Screen%20Chatbot';
    })
    .catch(error => {
      console.error('Error:', error);
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

