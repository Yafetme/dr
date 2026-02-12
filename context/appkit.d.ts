import { type AppKit } from '@reown/appkit'

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'appkit-button': any
            'appkit-network-button': any
        }
    }
}
