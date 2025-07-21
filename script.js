// Dados iniciais dos torneios baseados na imagem fornecida
let tournaments = [
    // Segunda-feira (Seg)
    { id: 101, time: '12:30', name: 'TG $33 Mystery', site: 'TigerGaming', buyin: '$1k', guarantee: '$1k', color: 'default', daysOfWeek: ['Segunda'], registered: false },
    { id: 102, time: '13:00', name: 'PP $11 deepstack', site: 'PartyPoker', buyin: '$3k', guarantee: '$3k', color: 'default', daysOfWeek: ['Segunda'], registered: false },
    { id: 103, time: '13:00', name: 'GGmaster $25k', site: 'GGPoker', buyin: '$100k', guarantee: '$100k', color: 'default', daysOfWeek: ['Segunda'], registered: false },
    { id: 104, time: '13:00', name: 'BH Special $15', site: 'PokerStars', buyin: '$50k', guarantee: '$50k', color: 'default', daysOfWeek: ['Segunda'], registered: false },
    { id: 105, time: '13:00', name: 'Eliminator $30', site: 'PokerStars', buyin: '$17K', guarantee: '$17K', color: 'yellow', daysOfWeek: ['Segunda'], registered: false },
    { id: 106, time: '13:00', name: 'BB $27', site: 'PokerStars', buyin: '$30k', guarantee: '$30k', color: 'red', daysOfWeek: ['Segunda'], registered: false },
    { id: 107, time: '13:00', name: 'BB $11', site: 'PokerStars', buyin: '$15k', guarantee: '$15k', color: 'red', daysOfWeek: ['Segunda'], registered: false },
    { id: 108, time: '13:00', name: 'Ipoker Super XL 25', site: 'TigerGaming', buyin: '$11k', guarantee: '$11k', color: 'yellow', daysOfWeek: ['Segunda'], registered: false },
    { id: 109, time: '13:00', name: 'PP Terminator $11', site: 'PartyPoker', buyin: '$5K', guarantee: '$5K', color: 'default', daysOfWeek: ['Segunda'], registered: false },
    { id: 110, time: '13:00', name: 'Daily $10', site: 'GGPoker', buyin: '$17k', guarantee: '$17k', color: 'default', daysOfWeek: ['Segunda'], registered: false }
];

// Variáveis globais
let currentEditingId = null;
let nextId = Math.max(...tournaments.map(t => t.id)) + 1;
let currentFilterDay = 'all';
let currentFilterSite = 'all';
let savedSessions = [];
let currentTab = 'tournaments';
let highlightPastTimes = false;
let pastTimeInterval = null;

// Elementos DOM
const themeToggle = document.getElementById('theme-toggle');
const addTournamentBtn = document.getElementById('add-tournament');
const modal = document.getElementById('tournament-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const tournamentForm = document.getElementById('tournament-form');
const tournamentsList = document.getElementById('tournaments-list');
const modalTitle = document.getElementById('modal-title');
const dayFilterContainer = document.querySelector('.day-filter-container');
const siteFilter = document.getElementById('site-filter');
const copyScheduleBtn = document.getElementById('copy-schedule');
const saveSessionBtn = document.getElementById('save-session');
const selectAllCheckbox = document.getElementById('select-all-tournaments');
const exportAllBtn = document.getElementById('export-all');
const exportDayBtn = document.getElementById('export-day');
const notesBtn = document.getElementById('notes-btn');
const highlightPastBtn = document.getElementById('highlight-past-btn');
const playerNickname = document.getElementById('player-nickname');
const playerTeam = document.getElementById('player-team');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    loadTournaments();
    loadSavedSessions();
    loadPlayerInfo();
    loadNotes();
    loadHighlightPastSetting();
    renderTournaments();
    setupEventListeners();
    setupTabs();
    updateStatistics();
});

// Configurar event listeners
function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    addTournamentBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    tournamentForm.addEventListener('submit', handleFormSubmit);
    copyScheduleBtn.addEventListener('click', openCopyScheduleModal);
    saveSessionBtn.addEventListener('click', openSaveSessionModal);
    selectAllCheckbox.addEventListener('change', handleSelectAll);
    exportAllBtn.addEventListener('click', exportAllTournaments);
    exportDayBtn.addEventListener('click', openExportDayModal);
    notesBtn.addEventListener('click', openNotesModal);
    highlightPastBtn.addEventListener('click', toggleHighlightPastTimes);
    
    // Event listeners para campos de jogador
    playerNickname.addEventListener('input', savePlayerInfo);
    playerTeam.addEventListener('input', savePlayerInfo);
    
    // Event listeners para os botões de filtro de dia
    dayFilterContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('day-filter-btn')) {
            const day = e.target.dataset.day;
            filterTournamentsByDay(day);
        }
    });

    // Event listener para filtro de site
    siteFilter.addEventListener('change', function(e) {
        currentFilterSite = e.target.value;
        renderTournaments();
    });

    // Fechar modal clicando fora dele
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });

    // Upload de PDF
    const uploadBtn = document.getElementById('upload-btn');
    const pdfUpload = document.getElementById('pdf-upload');
    
    if (uploadBtn && pdfUpload) {
        uploadBtn.addEventListener('click', () => pdfUpload.click());
        pdfUpload.addEventListener('change', handlePDFUpload);
    }

    // Formulário de copiar grade
    const copyScheduleForm = document.getElementById('copy-schedule-form');
    if (copyScheduleForm) {
        copyScheduleForm.addEventListener('submit', handleCopySchedule);
    }

    // Formulário de salvar sessão
    const saveSessionForm = document.getElementById('save-session-form');
    if (saveSessionForm) {
        saveSessionForm.addEventListener('submit', handleSaveSession);
    }

    // Formulário de exportar dia específico
    const exportDayForm = document.getElementById('export-day-form');
    if (exportDayForm) {
        exportDayForm.addEventListener('submit', handleExportDay);
    }
}

// Sistema de Abas
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Remover classe active de todas as abas
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Adicionar classe active na aba clicada
            this.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
            
            currentTab = targetTab;
            
            // Atualizar conteúdo específico da aba
            if (targetTab === 'statistics') {
                updateStatistics();
            } else if (targetTab === 'sessions') {
                renderSavedSessions();
            }
        });
    });
}

// Gerenciamento de tema
function loadTheme() {
    const savedTheme = localStorage.getItem('poker-theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.removeAttribute('data-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.body.removeAttribute('data-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('poker-theme', 'light');
    } else {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('poker-theme', 'dark');
    }
}

// Funcionalidades do Cassio - Campos de Jogador
function loadPlayerInfo() {
    const savedNickname = localStorage.getItem('poker-player-nickname') || '';
    const savedTeam = localStorage.getItem('poker-player-team') || '';
    
    playerNickname.value = savedNickname;
    playerTeam.value = savedTeam;
}

function savePlayerInfo() {
    localStorage.setItem('poker-player-nickname', playerNickname.value);
    localStorage.setItem('poker-player-team', playerTeam.value);
}

// Funcionalidades do Cassio - Sistema de Anotações
function openNotesModal() {
    document.getElementById('notes-modal').classList.add('show');
    document.getElementById('notes-textarea').focus();
}

function closeNotesModal() {
    document.getElementById('notes-modal').classList.remove('show');
}

function loadNotes() {
    const savedNotes = localStorage.getItem('poker-notes') || '';
    const notesTextarea = document.getElementById('notes-textarea');
    if (notesTextarea) {
        notesTextarea.value = savedNotes;
    }
    
    // Event listeners para botões de anotações
    const saveNotesBtn = document.getElementById('save-notes-btn');
    const clearNotesBtn = document.getElementById('clear-notes-btn');
    
    if (saveNotesBtn) {
        saveNotesBtn.addEventListener('click', saveNotes);
    }
    
    if (clearNotesBtn) {
        clearNotesBtn.addEventListener('click', clearNotes);
    }
}

function saveNotes() {
    const notesTextarea = document.getElementById('notes-textarea');
    localStorage.setItem('poker-notes', notesTextarea.value);
    showNotification('Anotações salvas com sucesso!', 'success');
}

function clearNotes() {
    if (confirm('Tem certeza que deseja limpar todas as anotações?')) {
        const notesTextarea = document.getElementById('notes-textarea');
        notesTextarea.value = '';
        localStorage.removeItem('poker-notes');
        showNotification('Anotações limpas!', 'success');
    }
}

// Funcionalidades do Cassio - Destaque de Horários Passados
function loadHighlightPastSetting() {
    const saved = localStorage.getItem('poker-highlight-past') === 'true';
    highlightPastTimes = saved;
    updateHighlightPastButton();
    
    if (highlightPastTimes) {
        startPastTimeHighlight();
    }
}

function toggleHighlightPastTimes() {
    highlightPastTimes = !highlightPastTimes;
    localStorage.setItem('poker-highlight-past', highlightPastTimes.toString());
    updateHighlightPastButton();
    
    if (highlightPastTimes) {
        startPastTimeHighlight();
    } else {
        stopPastTimeHighlight();
    }
    
    renderTournaments();
}

function updateHighlightPastButton() {
    if (highlightPastTimes) {
        highlightPastBtn.classList.add('active');
        highlightPastBtn.innerHTML = '<i class="fas fa-clock"></i>';
    } else {
        highlightPastBtn.classList.remove('active');
        highlightPastBtn.innerHTML = '<i class="fas fa-clock"></i>';
    }
}

function startPastTimeHighlight() {
    // Atualizar a cada minuto
    pastTimeInterval = setInterval(() => {
        renderTournaments();
    }, 60000);
}

function stopPastTimeHighlight() {
    if (pastTimeInterval) {
        clearInterval(pastTimeInterval);
        pastTimeInterval = null;
    }
}

function isPastTime(timeString) {
    if (!highlightPastTimes) return false;
    
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    const tournamentTime = new Date();
    tournamentTime.setHours(hours, minutes, 0, 0);
    
    return now > tournamentTime;
}

// Renderização dos torneios
function renderTournaments() {
    let filteredTournaments = tournaments;

    if (currentFilterDay !== 'all') {
        filteredTournaments = filteredTournaments.filter(t => t.daysOfWeek.includes(currentFilterDay));
    }

    if (currentFilterSite !== 'all') {
        filteredTournaments = filteredTournaments.filter(t => t.site === currentFilterSite);
    }

    if (filteredTournaments.length === 0) {
        tournamentsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>Nenhum torneio encontrado</h3>
                <p>Clique em "Adicionar Torneio" para começar ou ajuste os filtros.</p>
            </div>
        `;
        return;
    }

    // Ordenar torneios por horário
    const sortedTournaments = [...filteredTournaments].sort((a, b) => {
        return a.time.localeCompare(b.time);
    });

    let html = '';
    
    sortedTournaments.forEach((tournament, index) => {
        const pastTimeClass = isPastTime(tournament.time) ? 'past-time' : '';
        
        html += `
        <div class="tournament-item ${tournament.registered ? 'registered' : ''} ${pastTimeClass}" data-id="${tournament.id}">
            <div>
                <input type="checkbox" class="tournament-checkbox" data-id="${tournament.id}" ${tournament.registered ? 'checked' : ''} onchange="toggleTournamentRegistration(${tournament.id})">
            </div>
            <div class="tournament-time">${tournament.time}</div>
            <div class="tournament-info">
                <div class="move-buttons">
                    <button class="move-btn move-up" onclick="moveTournament(${tournament.id}, -1)" ${index === 0 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-up"></i>
                    </button>
                    <button class="move-btn move-down" onclick="moveTournament(${tournament.id}, 1)" ${index === sortedTournaments.length - 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <span class="tournament-name ${tournament.color}">${tournament.name}</span>
            </div>
            <div class="tournament-site">${tournament.site}</div>
            <div class="tournament-buyin">${tournament.buyin}</div>
            <div class="tournament-guarantee">${tournament.guarantee}</div>
            <div class="tournament-actions">
                <button class="edit-btn" onclick="editTournament(${tournament.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteTournament(${tournament.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        `;
    });
    
    tournamentsList.innerHTML = html;
    updateSelectAllCheckbox();
}

// Gerenciamento de filtro por dia
function filterTournamentsByDay(day) {
    currentFilterDay = day;
    // Atualizar estado ativo dos botões de filtro
    document.querySelectorAll('.day-filter-btn').forEach(btn => {
        if (btn.dataset.day === day) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    renderTournaments();
}

// Checkbox de registro
function toggleTournamentRegistration(id) {
    const tournament = tournaments.find(t => t.id === id);
    if (tournament) {
        tournament.registered = !tournament.registered;
        renderTournaments();
        saveTournaments();
        updateStatistics();
    }
}

function handleSelectAll() {
    const isChecked = selectAllCheckbox.checked;
    let filteredTournaments = tournaments;

    if (currentFilterDay !== 'all') {
        filteredTournaments = filteredTournaments.filter(t => t.daysOfWeek.includes(currentFilterDay));
    }

    if (currentFilterSite !== 'all') {
        filteredTournaments = filteredTournaments.filter(t => t.site === currentFilterSite);
    }

    filteredTournaments.forEach(tournament => {
        tournament.registered = isChecked;
    });

    renderTournaments();
    saveTournaments();
    updateStatistics();
}

function updateSelectAllCheckbox() {
    let filteredTournaments = tournaments;

    if (currentFilterDay !== 'all') {
        filteredTournaments = filteredTournaments.filter(t => t.daysOfWeek.includes(currentFilterDay));
    }

    if (currentFilterSite !== 'all') {
        filteredTournaments = filteredTournaments.filter(t => t.site === currentFilterSite);
    }

    if (filteredTournaments.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        return;
    }

    const registeredCount = filteredTournaments.filter(t => t.registered).length;
    
    if (registeredCount === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (registeredCount === filteredTournaments.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

// Movimentação de torneios
function moveTournament(id, direction) {
    const index = tournaments.findIndex(t => t.id === id);
    if (index === -1) return;

    const newIndex = index + direction;

    if (newIndex >= 0 && newIndex < tournaments.length) {
        const [movedTournament] = tournaments.splice(index, 1);
        tournaments.splice(newIndex, 0, movedTournament);
        renderTournaments();
        saveTournaments();
    }
}

// Modal management
function openAddModal() {
    currentEditingId = null;
    modalTitle.textContent = 'Adicionar Torneio';
    resetForm();
    modal.classList.add('show');
    const tournamentTimeInput = document.getElementById('tournament-time');
    if (tournamentTimeInput) {
        tournamentTimeInput.focus();
    }
}

function openEditModal(tournament) {
    currentEditingId = tournament.id;
    modalTitle.textContent = 'Editar Torneio';
    
    // Preencher formulário com dados do torneio
    document.getElementById('tournament-time').value = tournament.time;
    document.getElementById('tournament-name').value = tournament.name;
    document.getElementById('tournament-site').value = tournament.site || '';
    document.getElementById('tournament-buyin').value = tournament.buyin;
    document.getElementById('tournament-guarantee').value = tournament.guarantee;
    
    // Preencher checkboxes de dias da semana
    document.querySelectorAll('input[name="tournament-day"]').forEach(checkbox => {
        checkbox.checked = tournament.daysOfWeek.includes(checkbox.value);
    });
    
    // Selecionar cor
    const colorRadio = document.querySelector(`input[name="tournament-color"][value="${tournament.color}"]`);
    if (colorRadio) {
        colorRadio.checked = true;
    }
    
    modal.classList.add('show');
    document.getElementById('tournament-name').focus();
}

function closeModal() {
    modal.classList.remove('show');
    resetForm();
    currentEditingId = null;
}

function resetForm() {
    tournamentForm.reset();
    document.getElementById('color-default').checked = true;
    // Desmarcar todos os checkboxes de dias da semana
    document.querySelectorAll('input[name="tournament-day"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}

// CRUD Operations
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(tournamentForm);
    const daysOfWeek = [];
    document.querySelectorAll('input[name="tournament-day"]:checked').forEach(checkbox => {
        daysOfWeek.push(checkbox.value);
    });

    const tournamentData = {
        time: formData.get('tournament-time') || document.getElementById('tournament-time').value,
        name: formData.get('tournament-name') || document.getElementById('tournament-name').value,
        site: formData.get('tournament-site') || document.getElementById('tournament-site').value,
        buyin: formData.get('tournament-buyin') || document.getElementById('tournament-buyin').value,
        guarantee: formData.get('tournament-guarantee') || document.getElementById('tournament-guarantee').value,
        color: formData.get('tournament-color') || 'default',
        daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : ['Domingo'],
        registered: false
    };
    
    // Validação básica
    if (!tournamentData.time || !tournamentData.name || !tournamentData.site || !tournamentData.buyin || !tournamentData.guarantee || tournamentData.daysOfWeek.length === 0) {
        alert('Por favor, preencha todos os campos obrigatórios e selecione pelo menos um dia da semana.');
        return;
    }
    
    if (currentEditingId) {
        updateTournament(currentEditingId, tournamentData);
    } else {
        addTournament(tournamentData);
    }
    
    closeModal();
}

function addTournament(data) {
    const newTournament = {
        id: nextId++,
        ...data
    };
    
    tournaments.push(newTournament);
    renderTournaments();
    saveTournaments();
    updateStatistics();
    
    // Mostrar feedback visual
    showNotification('Torneio adicionado com sucesso!', 'success');
}

function editTournament(id) {
    const tournament = tournaments.find(t => t.id === id);
    if (tournament) {
        openEditModal(tournament);
    }
}

function updateTournament(id, data) {
    const index = tournaments.findIndex(t => t.id === id);
    if (index !== -1) {
        tournaments[index] = { ...tournaments[index], ...data };
        renderTournaments();
        saveTournaments();
        updateStatistics();
        showNotification('Torneio atualizado com sucesso!', 'success');
    }
}

function deleteTournament(id) {
    const tournament = tournaments.find(t => t.id === id);
    if (!tournament) return;
    
    if (confirm(`Tem certeza que deseja excluir o torneio "${tournament.name}"?`)) {
        tournaments = tournaments.filter(t => t.id !== id);
        renderTournaments();
        saveTournaments();
        updateStatistics();
        showNotification('Torneio excluído com sucesso!', 'success');
    }
}

// Copiar Grade
function openCopyScheduleModal() {
    document.getElementById('copy-schedule-modal').classList.add('show');
}

function closeCopyScheduleModal() {
    document.getElementById('copy-schedule-modal').classList.remove('show');
    document.getElementById('copy-schedule-form').reset();
}

function handleCopySchedule(e) {
    e.preventDefault();
    
    const sourceDay = document.getElementById('source-day').value;
    const targetDay = document.getElementById('target-day').value;
    
    if (!sourceDay || !targetDay) {
        alert('Por favor, selecione os dias de origem e destino.');
        return;
    }
    
    if (sourceDay === targetDay) {
        alert('O dia de origem deve ser diferente do dia de destino.');
        return;
    }
    
    // Buscar torneios do dia de origem
    const sourceTournaments = tournaments.filter(t => t.daysOfWeek.includes(sourceDay));
    
    if (sourceTournaments.length === 0) {
        alert(`Não há torneios cadastrados para ${sourceDay}-feira.`);
        return;
    }
    
    // Confirmar ação
    if (!confirm(`Isso irá copiar ${sourceTournaments.length} torneios de ${sourceDay}-feira para ${targetDay}-feira. Continuar?`)) {
        return;
    }
    
    // Copiar torneios
    sourceTournaments.forEach(tournament => {
        const newTournament = {
            ...tournament,
            id: nextId++,
            daysOfWeek: [targetDay],
            registered: false
        };
        tournaments.push(newTournament);
    });
    
    renderTournaments();
    saveTournaments();
    updateStatistics();
    closeCopyScheduleModal();
    showNotification(`${sourceTournaments.length} torneios copiados com sucesso!`, 'success');
}

// Sessões Salvas
function openSaveSessionModal() {
    const selectedTournaments = getSelectedTournaments();
    
    if (selectedTournaments.length === 0) {
        alert('Selecione pelo menos um torneio para salvar a sessão.');
        return;
    }
    
    // Mostrar preview dos torneios selecionados
    const preview = document.getElementById('selected-tournaments-preview');
    preview.innerHTML = selectedTournaments.map(t => 
        `<div class="selected-tournament-item">${t.time} - ${t.name} (${t.site})</div>`
    ).join('');
    
    document.getElementById('save-session-modal').classList.add('show');
}

function closeSaveSessionModal() {
    document.getElementById('save-session-modal').classList.remove('show');
    document.getElementById('save-session-form').reset();
}

function handleSaveSession(e) {
    e.preventDefault();
    
    const sessionName = document.getElementById('session-name').value;
    const selectedTournaments = getSelectedTournaments();
    
    if (!sessionName) {
        alert('Por favor, digite um nome para a sessão.');
        return;
    }
    
    if (selectedTournaments.length === 0) {
        alert('Selecione pelo menos um torneio para salvar a sessão.');
        return;
    }
    
    const session = {
        id: Date.now(),
        name: sessionName,
        tournamentIds: selectedTournaments.map(t => t.id),
        createdAt: new Date().toISOString()
    };
    
    savedSessions.push(session);
    saveSessions();
    closeSaveSessionModal();
    showNotification('Sessão salva com sucesso!', 'success');
    
    if (currentTab === 'sessions') {
        renderSavedSessions();
    }
}

function getSelectedTournaments() {
    return tournaments.filter(t => {
        const checkbox = document.querySelector(`input[data-id="${t.id}"]`);
        return checkbox && checkbox.checked;
    });
}

function renderSavedSessions() {
    const sessionsList = document.getElementById('sessions-list');
    
    if (savedSessions.length === 0) {
        sessionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bookmark"></i>
                <h3>Nenhuma sessão salva</h3>
                <p>Selecione torneios na grade e clique em "Salvar Sessão" para começar.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    savedSessions.forEach(session => {
        const sessionTournaments = tournaments.filter(t => session.tournamentIds.includes(t.id));
        html += `
            <div class="session-item">
                <div class="session-header">
                    <div class="session-name">${session.name}</div>
                    <div class="session-actions">
                        <button class="load-session-btn" onclick="loadSession(${session.id})">
                            <i class="fas fa-play"></i> Carregar
                        </button>
                        <button class="delete-session-btn" onclick="deleteSession(${session.id})">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
                <div class="session-tournaments">
                    ${sessionTournaments.length} torneios: ${sessionTournaments.map(t => t.name).join(', ')}
                </div>
            </div>
        `;
    });
    
    sessionsList.innerHTML = html;
}

function loadSession(sessionId) {
    const session = savedSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    // Desmarcar todos os checkboxes
    tournaments.forEach(t => t.registered = false);
    
    // Marcar apenas os torneios da sessão
    session.tournamentIds.forEach(id => {
        const tournament = tournaments.find(t => t.id === id);
        if (tournament) {
            tournament.registered = true;
        }
    });
    
    // Voltar para a aba de torneios
    document.querySelector('.tab-btn[data-tab="tournaments"]').click();
    
    renderTournaments();
    saveTournaments();
    updateStatistics();
    showNotification(`Sessão "${session.name}" carregada!`, 'success');
}

function deleteSession(sessionId) {
    const session = savedSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    if (confirm(`Tem certeza que deseja excluir a sessão "${session.name}"?`)) {
        savedSessions = savedSessions.filter(s => s.id !== sessionId);
        saveSessions();
        renderSavedSessions();
        showNotification('Sessão excluída com sucesso!', 'success');
    }
}

// Estatísticas
function updateStatistics() {
    const statisticsContent = document.getElementById('statistics-content');
    const days = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo'];
    const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    
    let html = `
        <table class="statistics-table">
            <thead>
                <tr>
                    <th>Dia</th>
                    <th>Torneios Totais</th>
                    <th>Buy-in Planejado</th>
                    <th>Buy-in Registrado</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    days.forEach((day, index) => {
        const dayTournaments = tournaments.filter(t => t.daysOfWeek.includes(day));
        const registeredTournaments = dayTournaments.filter(t => t.registered);
        
        const totalBuyin = calculateTotalBuyin(dayTournaments);
        const registeredBuyin = calculateTotalBuyin(registeredTournaments);
        
        html += `
            <tr>
                <td>${dayNames[index]}</td>
                <td>${dayTournaments.length}</td>
                <td>${totalBuyin}</td>
                <td>${registeredBuyin}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    statisticsContent.innerHTML = html;
}

function calculateTotalBuyin(tournaments) {
    let total = 0;
    tournaments.forEach(tournament => {
        const buyin = tournament.buyin.replace(/[^0-9.]/g, '');
        const value = parseFloat(buyin) || 0;
        total += value;
    });
    return `$${total.toFixed(0)}`;
}

// Upload de PDF
function handlePDFUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
        alert('Por favor, selecione um arquivo PDF.');
        return;
    }
    
    // Simular extração de texto (em um projeto real, usaria uma biblioteca como PDF.js)
    const extractedTextContainer = document.getElementById('extracted-text-container');
    const extractedTextArea = document.getElementById('extracted-text');
    
    // Texto de exemplo
    const sampleText = `Exemplo de texto extraído do PDF:

TORNEIOS DE POKER - SEGUNDA-FEIRA

13:00 - Daily $10 - PokerStars - $10 - $5k
14:00 - Big Game $25 - GGPoker - $25 - $10k
15:00 - Turbo $15 - PartyPoker - $15 - $3k
16:00 - Bounty $20 - TigerGaming - $20 - $8k

Você pode editar este texto e copiar as informações para criar novos torneios manualmente.`;
    
    extractedTextArea.value = sampleText;
    extractedTextContainer.style.display = 'block';
    
    showNotification('Texto extraído do PDF! Você pode editar e copiar as informações.', 'success');
}

// Persistência de dados
function saveTournaments() {
    localStorage.setItem('poker-tournaments', JSON.stringify(tournaments));
}

function loadTournaments() {
    const saved = localStorage.getItem('poker-tournaments');
    if (saved) {
        try {
            const parsedTournaments = JSON.parse(saved);
            if (Array.isArray(parsedTournaments) && parsedTournaments.length > 0) {
                tournaments = parsedTournaments.map(t => ({
                    ...t,
                    daysOfWeek: Array.isArray(t.daysOfWeek) ? t.daysOfWeek : (Array.isArray(t.dayOfWeek) ? t.dayOfWeek : (t.dayOfWeek ? [t.dayOfWeek] : ['Domingo'])),
                    site: t.site || 'PokerStars',
                    registered: t.registered || false
                }));
                nextId = Math.max(...tournaments.map(t => t.id)) + 1;
            }
        } catch (e) {
            console.error('Erro ao carregar torneios salvos:', e);
            localStorage.removeItem('poker-tournaments');
        }
    }
}

function saveSessions() {
    localStorage.setItem('poker-sessions', JSON.stringify(savedSessions));
}

function loadSavedSessions() {
    const saved = localStorage.getItem('poker-sessions');
    if (saved) {
        try {
            savedSessions = JSON.parse(saved);
        } catch (e) {
            console.error('Erro ao carregar sessões salvas:', e);
            savedSessions = [];
        }
    }
}

// Sistema de notificações
function showNotification(message, type = 'info') {
    // Remover notificação existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Adicionar estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--${type === 'success' ? 'success' : 'accent'}-color);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Adicionar estilos de animação para notificações
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Atalhos de teclado
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + N para adicionar novo torneio
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (currentTab === 'tournaments') {
            openAddModal();
        }
    }
    
    // Ctrl/Cmd + T para alternar tema
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        toggleTheme();
    }
});

// Função para limpar todos os torneios (útil para desenvolvimento)
function clearAllTournaments() {
    if (confirm('Tem certeza que deseja excluir TODOS os torneios? Esta ação não pode ser desfeita.')) {
        tournaments = [];
        renderTournaments();
        saveTournaments();
        updateStatistics();
        showNotification('Todos os torneios foram excluídos.', 'success');
    }
}

// Expor algumas funções globalmente para debug
window.pokerTournaments = {
    tournaments,
    savedSessions,
    clearAllTournaments,
    addTournament,
    deleteTournament,
    updateStatistics
};

// Funcionalidades de Exportação
function exportAllTournaments() {
    if (tournaments.length === 0) {
        alert('Não há torneios para exportar.');
        return;
    }
    
    // Criar menu de opções de formato
    const format = prompt('Escolha o formato de exportação:\n1 - CSV (Excel)\n2 - JSON\n3 - Texto\n\nDigite o número da opção:', '1');
    
    if (!format || !['1', '2', '3'].includes(format)) {
        return;
    }
    
    let exportData, filename, mimeType;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    switch (format) {
        case '1': // CSV
            exportData = exportToCSV(tournaments);
            filename = `grade_completa_${timestamp}.csv`;
            mimeType = 'text/csv';
            break;
        case '2': // JSON
            exportData = exportToJSON(tournaments);
            filename = `grade_completa_${timestamp}.json`;
            mimeType = 'application/json';
            break;
        case '3': // Texto
            exportData = exportToText(tournaments);
            filename = `grade_completa_${timestamp}.txt`;
            mimeType = 'text/plain';
            break;
    }
    
    downloadFile(exportData, filename, mimeType);
    showNotification(`Grade completa exportada com sucesso! (${tournaments.length} torneios)`, 'success');
}

function openExportDayModal() {
    document.getElementById('export-day-modal').classList.add('show');
}

function closeExportDayModal() {
    document.getElementById('export-day-modal').classList.remove('show');
    document.getElementById('export-day-form').reset();
}

function handleExportDay(e) {
    e.preventDefault();
    
    const selectedDay = document.getElementById('export-day-select').value;
    const format = document.getElementById('export-format').value;
    
    if (!selectedDay || !format) {
        alert('Por favor, selecione o dia e o formato de exportação.');
        return;
    }
    
    // Filtrar torneios do dia selecionado
    const dayTournaments = tournaments.filter(t => t.daysOfWeek.includes(selectedDay));
    
    if (dayTournaments.length === 0) {
        alert(`Não há torneios cadastrados para ${selectedDay}-feira.`);
        return;
    }
    
    let exportData, filename, mimeType;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const dayName = getDayName(selectedDay);
    
    switch (format) {
        case 'csv':
            exportData = exportToCSV(dayTournaments);
            filename = `grade_${selectedDay.toLowerCase()}_${timestamp}.csv`;
            mimeType = 'text/csv';
            break;
        case 'json':
            exportData = exportToJSON(dayTournaments);
            filename = `grade_${selectedDay.toLowerCase()}_${timestamp}.json`;
            mimeType = 'application/json';
            break;
        case 'txt':
            exportData = exportToText(dayTournaments);
            filename = `grade_${selectedDay.toLowerCase()}_${timestamp}.txt`;
            mimeType = 'text/plain';
            break;
    }
    
    downloadFile(exportData, filename, mimeType);
    closeExportDayModal();
    showNotification(`Grade de ${dayName} exportada com sucesso! (${dayTournaments.length} torneios)`, 'success');
}

function exportToCSV(tournamentsData) {
    const headers = ['Horário', 'Nome do Torneio', 'Site', 'Buy-in', 'Garantido', 'Cor', 'Dias da Semana', 'Registrado'];
    const csvContent = [
        headers.join(','),
        ...tournamentsData.map(tournament => [
            tournament.time,
            `"${tournament.name}"`,
            tournament.site,
            `"${tournament.buyin}"`,
            `"${tournament.guarantee}"`,
            tournament.color,
            `"${tournament.daysOfWeek.join(', ')}"`,
            tournament.registered ? 'Sim' : 'Não'
        ].join(','))
    ].join('\n');
    
    return csvContent;
}

function exportToJSON(tournamentsData) {
    const exportObject = {
        exportDate: new Date().toISOString(),
        totalTournaments: tournamentsData.length,
        tournaments: tournamentsData.map(tournament => ({
            id: tournament.id,
            time: tournament.time,
            name: tournament.name,
            site: tournament.site,
            buyin: tournament.buyin,
            guarantee: tournament.guarantee,
            color: tournament.color,
            daysOfWeek: tournament.daysOfWeek,
            registered: tournament.registered
        }))
    };
    
    return JSON.stringify(exportObject, null, 2);
}

function exportToText(tournamentsData) {
    const dayGroups = {};
    
    // Agrupar torneios por dia da semana
    tournamentsData.forEach(tournament => {
        tournament.daysOfWeek.forEach(day => {
            if (!dayGroups[day]) {
                dayGroups[day] = [];
            }
            dayGroups[day].push(tournament);
        });
    });
    
    let textContent = `GRADE DE TORNEIOS DE POKER\n`;
    textContent += `Exportado em: ${new Date().toLocaleString('pt-BR')}\n`;
    textContent += `Total de torneios: ${tournamentsData.length}\n`;
    textContent += `${'='.repeat(50)}\n\n`;
    
    const dayOrder = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo'];
    const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
    
    dayOrder.forEach((day, index) => {
        if (dayGroups[day] && dayGroups[day].length > 0) {
            textContent += `${dayNames[index].toUpperCase()}\n`;
            textContent += `${'-'.repeat(dayNames[index].length)}\n`;
            
            // Ordenar por horário
            const sortedTournaments = dayGroups[day].sort((a, b) => a.time.localeCompare(b.time));
            
            sortedTournaments.forEach(tournament => {
                const status = tournament.registered ? ' [REGISTRADO]' : '';
                textContent += `${tournament.time} - ${tournament.name} (${tournament.site})${status}\n`;
                textContent += `  Buy-in: ${tournament.buyin} | Garantido: ${tournament.guarantee}\n`;
                if (tournament.color !== 'default') {
                    textContent += `  Cor: ${tournament.color}\n`;
                }
                textContent += `\n`;
            });
            
            textContent += `\n`;
        }
    });
    
    return textContent;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

function getDayName(day) {
    const dayNames = {
        'Segunda': 'Segunda-feira',
        'Terca': 'Terça-feira',
        'Quarta': 'Quarta-feira',
        'Quinta': 'Quinta-feira',
        'Sexta': 'Sexta-feira',
        'Sabado': 'Sábado',
        'Domingo': 'Domingo'
    };
    return dayNames[day] || day;
}



// ===== FUNCIONALIDADES DO CALENDÁRIO =====

// Variáveis globais do calendário
let currentCalendarDate = new Date();
let calendarInitialized = false;
let manualCalendarCounts = {}; // Nova estrutura para contagens manuais

// Mapeamento de dias da semana
const dayMapping = {
    0: 'Domingo',
    1: 'Segunda', 
    2: 'Terca',
    3: 'Quarta',
    4: 'Quinta',
    5: 'Sexta',
    6: 'Sabado'
};

// Nomes dos meses
const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Inicializar calendário
function initializeCalendar() {
    if (calendarInitialized) return;
    
    // Carregar contagens manuais salvas
    loadManualCalendarCounts();
    
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    
    if (prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar();
        });
        
        nextMonthBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar();
        });
        
        calendarInitialized = true;
        renderCalendar();
    }
}

// Carregar contagens manuais do localStorage
function loadManualCalendarCounts() {
    const saved = localStorage.getItem('poker-manual-calendar-counts');
    if (saved) {
        try {
            manualCalendarCounts = JSON.parse(saved);
        } catch (e) {
            console.error('Erro ao carregar contagens manuais do calendário:', e);
            manualCalendarCounts = {};
        }
    }
}

// Salvar contagens manuais no localStorage
function saveManualCalendarCounts() {
    localStorage.setItem('poker-manual-calendar-counts', JSON.stringify(manualCalendarCounts));
}

// Obter chave da data no formato AAAA-MM-DD
function getDateKey(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Obter contagem manual para uma data específica
function getManualCountForDate(date) {
    const dateKey = getDateKey(date);
    return manualCalendarCounts[dateKey] || 0;
}

// Definir contagem manual para uma data específica
function setManualCountForDate(date, count) {
    const dateKey = getDateKey(date);
    const numericCount = parseInt(count) || 0;
    
    if (numericCount <= 0) {
        delete manualCalendarCounts[dateKey];
    } else {
        manualCalendarCounts[dateKey] = numericCount;
    }
    
    saveManualCalendarCounts();
    updateMonthlyTotal();
}

// Renderizar calendário
function renderCalendar() {
    const currentMonthYear = document.getElementById('current-month-year');
    const calendarDays = document.getElementById('calendar-days');
    
    if (!currentMonthYear || !calendarDays) return;
    
    // Atualizar título do mês/ano
    const monthName = monthNames[currentCalendarDate.getMonth()];
    const year = currentCalendarDate.getFullYear();
    currentMonthYear.textContent = `${monthName} ${year}`;
    
    // Calcular primeiro e último dia do mês
    const firstDay = new Date(year, currentCalendarDate.getMonth(), 1);
    const lastDay = new Date(year, currentCalendarDate.getMonth() + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    // Calcular dias do mês anterior para preencher o início
    const prevMonth = new Date(year, currentCalendarDate.getMonth() - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    // Limpar calendário
    calendarDays.innerHTML = '';
    
    // Adicionar dias do mês anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const dayNumber = daysInPrevMonth - i;
        const dayElement = createCalendarDay(dayNumber, true, new Date(year, currentCalendarDate.getMonth() - 1, dayNumber));
        calendarDays.appendChild(dayElement);
    }
    
    // Adicionar dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, currentCalendarDate.getMonth(), day);
        const dayElement = createCalendarDay(day, false, currentDate);
        calendarDays.appendChild(dayElement);
    }
    
    // Adicionar dias do próximo mês para completar a grade
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells; // 6 semanas x 7 dias
    
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createCalendarDay(day, true, new Date(year, currentCalendarDate.getMonth() + 1, day));
        calendarDays.appendChild(dayElement);
    }
    
    // Atualizar total mensal
    updateMonthlyTotal();
}

// Criar elemento de dia do calendário
function createCalendarDay(dayNumber, isOtherMonth, date) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    // Verificar se é hoje
    const today = new Date();
    if (!isOtherMonth && 
        date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear()) {
        dayElement.classList.add('today');
    }
    
    // Número do dia
    const dayNumberElement = document.createElement('div');
    dayNumberElement.className = 'day-number';
    dayNumberElement.textContent = dayNumber;
    dayElement.appendChild(dayNumberElement);
    
    // Campo de entrada manual (apenas para dias do mês atual)
    if (!isOtherMonth) {
        const inputElement = document.createElement('input');
        inputElement.type = 'number';
        inputElement.className = 'manual-count-input';
        inputElement.min = '0';
        inputElement.max = '999';
        inputElement.value = getManualCountForDate(date);
        inputElement.placeholder = '0';
        
        // Event listeners para salvar automaticamente
        inputElement.addEventListener('change', (e) => {
            setManualCountForDate(date, e.target.value);
        });
        
        inputElement.addEventListener('blur', (e) => {
            setManualCountForDate(date, e.target.value);
        });
        
        // Prevenir propagação de eventos para não interferir com outros elementos
        inputElement.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        dayElement.appendChild(inputElement);
    }
    
    return dayElement;
}

// Atualizar total mensal
function updateMonthlyTotal() {
    const monthlyTotal = document.getElementById('monthly-total');
    if (!monthlyTotal) return;
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let total = 0;
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        total += getManualCountForDate(date);
    }
    
    monthlyTotal.textContent = total;
}


// Modificar a função setupTabs existente para incluir o calendário
const originalSetupTabs = setupTabs;
setupTabs = function() {
    originalSetupTabs();
    
    // Adicionar listener específico para a aba do calendário
    const calendarTab = document.querySelector('[data-tab="calendar"]');
    if (calendarTab) {
        calendarTab.addEventListener('click', function() {
            setTimeout(() => {
                initializeCalendar();
            }, 100);
        });
    }
};


// ===== SISTEMA DE ALERTAS SONOROS =====

// Variáveis globais para alertas sonoros
let soundAlertsEnabled = false;
let alertCheckInterval = null;
let lastAlertTime = null;

// Elementos DOM
const soundAlertsBtn = document.getElementById('sound-alerts-btn');

// Inicializar sistema de alertas sonoros
function initializeSoundAlerts() {
    if (!soundAlertsBtn) return;
    
    // Carregar configuração salva
    loadSoundAlertsSettings();
    
    // Event listener para o botão
    soundAlertsBtn.addEventListener('click', toggleSoundAlerts);
    
    // Atualizar visual do botão
    updateSoundAlertsButton();
    
    // Iniciar monitoramento se estiver ativado
    if (soundAlertsEnabled) {
        startAlertMonitoring();
    }
}

// Carregar configurações dos alertas sonoros
function loadSoundAlertsSettings() {
    const saved = localStorage.getItem('poker-sound-alerts') === 'true';
    soundAlertsEnabled = saved;
}

// Salvar configurações dos alertas sonoros
function saveSoundAlertsSettings() {
    localStorage.setItem('poker-sound-alerts', soundAlertsEnabled.toString());
}

// Alternar alertas sonoros
function toggleSoundAlerts() {
    soundAlertsEnabled = !soundAlertsEnabled;
    saveSoundAlertsSettings();
    updateSoundAlertsButton();
    
    if (soundAlertsEnabled) {
        startAlertMonitoring();
        showNotification('Alertas sonoros ativados!', 'success');
    } else {
        stopAlertMonitoring();
        showNotification('Alertas sonoros desativados!', 'info');
    }
}

// Atualizar visual do botão
function updateSoundAlertsButton() {
    if (!soundAlertsBtn) return;
    
    if (soundAlertsEnabled) {
        soundAlertsBtn.classList.add('active');
        soundAlertsBtn.innerHTML = '<i class="fas fa-bell"></i>';
        soundAlertsBtn.title = 'Alertas Sonoros (Ativado)';
    } else {
        soundAlertsBtn.classList.remove('active');
        soundAlertsBtn.innerHTML = '<i class="fas fa-bell-slash"></i>';
        soundAlertsBtn.title = 'Alertas Sonoros (Desativado)';
    }
}

// Iniciar monitoramento de alertas
function startAlertMonitoring() {
    if (alertCheckInterval) {
        clearInterval(alertCheckInterval);
    }
    
    // Verificar a cada 30 segundos
    alertCheckInterval = setInterval(checkForTournamentAlerts, 30000);
    
    // Verificar imediatamente
    checkForTournamentAlerts();
}

// Parar monitoramento de alertas
function stopAlertMonitoring() {
    if (alertCheckInterval) {
        clearInterval(alertCheckInterval);
        alertCheckInterval = null;
    }
}

// Verificar se há torneios para alertar
function checkForTournamentAlerts() {
    if (!soundAlertsEnabled) return;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = dayMapping[now.getDay()];
    
    // Buscar torneios registrados para o dia atual
    const todayTournaments = tournaments.filter(tournament => 
        tournament.registered && 
        tournament.daysOfWeek.includes(currentDay) &&
        tournament.time === currentTime
    );
    
    // Se há torneios começando agora
    if (todayTournaments.length > 0) {
        // Evitar alertas duplicados
        const alertKey = `${currentTime}-${currentDay}`;
        if (lastAlertTime !== alertKey) {
            lastAlertTime = alertKey;
            triggerTournamentAlert(todayTournaments);
        }
    }
}

// Disparar alerta de torneio
function triggerTournamentAlert(tournaments) {
    // Tocar som
    playAlertSound();
    
    // Mostrar notificação visual
    showTournamentAlert(tournaments);
}

// Tocar som de alerta
function playAlertSound() {
    try {
        // Criar contexto de áudio
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Criar oscilador para gerar o som
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Conectar oscilador ao gain e ao destino
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configurar som (frequência e tipo)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Frequência de 800Hz
        oscillator.type = 'sine'; // Onda senoidal para som suave
        
        // Configurar volume (fade in/out)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
        
        // Tocar som por 0.5 segundos
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        // Repetir o som 2 vezes com intervalo
        setTimeout(() => {
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();
            
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            
            oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
            oscillator2.type = 'sine';
            
            gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
            gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
            
            oscillator2.start(audioContext.currentTime);
            oscillator2.stop(audioContext.currentTime + 0.5);
        }, 600);
        
    } catch (error) {
        console.warn('Não foi possível reproduzir o som de alerta:', error);
    }
}

// Mostrar notificação visual de alerta
function showTournamentAlert(tournaments) {
    // Remover notificação existente
    const existingAlert = document.querySelector('.sound-alert-notification');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Criar nova notificação
    const alertDiv = document.createElement('div');
    alertDiv.className = 'sound-alert-notification';
    
    const tournamentNames = tournaments.map(t => t.name).join(', ');
    const message = tournaments.length === 1 
        ? `Torneio começando: ${tournamentNames}` 
        : `${tournaments.length} torneios começando: ${tournamentNames}`;
    
    alertDiv.innerHTML = `
        <i class="fas fa-bell"></i>
        <div>
            <div style="font-size: 16px; margin-bottom: 5px;">🎯 Alerta de Torneio!</div>
            <div style="font-size: 14px; font-weight: normal;">${message}</div>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.style.animation = 'alertPulse 0.3s ease-in-out reverse';
            setTimeout(() => {
                alertDiv.remove();
            }, 300);
        }
    }, 5000);
}

// Modificar a função de inicialização existente para incluir alertas sonoros
const originalSetupEventListeners = setupEventListeners;
setupEventListeners = function() {
    originalSetupEventListeners();
    initializeSoundAlerts();
};

// Limpar intervalos quando a página for fechada
window.addEventListener('beforeunload', function() {
    stopAlertMonitoring();
});

