// Prevent Context Menu
document.addEventListener('contextmenu', event => event.preventDefault());

// LOG SIGNATURE
console.log("LSS Guide System v2.1 - Authorized Use Only - Developed by K.R.I.S. K.I.R.B.Y");

// Initialize listeners for drag and drop & Page Setup
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Upload Zones if they exist
    const uploadZones = document.querySelectorAll('.upload-zone');
    if (uploadZones.length > 0) {
        uploadZones.forEach(zone => {
            addDragDropListeners(zone);
            const img = zone.querySelector('img');
            if (img && img.src && img.style.display !== 'none') {
                zone.classList.add('has-image');
            }
            // Add remove button if missing
            if (!zone.querySelector('.upload-remove-btn')) {
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'upload-remove-btn';
                removeBtn.textContent = 'Remove';
                removeBtn.addEventListener('click', function(event) {
                    removeImage(this, event);
                });
                zone.appendChild(removeBtn);
            }
        });
    }

    // 2. Auto-save listener (Only if content body exists)
    if (document.querySelector('.content-body')) {
        document.body.addEventListener('input', () => {
            if (document.body.classList.contains('editing')) {
                autoSave();
            }
        });
    }

    // 3. Load Configurations
    loadTestConfig(); // Load Saved Vital Tests
    // Note: MJDI Config loading is now handled within the specific Simulator logic below

    // 4. Text Toolbar
    if (document.getElementById('text-toolbar')) {
        initTextToolbar();
    }

    // 5. Page Specific Auto-Start Logic
    
    // MJDI SIMULATOR INIT (New)
    // Checks for the new container ID used in the refactored MJDI Test.html
    if (document.getElementById('mjdi-sim-container')) {
        updateAdminFields();
        mjdiSimApplyTabs();
        document.getElementById('mjdi-sim-login').style.display = 'flex';
    }

    // VITAL Test Init
    if (document.getElementById('vital-test-container')) {
        startVitalTest();
    }
    
    // Guide Page Fade-in
    if (document.getElementById('app-container')) {
        setTimeout(() => {
            document.getElementById('app-container').classList.add('visible');
        }, 100);
    }
    
    // Test Hub Fade-in
    if (document.getElementById('test-hub')) {
        const hub = document.getElementById('test-hub');
        hub.style.display = 'flex';
        setTimeout(() => { hub.classList.add('visible'); }, 100);
    }
});

// Mobile Nav Toggle
function toggleMobileNav() {
    const sidebar = document.getElementById('sidebar-nav');
    const overlay = document.getElementById('mobile-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('mobile-open');
        overlay.style.display = sidebar.classList.contains('mobile-open') ? 'block' : 'none';
    }
}

// Close nav when clicking a link on mobile
function closeNavMobile() {
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar-nav');
        const overlay = document.getElementById('mobile-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('mobile-open');
            overlay.style.display = 'none';
        }
    }
}

function autoSave() {
    const indicator = document.getElementById('auto-save-indicator');
    const contentBody = document.querySelector('.content-body');
    
    if (indicator && contentBody) {
        indicator.style.opacity = '1';
        setTimeout(() => { indicator.style.opacity = '0'; }, 2000);
        localStorage.setItem('lss-guides-content', contentBody.innerHTML);
    }
}

function addDragDropListeners(zone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        zone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

    ['dragenter', 'dragover'].forEach(eventName => {
        zone.addEventListener(eventName, () => zone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        zone.addEventListener(eventName, () => zone.classList.remove('dragover'), false);
    });

    zone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;
        handleFiles(files, zone);
    }
}

function handleFiles(files, zone) {
    if (files.length > 0) {
        let file = files[0];
        if (file.type.startsWith('image/')) {
            let reader = new FileReader();
            reader.onload = function(e) {
                let img = zone.querySelector('img');
                let icon = zone.querySelector('.upload-icon');
                let text = zone.querySelector('.upload-text');
                if (img) {
                    img.src = e.target.result;
                    img.style.display = 'block';
                }
                if (icon) icon.style.display = 'none';
                if (text) text.style.display = 'none';
                zone.classList.add('has-image');
            }
            reader.readAsDataURL(file);
        }
    }
}

function removeImage(btn, event) {
    if (event) {
        event.stopPropagation();
    }
    const zone = btn.closest('.upload-zone');
    if (!zone) return;
    const img = zone.querySelector('img');
    const input = zone.querySelector('input[type="file"]');
    const icon = zone.querySelector('.upload-icon');
    const text = zone.querySelector('.upload-text');
    if (img) {
        img.src = '';
        img.style.display = 'none';
    }
    if (input) {
        input.value = '';
    }
    if (icon) icon.style.display = '';
    if (text) text.style.display = '';
    zone.classList.remove('has-image');
    autoSave();
}

function initTextToolbar() {
    const toolbar = document.getElementById('text-toolbar');
    if (!toolbar) return;

    toolbar.addEventListener('mousedown', function(e) {
        e.preventDefault();
    });

    toolbar.querySelectorAll('[data-cmd]').forEach(btn => {
        btn.addEventListener('click', function() {
            const cmd = this.getAttribute('data-cmd');
            if (!cmd) return;
            document.execCommand(cmd, false, null);
        });
    });

    const colourPicker = document.getElementById('toolbar-color');
    if (colourPicker) {
        colourPicker.addEventListener('input', function() {
            document.execCommand('foreColor', false, this.value);
        });
    }
}

document.addEventListener('selectionchange', function() {
    if (!document.body.classList.contains('editing')) {
        const tb = document.getElementById('text-toolbar');
        if (tb) tb.style.display = 'none';
        return;
    }
    const selection = window.getSelection();
    const toolbar = document.getElementById('text-toolbar');
    if (!toolbar || !selection.rangeCount || selection.isCollapsed) {
        if (toolbar) toolbar.style.display = 'none';
        return;
    }
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!rect || (rect.top === 0 && rect.left === 0)) {
        toolbar.style.display = 'none';
        return;
    }
    toolbar.style.display = 'flex';
    toolbar.style.top = (rect.top - 45) + 'px';
    toolbar.style.left = (rect.left + (rect.width / 2)) + 'px';
});

function loadLsaiDocument(input) {
    const container = document.getElementById('lsai-doc-container');
    if (!container) return;

    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();

        if (file.type === "application/pdf") {
            reader.onload = function(e) {
                container.innerHTML = `<iframe src="${e.target.result}" class="doc-viewer-frame"></iframe>`;
            };
            reader.readAsDataURL(file);
        } else {
            container.innerHTML = `
                <div class="doc-viewer-placeholder">
                    <p><strong>${file.name}</strong> loaded.</p>
                    <p>Word documents cannot be rendered inline. Please convert to PDF.</p>
                </div>
            `;
        }
    }
}

function downloadHtml() {
    const htmlContent = document.documentElement.outerHTML;
    const blob = new Blob([htmlContent], {type: 'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Sgt_Kirbys_LSS_Guides_v2_Export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// NAVIGATION LOGIC - UPDATED FOR MULTI-PAGE
function enterSystem(system) {
    if (system === 'mjdi-lsai') {
        window.location.href = 'LSA&I Question Set.html';
    } else if (system === 'mjdi') {
        window.location.href = 'mjdi guide.html';
    } else {
        window.location.href = 'vital guide.html';
    }
}

function goHome() {
    window.location.href = 'index.html';
}

function toggleNav(button) {
    button.classList.toggle('active');
    var content = button.nextElementSibling;
    if (content) {
        content.classList.toggle('open');
    }
}

function showSection(sectionId) {
    var sections = document.querySelectorAll('.guide-section');
    sections.forEach(s => s.classList.remove('active'));
    var target = document.getElementById('section-' + sectionId);
    if(target) {
        target.classList.add('active');
        const viewport = document.querySelector('.main-viewport');
        if (viewport) viewport.scrollTop = 0;
    }
}

function triggerUpload(element) {
    const input = element.querySelector('input');
    if (input) input.click();
}

function previewImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var zone = input.parentElement;
            var img = zone.querySelector('img');
            var icon = zone.querySelector('.upload-icon');
            var text = zone.querySelector('.upload-text');
            if (img) {
                img.src = e.target.result;
                img.style.display = 'block';
            }
            if (icon) icon.style.display = 'none';
            if (text) text.style.display = 'none';
            zone.classList.add('has-image');
        }
        reader.readAsDataURL(input.files[0]);
    }
}


/* =================================
   TEST SYSTEM LOGIC & ADMIN (VITAL)
   ================================= */
let testScore = 0;
let currentQuestion = 0;
let vitalQuestions = [];

// Default questions if none saved
const defaultQuestions = [
    {
        type: 'mc',
        question: 'What is the standard VITAL shortcut to display the "List of Nodes" popup?',
        options: ['F1', 'F3', 'F10', 'Ctrl + P'],
        correct: 1,
        image: ''
    },
    {
        type: 'terminal',
        question: 'SIMULATION: You are creating an Issue Package. The system asks for "Final Node". Enter the code for Bicester.',
        answer: 'BIC',
        image: ''
    },
    {
        type: 'hotkey',
        question: 'HOTKEY CHALLENGE: Press the physical key on your keyboard used to "Confirm/Save" a transaction in VITAL (Legacy Shortcut).',
        key: 'F2',
        hint: 'It is usually combined with Alt',
        image: ''
    },
    {
        type: 'mc',
        question: 'When a package is showing as "OMIS" (Omission) on the Node Activity check, how many hours do you have to investigate?',
        options: ['24 Hours', '48 Hours', '7 Days', 'Immediate'],
        correct: 1,
        image: ''
    },
    {
        type: 'terminal',
        question: 'SIMULATION: You have entered all Item Details. Enter the hotkey command string to "Create Packages" now.',
        answer: 'CTRL+P',
        image: ''
    }
];

function loadTestConfig() {
    const saved = localStorage.getItem('vt-questions');
    if (saved) {
        vitalQuestions = JSON.parse(saved);
    } else {
        vitalQuestions = JSON.parse(JSON.stringify(defaultQuestions));
    }
}

function saveTestConfig() {
    localStorage.setItem('vt-questions', JSON.stringify(vitalQuestions));
    loadTestConfig();
    // Only try to render admin list if the panel is open/exists
    if (document.getElementById('vt-q-list')) {
        renderAdminQuestionList();
    }
}

function openTestHub() {
    // If we are not on the Hub page, go there
    if (!document.getElementById('test-hub')) {
        window.location.href = 'Test your knowledge.html';
        return;
    }
    
    // If we are already on the page (e.g. returning from test container fade out)
    const hub = document.getElementById('test-hub');
    hub.style.display = 'flex';
    setTimeout(() => { hub.classList.add('visible'); }, 100);
}

function closeTestHub() {
    // Navigate back to Cover Page (index.html)
    window.location.href = 'index.html';
}

function startVitalTest() {
    // If the container doesn't exist (we are on Hub), navigate to Test Page
    if (!document.getElementById('vital-test-container')) {
        window.location.href = 'Vital Test.html';
        return;
    }

    // Logic for running the test on the Test Page
    loadTestConfig();
    
    // Hide Hub if it exists (shouldn't on the dedicated page, but for safety)
    const hub = document.getElementById('test-hub');
    if (hub) {
        hub.classList.remove('visible');
        setTimeout(() => { hub.style.display = 'none'; }, 500);
    }
    
    const testContainer = document.getElementById('vital-test-container');
    testContainer.style.display = 'flex';
    
    testScore = 0;
    currentQuestion = 0;
    updateScore();
    renderQuestion();
}

function closeVitalTest() {
    // Navigate back to Test Hub
    window.location.href = 'Test your knowledge.html';
}

function updateScore() {
    const scoreEl = document.getElementById('vt-score');
    if (scoreEl) {
        scoreEl.innerText = `SCORE: ${testScore}/${vitalQuestions.length}`;
    }
}

function renderQuestion() {
    const qData = vitalQuestions[currentQuestion];
    const area = document.getElementById('vt-game-area');
    if (!area) return;
    
    area.innerHTML = ''; 

    const qText = document.createElement('div');
    qText.className = 'vt-question-box';
    
    let html = `<div class="vt-question-text">Q${currentQuestion + 1}: ${qData.question}</div>`;
    
    if (qData.image && qData.image.length > 5) {
        html += `<img src="${qData.image}" class="vt-question-image" alt="Reference Image">`;
    }
    
    qText.innerHTML = html;
    
    if (qData.type === 'mc') {
        const optsDiv = document.createElement('div');
        optsDiv.className = 'vt-options';
        qData.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'vt-option-btn';
            btn.innerText = `> ${opt}`;
            btn.onclick = () => checkMCAnswer(idx, qData.correct, btn);
            optsDiv.appendChild(btn);
        });
        qText.appendChild(optsDiv);
    } else if (qData.type === 'terminal') {
        qText.innerHTML += `
            <div style="color:#aaa; font-size:0.9rem; margin-bottom:5px;">TERMINAL INPUT_</div>
            <input type="text" class="vt-terminal-input" id="vt-input" placeholder="Type command..." autocomplete="off">
            <button class="vt-next-btn" id="term-submit" style="display:inline-block;" onclick="checkTermAnswer('${qData.answer}')">SUBMIT</button>
            <div id="term-feedback" style="margin-top:10px; font-weight:bold;"></div>
        `;
    } else if (qData.type === 'hotkey') {
        qText.innerHTML += `
            <div style="text-align:center; padding:40px; border:2px dashed #0f0; margin-top:20px;">
                Waiting for Key Press...
                <div id="key-press-display" style="font-size:2rem; margin-top:20px;"></div>
            </div>
        `;
        document.addEventListener('keydown', handleHotKeyTest);
    }

    area.appendChild(qText);

    const nextBtn = document.createElement('button');
    nextBtn.id = 'global-next-btn';
    nextBtn.className = 'vt-next-btn';
    nextBtn.innerText = 'NEXT QUESTION >>';
    nextBtn.onclick = nextQuestion;
    area.appendChild(nextBtn);
}

function checkMCAnswer(selectedIdx, correctIdx, btn) {
    const allBtns = document.querySelectorAll('.vt-option-btn');
    allBtns.forEach(b => b.disabled = true);
    // Ensure correctIdx is a number
    if (selectedIdx === parseInt(correctIdx)) {
        btn.classList.add('correct');
        testScore++;
    } else {
        btn.classList.add('wrong');
        if(allBtns[correctIdx]) allBtns[correctIdx].classList.add('correct');
    }
    updateScore();
    document.getElementById('global-next-btn').style.display = 'block';
}

function checkTermAnswer(correctAnswer) {
    const input = document.getElementById('vt-input');
    const feedback = document.getElementById('term-feedback');
    const userVal = input.value.toUpperCase().replace(/\s/g, '');
    const correctVal = correctAnswer.toUpperCase().replace(/\s/g, '');

    if (userVal === correctVal) {
        feedback.style.color = '#0f0';
        feedback.innerText = 'ACCESS GRANTED.';
        testScore++;
    } else {
        feedback.style.color = '#c00';
        feedback.innerText = `ACCESS DENIED. CORRECT COMMAND: ${correctAnswer}`;
    }
    document.getElementById('term-submit').disabled = true;
    input.disabled = true;
    updateScore();
    document.getElementById('global-next-btn').style.display = 'block';
}

function handleHotKeyTest(e) {
    e.preventDefault(); 
    const display = document.getElementById('key-press-display');
    if(!display) return; 
    
    const qData = vitalQuestions[currentQuestion];
    const pressed = e.key.toUpperCase();
    const required = qData.key.toUpperCase();

    if (pressed === required) {
        display.style.color = '#0f0';
        display.innerText = `DETECTED: ${pressed} - CORRECT`;
        testScore++;
        document.removeEventListener('keydown', handleHotKeyTest);
        updateScore();
        document.getElementById('global-next-btn').style.display = 'block';
    } else {
        display.style.color = '#c00';
        display.innerText = `DETECTED: ${pressed}`;
        setTimeout(() => { display.innerText = ""; }, 500);
    }
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < vitalQuestions.length) {
        renderQuestion();
    } else {
        const area = document.getElementById('vt-game-area');
        area.innerHTML = `
            <div class="vt-question-box" style="text-align:center;">
                <h2 style="color:#0f0; font-size:2rem;">TEST COMPLETE</h2>
                <div style="font-size:4rem; margin:20px 0;">${testScore} / ${vitalQuestions.length}</div>
                <p>${testScore >= (vitalQuestions.length * 0.8) ? 'EXCELLENT WORK, SPECIALIST.' : 'REVISION REQUIRED.'}</p>
            </div>
        `;
    }
}

/* ===========================
   TEST ADMIN LOGIC
   =========================== */
function openVtAdmin() {
    const pin = prompt("ENTER ROOT PIN:");
    if (pin === '1134') {
        const panel = document.getElementById('vt-admin-panel');
        if(panel) {
            panel.style.display = 'flex';
            renderAdminQuestionList();
        }
    }
}

function closeVtAdmin() {
    const panel = document.getElementById('vt-admin-panel');
    if (panel) panel.style.display = 'none';
}

function renderAdminQuestionList() {
    const list = document.getElementById('vt-q-list');
    if (!list) return;
    list.innerHTML = '';
    vitalQuestions.forEach((q, idx) => {
        const item = document.createElement('div');
        item.className = 'vt-admin-item';
        item.innerHTML = `<span>${idx + 1}. ${q.question.substring(0, 30)}...</span> <span>[${q.type}]</span>`;
        item.onclick = () => loadQuestionForEdit(idx);
        list.appendChild(item);
    });
}

function toggleVtFields() {
    const typeSelect = document.getElementById('vt-type');
    if (!typeSelect) return;
    const type = typeSelect.value;
    
    const groupMc = document.getElementById('vt-group-mc');
    const groupAns = document.getElementById('vt-group-ans');
    
    if (groupMc) groupMc.style.display = type === 'mc' ? 'block' : 'none';
    if (groupAns) groupAns.style.display = type !== 'mc' ? 'block' : 'none';
}

function clearVtForm() {
    const editIndex = document.getElementById('vt-edit-index');
    if(editIndex) editIndex.value = "-1";
    
    const qtext = document.getElementById('vt-qtext');
    if(qtext) qtext.value = "";
    
    const imgUrl = document.getElementById('vt-img-url');
    if(imgUrl) imgUrl.value = "";
    
    const opts = document.getElementById('vt-options');
    if(opts) opts.value = "";
    
    const correctIdx = document.getElementById('vt-correct-idx');
    if(correctIdx) correctIdx.value = "";
    
    const ans = document.getElementById('vt-answer');
    if(ans) ans.value = "";
    
    document.querySelectorAll('.vt-admin-item').forEach(i => i.classList.remove('active'));
    toggleVtFields();
}

function loadQuestionForEdit(idx) {
    clearVtForm();
    const q = vitalQuestions[idx];
    document.getElementById('vt-edit-index').value = idx;
    document.getElementById('vt-type').value = q.type;
    document.getElementById('vt-qtext').value = q.question;
    document.getElementById('vt-img-url').value = q.image || "";
    
    toggleVtFields();

    if (q.type === 'mc') {
        document.getElementById('vt-options').value = q.options.join(', ');
        document.getElementById('vt-correct-idx').value = q.correct;
    } else if (q.type === 'terminal') {
        document.getElementById('vt-answer').value = q.answer;
    } else if (q.type === 'hotkey') {
        document.getElementById('vt-answer').value = q.key;
    }

    // Highlight in list
    const listItems = document.querySelectorAll('.vt-admin-item');
    if(listItems[idx]) listItems[idx].classList.add('active');
}

function handleVtImageUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('vt-img-url').value = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function saveQuestionData() {
    const idx = parseInt(document.getElementById('vt-edit-index').value);
    const type = document.getElementById('vt-type').value;
    const qtext = document.getElementById('vt-qtext').value;
    const img = document.getElementById('vt-img-url').value;

    if (!qtext) { alert("Question text required"); return; }

    const newQ = {
        type: type,
        question: qtext,
        image: img
    };

    if (type === 'mc') {
        const opts = document.getElementById('vt-options').value.split(',').map(s => s.trim());
        const correct = parseInt(document.getElementById('vt-correct-idx').value);
        if (opts.length < 2) { alert("Need at least 2 options"); return; }
        if (isNaN(correct) || correct >= opts.length) { alert("Invalid Correct Index"); return; }
        newQ.options = opts;
        newQ.correct = correct;
    } else if (type === 'terminal') {
        newQ.answer = document.getElementById('vt-answer').value;
    } else if (type === 'hotkey') {
        newQ.key = document.getElementById('vt-answer').value;
    }

    if (idx === -1) {
        vitalQuestions.push(newQ);
    } else {
        vitalQuestions[idx] = newQ;
    }

    saveTestConfig();
    alert("Question Saved.");
    clearVtForm();
}

function deleteQuestionData() {
    const idx = parseInt(document.getElementById('vt-edit-index').value);
    if (idx === -1) return;
    if (confirm("Delete this question?")) {
        vitalQuestions.splice(idx, 1);
        saveTestConfig();
        clearVtForm();
    }
}

// ADMIN FUNCTIONS (Global)
let currentSectionId = '';
document.addEventListener('click', function(e) {
    const activeSection = document.querySelector('.guide-section.active');
    if(activeSection) currentSectionId = activeSection.id;
});

function showAdminLogin() {
    const overlay = document.getElementById('admin-login-overlay');
    const pin = document.getElementById('admin-pin');
    if (overlay && pin) {
        overlay.style.display = 'flex';
        pin.value = '';
        pin.focus();
    }
}

function closeAdminLogin() {
    const overlay = document.getElementById('admin-login-overlay');
    if(overlay) overlay.style.display = 'none';
}

function checkAdminPin() {
    const pin = document.getElementById('admin-pin').value;
    if (pin === '1134') {
        closeAdminLogin();
        openAdminPanel();
    } else {
        alert('Access Denied. Incorrect PIN.');
    }
}

function openAdminPanel() {
    const panel = document.getElementById('admin-panel');
    if (panel) {
        panel.classList.add('open');
        populateSectionSelect();
        populateCategoryDeleteSelect();
    }
}

function toggleAdminPanel() {
    const panel = document.getElementById('admin-panel');
    if(panel) panel.classList.toggle('open');
}

function toggleEditMode() {
    document.body.classList.toggle('editing');
    const btn = document.getElementById('toggle-edit-btn');
    if (document.body.classList.contains('editing')) {
        btn.innerText = "Disable Text Editing";
        btn.style.background = "#f56565";
        document.querySelectorAll('.editable').forEach(el => el.contentEditable = "true");
    } else {
        btn.innerText = "Enable Text Editing";
        btn.style.background = "#3b82f6";
        document.querySelectorAll('.editable').forEach(el => el.contentEditable = "false");
    }
}

function populateSectionSelect() {
    const select = document.getElementById('target-section-select');
    if (!select) return;
    
    select.innerHTML = '';
    
    let activeContainer = '';
    const vitalNav = document.getElementById('nav-content-vital');
    const mjdiNav = document.getElementById('nav-content-mjdi');
    const lsaiNav = document.getElementById('nav-content-lsai');

    if (vitalNav && vitalNav.style.display !== 'none') {
        activeContainer = 'nav-content-vital';
    } else if (mjdiNav && mjdiNav.style.display !== 'none') {
        activeContainer = 'nav-content-mjdi';
    } else if (lsaiNav && lsaiNav.style.display !== 'none') {
        activeContainer = 'nav-content-lsai';
    }

    const allSections = document.querySelectorAll('.guide-section');
    
    allSections.forEach(sec => {
        let isMjdiSection = sec.id.startsWith('section-mjdi-');
        let isLsaiSection = sec.id.startsWith('section-lsai-');
        let show = false;

        if (activeContainer === 'nav-content-mjdi' && isMjdiSection) show = true;
        if (activeContainer === 'nav-content-lsai' && isLsaiSection) show = true;
        if (activeContainer === 'nav-content-vital' && !isMjdiSection && !isLsaiSection) show = true;

        if (show) {
            const h3 = sec.querySelector('h3');
            const title = h3 ? h3.innerText : sec.id;
            const opt = document.createElement('option');
            opt.value = sec.id;
            opt.innerText = title;
            if (sec.classList.contains('active')) opt.selected = true;
            select.appendChild(opt);
        }
    });
}

function populateCategoryDeleteSelect() {
    const select = document.getElementById('delete-category-select');
    if (!select) return;
    
    select.innerHTML = '';
    
    let activeContainerId = '';
    const vitalNav = document.getElementById('nav-content-vital');
    const mjdiNav = document.getElementById('nav-content-mjdi');
    const lsaiNav = document.getElementById('nav-content-lsai');

    if (vitalNav && vitalNav.style.display !== 'none') activeContainerId = 'nav-content-vital';
    else if (mjdiNav && mjdiNav.style.display !== 'none') activeContainerId = 'nav-content-mjdi';
    else if (lsaiNav && lsaiNav.style.display !== 'none') activeContainerId = 'nav-content-lsai';

    if (!activeContainerId) return;

    const container = document.getElementById(activeContainerId);
    if (!container) return;

    const groups = container.querySelectorAll('.nav-group');
    groups.forEach((group, index) => {
        const trigger = group.querySelector('.nav-trigger');
        const opt = document.createElement('option');
        opt.value = index;
        opt.innerText = trigger.textContent.replace('▼', '').trim();
        select.appendChild(opt);
    });
}

function deleteCategory() {
    const select = document.getElementById('delete-category-select');
    const index = select.value;
    if (index === "") return;

    if (confirm("Are you sure you want to delete this entire category and its contents?")) {
        let activeContainerId = '';
        const vitalNav = document.getElementById('nav-content-vital');
        const mjdiNav = document.getElementById('nav-content-mjdi');
        const lsaiNav = document.getElementById('nav-content-lsai');

        if (vitalNav && vitalNav.style.display !== 'none') activeContainerId = 'nav-content-vital';
        else if (mjdiNav && mjdiNav.style.display !== 'none') activeContainerId = 'nav-content-mjdi';
        else if (lsaiNav && lsaiNav.style.display !== 'none') activeContainerId = 'nav-content-lsai';
        
        const container = document.getElementById(activeContainerId);
        if(container) {
            const groups = container.querySelectorAll('.nav-group');
            if (groups[index]) {
                groups[index].remove();
                alert("Category deleted.");
                populateCategoryDeleteSelect();
                autoSave();
            }
        }
    }
}

const includeTerm = document.getElementById('include-term');
if(includeTerm) {
    includeTerm.addEventListener('change', function() {
        const group = document.getElementById('term-content-group');
        if(group) group.style.display = this.value === 'yes' ? 'block' : 'none';
    });
}

function deleteStep(btn) {
    if (confirm('Are you sure you want to delete this step?')) {
        const stepBlock = btn.closest('.step-block');
        stepBlock.remove();
        autoSave();
    }
}

function addNewCategory() {
    const guideSelect = document.getElementById('target-guide-select').value;
    const title = document.getElementById('new-category-title').value;
    if (!title) { alert('Please enter a category title.'); return; }
    
    const navContainer = document.getElementById(guideSelect);
    if (!navContainer) return;
    
    // AUTOMATIC PREFIX FIX
    let slugPrefix = 'section-';
    if(guideSelect === 'nav-content-mjdi') slugPrefix = 'section-mjdi-';
    if(guideSelect === 'nav-content-lsai') slugPrefix = 'section-lsai-';
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const sectionId = slugPrefix + slug;
    
    const navGroup = document.createElement('div');
    navGroup.className = 'nav-group';
    navGroup.innerHTML = `
        <button class="nav-trigger" onclick="toggleNav(this)">${title} <span class="arrow">▼</span></button>
        <div class="nav-content">
            <a href="#" class="nav-link" onclick="closeNavMobile(); showSection('${sectionId}')">${title} Overview</a>
        </div>
    `;
    navContainer.appendChild(navGroup);
    
    const contentBody = document.querySelector('.content-body');
    const newSection = document.createElement('div');
    newSection.id = sectionId;
    newSection.className = 'guide-section';
    newSection.innerHTML = `<h3 class="editable">${title}</h3><p class="step-text editable">New section created. Use Admin Panel to add steps.</p>`;
    contentBody.appendChild(newSection);
    
    autoSave();
    alert('Category added!');
    populateSectionSelect();
    populateCategoryDeleteSelect();
}


function addNewStep() {
    const sectionId = document.getElementById('target-section-select').value;
    const num = document.getElementById('new-step-num').value;
    const title = document.getElementById('new-step-title').value;
    const text = document.getElementById('new-step-text').value;
    const includeTerm = document.getElementById('include-term').value === 'yes';
    const termText = document.getElementById('new-term-text').value;
    const includeImageSelect = document.getElementById('include-image');
    const includeImage = includeImageSelect && includeImageSelect.value === 'yes';

    if (!sectionId) { alert('Please select a section.'); return; }
    const section = document.getElementById(sectionId);
    if(!section) return;

    const stepBlock = document.createElement('div');
    stepBlock.className = 'step-block';

    let html = `
        <div class="step-marker">${num}</div>
        <div class="step-detail">
            <button class="delete-step-btn" onclick="deleteStep(this)">Delete</button>
            <span class="step-title editable">${title}</span>
            <p class="step-text editable">${text}</p>
    `;

    if (includeTerm) {
        html += `<div class="terminal-window"><div class="terminal-bar"><div class="term-dot red"></div></div><div class="terminal-content editable">${termText}</div></div>`;
    }

    if (includeImage) {
        html += `
            <div class="upload-zone" onclick="triggerUpload(this)">
                <button type="button" class="upload-insert-btn">Insert Image</button>
                <input type="file" hidden accept="image/*" onchange="previewImage(this)">
                <img src="">
                <button type="button" class="upload-remove-btn" onclick="removeImage(this, event)">Remove</button>
            </div>
        `;
    }

    html += `
        </div>
    `;

    stepBlock.innerHTML = html;
    section.appendChild(stepBlock);

    const zone = stepBlock.querySelector('.upload-zone');
    if (zone) {
        addDragDropListeners(zone);
    }

    if (document.body.classList.contains('editing')) {
        stepBlock.querySelectorAll('.editable').forEach(el => el.contentEditable = "true");
    }

    autoSave();
    alert('Step added successfully!');
}

function saveChanges() {
    alert('Changes applied to current session. To make them permanent, you would need to save the HTML file.');
    console.log("Current HTML state ready for export.");
}

/* =========================================
   MJDI SIMULATOR LOGIC (Full Fidelity)
   Ref: Renamed to #mjdi-sim-... to avoid conflicts
   ========================================= */

// Global State
let mjdiSim = {
    rank: '',
    name: '',
    questions: [],
    currentQ: 0,
    score: 0,
    waitingPractical: false
};

// Config
const mjdiSimConfig = { pass: 80, rand: true, max: 0 };
const tabConfig = { amendItemTabs: ['Item', 'Location', 'Asset'] };

// Full Question Bank
const mjdiSimQuestions = [
    {
        type: 'mc',
        topic: 'Interrogations – Unit Address Finder',
        text: 'Which menu path is used to view a unit address on MJDI?',
        options: ['Interrogations > Organisations > Address', 'Interrogations > Demands', 'Transactions > Issues > Without Issue Request'],
        answer: 0
    },
    {
        type: 'mc',
        topic: 'Transactions – Manual Demands',
        text: 'For a routine manual demand with Standard Priority Code 13, what is the normal rule for setting the Required Delivery Date (RDD)?',
        options: ['Same day as the demand date', '2 days after the demand date', '7 days after the demand date'],
        answer: 2
    },
    {
        type: 'mc',
        topic: 'Transactions – Stock Replenishment',
        text: 'When the "Stock Replenishment" box is ticked on a demand, which Standard Priority Code is normally applied?',
        options: ['05', '09', '16'],
        answer: 2
    },
    {
        type: 'mc',
        topic: 'Demand Book',
        text: 'Which two standard priorities are usually recorded in a routine Demand Book?',
        options: ['01 and 02', '05 and 09', '13 and 16'],
        answer: 2
    },
    {
        type: 'mc',
        topic: 'Transactions – Unit Collect',
        text: 'When placing a Unit Collect demand, how many days from the demand date should the RDD normally be set?',
        options: ['Same day', '2 days later', '7 days later'],
        answer: 1
    },
    {
        type: 'mc',
        topic: 'Transactions – External Issues',
        text: 'For a cross-service issue to another unit where there is no charge, which Reason for Issue code is normally selected?',
        options: ['A', 'C', 'M'],
        answer: 0
    },
    {
        type: 'mc',
        topic: 'Transactions – Asset Change',
        text: 'Which menu path is used to change the Material Condition (MatCon) of an item (for example, A1 to R2)?',
        options: ['Transactions > Asset Adjustment > Asset Change', 'Amendments > Item Record', 'Interrogations > Item Record'],
        answer: 0
    },
    {
        type: 'mc',
        topic: 'Amendments – Location Change',
        text: 'Which function allows you to add a new storage location for an NSN on MJDI?',
        options: ['Transactions > Receipts', 'Amendments > Item Record > Details > Add New Storage', 'Interrogations > Storage'],
        answer: 1
    },
    {
        type: 'mc',
        topic: 'Interrogations – Demands',
        text: 'Which checkbox must be ticked to generate a list of demands that require progression updates (hastening summary)?',
        options: ['FDA Required', 'Hastening Summary Required', 'Dues-Out Only'],
        answer: 1
    },
    {
        type: 'written',
        topic: 'Progression – Oliver / LTB',
        text: 'In OLIVER LTB, which four pieces of information are required to interrogate a specific demand?',
        answer: 'UIN, date, serial number, line number'
    },
    {
        type: 'written',
        topic: 'Assessment',
        text: 'What is the pass mark percentage for this MJDI assessment?',
        answer: '80'
    },
    {
        type: 'practical_nav',
        topic: 'Transactions – Demands',
        text: 'PRACTICAL: Navigate to the Demands screen.',
        targetId: 'menu-txn-demands'
    },
    {
        type: 'practical_nav',
        topic: 'Interrogations – Organisations',
        text: 'PRACTICAL: Navigate to the Organisations Address interrogation screen.',
        targetId: 'menu-int-org-addr'
    },
    {
        type: 'practical_nav',
        topic: 'Reports – Fallback',
        text: 'PRACTICAL: Open the Oracle Fallback report (Fallback Unit and Account – Fallback).',
        targetId: 'menu-rep-fallback'
    },
    {
        type: 'practical_form',
        topic: 'Transactions – Stock Replenishment Demand',
        text: 'PRACTICAL: Raise a stock replenishment demand on MJDI.\n\nNSC: 1234\nQty: 10\nStandard Priority Code: 16\n\nEnter the details on the Demands screen and save the record.',
        formId: 'screen-demands',
        formData: { 'dem-nsc': '1234', 'dem-qty': '10', 'dem-spc': '16' }
    }
];

function mjdiSimStart() {
    const r = document.getElementById('mjdi-sim-rank').value;
    const n = document.getElementById('mjdi-sim-name').value;
    if (!r || !n) { mjdiSimAlert("Please select Rank and enter Name."); return; }
    
    mjdiSim.rank = r; mjdiSim.name = n;
    mjdiSim.score = 0; mjdiSim.currentQ = 0;
    
    let pool = JSON.parse(JSON.stringify(mjdiSimQuestions));
    if (mjdiSimConfig.rand) pool.sort(() => Math.random() - 0.5);
    if (mjdiSimConfig.max > 0) pool = pool.slice(0, mjdiSimConfig.max);
    mjdiSim.questions = pool;

    document.getElementById('mjdi-sim-footer-user').innerText = `User: ${r} ${n}`;
    document.getElementById('mjdi-sim-login').style.display = 'none';
    mjdiSimLoadQ();
}

function mjdiSimLoadQ() {
    const qBox = document.getElementById('mjdi-sim-prompt');
    const lock = document.getElementById('mjdi-sim-lock');
    const qBody = document.getElementById('mjdi-sim-q-body');
    const qInput = document.getElementById('mjdi-sim-q-input');
    const btn = document.getElementById('mjdi-sim-submit');
    const next = document.getElementById('mjdi-sim-next');
    const fb = document.getElementById('mjdi-sim-feedback');
    
    qBox.style.display = 'block';
    fb.innerText = '';
    next.disabled = true;
    mjdiSim.waitingPractical = false;

    if (mjdiSim.currentQ >= mjdiSim.questions.length) {
        mjdiSimFinish(); return;
    }

    const q = mjdiSim.questions[mjdiSim.currentQ];
    document.getElementById('mjdi-sim-q-num').innerText = `Q${mjdiSim.currentQ+1}/${mjdiSim.questions.length}`;
    
    let html = q.topic ? `<strong>${q.topic}</strong><br>` : '';
    html += (q.text || '').replace(/\n/g, '<br>');
    qBody.innerHTML = html;
    qInput.innerHTML = '';

    if (q.type.startsWith('practical')) {
        qBox.classList.remove('centered'); qBox.classList.add('corner');
        lock.style.display = 'none';
        btn.style.display = 'none';
        qInput.innerHTML = '<em>Perform action in MJDI...</em>';
        mjdiSim.waitingPractical = true;
    } else {
        qBox.classList.remove('corner'); qBox.classList.add('centered');
        lock.style.display = 'block';
        btn.style.display = 'inline-block';
        if (q.type === 'mc') {
            q.options.forEach((opt, i) => {
                const b = document.createElement('button');
                b.innerText = opt;
                b.onclick = () => {
                    document.querySelectorAll('#mjdi-sim-q-input button').forEach(x=>x.style.background='white');
                    b.style.background='#add8e6'; b.dataset.idx = i;
                };
                qInput.appendChild(b);
            });
        } else {
            qInput.innerHTML = '<input type="text" id="mjdi-sim-ans-text" class="mjdi-input" style="width:100%; padding:5px;">';
        }
    }
}

function mjdiSimSubmit() {
    const q = mjdiSim.questions[mjdiSim.currentQ];
    let correct = false;
    if (q.type === 'mc') {
        const sel = document.querySelector('#mjdi-sim-q-input button[data-idx]');
        // Visual selection fallback
        if (sel && document.querySelector('#mjdi-sim-q-input button[style*="add8e6"]')) {
             if (parseInt(sel.dataset.idx) === q.answer) correct = true;
        }
        // Fallback for visual selection if data-idx fails or wasn't set correctly by DOM
        const allBtns = document.querySelectorAll('#mjdi-sim-q-input button');
        for(let i=0; i<allBtns.length; i++) {
            if(allBtns[i].style.background.includes('add8e6') && i === q.answer) correct = true;
        }
    } else {
        const val = document.getElementById('mjdi-sim-ans-text').value;
        if (val && val.toLowerCase().includes(String(q.answer).toLowerCase())) correct = true;
    }
    mjdiSimResult(correct);
}

function mjdiSimResult(isCorrect) {
    mjdiSim.waitingPractical = false;
    const fb = document.getElementById('mjdi-sim-feedback');
    if (isCorrect) { mjdiSim.score++; fb.innerText = "Correct!"; fb.style.color='green'; }
    else { fb.innerText = "Incorrect."; fb.style.color='red'; }
    
    document.getElementById('mjdi-sim-footer-score').innerText = `Score: ${mjdiSim.score}`;
    document.getElementById('mjdi-sim-submit').style.display='none';
    document.getElementById('mjdi-sim-next').disabled = false;
}

function mjdiSimNext() {
    document.querySelectorAll('.mjdi-internal-window').forEach(w => w.style.display='none');
    mjdiSim.currentQ++;
    mjdiSimLoadQ();
}

function mjdiSimFinish() {
    const pct = (mjdiSim.score / mjdiSim.questions.length) * 100;
    const qBody = document.getElementById('mjdi-sim-q-body');
    
    let html = `<h3>Complete</h3><p>Score: ${pct.toFixed(0)}%</p>`;
    if (pct >= mjdiSimConfig.pass) {
        html += '<p style="color:green;font-weight:bold">PASS</p>';
        html += '<button class="mjdi-btn-std" onclick="printMjdiCert()">Print Certificate</button>';
    } else {
        html += '<p style="color:red;font-weight:bold">FAIL – Revision Required</p>';
        html += '<button class="mjdi-btn-std" onclick="window.location.reload()">Re-Test</button>';
    }
    
    qBody.innerHTML = html;
    document.getElementById('mjdi-sim-q-input').innerHTML = '';
    document.getElementById('mjdi-sim-next').style.display = 'none';
    document.getElementById('mjdi-sim-lock').style.display = 'block';
    document.getElementById('mjdi-sim-prompt').classList.add('centered');
}

function printMjdiCert() {
    const w = window.open('', '', 'width=900,height=700');
    w.document.write(`<html><head><title>MJDI Competence Certificate</title><style>@page { size: landscape; margin: 0; } body { font-family: 'Times New Roman', serif; padding: 40px; text-align: center; border: 20px solid #0a246a; margin: 20px; height: 90vh; position: relative; background: #fff; } .bg-logo { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 500px; opacity: 0.1; filter: grayscale(100%); z-index: -1; } h1 { font-size: 48px; color: #0a246a; margin-bottom: 10px; text-transform: uppercase; } h2 { font-size: 24px; color: #555; margin-top: 0; } .cert-content { margin-top: 60px; font-size: 24px; line-height: 1.6; } .candidate { font-size: 36px; font-weight: bold; border-bottom: 2px solid #000; display: inline-block; min-width: 400px; margin: 20px 0; } .footer { margin-top: 100px; display: flex; justify-content: space-around; } .sig-line { border-top: 1px solid #000; width: 300px; padding-top: 10px; font-size: 18px; } </style></head><body><img src="https://upload.wikimedia.org/wikipedia/commons/e/ea/Cap_Badge_of_the_RLC.png" class="bg-logo"><h1>Certificate of Competence</h1><h2>Management of the Joint Deployed Inventory</h2><div class="cert-content"><p>This is to certify that</p><div class="candidate">${mjdiSession.rank} ${mjdiSession.name}</div><p>Has successfully passed the MJDI Unit Operator Assessment</p><p>Score: ${(mjdiSession.score/mjdiSession.questions.length*100).toFixed(0)}%</p></div><div class="footer"><div class="sig-line">Date: ${new Date().toLocaleDateString()}</div><div class="sig-line">Instructor Signature</div></div></body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
}

// NAVIGATION
function mjdiSimMenu(action, el) {
    if (el && el.classList.contains('disabled')) return;
    
    if (mjdiSim.waitingPractical) {
        const q = mjdiSim.questions[mjdiSim.currentQ];
        if (q.type === 'practical_nav' && q.targetId === action) {
            mjdiSimResult(true);
        }
    }

    document.querySelectorAll('.mjdi-internal-window').forEach(w => w.style.display='none');
    let screenId = '';
    switch(action) {
        case 'menu-txn-demands': screenId = 'screen-demands'; break;
        case 'menu-txn-issues': screenId = 'screen-issues'; break;
        case 'menu-txn-receipts': screenId = 'screen-receipts'; break;
        case 'menu-txn-asset-adjust': screenId = 'screen-asset-item'; break;
        case 'menu-txn-jobs-mgmt': screenId = 'screen-job-mgmt'; break;
        case 'menu-amend-item': screenId = 'screen-amend-item'; break;
        case 'menu-int-item': screenId = 'screen-int-item'; break;
        case 'menu-int-demands': screenId = 'screen-int-demands'; break;
        case 'menu-int-org-addr': screenId = 'screen-org-addr'; break;
        case 'menu-rep-fallback': screenId = 'screen-rep-fallback'; break;
    }
    if(screenId) {
        const win = document.getElementById(screenId);
        if(win) win.style.display = 'flex';
        document.getElementById('mjdi-sim-footer-status').innerText = action;
    }
}

function mjdiSimToolbar(action) {
    if (action === 'save') {
        if (mjdiSim.waitingPractical) {
            const q = mjdiSim.questions[mjdiSim.currentQ];
            if (q.type === 'practical_form') {
                let match = true;
                for (const [k, v] of Object.entries(q.formData)) {
                    const f = document.getElementById(k);
                    if (!f || !f.value.includes(v)) match = false;
                }
                if (match) { mjdiSimResult(true); mjdiSimAlert("Saved. Correct."); }
                else { mjdiSimResult(false); mjdiSimAlert("Saved. Incorrect data."); }
                return;
            }
        }
        mjdiSimAlert("Record Saved.");
    }
    if (action === 'help') document.getElementById('mjdi-sim-help').style.display='flex';
}

// HELPERS
function mjdiSimAlert(msg) {
    document.getElementById('mjdi-sim-alert-text').innerText = msg;
    document.getElementById('mjdi-sim-alert').style.display = 'flex';
}
function mjdiSimAlertClose() { document.getElementById('mjdi-sim-alert').style.display = 'none'; }

function mjdiSimTab(pid, tab) {
    const p = document.getElementById(pid);
    p.querySelectorAll('.mjdi-tab').forEach((t,i) => t.classList.toggle('active', i+1 == tab));
    p.querySelectorAll('.mjdi-tab-page').forEach((pg,i) => pg.classList.toggle('active', i+1 == tab));
}

function mjdiSimApplyTabs() {
    const labels = tabConfig.amendItemTabs;
    const tabs = document.querySelectorAll('#screen-amend-item .mjdi-tab');
    tabs.forEach((t, i) => { if (labels[i]) t.innerText = labels[i]; });
}

// MOCK DATA FILLERS
function mjdiDemandsItemSearch() {
    document.getElementById('dem-nsc').value = '2590';
    document.getElementById('dem-niin').value = '123456789';
    document.getElementById('dem-name').value = 'BRACKET, MOUNTING';
    document.getElementById('dem-uoi').value = 'EA';
    document.getElementById('dem-im').value = 'LCST';
    document.getElementById('dem-remarks').value = 'Example training demand.';
    mjdiSimAlert('Sample item loaded.');
}
function mjdiAmendItemSearch() {
    document.getElementById('amend-nsn').value = '2590-99-123-4567';
    document.getElementById('amend-loc-old').value = 'A1-BAY-01';
    mjdiSimAlert('Example NSN loaded.');
}
function mjdiAmendAddStorage() {
    const newLoc = document.getElementById('amend-loc-new').value || 'NEWLOC';
    mjdiSimAlert(`Training: New location ${newLoc} added.`);
}
function mjdiIntItemInterrogate() {
    document.getElementById('int-item-matcon').value = 'A1';
    document.getElementById('int-item-soh').value = '24';
    document.getElementById('int-item-storage').value = 'A1-BAY-01; A1-BAY-02';
    mjdiSimAlert('Interrogation complete.');
}
function mjdiOrgAddrFind() {
    document.getElementById('org-addr-text').value = `7 Para RHA Wksp\nKiwi Barracks\nColchester\nCO2 7UT`;
    mjdiSimAlert('Address found.');
}
function mjdiJobIssueStock() {
    document.getElementById('job-status').innerText = 'Issued (Training)';
    mjdiSimAlert('Stock issued.');
}
function mjdiJobClearEarmark() {
    document.getElementById('job-status').innerText = 'Earmark Cleared (Training)';
    mjdiSimAlert('Earmark cleared.');
}

// ADMIN
let mjdiEditIdx = -1;
function mjdiSimAdminOpen() { document.getElementById('mjdi-sim-pin').style.display = 'flex'; }
function mjdiSimAdminCheck() {
    if (document.getElementById('mjdi-sim-pin-input').value === '1134') {
        document.getElementById('mjdi-sim-pin').style.display = 'none';
        document.getElementById('mjdi-sim-admin').style.display = 'flex';
        renderMjdiAdminList();
    } else mjdiSimAlert("Incorrect PIN");
}
function renderMjdiAdminList() {
    const list = document.getElementById('mjdi-admin-qlist');
    list.innerHTML = '';
    mjdiSimQuestions.forEach((q, i) => {
        const d = document.createElement('div');
        d.innerHTML = `<strong>${i+1}.</strong> ${q.text.substring(0,30)}...`;
        d.style.borderBottom='1px solid #ccc'; d.style.padding='5px'; d.style.cursor='pointer';
        d.onclick = () => loadMjdiAdminQ(i);
        list.appendChild(d);
    });
}
function updateAdminFields() {
    const type = document.getElementById('mjdi-adm-type').value;
    document.getElementById('adm-group-options').style.display = type === 'mc' ? 'block' : 'none';
    document.getElementById('adm-group-answer').style.display = (type === 'mc' || type === 'written') ? 'block' : 'none';
    document.getElementById('adm-group-nav').style.display = type === 'practical_nav' ? 'block' : 'none';
    document.getElementById('adm-group-form').style.display = type === 'practical_form' ? 'block' : 'none';
}
function loadMjdiAdminQ(i) {
    mjdiEditIdx = i;
    const q = mjdiSimQuestions[i];
    document.getElementById('mjdi-adm-qtext').value = q.text;
    document.getElementById('mjdi-adm-type').value = q.type;
    document.getElementById('mjdi-adm-topic').value = q.topic || '';
    updateAdminFields();
    if(q.type==='mc') {
        document.getElementById('mjdi-adm-options').value = q.options.join(',');
        document.getElementById('mjdi-adm-answer').value = q.answer;
    } else if(q.type==='written') {
        document.getElementById('mjdi-adm-answer').value = q.answer;
    } else if(q.type==='practical_nav') {
        document.getElementById('mjdi-adm-nav-target').value = q.targetId;
    } else if(q.type==='practical_form') {
        document.getElementById('mjdi-adm-form-id').value = q.formId;
        document.getElementById('mjdi-adm-form-data').value = JSON.stringify(q.formData);
    }
}
function mjdiAdmSave() {
    const type = document.getElementById('mjdi-adm-type').value;
    let newQ = {
        text: document.getElementById('mjdi-adm-qtext').value,
        type: type,
        topic: document.getElementById('mjdi-adm-topic').value
    };
    if(type==='mc') {
        newQ.options = document.getElementById('mjdi-adm-options').value.split(',');
        newQ.answer = parseInt(document.getElementById('mjdi-adm-answer').value);
    } else if(type==='written') {
        newQ.answer = document.getElementById('mjdi-adm-answer').value;
    } else if(type==='practical_nav') {
        newQ.targetId = document.getElementById('mjdi-adm-nav-target').value;
    } else if(type==='practical_form') {
        newQ.formId = document.getElementById('mjdi-adm-form-id').value;
        newQ.formData = JSON.parse(document.getElementById('mjdi-adm-form-data').value);
    }
    
    if(mjdiEditIdx >= 0) mjdiSimQuestions[mjdiEditIdx] = newQ;
    else mjdiSimQuestions.push(newQ);
    
    renderMjdiAdminList();
    mjdiSimAlert("Saved");
}
function mjdiAdmNew() {
    mjdiEditIdx = -1;
    document.getElementById('mjdi-adm-qtext').value = '';
}
