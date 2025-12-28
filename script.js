const coresDominios = {
    "arcano": "#8e44ad",
    "profano": "#c0392b",
    "elemental": "#7cfc00",
    "primordial": "#20b2aa",
    "celestial": "#ffd700",
    "abissal": "#000000",
    "astral": "#87ceeb",
    "natural": "#228b22"
};

// Mapeamento para ordenação hierárquica
const pesoNivel = {
    "truque": 0,
    "nível 1": 1,
    "nível 2": 2,
    "nível 3": 3 // Caso adicione futuramente
};

let magias = [];
let favoritos = JSON.parse(localStorage.getItem('tramapedia_favs')) || [];

const container = document.getElementById('spellContainer');
const searchInput = document.getElementById('searchBar');
const domainFilter = document.getElementById('domainFilter');
const levelFilter = document.getElementById('levelFilter'); // Referência ao novo filtro
const btnFavs = document.getElementById('btnFavorites');

async function init() {
    try {
        const response = await fetch('magias.json');
        magias = await response.json();
        render();
    } catch (err) {
        container.innerHTML = "<p>Erro ao carregar banco de dados. Verifique o arquivo magias.json.</p>";
    }
}

function render() {
    const term = searchInput.value.toLowerCase();
    const domain = domainFilter.value;
    const level = levelFilter.value; // Pega o valor do nível
    const onlyFavs = btnFavs.classList.contains('active');

    // 1. Filtragem
    let filtradas = magias.filter(m => {
        const matchNome = m.nome.toLowerCase().includes(term);
        const matchDom = domain === 'todos' || m.dominios.some(d => d.toLowerCase() === domain);
        const matchLevel = level === 'todos' || m.tipo.toLowerCase() === level;
        const matchFav = onlyFavs ? favoritos.includes(m.id) : true;
        return matchNome && matchDom && matchLevel && matchFav;
    });

    // 2. Ordenação Hierárquica (Truque -> Nível 1 -> Nível 2)
    filtradas.sort((a, b) => {
        const pesoA = pesoNivel[a.tipo.toLowerCase()] ?? 99;
        const pesoB = pesoNivel[b.tipo.toLowerCase()] ?? 99;
        
        if (pesoA !== pesoB) {
            return pesoA - pesoB;
        }
        // Se forem do mesmo nível, ordena alfabeticamente por nome
        return a.nome.localeCompare(b.nome);
    });

    container.innerHTML = '';
    
    filtradas.forEach(magia => {
        const isFav = favoritos.includes(magia.id);
        const d1 = magia.dominios[0].toLowerCase();
        const d2 = magia.dominios[1] ? magia.dominios[1].toLowerCase() : d1;
        
        const card = document.createElement('div');
        card.className = 'spell-card';
        card.style.setProperty('--dom-color-1', coresDominios[d1] || "#555");
        card.style.setProperty('--dom-color-2', coresDominios[d2] || "#555");
        
        card.innerHTML = `
            <div class="spell-header" onclick="toggleExpand(this)">
                <div class="spell-info-basic">
                    <span class="spell-type-tag">${magia.tipo || 'Magia'}</span>
                    <h3>${magia.nome}</h3>
                    <div class="domains-list">${magia.dominios.join(' | ')}</div>
                </div>
                <button class="fav-btn ${isFav ? 'is-fav' : ''}" onclick="toggleFav(event, '${magia.id}')">
                    ${isFav ? '★' : '☆'}
                </button>
            </div>
            
            <div class="spell-content">
                <div class="stats-grid">
                    <div><span>Custo:</span><br><b>${magia.custo}</b></div>
                    <div><span>Alcance:</span><br><b>${magia.alcance}</b></div>
                    <div style="grid-column: span 2"><span>Duração:</span><br><b>${magia.duracao}</b></div>
                </div>
                
                <div class="effect-text">${magia.efeito}</div>

                ${renderUpgrade(magia.pa_aprimoramento, "PA")}
                ${renderUpgrade(magia.pm_aprimoramento, "PM")}
                
                ${magia.niveis_maiores ? `
                    <div class="upgrade-box">
                        <strong>Em níveis maiores:</strong>
                        ${magia.niveis_maiores}
                    </div>
                ` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

function renderUpgrade(data, label) {
    if (!data) return '';
    return `
        <div class="upgrade-box">
            <strong>${data.nome} (+${data.custo}${label}):</strong>
            ${data.efeito}
        </div>
    `;
}

window.toggleExpand = (header) => header.parentElement.classList.toggle('expanded');

window.toggleFav = (event, id) => {
    event.stopPropagation();
    favoritos = favoritos.includes(id) ? favoritos.filter(f => f !== id) : [...favoritos, id];
    localStorage.setItem('tramapedia_favs', JSON.stringify(favoritos));
    render();
};

// Event Listeners
searchInput.addEventListener('input', render);
domainFilter.addEventListener('change', render);
levelFilter.addEventListener('change', render); // Escuta o filtro de nível
btnFavs.addEventListener('click', () => {
    btnFavs.classList.toggle('active');
    btnFavs.innerText = btnFavs.classList.contains('active') ? "Ver Todas" : "Ver Favoritos";
    render();
});

init();