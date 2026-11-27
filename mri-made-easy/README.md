# MRI Made Easy — MRT Learning Studio

This self-contained static site contains the MRI Made Easy video player, interactive simulator, study modules, glossary, and progress tracking.

## Languages

The language selector supports Turkmen, Russian, and English for the main interface and lesson headings. This release keeps the detailed course explanations and video captions in Turkmen; the page states this when Russian or English is selected.

## Publish with GitHub Pages

The site is placed in `mri-made-easy/` so it does not replace the repository's existing DICOM portal at the root. With GitHub Pages enabled for the repository root, the expected path is:

`/maksat_workspace_git_ready/mri-made-easy/`

SWF playback uses the Ruffle WebAssembly player loaded from its CDN; MP4 and the interactive MRI simulator remain available as alternatives.
