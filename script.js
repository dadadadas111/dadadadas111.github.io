const blob = document.getElementById("blob");

document.body.onpointermove = event =>{
  const {clientX, clientY} = event;
  blob.animate({
    left: `${clientX}px`,
    top: `${clientY}px`
  }, {duration: 3000, fill: "forwards"})
}


// Attach a click event listener to the container element
document.addEventListener('click', function(event) {
  // Create a new star element
  for (let i = 0 ; i < 10; i++){
    const star = document.createElement('div');
  star.classList.add('star');

  // Set the star's size and rotation randomly
  const size = Math.floor(Math.random() * 20) + 10;
  const x = event.clientX + Math.floor(Math.random() * 100) - 50,
        y  = event.clientY + Math.floor(Math.random() * 100) - 50
  star.style.width = size + 'px';
  star.style.height = size + 'px';
  star.style.top = event.clientY + 'px';
  star.style.left = event.clientX + 'px';

  // Add the star to the container element
  document.body.appendChild(star);
    setTimeout(function(){
        star.style.top = y + 'px';
        star.style.left = x + 'px';
        //star.remove();
    }, 100)
  
  // Remove the star element after a delay
  setTimeout(function() {
    star.remove();
  }, 900);
    }
});


const trailer = document.getElementById("trailer");
const animateTrailer = e => {
  const x = e.clientX -trailer.offsetWidth / 2;
  const y = e.clientY -trailer.offsetHeight / 2;
  const keyframes = {
    transform: `translate(${x}px, ${y}px)`
  }
  
  trailer.animate(keyframes, {
    duration: 800,
    fill: "forwards"
  })
}
window.onmousemove = e =>{
  animateTrailer(e);
}

