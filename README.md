## Style Dictionary parser and transforms for DTCG design tokens

**⚠️⚠️⚠️ Proof of concept ⚠️⚠️⚠️**

This repo investigates making <abbr title="Design Tokens Community Group">[DTCG](https://www.designtokens.org/)</abbr> design tokens usable by [Style Dictionary](https://amzn.github.io/style-dictionary). The results are pretty good, but there are a few limitations.

- [Design Tokens Community Group](https://www.designtokens.org/)
- [Design Tokens Format Module 2nd Editor's Draft](https://second-editors-draft.tr.designtokens.org/format/)

## Sample 1

```text
1-explode-only/
├─ build/
├─ src/
│  ├─ parser.js
│  └─ transforms.js
├─ tokens/
└─ sd.config.js
```

```bash
npm run build:1
```

Notes:

- Tokens are not organized using CTI.
- `parser.js`
  <!-- prettier-ignore -->
  - Renames `$value` to `value`, and `$description` to `comment`.
  - For every composite token, its `$value` is split into new tokens. The original `$value` is discarded, changing the composite token into a group token.

    <details><summary>Example</summary>

    ```json
    // Before
    {
      "border": {
        "thin": {
          "$type": "border",
          "value": {
            "width": "1px",
            "color": "black"
          }
        }
      }
    }
    // After
    {
      "border": {
        "thin": {
          "$type": "border",
          "width": { "value": "1px", "$type": "dimension" },
          "color": { "value": "black", "$type": "color" },
        }
      }
    }
    ```

    </details>

- `sd.config.js`
  - Replaces transform `attrbute/cti` with `dtcg/attribute/cti`, which maps some DTCG types to Style Dictionary types. Doing so allows for the continued use of Style Dictionary's standard transforms.
  - Registers new _value_ transforms for DTCG types `cubicBezier` and `fontFamily`.

Limitations:

- Generates a lot of extra tokens.
- Composite tokens cannot be referenced by alias (because it was discarded).
- If a composite token has a `$description` or other custom properties, they will be inaccessible to transforms and formats.

### Sample 2

```text
1-explode-and-clone/
├─ build/
├─ src/
│  ├─ parser.js
│  └─ transforms.js
├─ tokens/
└─ sd.config.js
```

```bash
npm run build:2
```

Notes:

- This sample is essentially the same as sample 1, except...
- `parser.js`
  <!-- prettier-ignore -->
  - When a composite token is being processed, it is not discarded. Instead, a new version of the composite token is built, replacing its `$value` properties with aliases to the individual tokens.
    <details><summary>Example</summary>

    ```json
    // Before
    {
      "border": {
        "thin": {
          "$type": "border",
          "$description": "Thin border",
          "value": {
            "width": "1px",
            "color": "black"
          }
          "extra": "extra"
        }
      }
    }
    // After
    {
      "border": {
        "thin": {
          "width": { "value": "1px", "$type": "dimension" },
          "color": { "value": "black", "$type": "color" },
          "@": {
            "$type": "border",
            "comment": "Thin border",
            "value": {
              "width": { "value": "{border.thin.width}" },
              "color": { "value": "{border.thin.color}" }
            },
            "extra": "extra"
          }
        }
      }
    }
    ```

    </details>

- `sd.config.js`
  - Registers new transforms for each DTCG composite token type, `border`, `gradient`, `shadow`, `transition`, and `typography`.

Limitations:

- Same limitations as sample 1, as well as...
- Aliasing a composite token references the final transformed value, not the original `$value` object/array.
  - Note, this might actually be the correct behavior, and therefore, not a limitation. The spec is a little unclear.

## Improvements

- Per the spec, if `$type` is set on a group token, that `$type` should [apply to each of its children](https://tr.designtokens.org/format/#type-1). The parser does not currently implement that. It should be doable.
