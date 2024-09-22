# @exaecut/create-adobe-plugin

Easily create Adobe Premire Pro/After Effects plugin in C++ using Adobe SDK.
You need to manually install the Adobe SDK. We are not allowed to distribute them, and unfortunately Adobe doesn't distribute them through github.

## Install bun

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

### MacOS & Linux

```powershell
curl -fsSL https://bun.sh/install | bash
```

## How to use

**Strictly use bun to use this package !**

```bash
bun create @exaecut/adobe-plugin
```

## Manual SDK download

1. Download Adobe SDKs. **A Creative Cloud account is required.**

    *After Effect :* <https://developer.adobe.com/after-effects/>

    *Premiere Pro :* <https://developer.adobe.com/premiere-pro/>

2. Extract SDK contents to the following folders.

    **Windows :**

    ```bash
    %appdata%/exaecut/adobe-sdks/aftereffects (for After Effect SDK)
    %appdata%/exaecut/adobe-sdks/premiere (for Premiere Pro SDK)
    ```

    **Mac OS :**

    ```bash
    /Library/Application Support/exaecut/adobe-sdks/aftereffects
    /Library/Application Support/exaecut/adobe-sdks/premiere
    ```

3. **You can now build your plugin !**
