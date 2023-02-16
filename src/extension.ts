import { basename, dirname, join } from 'path'
import { commands, ExtensionContext, FileType, Uri, window, workspace } from 'vscode'

function getCopyName(original: string): [string, number] {
	const split = original.split('.', 2)
	const hasName = split[0].length > 0

	let name = split[0]
	let ext = split.length === 2 ? '.' + split[1] : ''

	if (hasName) {
		name += '-copy'
	}
	else {
		ext += '-copy'
	}

	return [
		name + ext,
		name.length
	]
}

export function activate(context: ExtensionContext) {
	let disposable = commands.registerCommand('duplicate-file.execute', async (uri: Uri) => {
		const { fsPath } = uri
		const file = basename(fsPath)
		const [copyName, copyNameLength] = getCopyName(file)

		const input = await window.showInputBox({
			title: 'Enter a name for the duplicated file',
			value: copyName,
			valueSelection: [0, copyNameLength]
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
