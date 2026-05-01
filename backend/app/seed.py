"""Run once to seed heritage sites and an admin user into PostgreSQL."""
import sys
import os
import secrets
import string
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import SessionLocal, engine, Base
from app.models.heritage_site import HeritageSite
from app.models.user import User
from app.services.auth_service import hash_password

try:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: could not create tables: {e}")

# All image_urls are verified Wikimedia Commons direct links (CC-licensed).
SITES = [
    {
        "name": "Lalibela Rock-Hewn Churches",
        "description": "Eleven medieval monolithic churches carved from solid red volcanic rock, a UNESCO World Heritage site and living pilgrimage destination.",
        "history": "Built in the 12th-13th century under King Lalibela of the Zagwe dynasty as a symbolic New Jerusalem. Listed by UNESCO in 1978.",
        "location": "Lalibela, Amhara Region",
        "latitude": 12.0316,
        "longitude": 39.0472,
        "image_url": "https://www.image2url.com/r2/default/images/1776631558199-5b1c2760-ac98-4719-bfef-33394a68ed27.webp",
        "audio_url": "",
    },
    {
        "name": "Aksum (Axum)",
        "description": "Ancient city with monolithic obelisks, royal tombs, and ruins of the Axumite Empire, one of the greatest civilizations of the ancient world.",
        "history": "Capital of the Axumite Kingdom from the 1st to 13th century AD. A major trading empire and early center of Christianity. UNESCO listed in 1980.",
        "location": "Aksum, Tigray Region",
        "latitude": 14.1306,
        "longitude": 38.7183,
        "image_url": "https://www.image2url.com/r2/default/images/1776631450639-34685651-2c48-4f5f-a533-23b4411444a9.jpg",
        "audio_url": "",
    },
    {
        "name": "Fasil Ghebbi (Gondar Castles)",
        "description": "Royal enclosure containing palaces, castles, and churches of the Ethiopian imperial capital, the Camelot of Africa. UNESCO World Heritage site.",
        "history": "Founded in 1636 by Emperor Fasilides. Successive emperors added buildings blending Ethiopian, Portuguese, and Indian architectural styles. UNESCO listed in 1979.",
        "location": "Gondar, Amhara Region",
        "latitude": 12.6090,
        "longitude": 37.4676,
        "image_url": "https://www.image2url.com/r2/default/images/1776631244506-bab4e028-0465-4996-af3c-62d2097ebf95.webp",
        "audio_url": "",
    },
    {
        "name": "Simien Mountains National Park",
        "description": "Dramatic highland scenery with endemic wildlife including Gelada baboons, Walia ibex, and Ethiopian wolves. UNESCO World Heritage site.",
        "history": "Inhabited for thousands of years and used as a natural fortress. One of Ethiopia's first two UNESCO sites, listed in 1978.",
        "location": "Simien Mountains, Amhara Region",
        "latitude": 13.2333,
        "longitude": 38.0667,
        "image_url": "https://www.image2url.com/r2/default/images/1776631151150-bd2a6836-350a-40fa-bfeb-1f3d5bea094a.webp",
        "audio_url": "",
    },
    {
        "name": "Lower Valley of the Awash",
        "description": "Paleoanthropological site where Lucy (Australopithecus afarensis), one of the oldest known hominid remains, was discovered.",
        "history": "Hominid remains dating back at least 4 million years have been found here. The site is fundamental to understanding human evolution. UNESCO listed in 1980.",
        "location": "Afar Region",
        "latitude": 11.0167,
        "longitude": 40.9667,
        "image_url": "https://www.image2url.com/r2/default/images/1776631640213-2668ee8b-56e3-40db-a4c7-fe4eef6076bf.webp",
        "audio_url": "",
    },
    {
        "name": "Lower Valley of the Omo",
        "description": "Prehistoric site in southwest Ethiopia with unique hominid fossils that have contributed significantly to the study of human evolution.",
        "history": "Hominid remains with unique characteristics were discovered here. UNESCO listed in 1980 alongside the Awash Valley.",
        "location": "South Nations, Nationalities and Peoples Region",
        "latitude": 4.8000,
        "longitude": 35.9700,
        "image_url": "https://www.image2url.com/r2/default/images/1776630902185-5197f4e4-118c-496a-b142-9545fbe8dd9a.jpg",
        "audio_url": "",
    },
    {
        "name": "Tiya",
        "description": "Archaeological site containing 36 monuments including 32 carved stelae covered with symbols, believed to mark a large prehistoric burial complex.",
        "history": "The stelae date to the 12th-14th centuries. The site is part of a broader megalithic tradition in southern Ethiopia. UNESCO listed in 1980.",
        "location": "Soddo area, South Nations, Nationalities and Peoples Region",
        "latitude": 8.4333,
        "longitude": 38.6167,
        "image_url": "https://www.image2url.com/r2/default/images/1776630677404-a28283dd-3fe2-476b-831b-2480018e8cfe.jpg",
        "audio_url": "",
    },
    {
        "name": "Harar Jugol",
        "description": "The walled old city of Harar, the fourth holiest city of Islam, with over 80 mosques and unique Harari architecture. UNESCO World Heritage site.",
        "history": "Founded in the 10th century, the Jugol wall was built between the 13th and 16th centuries. A major Islamic cultural and trading hub. UNESCO listed in 2006.",
        "location": "Harar, Harari Region",
        "latitude": 9.3119,
        "longitude": 42.1199,
        "image_url": "https://www.image2url.com/r2/default/images/1776630729807-2cfb8c1e-dca9-4137-846d-9beaa82e6607.jpg",
        "audio_url": "",
    },
    {
        "name": "Konso Cultural Landscape",
        "description": "A 55 km2 living cultural landscape demonstrating an interwoven blend of dry-stone terracing, walled towns, and unique Konso traditions.",
        "history": "The Konso people have maintained this landscape for over 400 years. Features waga wooden memorial statues and elaborate terraced agriculture. UNESCO listed in 2011.",
        "location": "Konso, South Nations, Nationalities and Peoples Region",
        "latitude": 5.2500,
        "longitude": 37.4833,
        "image_url": "https://www.image2url.com/r2/default/images/1776630512269-78b1c436-3da5-4553-ac3c-79ecb80311ce.webp",
        "audio_url": "",
    },
    {
        "name": "Melka Kunture and Balchit",
        "description": "Paleoanthropological and archaeological site on the upper Awash River with one of the richest concentrations of prehistoric remains in Africa.",
        "history": "Stone tools and hominid fossils spanning 1.7 million years have been found at Melka Kunture. Balchit features a remarkable medieval stele. UNESCO listed in 2024.",
        "location": "Upper Awash Valley, Oromia Region",
        "latitude": 8.6833,
        "longitude": 38.5167,
        "image_url": "http://10.76.104.25:8000/static/melka_kunture.webp",
        "audio_url": "",
    },
    {
        "name": "Jimma Aba Jiffar Palace",
        "description": "The Jimma Aba Jiffar Palace is a historic royal palace complex in Jimma, southwestern Ethiopia, built by King Abba Jiffar II of the Jimma Kingdom in the late 19th century. One of the best-preserved examples of traditional Ethiopian palace architecture in the region.",
        "history": "Built around 1890 by King Abba Jiffar II (1878-1932), the last independent king of the Jimma Kingdom. The kingdom was known for its prosperous coffee trade and Oromo cultural heritage. After submitting to Emperor Menelik II in 1882, the kingdom retained autonomy until Abba Jiffar II's death in 1932.",
        "location": "Jimma, Oromia Region",
        "latitude": 7.6667,
        "longitude": 36.8333,
        "image_url": "https://www.image2url.com/r2/default/images/1776631047013-141c1106-da81-4003-b5b5-fad05ab86fb1.jpg",
        "audio_url": "",
    },
]

ADMIN = {
    "name": "Lucy Admin",
    "email": "admin@lucy.app",
    "role": "admin",
}


def seed():
    db = SessionLocal()
    try:
        for s in SITES:
            exists = db.query(HeritageSite).filter(HeritageSite.name == s["name"]).first()
            if not exists:
                db.add(HeritageSite(**s))
                print(f"  + Added site: {s['name']}")
            else:
                exists.image_url = s["image_url"]
                exists.description = s["description"]
                exists.history = s["history"]
                print(f"  ~ Updated: {s['name']}")

        admin = db.query(User).filter(User.email == ADMIN["email"]).first()
        fixed_password = "LucyAdmin2024"
        if not admin:
            db.add(User(
                name=ADMIN["name"],
                email=ADMIN["email"],
                password_hash=hash_password(fixed_password),
                role="admin",
                security_question="What is the name of this app?",
                security_answer_hash=hash_password("lucy"),
            ))
            print(f"  + Added admin: {ADMIN['email']}")
        else:
            admin.password_hash = hash_password(fixed_password)
            print(f"  ~ Updated admin password: {ADMIN['email']}")
        print(f"  *** ADMIN PASSWORD: {fixed_password} ***")

        # Create or update Solomon Tesfaye user
        solomon_email = "solomon@lucy.app"
        solomon = db.query(User).filter(User.email == solomon_email).first()
        solomon_password = "00000000"
        if not solomon:
            db.add(User(
                name="Solomon Tesfaye",
                email=solomon_email,
                password_hash=hash_password(solomon_password),
                role="user",
                security_question="The name of Our App?",
                security_answer_hash=hash_password("Lucy"),
            ))
            print(f"  + Added user: {solomon_email}")
        else:
            solomon.password_hash = hash_password(solomon_password)
            solomon.security_question = "The name of Our App?"
            solomon.security_answer_hash = hash_password("Lucy")
            print(f"  ~ Updated user: {solomon_email}")
        print(f"  *** SOLOMON PASSWORD: {solomon_password} ***")

        db.commit()
        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
