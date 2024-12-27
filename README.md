# LicensePluginJson

![NPM Last Update](https://img.shields.io/npm/last-update/%40darcas%2Frollup-plugin-license-json)
![NPM Version](https://img.shields.io/npm/v/%40darcas%2Frollup-plugin-license-json)
![NPM Downloads](https://img.shields.io/npm/dw/%40darcas%2Frollup-plugin-license-json)
![NPM License](https://img.shields.io/npm/l/%40darcas%2Frollup-plugin-license-json)

`LicensePluginJson` is a Vite-compatible plugin that uses [rollup-plugin-license](https://github.com/mjeanroy/rollup-plugin-license) to generate a JSON file containing detailed information about third-party licenses in your project.

- [Installation](#installation)
- [Usage](#usage)
- [Output](#output)
- [Example](#example)
- [How to use](#how-to-use)
- [Based On](#based-on)
- [Contributing](#contributing)
- [License](#license)

## Installation

To use this plugin, install it via npm:

```bash
npm install @darcas/rollup-plugin-license-json
```

Or, if you're using yarn:

```bash
yarn add @darcas/rollup-plugin-license-json
```

## Usage

In your `vite.config.mts` just add:

```ts
import LicensePluginJson from '@darcas/rollup-plugin-license-json';
import { defineConfig } from 'vite'

export default defineConfig({
    //...
    plugins: [
        //...
        LicensePluginJson(join(__dirname, 'dist', 'licenses.json'), {
            debug: true,
            thirdParty: {
                includePrivate: true,
                multipleVersions: true,
            }
        }),
        //...
    ],
    //...
});
```

### Parameters

`LicensePluginJson` accepts 2 parameters:

- `file` *(string, required)*: The path where the JSON file will be generated.
- `options` *(object, optional)*: See the `rollup-plugin-license` plugin

> You can't override the `thirdParty.output` option.

## Output

The plugin generates a JSON file with the following structure for each dependency:

```ts
type LicensePluginJsonRecord = {
    readonly author: {
        readonly name: string
        readonly email: string | null
        readonly url: string | null
    } | null
    readonly description: string
    readonly homepage: string
    readonly license: string
    readonly licenseText: string
    readonly name: string
    readonly version: string
}
```

### Key Notes

- **`licenseText`**: If the license text is empty or unavailable, it will be omitted.
- **Formatting**: HTML tags are removed, and newlines are replaced with `<br>` tags to preserve readability.

## Example

Assuming your project contains the following dependencies:

- `axios`
- `lodash`

The generated JSON file might look like this:

```json
[
  {
    "name": "axios",
    "version": "0.21.4",
    "author": {
      "name": "Matt Zabriskie",
      "email": "matt@example.com"
    },
    "description": "Promise based HTTP client for the browser and node.js",
    "homepage": "https://axios-http.com/",
    "license": "MIT",
    "licenseText": "Permission is hereby granted, free of charge, to any person..."
  },
  {
    "name": "lodash",
    "version": "4.17.21",
    "author": {
      "name": "John-David Dalton",
      "email": "johndoe@example.com"
    },
    "description": "A modern JavaScript utility library delivering modularity, performance, and extras.",
    "homepage": "https://lodash.com/",
    "license": "MIT",
    "licenseText": "Permission is hereby granted, free of charge, to any person..."
  }
]
```

## How to use

```vue
<script lang="ts" setup>
import { type LicensePluginJsonRecord } from '@darcas/rollup-plugin-license-json';
import axios from "axios";
import orderBy from 'lodash/orderBy';

const licenses = ref<LicensePluginJsonRecord[]>([]);

onMounted(async () => {
    const response = await axios.get('/licenses.json', {
        headers: {
            Accept: 'application/json',
        },
    });

    if (response.status === 200) {
        licenses.value = orderBy(response.data, ['name'], ['asc']);
    }
});
</script>
```

## Based On

`LicensePluginJson` is built on top of [rollup-plugin-license](https://github.com/mjeanroy/rollup-plugin-license). It uses its core functionality to extract and format license information for third-party dependencies. Ensure that your project setup supports Rollup-compatible plugins, as Vite uses Rollup under the hood.

## Contributing

If you'd like to contribute to the project, feel free to fork it and create a pull request. Please ensure that your changes are well-tested and properly documented.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Dario Casertano (DarCas)](https://github.com/DarCas).
