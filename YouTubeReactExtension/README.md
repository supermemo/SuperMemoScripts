
# SuperMemo YouTube React Extension 

SuperMemo YouTube extract performance improvements and extensions.

## Description

Utilize a locally hosted service to remove remote requirements saving up to 500ms per card and utilize the react-player to extend the functionality of incremental video in SM-18.

## Getting Started

### Dependencies

* python2 or 3
* nodejs + npm installed
* SuperMemo 18
* Windows

### Installing

* Have you checked the files against the yt.htm in your install folder right? Otherwise someone could track what YT vids you're watching.

* Open the server folder in Terminal

* [not neccessary, binaries already provided] Install the react player.

```
npm install react-player # or yarn add react-player
```

* Start the server to host resources. Uses port 8000 by default.
```
python -m SimpleHTTPServer

python3 -m http.server

```

* backup YouTube.htm in your install SuperMemo/bin folder

* if above succeeds, replace YouTube.htm to your installs SuperMemo/bin folder with the one provided in this ZIP. Or simply replace:				
```
sBaseUrl = "http://localhost:8000/yt.htm?"
```

## Help

Not currently finished.

## Version History

* 0.1 WIP
    * Mark/Stop/Start buttons work
    * Loading YouTube videos
    * Loads SM scripts locally

## License

Inherits license in the root of the project.

## Acknowledgments

* [SuperMemo yt.htm](https://www.super-memory.com/)