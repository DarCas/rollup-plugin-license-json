/**
 * @author      Dario Casertano <dario@casertano.name>
 * @copyright   Copyright (c) 2024 Casertano Dario – All rights reserved.
 * @license     MIT
 */

import type { Plugin } from 'rollup'
import type { Dependency, Person } from 'rollup-plugin-license'

const PluginLicense = require('rollup-plugin-license')

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
 * @param [includePrivate=false] - Whether to include private packages in the license output.
 * @param [multipleVersions=false] - Whether to allow multiple versions of the same dependency.
 * @returns {Plugin} - A Vite-compatible plugin instance.
 */
export default function LicensePluginJson(file: string, includePrivate = false, multipleVersions = false): Plugin {
    return PluginLicense({
        thirdParty: {
            includePrivate,
            includeSelf: true,
            multipleVersions,
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
                            licenseText: ((licenseText: string | null): string | null => {
                                if (!licenseText || (licenseText.trim() === '')) {
                                    return null
                                }

                                licenseText = licenseText.replace(/<\/?[^>]+(>|$)/g, '')
                                licenseText = licenseText.replace(/\n{2}\s*/g, '<br><br>')
                                licenseText = licenseText.replace(/\n\s*/g, '<br>')
                                licenseText = licenseText.replace(/\s+/g, ' ')

                                return licenseText
                            })(dependency.licenseText),
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
    })
}
