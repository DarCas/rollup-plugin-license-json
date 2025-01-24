/**
 * @author      Dario Casertano <dario@casertano.name>
 * @copyright   Copyright (c) 2024-present Casertano Dario – All rights reserved.
 * @license     MIT
 */

import type { Plugin } from 'rollup'
import rollupPluginLicense, {
    type Banner,
    type Dependency,
    type Person,
} from "rollup-plugin-license";

type FactoryFn<T> = () => T
type Factory<T> = T | FactoryFn<T>

/**
 * SPDX Licence Identifier.
 */
type SpdxId = string

/**
 * Function checking dependency license validity.
 */
type ThirdPartyDependencyValidatorFn = (dependency: Dependency) => boolean

type ThirdPartyValidator = SpdxId | ThirdPartyDependencyValidatorFn

interface ThirdPartyAllowOptions {
    /**
     * Fail if a dependency does not specify any licenses
     * @default false
     */
    failOnUnlicensed?: boolean

    /**
     * Fail if a dependency specify a license that does not match given requirement
     * @default false
     */
    failOnViolation?: boolean

    /**
     * Testing if the license if valid
     */
    test: ThirdPartyValidator
}

type LicensePluginJsonOptions = {
    /**
     * License banner to place at the top of your bundle
     */
    banner?: Factory<Banner>

    /**
     * Current Working Directory
     * @default process.cwd()
     */
    cwd?: string

    /**
     * Debug mode
     * @default false
     */
    debug?: boolean

    sourcemap?: boolean | string

    /**
     * For third party dependencies.
     * Creates a file containing a summary of all dependencies can be generated
     * automatically
     */
    thirdParty?: {
        /**
         * Ensures that dependencies does not violate any license restriction.
         *
         * For example, suppose you want to limit dependencies with MIT or Apache-2.0
         * licenses, simply define the restriction:
         *
         * @example
         *   {
         *     allow: '(MIT OR Apache-2.0)'
         *   }
         *
         *   allow(dependency) {
         *     return dependency.license === 'MIT';
         *   }
         */
        allow?: ThirdPartyValidator | ThirdPartyAllowOptions

        /**
         * If private dependencies should be checked (`private: true` in package.json)
         * @default false
         */
        includePrivate?: boolean

        /**
         * If "self" should be checked and included in the output.
         * In this context, "self" means the package being built.
         * @default false
         */
        includeSelf?: boolean

        /**
         * Track each dependency version as a different dependency.
         * Particularly useful when a dependency changed its licensing between versions.
         * Default is `false` far backward compatibility.
         */
        multipleVersions?: boolean
    }
}

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
 * @param [_options] - @see rollup-plugin-license
 * @returns {Plugin} - A Vite-compatible plugin instance.
 */
export default function LicensePluginJson(file: string, _options?: LicensePluginJsonOptions): Plugin {
    return rollupPluginLicense({
        banner: _options?.banner,
        cwd: _options?.cwd,
        debug: _options?.debug ?? false,
        sourcemap: _options?.sourcemap ?? false,
        thirdParty: {
            allow: _options?.thirdParty?.allow,
            includePrivate: _options?.thirdParty?.includePrivate,
            includeSelf: _options?.thirdParty?.includeSelf,
            multipleVersions: _options?.thirdParty?.multipleVersions,
            output: {
                encoding: 'utf-8',
                file,
                template(dependencies: Dependency[]) {
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
    })
}
