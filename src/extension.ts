import { ExtensionContext, Uri, commands } from 'vscode'
import duplicate from './commands/duplicate'
import Config from './config'

export const EXTENSION_ID = 'duplicate-file'

export async function activate(context: ExtensionContext) {
    const config = new Config(context)

    context.subscriptions.push(commands.registerCommand(
        `${EXTENSION_ID}.execute`,
        (uri?: Uri) => duplicate(uri, config)),
    )
}

export function deactivate() {}
