document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.querySelector('.menu-toggle')
  const mainNav = document.getElementById('mainNav')
  const stickyApply = document.querySelector('.sticky-apply')
  const hero = document.querySelector('.hero')
  const closingCta = document.querySelector('.closing-cta')
  const revealItems = document.querySelectorAll('.reveal')

  menuToggle.addEventListener('click', function () {
    const isOpen = mainNav.classList.toggle('open')
    menuToggle.setAttribute('aria-expanded', String(isOpen))
    menuToggle.setAttribute(
      'aria-label',
      isOpen ? 'Fermer le menu' : 'Ouvrir le menu',
    )
    menuToggle.innerHTML = `<i class="bi ${isOpen ? 'bi-x-lg' : 'bi-list'}" aria-hidden="true"></i>`
  })

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', function () {
      mainNav.classList.remove('open')
      menuToggle.setAttribute('aria-expanded', 'false')
    })
  })

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'))
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        })
      },
      { threshold: 0.14 },
    )
    revealItems.forEach((item) => revealObserver.observe(item))
  }

  if ('IntersectionObserver' in window) {
    const stickyObserver = new IntersectionObserver(
      (entries) => {
        stickyApply.classList.toggle('visible', !entries[0].isIntersecting)
      },
      { threshold: 0.05 },
    )
    stickyObserver.observe(hero)

    const closingObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) stickyApply.classList.remove('visible')
      },
      { threshold: 0.12 },
    )
    closingObserver.observe(closingCta)
  }
})
