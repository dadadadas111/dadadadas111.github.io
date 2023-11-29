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



let index = 0,
    interval = 1000;

const rand = (min, max) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

const animate = star => {
  star.style.setProperty("--star-left", `${rand(-10, 100)}%`);
  star.style.setProperty("--star-top", `${rand(-40, 80)}%`);

  star.style.animation = "none";
  star.offsetHeight;
  star.style.animation = "";
}

for(const star of document.getElementsByClassName("magic-star")) {
  setTimeout(() => {
    animate(star);
    
    setInterval(() => animate(star), 1000);
  }, index++ * (interval / 3))
}

const letters = "qwertyuiopasdfghjklzxcvbnm";
let _interval = null;
const string = [
  "Lan Vy",
  "Love U"
]

document. querySelector('.magic-text').onmousedown = event => {
  console.log('hovered')
  let iteration = 0;
  let i = 0;
  if (event.target.dataset.value == string[i]){
    i = 1;
  }
  event.target.dataset.value = string[i];
  
  clearInterval(_interval);
  _interval = setInterval(() =>{
    event.target.innerText = event.target.innerText.split("").map((letter, index) =>{
      if (index < iteration){
        return string[i][index];
      }
      return letters[Math.floor(Math.random() * 26)];
    }).join("");
    if (iteration >= event.target.dataset.value.length)
      clearInterval(_interval)
    iteration+= 1/3;
  }, 30)
}
