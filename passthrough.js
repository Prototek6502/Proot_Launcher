// passthrough.js
// If the current URL has a ?q= parameter, redirect to DuckDuckGo with its value.
// If ?q= is present but empty, do nothing.

(function() {
    // Get the query string from the URL
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    // Only redirect if ?q= is present and non-empty
    if (query && query.trim().length > 0) {
        // Encode the query for URL safety
        const encodedQuery = encodeURIComponent(query.trim());
        // Redirect to DuckDuckGo with the search query
        window.location.href = `https://duckduckgo.com/?q=${encodedQuery}`;
    }
    // If ?q= is not present or is empty, do nothing
})();