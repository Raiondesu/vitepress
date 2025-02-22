import {
  computed,
  onMounted,
  onUnmounted,
  type Ref,
  ref,
  watchEffect
} from 'vue'
import { useRoute } from 'vitepress'
import { useMediaQuery } from '@vueuse/core'
import { useData } from './data.js'
import { getSidebar } from '../support/sidebar.js'

export function useSidebar() {
  const route = useRoute()
  const { theme, frontmatter } = useData()
  const is960 = useMediaQuery('(min-width: 960px)')

  const isOpen = ref(false)

  const sidebar = computed(() => {
    const sidebarConfig = theme.value.sidebar
    const relativePath = route.data.relativePath
    return sidebarConfig ? getSidebar(sidebarConfig, relativePath) : []
  })

  const hasSidebar = computed(() => {
    return (
      frontmatter.value.sidebar !== false &&
      sidebar.value.length > 0 &&
      frontmatter.value.layout !== 'home'
    )
  })

  const hasAside = computed(() => {
    return (
      frontmatter.value.layout !== 'home' && frontmatter.value.aside !== false
    )
  })

  const isSidebarEnabled = computed(() => hasSidebar.value && is960.value)

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value ? close() : open()
  }

  return {
    isOpen,
    sidebar,
    hasSidebar,
    hasAside,
    isSidebarEnabled,
    open,
    close,
    toggle
  }
}

/**
 * a11y: cache the element that opened the Sidebar (the menu button) then
 * focus that button again when Menu is closed with Escape key.
 */
export function useCloseSidebarOnEscape(
  isOpen: Ref<boolean>,
  close: () => void
) {
  let triggerElement: HTMLButtonElement | undefined

  watchEffect(() => {
    triggerElement = isOpen.value
      ? (document.activeElement as HTMLButtonElement)
      : undefined
  })

  onMounted(() => {
    window.addEventListener('keyup', onEscape)
  })

  onUnmounted(() => {
    window.removeEventListener('keyup', onEscape)
  })

  function onEscape(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen.value) {
      close()
      triggerElement?.focus()
    }
  }
}
