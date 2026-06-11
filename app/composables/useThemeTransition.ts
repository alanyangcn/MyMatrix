let themeTransitionTimer: ReturnType<typeof setTimeout> | number | null = null

export function useThemeTransition() {
  function startThemeTransition() {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    root.classList.add('theme-transitioning')

    if (themeTransitionTimer) {
      window.clearTimeout(themeTransitionTimer)
    }

    themeTransitionTimer = window.setTimeout(() => {
      root.classList.remove('theme-transitioning')
      themeTransitionTimer = null
    }, 360)
  }

  return {
    startThemeTransition,
  }
}
