// src/utils/reveal.js
// Scroll-reveal oparty o IntersectionObserver.
// Użycie: dodaj atrybut data-reveal do elementu (opcjonalnie style="--reveal-delay: 100ms").
// Elementy dodane dynamicznie zgłaszaj przez observeReveals(root).

const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    }
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

export function observeReveals(root = document) {
    root.querySelectorAll('[data-reveal]:not(.revealed)').forEach(el => observer.observe(el));
}

// Auto-init dla elementów statycznych
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => observeReveals());
} else {
    observeReveals();
}
