import concurrent.futures
from app.services.rag_service import retrieve
from app.services.ai_service import generate_response, FOLLOWUPS
from app.services.voice_service import text_to_speech_base64

KNOWN_SITES = [
    "lalibela", "lalibala", "lalibella", "lallibela",
    "aksum", "axum", "aksoom", "axoom",
    "fasil ghebbi", "fasil", "ghebbi",
    "gondar", "gondor", "gonder",
    "simien mountains", "semien mountains", "simien", "semien", "simen",
    "lower valley of the awash", "awash",
    "lower valley of the omo", "omo",
    "tiya", "tiyaa",
    "harar jugol", "harar", "harer", "harrar", "jugol",
    "konso",
    "melka kunture", "melka", "kunture", "balchit",
    "jimma", "aba jiffar", "abba jiffar", "jiffar", "jimma palace",
    "ላሊበላ", "አክሱም", "ፋሲል ግቢ", "ጎንደር", "ስሜን ተራሮች",
    "አዋሽ", "ኦሞ", "ቲያ", "ሐረር", "ሐረር ጁጎል", "ኮንሶ", "መልካ ቁንጡሬ",
    "ጅማ", "አባ ጅፋር", "ጅፋር",
    "ኣክሱም", "ስምዒን ተራሮ", "ኣዋሽ", "ሃረር", "ሃረር ጁጎል", "ሜልካ ቁንቱሬ",
    "aksuum", "fasil gebbi", "awaash", "jimmaa", "abba jifaar", "jifaar",
]

GREETINGS = [
    "hi", "hello", "hey", "good morning", "good afternoon", "good evening",
    "good night", "howdy", "greetings", "what's up", "sup",
    "ሰላም", "እንደምን", "ጤና", "ደህና", "እንዴት ነህ", "እንዴት ናችሁ",
    "ከመይ", "ከመይ ኣለኻ",
    "akkam", "nagaa", "nagaatti", "akkam bulte", "akkam oolte",
]

GREETING_RESPONSES = {
    "en": "Hello! I'm ሉሲ, your AI guide to Ethiopian heritage sites. How can I help you today? You can ask me about Lalibela, Aksum, Gondar, Simien Mountains, Harar, Tiya, Konso, Jimma Aba Jiffar, and more!",
    "am": "ሰላም! እኔ ሉሲ ነኝ፣ የኢትዮጵያ ቅርስ ቦታዎች AI መምሪያዎ። ዛሬ እንዴት ልረዳዎ? ላሊበላ፣ አክሱም፣ ጎንደር፣ ስሜን ተራሮች፣ ሐረር፣ ቲያ፣ ኮንሶ፣ ጅማ አባ ጅፋር እና ሌሎች ቦታዎች ይጠይቁኝ!",
    "ti": "ሰላም! ኣነ ሉሲ እየ፣ ናይ ኢትዮጵያ ቅርሲ ቦታታት AI መምርሒ። ሎሚ ብኸመይ ክሕግዘካ እኽእል? ላሊበላ፣ ኣክሱም፣ ጎንደር፣ ስምዒን ተራሮ፣ ሃረር፣ ቲያ፣ ኮንሶ ወይ ካልኦት ቦታታት ሕተተኒ!",
    "or": "Akkam! Ani ሉሲ, qajeelcha AI iddoowwan dhaalaa Itoophiyaa. Har'a akkamitti si gargaaruu danda'a? Lalibela, Aksum, Gondar, Simien Mountains, Harar, Tiya, Konso, Jimma Abba Jifaar, fi iddoowwan biroo waa'ee gaafadhu!",
}

HERITAGE_KEYWORDS = [
    "site", "place", "where", "what", "history", "heritage", "church", "castle",
    "mountain", "valley", "obelisk", "monument", "culture", "visit", "travel",
    "located", "found", "built", "ancient", "tell", "about", "describe",
    "ethiopia", "ethiopian", "pilgrimage", "rock", "hewn", "stelae", "fossil",
    "hominid", "park", "landscape", "walled", "city", "town", "palace",
    "የት", "ምን", "ታሪክ", "ቅርስ", "ቤተ", "ቤተክርስቲያን", "ቤተ መንግስት", "ጎብኝ",
    "ስለ", "ንገረኝ", "መቼ",
    "ኣበይ", "እንታይ", "ታሪኽ", "ቅርሲ", "ብዛዕባ", "ንገረኒ",
    "eessa", "maal", "seenaa", "dhaalaa", "waa'ee", "naaf himi", "eegale",
]

NOT_FOUND = {
    "en": "I'm sorry, that place isn't in my knowledge base yet. More sites coming soon! I currently have detailed guides for: Lalibela, Aksum, Gondar Castles, Simien Mountains, Harar Jugol, Tiya, Konso, Lower Valley of the Awash, Lower Valley of the Omo, Melka Kunture, and Jimma Aba Jiffar Palace.",
    "am": "ይቅርታ፣ ስለዚህ ቦታ አሁን ዝርዝር መረጃ የለኝም። ብዙ ቦታዎች በቅርቡ ይጨመራሉ! አሁን ዝርዝር መረጃ ያለኝ ቦታዎች፦ ላሊበላ፣ አክሱም፣ ጎንደር፣ ስሜን ተራሮች፣ ሐረር ጁጎል፣ ቲያ፣ ኮንሶ፣ አዋሽ ሸለቆ፣ ኦሞ ሸለቆ፣ መልካ ቁንጡሬ፣ እና ጅማ አባ ጅፋር ቤተ መንግስት።",
    "ti": "ይቅርታ፣ ብዛዕባ እዚ ቦታ ሕጂ ዝርዝር ሓበሬታ የብለይን። ብዙሕ ቦታታት ቀልጢፎም ይውሰኹ! ሕጂ ዝርዝር ሓበሬታ ዘለኒ፦ ላሊበላ፣ ኣክሱም፣ ጎንደር፣ ስምዒን ተራሮ፣ ሃረር ጁጎል፣ ቲያ፣ ኮንሶ፣ ኣዋሽ፣ ኦሞ፣ ሜልካ ቁንቱሬ፣ ጅማ ኣባ ጅፋር ቤተ መንግስቲ።",
    "or": "Dhiifama, iddoo sana waa'ee amma odeeffannoo gahaa hin qabu. Iddoowwan hedduun daran ni dabalamu! Amma odeeffannoo gahaa kan qabu: Lalibela, Aksum, Gondar, Simien Mountains, Harar Jugol, Tiya, Konso, Awash, Omo, Melka Kunture, fi Jimma Abba Jifaar.",
}

OFF_TOPIC = {
    "en": "That question isn't related to my purpose. I'm ሉሲ, your guide to Ethiopian heritage sites — ask me anything about Lalibela, Aksum, Gondar, Simien Mountains, Harar, Tiya, Konso, Jimma Aba Jiffar, or any of the other amazing sites in my collection!",
    "am": "ይህ ጥያቄ ከዓላማዬ ጋር አይዛመድም። እኔ ሉሲ ነኝ፣ የኢትዮጵያ ቅርስ ቦታዎች መምሪያዎ — ላሊበላ፣ አክሱም፣ ጎንደር፣ ስሜን ተራሮች፣ ሐረር፣ ቲያ፣ ኮንሶ፣ ጅማ አባ ጅፋር ወይም ሌሎች አስደናቂ ቦታዎች ማንኛውንም ጥያቄ ይጠይቁኝ!",
    "ti": "እዚ ሕቶ ምስ ዕላምኡ ኣይተኣሳሰርን። ኣነ ሉሲ እየ፣ ናይ ኢትዮጵያ ቅርሲ ቦታታት መምርሒኹም — ላሊበላ፣ ኣክሱም፣ ጎንደር፣ ስምዒን ተራሮ፣ ሃረር፣ ቲያ፣ ኮንሶ ወይ ካልኦት ቦታታት ዝኾነ ሕቶ ሕተቱኒ!",
    "or": "Gaaffiin kun kaayyoo kiyyaaf hin ta'u. Ani ሉሲ, qajeelcha iddoowwan dhaalaa Itoophiyaa — Lalibela, Aksum, Gondar, Simien Mountains, Harar, Tiya, Konso, Jimma Abba Jifaar, ykn iddoowwan biroo waa'ee gaafadhu!",
}

SITE_MAP = {
    "lalibela": "Lalibela Rock-Hewn Churches",
    "lalibala": "Lalibela Rock-Hewn Churches",
    "lalibella": "Lalibela Rock-Hewn Churches",
    "ላሊበላ": "Lalibela Rock-Hewn Churches",
    "aksum": "Aksum (Axum)",
    "axum": "Aksum (Axum)",
    "aksoom": "Aksum (Axum)",
    "አክሱም": "Aksum (Axum)",
    "ኣክሱም": "Aksum (Axum)",
    "gondar": "Fasil Ghebbi (Gondar Castles)",
    "gondor": "Fasil Ghebbi (Gondar Castles)",
    "fasil": "Fasil Ghebbi (Gondar Castles)",
    "ghebbi": "Fasil Ghebbi (Gondar Castles)",
    "ጎንደር": "Fasil Ghebbi (Gondar Castles)",
    "ፋሲል": "Fasil Ghebbi (Gondar Castles)",
    "simien": "Simien Mountains National Park",
    "semien": "Simien Mountains National Park",
    "simen": "Simien Mountains National Park",
    "ስሜን": "Simien Mountains National Park",
    "ስምዒን": "Simien Mountains National Park",
    "awash": "Lower Valley of the Awash",
    "አዋሽ": "Lower Valley of the Awash",
    "ኣዋሽ": "Lower Valley of the Awash",
    "omo": "Lower Valley of the Omo",
    "ኦሞ": "Lower Valley of the Omo",
    "tiya": "Tiya",
    "tiyaa": "Tiya",
    "ቲያ": "Tiya",
    "harar": "Harar Jugol",
    "harer": "Harar Jugol",
    "jugol": "Harar Jugol",
    "ሐረር": "Harar Jugol",
    "ሃረር": "Harar Jugol",
    "konso": "Konso Cultural Landscape",
    "ኮንሶ": "Konso Cultural Landscape",
    "melka": "Melka Kunture and Balchit",
    "kunture": "Melka Kunture and Balchit",
    "balchit": "Melka Kunture and Balchit",
    "መልካ": "Melka Kunture and Balchit",
    "ሜልካ": "Melka Kunture and Balchit",
    "jimma": "Jimma Aba Jiffar Palace",
    "jiffar": "Jimma Aba Jiffar Palace",
    "jifaar": "Jimma Aba Jiffar Palace",
    "ጅማ": "Jimma Aba Jiffar Palace",
    "አባ ጅፋር": "Jimma Aba Jiffar Palace",
}


def _detect_language(text: str):
    ethiopic = sum(1 for c in text if '\u1200' <= c <= '\u137F' or '\u1380' <= c <= '\u139F')
    latin = sum(1 for c in text if c.isascii() and c.isalpha())
    if ethiopic > 2:
        ti_markers = ["ኣበይ", "ኣለ", "ክትፈልጥ", "ትደሊ", "ብዛዕባ", "ሕተት", "ኣክሱም", "ኣዋሽ", "ሃረር", "ስምዒን"]
        return "ti" if any(m in text for m in ti_markers) else "am"
    if latin > 2:
        or_markers = ["eessa", "maal", "waa'ee", "naaf", "himi", "barbaadda", "jira",
                      "gaafadhu", "seenaa", "dhaalaa", "jimmaa", "jifaar", "danda'a",
                      "hin qabu", "daran", "iddoo", "odeeffannoo"]
        return "or" if any(m in text.lower() for m in or_markers) else "en"
    return None


def _is_greeting(query: str) -> bool:
    q = query.lower().strip()
    return any(q == g or q.startswith(g + " ") or q.startswith(g + ",") for g in GREETINGS)


def _is_known_site(query: str) -> bool:
    q = query.lower()
    if any(site in q or site in query for site in KNOWN_SITES):
        return True
    for word in q.split():
        if len(word) < 4:
            continue
        for site in KNOWN_SITES:
            if len(site) < 4 or ' ' in site:
                continue
            if len(word) >= 5 and len(site) >= 5 and word[:5] == site[:5]:
                return True
            if _fuzzy_match(word, site):
                return True
    return False


def _fuzzy_match(a: str, b: str) -> bool:
    if abs(len(a) - len(b)) > 1:
        return False
    if len(a) == len(b):
        return sum(c1 != c2 for c1, c2 in zip(a, b)) <= 1
    shorter, longer = (a, b) if len(a) < len(b) else (b, a)
    return any(longer[:i] + longer[i+1:] == shorter for i in range(len(longer)))


def _is_heritage_related(query: str) -> bool:
    q = query.lower()
    return any(kw in q or kw in query for kw in HERITAGE_KEYWORDS)


def _find_site_coords(query: str) -> dict:
    q = query.lower()
    canonical_name = None
    for keyword, name in SITE_MAP.items():
        if keyword.lower() in q or keyword in query:
            canonical_name = name
            break
    if not canonical_name:
        return {}
    try:
        from app.database import SessionLocal
        from app.models.heritage_site import HeritageSite
        db = SessionLocal()
        try:
            site = db.query(HeritageSite).filter(HeritageSite.name == canonical_name).first()
            if site and site.latitude and site.longitude:
                return {
                    "site_name": site.name,
                    "latitude": site.latitude,
                    "longitude": site.longitude,
                    "location": site.location or "",
                }
        finally:
            db.close()
    except Exception:
        pass
    return {}


def process_query(query: str, language: str = "en", include_audio: bool = True) -> dict:
    detected_lang = _detect_language(query) or language

    def _quick(msg: str) -> dict:
        return {
            "text": msg,
            "audio_base64": "",
            "images": [],
            "map_query": None,
            "site_coords": None,
            "suggested_followups": FOLLOWUPS.get(detected_lang, FOLLOWUPS["en"]),
        }

    # 0. Greeting
    if _is_greeting(query):
        return _quick(GREETING_RESPONSES.get(detected_lang, GREETING_RESPONSES["en"]))

    # 1. Off-topic
    if not _is_heritage_related(query) and not _is_known_site(query):
        return _quick(OFF_TOPIC.get(detected_lang, OFF_TOPIC["en"]))

    # 2. Heritage-related but unknown site
    if not _is_known_site(query):
        return _quick(NOT_FOUND.get(detected_lang, NOT_FOUND["en"]))

    # 3. Known site — full pipeline
    context = retrieve(query)
    answer = generate_response(context, query, language=language)

    audio_b64 = ""
    if include_audio and answer:
        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(text_to_speech_base64, answer, language)
                audio_b64 = future.result(timeout=25)
        except Exception:
            audio_b64 = ""

    coords = _find_site_coords(query)

    return {
        "text": answer,
        "audio_base64": audio_b64,
        "images": [],
        "map_query": query,
        "site_coords": coords if coords else None,
        "suggested_followups": FOLLOWUPS.get(language, FOLLOWUPS["en"]),
    }
