# IAPL-1: Immutable Audio Publishing Layer — Specification

**Version:** 1.0.0
**Status:** Draft
**Authors:** FTH Trading
**Date:** 2024-2025
**License:** MIT
**Depends on:** LPS-1

---

## Abstract

IAPL-1 extends LPS-1 to support audio renderings of literary works.
It defines how audio files are hashed, organized into a Merkle tree,
and bound to an existing text edition, creating a verifiable link
between the written and spoken word.

---

## 1. Scope

IAPL-1 covers:

1. Audio file hashing and Merkle tree construction
2. Binding an audio rendering to an LPS-1 text edition
3. The `audioEditionRoot` computation
4. Verification of audio bindings
5. Metadata requirements for audio editions

IAPL-1 does NOT cover:

- Audio production or encoding standards
- Distribution or streaming
- Audio DRM or watermarking
- Text-to-speech generation policies

---

## 2. Terminology

| Term | Definition |
|------|-----------|
| **Audio Rendering** | A set of audio files representing the spoken version of an edition |
| **Audio Root** | The Merkle root of all audio file hashes |
| **Audio Edition Root** | The combined hash binding audio to text |
| **Text Edition** | The LPS-1 edition that the audio rendering is based on |

---

## 3. Audio File Requirements

### 3.1 Supported Formats

Audio files SHOULD be in a lossless or high-quality format:

- WAV (RECOMMENDED for archival)
- FLAC (RECOMMENDED for distribution)
- MP3 (320kbps minimum, acceptable)
- AAC (256kbps minimum, acceptable)

### 3.2 File Naming

Audio files MUST follow a naming convention that maps to the
manuscript ordering. RECOMMENDED format:

```
{chapter-number}-{chapter-slug}.{ext}
```

Example:
```
01-chapter-one.mp3
02-chapter-two.mp3
03-chapter-three.mp3
```

### 3.3 Ordering

Audio files MUST be ordered to correspond with the manuscript
file ordering in `order.json`. An `audio-order.json` manifest
SHOULD be provided:

```json
{
  "textEditionRoot": "abc123...",
  "audioFiles": [
    "01-chapter-one.mp3",
    "02-chapter-two.mp3",
    "03-chapter-three.mp3"
  ]
}
```

---

## 4. Audio Merkle Tree

### 4.1 Construction

The audio Merkle tree follows the same construction rules as LPS-1 §4:

1. Compute SHA-256 of each audio file (raw bytes, no normalization)
2. Build binary Merkle tree with ordered concatenation
3. Odd leaf: duplicate last node
4. Result: `audioRoot`

### 4.2 No CRLF Normalization

Audio files are binary. CRLF normalization MUST NOT be applied.
Files are hashed as raw byte streams.

---

## 5. Audio Edition Root

The audio edition root binds the audio rendering to the text edition:

```
audioEditionRoot = SHA-256(editionRoot + audioRoot)
```

Where:
- `editionRoot` is the LPS-1 edition root of the text edition
- `audioRoot` is the Merkle root of the audio files
- Concatenation is hex string concatenation

This creates a cryptographic binding: changing any audio file OR any
text file will invalidate the `audioEditionRoot`.

---

## 6. On-Chain Anchoring

### 6.1 Storage

A conforming contract SHOULD store, per audio binding:

- `audioRoot` (bytes32)
- `audioEditionRoot` (bytes32)
- Reference to the text edition (edition number or edition root)
- Timestamp
- Audio file count
- Audio format metadata (optional)

### 6.2 Binding

The audio binding SHOULD be anchored to the same contract that holds
the text edition, or to a linked contract that references it.

### 6.3 Immutability

Once an audio binding is anchored, it MUST NOT be modified. New audio
renderings (e.g., different narrator) SHOULD be anchored as separate
bindings.

---

## 7. Verification

### 7.1 Audio Verification

To verify an audio binding:

1. Hash each audio file with SHA-256
2. Build the audio Merkle tree
3. Verify `audioRoot` matches on-chain
4. Retrieve `editionRoot` from the text edition
5. Compute `SHA-256(editionRoot + audioRoot)`
6. Verify result matches `audioEditionRoot` on-chain

### 7.2 Cross-Verification

The text edition can be verified independently per LPS-1. The audio
binding is verified by confirming the `editionRoot` used in the
`audioEditionRoot` computation matches the on-chain text edition.

---

## 8. Metadata

Audio editions SHOULD include metadata in the manifest:

```json
{
  "audioMetadata": {
    "narrator": "Narrator Name",
    "duration": "3h 42m",
    "format": "mp3",
    "bitrate": "320kbps",
    "sampleRate": 44100,
    "channels": 2,
    "language": "en",
    "recordedAt": "2024-06-15"
  }
}
```

---

## 9. Security Considerations

### 9.1 File Size

Audio files are significantly larger than text files. Hashing large
files is computationally intensive but SHA-256 performance is well
understood. Implementations SHOULD stream large files rather than
loading entire files into memory.

### 9.2 Format Attacks

Malicious audio files could exploit parser vulnerabilities. The
protocol only hashes raw bytes and does not parse audio content.
This eliminates format-specific attack vectors at the protocol level.

### 9.3 Re-encoding

Re-encoding an audio file (e.g., converting WAV to MP3) will produce
a different hash. Each encoding is a distinct audio rendering and
SHOULD be anchored separately.

---

## Appendix A: Relationship to LPS-1

```
                    ┌──────────────────┐
                    │   order.json     │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ manuscriptRoot   │
                    │ artifactRoot     │──── editionRoot
                    │ imageRoot        │         │
                    │ promptRoot       │         │
                    └──────────────────┘         │
                                                │
                    ┌──────────────────┐         │
                    │ audio-order.json │         │
                    └────────┬─────────┘         │
                             │                   │
                    ┌────────▼─────────┐         │
                    │    audioRoot     │────┬─────┘
                    └──────────────────┘    │
                                           │
                                 ┌─────────▼──────────┐
                                 │ audioEditionRoot    │
                                 │ = H(eR + aR)       │
                                 └────────────────────┘
```

---

*End of IAPL-1 Specification.*
