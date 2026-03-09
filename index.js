/* ============================================
   PORTFOLIO — Animations & Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // === TYPEWRITER EFFECT ===
  const typewriter = (() => {
    const el = document.getElementById('typed-name');
    if (!el) return;

    const text = 'Dadadadas';
    let i = 0;

    // Create cursor
    const cursor = document.createElement('span');
    cursor.classList.add('cursor');
    el.appendChild(cursor);

    function type() {
      if (i < text.length) {
        el.insertBefore(document.createTextNode(text[i]), cursor);
        i++;
        setTimeout(type, 120);
      }
    }

    // Start after a small delay for the greeting to fade in
    setTimeout(type, 600);
  })();

  // === SCROLL REVEAL (IntersectionObserver) ===
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // === STAGGERED SKILL TAGS ===
  const skillTags = document.querySelectorAll('.skill-tag');
  const skillsContainer = document.getElementById('skills-container');

  if (skillsContainer) {
    const skillObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            skillTags.forEach((tag, index) => {
              setTimeout(() => {
                tag.classList.add('revealed');
              }, index * 50);
            });
            skillObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    skillObserver.observe(skillsContainer);
  }

  // === SMOOTH SCROLL FOR ANCHORS ===
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });

  // === PROJECT CARD TILT (rAF-throttled) ===
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach((card) => {
    let ticking = false;

    card.addEventListener('mouseenter', () => {
      card.style.willChange = 'transform';
      card.style.transition = 'box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    card.addEventListener('mousemove', (e) => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
        ticking = false;
      });
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      card.style.willChange = 'auto';
    });
  });
});
