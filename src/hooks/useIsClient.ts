import { useSyncExternalStore } from "react"

const subscribe = () => () => {}
/** false on the server and during hydration, true afterwards. Avoids hydration mismatches for client-only UI. */
export const useIsClient = () => useSyncExternalStore(subscribe, () => true, () => false)
