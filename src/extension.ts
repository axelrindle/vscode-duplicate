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

		const directory = dirname(fsPath)
		const newFile = Uri.file(join(directory, input))

		let overwrite = false
		try {
			const newStats = await workspace.fs.stat(newFile)
			console.log(newStats)
			if (newStats.type === FileType.File) {
				const answer = await window.showQuickPick(['Yes', 'No'], {
					title: 'A file with this name does already exist. Overwrite?',
					canPickMany: false,
					ignoreFocusOut: true,
				})
				if (answer === undefined) {
					return
				}

				overwrite = answer === 'Yes'
			}
		} catch (error) {
			
		}

		if (!overwrite) {
			return
		}

		try {
			await workspace.fs.writeFile(newFile, Buffer.from(''))
			await workspace.fs.copy(Uri.file(file), newFile, {
				overwrite: true
			})
		} catch (error) {
			console.error(error)
		}
	})

	context.subscriptions.push(disposable)
}

export function deactivate() {}
