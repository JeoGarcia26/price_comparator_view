var HistoryService = (function () {

    const STORAGE_KEY = "priceCompareHistory";
    const MAX_ITEMS = 10;

    function getHistory() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    function saveHistory(historyArray) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(historyArray));
    }

    function addItem(term) {
        let history = getHistory();

        // Remove se já existir (evita duplicado)
        history = history.filter(item => item.toLowerCase() !== term.toLowerCase());

        // Adiciona no topo
        history.unshift(term);

        // Limita tamanho
        if (history.length > MAX_ITEMS) {
            history.pop();
        }

        saveHistory(history);
    }

    function clearHistory() {
        localStorage.removeItem(STORAGE_KEY);
    }

    return {
        getHistory,
        addItem,
        clearHistory
    };

})();