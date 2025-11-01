import { ExtensionContext, Uri, commands, env } from 'vscode'
import duplicate from './commands/duplicate'
import Config from './config'
import l10n from './l10n'

export const EXTENSION_ID = 'duplicate-file'

export async function activate(context: ExtensionContext) {
    const config = new Config(context)

    await l10n.init({
        extensionPath: context.extensionPath,
        language: env.language,
    })

    context.subscriptions.push(commands.registerCommand(
        `${EXTENSION_ID}.execute`,
        (uri?: Uri) => duplicate(uri, config)),
    )
}

export function deactivate() {}
