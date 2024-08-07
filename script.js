function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'end' });
}

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.3,
};

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
}, observerOptions);

window.addEventListener('DOMContentLoaded', () => {
    const fadeElems = document.querySelectorAll('.fade');
    const lineElems = document.querySelectorAll('.line');

    fadeElems.forEach(element => {
        observer.observe(element);
    });

    lineElems.forEach(element => {
        observer.observe(element);
    });
});
