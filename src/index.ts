/**
 * @author      Dario Casertano <dario@casertano.name>
 * @copyright   Copyright (c) 2024-present Casertano Dario – All rights reserved.
 * @license     MIT
 */

import type { Plugin } from 'rollup'
import PluginLicense, {
    type Dependency,
    type Options,
    type Person,
} from 'rollup-plugin-license'

export type LicensePluginJsonRecord = {
    readonly author: Person | null
    readonly description: string
    readonly homepage: string | null
    readonly license: string
    readonly licenseText: string
    readonly name: string
    readonly version: string
}

/**
 * Vite plugin to generate a JSON file with information about third-party licenses.
 *
 * @param file - The output file path for the JSON containing license details.
 * @param [options] - @see rollup-plugin-license
 * @returns {Plugin} - A Vite-compatible plugin instance.
 */
export default function LicensePluginJson(file: string, options?: Options): Plugin {
    const thirdParty = options?.thirdParty as ( Record<string, any> | undefined )

    const plo: Options = {
        banner: options?.banner,
        cwd: options?.cwd,
        debug: options?.debug ?? false,
        sourcemap: options?.sourcemap ?? false,
        thirdParty: {
            allow: thirdParty?.allow,
            includePrivate: thirdParty?.includePrivate,
            includeSelf: thirdParty?.includeSelf ?? true,
            multipleVersions: thirdParty?.multipleVersions,
            output: {
                encoding: 'utf-8',
                file,
                template: (dependencies: Dependency[]) => {
                    const licenses = dependencies.map(dependency => {
                        return {
                            author: dependency.author,
                            description: dependency.description,
                            homepage: dependency.homepage,
                            license: dependency.license,
                            licenseText: ( (licenseText: string | null): string | null => {
                                if (!licenseText || ( licenseText.trim() === '' )) {
                                    return null
                                }

                                licenseText = licenseText.replace(/<\/?[^>]+(>|$)/g, '')
                                licenseText = licenseText.replace(/\n{2}\s*/g, '<br><br>')
                                licenseText = licenseText.replace(/\n\s*/g, '<br>')
                                licenseText = licenseText.replace(/\s+/g, ' ')

                                return licenseText
                            } )(dependency.licenseText),
                            name: dependency.name,
                            version: dependency.version,
                        }
                    })

                    return JSON.stringify(
                        licenses.filter(({licenseText}) => !!licenseText),
                    )
                },
            },
        },
    }

    return PluginLicense(plo)
}
