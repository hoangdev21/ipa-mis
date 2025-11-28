// Hàm dịch sang tiếng Việt sử dụng MyMemory API
async function translateToVietnamese(text) {
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`);
        const data = await response.json();
        if (data.responseStatus === 200 && data.responseData?.translatedText) {
            return data.responseData.translatedText;
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
                
                // Lấy phiên âm IPA
                let phonetic = entry.phonetic || '';
                if (!phonetic && entry.phonetics && entry.phonetics.length > 0) {
                    phonetic = entry.phonetics.find(p => p.text)?.text || '';
                }
                
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
}        function speak(word, lang) {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(word);
                utterance.lang = lang;
                utterance.rate = 0.8;
                speechSynthesis.cancel();
                speechSynthesis.speak(utterance);
            } else {
                alert('Trình duyệt không hỗ trợ phát âm!');
            }
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