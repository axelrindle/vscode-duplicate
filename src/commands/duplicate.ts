import { basename, dirname } from 'node:path'
import { FileSystemError, FileType, InputBoxValidationSeverity, Uri, window, workspace } from 'vscode'
import Config from '../config'
import l10n from '../l10n'

function getCopyName(original: string, isDirectory: boolean): [string, number] {
    const lastIndex = original.lastIndexOf('.')

    if (lastIndex === -1 || isDirectory) {
        const newName = original + '-copy'
        return [
            newName,
            newName.length,
        ]
    }

    let name = original.slice(0, lastIndex)
    let ext = original.slice(lastIndex + 1)

    if (lastIndex !== 0) {
        name += '-copy'
    }
    else {
        ext += '-copy'
    }

    let newName
    let newLength

    if (lastIndex === -1) {
        newName = name
        newLength = newName.length
    }
    else if (lastIndex === 0) {
        newName = '.' + ext
        newLength = newName.length
    } else {
        newName = name + '.' + ext
        newLength = name.length
    }

    return [
        newName,
        newLength,
    ]
}

const fileTypeMap: Record<FileType, string> = {
    [FileType.Directory]: 'directory',
    [FileType.File]: 'file',
    [FileType.SymbolicLink]: 'symlink',
    [FileType.Unknown]: 'file',
}

export default async function duplicate(arg: Uri | undefined, config: Config) {
    const fsPath = arg?.fsPath ?? window.activeTextEditor?.document.uri.fsPath
    if (!fsPath) {
        return
    }

    const oldFile = Uri.file(fsPath)
    const oldStats = await workspace.fs.stat(oldFile)

    const file = basename(fsPath)
    const isDirectory = oldStats.type == FileType.Directory
    const [copyName, copyNameLength] = getCopyName(file, isDirectory)

    const directory = Uri.file(dirname(fsPath))

    const input = await window.showInputBox({
        title: l10n.t(`title.duplicate.${isDirectory ? 'directory' : 'file'}`),
        value: copyName,
        valueSelection: [0, copyNameLength],
        async validateInput(value) {
            try {
                const stats = await workspace.fs.stat(Uri.joinPath(directory, value))
                return {
                    message: l10n.t('error.exists', {
                        type: l10n.t(`filetype.${fileTypeMap[stats.type]}`),
                        name: value,
                    }),
                    severity: isDirectory ? InputBoxValidationSeverity.Error : InputBoxValidationSeverity.Warning,
                }
            } catch (error) {
                if (!(error instanceof FileSystemError) || error.code !== 'FileNotFound') {
                    console.error(error)
                    return `${error}`
                }
            }
        },
    })

    if (input === undefined) {
        return
    }

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
                break
            default:
                window.showErrorMessage(l10n.t(`error.refuse-overwrite.${FileType[newStats.type].toLowerCase()}`))
                return
        }
    } catch (error) {
        if (!(error instanceof FileSystemError) || error.code !== 'FileNotFound') {
            console.error(error)
            return
        }
    }

    try {
        await workspace.fs.copy(oldFile, newFile, {
            overwrite: true,
        })

        if (config.get('openFile') && oldStats.type === FileType.File) {
            if (newFile.path.endsWith('.ipynb')) {
                const doc = await workspace.openNotebookDocument(newFile)
                await window.showNotebookDocument(doc)
            } else {
                const doc = await workspace.openTextDocument(newFile)
                await window.showTextDocument(doc)
            }
        }
    } catch (error) {
        console.error(error)
    }
}
