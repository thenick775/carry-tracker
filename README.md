# Carry Tracker

<div>
  <a href="https://github.com/thenick775/carry-tracker/releases">
    <img alt="GitHub Release" src="https://img.shields.io/github/v/release/thenick775/carry-tracker">
  </a>
  <a href="https://github.com/thenick775/carry-tracker/actions">
    <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/thenick775/carry-tracker/build.yml">
  </a>
</div>

<br/>

_A web app that helps you track your every day carry (EDC)_

<img alt="Carry Tracker Mobile" src="./readme-images/carry-tracker-mobile_min.gif" width="360px">

---

![Carry Tracker Desktop](./readme-images/carry-tracker-desktop_min.gif)

Privacy first, no ads, free forever 🚀

[Try it live!](https://edc-tracker.com)

## Why I Made This

I built this every day **Carry Tracker** because I wanted something to log what I carry each day, showing me what's in my pocket regularly and what's not.

Like a lot of people, I got into collecting and rotating items like knives, pens, flashlights, and wallets. After awhile, I found myself forgetting what I’d carried or realizing certain items hadn’t seen any use in months.

This app helps solve that: it logs your carry history, visualizes rotations over time, and keeps your pockets organized!

## What It Does

- **Inventory Management**  
  Add items to your collection with images, timestamps, purchase info, and more.

- **Daily Carry Logging**  
  Select what you carried each day—quick and easy.

- **Rotation Awareness**  
  Visual timelines and summaries help you remember what’s in or out of rotation.

- **PWA Support**  
  Works offline, installable to your phone or desktop.

## Getting Started

Clone the repo and then run the following from the project root:

```bash
npm install && \
npm run dev
```

To run lint and tests:

```bash
npm run lint && \
npm run test
```

## Installing as a PWA

I recommend installing this app to your home screen as if it were native.

You'll get offline support, the app will be full screen, and your data will persist on your device for as long as the app is installed!

To install:

- Open in Chrome or Safari
- Choose “Add to Home Screen”
- Open the app using the icon tile

## Features

- [x] Reports
  - [x] Top items
  - [x] Most carried
  - [x] Cost breakdown
  - [x] Usage over time
- [x] Export/import backup
- [x] Tags and categories (custom fields)
- [x] Searching and filtering capabilities

## Inspired By

While building this app, I came across http://www.edctracker.com, which described many of the features I wanted.

At this time its not available, so I decided to build my own!
