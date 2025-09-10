let ncmDatabase = [];
let currentIndex = 0;
const PAGE_SIZE = 30;
let filteredResults = [];
let showingSearch = false;
let isLoading = false;

// Elementos da DOM
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const clearSearch = document.getElementById('clearSearch');
const resultsContainer = document.getElementById('results');
const loadingResults = document.getElementById('loadingResults');
const modal = document.getElementById('ncmModal');
const helpModal = document.getElementById('helpModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.getElementsByClassName('close')[0];
const advancedSearchToggle = document.getElementById('advancedSearchToggle');
const advancedSearchContainer = document.getElementById('advancedSearchContainer');
const totalNcmsElement = document.getElementById('totalNcms');
const lastUpdateElement = document.getElementById('lastUpdate');
const resultCountElement = document.getElementById('resultCount');
const exportResultsButton = document.getElementById('exportResults');
const openHelpButton = document.getElementById('openHelp');
const openAboutButton = document.getElementById('openAbout');
const toast = document.getElementById('toast');

// Filtros
const filterNational = document.getElementById('filterNational');
const filterImport = document.getElementById('filterImport');

// Carregar JSON
fetch('./src/assets/json/tabelaNCM.json')
  .then(res => res.json())
  .then(data => {
    ncmDatabase = data.ncmImpostoAproximado;
    totalNcmsElement.textContent = ncmDatabase.length.toLocaleString('pt-BR');
    lastUpdateElement.textContent = new Date().toLocaleDateString('pt-BR');
    loadMoreResults();
  })
  .catch(err => {
    console.error("Erro ao carregar JSON:", err);
    showToast('Erro ao carregar base de dados', 'error');
  });

// Função para carregar mais resultados
function loadMoreResults() {
  if (isLoading) return;
  
  const dataToRender = showingSearch ? filteredResults : ncmDatabase;
  
  if (currentIndex >= dataToRender.length) {
    loadingResults.classList.remove('show');
    return;
  }
  
  isLoading = true;
  loadingResults.classList.add('show');
  
  setTimeout(() => {
    const nextItems = dataToRender.slice(currentIndex, currentIndex + PAGE_SIZE);
    currentIndex += PAGE_SIZE;
    
    displayResults(nextItems, true);
    isLoading = false;
    
    if (currentIndex >= dataToRender.length) {
      loadingResults.classList.remove('show');
    }
  }, 300);
}

// Função para realizar a busca
function performSearch() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const searchType = document.querySelector('input[name="searchType"]:checked').value;
  const nationalFilter = filterNational.value;
  const importFilter = filterImport.value;
  
  resultsContainer.innerHTML = '';
  currentIndex = 0;
  showingSearch = true;
  
  if (searchTerm === '' && nationalFilter === '' && importFilter === '') {
    showingSearch = false;
    resultCountElement.textContent = ncmDatabase.length.toLocaleString('pt-BR');
    loadMoreResults();
    return;
  }
  
  filteredResults = ncmDatabase.filter(item => {
    // Filtro por texto
    let textMatch = false;
    if (searchTerm === '') {
      textMatch = true;
    } else if (searchType === 'code') {
      textMatch = item.codigo.toLowerCase().includes(searchTerm);
    } else if (searchType === 'start') {
      textMatch = item.descricao.toLowerCase().startsWith(searchTerm);
    } else {
      textMatch = (
        item.descricao.toLowerCase().includes(searchTerm) ||
        item.codigo.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filtro por impostos
    const nationalMatch = nationalFilter === '' || item.aliquotaNacional == nationalFilter;
    const importMatch = importFilter === '' || item.aliquotaImportada == importFilter;
    
    return textMatch && nationalMatch && importMatch;
  });
  
  resultCountElement.textContent = filteredResults.length.toLocaleString('pt-BR');
  
  if (filteredResults.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <h3>Nenhum resultado encontrado</h3>
        <p>Tente alterar os termos de busca ou os filtros aplicados.</p>
      </div>
    `;
    loadingResults.classList.remove('show');
    return;
  }
  
  loadMoreResults();
}

// Função para exibir resultados
function displayResults(results, append = false) {
  if (!append) resultsContainer.innerHTML = '';
  
  results.forEach(item => {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    resultItem.dataset.item = JSON.stringify(item);
    
    // Estrutura principal
    resultItem.innerHTML = `
      <div class="col-code">${formatNCMCode(item.codigo)}</div>
      <div class="col-desc">${item.descricao}</div>
      <div class="col-tax">
        <span class="tax-badge national">NAC: ${item.aliquotaNacional}%</span>
        <span class="tax-badge import">IMP: ${item.aliquotaImportada}%</span>
      </div>
      <div class="col-actions">
        <button class="action-btn view-btn" title="Ver detalhes">
          <i class="fas fa-eye"></i>
        </button>
        <button class="action-btn copy-btn" title="Copiar código">
          <i class="fas fa-copy"></i>
        </button>
      </div>
    `;
    
    // Evento para abrir modal
    const viewBtn = resultItem.querySelector('.view-btn');
    viewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(item);
    });
    
    // Evento para copiar código
    const copyBtn = resultItem.querySelector('.copy-btn');
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyNcmCode(item.codigo, copyBtn);
    });
    
    // Evento para clicar no item
    resultItem.addEventListener('click', () => {
      openModal(item);
    });
    
    resultsContainer.appendChild(resultItem);
  });
}

// Função para abrir modal com detalhes
function openModal(item) {
  modalTitle.textContent = `NCM ${formatNCMCode(item.codigo)}`;
  
  modalBody.innerHTML = `
    <div class="info-item">
      <div class="info-label">Descrição</div>
      <div class="info-value">${item.descricao}</div>
    </div>
    
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Alíquota Nacional</div>
        <div class="info-value tax-value">${item.aliquotaNacional}%</div>
      </div>
      <div class="info-item">
        <div class="info-label">Alíquota Importação</div>
        <div class="info-value tax-value">${item.aliquotaImportada}%</div>
      </div>
      <div class="info-item">
        <div class="info-label">Alíquota Estadual</div>
        <div class="info-value tax-value">${item.aliquotaEstadual}%</div>
      </div>
      <div class="info-item">
        <div class="info-label">Alíquota Municipal</div>
        <div class="info-value tax-value">${item.aliquotaMunicipal}%</div>
      </div>
      <div class="info-item">
        <div class="info-label">Vigência Início</div>
        <div class="info-value date-value">${formatDate(item.dataVigenciaInicio)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Vigência Fim</div>
        <div class="info-value date-value">${formatDate(item.dataVigenciaFim)}</div>
      </div>
    </div>
    
    <div class="info-item">
      <div class="info-label">Código Completo</div>
      <div class="info-value">${item.codigo}</div>
    </div>
    
    <div class="info-item">
      <div class="info-label">Exceção</div>
      <div class="info-value">${item.excecao || 'Nenhuma'}</div>
    </div>
    
    <div class="info-item">
      <div class="info-label">Tipo</div>
      <div class="info-value">${item.tipo || 'Não especificado'}</div>
    </div>
    
    <button id="modalCopyBtn" class="primary-btn">
      <i class="fas fa-copy"></i> Copiar Código NCM
    </button>
  `;
  
  const modalCopyBtn = document.getElementById("modalCopyBtn");
  modalCopyBtn.addEventListener('click', () => {
    copyNcmCode(item.codigo);
  });
  
  modal.style.display = 'block';
}

// Função para exportar resultados
function exportToCSV() {
  const dataToExport = showingSearch ? filteredResults : ncmDatabase;
  
  if (dataToExport.length === 0) {
    showToast('Nenhum dado para exportar', 'error');
    return;
  }
  
  // Criar cabeçalho CSV
  let csvContent = "Código NCM;Descrição;Alíquota Nacional;Alíquota Importação;Alíquota Estadual;Alíquota Municipal;Vigência Início;Vigência Fim\n";
  
  // Adicionar dados
  dataToExport.forEach(item => {
    csvContent += `"${formatNCMCode(item.codigo)}";"${item.descricao}";${item.aliquotaNacional};${item.aliquotaImportada};${item.aliquotaEstadual};${item.aliquotaMunicipal};${item.dataVigenciaInicio};${item.dataVigenciaFim}\n`;
  });
  
  // Criar blob e fazer download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `ncmfinder_export_${date}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast('Exportação concluída com sucesso');
}

// Event Listeners
searchButton.addEventListener('click', performSearch);

searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') performSearch();
});

clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  searchInput.focus();
  performSearch();
});

filterNational.addEventListener('change', performSearch);
filterImport.addEventListener('change', performSearch);

advancedSearchToggle.addEventListener('click', () => {
  advancedSearchContainer.classList.toggle('show');
  
  if (advancedSearchContainer.classList.contains('show')) {
    advancedSearchToggle.innerHTML = '<i class="fas fa-times"></i>';
    advancedSearchToggle.setAttribute('title', 'Fechar busca avançada');
  } else {
    advancedSearchToggle.innerHTML = '<i class="fas fa-sliders-h"></i>';
    advancedSearchToggle.setAttribute('title', 'Busca avançada');
  }
});

exportResultsButton.addEventListener('click', exportToCSV);

openHelpButton.addEventListener('click', (e) => {
  e.preventDefault();
  helpModal.style.display = 'block';
});

openAboutButton.addEventListener('click', (e) => {
  e.preventDefault();
  showToast('NCM Finder v1.0.0 - Sistema de consulta de códigos NCM');
});

// Fechar o modal quando clicar no X
document.querySelectorAll('.close').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal').style.display = 'none';
  });
});

// Fechar o modal quando clicar fora dele
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
  if (event.target === helpModal) {
    helpModal.style.display = 'none';
  }
});

// Detectar scroll para carregar mais
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    loadMoreResults();
  }
});

// Botão voltar ao topo
const backToTopBtn = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    backToTopBtn.style.display = "flex";
  } else {
    backToTopBtn.style.display = "none";
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    searchInput.focus();
    initTheme(); // Inicializar o tema
    
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('q');
    
    if (searchParam) {
        searchInput.value = searchParam;
        performSearch();
    }
});