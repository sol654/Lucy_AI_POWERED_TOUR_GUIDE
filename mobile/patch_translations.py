import re

with open("src/translations.ts", "r") as f:
    content = f.read()

new_keys = """
    // Navigation & Tabs
    home: 'Home',
    map: 'Map',
    voice: 'Voice',
    favorites: 'Favorites',
    journeys: 'Journeys',

    // Home Screen
    searchSites: 'Search heritage sites...',
    noSitesFound: 'No sites found.',
    serverError: 'Could not reach the server.',
    retry: 'Retry',

    // Favorites Screen
    savedSites: 'Saved Sites',
    noFavorites: 'No favorites yet. Explore sites and save them!',
    unknownSite: 'Unknown Site',

    // Journeys Screen
    myJourneys: 'My Journeys',
    noJourneysYet: 'No journeys yet',
    createJourneyHint: 'Tap + to create your first itinerary, then add sites from any site detail page.',
    deleteJourneyPrompt: 'This will remove the journey and all its sites.',
    newJourney: 'New Journey',
    eGJourney: 'e.g. Northern Ethiopia Tour',
    createJourney: 'Create Journey',
"""

# We'll just insert new_keys before the first `}` of each language block.
languages = ["en", "am", "ti", "or"]

for lang in languages:
    # Find the start of the block
    start_match = re.search(r"^\s*" + lang + r":\s*\{", content, re.MULTILINE)
    if start_match:
        start_idx = start_match.end()
        # Find the end of this block
        # count braces to find the matching closing brace
        brace_count = 1
        i = start_idx
        while i < len(content) and brace_count > 0:
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
            i += 1
        
        end_idx = i - 1
        
        # Insert before end_idx
        content = content[:end_idx] + new_keys + content[end_idx:]

with open("src/translations.ts", "w") as f:
    f.write(content)

print("Translations updated!")
