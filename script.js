/**
 * SAMBA DE ROSA OFICIAL — Single Page Application Engine
 * Montes Claros - MG | A Força Feminina do Samba
 * Conformidade com Padrão Mestre: Zero Quebra de Layout, Sanitização XSS e Blindagem
 */

// Estado Global da Aplicação com Tolerância a Falhas
const STATE = {
  whatsapp: localStorage.getItem('samba_whatsapp') || '5538998418631',
  instagram: localStorage.getItem('samba_instagram') || 'https://www.instagram.com/sambaderosaoficial',
  city: localStorage.getItem('samba_city') || 'Montes Claros - MG',
  adminPass: localStorage.getItem('samba_admin_pass') || 'admin123',
  loginAttempts: parseInt(localStorage.getItem('samba_login_attempts') || '0', 10),
  lockUntil: parseInt(localStorage.getItem('samba_lock_until') || '0', 10),
  calc: {
    eventType: 'Casamento',
    multiplier: 1.3,
    hours: 3,
    basePricePerHour: 700,
    hasSound: true,
    hasLighting: false
  }
};

// Repertório de Ouro Consolidado
const REPERTOIRE_DATA = [
  { title: 'Não Deixe o Samba Morrer', artist: 'Alcione', category: 'mulheres', highlight: 'Hino Feminino' },
  { title: 'O Mar Serenou', artist: 'Clara Nunes', category: 'mulheres', highlight: 'Clássico Mineiro' },
  { title: 'Sonho Meu', artist: 'Dona Ivone Lara', category: 'mulheres', highlight: 'Dona Ivone' },
  { title: 'Coisinha do Pai', artist: 'Beth Carvalho', category: 'mulheres', highlight: 'Madrinha do Samba' },
  { title: 'Zé do Caroço', artist: 'Leci Brandão', category: 'mulheres', highlight: 'Resistência' },
  { title: 'Andança', artist: 'Beth Carvalho', category: 'mulheres', highlight: 'Poesia Pura' },

  { title: 'As Rosas Não Falam', artist: 'Cartola', category: 'raiz', highlight: 'Samba de Raiz' },
  { title: 'O Sol Nascerá', artist: 'Cartola', category: 'raiz', highlight: 'Samba Tradicional' },
  { title: 'Trem das Onze', artist: 'Demônios da Garoa', category: 'raiz', highlight: 'Clássico Imortal' },
  { title: 'Foi um Rio que Passou em Minha Vida', artist: 'Paulinho da Viola', category: 'raiz', highlight: 'Portela' },
  { title: 'O Que É, O Que É?', artist: 'Gonzaguinha', category: 'raiz', highlight: 'Cantar & Sambar' },

  { title: 'Cheia de Manias', artist: 'Raça Negra', category: 'pagode', highlight: 'Anos 90' },
  { title: 'Deixa Acontecer', artist: 'Grupo Revelação', category: 'pagode', highlight: 'Pagode de Mesa' },
  { title: 'Tá Escrito', artist: 'Grupo Revelação', category: 'pagode', highlight: 'Fé & Energia' },
  { title: 'Telegrama', artist: 'Exaltasamba', category: 'pagode', highlight: 'Roda de Amigos' },
  { title: 'Pé na Areia', artist: 'Diogo Nogueira', category: 'pagode', highlight: 'Verão & Sunset' },
  { title: 'Mina do Condomínio', artist: 'Seu Jorge', category: 'pagode', highlight: 'Sucesso Total' },

  { title: 'Águas de Março', artist: 'Elis Regina & Tom Jobim', category: 'mpb', highlight: 'Patrimônio MPB' },
  { title: 'Mas Que Nada', artist: 'Jorge Ben Jor', category: 'mpb', highlight: 'Balanço Internacional' },
  { title: 'Madalena', artist: 'Elis Regina', category: 'mpb', highlight: 'Voz & Expressão' }
];

// Agenda de Shows com Auto-recuperação
const DEFAULT_SHOWS = [
  {
    id: 1,
    dateBadge: '14 NOV',
    type: 'Tardezinha',
    title: 'Tardezinha Samba de Rosa — Montes Claros',
    location: 'Espaço Reserva Cultural • A partir das 17h'
  },
  {
    id: 2,
    dateBadge: '28 NOV',
    type: 'Festival',
    title: 'Festival da Gastronomia & Cultura Norte-Mineira',
    location: 'Praça das Artes • Montes Claros • 20h'
  },
  {
    id: 3,
    dateBadge: '12 DEZ',
    type: 'Sunset Acústico',
    title: 'Sunset Roda das Rosas no Ibituruna',
    location: 'Bairro Ibituruna • Montes Claros • 16h30'
  }
];

function getStoredShows() {
  try {
    const raw = localStorage.getItem('samba_agenda_shows');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Erro ao carregar shows do localStorage", e);
  }
  return DEFAULT_SHOWS;
}

function saveShows(shows) {
  localStorage.setItem('samba_agenda_shows', JSON.stringify(shows));
}

// Sanitização estrita anti-XSS
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ========================================================
 * 1. INICIALIZAÇÃO
 * ======================================================== */
document.addEventListener('DOMContentLoaded', () => {
  renderRepertoire('todos');
  renderAgenda();
  updateCalculator();
  syncContactLinks();
  lucide.createIcons();
});

/* ========================================================
 * 2. SINCRONIZAÇÃO DE CONTATOS & WHATSAPP
 * ======================================================== */
function syncContactLinks() {
  const igElements = [
    document.getElementById('headerInstagramLink'),
    document.getElementById('footerInstagramLink')
  ];
  igElements.forEach(el => {
    if (el) el.href = STATE.instagram;
  });
}

/* ========================================================
 * 3. REPERTÓRIO REATIVO & FILTROS (SEM FALLBACK ANULADOR)
 * ======================================================== */
function renderRepertoire(filterCategory) {
  const grid = document.getElementById('repertoireGrid');
  const emptyState = document.getElementById('repertoireEmptyState');
  if (!grid) return;

  const filtered = (filterCategory === 'todos')
    ? REPERTOIRE_DATA
    : REPERTOIRE_DATA.filter(item => item.category === filterCategory);

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  grid.innerHTML = filtered.map(item => `
    <div class="p-5 rounded-2xl bg-[#140C14] border border-pink-950/80 hover:border-pink-500/50 transition duration-300 flex items-center justify-between gap-4 group">
      <div class="flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-pink-950/60 border border-pink-800/40 text-pink-400 flex items-center justify-center shrink-0 group-hover:bg-pink-600 group-hover:text-white transition">
          <i data-lucide="music" class="w-4 h-4"></i>
        </div>
        <div>
          <h4 class="font-bold text-sm text-white group-hover:text-pink-400 transition leading-snug">${escapeHTML(item.title)}</h4>
          <span class="text-xs text-zinc-400 block">${escapeHTML(item.artist)}</span>
        </div>
      </div>
      <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-pink-300 shrink-0">
        ${escapeHTML(item.highlight)}
      </span>
    </div>
  `).join('');

  lucide.createIcons();
}

function filterRepertoire(category) {
  document.querySelectorAll('.repertoire-filter-btn').forEach(btn => {
    if (btn.getAttribute('data-category') === category) {
      btn.classList.add('active', 'bg-pink-600', 'text-white');
      btn.classList.remove('bg-zinc-900', 'text-zinc-300');
    } else {
      btn.classList.remove('active', 'bg-pink-600', 'text-white');
      btn.classList.add('bg-zinc-900', 'text-zinc-300');
    }
  });
  renderRepertoire(category);
}

/* ========================================================
 * 4. SIMULADOR DE ORÇAMENTO (CALCULADORA DE SHOWS)
 * ======================================================== */
function setCalcEventType(type, multiplier) {
  STATE.calc.eventType = type;
  STATE.calc.multiplier = multiplier;

  document.querySelectorAll('.calc-type-btn').forEach(btn => {
    if (btn.innerText.includes(type)) {
      btn.classList.add('active', 'bg-pink-600', 'text-white', 'border-pink-500');
      btn.classList.remove('bg-zinc-900', 'text-zinc-300', 'border-zinc-800');
    } else {
      btn.classList.remove('active', 'bg-pink-600', 'text-white', 'border-pink-500');
      btn.classList.add('bg-zinc-900', 'text-zinc-300', 'border-zinc-800');
    }
  });

  document.getElementById('summaryEventType').innerText = type;
  updateCalculator();
}

function updateCalculator() {
  const hours = parseInt(document.getElementById('calcHoursRange').value, 10);
  STATE.calc.hours = hours;
  document.getElementById('calcHoursLabel').innerText = `${hours} Horas de Show`;
  document.getElementById('summaryHours').innerText = `${hours} Horas`;

  const hasLighting = document.getElementById('calcLightingCheck').checked;
  STATE.calc.hasLighting = hasLighting;

  let base = hours * STATE.calc.basePricePerHour * STATE.calc.multiplier;
  if (hasLighting) base += 350;

  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(base);
  document.getElementById('calcTotalPrice').innerText = formatted;
}

function sendCalculatedQuoteToWhatsApp() {
  const hours = STATE.calc.hours;
  const eventType = STATE.calc.eventType;
  const price = document.getElementById('calcTotalPrice').innerText;
  const lighting = STATE.calc.hasLighting ? 'Sim (Iluminação cênica)' : 'Não';

  const text = `*SOLICITAÇÃO DE ORÇAMENTO DE SHOW — SAMBA DE ROSA (MONTES CLAROS)*\n\n` +
               `🎉 *Tipo de Evento:* ${eventType}\n` +
               `⏱️ *Duração Estimada:* ${hours} Horas\n` +
               `🔊 *Sonorização:* Inclusa própria da banda\n` +
               `💡 *Iluminação Cênica:* ${lighting}\n` +
               `💰 *Estimativa Simulada:* ${price}\n` +
               `📍 *Cidade:* Montes Claros - MG\n\n` +
               `Olá! Gostaria de verificar a disponibilidade da agenda e receber a proposta oficial do Samba de Rosa.`;

  const url = `https://wa.me/${STATE.whatsapp}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function requestBookingWithFormat(formatName) {
  const text = `*INTERESSE EM FORMATO DE SHOW — SAMBA DE ROSA*\n\n` +
               `Gostaria de solicitar orçamento para o formato: *${formatName}* em Montes Claros ou região.\n` +
               `Poderiam me informar sobre disponibilidade e valores?`;
  const url = `https://wa.me/${STATE.whatsapp}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* ========================================================
 * 5. AGENDA DE SHOWS REATIVA
 * ======================================================== */
function renderAgenda() {
  const list = document.getElementById('agendaList');
  if (!list) return;

  const shows = getStoredShows();
  if (shows.length === 0) {
    list.innerHTML = `
      <div class="text-center py-12 rounded-2xl bg-[#140C14] border border-zinc-800 text-zinc-400 text-xs">
        Nenhum show público agendado no momento. Solicite uma data exclusiva para seu evento!
      </div>
    `;
    return;
  }

  list.innerHTML = shows.map(show => `
    <div class="p-6 rounded-2xl bg-[#140C14] border border-pink-950/80 hover:border-pink-500/50 flex flex-col md:flex-row items-center justify-between gap-6 transition duration-300 group">
      <div class="flex items-center gap-5 w-full md:w-auto">
        <div class="w-16 h-16 rounded-2xl bg-pink-950/60 border border-pink-800/40 flex flex-col items-center justify-center text-center shrink-0">
          <span class="text-xs font-black uppercase text-pink-400">${escapeHTML(show.dateBadge.split(' ')[1] || 'MÊS')}</span>
          <span class="font-syne text-2xl font-black text-white">${escapeHTML(show.dateBadge.split(' ')[0] || 'DIA')}</span>
        </div>
        <div>
          <span class="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-pink-500/20 text-pink-300">
            ${escapeHTML(show.type)}
          </span>
          <h3 class="font-syne text-base sm:text-lg font-bold text-white mt-1 group-hover:text-pink-400 transition leading-snug">
            ${escapeHTML(show.title)}
          </h3>
          <p class="text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-pink-500"></i> ${escapeHTML(show.location)}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3 w-full md:w-auto justify-end">
        <a href="https://wa.me/${STATE.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de informações sobre o show: ' + show.title)}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-2 shadow-md shadow-pink-600/30 transition">
          <i data-lucide="ticket" class="w-4 h-4"></i> Informações & Mesas
        </a>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

/* ========================================================
 * 6. FORMULÁRIO DE CONTRATAÇÃO PRINCIPAL
 * ======================================================== */
function handleBookingSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('clientName').value.trim();
  const phone = document.getElementById('clientPhone').value.trim();
  const date = document.getElementById('eventDate').value;
  const city = document.getElementById('eventCity').value.trim();
  const type = document.getElementById('eventType').value;
  const notes = document.getElementById('eventNotes').value.trim();

  const formattedDate = date ? date.split('-').reverse().join('/') : 'A definir';

  const message = `*SOLICITAÇÃO DE CONTRATAÇÃO — SAMBA DE ROSA OFICIAL*\n\n` +
                  `👤 *Contratante:* ${name}\n` +
                  `📱 *Telefone/WhatsApp:* ${phone}\n` +
                  `📅 *Data do Evento:* ${formattedDate}\n` +
                  `📍 *Cidade/Local:* ${city}\n` +
                  `🎉 *Tipo de Evento:* ${type}\n` +
                  (notes ? `📝 *Observações:* ${notes}\n` : '') +
                  `\nOlá, gostaria de receber a proposta oficial do Samba de Rosa para esta data!`;

  const url = `https://wa.me/${STATE.whatsapp}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  showToast("Redirecionando para o WhatsApp oficial da banda!");
}

/* ========================================================
 * 7. FAQ EXPANSÍVEL
 * ======================================================== */
function toggleFaq(index) {
  const content = document.getElementById(`faq-content-${index}`);
  const icon = document.getElementById(`faq-icon-${index}`);
  if (!content) return;

  const isHidden = content.classList.contains('hidden');
  if (isHidden) {
    content.classList.remove('hidden');
    icon.style.transform = 'rotate(180deg)';
  } else {
    content.classList.add('hidden');
    icon.style.transform = 'rotate(0deg)';
  }
}

/* ========================================================
 * 8. MODAL DE ZOOM DE FOTOS
 * ======================================================== */
function openPhotoModal(imgSrc, caption) {
  const modal = document.getElementById('photoModal');
  const img = document.getElementById('photoModalImg');
  const cap = document.getElementById('photoModalCaption');
  img.src = imgSrc;
  cap.innerText = caption;
  modal.classList.remove('hidden');
}

function closePhotoModal() {
  document.getElementById('photoModal').classList.add('hidden');
}

/* ========================================================
 * 9. PAINEL ADMINISTRATIVO BLINDADO (COM ANTI-BRUTE FORCE)
 * ======================================================== */
function openAdminModal() {
  const modal = document.getElementById('adminModal');
  modal.classList.remove('hidden');

  // Verifica bloqueio anti-força bruta
  const now = Date.now();
  if (STATE.lockUntil > now) {
    const minsLeft = Math.ceil((STATE.lockUntil - now) / 60000);
    showAdminError(`Painel temporariamente bloqueado por excesso de tentativas. Tente novamente em ${minsLeft} minuto(s).`);
    return;
  }

  // Preenche dados nos inputs
  document.getElementById('adminWhatsappInput').value = STATE.whatsapp;
  document.getElementById('adminInstagramInput').value = STATE.instagram;
  document.getElementById('adminCityInput').value = STATE.city;
  renderAdminShows();
}

function closeAdminModal() {
  document.getElementById('adminModal').classList.add('hidden');
}

function authenticateAdmin() {
  const pass = document.getElementById('adminPasswordInput').value;
  const now = Date.now();

  if (STATE.lockUntil > now) {
    const minsLeft = Math.ceil((STATE.lockUntil - now) / 60000);
    showAdminError(`Painel bloqueado por segurança. Aguarde ${minsLeft} minuto(s).`);
    return;
  }

  if (pass === STATE.adminPass) {
    // Sucesso
    STATE.loginAttempts = 0;
    localStorage.setItem('samba_login_attempts', '0');
    document.getElementById('adminAuthSection').classList.add('hidden');
    document.getElementById('adminContentSection').classList.remove('hidden');
    showToast("Acesso administrativo liberado!");
    lucide.createIcons();
  } else {
    STATE.loginAttempts += 1;
    localStorage.setItem('samba_login_attempts', STATE.loginAttempts.toString());

    if (STATE.loginAttempts >= 5) {
      STATE.lockUntil = now + (15 * 60 * 1000); // 15 minutos
      localStorage.setItem('samba_lock_until', STATE.lockUntil.toString());
      showAdminError("5 tentativas incorretas. Painel bloqueado por 15 minutos.");
    } else {
      showAdminError(`Senha incorreta! Restam ${5 - STATE.loginAttempts} tentativa(s).`);
    }
  }
}

function showAdminError(msg) {
  const err = document.getElementById('adminAuthError');
  err.innerText = msg;
  err.classList.remove('hidden');
}

function switchAdminTab(tabName) {
  const tabs = ['geral', 'agenda', 'ia', 'seguranca'];
  tabs.forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (t === tabName) {
      el.classList.remove('hidden');
      btn.classList.add('bg-pink-600', 'text-white');
      btn.classList.remove('bg-zinc-900', 'text-zinc-400');
    } else {
      el.classList.add('hidden');
      btn.classList.remove('bg-pink-600', 'text-white');
      btn.classList.add('bg-zinc-900', 'text-zinc-400');
    }
  });
  lucide.createIcons();
}

function saveAdminGeneralSettings() {
  const wa = document.getElementById('adminWhatsappInput').value.trim().replace(/\D/g, '');
  const ig = document.getElementById('adminInstagramInput').value.trim();
  const city = document.getElementById('adminCityInput').value.trim();

  if (wa) {
    STATE.whatsapp = wa;
    localStorage.setItem('samba_whatsapp', wa);
  }
  if (ig) {
    STATE.instagram = ig;
    localStorage.setItem('samba_instagram', ig);
  }
  if (city) {
    STATE.city = city;
    localStorage.setItem('samba_city', city);
  }

  syncContactLinks();
  renderAgenda();
  showToast("Configurações gerais salvas com sucesso!");
}

function renderAdminShows() {
  const container = document.getElementById('adminShowsList');
  if (!container) return;
  const shows = getStoredShows();

  container.innerHTML = shows.map((show, idx) => `
    <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
      <div>
        <span class="font-bold text-pink-400">[${escapeHTML(show.dateBadge)}]</span>
        <span class="text-white font-medium ml-1">${escapeHTML(show.title)}</span>
      </div>
      <button onclick="removeShowFromAgenda(${idx})" class="text-red-400 hover:text-red-300 font-bold px-2 py-1">
        Excluir
      </button>
    </div>
  `).join('');
}

function addShowToAgenda() {
  const date = document.getElementById('newShowDate').value.trim();
  const type = document.getElementById('newShowType').value.trim() || 'Show';
  const title = document.getElementById('newShowTitle').value.trim();
  const loc = document.getElementById('newShowLocation').value.trim() || 'Montes Claros - MG';

  if (!date || !title) {
    alert("Informe pelo menos a data e o título do show.");
    return;
  }

  const shows = getStoredShows();
  shows.unshift({
    id: Date.now(),
    dateBadge: date,
    type: type,
    title: title,
    location: loc
  });

  saveShows(shows);
  renderAdminShows();
  renderAgenda();

  document.getElementById('newShowDate').value = '';
  document.getElementById('newShowType').value = '';
  document.getElementById('newShowTitle').value = '';
  document.getElementById('newShowLocation').value = '';

  showToast("Novo show adicionado à agenda com sucesso!");
}

function removeShowFromAgenda(index) {
  if (!confirm("Deseja realmente remover esta data da agenda?")) return;
  const shows = getStoredShows();
  shows.splice(index, 1);
  saveShows(shows);
  renderAdminShows();
  renderAgenda();
  showToast("Show removido com sucesso!");
}

function generateAICopy() {
  const topic = document.getElementById('aiTopicInput').value.trim() || 'Show em Montes Claros';
  const resultArea = document.getElementById('aiResultArea');

  const copies = [
    `🌹✨ *SAMBA DE ROSA: A FORÇA FEMININA NO PALCO!*\n\n` +
    `Montes Claros vai tremer com o melhor do samba de raiz e pagode de mesa! Traga a sua alegria porque o batuque das mulheres mais talentosas de Minas Gerais está preparado para fazer história.\n\n` +
    `📍 Tema: ${topic}\n` +
    `🎶 Repertório: Alcione, Clara Nunes, Cartola, Revelação e muito mais!\n` +
    `👉 Garanta sua mesa pelo link na bio ou solicite pelo WhatsApp oficial!\n\n` +
    `#SambaDeRosa #MontesClaros #SambaFeminino #NorteDeMinas #PagodeDeMesa`,

    `🥁🎤 *ALÔ MONTES CLAROS! O SAMBA TEM NOME E TEM VOZ FEMININA!*\n\n` +
    `Mais que um show, um encontro inesquecível com a nossa música e a nossa ancestralidade. O @sambaderosaoficial preparou uma noite emocionante para você cantar a plenos pulmões!\n\n` +
    `✨ Especial: ${topic}\n` +
    `💬 Marque quem não pode perder essa roda com você!\n\n` +
    `#SambaDeRaiz #MulheresNoSamba #SambaDeRosaOficial #MOC`,
  ];

  const picked = copies[Math.floor(Math.random() * copies.length)];
  resultArea.innerText = picked;
  resultArea.classList.remove('hidden');
  showToast("Legenda gerada com sucesso pela IA!");
}

function changeAdminPassword() {
  const newPass = document.getElementById('newAdminPassword').value.trim();
  if (newPass.length < 4) {
    alert("A nova senha deve ter no mínimo 4 caracteres.");
    return;
  }
  STATE.adminPass = newPass;
  localStorage.setItem('samba_admin_pass', newPass);
  document.getElementById('newAdminPassword').value = '';
  showToast("Senha administrativa alterada com sucesso!");
}

function logoutAdmin() {
  document.getElementById('adminAuthSection').classList.remove('hidden');
  document.getElementById('adminContentSection').classList.add('hidden');
  document.getElementById('adminPasswordInput').value = '';
  closeAdminModal();
  showToast("Sessão administrativa encerrada.");
}

/* ========================================================
 * 10. TOAST SYSTEM
 * ======================================================== */
function showToast(msg) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toastMsg');
  if (!toast || !msgEl) return;

  msgEl.innerText = msg;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 3500);
}
