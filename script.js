/**
 * 夢のバンドフェス2026 - Application Form Logic
 * Handles: conditional branching, validation, price calculation, GAS submission
 */

// ====== CONFIG ======
const CONFIG = {
    GAS_URL: 'https://script.google.com/macros/s/AKfycbySXR6ThrZVRaBEBClEXRF7SXIwOlahXql8AsMD4lOvs736n6xWdZFhPIvBDitlHKQZ/exec',
    ADMIN_EMAILS: ['nishikawaryo841@gmail.com', 'studio.ours24@gmail.com'],
    PRICES: { general: 3000, student: 2000, returning: 2000 },
    DURATION_OPTIONS: {
        'バンド': [
            { value: '20分', label: '20分' },
            { value: '30分', label: '30分' }
        ],
        'デュオ': [
            { value: '15分', label: '15分' },
            { value: '20分', label: '20分' }
        ],
        'ソロ': [
            { value: '10分', label: '10分' },
            { value: '15分', label: '15分' },
            { value: '20分', label: '20分' }
        ]
    },
    NAME_LABELS: {
        'バンド': { label: 'バンド名', placeholder: '例: The Rockers' },
        'デュオ': { label: 'ユニット名', placeholder: '例: Acoustic Duo' },
        'ソロ': { label: 'アーティスト名', placeholder: '例: Yuki' }
    }
};

// ====== DOM REFERENCES ======
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const form = $('#applicationForm');
const performanceTypeRadios = $$('input[name="performanceType"]');
const groupNameInput = $('#groupName');
const groupNameLabel = $('#label-groupName');
const memberCountGroup = $('#group-memberCount');
const memberCountInput = $('#memberCount');
const previousRadios = $$('input[name="previousParticipation"]');
const ageCategoryRadios = $$('input[name="ageCategory"]');
const studioUsageRadios = $$('input[name="studioUsage"]');
const studioUsersGroup = $('#group-studioUsers');
const studioUsersList = $('#studioUsersList');
const addStudioUserBtn = $('#addStudioUser');
const durationContainer = $('#performanceDuration');
const priceBreakdown = $('#priceBreakdown');
const priceTotal = $('#priceTotal');
const submitBtn = $('#submitBtn');

// ====== STATE ======
let currentType = null;

// ====== INIT ======
document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
});

function bindEvents() {
    // Performance type change
    performanceTypeRadios.forEach(radio => {
        radio.addEventListener('change', handleTypeChange);
    });

    // Previous participation
    previousRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const hint = $('#hint-previousDiscount');
            hint.style.display = radio.value === '有' && radio.checked ? '' : 'none';
            updatePrice();
        });
    });

    // Age category
    ageCategoryRadios.forEach(radio => {
        radio.addEventListener('change', updatePrice);
    });

    // Studio usage
    studioUsageRadios.forEach(radio => {
        radio.addEventListener('change', handleStudioUsageChange);
    });

    // Add studio user
    addStudioUserBtn.addEventListener('click', addStudioUserRow);

    // Member count
    memberCountInput.addEventListener('input', updatePrice);

    // Form submit
    form.addEventListener('submit', handleSubmit);

    // Clear errors on input
    form.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('input', () => clearFieldError(el));
        el.addEventListener('change', () => clearFieldError(el));
    });
}

// ====== CONDITIONAL BRANCHING ======
function handleTypeChange(e) {
    currentType = e.target.value;

    // Update group name label
    const nameConfig = CONFIG.NAME_LABELS[currentType];
    groupNameLabel.innerHTML = `${nameConfig.label} <span class="required-mark">*</span>`;
    groupNameInput.placeholder = nameConfig.placeholder;

    // Show/hide member count
    if (currentType === 'バンド') {
        memberCountGroup.style.display = '';
        memberCountInput.required = true;
    } else {
        memberCountGroup.style.display = 'none';
        memberCountInput.required = false;
        memberCountInput.value = currentType === 'デュオ' ? '2' : '1';
    }

    // Update duration options
    updateDurationOptions();

    // Update price
    updatePrice();
}

function updateDurationOptions() {
    const options = CONFIG.DURATION_OPTIONS[currentType] || [];
    durationContainer.innerHTML = '';

    options.forEach((opt, i) => {
        const id = `duration-${i}`;
        const label = document.createElement('label');
        label.className = 'radio-pill';
        label.setAttribute('for', id);

        const input = document.createElement('input');
        input.type = 'radio';
        input.id = id;
        input.name = 'performanceDuration';
        input.value = opt.value;
        input.required = true;

        const span = document.createElement('span');
        span.textContent = opt.label;

        label.appendChild(input);
        label.appendChild(span);
        durationContainer.appendChild(label);

        // Bind change to clear error
        input.addEventListener('change', () => clearFieldError(input));
    });
}

function handleStudioUsageChange(e) {
    const show = e.target.value === '有';
    studioUsersGroup.style.display = show ? '' : 'none';

    if (!show) {
        // Clear user name fields
        studioUsersList.innerHTML = `
            <div class="studio-user-row">
                <input type="text" name="studioUsers[]" class="form-input" placeholder="ご利用者様のお名前">
            </div>`;
    }
}

function addStudioUserRow() {
    const row = document.createElement('div');
    row.className = 'studio-user-row';
    row.innerHTML = `
        <input type="text" name="studioUsers[]" class="form-input" placeholder="ご利用者様のお名前">
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">✕</button>`;
    studioUsersList.appendChild(row);
}

// ====== PRICE CALCULATION ======
function updatePrice() {
    if (!currentType) {
        priceBreakdown.innerHTML = '<p class="price-line">出演形態を選択してください</p>';
        priceTotal.textContent = '—';
        return;
    }

    let count;
    if (currentType === 'ソロ') {
        count = 1;
    } else if (currentType === 'デュオ') {
        count = 2;
    } else {
        count = parseInt(memberCountInput.value) || 0;
    }

    const prevChecked = document.querySelector('input[name="previousParticipation"]:checked');
    const ageChecked = document.querySelector('input[name="ageCategory"]:checked');

    let unitPrice = 0;
    let priceLabel = '';

    if (prevChecked && prevChecked.value === '有') {
        unitPrice = CONFIG.PRICES.returning;
        priceLabel = '前回出場者割引';
    } else if (ageChecked) {
        if (ageChecked.value === '中高生') {
            unitPrice = CONFIG.PRICES.student;
            priceLabel = '中高生';
        } else {
            unitPrice = CONFIG.PRICES.general;
            priceLabel = '一般';
        }
    }

    if (count > 0 && unitPrice > 0) {
        const total = count * unitPrice;
        priceBreakdown.innerHTML = `
            <p class="price-line">${priceLabel}: ¥${unitPrice.toLocaleString()} × ${count}人</p>`;
        priceTotal.textContent = `¥${total.toLocaleString()}`;
    } else {
        let msg = count === 0 ? '人数を入力してください' : '年齢区分を選択してください';
        priceBreakdown.innerHTML = `<p class="price-line">${msg}</p>`;
        priceTotal.textContent = '—';
    }
}

// ====== VALIDATION ======
function validateForm() {
    let isValid = true;
    clearAllErrors();

    // Performance type
    if (!document.querySelector('input[name="performanceType"]:checked')) {
        showFieldError('performanceType', '出演形態を選択してください');
        isValid = false;
    }

    // Group name
    if (!groupNameInput.value.trim()) {
        showFieldError('groupName', `${CONFIG.NAME_LABELS[currentType]?.label || '名前'}を入力してください`);
        isValid = false;
    }

    // Member count (band only)
    if (currentType === 'バンド') {
        const count = parseInt(memberCountInput.value);
        if (!count || count < 2) {
            showFieldError('memberCount', '2人以上の人数を入力してください');
            isValid = false;
        }
    }

    // Representative name
    const repName = $('#representativeName');
    if (!repName.value.trim()) {
        showFieldError('representativeName', '代表者氏名を入力してください');
        isValid = false;
    }

    // Email
    const email = $('#email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        showFieldError('email', 'メールアドレスを入力してください');
        isValid = false;
    } else if (!emailPattern.test(email.value)) {
        showFieldError('email', '有効なメールアドレスを入力してください');
        isValid = false;
    }

    // Phone
    const phone = $('#phone');
    const phonePattern = /^[\d\-+()]{10,15}$/;
    if (!phone.value.trim()) {
        showFieldError('phone', '電話番号を入力してください');
        isValid = false;
    } else if (!phonePattern.test(phone.value.replace(/\s/g, ''))) {
        showFieldError('phone', '有効な電話番号を入力してください');
        isValid = false;
    }

    // Previous participation
    if (!document.querySelector('input[name="previousParticipation"]:checked')) {
        showFieldError('previousParticipation', '選択してください');
        isValid = false;
    }

    // Age category
    if (!document.querySelector('input[name="ageCategory"]:checked')) {
        showFieldError('ageCategory', '年齢区分を選択してください');
        isValid = false;
    }

    // Studio usage
    if (!document.querySelector('input[name="studioUsage"]:checked')) {
        showFieldError('studioUsage', '選択してください');
        isValid = false;
    }

    // Duration
    if (!document.querySelector('input[name="performanceDuration"]:checked')) {
        showFieldError('performanceDuration', '希望出演時間を選択してください');
        isValid = false;
    }

    // Preferred date
    if (!document.querySelector('input[name="preferredDate1"]:checked')) {
        showFieldError('preferredDate1', '希望出演日を選択してください');
        isValid = false;
    }

    // Preferred time slot
    if (!document.querySelector('input[name="preferredTimeSlot1"]:checked')) {
        showFieldError('preferredTimeSlot1', '希望時間帯を選択してください');
        isValid = false;
    }

    // Cancel notification
    if (!document.querySelector('input[name="cancelNotification"]:checked')) {
        showFieldError('cancelNotification', '選択してください');
        isValid = false;
    }

    return isValid;
}

function showFieldError(fieldName, message) {
    const errorEl = $(`#error-${fieldName}`);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('is-visible');
    }
    // Highlight input if exists
    const input = $(`#${fieldName}`);
    if (input && input.classList) {
        input.classList.add('is-error');
    }
}

function clearFieldError(el) {
    const name = el.name || el.id;
    const errorEl = $(`#error-${name}`);
    if (errorEl) {
        errorEl.classList.remove('is-visible');
    }
    el.classList.remove('is-error');
}

function clearAllErrors() {
    $$('.error-message').forEach(el => el.classList.remove('is-visible'));
    $$('.is-error').forEach(el => el.classList.remove('is-error'));
}

// ====== FORM SUBMISSION ======
async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        // Scroll to first error
        const firstError = document.querySelector('.error-message.is-visible');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // Check GAS URL
    if (!CONFIG.GAS_URL) {
        alert('フォームの送信先が設定されていません。管理者にお問い合わせください。');
        return;
    }

    // Show loading
    setSubmitLoading(true);

    // Collect data
    const data = collectFormData();

    try {
        const response = await fetch(CONFIG.GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(data),
            redirect: 'follow'
        });

        let receiptNumber = '確認メールに記載されています';
        try {
            const result = await response.json();
            if (result.receiptNumber) {
                receiptNumber = result.receiptNumber;
            }
        } catch (parseErr) {
            // JSON parse failed (opaque response) — fallback
            console.log('Response parse skipped, receipt in email');
        }

        showCompletion(data.email, receiptNumber);
    } catch (error) {
        // CORS error or network error — try no-cors fallback
        console.warn('CORS fetch failed, trying no-cors fallback:', error);
        try {
            await fetch(CONFIG.GAS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(data)
            });
            showCompletion(data.email, '確認メールに記載されています');
        } catch (fallbackError) {
            console.error('Submit error:', fallbackError);
            alert('送信中にエラーが発生しました。もう一度お試しください。');
            setSubmitLoading(false);
        }
    }
}

function collectFormData() {
    const getRadio = (name) => {
        const el = document.querySelector(`input[name="${name}"]:checked`);
        return el ? el.value : '';
    };

    // Studio users
    const studioUsers = [];
    $$('input[name="studioUsers[]"]').forEach(input => {
        if (input.value.trim()) studioUsers.push(input.value.trim());
    });

    // Member count
    let memberCount;
    if (currentType === 'ソロ') memberCount = 1;
    else if (currentType === 'デュオ') memberCount = 2;
    else memberCount = parseInt(memberCountInput.value) || 0;

    // Calculate price
    const prevPart = getRadio('previousParticipation');
    const ageCat = getRadio('ageCategory');
    let unitPrice = prevPart === '有' ? CONFIG.PRICES.returning
        : (ageCat === '中高生' ? CONFIG.PRICES.student : CONFIG.PRICES.general);
    const totalPrice = memberCount * unitPrice;

    return {
        performanceType: getRadio('performanceType'),
        groupName: groupNameInput.value.trim(),
        memberCount: memberCount,
        representativeName: $('#representativeName').value.trim(),
        email: $('#email').value.trim(),
        phone: $('#phone').value.trim(),
        previousParticipation: prevPart,
        ageCategory: ageCat,
        studioUsage: getRadio('studioUsage'),
        studioUsers: studioUsers.join(', '),
        performanceDuration: getRadio('performanceDuration'),
        preferredDate1: getRadio('preferredDate1'),
        preferredDate2: getRadio('preferredDate2'),
        preferredTimeSlot1: getRadio('preferredTimeSlot1'),
        preferredTimeSlot2: getRadio('preferredTimeSlot2'),
        cancelNotification: getRadio('cancelNotification'),
        remarks: $('#remarks').value.trim(),
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        timestamp: new Date().toISOString()
    };
}

function setSubmitLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.querySelector('.btn-submit-text').style.display = loading ? 'none' : '';
    submitBtn.querySelector('.btn-submit-loading').style.display = loading ? '' : 'none';
}

function showCompletion(email, receiptNumber) {
    $('#completionEmail').textContent = email;
    $('#completionReceipt').textContent = receiptNumber;
    $('#completionOverlay').style.display = '';
    document.body.style.overflow = 'hidden';
}
