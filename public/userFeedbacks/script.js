// Extract title and chatbotName from the query parameters
const urlParams = new URLSearchParams(window.location.search);
const title = urlParams.get('title');
const chatbotName = urlParams.get('chatbotName');

const questionsContainer = document.getElementById('questionsContainer');

// First, fetch the formPath using the server endpoint
fetch(`/user-feedback/${encodeURIComponent(title)}/${encodeURIComponent(chatbotName)}`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Error fetching form path: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    // data.formPath should contain the correct JSON file path
    const questionsJSON = data.formPath;

    // Now proceed with your original logic to fetch and display questions
    return fetch(questionsJSON);
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Error fetching questions: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid JSON format. Expected an array of questions.');
    }

    // Dynamically render the questions
    data.questions.forEach((item, index) => {
        const questionBlock = document.createElement('div');
        questionBlock.className = 'form-group';

        // Add Question Text
        const questionLabel = document.createElement('label');
        questionLabel.textContent = `${index + 1}. ${item.text}`;
        questionBlock.appendChild(questionLabel);

        // Render input based on type
        if (item.type === 'scale') {
            const scaleLabels = [
                'Strongly Disagree',
                'Disagree',
                'Neutral',
                'Agree',
                'Strongly Agree',
            ];

            const scaleContainer = document.createElement('div');
            scaleContainer.className = 'd-flex justify-content-between mt-2';

            scaleLabels.forEach((label, scaleIndex) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'form-check-inline text-center';

                const optionInput = document.createElement('input');
                optionInput.type = 'radio';
                optionInput.name = `question-${index}`;
                optionInput.value = scaleIndex + 1; // Values: 1 to 5
                optionInput.className = 'form-check-input';
                optionInput.required = true;

                const optionLabel = document.createElement('label');
                optionLabel.textContent = label;
                optionLabel.className = 'form-check-label';

                optionDiv.appendChild(optionInput);
                optionDiv.appendChild(optionLabel);
                scaleContainer.appendChild(optionDiv);
            });

            questionBlock.appendChild(scaleContainer);
        } else if (item.type === 'text') {
            // Add a text area for open-ended questions
            const textArea = document.createElement('textarea');
            textArea.name = `question-${index}`;
            textArea.className = 'form-control';
            textArea.placeholder = 'Type your answer here...';
            textArea.required = true;

            questionBlock.appendChild(textArea);
        }

        questionsContainer.appendChild(questionBlock);
    });
})
.catch(error => {
    console.error(error);
    questionsContainer.innerHTML = `<div class="alert alert-danger">Failed to load questions. Please try again later.</div>`;
});

document.getElementById('userFeedbackForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const scaleLabels = {
      1: 'Strongly Disagree',
      2: 'Disagree',
      3: 'Neutral',
      4: 'Agree',
      5: 'Strongly Agree',
  };

  const formData = new FormData(this);
  const responses = [];

  // Iterate through formData entries
  for (let [name, value] of formData.entries()) {
      const questionElement = document.querySelector(`[name="${name}"]`);
      const questionText = questionElement.closest('.form-group').querySelector('label').textContent;

      let responseText = value;
      if (questionElement.type === 'radio') {
          // Map numeric scale values to text labels
          responseText = scaleLabels[value] || value;
      }

      responses.push({
          question: questionText,
          response: responseText
      });
  }

  console.log('User Responses:', responses);

  fetch('/send-feedback-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responses),
  })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              alert('Thank you! Your feedback has been submitted.');
          } else {
              alert('Error submitting feedback. Please try again.');
          }
      })
      .catch(error => {
          console.error('Error sending email:', error);
      });
});
