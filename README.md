# Flappy Bird (Python + Web)

A simple Flappy Bird clone with:
- A desktop version in Python (`tkinter`)
- A browser version for GitHub Pages (`HTML/CSS/JavaScript`)

## Run locally

### Requirements
- Python 3.10+ (or any Python version with `tkinter` available)

### Start the game
```powershell
python flappy_bird.py
```

## Play in browser

Open `index.html` locally, or deploy this repository to GitHub Pages.

### GitHub Pages setup
1. Push these files to your repository root:
	- `index.html`
	- `style.css`
	- `game.js`
2. In GitHub, go to **Settings -> Pages**.
3. Under **Build and deployment**, set:
	- **Source**: `Deploy from a branch`
	- **Branch**: `main` (or your branch), folder `/ (root)`
4. Save, then open the generated Pages URL.

## Controls
- `Space` or left mouse click: flap
- After game over: `Space` or click to restart

## Notes
- `flappy_bird.py` is still a desktop app and runs locally with Python.
- GitHub Pages runs the web version starting from `index.html`.
