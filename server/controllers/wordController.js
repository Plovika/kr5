let words = [
    { id: 1, word: "apple", translation: "яблоко" },
    { id: 2, word: "sun", translation: "солнце" },
    { id: 3, word: "water", translation: "вода" }
];

exports.getAll = (req, res) => {
    const limit = parseInt(req.query.limit) || words.length;
    const offset = parseInt(req.query.offset) || 0;
    const slice = words.slice(offset, offset + limit);
    res.json({ total: words.length, count: slice.length, data: slice });
};

exports.search = (req, res) => {
    const q = (req.query.word || "").toLowerCase().trim();
    if (!q) return res.json([]);
    const found = words.filter(
        (w) =>
            w.word.toLowerCase().includes(q) ||
            w.translation.toLowerCase().includes(q)
    );
    res.json(found);
};

exports.getById = (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    const item = words.find((w) => w.id === id);
    if (!item) return res.status(404).json({ message: "Слово не найдено" });
    res.json(item);
};

exports.addWord = (req, res) => {
    const { word, translation } = req.body;
    if (!word || !translation) {
        return res.status(400).json({ message: "Заполните поля word и translation" });
    }
    const newItem = {
        id: Date.now(),
        word: String(word).trim(),
        translation: String(translation).trim()
    };
    words.push(newItem);
    res.status(201).json(newItem);
};

exports.updateWord = (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    const idx = words.findIndex((w) => w.id === id);
    if (idx === -1) return res.status(404).json({ message: "Слово не найдено" });
    const { word, translation } = req.body;
    if (word) words[idx].word = String(word).trim();
    if (translation) words[idx].translation = String(translation).trim();
    res.json(words[idx]);
};

exports.deleteWord = (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    const idx = words.findIndex((w) => w.id === id);
    if (idx === -1) return res.status(404).json({ message: "Слово не найдено" });
    const removed = words.splice(idx, 1)[0];
    res.json({ removed });
};

exports.checkWord = (req, res) => {
    const { word, answer } = req.body;
    if (!word || typeof answer === "undefined") {
        return res.status(400).json({ message: "Нужно передать word и answer" });
    }
    const found = words.find((w) => w.word.toLowerCase() === String(word).toLowerCase());
    if (!found) {
        return res.status(404).json({ message: "Слово не найдено" });
    }
    const isCorrect = found.translation.toLowerCase() === String(answer).toLowerCase();
    res.json({ correct: isCorrect, expected: found.translation });
};
