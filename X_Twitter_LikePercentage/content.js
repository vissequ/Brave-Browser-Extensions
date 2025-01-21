// Variable to track the toggle state
let scriptEnabled = true;

// Listen for messages from the background or popup script
chrome.runtime.onMessage.addListener((message) => {
    if (message.hasOwnProperty("enabled")) {
        scriptEnabled = message.enabled;

        if (!scriptEnabled) {
            // Remove all custom modifications if disabled
            document.querySelectorAll(".custom-like-rate, .custom-follow-link").forEach((el) => el.remove());
            console.log("Plugin disabled: All modifications removed.");
        } else {
            // Re-run the script if enabled
            console.log("Plugin enabled: Modifications will now apply.");
            updateTweetLikeRates();
        }
    }
});

// Function to parse numbers from formatted strings
function parseNumber(text) {
    if (!text) return 0;
    text = text.toLowerCase();
    if (text.includes("k")) return parseFloat(text) * 1e3; // Handle 'k' for thousands
    if (text.includes("m")) return parseFloat(text) * 1e6; // Handle 'm' for millions
    return parseFloat(text.replace(/[^\d.]/g, "")) || 0; // Default parsing
}

// Function to calculate the appropriate color based on the like rate
function getLikeRateColor(likeRate) {
    if (likeRate >= 10) return "gold"; // 10% and up -> gold
    if (likeRate >= 6 && likeRate <= 9) return "green"; // Between 6% and 9% -> green
    if (likeRate >= 2 && likeRate <= 5) return "blue"; // Between 2% and 5% -> blue
    return "grey"; // Below 2% -> grey
}

// Function to safely modify tweets without interfering with rendering
function updateTweetLikeRates() {
    if (!scriptEnabled) return; // Exit if the script is disabled

    const tweets = document.querySelectorAll('[data-testid="tweet"]');

    tweets.forEach((tweet) => {
        try {
            // Find views and likes
            const viewsElement = Array.from(tweet.querySelectorAll("span")).find((span) =>
                span.textContent.toLowerCase().includes("views")
            );
            const heartsElement = tweet.querySelector('[data-testid="like"] span');

            if (viewsElement && heartsElement) {
                const viewsText = viewsElement.textContent.split(" ")[0]; // Isolate number part
                const heartsText = heartsElement.textContent;

                const views = parseNumber(viewsText);
                const hearts = parseNumber(heartsText);

                const likeRate = views ? ((hearts / views) * 100).toFixed(1) : null;

                // Avoid duplicate modifications
                if (!viewsElement.querySelector(".custom-like-rate")) {
                    // Determine color based on like rate
                    const color = likeRate !== null ? getLikeRateColor(parseFloat(likeRate)) : "grey";

                    // Add like rate text
                    const likeRateSpan = document.createElement("span");
                    likeRateSpan.className = "custom-like-rate"; // Unique class
                    likeRateSpan.style.marginLeft = "5px";
                    likeRateSpan.style.color = color;
                    likeRateSpan.textContent = likeRate !== null ? `(${likeRate}% Liked)` : "(N/A)";
                    viewsElement.appendChild(likeRateSpan);
                }
            }
        } catch (error) {
            console.error("Error processing tweet:", error);
        }
    });
}

// Observe DOM changes for dynamically loaded tweets
const observer = new MutationObserver(updateTweetLikeRates);
observer.observe(document.body, { childList: true, subtree: true });

// Initial execution
chrome.storage.local.get("enabled", (data) => {
    scriptEnabled = data.enabled ?? true; // Default to true
    if (scriptEnabled) {
        updateTweetLikeRates();
    }
});
