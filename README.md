# BankTulang

BankTulang is an educational static website that promotes bone-health awareness through interactive learning, habit tracking, and campaign content.

## Overview

The project presents a public health campaign experience around the idea of "saving bone health". It combines a landing page, educational assets, a knowledge quiz, habit trackers, badges, and a readiness simulator.

## Key Features

- Responsive public landing page for a bone-health awareness campaign.
- Adapted OKAT-style knowledge quiz with score categories.
- Calcium intake tracker.
- Physical activity tracker.
- Weekly goals, badges, and coin-style gamification.
- Campus challenge section for campaign participation.
- Education center with booklet, infographic, poster, and audio assets.
- Bone-health readiness simulator using knowledge, calcium, and activity inputs.
- GitHub Pages-friendly static deployment.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Static assets: images, PDF, and MP3
- Deployment target: GitHub Pages or any static host

## Project Structure

```text
index.html                         Main website
assets/media/ebooklet-modul.pdf    Educational booklet
assets/media/lagu-bank-tulang.mp3  Campaign audio
assets/media/poster-acara.png      Campaign poster
assets/media/infografis-*.jpg      Educational infographic
```

## Getting Started

No build step is required. Open `index.html` directly in a browser or serve the folder using a static server.

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Deployment

This project can be deployed to GitHub Pages by enabling Pages for the repository and serving from the default branch root.

## Health Disclaimer

This website is for educational and campaign purposes only. It is not a diagnostic tool and should not replace professional medical advice.

## Suggested Improvements

- Persist quiz and tracker history in local storage.
- Add accessibility checks for contrast, keyboard navigation, and screen-reader labels.
- Separate quiz data into a structured JSON file.
- Add analytics only with privacy-conscious consent.

## Status

Static educational campaign project.
