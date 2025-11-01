/*
 * From https://github.com/lokalise/i18n-ally/blob/4c504c93cec6c4697134eca379f1476d0eb1c9f6/src/i18n.ts
 * LICENSE: https://github.com/lokalise/i18n-ally/blob/4c504c93cec6c4697134eca379f1476d0eb1c9f6/LICENSE
 *
 * Slight modifications were made to support named parameters
 */

import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

function exists(path: string): Promise<boolean> {
    return stat(path)
        .then(() => true)
        .catch(() => false)
}

type Options = {
    language: string
    extensionPath: string
}

export default class l10n {
    static messages: Record<string, string> = {}

    static async init({ extensionPath, language }: Options) {
        const pkgJson = await readFile(path.join(extensionPath, 'package.json'), 'utf-8')
        const pkg = JSON.parse(pkgJson)

        let name = `bundle.l10n.${language}.json`
        if (!await exists(path.join(extensionPath, pkg.l10n, name)))
            name = 'bundle.l10n.en.json' // locale not exist, fallback to English

        this.messages = JSON.parse(await readFile(path.join(extensionPath, pkg.l10n, name), 'utf-8'))
    }

    static format(str: string, ...args: any[]): string {
        return str.replace(/{([\d]+|[a-zA-Z0-9]+)}/g, (whole, match) => {
            let result = ''

            const number = parseInt(match)
            if (isNaN(number)) {
                result = args.at(0)[match] || whole
            } else {
                result = args.at(number) || whole
            }

            return result
        })
    }

    static t(key: string, ...args: any[]): string {
        let text = this.messages[key] || ''

        if (args && args.length)
            text = this.format(text, ...args)

        return text
    }
}
