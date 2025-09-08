# URL Shortener

Hey! This is my URL shortener project that I built for my assignment. It's a React app that lets you create short links and track how many people click on them.

## What it does

So basically, you paste in a really long URL and it gives you back a short one. Pretty simple right? But there's more to it:

- You can make your own custom short codes if you want (like "mylink" instead of some random letters)
- Links expire after 30 minutes by default, but you can change that
- There's a stats page where you can see all your links and how many clicks they got
- Everything works in the browser - no backend needed
- Has proper error handling so it won't break if you do something wrong

## How to run it

First time setup:
```bash
npm install
```

Then every time you want to use it:
```bash
npm start
```

It'll open up at http://localhost:3000

## How I built it

I used React because that's what the assignment asked for. The main parts are:

**URL Shortener page** - This is where you create the short links. Just paste your long URL, maybe add a custom code if you want, set how long it should last, and boom - you get a short link.

**Statistics page** - Shows all the links you've made. You can see when you made them, when they expire, and how many people clicked on them. Pretty neat for tracking stuff.

**The redirect thing** - When someone clicks your short link, it automatically sends them to the real URL. If the link is expired or doesn't exist, it shows a nice error message instead of just breaking.

## File structure

```
src/
├── components/           # All the React components
├── middleware/          # The logging system they required
├── services/           # Logic for managing URLs
├── App.js             # Main app setup
└── index.js          # Entry point
```
