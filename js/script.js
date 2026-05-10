'use strict'

const qs = (s, c = document) => c.querySelector(s)
const qsa = (s, c = document) => [...c.querySelectorAll(s)]

/* ─── NAVBAR */
;(function () {
  const navbar = qs('#navbar')
  const toggle = qs('#navToggle')
  const menu = qs('#mobileMenu')
  const allLinks = qsa('.nav-links a[href^="#"], .mobile-menu a[href^="#"]')

  window.addEventListener(
    'scroll',
    () => navbar.classList.toggle('scrolled', scrollY > 50),
    { passive: true }
  )

  const isOpen = () => menu.classList.contains('open')

  const setMenu = open => {
    toggle.classList.toggle('open', open)
    menu.classList.toggle('open', open)
    menu.setAttribute('aria-hidden', String(!open))
    toggle.setAttribute('aria-expanded', String(open))
    document.body.classList.toggle('menu-open', open)
  }

  toggle.addEventListener('click', e => {
    e.stopPropagation()
    setMenu(!isOpen())
  })
  menu.addEventListener(
    'click',
    e => e.target.tagName === 'A' && setMenu(false)
  )
  document.addEventListener(
    'click',
    e =>
      isOpen() &&
      !navbar.contains(e.target) &&
      !menu.contains(e.target) &&
      setMenu(false)
  )
  document.addEventListener(
    'keydown',
    e => e.key === 'Escape' && isOpen() && setMenu(false)
  )

  let rt
  window.addEventListener('resize', () => {
    clearTimeout(rt)
    rt = setTimeout(() => innerWidth > 768 && setMenu(false), 100)
  })

  const sections = qsa('section[id], footer[id]')
  const updateActive = () => {
    const mid = scrollY + innerHeight * 0.4
    let active = null
    sections.forEach(s => s.offsetTop <= mid && (active = s.id))
    allLinks.forEach(l =>
      l.classList.toggle('active', l.getAttribute('href') === `#${active}`)
    )
  }
  window.addEventListener('scroll', updateActive, { passive: true })
  updateActive()
})()

/* ─── HERO SLIDER */
;(function () {
  const slides = qsa('.hero-media-slide')
  const dotsWrap = qs('#heroMediaDots')
  if (!slides.length || !dotsWrap) return

  let idx = 0

  slides.forEach(s => {
    const img = qs('img', s)
    if (img?.src) new Image().src = img.src
  })

  const buildDots = () => {
    dotsWrap.innerHTML = ''
    slides.forEach((_, i) => {
      const d = Object.assign(document.createElement('span'), {
        className: 'hero-media-dot' + (i === idx ? ' active' : ''),
        style: 'cursor:pointer'
      })
      d.addEventListener('click', () => goTo(i))
      dotsWrap.appendChild(d)
    })
  }

  const goTo = n => {
    slides[idx].classList.remove('active')
    idx = (n + slides.length) % slides.length
    slides[idx].classList.add('active')
    ;[...dotsWrap.children].forEach((d, i) =>
      d.classList.toggle('active', i === idx)
    )
  }

  qs('.hero-media-nav.prev')?.addEventListener('click', () => goTo(idx - 1))
  qs('.hero-media-nav.next')?.addEventListener('click', () => goTo(idx + 1))

  buildDots()
  goTo(0)
})()

/* ─── REVEAL ON SCROLL */
;(function () {
  const observer = new IntersectionObserver(
    entries =>
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view')
          observer.unobserve(e.target)
        }
      }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  )
  qsa('.reveal').forEach(el => observer.observe(el))
})()

/* ─── PORTFOLIO FILTER */
;(function () {
  const filterBtns = qsa('.filter-btn')
  const items = qsa('.portfolio-item')

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')

      const filter = btn.dataset.filter

      items.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter

        if (match) {
          item.classList.remove('hidden')
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              item.style.opacity = '1'
              item.style.transform = 'scale(1)'
            })
          })
        } else {
          item.style.opacity = '0'
          item.style.transform = 'scale(0.96)'
          setTimeout(() => item.classList.add('hidden'), 500)
        }
      })
    })
  })
})()

/* ─── PORTFOLIO MODAL */
;(function () {
  const overlay = qs('#modalOverlay')
  const closeBtn = qs('#modalClose')
  const modalImg = qs('#modalImg')
  const modalCap = qs('#modalCaption')
  const modalDots = qs('#modalDots')
  const modalCtr = qs('#modalCounter')
  const prevBtn = qs('#modalPrev')
  const nextBtn = qs('#modalNext')

  let images = [],
    current = 0

  const buildDots = () => {
    modalDots.innerHTML = ''
    images.forEach((_, i) => {
      const d = document.createElement('button')
      d.className = 'modal-dot' + (i === current ? ' active' : '')
      d.setAttribute('aria-label', `Photo ${i + 1}`)
      d.addEventListener('click', () => goTo(i))
      modalDots.appendChild(d)
    })
  }

  const setNav = show => {
    prevBtn.style.display = nextBtn.style.display = show ? '' : 'none'
  }

  const goTo = idx => {
    current = (idx + images.length) % images.length
    modalImg.classList.add('fading')
    setTimeout(() => {
      const img = images[current]
      modalImg.src = img.src
      modalImg.alt = modalCap.textContent = img.caption || ''
      modalImg.classList.remove('fading')
    }, 220)
    qsa('.modal-dot', modalDots).forEach((d, i) =>
      d.classList.toggle('active', i === current)
    )
    modalCtr.innerHTML = `<em>${current + 1}</em> / ${images.length}`
  }

  const openModal = card => {
    try {
      images = JSON.parse(card.dataset.images || '[]')
    } catch {
      images = []
    }
    if (!images.length) return

    qs('#modalProjectCat').textContent = card.dataset.projectCat || ''
    qs('#modalProjectName').textContent = card.dataset.project || ''

    current = 0
    buildDots()
    modalImg.src = images[0].src
    modalImg.alt = modalCap.textContent = images[0].caption || ''
    modalCtr.innerHTML = `<em>1</em> / ${images.length}`
    setNav(images.length > 1)

    overlay.classList.add('open')
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    overlay.classList.remove('open')
    document.body.style.overflow = ''
    setTimeout(() => {
      modalImg.src = ''
    }, 400)
  }

  qsa('.portfolio-item').forEach(item => {
    item.style.cursor = 'pointer'
    item.addEventListener('click', () => openModal(item))
  })

  closeBtn.addEventListener('click', closeModal)
  overlay.addEventListener('click', e => e.target === overlay && closeModal())
  prevBtn.addEventListener('click', () => goTo(current - 1))
  nextBtn.addEventListener('click', () => goTo(current + 1))

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return
    if (e.key === 'Escape') closeModal()
    if (e.key === 'ArrowLeft') goTo(current - 1)
    if (e.key === 'ArrowRight') goTo(current + 1)
  })

  let tx = 0
  overlay.addEventListener(
    'touchstart',
    e => {
      tx = e.touches[0].clientX
    },
    { passive: true }
  )
  overlay.addEventListener(
    'touchend',
    e => {
      const d = e.changedTouches[0].clientX - tx
      if (Math.abs(d) >= 40) d < 0 ? goTo(current + 1) : goTo(current - 1)
    },
    { passive: true }
  )
})()

/* ─── CONTACT FORM */
;(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const form = qs('#contactForm')
    if (!form) return

    const validators = {
      name: v => v.trim().length >= 2,
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      service: v => v !== '',
      message: v => v.trim().length >= 10,
      alamat: v => v.trim().length >= 5
    }

    const validate = input => {
      const ok = !validators[input.name] || validators[input.name](input.value)
      input.classList.toggle('error', !ok)
      input.closest('.form-group')?.classList.toggle('show-error', !ok)
      return ok
    }

    form.addEventListener('submit', e => {
      e.preventDefault()
      const valid = [...form.querySelectorAll('input, select, textarea')]
        .map(validate)
        .every(Boolean)
      if (!valid) return

      const btn = form.querySelector('[type="submit"]')
      const span = btn?.querySelector('span')
      if (btn) {
        btn.disabled = true
        if (span) span.textContent = 'Redirecting...'
      }

      setTimeout(() => {
        const g = n => form.querySelector(`[name="${n}"]`)?.value || '-'
        const text = `Halo Candela Construction 👋\n\nNama: ${g(
          'name'
        )}\nPerusahaan: ${g('company')}\nEmail: ${g('email')}\n\nLayanan: ${g(
          'service'
        )}\nAlamat Perusahaan: ${g('alamat')}\n\nPesan:\n${g('message')}`
        window.open(
          'https://wa.me/6281113092828?text=' + encodeURIComponent(text),
          '_blank'
        )
        form.reset()
        if (btn) {
          btn.disabled = false
          if (span) span.textContent = 'Kirim Enquiry'
        }
      }, 400)
    })
  })
})()

/* ─── SMOOTH SCROLL */
;(function () {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = qs(link.getAttribute('href'))
      if (!target) return
      e.preventDefault()
      const navH =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
        ) || 70
      window.scrollTo({
        top: target.getBoundingClientRect().top + scrollY - navH,
        behavior: 'smooth'
      })
    })
  })
})()

/* ─── PARALLAX HERO */
;(function () {
  const overlay = qs('.hero-overlay')
  if (!overlay || getComputedStyle(overlay).display === 'none') return

  let ticking = false
  const content = qs('.hero-content')

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return
      requestAnimationFrame(() => {
        const y = scrollY
        if (y < innerHeight) {
          content.style.transform = `translateY(${y * 0.35}px)`
          overlay.style.opacity = 0.6 + (y / innerHeight) * 0.35
        }
        ticking = false
      })
      ticking = true
    },
    { passive: true }
  )
})()
