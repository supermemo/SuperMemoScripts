
# SuperMemo YouTube React Extension 

SuperMemo YouTube extract performance improvements and extensions.

## Description

Utilize a locally hosted service to remove remote requirements saving up to 500ms per card and utilize the react-player to extend the functionality of incremental video in SM-18. I now consider this a beta and usable, it wdn't overwrite your cards under expected operation. 

## Getting Started

### Dependencies

* python2 or 3
* SuperMemo 18
* Windows

### Installing

* Have you checked the files against the yt.htm in your install folder right? Otherwise someone could track what YT vids you're watching.

* Open the server folder in Terminal

* Start the server to host resources. Uses port 8000 by default.
```
python -m SimpleHTTPServer

python3 -m http.server

```

* backup YouTube.htm in your install SuperMemo/bin folder

* if above succeeds, replace YouTube.htm to your installs SuperMemo/bin folder with the one provided in this ZIP

## Help

### One of my extract timestamps wiped!?

This can rarely happen if you hold ALT+LEFT or ALT+RIGHT and cycle theough many cards quickly. You may recover the times from the title of the card.

### The Player is too small, out of place, etc..

Adjust top, left, width and height in sep_embed to adjust screen placement.

## Version History

* 0.1
    * Mark/Stop/Start buttons work
    * Loading YouTube videos
    * Loads SM scripts locally
* 0.2
    * Nonblocking player and hotkeys
    * Playback speed slider
* 0.3 BETA
    * Load external IE window with YT player
    * Changes reflect back to SM
    * Extracts and navigation work
### Roadmap
* Title extract verification for timing overwrite error
* Pleasing layout
* Window fullscreen
* Serverside:
    * Store playback speeds
    * File-YT proxy for lightning fast plays
* SupermemoAssistant plugin to re-use player and make a YouTube Jukebox
* Browser plugin and YouTube player integration

## License

Inherits license in the root of the project.

## Acknowledgments

* [SuperMemo yt.htm](https://www.super-memory.com/)