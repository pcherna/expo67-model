# Pilot sources

The source files are not committed. This file lists where each one came from, so the pilot can be rebuilt.

## Photos (Wikimedia Commons)

`photos/commons.json` lists each file with its URL, author and licence. Ten photos are used:
- Nine are by Laurent Bélanger, under CC BY-SA 3.0 or 4.0.
- One is by "The Webhamster" via Flickr, under CC BY-SA 2.0.

These photos may be redistributed with attribution under the same licence.

## Films (Internet Archive)

Each film was downloaded on 2026-11-20 from `https://archive.org/download/<id>/`.

| Id | Title | Rights stated on archive.org |
|---|---|---|
| `6327_Expo_67_01_00_31_28` | Expo 67 (Henry Charles Fleischer, 30 min) | none stated |
| `79664-this-was-expo-67` | This Was Expo '67 (Periscope Film) | none stated; Periscope sells licences |
| `59524CanadaHomeMoviesCFMos` | Montreal Expo '67 home movies (Periscope Film) | none stated |
| `cci202004050063` | Expo 67, Castle Films | none stated |
| `impressions-of-expo-67` | Impressions of Expo 67 (William Brind) | none stated |
| `1967-05-02_Expo_67` | Universal newsreel, 2 May 1967 | public domain |

Only the newsreel has a clear licence. Use the other films to measure from, not to redistribute frames or textures.

`../../docs/pilot/film-shots.json` lists every shot of the four pilot buildings found in these films, with times in seconds.

## Model

VGGT-1B (`facebook/VGGT-1B` on Hugging Face) is under CC BY-NC 4.0. The code is `facebookresearch/vggt` at commit a288dd0.
