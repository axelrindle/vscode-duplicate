import { basename, dirname, join } from 'path'
import { commands, ExtensionContext, FileType, Uri, window, workspace } from 'vscode'

export function activate(context: ExtensionContext) {
	let disposable = commands.registerCommand('duplicate-file.execute', async (uri: Uri) => {
		const { fsPath } = uri
		const file = basename(fsPath)
		const split = file.split('.', 2)
		const name = split[0]
		const ext = split.length === 2 ? '.' + split[1] : ''

		const input = await window.showInputBox({
			title: 'Enter a name for the duplicated file',
			value: `${name}-copy${ext}`,
			valueSelection: [0, name.length + 5]
		})

		if (input === undefined) {
			return
		}

		const directory = Uri.file(dirname(fsPath))
		const oldFile = Uri.file(fsPath)
		const oldStats = await workspace.fs.stat(oldFile)
		const newFile = Uri.joinPath(directory, input)

		try {
			const newStats = await workspace.fs.stat(newFile)
			if (oldStats.type !== newStats.type) {
				window.showErrorMessage('Can\'t change resource type!')
				return
			}

			switch (newStats.type) {
				case FileType.File:
					const answer = await window.showQuickPick(['Yes', 'No'], {
						title: 'A file with this name does already exist. Overwrite?',
						canPickMany: false,
						ignoreFocusOut: true,
					})
	
					if (answer !== 'Yes') {
						return
					}
					break;
				default:
					window.showErrorMessage('Refusing to overwrite existing ' + FileType[newStats.type])
					return
			}
		} catch (error) { }

		try {
			await workspace.fs.copy(oldFile, newFile, {
				overwrite: true
			})
		} catch (error) {
			console.error(error)
		}
	})

	context.subscriptions.push(disposable)
}

export function deactivate() {}
