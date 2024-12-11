const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();
const pass_k = process.env.PASS_KEY;

const secretKey = process.env.SECRET_KEY;

console.log(`Your secret key is: ${secretKey}`);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/feedbackQuestion', express.static(path.join(__dirname, 'feedbackQuestion')));
app.use(express.json());
app.use(bodyParser.json());

// Store experiments in memory for simplicity (you can use a database or file for persistence)
const experimentsFilePath = path.join(__dirname, 'experiments.json');

// Ensure the experiments.json file exists
if (!fs.existsSync(experimentsFilePath)) {
    fs.writeFileSync(experimentsFilePath, JSON.stringify({ experiments: [] }, null, 2));
}

// Routes for different chat interfaces
app.get('/comparison/full-screen', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'comparison', 'full-screen', 'index.html'));
});

app.get('/comparison/small-screen', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'comparison', 'small-screen', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

app.get('/user-feedback', (req, res) => {
  console.log('Request received at /user-feedback'); // Log to verify route is hit
  const { title, chatbotName } = req.query; // Extract query parameters
  console.log(`Received parameters: title=${title}, chatbotName=${chatbotName}`);
  res.sendFile(path.join(__dirname, 'public', 'userFeedbacks', 'index.html'));
});

app.get('/user-feedback/:title/:chatbotName', (req, res) => {
  const { title, chatbotName } = req.params;

  console.log(`Received request for Title: ${title}, Chatbot Name: ${chatbotName}`);

  const experimentsFilePath = path.join(__dirname, 'experiments.json');

  if (!fs.existsSync(experimentsFilePath)) {
    console.error('Error: experiments.json file not found at', experimentsFilePath);
    return res.status(500).send('Internal Server Error: experiments.json not found');
  }

  fs.readFile(experimentsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading experiments.json:', err);
      return res.status(500).send('Internal Server Error');
    }

    try {
      const experiments = JSON.parse(data);
      const experiment = experiments.experiments.find(exp => exp.title === title);
      if (!experiment) {
        return res.status(404).send('Experiment not found');
      }

      const chatbot = experiment.chatbots.find(cb => cb.name === chatbotName);
      if (!chatbot) {
        return res.status(404).send('Chatbot not found');
      }

      if (chatbot.formName && chatbot.formName[0]) {
        const formFileName = chatbot.formName[0];
        const formPath = path.join(__dirname, 'public', 'userFeedbacks', 'feedbackQuestion', formFileName);
        console.log(`Form file located: ${formPath}`);

        if (fs.existsSync(formPath)) {
          // Return a JSON object with the relative path that the client can use to fetch the questions
          console.log('mili file')
          return res.json({ formPath: `/userFeedbacks/feedbackQuestion/${formFileName}` });
        } else {
          console.log('nahi mili')
          return res.status(404).send('Form file not found');
        }
      } else {
        return res.status(404).send('Form not available for this chatbot');
      }
    } catch (parseError) {
      console.error('Error parsing experiments.json:', parseError);
      return res.status(500).send('Internal Server Error');
    }
  });
});


app.get('/dark-pattern-one', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dark-pattern', 'dark-pattern-one', 'index.html'));
});

// Orders data
let orders = [
    {
      id: '12345',
      status: 'Shipped',
      delivery: '3-5 days',
      items: [
        { name: 'Item 1', quantity: 2, image: '/images/summerDress1.avif' }
      ]
    },
    {
      id: '67890',
      status: 'Processing',
      delivery: '5-7 days',
      items: [
        { name: 'Item 4', quantity: 3, image: '/images/summerDress2.webp' }
      ]
    },
    {
        id: '67891',
        status: 'Cancelled',
        delivery: '5-7 days',
        items: [
          { name: 'Item 4', quantity: 3, image: '/images/dress5.webp' }
        ]
    },
    {
        id: '67892',
        status: 'Returned',
        delivery: '5-7 days',
        items: [
          { name: 'Item 4', quantity: 3, image: '/images/dress4.avif' }
        ]
    },
    {
        id: '67893',
        status: 'Processing',
        delivery: '5-7 days',
        items: [
          { name: 'Item 4', quantity: 3, image: '/images/dress3.avif' }
        ]
    }
  ];

  // Example currentContext object to maintain conversation state
let currentContext = {
    action: null // Initialize action as null
};

   // Helper functions for order actions
   function trackOrder() {
    let botResponse = "You have the following orders:<br>";
    orders.filter(order => order.status === 'Processing' || order.status === 'Shipped').forEach(order => {
      botResponse += `<div><img src="${order.items[0].image}" alt="order image" style="width:100px;height:100px;"> Order ID: ${order.id} <br> Status: ${order.status}</div>`;
    });
    botResponse += "<br>Please enter the order ID to track.";
    currentContext.action = "track";
    return botResponse;
  }

  function cancelOrder() {
    let botResponse = "You have the following orders:<br>";
    orders.filter(order => order.status === 'Processing' || order.status === 'Shipped').forEach(order => {
      botResponse += `<div><img src="${order.items[0].image}" alt="order image" style="width:100px;height:100px;"> Order ID: ${order.id}  <br> Status: ${order.status}</div>`;
    });
    botResponse += "<br>Please enter the order ID to cancel.";
    currentContext.action = "cancel";
    return botResponse;
  }

  function returnOrder() {
    let botResponse = "You have the following orders:<br>";
    orders.filter(order => order.status === 'Processing' || order.status === 'Shipped').forEach(order => {
      botResponse += `<div><img src="${order.items[0].image}" alt="order image" style="width:100px;height:100px;"> Order ID: ${order.id}  <br> Status: ${order.status}</div>`;
    });
    botResponse += "<br>Please enter the order ID to return.";
    currentContext.action = "return";
    return botResponse;
  }

  function checkRefundStatus() {
    let botResponse = "You have the following orders which are cancelled or returned and available for refund status:<br>";
    orders.filter(order => order.status === 'Cancelled' || order.status === 'Returned').forEach(order => {
      botResponse += `<div><img src="${order.items[0].image}" alt="order image" style="width:100px;height:100px;"> Order ID: ${order.id}  <br> Status: ${order.status}</div>`;
    });
    botResponse += "<br>Please enter the order ID to check the refund status.";
    currentContext.action = "refund";
    return botResponse;
  }

  function handleOrderAction(order) {
    let botResponse = "";

    switch (currentContext.action) {
      case "track":
        botResponse = `Order ID: ${order.id} - Status: ${order.status} - Estimated Delivery: ${order.delivery}`;
        break;
      case "cancel":
        botResponse = `Order ID: ${order.id} has been canceled.`;
        break;
      case "return":
        botResponse = `Order ID: ${order.id} has been processed for return.`;
        break;
      case "refund":
        botResponse = `Order ID: ${order.id} - Refund status: In Progress`;
        break;
      case "exchange":
        botResponse = `Order ID: ${order.id} has been processed for exchange.`;
        break;
      default:
        botResponse = "I'm not sure how to respond to that regarding the order.";
    }
    return botResponse;
  }

  // Process message function
  function processMessage(message) {
    const lowerCaseMessage = message.toLowerCase();
    let botResponse = "I'm not sure how to respond to that. Could you please clarify your request?";

    if (lowerCaseMessage.includes("track")) {
      botResponse = trackOrder();
    } else if (lowerCaseMessage.includes("cancel")) {
      botResponse = cancelOrder();
    } else if (lowerCaseMessage.includes("return")) {
      botResponse = returnOrder();
    } else if (lowerCaseMessage.includes("refund status") || lowerCaseMessage.includes("refund")) {
      botResponse = checkRefundStatus();
    } else if (lowerCaseMessage.includes("exchange")) {
      botResponse = "For exhanging you order, you need to first cancel the current order and then order it again from the website. Thanks for your understanding.";
    } else if (lowerCaseMessage.includes("hi") || lowerCaseMessage.includes("hello")) {
      botResponse = "Hello! How can I assist you today?";
    } else if (lowerCaseMessage.includes("bye")) {
      botResponse = "Goodbye! Have a great day!";
    } else if (lowerCaseMessage.includes("thanks") || lowerCaseMessage.includes("thank you")) {
      botResponse = "You're welcome! If you need any further assistance, feel free to ask.";
    } else if (lowerCaseMessage.includes("contact customer care")) {
      botResponse = "You can contact our customer care team at support@example.com or call +123-456-7890 for further assistance.";
    } else if (lowerCaseMessage.includes("how are you")) {
      botResponse = "I'm just a bot, but I'm here to help you with your order queries!";
    } else if (lowerCaseMessage.includes("help")) {
      botResponse = "I can help you with tracking orders, checking statuses, cancellations, returns, refunds,. What do you need assistance with?";
    } else if (currentContext.action) {
      console.log("inside current Context")
      const orderId = message.match(/\b\d{5}\b/);
      console.log("orderID:" + orderId)
      if (orderId) {
        const order = orders.find(order => order.id === orderId[0]);
        if (order) {
          botResponse = handleOrderAction(order);
          currentContext.action = null;
        } else {
          botResponse = "Sorry, I couldn't find that order ID. Please try again.";
        }
      } else {
        botResponse = "Please enter a valid order ID.";
      }
    }
    return botResponse;
  }

  function convertToKebabCase(input) {
    return input
        .toLowerCase()          // Convert the entire string to lowercase
        .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric characters (excluding hyphen) with hyphen
        .replace(/(^-|-$)/g, '');     // Remove leading or trailing hyphen if any
}

// Endpoint to serve orders
app.get('/orders', (req, res) => {
    console.log(orders);
    res.json({ orders }); // Respond with JSON object containing orders array
  });

  // POST endpoint to process messages
app.post('/process-message', (req, res) => {
    const message = req.body.message; // Assuming message is sent in the request body
    const botResponse = processMessage(message);
    res.json({ response: `${botResponse}` });
  });

  app.post('/add-experiment', (req, res) => {
    const { title, chatbots } = req.body;
    let titleChatbot = convertToKebabCase(title);
    const experimentPath = path.join(__dirname, 'public', titleChatbot);
    if (!fs.existsSync(experimentPath)) {
        fs.mkdirSync(experimentPath, { recursive: true });

        chatbots.forEach((chatbot, index) => {
            const chatbotPath = path.join(experimentPath, `Chatbot${index + 1}`);
            fs.mkdirSync(chatbotPath, { recursive: true });

            // Create default HTML, CSS, and JS files
            fs.writeFileSync(path.join(chatbotPath, 'index.html'), '<!DOCTYPE html>\n<html>\n<head>\n<title>Chatbot</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n<script src="script.js"></script>\n</body>\n</html>');
            fs.writeFileSync(path.join(chatbotPath, 'style.css'), 'body { font-family: Arial, sans-serif; }');
            fs.writeFileSync(path.join(chatbotPath, 'script.js'), 'console.log("Chatbot script loaded.");');
        });

        let experiments = JSON.parse(fs.readFileSync(experimentsFilePath, 'utf8'));
        experiments.experiments.push({ title, chatbots });
        fs.writeFileSync(experimentsFilePath, JSON.stringify(experiments, null, 2));

        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Experiment already exists' });
    }
});

app.get('/experiments', (req, res) => {
  try {
    // Use process.cwd() to dynamically resolve the path

    const data = fs.readFileSync(experimentsFilePath, 'utf8');
    const experiments = JSON.parse(data);

    // Respond with the JSON data
    res.json(experiments);
  } catch (error) {
    console.error('Error reading experiments.json:', error);
    res.status(500).json({ success: false, message: 'Error reading experiments file.' });
  }
});


app.delete('/delete-experiment/:title', (req, res) => {
  const { title } = req.params;
  let experiments = JSON.parse(fs.readFileSync(experimentsFilePath, 'utf8'));

  const experimentIndex = experiments.experiments.findIndex(exp => exp.title === title);
  if (experimentIndex !== -1) {
      experiments.experiments.splice(experimentIndex, 1);
      fs.writeFileSync(experimentsFilePath, JSON.stringify(experiments, null, 2));

      // Remove the directory if it exists
      let titleChatbot = convertToKebabCase(title);
      const experimentPath = path.join(__dirname, 'public', titleChatbot)
      if (fs.existsSync(experimentPath)) {
          fs.rmdirSync(experimentPath, { recursive: true });
      }

      res.json({ success: true });
  } else {
      res.json({ success: false, message: 'Experiment not found' });
  }
});

app.post('/send-email', (req, res) => {
  const { email, link } = req.body;

  // Validate request data
  if (!email || !link) {
      return res.status(400).json({ success: false, error: 'Email and link are required.' });
  }

  // Configure email content
  const mailOptions = {
      from: 'lohitakshsingla49@gmail.com', // Sender email
      to: email,                           // Recipient email
      subject: 'Chatbot Interface Test Invitation',
      text: `Dear User,\n\nYou have been selected to test the following chatbot interface:\n\n${link}\n\nThank you for your participation!\n\nBest regards,\nThe Experiment Team`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ success: false, error: 'Failed to send email.' });
      }
      console.log('Email sent successfully:', info.response);
      res.json({ success: true, message: 'Email sent successfully.' });
  });

});

app.post('/save-feedback-form', (req, res) => {
  const { filename, data } = req.body;

  if (!filename || !data) {
      return res.status(400).json({ success: false, message: 'Invalid data' });
  }

  const feedbackDir = path.join(__dirname, 'public', 'userFeedbacks', 'feedbackQuestion');

  // Ensure the feedback directory exists
  if (!fs.existsSync(feedbackDir)) {
      fs.mkdirSync(feedbackDir);
  }

  const filePath = path.join(feedbackDir, filename);

  // Save the feedback form JSON file
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
          console.error('Error saving feedback form:', err);
          return res.status(500).json({ success: false, message: 'Failed to save feedback form' });
      }

      // Update experiments.json
      fs.readFile(experimentsFilePath, 'utf8', (readErr, jsonData) => {
          if (readErr) {
              console.error('Error reading experiments.json:', readErr);
              return res.status(500).json({ success: false, message: 'Failed to read experiments.json' });
          }

          try {
              const experiments = JSON.parse(jsonData);

              const experiment = experiments.experiments.find(
                  exp => exp.title === data.experimentTitle
              );

              if (!experiment) {
                  return res.status(404).json({ success: false, message: 'Experiment not found' });
              }

              const chatbot = experiment.chatbots.find(
                  bot => bot.name === data.chatbotName
              );

              if (!chatbot) {
                  return res.status(404).json({ success: false, message: 'Chatbot not found' });
              }

              if (!chatbot.formName) {
                  chatbot.formName = [];
              }
              chatbot.formName.push(filename);

              fs.writeFile(experimentsFilePath, JSON.stringify(experiments, null, 2), (writeErr) => {
                  if (writeErr) {
                      console.error('Error updating experiments.json:', writeErr);
                      return res.status(500).json({ success: false, message: 'Failed to update experiments.json' });
                  }

                  res.json({ success: true });
              });
          } catch (parseErr) {
              console.error('Error parsing experiments.json:', parseErr);
              res.status(500).json({ success: false, message: 'Failed to parse experiments.json' });
          }
      });
  });
});

// Endpoint to get the list of feedback forms
app.get('/get-feedback-forms', (req, res) => {
  const feedbackDir = path.join(__dirname, 'public', 'userFeedbacks', 'feedbackQuestion');
  console.log("Feedback Directory Path:", feedbackDir); // Debug

  if (!fs.existsSync(feedbackDir)) {
      console.error("Feedback directory does not exist");
      return res.json({ success: true, feedbackForms: [] });
  }

  try {
      const feedbackFiles = fs.readdirSync(feedbackDir).filter(file => file.endsWith('.json'));
      console.log("Feedback Files Found:", feedbackFiles); // Debug
      res.json({ success: true, feedbackForms: feedbackFiles.map(file => ({ filename: file })) });
  } catch (error) {
      console.error("Error reading feedback directory:", error);
      res.status(500).json({ success: false, message: 'Failed to load feedback forms' });
  }
});



// Endpoint to get a specific feedback form
app.get('/feedbackQuestion/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'public', 'userFeedbacks', 'feedbackQuestion', filename);

  console.log(`Fetching feedback form from: ${filePath}`); // Debug log

  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading feedback form:', err);
          return res.status(500).json({ success: false, message: 'Failed to read feedback form' });
      }

      res.json(JSON.parse(data));
  });
});



// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'lohitakshsingla49@gmail.com', // Replace with your Gmail address
      pass: pass_k,       // Replace with your App Password
  },
});

app.post('/send-feedback-email', (req, res) => {
  const responses = req.body;

  // Format responses into a readable string
  const responseText = responses
      .map(({ question, response }) => `- ${question}\n  Response: ${response}`)
      .join('\n\n');

  const mailOptions = {
      from: 'lohitakshsingla49@gmail.com',
      to: 'lohitakshsingla0@gmail.com',
      subject: 'User Feedback Submission',
      text: `Hello,\n\nThe user has submitted the following feedback:\n\n${responseText}\n\nThanks`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ success: false, error: 'Failed to send email.' });
      }
      console.log('Email sent successfully:', info.response);
      res.json({ success: true });
  });
});


app.post('/save-feedback', (req, res) => {
  const { filename, data } = req.body;

  if (!filename || !data) {
    return res.status(400).send('Filename and data are required');
  }

  const filePath = path.join(__dirname, 'public/userFeedbacks/feedbacks', filename);

  // Ensure the directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  // Write data to file
  fs.writeFile(filePath, JSON.stringify(data, null, 2), err => {
    if (err) {
      console.error('Error saving feedback:', err);
      return res.status(500).send('Failed to save feedback');
    }
    console.log('Feedback saved to', filePath);
    res.status(200).send('Feedback saved successfully');
  });
});

// app.post('/save-user-log', (req, res) => {
//   const { filename, data } = req.body;

//   if (!filename || !data) {
//     return res.status(400).send('Filename and data are required');
//   }

//   const filePath = path.join(__dirname, 'public/userFeedbacks/userLogs', filename);

//   // Ensure the directory exists
//   fs.mkdirSync(path.dirname(filePath), { recursive: true });

//   // Write data to file
//   fs.writeFile(filePath, JSON.stringify(data, null, 2), err => {
//     if (err) {
//       console.error('Error saving feedback:', err);
//       return res.status(500).send('Failed to save feedback');
//     }
//     console.log('Feedback saved to', filePath);
//     res.status(200).send('Feedback saved successfully');
//   });
// });

app.post('/save-user-log', (req, res) => {
  const { filename, data } = req.body;

  if (!filename || !data) {
    return res.status(400).json({ success: false, error: 'Filename and data are required' });
  }

  const filePath = path.join(__dirname, 'public/userFeedbacks/userLogs', filename);

  // Ensure the directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  // Write data to file
  fs.writeFile(filePath, JSON.stringify(data, null, 2), err => {
    if (err) {
      console.error('Error saving feedback:', err);
      return res.status(500).json({ success: false, error: 'Failed to save feedback' });
    }
    console.log('Feedback saved to', filePath);
    // Return JSON instead of text
    return res.status(200).json({ success: true, message: 'Feedback saved successfully' });
  });
});

//Send User Logs
app.post('/send-user-log', (req, res) => {
  const { filename } = req.body;
  const filePath = path.join(__dirname, 'public/userFeedbacks/userLogs', filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
          console.error('File not found:', filePath);
          return res.status(404).json({ success: false, error: 'File not found' });
      }

      fs.readFile(filePath, 'utf8', (readErr, fileContent) => {
          if (readErr) {
              console.error('Error reading file:', readErr);
              return res.status(500).json({ success: false, error: 'Failed to read file' });
          }

          const mailOptions = {
              from: 'lohitakshsingla49@gmail.com',
              to: 'lohitakshsingla0@gmail.com',
              subject: 'User Log Submission',
              text: 'Please find the attached user log file.',
              attachments: [
                  { filename: filename, content: fileContent }
              ]
          };

          transporter.sendMail(mailOptions, (emailErr, info) => {
              if (emailErr) {
                  console.error('Error sending email:', emailErr);
                  return res.status(500).json({ success: false, error: 'Failed to send email.' });
              }

              console.log('Email sent successfully:', info.response);
              // Returns JSON already
              return res.json({ success: true, message: 'User log email sent successfully' });
          });
      });
  });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
