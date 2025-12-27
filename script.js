let magias = [];
let favoritos = JSON.parse(localStorage.getItem('tramapedia_favs')) || [];

const container = document.getElementById('spellContainer');
const searchInput = document.getElementById('searchBar');
const domainFilter = document.getElementById('domainFilter');
const btnFavs = document.getElementById('btnFavorites');

// Carregar Dados
async function init() {
    try {
        const response = await fetch('magias.json');
        magias = await response.json();
        render();
    } catch (err) {
        container.innerHTML = "<p>Erro ao carregar banco de dados.</p>";
    }
}

function render() {
    const term = searchInput.value.toLowerCase();
    const domain = domainFilter.value;
    const onlyFavs = btnFavs.classList.contains('active');

    const filtradas = magias.filter(m => {
        const matchNome = m.nome.toLowerCase().includes(term);
        const matchDom = domain === 'todos' || m.dominios.some(d => d.toLowerCase() === domain);
        const matchFav = onlyFavs ? favoritos.includes(m.id) : true;
        return matchNome && matchDom && matchFav;
    });

    container.innerHTML = '';
    
    filtradas.forEach(magia => {
        const isFav = favoritos.includes(magia.id);
        const domPrincipal = magia.dominios[0].toLowerCase();
        
        const card = document.createElement('div');
        card.className = 'spell-card';
        card.setAttribute('data-domain', domPrincipal);
        
        card.innerHTML = `
            <div class="spell-header" onclick="toggleExpand(this)">
                <div class="spell-info-basic">
                    <h3>${magia.nome}</h3>
                    <div class="domains-list">${magia.dominios.join(' | ')}</div>
                </div>
                <button class="fav-btn ${isFav ? 'is-fav' : ''}" onclick="toggleFav(event, '${magia.id}')">
                    ${isFav ? '★' : '☆'}
                </button>
            </div>
            
            <div class="spell-content">
                <div class="stats-row">
                    <span><strong>Custo:</strong> ${magia.custo}</span>
                    <span><strong>Alcance:</strong> ${magia.alcance}</span>
                    <span><strong>Duração:</strong> ${magia.duracao}</span>
                </div>
                
                <div class="effect-text">${magia.efeito}</div>

                ${magia.pa_aprimoramento ? `
                    <div class="upgrade-box">
                        <strong>${magia.pa_aprimoramento.nome} (+${magia.pa_aprimoramento.custo} PA):</strong>
                        ${magia.pa_aprimoramento.efeito}
                    </div>
                ` : ''}

                ${magia.pm_aprimoramento ? `
                    <div class="upgrade-box">
                        <strong>${magia.pm_aprimoramento.nome} (+${magia.pm_aprimoramento.custo} PM):</strong>
                        ${magia.pm_aprimoramento.efeito}
                    </div>
                ` : ''}

                ${magia.niveis_maiores ? `
                    <div class="upgrade-box">
                        <strong>Em níveis maiores:</strong> ${magia.niveis_maiores}
                    </div>
                ` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// Alternar Expansão
window.toggleExpand = (headerElement) => {
    const card = headerElement.parentElement;
    card.classList.toggle('expanded');
};

// Gerenciar Favoritos
window.toggleFav = (event, id) => {
    event.stopPropagation(); // Impede que o clique no favorito abra/feche o card
    if (favoritos.includes(id)) {
        favoritos = favoritos.filter(f => f !== id);
    } else {
        favoritos.push(id);
    }
    localStorage.setItem('tramapedia_favs', JSON.stringify(favoritos));
    render();
};

// Eventos de Filtro
searchInput.addEventListener('input', render);
domainFilter.addEventListener('change', render);
btnFavs.addEventListener('click', () => {
    btnFavs.classList.toggle('active');
    btnFavs.innerText = btnFavs.classList.contains('active') ? "Ver Todas" : "Ver Favoritos";
    render();
});

init();