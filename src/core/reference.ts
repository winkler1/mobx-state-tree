import {tryResolve} from "../index"

export interface IReferenceDescription {
    path: string,
    targetIdAttribute: string,
    sourceIdAttribute: string
    isReferenceTo: boolean
}

// TODO: support list / map references as well.
export function referenceTo<T>(path: string, sourceIdAttribute: string = ""): T {
    // TODO check input args
    const targetIdAttribute = path.split("/").slice(-1)[0]
    path = path.split("/").slice(0, -1).join("/")
    return {
        path,
        targetIdAttribute,
        sourceIdAttribute,
        isReferenceTo: true
    } as IReferenceDescription as any
}

export function isReferenceFactory(thing) {
    return thing.isReferenceTo === true
}

export function createReferenceProps(name: string, ref: IReferenceDescription) {
    const sourceIdAttribute = ref.sourceIdAttribute || `${name}_id`
    const res = {
        [sourceIdAttribute]: "" // the raw attribute value
    }
    Object.defineProperty(res, name, {
        get: function() {
            const id = this[sourceIdAttribute]
            return id ? tryResolve(this, ref.path + "/" + id) : null // TODO: insert slash etc?
        },
        set: function(v) {
            // TODO: emit action
            this[sourceIdAttribute] = v ? v[ref.targetIdAttribute] : ""
        },
        enumerable: true // make sure it is picked up by extendObservable
    })
    return res
}
