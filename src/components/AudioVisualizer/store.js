import { create } from 'zustand'

const useStore = create((set) => ({
  loaded: false,
  clicked: false,
  track: { synthonly: false, kicks: 0, loops: 0 },
  api: {
    loaded() {
      set({ loaded: true })
    },
    start() {
      set({ clicked: true })
    },
  },
}))

export default useStore
