import { ExtensionContext, Uri, commands } from 'vscode'
import duplicate from './commands/duplicate'
import { checkExtensionVersion } from './commands/version-check'

export async function activate(context: ExtensionContext) {
    await checkExtensionVersion(context)

	context.subscriptions.push(commands.registerCommand(
        'duplicate-file.execute',
        (uri: Uri) => duplicate(uri))
    )
	context.subscriptions.push(commands.registerCommand(
        'duplicate-file.check-extension-version',
        () => checkExtensionVersion(context, true))
    )
}

export function deactivate() {}
