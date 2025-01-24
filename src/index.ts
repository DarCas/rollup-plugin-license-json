// noinspection JSUnusedGlobalSymbols

/**
 * @author      Dario Casertano <dario@casertano.name>
 * @copyright   Copyright (c) 2024 Casertano Dario – All rights reserved.
 * @license     MIT
 */

import merge from 'lodash.merge'
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
export default function LicensePluginJson(file: string, options?: Partial<Options>): Plugin {
    options = merge({}, {
        thirdParty: {
            includePrivate: false,
            includeSelf: true,
            multipleVersions: false,
        },
    }, options)

    options!.thirdParty = {
        ...options!.thirdParty,

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
    }

    return PluginLicense(options)
}
