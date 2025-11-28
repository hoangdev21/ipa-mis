// Bộ từ điển custom IPA cho các từ có phiên âm sai từ API
const customIPADict = {
    'black': '/blæk/',
    'blank': '/blæŋk/',
    'brand': '/brænd/',
    'bread': '/bred/',
    'dread': '/dred/',
    'glad': '/ɡlæd/',
    'grand': '/ɡrænd/',
    'hand': '/hænd/',
    'land': '/lænd/',
    'sand': '/sænd/',
    'stand': '/stænd/',
    'strand': '/strænd/',
    'track': '/træk/',
    'trash': '/træʃ/',
    'wrap': '/ræp/',
    'wrath': '/ræθ/',
    'brass': '/bræs/',
    'class': '/klæs/',
    'crash': '/kræʃ/',
    'draft': '/dræft/',
    'grass': '/ɡræs/',
    'graph': '/ɡræf/',
    'grasp': '/ɡræsp/',
    'pass': '/pæs/',
    'path': '/pæθ/',
    'task': '/tæsk/',
    'vast': '/væst/',
    'wonderful': '/ˈwʌndəfəl/',
    'wonder': '/ˈwʌndər/',
    'wandering': '/ˈwɒndərɪŋ/',
    'battery': '/ˈbætəri/',
    'better': '/ˈbetər/',
    'butter': '/ˈbʌtər/',
    'pattern': '/ˈpætərn/',
    'matter': '/ˈmætər/',
    'water': '/ˈwɔːtər/',
    'nature': '/ˈneɪtʃər/',
    'picture': '/ˈpɪktʃər/',
    'future': '/ˈfjuːtʃər/',
    'culture': '/ˈkʌltʃər/',
    'sister': '/ˈsɪstər/',
    'finger': '/ˈfɪŋɡər/',
    'danger': '/ˈdeɪndʒər/',
    'anger': '/ˈæŋɡər/',
    'hunger': '/ˈhʌŋɡər/',
    'cover': '/ˈkʌvər/',
    'never': '/ˈnevər/',
    'ever': '/ˈevər/',
    'remember': '/rɪˈmembər/',
    'number': '/ˈnʌmbər/',
    'summer': '/ˈsʌmər/',
    'winter': '/ˈwɪntər/',
    'tower': '/ˈtaʊər/',
    'power': '/ˈpaʊər/',
    'flower': '/ˈflaʊər/',
    'teacher': '/ˈtiːtʃər/',
    'dinner': '/ˈdɪnər/',
    'winner': '/ˈwɪnər/',
    'must': '/məst; strong mʌst/',
    'much': '/mʌtʃ/',
    'shutter': '/ˈʃʌtə/',
    'untrue': '/ʌnˈtruː/',
    'barn': '/bɑːn $ bɑːrn/',
    'shot': '/ʃɒt/',
    'lock': '/lɒk/',
    'rock': '/rɒk/',
    'sock': '/sɒk/',
    'clock': '/klɒk/',
    'block': '/blɒk/',
    'stock': '/stɒk/',
    'talk': '/tɔːk/',
    'walk': '/wɔːk/',
    'chalk': '/tʃɔːk/',
    'hawk': '/hɔːk/',
    'shock': '/ʃɒk/',
    'dock': '/dɒk/',
    'knock': '/nɒk/',
    'mock': '/mɒk/',
    'pocket': '/ˈpɒkɪt/',
    'rocket': '/ˈrɒkɪt/',
    'socket': '/ˈsɒkɪt/',
};

// Hàm dịch sang tiếng Việt sử dụng Google Translate API
async function translateToVietnamese(text) {
    try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`);
        const data = await response.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
            return data[0][0][0];
        }
        return text;
    } catch (err) {
        return text;
    }
}

async function processWords() {
    const input = document.getElementById('wordInput').value.trim();
    
    if (!input) {
        alert('Vui lòng nhập ít nhất một từ!');
        return;
    }

    const words = input.split('\n').map(w => w.trim()).filter(w => w);
    
    if (words.length === 0) {
        alert('Không tìm thấy từ hợp lệ!');
        return;
    }

    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsSection = document.getElementById('resultsSection');

    
    loadingIndicator.style.display = 'block';
    resultsSection.innerHTML = '';

    try {
        const results = await Promise.all(words.map(async (word) => {
            try {
                const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
                
                if (!response.ok) {
                    const translated = await translateToVietnamese(word);
                    return {
                        word: word,
                        phonetic: '/.../',
                        shortMeaning: translated !== word ? translated : 'Không tìm thấy',
                        fullMeaning: ''
                    };
                }
                
                const data = await response.json();
                const entry = data[0];
                
                // Kiểm tra từ điển custom trước
                const wordLower = word.toLowerCase();
                if (customIPADict[wordLower]) {
                    const customPhonetic = customIPADict[wordLower];
                    const posVietnamese = {
                        'noun': 'danh từ',
                        'verb': 'động từ', 
                        'adjective': 'tính từ',
                        'adverb': 'trạng từ',
                        'pronoun': 'đại từ',
                        'preposition': 'giới từ',
                        'conjunction': 'liên từ',
                        'interjection': 'thán từ',
                        'determiner': 'từ hạn định',
                        'article': 'mạo từ'
                    };
                    
                    let partOfSpeech = '';
                    let englishDefinition = '';
                    if (entry.meanings && entry.meanings.length > 0) {
                        const firstMeaning = entry.meanings[0];
                        partOfSpeech = firstMeaning.partOfSpeech || '';
                        englishDefinition = firstMeaning.definitions?.[0]?.definition || '';
                    }
                    
                    const shortMeaning = await translateToVietnamese(word);
                    let fullMeaning = '';
                    if (englishDefinition) {
                        fullMeaning = await translateToVietnamese(englishDefinition);
                    }
                    
                    const posVi = posVietnamese[partOfSpeech] || partOfSpeech;
                    
                    return {
                        word: entry.word || word,
                        phonetic: customPhonetic,
                        partOfSpeech: posVi,
                        shortMeaning: shortMeaning,
                        fullMeaning: fullMeaning
                    };
                }
                
                // Lấy phiên âm IPA - Chỉ lấy broad transcription (dùng //) 
                // Bỏ qua narrow transcription (dùng [] hoặc có ký tự ɚ, ɫ̩)
                let phonetic = '';
                let phoneticBroad = '';   // Phiên âm broad (dùng //)
                let phoneticWithAE = '';  // Phiên âm có âm æ (chuẩn)
                
                // Kiểm tra ký tự narrow transcription
                const isNarrowTranscription = (text) => {
                    // Ký tự đặc biệt của narrow transcription
                    return /[ɚɝɫ̩ɹ̃ˤʰ]/.test(text) || text.startsWith('[');
                };
                
                if (entry.phonetics && entry.phonetics.length > 0) {
                    for (const p of entry.phonetics) {
                        if (p.text) {
                            // Bỏ qua narrow transcription
                            if (isNarrowTranscription(p.text)) {
                                continue;
                            }
                            
                            // Ưu tiên phiên âm broad (dùng //)
                            if (p.text.startsWith('/')) {
                                phoneticBroad = p.text;
                                
                                // Phiên âm có âm æ (chuẩn General American)
                                if (p.text.includes('æ')) {
                                    phoneticWithAE = p.text;
                                }
                            }
                        }
                    }
                }
                
                // Ưu tiên: có æ > broad > entry.phonetic (nếu là broad)
                const defaultPhonetic = (entry.phonetic && entry.phonetic.startsWith('/') && !isNarrowTranscription(entry.phonetic)) ? entry.phonetic : '';
                phonetic = phoneticWithAE || phoneticBroad || defaultPhonetic || '';
                
                // Nếu vẫn không có, lấy bất kỳ phiên âm broad nào (không phải narrow)
                if (!phonetic && entry.phonetics && entry.phonetics.length > 0) {
                    const broadPhonetic = entry.phonetics.find(p => p.text && p.text.startsWith('/') && !isNarrowTranscription(p.text));
                    phonetic = broadPhonetic?.text || '/. . ./';
                }
                
                // Chuẩn hóa phiên âm: loại bỏ dấu chấm phân cách âm tiết
                phonetic = phonetic.replace(/\./g, '');
                
                // Loại bỏ dấu kéo dài không cần thiết (ː sau æ)
                phonetic = phonetic.replace(/æː/g, 'æ');
                
                // Chuẩn hóa syllabic consonants CHỈ khi nó thực sự là syllabic
                // Kiểm tra: əl, ən, əm, ər chỉ được xóa ə khi:
                // 1. Ở cuối từ (trước /)
                // 2. Theo sau bởi consonant khác (không phải nguyên âm)
                // Ví dụ: /ˈpædəl/ → /ˈpædl/ (syllabic l)
                //        /ˈwʌndərfl/ → /ˈwʌndərfl/ (KHÔNG thay - r không syllabic)
                
                // Chỉ xóa ə trước l/n/m/r khi nó ở cuối từ
                phonetic = phonetic.replace(/əl\/$/g, 'l/');
                phonetic = phonetic.replace(/ən\/$/g, 'n/');
                phonetic = phonetic.replace(/əm\/$/g, 'm/');
                // KHÔNG xóa ər - r thường theo sau là vowel hoặc ở cuối có l/n
                
                // Thay thế ký hiệu IPA ɹ bằng r thông thường
                phonetic = phonetic.replace(/ɹ/g, 'r');
                
                // Lấy loại từ và nghĩa tiếng Anh
                let partOfSpeech = '';
                let englishDefinition = '';
                if (entry.meanings && entry.meanings.length > 0) {
                    const firstMeaning = entry.meanings[0];
                    partOfSpeech = firstMeaning.partOfSpeech || '';
                    englishDefinition = firstMeaning.definitions?.[0]?.definition || '';
                }
                
                // Dịch từ gốc (nghĩa ngắn gọn)
                const shortMeaning = await translateToVietnamese(word);
                
                // Dịch định nghĩa chi tiết
                let fullMeaning = '';
                if (englishDefinition) {
                    fullMeaning = await translateToVietnamese(englishDefinition);
                }
                
                // Format loại từ sang tiếng Việt
                const posVietnamese = {
                    'noun': 'danh từ',
                    'verb': 'động từ', 
                    'adjective': 'tính từ',
                    'adverb': 'trạng từ',
                    'pronoun': 'đại từ',
                    'preposition': 'giới từ',
                    'conjunction': 'liên từ',
                    'interjection': 'thán từ',
                    'determiner': 'từ hạn định',
                    'article': 'mạo từ'
                };
                
                const posVi = posVietnamese[partOfSpeech] || partOfSpeech;
                
                return {
                    word: entry.word || word,
                    phonetic: phonetic || '/.../',
                    partOfSpeech: posVi,
                    shortMeaning: shortMeaning,
                    fullMeaning: fullMeaning
                };
            } catch (err) {
                return {
                    word: word,
                    phonetic: 'Lỗi',
                    shortMeaning: 'Không thể tra cứu',
                    fullMeaning: ''
                };
            }
        }));

        displayResults(results);
        
    } catch (error) {
        resultsSection.innerHTML = `<div class="error glass-card">❌ Lỗi: ${error.message}</div>`;
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

function displayResults(results) {
    const resultsSection = document.getElementById('resultsSection');
    
    if (!results || results.length === 0) {
        resultsSection.innerHTML = '<div class="error glass-card">Không tìm thấy kết quả</div>';
        return;
    }

    resultsSection.innerHTML = results.map(item => `
        <div class="word-card glass-card">
            <div class="word-header">
                <div class="word-title">${item.word}</div>
                <div class="audio-buttons">
                    <button class="audio-btn" onclick="speak('${item.word}', 'en-US')">
                        🇺🇸 US
                    </button>
                    <button class="audio-btn" onclick="speak('${item.word}', 'en-GB')">
                        🇬🇧 UK
                    </button>
                </div>
            </div>
            <div class="word-info">
                <div class="info-row">
                    <div class="info-label">📌 Phiên âm:</div>
                    <div class="info-content phonetic">${item.phonetic}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">🎯 Nghĩa:</div>
                    <div class="info-content">
                        <span class="short-meaning">${item.shortMeaning}</span>
                        ${item.partOfSpeech ? `<span class="part-of-speech">(${item.partOfSpeech})</span>` : ''}
                    </div>
                </div>
                ${item.fullMeaning ? `
                <div class="info-row explanation-row">
                    <div class="info-label">📖 Giải thích:</div>
                    <div class="info-content explanation">${item.fullMeaning}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Lưu trữ voices đã load
let voicesLoaded = false;
let availableVoices = [];

// Load voices khi có sẵn
function loadVoices() {
    availableVoices = speechSynthesis.getVoices();
    if (availableVoices.length > 0) {
        voicesLoaded = true;
    }
}

// Đảm bảo voices được load (quan trọng cho Safari/iOS)
if ('speechSynthesis' in window) {
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
}

// Tìm giọng đọc phù hợp nhất
function findBestVoice(lang) {
    const voices = speechSynthesis.getVoices();
    
    // Ưu tiên giọng theo thứ tự
    const preferredVoices = lang === 'en-US' 
        ? ['Samantha', 'Alex', 'Google US English', 'Microsoft David', 'en-US', 'en_US']
        : ['Daniel', 'Google UK English', 'Microsoft George', 'en-GB', 'en_GB'];
    
    // Tìm giọng ưu tiên
    for (const preferred of preferredVoices) {
        const found = voices.find(v => 
            v.name.includes(preferred) || v.lang.includes(preferred)
        );
        if (found) return found;
    }
    
    // Fallback: tìm bất kỳ giọng tiếng Anh nào
    const langPrefix = lang.split('-')[0];
    return voices.find(v => v.lang.startsWith(langPrefix)) || voices[0];
}

function speak(word, lang) {
    if (!('speechSynthesis' in window)) {
        alert('Trình duyệt không hỗ trợ phát âm!');
        return;
    }
    
    // Hủy phát âm trước đó
    speechSynthesis.cancel();
    
    // Tạo utterance mới
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = lang;
    
    // Tìm giọng đọc phù hợp
    const voice = findBestVoice(lang);
    if (voice) {
        utterance.voice = voice;
    }
    
    // Điều chỉnh tham số cho iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isIOS || isSafari) {
        utterance.rate = 0.9;  // Tốc độ hơi chậm cho rõ ràng
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
    } else {
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
    }
    
    // Workaround cho iOS: cần delay nhỏ
    setTimeout(() => {
        speechSynthesis.speak(utterance);
    }, 10);
}

function clearResults() {
            document.getElementById('wordInput').value = '';
            document.getElementById('resultsSection').innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 6.5c2.76 0 5 2.24 5 5 0 .5-.08.97-.22 1.42l3.58 3.58c1.47-1.35 2.64-3.05 3.39-5-1.5-3.87-5.4-6.5-9.75-6.5-1.31 0-2.56.26-3.72.72l2.64 2.64c.45-.14.92-.22 1.42-.22z"/>
                        <path d="M2.71 3.16a.996.996 0 0 0 0 1.41l1.97 1.97A11.892 11.892 0 0 0 1.5 11.5c1.5 3.87 5.4 6.5 9.75 6.5 1.55 0 3.03-.32 4.38-.9l.88.88c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L4.13 3.16c-.39-.39-1.03-.39-1.42 0zM12 16.5c-2.76 0-5-2.24-5-5 0-.77.18-1.5.49-2.14l1.57 1.57c-.03.18-.06.37-.06.57 0 1.66 1.34 3 3 3 .2 0 .38-.03.57-.07L14.14 16c-.64.31-1.37.5-2.14.5z"/>
                    </svg>
                    <h3>Chưa có kết quả</h3>
                    <p>Nhập từ vựng bên trên và nhấn "Phân tích" để bắt đầu</p>
                </div>
            `;
        }