import { stat } from 'fs/promises';
import { basename, dirname } from 'path';
import { FileType, Uri, l10n, window, workspace } from 'vscode';

function getCopyName(original: string, isDirectory: boolean): [string, number] {
    const lastIndex = original.lastIndexOf('.');

    if (lastIndex === -1 || isDirectory) {
        const newName = original + '-copy';
        return [
            newName,
            newName.length,
        ]
    }

	let name = original.slice(0, lastIndex);
	let ext = original.slice(lastIndex + 1);

	if (lastIndex !== 0) {
		name += '-copy'
	}
	else {
		ext += '-copy'
	}

	let newName;
	let newLength;

	if (lastIndex === -1) {
		newName = name;
		newLength = newName.length;
	}
	else if (lastIndex === 0) {
		newName = '.' + ext;
		newLength = newName.length;
	} else {
		newName = name + '.' + ext;
		newLength = name.length;
	}

	return [
		newName,
		newLength
	]
}

export default async function duplicate(uri: Uri) {
    const { fsPath } = uri
    const file = basename(fsPath)
    const stats = await stat(fsPath)
    const isDirectory = stats.isDirectory()
    const [copyName, copyNameLength] = getCopyName(file, isDirectory)

    const input = await window.showInputBox({
        title: l10n.t(`title.duplicate.${isDirectory ? 'directory' : 'file'}`),
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
            window.showErrorMessage(l10n.t('error.type-change'))
            return
        }

        switch (newStats.type) {
            case FileType.File:
                const answer = await window.showQuickPick([
                    l10n.t('action.yes'),
                    l10n.t('action.no'),
                ], {
                    title: l10n.t(`title.overwrite.${isDirectory ? 'directory' : 'file'}`),
                    canPickMany: false,
                    ignoreFocusOut: true,
                })

                if (answer !== l10n.t('action.yes')) {
                    return
                }
                break;
            default:
                window.showErrorMessage(l10n.t(`error.refuse-overwrite.${FileType[newStats.type].toLowerCase()}`))
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
}
