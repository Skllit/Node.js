/* public/js/main.js */
/*
  Client-side JavaScript to enhance user interaction.
*/
document.addEventListener('DOMContentLoaded', () => {
  console.log('Main.js loaded successfully.');
  
  // Validate fund transfer form
  const fundTransferForm = document.querySelector('form[action="/transfer"]');
  if (fundTransferForm) {
    fundTransferForm.addEventListener('submit', (e) => {
      const amount = parseFloat(document.getElementById('amount').value);
      if (isNaN(amount) || amount <= 0) {
        e.preventDefault();
        alert('Please enter a valid amount.');
      }
    });
  }
  
  // For any button with class "next", use its data-next attribute to navigate automatically (if needed)
  document.querySelectorAll('.btn.next').forEach(button => {
    button.addEventListener('click', () => {
      window.location.href = button.getAttribute('data-next');
    });
  });
  
  // Additional interactive behavior or animations can be added here.
});

for (let i = 0; i < 50; i++) {
  console.log(`Client JS debug log ${i + 1}`);
}
