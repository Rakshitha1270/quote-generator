let currentQuote = {
    quote: "",
    author: ""
};

const quoteEl = document.getElementById("quote");
const authorEl = document.getElementById("author");
const messageEl = document.getElementById("message");
const historyList = document.getElementById("historyList");

async function loadQuote() {
    messageEl.textContent = "Loading...";
    try {
        const response = await fetch("/api/quote");
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        currentQuote = data;
        quoteEl.textContent = `"${data.quote}"`;
        authorEl.textContent = `— ${data.author}`;
        messageEl.textContent = "";
    } catch (error) {
        messageEl.textContent = "Could not load quote. Please try again.";
    }
}

async function saveFavorite() {
    if (!currentQuote.quote) {
        messageEl.textContent = "First generate a quote.";
        return;
    }

    const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(currentQuote)
    });

    const data = await response.json();
    messageEl.textContent = data.message || data.error;
    if (response.ok) loadFavorites();
}

async function loadFavorites() {
    const response = await fetch("/api/favorites");
    const favorites = await response.json();

    if (!favorites.length) {
        historyList.innerHTML = '<p class="empty">No favorite quotes yet.</p>';
        return;
    }

    historyList.innerHTML = favorites.map(item => `
        <div class="item">
            <div class="item-top">
                <div>
                    <div class="q">"${escapeHtml(item.quote)}"</div>
                    <div class="a">— ${escapeHtml(item.author)}</div>
                </div>
                <button class="delete" onclick="deleteFavorite(${item.id})">Delete</button>
            </div>
        </div>
    `).join("");
}

async function deleteFavorite(id) {
    await fetch(`/api/favorites/${id}`, {method: "DELETE"});
    loadFavorites();
}

async function copyQuote() {
    if (!currentQuote.quote) {
        messageEl.textContent = "First generate a quote.";
        return;
    }
    await navigator.clipboard.writeText(
        `"${currentQuote.quote}" — ${currentQuote.author}`
    );
    messageEl.textContent = "Quote copied!";
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

document.getElementById("newQuoteBtn").addEventListener("click", loadQuote);
document.getElementById("favoriteBtn").addEventListener("click", saveFavorite);
document.getElementById("copyBtn").addEventListener("click", copyQuote);
document.getElementById("refreshBtn").addEventListener("click", loadFavorites);

loadQuote();
loadFavorites();
