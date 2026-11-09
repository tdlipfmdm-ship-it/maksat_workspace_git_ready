/**
 * Maksat Workspace - DICOM & File Transfer Workstation Application
 */

// Global Ýagdaý (State)
const state = {
  currentView: 'dicom',
  selectedFile: null,
  activeTool: 'windowLevel',
  zoom: 1,
  panX: 0,
  panY: 0,
  windowCenter: 40,
  windowWidth: 400,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  isInverted: false,
  anonymizeEnabled: true,
  dicomLoaded: false
};

// DOM Elementler
const elements = {
  canvas: document.getElementById('dicomCanvas'),
  ctx: document.getElementById('dicomCanvas').getContext('2d'),
  dropHint: document.getElementById('drop-hint'),
  modalImport: document.getElementById('import-modal'),
  fileInput: document.getElementById('file-input'),
  uploadZone: document.getElementById('upload-zone'),
  btnStartUpload: document.getElementById('btn-start-upload'),
  progressContainer: document.getElementById('progress-container'),
  progressFill: document.getElementById('progress-fill'),
  progressPct: document.getElementById('progress-pct'),
  progressText: document.getElementById('progress-text'),
  tagsTbody: document.getElementById('tags-tbody'),
  metaPatient: document.getElementById('meta-patient'),
  metaModality: document.getElementById('meta-modality'),
  metaSlice: document.getElementById('meta-slice')
};

// 1. Marşrutizasiýa (Hash Routing)
function handleRouting() {
  const hash = window.location.hash || '#dicom';

  // Modal dolandyryşy
  if (hash === '#importPanel') {
    elements.modalImport.classList.add('active');
  } else {
    elements.modalImport.classList.remove('active');
  }

  // Esasy sahypalary çalyşmak
  const targetView = hash.replace('#', '').split('/')[0];
  const validViews = ['dicom', 'files', 'community'];

  if (validViews.includes(targetView)) {
    document.querySelectorAll('.content-view').forEach(view => view.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

    const activeSection = document.getElementById(`view-${targetView}`);
    const activeNav = document.getElementById(`nav-${targetView}`);

    if (activeSection) activeSection.classList.add('active');
    if (activeNav) activeNav.classList.add('active');
    state.currentView = targetView;
  }
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', () => {
  handleRouting();
  renderDemoDicom();
  setupEventListeners();
});

// 2. Demo DICOM Şekilini Çyzmak (Kompýuter Tomografiýasy Fantomy)
function renderDemoDicom() {
  const canvas = elements.canvas;
  const ctx = elements.ctx;
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.save();

  // Pan we Zoom transformasiýasy
  ctx.translate(w / 2 + state.panX, h / 2 + state.panY);
  ctx.scale(state.zoom, state.zoom);
  ctx.translate(-w / 2, -h / 2);

  // Gara fon
  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, w, h);

  // Lukmançylyk Tomografiýa Şekiliniň Çyzgysy (Kelle çanagy / Thorax demo)
  const grad = ctx.createRadialGradient(w/2, h/2, 40, w/2, h/2, 180);
  
  if (state.isInverted) {
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, '#888888');
    grad.addColorStop(0.85, '#222222');
    grad.addColorStop(1, '#000000');
  } else {
    grad.addColorStop(0, '#1a1f26');
    grad.addColorStop(0.4, '#384252');
    grad.addColorStop(0.8, '#cbd5e1'); // Süňk dokumasy (Cortical Bone)
    grad.addColorStop(0.9, '#f8fafc');
    grad.addColorStop(1, '#000000');
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(w/2, h/2, 170, 210, 0, 0, Math.PI * 2);
  ctx.fill();

  // Içki dokumalar we anatomiýa gurluşlary
  ctx.fillStyle = state.isInverted ? '#333333' : '#64748b';
  ctx.beginPath();
  ctx.ellipse(w/2 - 50, h/2 - 20, 45, 60, -0.2, 0, Math.PI * 2);
  ctx.ellipse(w/2 + 50, h/2 - 20, 45, 60, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Merkezi oňurga / damar kesimi
  ctx.fillStyle = state.isInverted ? '#000000' : '#ffffff';
  ctx.beginPath();
  ctx.arc(w/2, h/2 + 100, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // W/L Belligi
  ctx.fillStyle = '#00e5ff';
  ctx.font = '12px monospace';
  ctx.fillText(`W: ${state.windowWidth} L: ${state.windowCenter}`, 15, h - 20);
  ctx.fillText(`Zoom: ${(state.zoom * 100).toFixed(0)}%`, 15, h - 38);
}

// 3. Toolbar we Gural Hereketleri
function setupEventListeners() {
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.dataset.tool;

      if (tool === 'invert') {
        state.isInverted = !state.isInverted;
        renderDemoDicom();
        return;
      }

      if (tool === 'reset') {
        state.zoom = 1;
        state.panX = 0;
        state.panY = 0;
        state.windowWidth = 400;
        state.windowCenter = 40;
        state.isInverted = false;
        renderDemoDicom();
        return;
      }

      document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeTool = tool;
    });
  });

  // Canvas-da syçanjyk bilen interaksiýa (Zoom, Pan, W/L)
  const canvas = elements.canvas;

  canvas.addEventListener('mousedown', (e) => {
    state.isDragging = true;
    state.dragStartX = e.clientX;
    state.dragStartY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    state.isDragging = false;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!state.isDragging) return;

    const dx = e.clientX - state.dragStartX;
    const dy = e.clientY - state.dragStartY;
    state.dragStartX = e.clientX;
    state.dragStartY = e.clientY;

    if (state.activeTool === 'pan') {
      state.panX += dx;
      state.panY += dy;
    } else if (state.activeTool === 'zoom') {
      state.zoom = Math.max(0.2, state.zoom - dy * 0.01);
    } else if (state.activeTool === 'windowLevel') {
      state.windowWidth = Math.max(1, state.windowWidth + dx * 2);
      state.windowCenter += dy;
    }

    renderDemoDicom();
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    state.zoom = Math.min(Math.max(0.2, state.zoom * zoomFactor), 5);
    renderDemoDicom();
  });

  // Drag and Drop (Import Panel)
  const zone = elements.uploadZone;
  ['dragenter', 'dragover'].forEach(name => {
    zone.addEventListener(name, (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    zone.addEventListener(name, (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
    });
  });

  zone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelection(files[0]);
  });

  elements.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFileSelection(e.target.files[0]);
  });

  elements.btnStartUpload.addEventListener('click', executeChunkedUpload);
}

// 4. Faýl Saýlanyşy we Metadata Okalyşy
function handleFileSelection(file) {
  state.selectedFile = file;
  elements.btnStartUpload.disabled = false;
  elements.uploadZone.querySelector('h4').textContent = `Saýlandy: ${file.name}`;
  elements.uploadZone.querySelector('p').textContent = `Göwrümi: ${(file.size / (1024 * 1024)).toFixed(2)} MB`;
}

// 5. Bölekleýin (Chunked) Ýükleme Simulasiýasy & Anonimizasiýa
async function executeChunkedUpload() {
  if (!state.selectedFile) return;

  elements.progressContainer.style.display = 'block';
  elements.btnStartUpload.disabled = true;

  const totalSteps = 100;
  for (let i = 0; i <= totalSteps; i += 10) {
    await new Promise(r => setTimeout(r, 120));
    elements.progressFill.style.width = `${i}%`;
    elements.progressPct.textContent = `${i}%`;
    
    if (i < 30) {
      elements.progressText.textContent = 'Brauzerde DICOM anonimleşdirilýär...';
    } else if (i < 80) {
      elements.progressText.textContent = 'Şifrlenen bölekler serwere iberilýär...';
    } else {
      elements.progressText.textContent = 'Bütewilik barlanýar (SHA-256)...';
    }
  }

  // Ýükleme tamamlandy
  elements.progressText.textContent = 'Şowly ýüklendi!';
  setTimeout(() => {
    location.hash = '#dicom';
    elements.dropHint.classList.add('hidden');
    
    // Tag tablisasyna täze maglumat goşmak
    elements.metaPatient.textContent = 'ANONYMIZED_' + Math.floor(Math.random() * 90000 + 10000);
    elements.metaSlice.textContent = '1 / 142';
    alert('DICOM faýly şowly kabul edildi we iş giňişligine ýüklendi.');
  }, 600);
}

function loadSampleDicom() {
  location.hash = '#dicom';
  elements.dropHint.classList.add('hidden');
  renderDemoDicom();
}
