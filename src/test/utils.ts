import { expect } from 'chai'
import { DefaultTreeSection, InputBox } from 'vscode-extension-tester'

export async function triggerDuplicate(tree: DefaultTreeSection, filename: string): Promise<void> {
    const file = await tree.findItem(filename, 1)
    expect(file).not.undefined

    const menu = await file?.openContextMenu()
    await menu?.select('Duplicate')
}

export async function captureInput(): Promise<string> {
    const input = await InputBox.create()
    return await input.getText()
}
