# MRI Made Easy — MRT okuw studiýasy

MRI Made Easy is a static learning studio for MRI lessons, interactive demonstrations, a Turkmen glossary, bookmarks, and learning progress.

## Languages

The interface supports Turkmen, Russian, and English. Detailed educational explanations and captions are provided in Turkmen.

## Install as a PWA

The same progressive web app runs on Android and Windows:

- On Android, open the site in Chrome and choose **Install app** or **Add to Home screen**.
- On Windows, open it in Chrome or Edge and choose **Install app**. The in-page install button is also available in supported browsers.

The web manifest and service worker cache the app shell and its icons for offline launch after the first successful visit. SWF playback uses Ruffle from its CDN and needs an internet connection; the interactive simulator remains available as an alternative.

## GitHub Pages

The app is served from `mri-made-easy/` so it does not replace the repository's root DICOM portal:

`/maksat_workspace_git_ready/mri-made-easy/`

The player no longer imports local ZIP, folder, or video files.
