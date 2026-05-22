/**
 * DreamVault - Core Application Script (Upgraded Version)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- APPLICATION STATE ---
  let state = {
    dreams: [],
    selectedMoods: [],
    tags: [],
    activeTab: 'new-dream',
    currentKeyIndex: 1, // 1, 2, or 3
    attachedImage: null, // Holds compressed base64 JPEG string
    attachedAudio: null, // Holds base64 audio string
    attachedAudioFormat: 'webm', // format of the audio file (e.g. webm, wav, mp3)
    activeIllusTab: 'sketch', // 'sketch' or 'upload'
    ecoMode: false,
    guestMode: false,
    firebaseConnected: false,
    user: null,
    restartStarfield: null
  };

  // Audio notes recording state
  let recordingState = {
    mediaRecorder: null,
    audioChunks: [],
    isRecording: false,
    startTime: 0,
    timerInterval: null,
    audioContext: null,
    analyser: null,
    dataArray: null,
    sourceNode: null,
    animationFrameId: null
  };

  // Speech Synthesis state
  let speechState = {
    synthesis: window.speechSynthesis,
    utterance: null,
    isPlaying: false,
    activeButton: null
  };

  // Sketchpad state
  let sketchState = {
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    brushColor: '#06b6d4', // Default cyan
    brushSize: 6,
    history: [] // Undo stack
  };

  // Soundscape audio engine state
  let audioState = {
    audioCtx: null,
    isPlaying: false,
    leftOsc: null,
    rightOsc: null,
    lfo: null,
    filter: null,
    mainGain: null,
    analyser: null,
    visualizerTimer: null
  };

  // Cache elements
  const el = {
    navTabs: document.querySelectorAll('.nav-tab'),
    viewPanels: document.querySelectorAll('.view-panel'),
    starsCanvas: document.getElementById('stars-canvas'),
    
    // Header & Soundscapes
    apiStatusPill: document.getElementById('api-status-pill'),
    apiStatusText: document.getElementById('api-status-text'),
    btnSoundscapeToggle: document.getElementById('btn-soundscape-toggle'),
    soundscapeSelect: document.getElementById('soundscape-select'),
    soundscapeVolume: document.getElementById('soundscape-volume'),
    soundscapeVisualizer: document.getElementById('soundscape-visualizer'),
    
    // Eco Mode
    btnEcoToggle: document.getElementById('btn-eco-toggle'),

    // Landing Page
    landingView: document.getElementById('landing-view'),
    btnGoogleLogin: document.getElementById('btn-google-login'),
    btnGuestMode: document.getElementById('btn-guest-mode'),
    userAuthWidget: document.getElementById('user-auth-widget'),
    userAvatar: document.getElementById('user-avatar'),
    userDisplayName: document.getElementById('user-display-name'),
    btnSignout: document.getElementById('btn-signout'),

    // Firebase Settings
    fbApiKey: document.getElementById('fb-api-key'),
    fbAuthDomain: document.getElementById('fb-auth-domain'),
    fbProjectId: document.getElementById('fb-project-id'),
    fbStorageBucket: document.getElementById('fb-storage-bucket'),
    fbSenderId: document.getElementById('fb-sender-id'),
    fbAppId: document.getElementById('fb-app-id'),
    btnSaveFirebase: document.getElementById('btn-save-firebase'),
    btnDisconnectFirebase: document.getElementById('btn-disconnect-firebase'),

    // Form elements
    dreamForm: document.getElementById('dream-form'),
    dreamDate: document.getElementById('dream-date'),
    dreamType: document.getElementById('dream-type'),
    dreamTitle: document.getElementById('dream-title'),
    dreamDescription: document.getElementById('dream-description'),
    formError: document.getElementById('form-error'),
    errorMessage: document.getElementById('error-message'),
    moodPillContainer: document.getElementById('mood-pill-container'),
    dreamClarity: document.getElementById('dream-clarity'),
    tagInput: document.getElementById('tag-input'),
    tagChips: document.getElementById('tag-chips'),
    btnSaveOnly: document.getElementById('btn-save-only'),
    btnSaveAnalyze: document.getElementById('btn-save-analyze'),
    
    // Subconscious Illustration elements
    illusTabs: document.querySelectorAll('.illus-tab'),
    illusPanels: document.querySelectorAll('.illus-panel'),
    sketchCanvas: document.getElementById('sketch-canvas'),
    brushSizeSlider: document.getElementById('brush-size'),
    btnSketchUndo: document.getElementById('btn-sketch-undo'),
    btnSketchClear: document.getElementById('btn-sketch-clear'),
    uploadDropzone: document.getElementById('upload-dropzone'),
    imageFileInput: document.getElementById('image-file-input'),
    attachmentPreviewContainer: document.getElementById('attachment-preview-container'),
    attachmentPreviewImg: document.getElementById('attachment-preview-img'),
    btnRemoveAttachment: document.getElementById('btn-remove-attachment'),
    
    // Voice Notes elements
    btnAudioRecord: document.getElementById('btn-audio-record'),
    audioTimer: document.getElementById('audio-timer'),
    btnAudioUploadTrigger: document.getElementById('btn-audio-upload-trigger'),
    audioFileInput: document.getElementById('audio-file-input'),
    audioWaveCanvas: document.getElementById('audio-wave-canvas'),
    audioPreviewContainer: document.getElementById('audio-preview-container'),
    audioPreviewPlayer: document.getElementById('audio-preview-player'),
    btnRemoveAudio: document.getElementById('btn-remove-audio'),
    
    // Speech Synthesis elements
    btnSpeakAnalysis: document.getElementById('btn-speak-analysis'),
    btnModalSpeakAnalysis: document.getElementById('btn-modal-speak-analysis'),

    // AI Reasoning elements
    analysisReasoningContainer: document.getElementById('analysis-reasoning-container'),
    analysisReasoningText: document.getElementById('analysis-reasoning-text'),
    
    // Analysis box
    activeKeyBadge: document.getElementById('active-key-badge'),
    analysisPlaceholder: document.getElementById('analysis-placeholder'),
    analysisLoading: document.getElementById('analysis-loading'),
    analysisContent: document.getElementById('analysis-content'),
    
    // Journal
    searchDreams: document.getElementById('search-dreams'),
    filterType: document.getElementById('filter-type'),
    filterStatus: document.getElementById('filter-status'),
    journalEmpty: document.getElementById('journal-empty'),
    dreamCardsContainer: document.getElementById('dream-cards-container'),
    
    // Analytics
    statTotalDreams: document.getElementById('stat-total-dreams'),
    statAnalyzedCount: document.getElementById('stat-analyzed-count'),
    statLucidCount: document.getElementById('stat-lucid-count'),
    statAvgClarity: document.getElementById('stat-avg-clarity'),
    weeklyChartWrapper: document.getElementById('weekly-chart-wrapper'),
    moodFrequencyContainer: document.getElementById('mood-frequency-container'),
    
    // Settings
    apiKey1: document.getElementById('api-key-1'),
    apiKey2: document.getElementById('api-key-2'),
    apiKey3: document.getElementById('api-key-3'),
    dotKey1: document.getElementById('dot-key-1'),
    dotKey2: document.getElementById('dot-key-2'),
    dotKey3: document.getElementById('dot-key-3'),
    btnExportData: document.getElementById('btn-export-data'),
    btnTriggerImport: document.getElementById('btn-trigger-import'),
    importFileInput: document.getElementById('import-file-input'),
    btnInstallApp: document.getElementById('btn-install-app'),
    btnClearData: document.getElementById('btn-clear-data'),
    settingsStatusMessage: document.getElementById('settings-status-message'),
    
    // Modal
    dreamDetailModal: document.getElementById('dream-detail-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalDreamTitle: document.getElementById('modal-dream-title'),
    modalDreamDate: document.getElementById('modal-dream-date'),
    modalTypeBadge: document.getElementById('modal-type-badge'),
    modalClarityBadge: document.getElementById('modal-clarity-badge'),
    modalMoodsRow: document.getElementById('modal-moods-row'),
    modalDreamDescription: document.getElementById('modal-dream-description'),
    modalTagsContainer: document.getElementById('modal-tags-container'),
    modalImageContainer: document.getElementById('modal-image-container'),
    modalDreamImage: document.getElementById('modal-dream-image'),
    modalKeyBadge: document.getElementById('modal-key-badge'),
    modalUnanalyzedState: document.getElementById('modal-unanalyzed-state'),
    modalAnalysisLoading: document.getElementById('modal-analysis-loading'),
    modalAnalysisContent: document.getElementById('modal-analysis-content'),
    btnModalAnalyze: document.getElementById('btn-modal-analyze'),
    btnModalDelete: document.getElementById('btn-modal-delete'),
    
    modalAudioContainer: document.getElementById('modal-audio-container'),
    modalDreamAudio: document.getElementById('modal-dream-audio'),
    modalReasoningContainer: document.getElementById('modal-reasoning-container'),
    modalReasoningText: document.getElementById('modal-reasoning-text')
  };

  // Deferred installation prompt for PWA
  let deferredPrompt = null;

  // --- INITIALIZATION ---
  function init() {
    initEcoMode();
    loadData();
    initFirebase();
    initStarfield();
    initDateDefault();
    registerEventListeners();
    updateUIForKeys();
    initSketchpad();
    initVoiceRecorder();
    initSpeechSynthesis();
    renderJournal();
    renderAnalytics();
    registerServiceWorker();
  }

  // Load from LocalStorage
  function loadData() {
    try {
      let stored = localStorage.getItem('alchera_dreams');
      if (!stored) {
        stored = localStorage.getItem('somnium_dreams') || localStorage.getItem('dreamvault_dreams'); // Migration fallback
      }
      state.dreams = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load dreams from localStorage", e);
      state.dreams = [];
    }
    
    try {
      let savedIndex = localStorage.getItem('alchera_key_index');
      if (!savedIndex) {
        savedIndex = localStorage.getItem('somnium_key_index') || localStorage.getItem('dreamvault_key_index'); // Migration fallback
      }
      state.currentKeyIndex = savedIndex ? parseInt(savedIndex, 10) : 1;
    } catch (e) {
      state.currentKeyIndex = 1;
    }

    // Set keys into Settings fields if they exist
    el.apiKey1.value = localStorage.getItem('openrouter_key_1') || '';
    el.apiKey2.value = localStorage.getItem('openrouter_key_2') || '';
    el.apiKey3.value = localStorage.getItem('openrouter_key_3') || '';

    // Load Firebase Config fields
    el.fbApiKey.value = localStorage.getItem('fb_api_key') || '';
    el.fbAuthDomain.value = localStorage.getItem('fb_auth_domain') || '';
    el.fbProjectId.value = localStorage.getItem('fb_project_id') || '';
    el.fbStorageBucket.value = localStorage.getItem('fb_storage_bucket') || '';
    el.fbSenderId.value = localStorage.getItem('fb_sender_id') || '';
    el.fbAppId.value = localStorage.getItem('fb_app_id') || '';
  }

  // Save to LocalStorage
  function saveDreams() {
    localStorage.setItem('alchera_dreams', JSON.stringify(state.dreams));
    renderJournal();
    renderAnalytics();
  }

  // Set default date to today's local date
  function initDateDefault() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    el.dreamDate.value = `${year}-${month}-${day}`;
  }

  // --- CELESTIAL BACKGROUND (STARFIELD) ---
  function initStarfield() {
    const canvas = el.starsCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let stars = [];
    const starCount = 100;
    let starfieldFrameId = null;
    
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          twinkleSpeed: 0.01 + Math.random() * 0.02,
          alpha: Math.random(),
          phase: Math.random() * Math.PI * 2
        });
      }
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    function draw() {
      if (state.ecoMode) {
        starfieldFrameId = null;
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.phase += s.twinkleSpeed;
        const currentAlpha = 0.2 + (Math.sin(s.phase) + 1) * 0.4 * s.alpha;
        
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.fill();
      }
      
      starfieldFrameId = requestAnimationFrame(draw);
    }
    
    state.restartStarfield = function() {
      if (!starfieldFrameId && !state.ecoMode) {
        draw();
      }
    };
    
    if (!state.ecoMode) {
      draw();
    }
  }

  // --- KEY CONFIGURATION MANAGEMENT ---
  function updateUIForKeys() {
    const k1 = el.apiKey1.value.trim();
    const k2 = el.apiKey2.value.trim();
    const k3 = el.apiKey3.value.trim();

    // Update dots in Settings panel
    if (k1) el.dotKey1.className = 'key-status-dot dot-key-1-active';
    else el.dotKey1.className = 'key-status-dot';

    if (k2) el.dotKey2.className = 'key-status-dot dot-key-2-active';
    else el.dotKey2.className = 'key-status-dot';

    if (k3) el.dotKey3.className = 'key-status-dot dot-key-3-active';
    else el.dotKey3.className = 'key-status-dot';

    // Calculate configured keys count
    let count = 0;
    if (k1) count++;
    if (k2) count++;
    if (k3) count++;

    // Update Status Pill in Header
    if (count > 0) {
      el.apiStatusPill.className = 'api-status-pill status-online';
      el.apiStatusText.textContent = `${count} Active Key${count > 1 ? 's' : ''}`;
    } else {
      el.apiStatusPill.className = 'api-status-pill status-offline';
      el.apiStatusText.textContent = 'Keys Missing';
    }
  }

  // --- HTML5 CANVAS SKETCHPAD ENGINE ---
  function initSketchpad() {
    const canvas = el.sketchCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set line endings
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Save blank history state
    saveSketchState();

    // Handle sketch colors selection
    const colorDots = document.querySelectorAll('.color-dot');
    colorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        colorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        
        const color = dot.getAttribute('data-color');
        if (color === 'eraser') {
          sketchState.brushColor = '#020204'; // Match canvas dark background
        } else {
          sketchState.brushColor = color;
        }
      });
    });

    // Handle brush sizing
    el.brushSizeSlider.addEventListener('input', (e) => {
      sketchState.brushSize = parseInt(e.target.value, 10);
      document.querySelector('.brush-size-val').textContent = `${sketchState.brushSize}px`;
    });

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', drawLine);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        
        // Responsive coord calculation
        const x = ((touch.clientX - rect.left) / rect.width) * canvas.width;
        const y = ((touch.clientY - rect.top) / rect.height) * canvas.height;
        
        sketchState.isDrawing = true;
        sketchState.lastX = x;
        sketchState.lastY = y;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    });

    canvas.addEventListener('touchmove', (e) => {
      if (sketchState.isDrawing && e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        
        const x = ((touch.clientX - rect.left) / rect.width) * canvas.width;
        const y = ((touch.clientY - rect.top) / rect.height) * canvas.height;
        
        drawStroke(x, y);
      }
    });

    canvas.addEventListener('touchend', stopDrawing);

    function startDrawing(e) {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      
      sketchState.isDrawing = true;
      sketchState.lastX = x;
      sketchState.lastY = y;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
    }

    function drawLine(e) {
      if (!sketchState.isDrawing) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      
      drawStroke(x, y);
    }

    function drawStroke(x, y) {
      ctx.strokeStyle = sketchState.brushColor;
      ctx.lineWidth = sketchState.brushSize;
      
      // Neon glow filter effect for normal colors
      if (sketchState.brushColor !== '#020204') {
        ctx.shadowBlur = 6;
        ctx.shadowColor = sketchState.brushColor;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.moveTo(sketchState.lastX, sketchState.lastY);
      ctx.lineTo(x, y);
      ctx.stroke();

      sketchState.lastX = x;
      sketchState.lastY = y;
    }

    function stopDrawing() {
      if (sketchState.isDrawing) {
        sketchState.isDrawing = false;
        saveSketchState();
        captureCanvasAttachment();
      }
    }

    // Save history slice
    function saveSketchState() {
      // Limit history to 15 frames
      if (sketchState.history.length >= 15) {
        sketchState.history.shift();
      }
      sketchState.history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }

    // Undo button
    el.btnSketchUndo.addEventListener('click', () => {
      if (sketchState.history.length > 1) {
        sketchState.history.pop(); // Remove current state
        const prevState = sketchState.history[sketchState.history.length - 1];
        ctx.putImageData(prevState, 0, 0);
        captureCanvasAttachment();
      }
    });

    // Clear canvas
    el.btnSketchClear.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sketchState.history = [];
      saveSketchState();
      resetAttachment();
    });

    // Capture sketch as compressed JPEG attachment
    function captureCanvasAttachment() {
      // Check if canvas has drawing (non-blank check)
      // A quick check is checking if any pixels differ from clear background
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let isCanvasBlank = true;
      for (let i = 0; i < imgData.data.length; i += 4) {
        if (imgData.data[i + 3] !== 0) { // alpha channel has content
          isCanvasBlank = false;
          break;
        }
      }

      if (isCanvasBlank) {
        resetAttachment();
        return;
      }

      // Compress and attach
      // We will create a temporary canvas to fill background with deep color,
      // as transparency converts to black on JPEG but we want it styled.
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const exportCtx = exportCanvas.getContext('2d');
      
      // Draw background
      exportCtx.fillStyle = '#020204';
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      
      // Draw sketch
      exportCtx.drawImage(canvas, 0, 0);
      
      // Export as compressed base64 JPEG
      state.attachedImage = exportCanvas.toDataURL('image/jpeg', 0.65);
      showAttachmentPreview();
    }
  }

  // --- DRAG AND DROP FILE UPLOADER & COMPRESSOR ---
  function initDropzone() {
    const dropzone = el.uploadDropzone;
    if (!dropzone) return;

    // Trigger click on browse
    dropzone.addEventListener('click', () => el.imageFileInput.click());

    el.imageFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) processAndAttachImage(file);
    });

    // Drag events
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        processAndAttachImage(file);
      }
    });
  }

  // Load image, downscale via canvas to max 600px, compress to ~30KB
  function processAndAttachImage(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        // Offscreen compression canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let width = img.width;
        let height = img.height;
        const maxBoundary = 600;

        if (width > maxBoundary || height > maxBoundary) {
          if (width > height) {
            height = Math.round((maxBoundary / width) * height);
            width = maxBoundary;
          } else {
            width = Math.round((maxBoundary / height) * width);
            height = maxBoundary;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        // Draw & Compress
        ctx.drawImage(img, 0, 0, width, height);
        state.attachedImage = canvas.toDataURL('image/jpeg', 0.6); // 60% quality compression
        
        showAttachmentPreview();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function showAttachmentPreview() {
    el.attachmentPreviewImg.src = state.attachedImage;
    el.attachmentPreviewContainer.classList.remove('hidden');
  }

  function resetAttachment() {
    state.attachedImage = null;
    el.attachmentPreviewImg.src = '';
    el.attachmentPreviewContainer.classList.add('hidden');
    el.imageFileInput.value = '';
  }

  // --- AUDIO SYNTH ENGINE (SYNTHESIZED STEREO BINAURAL BEATS) ---
  function initAmbientSynthEngine() {
    el.btnSoundscapeToggle.addEventListener('click', () => {
      if (audioState.isPlaying) {
        stopSoundscape();
      } else {
        startSoundscape();
      }
    });

    el.soundscapeSelect.addEventListener('change', () => {
      if (audioState.isPlaying) {
        // Re-configure oscillators on active play
        stopSoundscape();
        startSoundscape();
      }
    });

    el.soundscapeVolume.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (audioState.mainGain) {
        audioState.mainGain.gain.setValueAtTime(val, audioState.audioCtx.currentTime);
      }
    });
  }

  function startSoundscape() {
    try {
      // Initialize AudioContext on user gesture click
      if (!audioState.audioCtx) {
        audioState.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioState.audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create Nodes
      audioState.leftOsc = ctx.createOscillator();
      audioState.rightOsc = ctx.createOscillator();
      
      const leftGain = ctx.createGain();
      const rightGain = ctx.createGain();
      
      const merger = ctx.createChannelMerger(2);
      
      audioState.filter = ctx.createBiquadFilter();
      audioState.mainGain = ctx.createGain();
      
      // Analyser node for real-time wave animation
      audioState.analyser = ctx.createAnalyser();
      audioState.analyser.fftSize = 32;

      // Select preset frequencies
      const preset = el.soundscapeSelect.value;
      let leftFreq = 100;
      let rightFreq = 106; // 6Hz Theta Lucid beat
      let filterCutoff = 220;
      let lfoFreq = 0.12;

      if (preset === 'astral') {
        leftFreq = 136;
        rightFreq = 144; // 8Hz Alpha beat
        filterCutoff = 320;
        lfoFreq = 0.22;
      } else if (preset === 'cosmic') {
        leftFreq = 70;
        rightFreq = 74;  // 4Hz Delta beat
        filterCutoff = 150;
        lfoFreq = 0.08;
      }

      // Oscillator settings
      audioState.leftOsc.type = 'sine';
      audioState.leftOsc.frequency.value = leftFreq;
      
      audioState.rightOsc.type = 'sine';
      audioState.rightOsc.frequency.value = rightFreq;

      // Pulse volume LFO modulator (adds sweeping space-wind motion)
      audioState.lfo = ctx.createOscillator();
      audioState.lfo.frequency.value = lfoFreq;
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.18; // pulse depth

      // Connections
      audioState.leftOsc.connect(leftGain);
      audioState.rightOsc.connect(rightGain);
      
      // Route oscillators to stereo channels
      leftGain.connect(merger, 0, 0);  // Left channel
      rightGain.connect(merger, 0, 1); // Right channel
      
      // Modulation: LFO controls gain nodes for swaying pulses
      audioState.lfo.connect(lfoGain);
      lfoGain.connect(leftGain.gain); // modulates left volume
      
      // Warm filter
      audioState.filter.type = 'lowpass';
      audioState.filter.frequency.value = filterCutoff;
      
      merger.connect(audioState.filter);
      audioState.filter.connect(audioState.analyser);
      audioState.analyser.connect(audioState.mainGain);
      
      audioState.mainGain.connect(ctx.destination);
      
      // Vol set
      const volume = parseFloat(el.soundscapeVolume.value);
      audioState.mainGain.gain.setValueAtTime(volume, ctx.currentTime);

      // Start oscs
      audioState.leftOsc.start(0);
      audioState.rightOsc.start(0);
      audioState.lfo.start(0);

      // Update state & UI
      audioState.isPlaying = true;
      document.querySelector('.soundscapes-widget').classList.add('playing');
      el.btnSoundscapeToggle.querySelector('.play-icon').classList.add('hidden');
      el.btnSoundscapeToggle.querySelector('.pause-icon').classList.remove('hidden');

      // Start visualizer animation loop
      animateAudioVisualizer();

    } catch (e) {
      console.error("Synthesizer initialization failed", e);
    }
  }

  function stopSoundscape() {
    if (audioState.leftOsc) {
      try { audioState.leftOsc.stop(0); } catch (e) {}
    }
    if (audioState.rightOsc) {
      try { audioState.rightOsc.stop(0); } catch (e) {}
    }
    if (audioState.lfo) {
      try { audioState.lfo.stop(0); } catch (e) {}
    }

    cancelAnimationFrame(audioState.visualizerTimer);

    audioState.isPlaying = false;
    document.querySelector('.soundscapes-widget').classList.remove('playing');
    el.btnSoundscapeToggle.querySelector('.play-icon').classList.remove('hidden');
    el.btnSoundscapeToggle.querySelector('.pause-icon').classList.add('hidden');
    
    // Reset bar visualizer heights
    const bars = el.soundscapeVisualizer.querySelectorAll('.wave-bar');
    bars.forEach(bar => {
      bar.style.height = '3px';
    });
  }

  // Animates micro visualizer using real Web Audio frequency data
  function animateAudioVisualizer() {
    if (!audioState.isPlaying || !audioState.analyser) return;

    const bufferLength = audioState.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    audioState.analyser.getByteFrequencyData(dataArray);

    const bars = el.soundscapeVisualizer.querySelectorAll('.wave-bar');
    
    bars.forEach((bar, index) => {
      // Map frequency bin value to bar heights (range 3px - 14px)
      const dataVal = dataArray[index] || 0;
      const height = 3 + (dataVal / 255) * 11;
      bar.style.height = `${height}px`;
    });

    audioState.visualizerTimer = requestAnimationFrame(animateAudioVisualizer);
  }

  // --- EVENT REGISTRATION ---
  function registerEventListeners() {
    // Navigation switching
    el.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });

    // Form selection & pills
    el.moodPillContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('mood-pill')) {
        const mood = e.target.getAttribute('data-mood');
        e.target.classList.toggle('selected');
        
        if (state.selectedMoods.includes(mood)) {
          state.selectedMoods = state.selectedMoods.filter(m => m !== mood);
        } else {
          state.selectedMoods.push(mood);
        }
      }
    });

    // Tag adding
    el.tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const value = el.tagInput.value.trim();
        if (value && !state.tags.includes(value)) {
          state.tags.push(value);
          renderTagChips();
        }
        el.tagInput.value = '';
      }
    });

    // Illustration Panel Tabs switcher
    el.illusTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        el.illusTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const activePanel = tab.getAttribute('data-tab-name');
        state.activeIllusTab = activePanel;

        el.illusPanels.forEach(panel => {
          if (panel.id === `panel-${activePanel}`) {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });

    // File Dropzone init
    initDropzone();

    // Remove attachment button
    el.btnRemoveAttachment.addEventListener('click', resetAttachment);

    // Save buttons
    el.btnSaveOnly.addEventListener('click', () => saveDreamEntry(false));
    el.btnSaveAnalyze.addEventListener('click', () => saveDreamEntry(true));

    // Audio soundscapes engine start
    initAmbientSynthEngine();

    // Journal Search & Filter
    el.searchDreams.addEventListener('input', renderJournal);
    el.filterType.addEventListener('change', renderJournal);
    el.filterStatus.addEventListener('change', renderJournal);

    // Modal Events
    el.modalCloseBtn.addEventListener('click', closeModal);
    el.dreamDetailModal.addEventListener('click', (e) => {
      if (e.target === el.dreamDetailModal) {
        closeModal();
      }
    });
    
    // Analyze from Modal
    el.btnModalAnalyze.addEventListener('click', () => {
      const activeId = el.dreamDetailModal.getAttribute('data-active-id');
      if (activeId) {
        analyzeIndividualDream(activeId);
      }
    });

    // Delete from Modal
    el.btnModalDelete.addEventListener('click', () => {
      const activeId = el.dreamDetailModal.getAttribute('data-active-id');
      if (activeId && confirm('Are you sure you want to permanently erase this dream from the vault?')) {
        state.dreams = state.dreams.filter(d => d.id !== activeId);
        saveDreams();
        closeModal();
      }
    });

    // Settings Keys Keyup Listener (save on input)
    el.apiKey1.addEventListener('input', (e) => {
      localStorage.setItem('openrouter_key_1', e.target.value.trim());
      updateUIForKeys();
    });
    el.apiKey2.addEventListener('input', (e) => {
      localStorage.setItem('openrouter_key_2', e.target.value.trim());
      updateUIForKeys();
    });
    el.apiKey3.addEventListener('input', (e) => {
      localStorage.setItem('openrouter_key_3', e.target.value.trim());
      updateUIForKeys();
    });

    // Export Data
    el.btnExportData.addEventListener('click', exportVaultData);

    // Import Data
    el.btnTriggerImport.addEventListener('click', () => el.importFileInput.click());
    el.importFileInput.addEventListener('change', importVaultData);

    // App Installation
    el.btnInstallApp.addEventListener('click', installAppPrompt);

    // Clear Data
    el.btnClearData.addEventListener('click', clearAllVaultData);

    // Eco Mode Toggle
    el.btnEcoToggle.addEventListener('click', toggleEcoMode);

    // Firebase Auth Events
    el.btnGoogleLogin.addEventListener('click', loginWithGoogle);
    el.btnGuestMode.addEventListener('click', () => {
      state.guestMode = true;
      switchLandingState();
    });
    el.btnSignout.addEventListener('click', () => {
      if (confirm("Sign out from your Google account?")) {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
          firebase.auth().signOut();
        }
      }
    });
    el.btnSaveFirebase.addEventListener('click', saveFirebaseConfig);
    el.btnDisconnectFirebase.addEventListener('click', disconnectFirebase);
  }

  // --- NAV SWITCHER ---
  function switchTab(tabId) {
    state.activeTab = tabId;
    
    // Interrupt any active dream read-aloud speech when navigating
    stopSpeech();
    
    // Update active tab styles
    el.navTabs.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Switch panels with a quick fade-in transition
    el.viewPanels.forEach(panel => {
      if (panel.id === `${tabId}-view`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // Re-render analytics tab components specifically when entering
    if (tabId === 'analytics') {
      renderAnalytics();
    }
  }

  // --- TAG CHIP RENDERING ---
  function renderTagChips() {
    el.tagChips.innerHTML = '';
    state.tags.forEach(tag => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.innerHTML = `
        <span>${escapeHTML(tag)}</span>
        <span class="remove-tag" data-tag="${escapeHTML(tag)}">×</span>
      `;
      el.tagChips.appendChild(chip);
    });

    // Add close events
    el.tagChips.querySelectorAll('.remove-tag').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tag = e.target.getAttribute('data-tag');
        state.tags = state.tags.filter(t => t !== tag);
        renderTagChips();
      });
    });
  }

  // --- SAVE DREAM LOGIC ---
  async function saveDreamEntry(shouldAnalyze) {
    // Reset validation errors
    el.formError.classList.add('hidden');
    el.dreamTitle.classList.remove('error-field');
    el.dreamDescription.classList.remove('error-field');

    const title = el.dreamTitle.value.trim();
    const description = el.dreamDescription.value.trim();
    const date = el.dreamDate.value;
    const type = el.dreamType.value;
    const clarity = parseInt(el.dreamClarity.value, 10);

    // Validate inputs
    let hasError = false;
    if (!title) {
      el.dreamTitle.classList.add('error-field');
      hasError = true;
    }
    if (!description) {
      el.dreamDescription.classList.add('error-field');
      hasError = true;
    }

    if (hasError) {
      el.errorMessage.textContent = "Title and Subconscious narrative description are required to catalog the dream.";
      el.formError.classList.remove('hidden');
      return;
    }

    // Assemble new dream object
    const newDream = {
      id: 'dream_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      title: title,
      description: description,
      date: date || new Date().toISOString().split('T')[0],
      type: type,
      clarity: clarity,
      moods: [...state.selectedMoods],
      tags: [...state.tags],
      image: state.attachedImage, // Save the compressed base64 JPEG
      audio: state.attachedAudio, // Save the voice base64
      audioFormat: state.attachedAudioFormat,
      analysis: null,
      reasoning: null,
      usedKey: null
    };

    // Save locally
    state.dreams.push(newDream);
    saveDreams();

    // Clear form inputs
    el.dreamTitle.value = '';
    el.dreamDescription.value = '';
    initDateDefault();
    el.dreamType.value = 'Normal';
    el.dreamClarity.value = 3;
    state.selectedMoods = [];
    state.tags = [];
    renderTagChips();
    
    // Clear sketch canvas
    const canvas = el.sketchCanvas;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sketchState.history = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
    }
    
    // Reset attachment previews
    resetAttachment();
    removeAudioAttachment();

    // Deselect mood pills UI
    el.moodPillContainer.querySelectorAll('.mood-pill').forEach(pill => {
      pill.classList.remove('selected');
    });

    if (shouldAnalyze) {
      // Show loader in analysis container immediately
      el.analysisPlaceholder.classList.add('hidden');
      el.analysisContent.classList.add('hidden');
      el.activeKeyBadge.classList.add('hidden');
      el.btnSpeakAnalysis.classList.add('hidden');
      el.analysisReasoningContainer.classList.add('hidden');
      el.analysisLoading.classList.remove('hidden');

      // Call API
      const result = await runAnalysisAPI(
        newDream.description, 
        newDream.title, 
        newDream.type, 
        newDream.moods.join(', '), 
        newDream.clarity,
        newDream.image
      );
      
      el.analysisLoading.classList.add('hidden');

      if (result.success) {
        // Save analysis into array
        const savedIndex = state.dreams.findIndex(d => d.id === newDream.id);
        if (savedIndex !== -1) {
          state.dreams[savedIndex].analysis = result.content;
          state.dreams[savedIndex].reasoning = result.reasoning || null;
          state.dreams[savedIndex].usedKey = result.keyBadge;
          saveDreams();
        }

        // Show reasoning trace if present
        if (result.reasoning) {
          el.analysisReasoningText.textContent = result.reasoning;
          el.analysisReasoningContainer.classList.remove('hidden');
        }

        // Render Markdown content
        if (typeof marked !== 'undefined') {
          el.analysisContent.innerHTML = marked.parse(result.content);
        } else {
          el.analysisContent.innerHTML = `<pre style="white-space: pre-wrap;">${escapeHTML(result.content)}</pre>`;
        }
        el.activeKeyBadge.textContent = result.keyBadge;
        el.activeKeyBadge.classList.remove('hidden');
        el.analysisContent.classList.remove('hidden');
        el.btnSpeakAnalysis.classList.remove('hidden');
      } else {
        // Render error output
        el.analysisPlaceholder.innerHTML = `
          <div style="color:var(--color-danger); padding:1rem;">
            <h3>Subconscious Connection Interrupted</h3>
            <p>${escapeHTML(result.error)}</p>
          </div>
        `;
        el.analysisPlaceholder.classList.remove('hidden');
      }
    } else {
      // Transition to journal view to let the user see the saved card
      switchTab('journal');
    }
  }

  // --- OPENROUTER API MULTIMODAL CALL ENGINE ---
  async function runAnalysisAPI(description, title, type, moods, clarity, image, retryCount = 0) {
    // Gather entered keys
    const keys = [
      { id: 1, name: 'Key 1', value: localStorage.getItem('openrouter_key_1') || '' },
      { id: 2, name: 'Key 2', value: localStorage.getItem('openrouter_key_2') || '' },
      { id: 3, name: 'Key 3', value: localStorage.getItem('openrouter_key_3') || '' }
    ];

    const activeKeys = keys.filter(k => k.value.trim() !== '');

    if (activeKeys.length === 0) {
      return {
        success: false,
        error: "No active API keys configured. Set at least one OpenRouter API key in Settings."
      };
    }

    // Determine key to use based on round robin index
    let selectedKeyObject = activeKeys.find(k => k.id === state.currentKeyIndex);
    if (!selectedKeyObject) {
      selectedKeyObject = activeKeys[0];
    }

    const apiKey = selectedKeyObject.value.trim();
    const keyName = selectedKeyObject.name;

    // Multimodal payload formulation
    let userMessageContent;
    if (image) {
      userMessageContent = [
        {
          type: 'text',
          text: `Dream Title: ${title}\nDescription: ${description}\nType: ${type}\nMoods: ${moods}\nClarity: ${clarity}/5\n\nPlease interpret this dream. In your analysis, explain the subconscious connections of both the narrative details above and the attached symbol/drawing.`
        },
        {
          type: 'image_url',
          image_url: {
            url: image // Binds the base64 JPEG
          }
        }
      ];
    } else {
      userMessageContent = `Dream Title: ${title}\nDescription: ${description}\nType: ${type}\nMoods: ${moods}\nClarity: ${clarity}/5`;
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://alchera.local',
          'X-Title': 'Alchera'
        },
        body: JSON.stringify({
          model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
          messages: [
            {
              role: 'system',
              content: 'You are a professional dream interpreter, psychoanalyst, and celestial mystic. Analyze the user\'s dream details. Provide an inspiring, deep, structured analysis formatted in beautiful markdown (use headers, lists, and a highlighted blockquote for the core advice/archetype). Focus on symbolic representations, archetypal alignments, emotional releases, and subconscious advice. Keep your response concise, engaging, and cosmic in tone.'
            },
            {
              role: 'user',
              content: userMessageContent
            }
          ],
          reasoning: {
            enabled: true
          }
        })
      });

      // Handle 429 Rate Limit error
      if (response.status === 429) {
        if (retryCount >= 3 || activeKeys.length === 1) {
          return {
            success: false,
            error: "Selected API Key returned a 429 Rate Limit. No other keys could handle the request."
          };
        }

        // Rotate index to the next key ID: sequential round robin
        let nextIndex = state.currentKeyIndex + 1;
        if (nextIndex > 3) nextIndex = 1;
        state.currentKeyIndex = nextIndex;
        localStorage.setItem('alchera_key_index', state.currentKeyIndex);

        // Retry recursively with the next index
        return await runAnalysisAPI(description, title, type, moods, clarity, image, retryCount + 1);
      }

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API Request Failed (HTTP ${response.status}): ${errorText || response.statusText}`
        };
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const completionText = data.choices[0].message.content;
        const reasoningText = data.choices[0].message.reasoning || '';

        // Advance key index to the next key ID in round robin fashion for the next api call
        let nextIndex = state.currentKeyIndex + 1;
        if (nextIndex > 3) nextIndex = 1;
        state.currentKeyIndex = nextIndex;
        localStorage.setItem('alchera_key_index', state.currentKeyIndex);

        return {
          success: true,
          content: completionText,
          reasoning: reasoningText,
          keyBadge: keyName
        };
      } else {
        return {
          success: false,
          error: "Empty or unrecognized completion response from OpenRouter."
        };
      }

    } catch (err) {
      console.error("OpenRouter API invocation exception", err);
      return {
        success: false,
        error: `Network connection error: ${err.message}`
      };
    }
  }

  // --- JOURNAL RENDER LOGIC ---
  function renderJournal() {
    const searchQuery = el.searchDreams.value.toLowerCase().trim();
    const typeFilter = el.filterType.value;
    const statusFilter = el.filterStatus.value;

    // Filter dreams
    const filtered = state.dreams.filter(dream => {
      // Search text matches title, description, or tags
      const matchesSearch = 
        dream.title.toLowerCase().includes(searchQuery) ||
        dream.description.toLowerCase().includes(searchQuery) ||
        (dream.tags && dream.tags.some(t => t.toLowerCase().includes(searchQuery)));
      
      // Type matches
      const matchesType = (typeFilter === 'All' || dream.type === typeFilter);

      // Status matches
      let matchesStatus = true;
      if (statusFilter === 'Analyzed') {
        matchesStatus = (dream.analysis !== null);
      } else if (statusFilter === 'Unanalyzed') {
        matchesStatus = (dream.analysis === null);
      }

      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort newest-first (timestamp / id sorting)
    filtered.sort((a, b) => {
      return new Date(b.date + 'T00:00:00') - new Date(a.date + 'T00:00:00') || b.id.localeCompare(a.id);
    });

    // Handle empty views
    if (filtered.length === 0) {
      el.dreamCardsContainer.classList.add('hidden');
      el.journalEmpty.classList.remove('hidden');
      return;
    }

    el.journalEmpty.classList.add('hidden');
    el.dreamCardsContainer.classList.remove('hidden');
    el.dreamCardsContainer.innerHTML = '';

    filtered.forEach(dream => {
      const card = document.createElement('div');
      card.className = 'dream-card glass-card';
      
      // Image attachment header
      let imageHTML = '';
      if (dream.image) {
        imageHTML = `
          <div class="card-image-wrapper">
            <img src="${dream.image}" alt="${escapeHTML(dream.title)} preview">
          </div>
        `;
      }
      
      // Badges
      let badgeHTML = `<span class="badge badge-type">${escapeHTML(dream.type)}</span>`;
      badgeHTML += `<span class="badge badge-clarity">Clarity: ${dream.clarity}/5</span>`;
      
      dream.moods.slice(0, 3).forEach(m => {
        badgeHTML += `<span class="badge badge-mood">${escapeHTML(m)}</span>`;
      });
      
      if (dream.moods.length > 3) {
        badgeHTML += `<span class="badge badge-mood">+${dream.moods.length - 3}</span>`;
      }

      // Excerpt preview
      const previewText = dream.description.length > 100 
        ? dream.description.substring(0, 100) + '...' 
        : dream.description;

      const dateStr = formatDate(dream.date);

      card.innerHTML = `
        ${imageHTML}
        <div class="card-header">
          <span class="card-date">${dateStr}</span>
          ${dream.analysis ? '<span class="badge-analyzed">Analyzed ✓</span>' : ''}
        </div>
        <h3 class="card-title">${escapeHTML(dream.title)}</h3>
        <p class="card-excerpt">${escapeHTML(previewText)}</p>
        <div class="card-badges">
          ${badgeHTML}
        </div>
      `;

      card.addEventListener('click', () => openModal(dream));
      el.dreamCardsContainer.appendChild(card);
    });
  }

  // --- MODAL CONTROLLER ---
  function openModal(dream) {
    el.dreamDetailModal.setAttribute('data-active-id', dream.id);
    
    el.modalDreamTitle.textContent = dream.title;
    el.modalDreamDate.textContent = formatDate(dream.date);
    el.modalTypeBadge.textContent = dream.type;
    el.modalClarityBadge.textContent = `Clarity: ${dream.clarity}/5`;
    
    // Renders description
    el.modalDreamDescription.textContent = dream.description;

    // Renders image attachment inside Modal
    if (dream.image) {
      el.modalDreamImage.src = dream.image;
      el.modalImageContainer.classList.remove('hidden');
    } else {
      el.modalDreamImage.src = '';
      el.modalImageContainer.classList.add('hidden');
    }

    // Renders audio note inside Modal
    if (dream.audio) {
      el.modalDreamAudio.src = dream.audio;
      el.modalAudioContainer.classList.remove('hidden');
    } else {
      el.modalDreamAudio.src = '';
      el.modalAudioContainer.classList.add('hidden');
    }

    // Renders mood list
    el.modalMoodsRow.innerHTML = '';
    dream.moods.forEach(mood => {
      const span = document.createElement('span');
      span.className = 'badge badge-mood';
      span.textContent = mood;
      el.modalMoodsRow.appendChild(span);
    });

    // Renders tags list
    el.modalTagsContainer.innerHTML = '';
    if (dream.tags && dream.tags.length > 0) {
      dream.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag-chip';
        span.textContent = `#${tag}`;
        el.modalTagsContainer.appendChild(span);
      });
      el.modalTagsContainer.classList.remove('hidden');
    } else {
      el.modalTagsContainer.classList.add('hidden');
    }

    // Toggle analysis box contents
    el.modalAnalysisLoading.classList.add('hidden');
    el.modalKeyBadge.classList.add('hidden');
    el.btnModalSpeakAnalysis.classList.add('hidden');
    el.modalReasoningContainer.classList.add('hidden');

    if (dream.analysis) {
      el.modalUnanalyzedState.classList.add('hidden');

      // Render reasoning if present
      if (dream.reasoning) {
        el.modalReasoningText.textContent = dream.reasoning;
        el.modalReasoningContainer.classList.remove('hidden');
      }

      if (typeof marked !== 'undefined') {
        el.modalAnalysisContent.innerHTML = marked.parse(dream.analysis);
      } else {
        el.modalAnalysisContent.innerHTML = `<pre style="white-space: pre-wrap;">${escapeHTML(dream.analysis)}</pre>`;
      }
      el.modalKeyBadge.textContent = dream.usedKey || 'Key Used';
      el.modalKeyBadge.classList.remove('hidden');
      el.modalAnalysisContent.classList.remove('hidden');
      el.btnModalSpeakAnalysis.classList.remove('hidden');
    } else {
      el.modalAnalysisContent.classList.add('hidden');
      el.modalUnanalyzedState.classList.remove('hidden');
    }

    // Show modal
    el.dreamDetailModal.classList.remove('hidden');
  }

  function closeModal() {
    el.dreamDetailModal.classList.add('hidden');
    el.dreamDetailModal.removeAttribute('data-active-id');
  }

  // Analyze unanalyzed dream from inside modal
  async function analyzeIndividualDream(dreamId) {
    const dreamIndex = state.dreams.findIndex(d => d.id === dreamId);
    if (dreamIndex === -1) return;
    
    const dream = state.dreams[dreamIndex];

    // Toggle UI loader
    el.modalUnanalyzedState.classList.add('hidden');
    el.modalAnalysisContent.classList.add('hidden');
    el.modalKeyBadge.classList.add('hidden');
    el.btnModalSpeakAnalysis.classList.add('hidden');
    el.modalReasoningContainer.classList.add('hidden');
    el.modalAnalysisLoading.classList.remove('hidden');

    // Run multimodal API analysis
    const result = await runAnalysisAPI(
      dream.description, 
      dream.title, 
      dream.type, 
      dream.moods.join(', '), 
      dream.clarity,
      dream.image
    );
    
    el.modalAnalysisLoading.classList.add('hidden');

    if (result.success) {
      // Save result
      state.dreams[dreamIndex].analysis = result.content;
      state.dreams[dreamIndex].reasoning = result.reasoning || null;
      state.dreams[dreamIndex].usedKey = result.keyBadge;
      saveDreams();

      // Render reasoning if present
      if (result.reasoning) {
        el.modalReasoningText.textContent = result.reasoning;
        el.modalReasoningContainer.classList.remove('hidden');
      }

      // Render updated content
      if (typeof marked !== 'undefined') {
        el.modalAnalysisContent.innerHTML = marked.parse(result.content);
      } else {
        el.modalAnalysisContent.innerHTML = `<pre style="white-space: pre-wrap;">${escapeHTML(result.content)}</pre>`;
      }
      el.modalKeyBadge.textContent = result.keyBadge;
      el.modalKeyBadge.classList.remove('hidden');
      el.modalAnalysisContent.classList.remove('hidden');
      el.btnModalSpeakAnalysis.classList.remove('hidden');
    } else {
      // Show modal error message
      alert(`Interpretation Error: ${result.error}`);
      el.modalUnanalyzedState.classList.remove('hidden');
    }
  }

  // --- ANALYTICS ENGINE & CHARTS ---
  function renderAnalytics() {
    const total = state.dreams.length;
    const analyzed = state.dreams.filter(d => d.analysis !== null).length;
    const lucid = state.dreams.filter(d => d.type === 'Lucid').length;
    
    // Average clarity calculation
    let avgClarity = 0.0;
    if (total > 0) {
      const sum = state.dreams.reduce((acc, curr) => acc + curr.clarity, 0);
      avgClarity = (sum / total).toFixed(1);
    }

    // Set UI cards text
    el.statTotalDreams.textContent = total;
    el.statAnalyzedCount.textContent = analyzed;
    el.statLucidCount.textContent = lucid;
    el.statAvgClarity.textContent = avgClarity;

    // 1. Build weekly bar chart using custom responsive SVG
    renderWeeklyBarChart();

    // 2. Build subconscious mood list ranked by frequency
    renderMoodRankings();
  }

  function renderWeeklyBarChart() {
    const wrapper = el.weeklyChartWrapper;
    if (!wrapper) return;
    wrapper.innerHTML = '';

    // Calculate dates for last 7 days (ending today)
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    // Group logs by day counts
    const dailyCounts = {};
    dates.forEach(date => { dailyCounts[date] = 0; });
    
    state.dreams.forEach(dream => {
      if (dailyCounts[dream.date] !== undefined) {
        dailyCounts[dream.date]++;
      }
    });

    const values = dates.map(date => dailyCounts[date]);
    const maxVal = Math.max(...values, 3); // minimum scaling height of 3 for nice displays

    // Create SVG dynamically
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "chart-svg");
    svg.setAttribute("viewBox", "0 0 400 220");

    // Defs for Bar Gradient
    const defs = document.createElementNS(svgNS, "defs");
    const gradient = document.createElementNS(svgNS, "linearGradient");
    gradient.setAttribute("id", "barGradient");
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "100%");
    gradient.setAttribute("x2", "0%");
    gradient.setAttribute("y2", "0%");
    
    const stop1 = document.createElementNS(svgNS, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "var(--accent-purple)");
    
    const stop2 = document.createElementNS(svgNS, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "var(--accent-cyan)");

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Render Grid Lines & Axes
    const chartHeight = 160;
    const chartWidth = 340;
    const startX = 40;
    const startY = 20;

    // Draw horizontal grid lines
    const gridLines = 3;
    for (let i = 0; i <= gridLines; i++) {
      const yVal = startY + (chartHeight / gridLines) * i;
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", startX);
      line.setAttribute("y1", yVal);
      line.setAttribute("x2", startX + chartWidth);
      line.setAttribute("y2", yVal);
      line.setAttribute("class", "chart-grid-line");
      svg.appendChild(line);
      
      // Grid Y labels
      const labelVal = Math.round((maxVal / gridLines) * (gridLines - i));
      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("x", startX - 10);
      text.setAttribute("y", yVal + 4);
      text.setAttribute("class", "chart-text");
      text.setAttribute("style", "text-anchor: end;");
      text.textContent = labelVal;
      svg.appendChild(text);
    }

    // Render columns
    const colWidth = chartWidth / 7;
    const padding = 12;

    dates.forEach((date, index) => {
      const val = dailyCounts[date];
      const barHeight = (val / maxVal) * chartHeight;
      const x = startX + index * colWidth + padding;
      const y = startY + chartHeight - barHeight;
      const w = colWidth - padding * 2;

      // Create bar
      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", w);
      rect.setAttribute("height", Math.max(barHeight, 2)); // keep min size height
      rect.setAttribute("class", "chart-bar");
      svg.appendChild(rect);

      // Value label on top of bar
      if (val > 0) {
        const textVal = document.createElementNS(svgNS, "text");
        textVal.setAttribute("x", x + w / 2);
        textVal.setAttribute("y", y - 6);
        textVal.setAttribute("class", "chart-value-text");
        textVal.textContent = val;
        svg.appendChild(textVal);
      }

      // Day label underneath
      const textDay = document.createElementNS(svgNS, "text");
      textDay.setAttribute("x", x + w / 2);
      textDay.setAttribute("y", startY + chartHeight + 18);
      textDay.setAttribute("class", "chart-text");
      
      const parts = date.split('-');
      const formattedDate = `${parts[1]}/${parts[2]}`; // MM/DD display format
      textDay.textContent = formattedDate;
      svg.appendChild(textDay);
    });

    wrapper.appendChild(svg);
  }

  function renderMoodRankings() {
    const container = el.moodFrequencyContainer;
    if (!container) return;
    container.innerHTML = '';

    // Calculate mood frequency
    const moodCounts = {};
    state.dreams.forEach(dream => {
      dream.moods.forEach(m => {
        moodCounts[m] = (moodCounts[m] || 0) + 1;
      });
    });

    // Convert to sorted array
    const sortedMoods = Object.keys(moodCounts).map(mood => {
      return {
        mood: mood,
        count: moodCounts[mood]
      };
    });

    sortedMoods.sort((a, b) => b.count - a.count);

    if (sortedMoods.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:3rem 1rem; color:var(--text-muted); width:100%;">
          <p>Record dreams with mood tags to map your subconscious emotions.</p>
        </div>
      `;
      return;
    }

    const maxCount = sortedMoods[0].count;

    sortedMoods.slice(0, 5).forEach(item => {
      const percentage = (item.count / maxCount) * 100;
      
      const row = document.createElement('div');
      row.className = 'mood-rank-row';
      row.innerHTML = `
        <div class="mood-rank-info">
          <span class="mood-rank-label">${escapeHTML(item.mood)}</span>
          <span class="mood-rank-count">${item.count} log${item.count > 1 ? 's' : ''}</span>
        </div>
        <div class="mood-progress-bg">
          <div class="mood-progress-bar" style="width: 0%;"></div>
        </div>
      `;
      
      container.appendChild(row);

      // Trigger width growth animation dynamically on next tick
      setTimeout(() => {
        const progressBar = row.querySelector('.mood-progress-bar');
        if (progressBar) progressBar.style.width = `${percentage}%`;
      }, 50);
    });
  }

  // --- SETTINGS IMPORT, EXPORT, APP RESET ---
  function exportVaultData() {
    if (state.dreams.length === 0) {
      showSettingsMessage("No dreams cataloged in the vault to export.", "error");
      return;
    }

    try {
      const dataStr = JSON.stringify(state.dreams, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const today = new Date().toISOString().split('T')[0];
      const exportFileDefaultName = `dreamvault_backup_${today}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      showSettingsMessage("Dream logs exported successfully.", "success");
    } catch (err) {
      showSettingsMessage(`Failed to export data: ${err.message}`, "error");
    }
  }

  function importVaultData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const importedList = JSON.parse(event.target.result);
        
        if (!Array.isArray(importedList)) {
          throw new Error("Import payload must be a JSON array of dream entries.");
        }

        // Validate structure and filter duplicates by checking uniqueness of IDs
        let addedCount = 0;
        importedList.forEach(entry => {
          if (entry && entry.id && entry.title && entry.description) {
            const exists = state.dreams.some(existing => existing.id === entry.id);
            if (!exists) {
              state.dreams.push({
                id: entry.id,
                title: entry.title,
                description: entry.description,
                date: entry.date || new Date().toISOString().split('T')[0],
                type: entry.type || 'Normal',
                clarity: parseInt(entry.clarity, 10) || 3,
                moods: Array.isArray(entry.moods) ? entry.moods : [],
                tags: Array.isArray(entry.tags) ? entry.tags : [],
                image: entry.image || null, // Support importing attachments
                analysis: entry.analysis || null,
                usedKey: entry.usedKey || null
              });
              addedCount++;
            }
          }
        });

        if (addedCount > 0) {
          saveDreams();
          showSettingsMessage(`Import completed successfully. Integrated ${addedCount} new log${addedCount > 1 ? 's' : ''} into the vault.`, "success");
        } else {
          showSettingsMessage("Import finished. No new or unique dream logs were found.", "success");
        }

        // Clear file input
        el.importFileInput.value = '';

      } catch (err) {
        showSettingsMessage(`Failed to parse file: ${err.message}`, "error");
        el.importFileInput.value = '';
      }
    };
    reader.readAsText(file);
  }

  function showSettingsMessage(msg, type) {
    el.settingsStatusMessage.className = `settings-message ${type}`;
    el.settingsStatusMessage.textContent = msg;
    el.settingsStatusMessage.classList.remove('hidden');

    setTimeout(() => {
      el.settingsStatusMessage.classList.add('hidden');
    }, 5000);
  }

  function clearAllVaultData() {
    if (confirm("WARNING: This will permanently erase ALL configuration variables, API keys, and dream journal files stored in this browser. This cannot be undone. Proceed?")) {
      stopSoundscape();
      localStorage.clear();
      state.dreams = [];
      state.selectedMoods = [];
      state.tags = [];
      state.currentKeyIndex = 1;
      state.attachedImage = null;
      
      // Reset keys fields
      el.apiKey1.value = '';
      el.apiKey2.value = '';
      el.apiKey3.value = '';
      
      // Update UI displays
      updateUIForKeys();
      saveDreams();
      resetAttachment();
      
      // Clear sketch canvas
      const canvas = el.sketchCanvas;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        sketchState.history = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
      }

      // Deselect pills
      el.moodPillContainer.querySelectorAll('.mood-pill').forEach(pill => {
        pill.classList.remove('selected');
      });
      renderTagChips();
      
      // Go to homepage
      switchTab('new-dream');
      
      alert("Vault data has been completely erased.");
    }
  }

  // --- SERVICE WORKER REGISTRATION ---
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => {
            console.log('DreamVault ServiceWorker registration successful', reg.scope);
          })
          .catch(err => {
            console.warn('DreamVault ServiceWorker registration failed', err);
          });
      });
    }
  }

  // --- PWA CAPTURE AND INSTALLATION ---
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    el.btnInstallApp.classList.remove('hidden');
  });

  function installAppPrompt() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User installed the DreamVault application.');
      } else {
        console.log('User declined the DreamVault installation prompt.');
      }
      deferredPrompt = null;
      el.btnInstallApp.classList.add('hidden');
    });
  }

  // --- ECO-ASTRAL PERFORMANCE MODE IMPLEMENTATION ---
  function initEcoMode() {
    let savedEco = localStorage.getItem('alchera_eco_mode');
    if (savedEco === null) {
      savedEco = localStorage.getItem('somnium_eco_mode');
    }
    state.ecoMode = savedEco === 'true';
    if (state.ecoMode) {
      document.body.classList.add('eco-mode');
    } else {
      document.body.classList.remove('eco-mode');
    }
  }

  function toggleEcoMode() {
    state.ecoMode = !state.ecoMode;
    localStorage.setItem('alchera_eco_mode', state.ecoMode);
    if (state.ecoMode) {
      document.body.classList.add('eco-mode');
    } else {
      document.body.classList.remove('eco-mode');
      if (state.restartStarfield) {
        state.restartStarfield();
      }
    }
  }

  // --- FIREBASE INTEGRATION & PORTAL IMPLEMENTATION ---
  function initFirebase() {
    const apiKey = localStorage.getItem('fb_api_key');
    const authDomain = localStorage.getItem('fb_auth_domain');
    const projectId = localStorage.getItem('fb_project_id');
    const storageBucket = localStorage.getItem('fb_storage_bucket');
    const messagingSenderId = localStorage.getItem('fb_sender_id');
    const appId = localStorage.getItem('fb_app_id');
    
    if (!apiKey || !projectId) {
      state.firebaseConnected = false;
      switchLandingState();
      return;
    }
    
    const config = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
    
    try {
      if (typeof firebase !== 'undefined') {
        if (firebase.apps.length === 0) {
          firebase.initializeApp(config);
        }
        state.firebaseConnected = true;
        
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            state.user = user;
            state.guestMode = false;
            el.userAuthWidget.classList.remove('hidden');
            el.userAvatar.src = user.photoURL || 'icon-512.png';
            el.userDisplayName.textContent = user.displayName || user.email || 'Dreamer';
            el.btnDisconnectFirebase.classList.remove('hidden');
            switchLandingState();
            syncDreamsFromFirestore();
          } else {
            state.user = null;
            el.userAuthWidget.classList.add('hidden');
            el.btnDisconnectFirebase.classList.add('hidden');
            switchLandingState();
          }
        });
      }
    } catch (err) {
      console.error("Firebase connection failed", err);
      state.firebaseConnected = false;
      switchLandingState();
    }
  }

  function loginWithGoogle() {
    if (!state.firebaseConnected) {
      alert("Firebase cloud database is not connected. Please input your credentials in Settings first, or enter in Guest Mode.");
      switchTab('settings');
      return;
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then(result => {
        console.log("Authenticated successfully with Google", result.user);
        mergeGuestDreams(result.user.uid);
      })
      .catch(err => {
        console.error("Google Authentication error", err);
        alert(`Authentication failed: ${err.message}`);
      });
  }

  function saveFirebaseConfig() {
    localStorage.setItem('fb_api_key', el.fbApiKey.value.trim());
    localStorage.setItem('fb_auth_domain', el.fbAuthDomain.value.trim());
    localStorage.setItem('fb_project_id', el.fbProjectId.value.trim());
    localStorage.setItem('fb_storage_bucket', el.fbStorageBucket.value.trim());
    localStorage.setItem('fb_sender_id', el.fbSenderId.value.trim());
    localStorage.setItem('fb_app_id', el.fbAppId.value.trim());
    
    showSettingsMessage("Firebase configuration saved. Connecting...", "success");
    initFirebase();
  }

  function disconnectFirebase() {
    if (confirm("Disconnect from your Firebase cloud sanctuary? Your logs will remain in this browser, but online syncing will stop.")) {
      if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        firebase.auth().signOut().then(() => {
          localStorage.removeItem('fb_api_key');
          localStorage.removeItem('fb_auth_domain');
          localStorage.removeItem('fb_project_id');
          localStorage.removeItem('fb_storage_bucket');
          localStorage.removeItem('fb_sender_id');
          localStorage.removeItem('fb_app_id');
          
          el.fbApiKey.value = '';
          el.fbAuthDomain.value = '';
          el.fbProjectId.value = '';
          el.fbStorageBucket.value = '';
          el.fbSenderId.value = '';
          el.fbAppId.value = '';
          
          state.user = null;
          state.firebaseConnected = false;
          state.guestMode = true; // Retain access as guest
          
          el.userAuthWidget.classList.add('hidden');
          el.btnDisconnectFirebase.classList.add('hidden');
          
          showSettingsMessage("Disconnected from Firebase successfully.", "success");
          switchLandingState();
        }).catch(err => {
          console.error("Firebase disconnect failed", err);
        });
      }
    }
  }

  function switchLandingState() {
    if (state.user || state.guestMode) {
      el.landingView.classList.add('hidden');
    } else {
      el.landingView.classList.remove('hidden');
    }
  }

  async function saveDreamToCloud(dream) {
    if (!state.user || !state.firebaseConnected) return;
    try {
      const db = firebase.firestore();
      await db.collection('users').doc(state.user.uid).collection('dreams').doc(dream.id).set(dream);
    } catch (err) {
      console.error("Firestore cloud sync failed", err);
    }
  }

  async function deleteDreamFromCloud(dreamId) {
    if (!state.user || !state.firebaseConnected) return;
    try {
      const db = firebase.firestore();
      await db.collection('users').doc(state.user.uid).collection('dreams').doc(dreamId).delete();
    } catch (err) {
      console.error("Firestore document deletion failed", err);
    }
  }

  async function syncDreamsFromFirestore() {
    if (!state.user || !state.firebaseConnected) return;
    try {
      const db = firebase.firestore();
      const snapshot = await db.collection('users').doc(state.user.uid).collection('dreams').get();
      const cloudDreams = [];
      snapshot.forEach(doc => {
        cloudDreams.push(doc.data());
      });
      
      if (cloudDreams.length > 0) {
        // Merge cloud-saved dreams. Cloud version overrides local version on collision.
        const localMap = new Map(state.dreams.map(d => [d.id, d]));
        cloudDreams.forEach(cd => {
          localMap.set(cd.id, cd);
        });
        state.dreams = Array.from(localMap.values());
        localStorage.setItem('alchera_dreams', JSON.stringify(state.dreams));
        renderJournal();
        renderAnalytics();
      }
    } catch (err) {
      console.error("Failed to sync dream archives from cloud store", err);
    }
  }

  async function mergeGuestDreams(uid) {
    if (!state.firebaseConnected || state.dreams.length === 0) return;
    try {
      const db = firebase.firestore();
      const batch = db.batch();
      state.dreams.forEach(dream => {
        const ref = db.collection('users').doc(uid).collection('dreams').doc(dream.id);
        batch.set(ref, dream);
      });
      await batch.commit();
      console.log("Successfully migrated all local guest logs to cloud.");
    } catch (err) {
      console.error("Failed to merge local logs into cloud database", err);
    }
  }

  // --- SUBCONSCIOUS VOICE MEMO RECORDER & STT ---
  function initVoiceRecorder() {
    const canvas = el.audioWaveCanvas;
    const ctx = canvas.getContext('2d');
    
    // Draw initial horizontal centerline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    el.btnAudioRecord.addEventListener('click', toggleAudioRecording);
    el.btnRemoveAudio.addEventListener('click', removeAudioAttachment);
    el.btnAudioUploadTrigger.addEventListener('click', () => el.audioFileInput.click());
    el.audioFileInput.addEventListener('change', handleAudioFileSelect);
  }

  async function toggleAudioRecording() {
    if (recordingState.isRecording) {
      stopAudioRecording();
    } else {
      await startAudioRecording();
    }
  }

  async function startAudioRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingState.isRecording = true;
      el.btnAudioRecord.classList.add('recording');
      el.audioTimer.textContent = '0:00 / 1:00';
      
      recordingState.audioChunks = [];
      recordingState.mediaRecorder = new MediaRecorder(stream);
      
      recordingState.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingState.audioChunks.push(event.data);
        }
      };
      
      recordingState.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(recordingState.audioChunks, { type: 'audio/webm' });
        
        if (audioBlob.size > 1.5 * 1024 * 1024) {
          alert("Subconscious audio narration exceeds safety limits (1.5MB). Recording discarded.");
          removeAudioAttachment();
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          state.attachedAudio = reader.result; // base64 representation
          state.attachedAudioFormat = 'webm';
          showAudioPreview();
        };
        reader.readAsDataURL(audioBlob);
        
        stopAudioVisualization();
      };
      
      startAudioVisualization(stream);
      startSpeechRecognition();

      recordingState.mediaRecorder.start();
      recordingState.startTime = Date.now();
      
      recordingState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingState.startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        el.audioTimer.textContent = `${mins}:${secs.toString().padStart(2, '0')} / 1:00`;
        
        if (elapsed >= 60) {
          stopAudioRecording();
        }
      }, 500);

    } catch (err) {
      console.error("Failed to acquire microphone access", err);
      alert("Microphone connection denied or device unavailable.");
    }
  }

  function stopAudioRecording() {
    if (!recordingState.isRecording) return;
    
    recordingState.isRecording = false;
    el.btnAudioRecord.classList.remove('recording');
    
    if (recordingState.timerInterval) {
      clearInterval(recordingState.timerInterval);
    }
    
    if (recordingState.mediaRecorder) {
      try {
        recordingState.mediaRecorder.stop();
      } catch (e) {}
      const stream = recordingState.mediaRecorder.stream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
    
    stopSpeechRecognition();
  }

  function startAudioVisualization(stream) {
    try {
      recordingState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = recordingState.audioContext;
      recordingState.sourceNode = ctx.createMediaStreamSource(stream);
      recordingState.analyser = ctx.createAnalyser();
      recordingState.analyser.fftSize = 256;
      
      recordingState.sourceNode.connect(recordingState.analyser);
      
      const bufferLength = recordingState.analyser.frequencyBinCount;
      recordingState.dataArray = new Uint8Array(bufferLength);
      
      const canvas = el.audioWaveCanvas;
      const canvasCtx = canvas.getContext('2d');
      
      function drawWave() {
        if (!recordingState.isRecording) return;
        
        recordingState.animationFrameId = requestAnimationFrame(drawWave);
        recordingState.analyser.getByteTimeDomainData(recordingState.dataArray);
        
        canvasCtx.fillStyle = '#020204';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = '#06b6d4';
        canvasCtx.beginPath();
        
        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          const v = recordingState.dataArray[i] / 128.0;
          const y = v * canvas.height / 2;
          
          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }
          
          x += sliceWidth;
        }
        
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
      }
      
      drawWave();
    } catch (e) {
      console.error("Audio recording waveform visualization failed", e);
    }
  }

  function stopAudioVisualization() {
    if (recordingState.animationFrameId) {
      cancelAnimationFrame(recordingState.animationFrameId);
    }
    if (recordingState.audioContext) {
      try {
        recordingState.audioContext.close();
      } catch (e) {}
    }
    recordingState.audioContext = null;
    recordingState.analyser = null;
    recordingState.sourceNode = null;
    
    // Redraw horizontal centerline
    const canvas = el.audioWaveCanvas;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#020204';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  let speechRecognitionInstance = null;
  function startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Local speech-to-text not supported on this browser context.");
      return;
    }
    
    speechRecognitionInstance = new SpeechRecognition();
    speechRecognitionInstance.continuous = true;
    speechRecognitionInstance.interimResults = false;
    speechRecognitionInstance.lang = 'en-US';
    
    let localTranscriptAccumulator = '';
    
    speechRecognitionInstance.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          localTranscriptAccumulator += event.results[i][0].transcript + ' ';
        }
      }
      
      if (localTranscriptAccumulator) {
        const desc = el.dreamDescription.value.trim();
        const header = '\n\n[Voice Notes Transcript]: ';
        
        // Overwrite or append the speech transcript
        if (desc.includes('[Voice Notes Transcript]:')) {
          el.dreamDescription.value = desc.substring(0, desc.indexOf('[Voice Notes Transcript]:')) + header + localTranscriptAccumulator.trim();
        } else {
          el.dreamDescription.value = desc + header + localTranscriptAccumulator.trim();
        }
      }
    };
    
    speechRecognitionInstance.onerror = (e) => {
      console.warn("Speech recognition processing warning", e);
    };
    
    speechRecognitionInstance.start();
  }

  function stopSpeechRecognition() {
    if (speechRecognitionInstance) {
      try {
        speechRecognitionInstance.stop();
      } catch (e) {}
      speechRecognitionInstance = null;
    }
  }

  function handleAudioFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('audio/')) {
      alert("Attached document is not valid audio.");
      return;
    }
    
    if (file.size > 1.5 * 1024 * 1024) {
      alert("Attached audio file exceeds size threshold (1.5MB). Upload aborted.");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      state.attachedAudio = event.target.result;
      state.attachedAudioFormat = file.name.split('.').pop() || 'webm';
      showAudioPreview();
    };
    reader.readAsDataURL(file);
  }

  function showAudioPreview() {
    el.audioPreviewPlayer.src = state.attachedAudio;
    el.audioPreviewContainer.classList.remove('hidden');
  }

  function removeAudioAttachment() {
    state.attachedAudio = null;
    el.audioPreviewPlayer.src = '';
    el.audioPreviewContainer.classList.add('hidden');
    el.audioFileInput.value = '';
    el.audioTimer.textContent = '0:00 / 1:00';
  }

  // --- CELESTIAL SPEECH SYNTHESIS (TTS) ---
  function initSpeechSynthesis() {
    if (!speechState.synthesis) {
      console.warn("Text-To-Speech features not supported in this browser client.");
      return;
    }
    
    el.btnSpeakAnalysis.addEventListener('click', () => toggleSpeechAnalysis(el.btnSpeakAnalysis, 'analysis-content'));
    el.btnModalSpeakAnalysis.addEventListener('click', () => toggleSpeechAnalysis(el.btnModalSpeakAnalysis, 'modal-analysis-content'));
  }

  function toggleSpeechAnalysis(btn, textContainerId) {
    if (speechState.isPlaying) {
      stopSpeech();
      return;
    }
    
    const container = document.getElementById(textContainerId);
    if (!container) return;
    
    const text = container.innerText || '';
    if (!text.trim()) return;
    
    speechState.activeButton = btn;
    startSpeech(text);
  }

  function startSpeech(text) {
    stopSpeech();
    
    speechState.utterance = new SpeechSynthesisUtterance(text);
    speechState.utterance.rate = 0.82; // Cosmic slow speed
    speechState.utterance.pitch = 0.70; // Low-pitch resonance
    
    const voices = speechState.synthesis.getVoices();
    // Try to acquire deep vocal profiles
    const voiceCandidate = voices.find(v => v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('google uk english male') || 
       v.name.toLowerCase().includes('male') || 
       v.name.toLowerCase().includes('natural')));
    
    if (voiceCandidate) {
      speechState.utterance.voice = voiceCandidate;
    }
    
    speechState.utterance.onend = () => resetSpeechUI();
    speechState.utterance.onerror = () => resetSpeechUI();
    
    speechState.isPlaying = true;
    
    if (speechState.activeButton) {
      speechState.activeButton.querySelector('.speak-play-svg').classList.add('hidden');
      speechState.activeButton.querySelector('.speak-stop-svg').classList.remove('hidden');
      speechState.activeButton.classList.add('speaking');
    }
    
    speechState.synthesis.speak(speechState.utterance);
  }

  function stopSpeech() {
    if (speechState.synthesis) {
      speechState.synthesis.cancel();
    }
    resetSpeechUI();
  }

  function resetSpeechUI() {
    speechState.isPlaying = false;
    if (speechState.activeButton) {
      speechState.activeButton.querySelector('.speak-play-svg').classList.remove('hidden');
      speechState.activeButton.querySelector('.speak-stop-svg').classList.add('hidden');
      speechState.activeButton.classList.remove('speaking');
    }
    speechState.activeButton = null;
    speechState.utterance = null;
  }

  // --- UTILITY FORMATTING ENGINE & HELPERS ---
  function formatDate(rawDateString) {
    if (!rawDateString) return '';
    try {
      const parts = rawDateString.split('-');
      if (parts.length === 3) {
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return dateObj.toLocaleDateString('en-US', options);
      }
      return rawDateString;
    } catch (e) {
      return rawDateString;
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Start app!
  init();
});
