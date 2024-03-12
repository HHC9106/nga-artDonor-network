//scroll button animation
document.addEventListener('DOMContentLoaded', function () {
  const scrollButton = document.getElementById('scrollButton');
  const scrollBackButton = document.getElementById('scrollBackButton');

  // Add click event listener to the scroll button
  scrollButton.addEventListener('click', function () {
    // Scroll to the top of page2 after the fade-out effect
    document.getElementById('quant-container').classList.add('fade-out');
    setTimeout(function () {
      document.getElementById('quali-container').scrollIntoView({
        behavior: 'smooth', // Disable smooth scrolling
        block: 'center',
        inline: 'center',
      });
    }, 0); // Adjust the delay (in milliseconds) based on your fade-out transition duration
  });

  // Add click event listener to the scroll back button
  scrollBackButton.addEventListener('click', function () {
    // Scroll to the top of page1
    document.getElementById('quant-container').classList.remove('fade-out');
    setTimeout(function () {
      document.getElementById('quant-container').scrollIntoView({
        behavior: 'smooth', // Disable smooth scrolling
      });
    },); // Adjust the delay (in milliseconds) based on your fade-out transition duration
  });
});


