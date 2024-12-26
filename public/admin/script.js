function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    selectedSection.classList.add('active');

    // Initialize the View Feedback section if it's being shown
    if (sectionId === 'viewFeedback') {
        console.log(".............................................")
        initializeViewFeedback();
    }
}

// Add this function to generate a UUID
function generateUUID() {
    // Generates a random UUID (Version 4)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Show the homepage by default
document.addEventListener('DOMContentLoaded', () => {
    showSection('homepage');
    fetchExperiments();
    populateTableFromJSON();
    initializeFeedbackForm();
});

function fetchExperiments() {
    fetch('/experiments')
        .then(response => response.json())
        .then(data => {
            const experimentTopic = document.getElementById('experimentTopic');
            const deleteExperimentTopic = document.getElementById('deleteExperimentTopic');
            experimentTopic.innerHTML = '';
            deleteExperimentTopic.innerHTML = '';
            data.experiments.forEach(experiment => {
                const option = document.createElement('option');
                option.value = experiment.title;
                option.textContent = experiment.title;
                experimentTopic.appendChild(option);

                const deleteOption = document.createElement('option');
                deleteOption.value = experiment.title;
                deleteOption.textContent = experiment.title;
                deleteExperimentTopic.appendChild(deleteOption);
            });

            // Trigger change event to populate chatbots
            experimentTopic.dispatchEvent(new Event('change'));
        });
}

// Populate the chatbot list based on the selected experiment topic
document.getElementById('experimentTopic').addEventListener('change', function() {
    const experimentTitle = this.value;
    fetch('/experiments')
        .then(response => response.json())
        .then(data => {
            const experiment = data.experiments.find(exp => exp.title === experimentTitle);
            const chatbotList = document.getElementById('chatbotList');
            chatbotList.innerHTML = '';

            experiment.chatbots.forEach(chatbot => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = chatbot.name;
                li.dataset.link = chatbot.link; // Store the link in a data attribute
                chatbotList.appendChild(li);
            });
        });
});

document.getElementById('uploadFile').addEventListener('change', function() {
    const fileInput = this;
    const file = fileInput.files[0];

    if (!file) {
        alert("Please upload an Excel file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonSheet = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const emailColumnIndex = jsonSheet[0].indexOf('email');
        if (emailColumnIndex === -1) {
            alert("Email column not found in the Excel file.");
            return;
        }

        const emails = jsonSheet.slice(1).map(row => row[emailColumnIndex]).filter(email => email);
        document.getElementById('emailList').value = emails.join(', ');
    };
    reader.readAsArrayBuffer(file);
});

function processAndSendEmails() {
    const experimentTopic = document.getElementById('experimentTopic').value;
    const emails = document.getElementById('emailList').value.split(',').map(email => email.trim()).filter(email => email);

    if (emails.length === 0) {
        alert("No emails found. Please upload a valid Excel file.");
        return;
    }

    fetch('/experiments')
        .then(response => response.json())
        .then(data => {
            const experiment = data.experiments.find(exp => exp.title === experimentTopic);
            const selectedLinks = experiment.chatbots.map(chatbot => chatbot.link);
            distributeChatbotsAndSendEmails(emails, selectedLinks, );
        });
}

function distributeChatbotsAndSendEmails(emails, selectedLinks) {
    // Shuffle the emails
    emails = emails.sort(() => Math.random() - 0.5);

    // Distribute chatbots equally
    emails.forEach((email, index) => {
        const selectedLink = selectedLinks[index % selectedLinks.length];

        // This is a placeholder for the actual email sending functionality
        console.log(`Sending email to ${email} with the link: ${selectedLink}`);

        // Optionally, you can use a backend service to send the email
        // Example:
        fetch('/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                link: selectedLink
            })
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  console.log(`Email sent to ${email}`);
              } else {
                  console.log(`Failed to send email to ${email}`);
              }
          });
    });

    alert("Emails have been sent successfully.");
}

function generateChatbotFields() {
    const numChatbots = document.getElementById('numChatbots').value;
    const container = document.getElementById('chatbotFieldsContainer');
    container.innerHTML = '';

    for (let i = 1; i <= numChatbots; i++) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = `Chatbot ${i} Link`;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control';
        input.id = `chatbotLink${i}`;
        input.placeholder = `Enter link for Chatbot ${i}`;
        input.required = true;

        formGroup.appendChild(label);
        formGroup.appendChild(input);
        container.appendChild(formGroup);
    }

    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'btn btn-primary btn-block';
    addButton.textContent = 'Add Experiment and Chatbots';
    addButton.onclick = addUsecase;

    container.appendChild(addButton);
}

function addUsecase() {
    const title = document.getElementById('usecaseTitle').value;
    const numChatbots = document.getElementById('numChatbots').value;
    const chatbots = [];

    for (let i = 1; i <= numChatbots; i++) {
        const link = document.getElementById(`chatbotLink${i}`).value;
        if (!link) {
            alert(`Please enter a link for Chatbot ${i}`);
            return;
        }
        chatbots.push({ name: `Chatbot ${i}`, link });
    }

    // This is a placeholder for the actual use case addition functionality
    console.log(`Adding experiment with title: ${title}`);
    console.log(`Chatbots: `, chatbots);

    // Optionally, you can use a backend service to save the experiment and chatbots
    fetch('/add-experiment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title,
            chatbots
        })
    }).then(response => response.json())
      .then(data => {
          if (data.success) {
              alert('Experiment and chatbots added successfully');
              // Reset the form
              document.getElementById('usecaseForm').reset();
              document.getElementById('chatbotFieldsContainer').innerHTML = '';
              fetchExperiments();  // Refresh the experiments dropdown
          } else {
              alert('Failed to add experiment and chatbots');
          }
      });
}

function deleteExperiment() {
    const experimentTitle = document.getElementById('deleteExperimentTopic').value;
    if (!experimentTitle) {
        alert("Please select an experiment to delete.");
        return;
    }

    if (!confirm(`Are you sure you want to delete the experiment "${experimentTitle}"? This action cannot be undone.`)) {
        return;
    }

    fetch(`/delete-experiment/${experimentTitle}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
      .then(data => {
          if (data.success) {
              alert('Experiment deleted successfully');
              fetchExperiments();  // Refresh the experiments dropdown
          } else {
              alert('Failed to delete experiment');
          }
      });
}

function initializeFeedbackForm() {
    console.log("Initializing Feedback Form");

    // Fetch experiments and populate the experiment topic dropdown
    fetch('/experiments')
        .then(response => response.json())
        .then(data => {
            const feedbackExperimentTopic = document.getElementById('feedbackExperimentTopic');
            feedbackExperimentTopic.innerHTML = '';
            data.experiments.forEach(experiment => {
                const option = document.createElement('option');
                option.value = experiment.title;
                option.textContent = experiment.title;
                feedbackExperimentTopic.appendChild(option);
            });

            feedbackExperimentTopic.dispatchEvent(new Event('change'));
        });

    // Populate chatbots based on selected experiment
    document.getElementById('feedbackExperimentTopic').addEventListener('change', function () {
        const experimentTitle = this.value;
        fetch('/experiments')
            .then(response => response.json())
            .then(data => {
                const experiment = data.experiments.find(exp => exp.title === experimentTitle);
                const feedbackSelectChatbot = document.getElementById('feedbackSelectChatbot');
                feedbackSelectChatbot.innerHTML = '';

                experiment.chatbots.forEach(chatbot => {
                    const option = document.createElement('option');
                    option.value = chatbot.name;
                    option.textContent = chatbot.name;
                    feedbackSelectChatbot.appendChild(option);
                });
            });
    });

    // Add feedback question logic
    document.getElementById('addFeedbackQuestion').addEventListener('click', function () {
        const questionContainer = document.createElement('div');
        questionContainer.className = 'form-group border rounded p-3 mb-3';

        // Question Text Input
        const questionInput = document.createElement('input');
        questionInput.type = 'text';
        questionInput.placeholder = 'Enter feedback question';
        questionInput.className = 'form-control mb-2';

        // Question Type Dropdown
        const questionTypeSelect = document.createElement('select');
        questionTypeSelect.className = 'form-control mb-2';
        questionTypeSelect.innerHTML = `
            <option value="scale">Scale</option>
            <option value="text">Text</option>
        `;

        // Save Question Button
        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.className = 'btn btn-success btn-sm mr-2';
        saveButton.textContent = 'Save Question';
        saveButton.addEventListener('click', function () {
            const questionText = questionInput.value.trim();
            const questionType = questionTypeSelect.value;

            if (!questionText) {
                alert('Please enter a question.');
                return;
            }

            const questionItem = document.createElement('li');
            questionItem.className = 'list-group-item d-flex align-items-start flex-column';

            const questionLabel = document.createElement('strong');
            questionLabel.textContent = questionText;
            questionItem.appendChild(questionLabel);

            // Add predefined scale or text input based on question type
            if (questionType === 'scale') {
                const scaleLabels = [
                    'Strongly Disagree',
                    'Disagree',
                    'Neutral',
                    'Agree',
                    'Strongly Agree',
                ];

                const scaleContainer = document.createElement('div');
                scaleContainer.className = 'd-flex justify-content-between mt-2';

                scaleLabels.forEach(label => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'form-check-inline text-center';

                    const optionInput = document.createElement('input');
                    optionInput.type = 'radio';
                    optionInput.name = `question-${questionText}`;
                    optionInput.value = label;
                    optionInput.className = 'form-check-input';
                    optionInput.disabled = true; // Display-only for feedback form creation

                    const optionLabel = document.createElement('label');
                    optionLabel.textContent = label;
                    optionLabel.className = 'form-check-label';

                    optionDiv.appendChild(optionInput);
                    optionDiv.appendChild(optionLabel);
                    scaleContainer.appendChild(optionDiv);
                });

                questionItem.appendChild(scaleContainer);
            } else if (questionType === 'text') {
                const textArea = document.createElement('textarea');
                textArea.className = 'form-control mt-2';
                textArea.placeholder = 'Text response will go here (display only).';
                textArea.disabled = true; // Display-only for feedback form creation

                questionItem.appendChild(textArea);
            }

            // Delete Button
            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'btn btn-danger btn-sm mt-2';
            deleteButton.innerHTML = '<img src="https://img.icons8.com/material-rounded/24/ffffff/trash.png" alt="Delete">';
            deleteButton.addEventListener('click', function () {
                questionItem.remove();
            });

            questionItem.appendChild(deleteButton);
            document.getElementById('feedbackQuestionsList').appendChild(questionItem);

            questionContainer.remove();
        });

        // Cancel Button
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'btn btn-danger btn-sm';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', function () {
            questionContainer.remove();
        });

        questionContainer.appendChild(questionInput);
        questionContainer.appendChild(questionTypeSelect);
        questionContainer.appendChild(saveButton);
        questionContainer.appendChild(cancelButton);

        document.getElementById('feedbackForm').insertBefore(
            questionContainer,
            document.getElementById('feedbackQuestionsList')
        );
    });

    // Handle form submission
    document.getElementById('feedbackForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const experimentTitle = document.getElementById('feedbackExperimentTopic').value;
        const chatbotName = document.getElementById('feedbackSelectChatbot').value;
        const questions = Array.from(document.getElementById('feedbackQuestionsList').children).map(question => {
            const type = question.querySelector('div.d-flex') ? 'scale' : 'text';
            const text = question.querySelector('strong').textContent;

            return { type, text };
        });

        const uuid = generateUUID();
        const filename = `${experimentTitle}_${chatbotName}_${uuid}.json`;

        const feedbackData = { experimentTitle, chatbotName, questions };

        fetch('/save-feedback-form', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, data: feedbackData }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Feedback form submitted successfully.');
                document.getElementById('feedbackForm').reset();
                document.getElementById('feedbackQuestionsList').innerHTML = '';
            } else {
                alert('Failed to submit feedback form.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while submitting the feedback form.');
        });
    });
}


function initializeViewFeedback() {
    fetch('/get-feedback-forms')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch feedback forms: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const feedbackFormDropdown = document.getElementById('feedbackFormDropdown');
            feedbackFormDropdown.innerHTML = '';
            console.log('Fetched feedback forms:', data); // Debug log
            if (data.feedbackForms && data.feedbackForms.length > 0) {
                data.feedbackForms.forEach(form => {
                    const option = document.createElement('option');
                    option.value = form.filename;
                    option.textContent = form.filename;
                    feedbackFormDropdown.appendChild(option);
                });

                feedbackFormDropdown.dispatchEvent(new Event('change')); // Auto-select first form
            } else {
                document.getElementById('feedbackFormDisplay').innerHTML = '<p>No feedback forms available.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching feedback forms:', error);
            document.getElementById('feedbackFormDisplay').innerHTML = '<p>Error fetching feedback forms.</p>';
        });
    // Event listener for dropdown
    document.getElementById('feedbackFormDropdown').addEventListener('change', function () {
        const filename = this.value;
        console.log('Selected feedback form:', filename); // Debug log
        fetch(`/feedbackQuestion/${filename}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch feedback form: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched feedback form data:', data); // Debug log
                displayFeedbackForm(data);
            })
            .catch(error => {
                console.error('Error fetching feedback form:', error);
                document.getElementById('feedbackFormDisplay').innerHTML = '<p>Error loading feedback form.</p>';
            });
    });
}

function displayFeedbackForm(formData) {
    const displayDiv = document.getElementById('feedbackFormDisplay');
    displayDiv.innerHTML = ''; // Clear previous content

    // Title
    const title = document.createElement('h3');
    title.textContent = `Experiment: ${formData.experimentTitle} | Chatbot: ${formData.chatbotName}`;
    displayDiv.appendChild(title);

    // Render questions dynamically
    formData.questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'mt-3 border p-3 rounded';

        const questionTitle = document.createElement('strong');
        questionTitle.textContent = `${index + 1}. ${question.text}`;
        questionDiv.appendChild(questionTitle);

        if (question.type === 'scale') {
            // Display scale labels
            const scaleLabels = [
                'Strongly Disagree',
                'Disagree',
                'Neutral',
                'Agree',
                'Strongly Agree',
            ];

            const scaleContainer = document.createElement('div');
            scaleContainer.className = 'd-flex justify-content-between mt-2';

            scaleLabels.forEach(label => {
                const labelDiv = document.createElement('div');
                labelDiv.className = 'text-center';
                labelDiv.textContent = label;

                scaleContainer.appendChild(labelDiv);
            });

            questionDiv.appendChild(scaleContainer);
        }

        displayDiv.appendChild(questionDiv);
    });
}


function populateTableFromJSON() {
    const tableBody = document.getElementById('dataTableBody');
    const hoverCard = document.getElementById('hoverCard');
    const cardContent = document.getElementById('cardContent');

    tableBody.innerHTML = ''; // Clear existing rows

    fetch('data.json') // Adjust the path to match the location of your JSON file
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched data:', data); // Log the fetched data for debugging
            data.forEach(entry => {
                // Create a table row
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.id || ''}</td>
                    <td>${entry.source || ''}</td>
                    <td><a href="${entry.url || '#'}" target="_blank">Link</a></td>
                    <td>${entry.header || ''}</td>
                    <td>${entry.description || ''}</td>
                    <td>${entry.case || ''}</td>
                    <td>${entry.explanation || ''}</td>
                    <td>${entry.type || ''}</td>
                    <td>${entry.date || ''}</td>
                `;

                // Add hover event listeners for the row
                row.addEventListener('mouseenter', (e) => {
                    // Populate the card with data
                    cardContent.innerHTML = `
                        <strong>ID:</strong> ${entry.id || ''}<br>
                        <strong>Source:</strong> ${entry.source || ''}<br>
                        <strong>URL:</strong> <a href="${entry.url || '#'}" target="_blank">Link</a><br>
                        <strong>Header:</strong> ${entry.header || ''}<br>
                        <strong>Description:</strong> ${entry.description || ''}<br>
                        <strong>Case:</strong> ${entry.case || ''}<br>
                        <strong>Explanation:</strong> ${entry.explanation || ''}<br>
                        <strong>Type:</strong> ${entry.type || ''}<br>
                        <strong>Date:</strong> ${entry.date || ''}
                    `;
                    // Position the card
                    hoverCard.style.top = `${e.pageY + 10}px`;
                    hoverCard.style.left = `${e.pageX + 10}px`;
                    hoverCard.style.display = 'block';
                });

                row.addEventListener('mousemove', (e) => {
                    // Update the card position
                    hoverCard.style.top = `${e.pageY + 10}px`;
                    hoverCard.style.left = `${e.pageX + 10}px`;
                });

                row.addEventListener('mouseleave', () => {
                    // Hide the card
                    hoverCard.style.display = 'none';
                });

                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching or processing data:', error);
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Failed to load data.</td></tr>';
        });
}
