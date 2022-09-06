import { assign } from '@vue/shared'

import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

const rendererOptions = assign(nodeOps, { patchProp })

console.log(rendererOptions);
