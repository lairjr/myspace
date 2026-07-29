window.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('blog-search');
  const cards = Array.from(document.querySelectorAll('#blog-cards .card'));
  const emptyState = document.getElementById('blog-empty');

  if (!searchInput || !cards.length) {
    return;
  }

  searchInput.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const matches = !query || card.dataset.search.includes(query);
      card.style.display = matches ? '' : 'none';
      if (matches) visibleCount += 1;
    });

    emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
  });
});
