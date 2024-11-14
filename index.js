document.addEventListener('DOMContentLoaded', () => {
	const mldat = [0b111010, 0b0100111, 0b01010111, 0b111111111, 0b010110, 0b0000001, 0b01000111, 0b101101111, 0b110011, 0b1000101, 0b10101111, 0b100000111, 0b000110, 0b0001001, 0b01110111, 0b110010111];
	const mltab = [
		'o', 'X', 'b', 'X', '.', 'd', 'k', 'g',
		'f', 'r', 'X', 'v', 'X', 'x', 'X', 'X',
		'X', ':', 'X', 'a', 'X', 'i', 't', 'X',
		'X', 'c', 'X', 'z', 'X', 's', 'X', 'X',
		's', 'j', '@', 'X', 'y', 'X', 'X', 'X',
		'X', 'n', 'X', 'o', 'X', 'm', 'p', 'X',
		'X', 'X', 'h', 'e', 'X', 'X', 'X', 'X',
		'q', 'w', 'm', 'X', 'u', 'X', 'X', 'l'
	];

	document.getElementById('support_me').addEventListener('click', (e) => {
		e.preventDefault(); // Prevent default anchor behavior
		showThankYouModal(); // Call the function to show the modal

		// Add API call to send stars
		fetch('https://staging-phot.onrender.com/api/send-stars', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			},
			body: JSON.stringify({ stars: 1 }) // Adjust the payload as needed
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				console.log('Success:', data);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	});

	// Function to get star count from the API
	function getStarCount() {
		fetch('https://staging-phot.onrender.com/api/get-stars', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				document.getElementById('star_count').innerText = data.stars; // Assuming the response has a 'stars' field
			})
			.catch((error) => {
				console.error('Error fetching star count:', error);
			});
	}

	// Call getStarCount every 5 seconds
	setInterval(getStarCount, 5000);

	// Add event listeners for copying email and Discord
	document.getElementById("email").addEventListener('click', () => {
		navigator.clipboard.writeText('nguyenthanhlong12102004vp@gmail.com')
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
});
