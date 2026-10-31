# Otok znanja

React 19.3.0, React DOM 19.3.0, Vite 8.3.4, TypeScript 6.0.3,
React Router 7.18.4. Preverjeno z Node.js 20.20.2 in npm 10.9.9.
Zahtevan Node.js: `^20.19.0 || >=22.12.0` ter z njim združljiv npm.

## Struktura projekta

* Repozitorij vsebuje spletni vmesnik (frontend).
* Vsaka igra ima svoj repozitorij; izvožene igre so v `public/games/`.

## Zagon in preverjanje

Iz korenske mape repozitorija:

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
```

`npm run preview` odpre produkcijski build. Strežnik mora poti aplikacije
preusmeriti na `index.html` (React Router).

## Obseg

Otroci naj igrajo brez računa, prijavljeni učitelji pa pripravijo vsebino v
urejevalniku in jo delijo s kodo ali povezavo. JSON je dogovor med komponentami
projekta; učiteljem ga ni treba pisati.

Trenutna demonstracija uporablja `localStorage`: zbirke ostanejo v istem
brskalniku in izvoru, niso sinhronizirane ali zaščitene z računom. Prijava,
deljenje in beleženje rezultatov čakajo na dogovor ekipe. Urejevalnik vprašanj
že deluje; uvoz/izvoz in predogled sledita v ločenih korakih. Testi validacije
uporabljajo Vitest 4.1.11.

## Začetni JSON dogovor

```json
{
  "version": 1,
  "title": "Poštevanka števila 6",
  "subject": "matematika",
  "grade": 3,
  "settings": {
    "shuffleQuestions": true,
    "movingBalloons": true
  },
  "questions": [
    {
      "id": "q1",
      "text": "Koliko je 6 × 4?",
      "answers": [
        { "id": "a", "text": "18" },
        { "id": "b", "text": "24" },
        { "id": "c", "text": "30" }
      ],
      "correctAnswerId": "b",
      "hint": "Pomagaj si: 6 + 6 + 6 + 6."
    }
  ]
}
```

Razred je 1–9; vprašanje ima tri različne odgovore in en pravilen ID.
ID-ji ostajajo stabilni; lokalni ID zbirke se ne izvaža. Izvoz zahteva najmanj
eno vprašanje. Omejitve zaradi prostora: naslov 80, vprašanje 200, odgovor 40
in namig 200 znakov. Nova lokalna zbirka je lahko prazen osnutek.
