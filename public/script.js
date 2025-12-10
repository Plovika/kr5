
const $ = (id) => document.getElementById(id);

let currentWord = null;

// Получить список слов и отрисовать
async function fetchWords() {
    const res = await fetch("/api/words");
    const data = await res.json();
    const list = $("wordsList");
    list.innerHTML = "";

    data.data.forEach((w) => {
        const li = document.createElement("li");
        li.innerHTML = `
      <div>
        <strong>${escapeHtml(w.word)}</strong>
        <div class="meta">${escapeHtml(w.translation)} • id:${w.id}</div>
      </div>
      <div>
        <button data-id="${w.id}" class="get-btn">Get</button>
        <button data-id="${w.id}" class="del-btn">Del</button>
      </div>
    `;
        list.appendChild(li);
    });


    document.querySelectorAll(".del-btn").forEach(btn => {
        btn.onclick = async (e) => {
            const id = e.currentTarget.dataset.id;
            if (!confirm("Удалить слово id=" + id + "?")) return;
            await fetch("/api/words/" + id, { method: "DELETE" });
            fetchWords();
        };
    });
    document.querySelectorAll(".get-btn").forEach(btn => {
        btn.onclick = async (e) => {
            const id = e.currentTarget.dataset.id;
            const r = await fetch("/api/words/" + id);
            const data = await r.json();
            $("idResult").textContent = JSON.stringify(data, null, 2);
        };
    });
}

// Получить случайное слово
$("new-word-btn").onclick = async () => {
    const res = await fetch("/api/words");
    const data = await res.json();
    if (!data.data || data.data.length === 0) {
        $("word-box").innerText = "—";
        return;
    }
    currentWord = data.data[Math.floor(Math.random() * data.data.length)];
    $("word-box").innerText = currentWord.word;
    $("result").innerText = "";
};

// Проверка перевода
$("check-btn").onclick = async () => {
    if (!currentWord) {
        $("result").innerText = "Сначала нажмите 'Показать случайное слово'";
        return;
    }
    const answer = $("answer").value.trim();
    const res = await fetch("/api/words/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: currentWord.word, answer })
    });
    const data = await res.json();
    if (res.ok) {
        $("result").innerText = data.correct ? "Верно! " : `Неправильно (ожидалось: ${data.expected})`;
    } else {
        $("result").innerText = data.message || "Ошибка";
    }
};

// Добавление слова
$("add-btn").onclick = async () => {
    const word = $("newWord").value.trim();
    const translation = $("newTranslation").value.trim();
    if (!word || !translation) {
        $("add-result").innerText = "Заполните оба поля";
        return;
    }
    const res = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, translation })
    });
    if (res.ok) {
        $("add-result").innerText = "Добавлено";
        $("newWord").value = "";
        $("newTranslation").value = "";
        fetchWords();
    } else {
        const d = await res.json();
        $("add-result").innerText = d.message || "Ошибка";
    }
};


$("searchBtn").onclick = async () => {
    const q = $("searchQuery").value.trim();
    if (!q) return fetchWords();
    const res = await fetch("/api/words/search?word=" + encodeURIComponent(q));
    const data = await res.json();
    const list = $("wordsList");
    list.innerHTML = "";
    data.forEach(w => {
        const li = document.createElement("li");
        li.innerHTML = `<div><strong>${escapeHtml(w.word)}</strong><div class="meta">${escapeHtml(w.translation)} • id:${w.id}</div></div>`;
        list.appendChild(li);
    });
};

$("refreshBtn").onclick = fetchWords;

$("getByIdBtn").onclick = async () => {
    const id = $("idInput").value.trim();
    if (!id) { $("idResult").textContent = "Введите id"; return; }
    const res = await fetch("/api/words/" + id);
    const data = await res.json();
    if (res.ok) $("idResult").textContent = JSON.stringify(data, null, 2);
    else $("idResult").textContent = (data.message || "Ошибка");
};

$("updateBtn").onclick = async () => {
    const id = $("idInput").value.trim();
    if (!id) { $("idResult").textContent = "Введите id"; return; }
    const body = {};
    if ($("updateWord").value.trim()) body.word = $("updateWord").value.trim();
    if ($("updateTranslation").value.trim()) body.translation = $("updateTranslation").value.trim();
    if (Object.keys(body).length === 0) { $("idResult").textContent = "Нет данных для обновления"; return; }

    const res = await fetch("/api/words/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
        $("idResult").textContent = "Обновлено: " + JSON.stringify(data, null, 2);
        fetchWords();
    } else {
        $("idResult").textContent = data.message || "Ошибка";
    }
};

$("deleteBtn").onclick = async () => {
    const id = $("idInput").value.trim();
    if (!id) { $("idResult").textContent = "Введите id"; return; }
    if (!confirm("Удалить слово id=" + id + "?")) return;
    const res = await fetch("/api/words/" + id, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
        $("idResult").textContent = "Удалено: " + JSON.stringify(data.removed, null, 2);
        fetchWords();
    } else {
        $("idResult").textContent = data.message || "Ошибка";
    }
};

function escapeHtml(s) {
    if (!s) return "";
    return s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

fetchWords();
