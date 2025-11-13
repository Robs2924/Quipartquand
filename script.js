document.addEventListener('DOMContentLoaded', () => {
    // --- GESTION DU THÈME ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    // Affiche la bonne icône au chargement
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        themeToggleLightIcon.classList.remove('hidden');
    } else {
        themeToggleDarkIcon.classList.remove('hidden');
    }

    themeToggleBtn.addEventListener('click', () => {
        // Change les icônes
        themeToggleDarkIcon.classList.toggle('hidden');
        themeToggleLightIcon.classList.toggle('hidden');

        // Si le thème était déjà sauvegardé, on l'inverse
        if (localStorage.getItem('color-theme')) {
            if (localStorage.getItem('color-theme') === 'light') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            }
        // Sinon, on se base sur l'état actuel et on sauvegarde
        } else {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            }
        }
    });

    // --- CHARGEMENT ET GÉNÉRATION DES DÉCOMPTES ---
    fetch('config.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('countdown-container');
            data.forEach((personne, index) => {
                const cardId = `person-card-${index}`;
                const countdownCard = document.createElement('div');
                countdownCard.id = cardId;
                countdownCard.className = 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center transition-colors duration-300 relative overflow-hidden'; // `relative` et `overflow-hidden` sont importants pour les confettis
                countdownCard.dataset.clickCount = 0; // Initialise le compteur de clics pour l'easter egg

                // Gère la date de départ du DROM (optionnelle)
                let dromCountdownHTML = '';
                if (personne.dateDepartDrom) {
                    dromCountdownHTML = `
                        <p class="text-sm mt-4 text-gray-500 dark:text-gray-400">Départ du Drom dans :</p>
                        <div id="timer-drom-${index}" class="text-3xl font-mono text-cyan-500"></div>
                    `;
                } else {
                    dromCountdownHTML = `<p class="text-sm mt-4 text-gray-500 dark:text-gray-400">Déjà sur place, veinard !</p>`;
                }
                
                // Gère la date de retour en France
                const retourDate = new Date(personne.dateRetourFrance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                countdownCard.innerHTML = `
                    <h2 class="text-2xl font-bold mb-2">${personne.prenom} ${personne.nom}</h2>
                    <p class="text-sm mt-4 text-gray-500 dark:text-gray-400">Retour en France dans :</p>
                    <div id="timer-retour-${index}" class="text-3xl font-mono text-indigo-500"></div>
                    ${dromCountdownHTML}
                    <p class="text-xs mt-4 text-gray-400">Retour prévu le : ${retourDate}</p>
                `;
                container.appendChild(countdownCard);

                // Met à jour les décomptes toutes les secondes
                setInterval(() => {
                    updateCountdown(personne.dateRetourFrance, `timer-retour-${index}`);
                    if (personne.dateDepartDrom) {
                        updateCountdown(personne.dateDepartDrom, `timer-drom-${index}`);
                    }
                }, 1000);

                // --- GESTION DE L'EASTER EGG ---
                countdownCard.addEventListener('click', () => {
                    let clickCount = parseInt(countdownCard.dataset.clickCount) + 1;
                    countdownCard.dataset.clickCount = clickCount;

                    if (clickCount === 10) {
                        triggerEmojiConfetti(countdownCard);
                        countdownCard.dataset.clickCount = 0; // Réinitialise le compteur
                    }
                });
            });
        });
});

function updateCountdown(targetDate, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;
    
    if (difference <= 0) {
        element.innerText = "C'est fait !";
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    element.innerText = `${days}j ${hours}h ${minutes}m ${seconds}s`;
}

function triggerEmojiConfetti(parentElement) {
    const emojis = ['😂', '🎉', '✈️', '🍻', '🍜', '🥳', '🤯'];
    for (let i = 0; i < 50; i++) {
        const emoji = document.createElement('span');
        emoji.className = 'emoji-confetti';
        emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        
        // Positionne l'emoji aléatoirement sous le décompte
        emoji.style.left = `${Math.random() * 100}%`;
        // Ajoute un délai d'animation aléatoire pour un effet plus naturel
        emoji.style.animationDelay = `${Math.random() * 2}s`;

        parentElement.appendChild(emoji);

        // Supprime l'emoji du DOM après la fin de l'animation pour ne pas surcharger la page
        setTimeout(() => {
            emoji.remove();
        }, 3000);
    }
}