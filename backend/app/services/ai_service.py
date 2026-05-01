import logging
import os
from groq import Groq

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY not set — AI responses will be unavailable.")

LANGUAGE_NAMES = {
    "en": "English",
    "am": "Amharic",
    "ti": "Tigrinya",
    "or": "Oromo (Afaan Oromoo)",
}

LANGUAGE_SCRIPTS = {
    "en": "Use the Latin alphabet.",
    "am": "Use the Ge'ez script for Amharic and do not transliterate into Latin characters.",
    "ti": "Use the Ge'ez script for Tigrinya and do not transliterate into Latin characters.",
    "or": "Use the Latin alphabet for Afaan Oromoo.",
}

LANGUAGE_EXAMPLES = {
    "en": "Example response structure: 'Lalibela is a UNESCO World Heritage Site located in northern Ethiopia...'",
    "am": "ምላሽ ሁሉንም በአማርኛ እንጂ በሌላ ቋንቋ አይስጥ። ለምሳሌ፦ 'ላሊበላ የኢትዮጵያ ሰሜን ክፍል ላይ የሆነ የዩኔስኮ የዓለም ቅርስ ቦታ ነው...'",
    "ti": "ምላሽ ሁሉንም ብትግርኛ እንጂ ብሌላ ቋንቋ ኣይህብ። ለምሳሌ፦ 'ላሊበላ ናይ ኢትዮጵያ ሰሜናዊ ክፍሊ የዩኔስኮ ዓለም ቅርሲ ቦታ እዩ...'",
    "or": "Deebii hunda Afaan Oromooti kennu, afaan biraa hin fayyadamu. Fakkeenyaaf: 'Lalibela iddoo dhaaltuu Itoophiyaa kaabaa, UNESCO World Heritage Site ta'uudha...'",
}

FOLLOWUPS = {
    "en": [
        "Would you like to explore its history?",
        "Shall I explain its architecture?",
        "Are you interested in its cultural significance?",
    ],
    "am": [
        "ታሪኩን ማወቅ ይፈልጋሉ?",
        "ሕንፃውን ላብራራልዎ?",
        "የባህላዊ ጠቀሜታውን ማወቅ ይፈልጋሉ?",
    ],
    "ti": [
        "ታሪኹ ክትፈልጥ ትደሊ?",
        "ህንጻኡ ከምዝርዝር?",
        "ባህላዊ ጠቕሙ ክትፈልጥ ትደሊ?",
    ],
    "or": [
        "Seenaa isaa baruu barbaaddaa?",
        "Ijaarsa isaa ibsuu?",
        "Gahee aadaa isaa baruu barbaaddaa?",
    ],
}


def generate_response(context: list, query: str, language: str = "en") -> str:
    if _client is None:
        return "AI service is not configured. Please set GROQ_API_KEY."

    logger.info(f"Generating response for query: '{query}' in language: {language}")

    lang_name = LANGUAGE_NAMES.get(language, "English")
    script_instruction = LANGUAGE_SCRIPTS.get(language, "Use the Latin alphabet.")
    example_instruction = LANGUAGE_EXAMPLES.get(language, LANGUAGE_EXAMPLES["en"])
    context_text = "\n\n".join(context)

    try:
        system_message = f"""You are ሉሲ, a professional AI tour guide specialising in Ethiopian heritage sites.
You ONLY answer questions about these specific sites: Lalibela Rock-Hewn Churches, Aksum (Axum), Fasil Ghebbi (Gondar Castles), Simien Mountains National Park, Lower Valley of the Awash, Lower Valley of the Omo, Tiya, Harar Jugol, Konso Cultural Landscape, Melka Kunture and Balchit, and Jimma Aba Jiffar Palace.

CRITICAL LANGUAGE REQUIREMENT: You MUST respond entirely in {lang_name}. {script_instruction}
Do NOT use ANY other language. Do NOT mix languages. Every single word must be in {lang_name} only.

{example_instruction}

If you cannot generate a proper response in {lang_name}, respond with a short message in {lang_name} saying the information is coming soon."""

        user_message = f"""Use the context below as your primary source, and supplement with your own accurate knowledge about these well-known Ethiopian heritage sites. Be factually correct and precise.

Context:
{context_text}

User Question: {query}

If the question is about one of the listed sites, give a comprehensive, factually accurate response covering ALL of these:
1. Introduction — what is this place and why it matters
2. Historical background — accurate dates, rulers, key events
3. Architecture or landscape — specific features, notable structures
4. Cultural & religious significance
5. Location — which region/city, nearest major city
6. How to get there — transport options, travel tips
7. Visitor information — best time to visit, practical tips

Aim for 400-500 words. Be accurate and specific.

If the user asks about ANY other place, person, or topic, respond ONLY with:
"I'm sorry, I don't have information about that place yet. 🚧 Coming soon!" """

        completion = _client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            max_tokens=800,
            temperature=0.7,
        )
        response = completion.choices[0].message.content.strip()
        logger.info(f"Generated response in {language}: {response[:100]}...")
        return response
    except Exception as e:
        logger.exception("Groq generation error: %s", e)
        error_msgs = {
            "en": "Sorry, I could not generate a response right now. Please try again.",
            "am": "ይቅርታ፣ አሁን ምላሽ ለመስጠት አልቻልኩም። እባክዎ እንደገና ይሞክሩ።",
            "ti": "ይቅርታ፣ ሕጂ ምላሽ ክህልወኒ ኣይከኣልኩን። ብኽብረት እንደገና ፈትን።",
            "or": "Dhiifama, amma deebii kennuu hin dandeenye. Maaloo irra deebi'aa.",
        }
        return error_msgs.get(language, error_msgs["en"])
