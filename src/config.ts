import { ExtensionContext, WorkspaceConfiguration, workspace } from 'vscode'
import { Disposable } from './disposable'
import TypedEventEmitter from './events'
import { EXTENSION_ID } from './extension'

export interface ConfigSchema {
    openFile: boolean
}

type ConfigKey = keyof ConfigSchema

interface LocalEventTypes {
    'change': []
}

export default class Config extends TypedEventEmitter<LocalEventTypes> implements Disposable {

    private delegate: WorkspaceConfiguration

    constructor(context: ExtensionContext) {
        super()

        const {
            subscriptions,
        } = context

        this.delegate = workspace.getConfiguration(EXTENSION_ID)

        // listen for config changes
        subscriptions.push(
            workspace.onDidChangeConfiguration(e => {
                if (!e.affectsConfiguration(EXTENSION_ID)) {
                    return
                }

                this.delegate = workspace.getConfiguration(EXTENSION_ID)

                this.emit('change')
            }),
        )
    }

    dispose(): void {
        this.emitter.removeAllListeners()
    }

    has(key: ConfigKey): boolean {
        return this.delegate.has(key)
    }

    get<T extends ConfigKey>(key: T): ConfigSchema[T] | undefined {
        return this.delegate.get<ConfigSchema[T]>(key)
    }

    getOr<T extends ConfigKey>(key: T, or: ConfigSchema[T]): ConfigSchema[T] {
        return this.delegate.get<ConfigSchema[T]>(key) ?? or
    }

}
