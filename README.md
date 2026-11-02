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
  "id": "…",
  "name": "Poštevanka števila 6",
  "subject": "matematika",
  "description": "",
  "questions": [
    {
      "question": "Koliko je 6 × 4?",
      "possibleAnswers": ["18", "24", "30"],
      "answer": "24"
    }
  ]
}
```

Vsako vprašanje ima od 3 do 5 različnih odgovorov; `answer` mora biti eden od
`possibleAnswers`. Izvoz zahteva najmanj eno vprašanje. Omejitve zaradi prostora:
ime 80, vprašanje 200 in odgovor 40 znakov. Nova lokalna zbirka je lahko prazen
osnutek.
