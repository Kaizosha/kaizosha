(() => {
  "use strict";

  const documentNav = document.querySelector(".document-nav");
  const sections = Array.from(document.querySelectorAll(".section"));

  if (!documentNav || !sections.length) {
    return;
  }

  let activeSection = null;
  let animationFrame = 0;

  const updateDocumentPosition = () => {
    animationFrame = 0;

    const navBounds = documentNav.getBoundingClientRect();
    const isScrolled = window.scrollY > 0 && navBounds.top <= 0.5;
    let nextSection = sections[0];

    for (const section of sections) {
      if (section.getBoundingClientRect().top <= navBounds.bottom + 1) {
        nextSection = section;
      } else {
        break;
      }
    }

    document.body.classList.toggle("document-is-scrolled", isScrolled);

    if (nextSection === activeSection) {
      return;
    }

    activeSection?.classList.remove("is-current");
    nextSection.classList.add("is-current");
    activeSection = nextSection;
  };

  const requestUpdate = () => {
    if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(updateDocumentPosition);
    }
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  window.addEventListener("pageshow", requestUpdate);
  updateDocumentPosition();
})();
