document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();
  
    const formData = new FormData(this);
    const submitButton = document.getElementById('submitButton');
    const statusMessage = document.getElementById('statusMessage');
  
    submitButton.disabled = true; // Disable button to prevent multiple submissions
    statusMessage.textContent = 'Submitting...';
  
    try {
      const response = await fetch('/submit-form', {
        method: 'POST',
        body: formData
      });
  
      if (response.ok) {
        statusMessage.textContent = 'Form submitted successfully!';
      } else {
        statusMessage.textContent = 'Submission failed. Try again.';
      }
    } catch (error) {
      statusMessage.textContent = 'An error occurred. Please try again.';
    }
  
    submitButton.disabled = false; 
  });