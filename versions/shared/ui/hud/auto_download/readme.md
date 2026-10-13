# auto_download

Ours: once the worlds page's Enter moves the app on (`UIState.Login` or later), downloads in two runs of `startDownload` (the preloader's
Downloads tab): first the essentials (`isEssential`: interface, monsters, icons, login scene and
main towns, about 180 MB over the wire) behind the screen, then everything else (`chooseOnly`, cached
files skipped) behind the small panel, so every map, monster, icon
and sound comes from the cache worker afterwards. While it runs, a screen covers the login and the character select with the progress and an Enter
anyway button (with a note that the download goes on and resumes where it stopped); after that, a
small panel at the top centre, over the pages and the loading screen, shows the progress,
with Cancel and a close button (hides the panel, the download goes on). Once a full run finishes,
`mu_auto_download_build` in local storage holds the build id and later sessions of that build skip it;
a new build checks its files again (already cached ones are skipped). A dev server has no assets
index, so nothing happens there.

Not a HUD window (those only draw in the world): `src/app/App.tsx` mounts `AutoDownload` itself.

The MB shown are over the wire (the groups' `transfer`), scaled by the run's progress, which counts bytes on disk.
