document.addEventListener('DOMContentLoaded', () => {

	document.getElementById('support_me').addEventListener('click', (e) => {
		e.preventDefault(); // Prevent default anchor behavior
		showThankYouModal(); // Call the function to show the modal

		// Add API call to send stars
		fetch('https://api.hatepost.fumi.fyi/api/send-stars', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ stars: 1 }) // Adjust the payload as needed
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.body;
			})
			.then(data => {
				console.log('Success:', data);
				getStarCount(); // Update the star count after sending stars
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	});

	// Function to get star count from the API
	function getStarCount() {
		fetch('https://api.hatepost.fumi.fyi/api/get-stars', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				document.getElementById('star_count').innerText = data.stars || 0; // Assuming the response has a 'stars' field
			})
			.catch((error) => {
				console.error('Error fetching star count:', error);
			});
	}

	// initial call to get star count
	getStarCount();

	// Call getStarCount every 5 seconds
	setInterval(getStarCount, 5000);

	// Add event listeners for copying email and Discord
	document.getElementById("email").addEventListener('click', () => {
		navigator.clipboard.writeText('longnt121004@gmail.com')
			.then(() => {
				showCopyModal('Email');
			})
			.catch((err) => {
				console.error('Failed to copy text: ', err);
				alert('Failed to copy email. Please try again.');
			});
	});

	document.getElementById("discord").addEventListener('click', () => {
		navigator.clipboard.writeText('dadadadas111')
			.then(() => {
				showCopyModal('Discord');
			})
			.catch((err) => {
				console.error('Failed to copy text: ', err);
				alert('Failed to copy email. Please try again.');
			});
	});

	function showCopyModal(type) {
		const modal = document.createElement('div');
		modal.id = 'copy_modal';
		modal.innerHTML = `
			<div class="modal_content">
				<h2>${type} copied to clipboard!</h2>
				<button class="sns" id="close_modal">Close</button>
			</div>
		`;
		document.body.appendChild(modal);

		// Close modal on button click
		document.getElementById('close_modal').addEventListener('click', () => {
			document.body.removeChild(modal);
		});
	}

	function showThankYouModal() {
		const modal = document.createElement('div');
		modal.id = 'thank_you_modal';
		modal.innerHTML = `
			<div class="modal_content">
				<h2>Thank You!</h2>
				<p>Your support means a lot to me!</p>
				<button class="sns" id="close_modal">Close</button>
			</div>
		`;
		document.body.appendChild(modal);

		// Close modal on button click
		document.getElementById('close_modal').addEventListener('click', () => {
			document.body.removeChild(modal);
		});
	}

	function generateSnowflakes(falling, colors) {
		var container = document.querySelector('.snowflakes'); // Change this to the container where you want to append snowflakes

		for (let i = 0; i < 25; i++) {
			var snowflake = document.createElement('div');
			snowflake.className = 'snowflake';
			snowflake.innerText = falling;
			// Random position
			snowflake.style.left = Math.random() * 100 + '%';

			// Random animation delays
			snowflake.style.webkitAnimationDelay = Math.random() * 6 + 's, ' + (1.0 * ((Math.random() * (3 - 0.1)) + 0.1)) + 's';
			snowflake.style.animationDelay = Math.random() * 8 + 's, ' + ((Math.random() * (3 - 0.1)) + 0.1) + 's';

			// Random size
			var size = Math.random() * 1.5 + 0.5; // Size range between 0.5em and 2em
			snowflake.style.fontSize = size + 'em';
			snowflake.style.opacity = 0.5 + Math.random();

			container.appendChild(snowflake);
		}
	}

	let falling = '❅';
	let colors = []

	// Function to change background image randomly
	function changeBackgroundImage() {
		const bgElement = document.getElementById('bg');
		const bgReflectorElement = document.getElementById('bg_cover');
		const randomIndex = Math.floor(Math.random() * 8) + 1; // Random number between 1 and 10
		bgElement.src = `bg/${randomIndex}.webp`; // Adjust the path and file extension as needed
		bgReflectorElement.src = `bg/${randomIndex}.webp`; // Adjust the path and file extension as needed
		switch (randomIndex) {
			case 1:
			case 2:
			case 3:
			case 8:
				falling = '🍁';
				colors = ['red', 'yellow']
		}
	}

	// Call the function to change the background image on load
	changeBackgroundImage();

	generateSnowflakes(falling, colors);

});
