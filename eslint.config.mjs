import { configActDefault } from '@actcoding/eslint-config'
import { defineConfig } from 'eslint/config'

export default defineConfig([
    ...configActDefault,
    {
        name: 'app/ignores',
        ignores: [
            '*.d.ts',
            'out/',
        ],
    },
])
