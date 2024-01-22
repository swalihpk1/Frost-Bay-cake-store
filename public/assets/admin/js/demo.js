const $layouts = document.querySelectorAll('[name="layout"]')
const cutElement = (wrapper) => {
  const $wrapper = document.createElement('div')
  $wrapper.innerHTML = wrapper.children[0].outerHTML

  return $wrapper.children[0]
}

new Promise((resolve, reject) => {
  const settings = {
    skin: HSThemeAppearance.getAppearance() || 'default',
    layout: window.localStorage.getItem('layout') || 'default',
    fluid: window.localStorage.getItem('builderFluidSwitch') || false,
    sidebarNavOptions: window.localStorage.getItem('sidebarNavOptions') || 'pills',
  }

  const checkFluid = function () {
    let $contentContainers;
    if (settings.fluid === 'true') {
      document.querySelectorAll('header .container').forEach(function ($container) {
        $container.classList.remove('container')
        $container.classList.add('container-fluid')
      })
      $contentContainers = document.querySelectorAll('.content.container')
      $contentContainers.forEach(function ($contentContainer) {
        $contentContainer.classList.remove('container')
        $contentContainer.classList.add('container-fluid')
      })
    } else {
      $contentContainers = document.querySelectorAll('.content.container-fluid')
      $contentContainers.forEach(function ($contentContainer) {
        $contentContainer.classList.remove('container-fluid')
        $contentContainer.classList.add('container')
      })
    }
  }

  const initHeader = function () {
    const $script = document.createElement('script')
    $script.innerText = `new HSMegaMenu('.js-mega-menu', {
          desktop: {
            position: 'left'
          }
        })`

    window.addEventListener('load', function () {
      document.body.appendChild($script)
      setTimeout(function () {
        window.scrollTo(0, 0)
      })
    })
  }

  document.querySelectorAll('[name="sidebarNavOptions"]')
      .forEach($control => {
        if ($control.value === settings.sidebarNavOptions) {
          $control.checked = true
        }
      })

  $layouts.forEach($control => {
    if ($control.value === settings.layout && !document.querySelector('[name="headerLayoutOptions"]:checked')) {
      $control.checked = true
    }
  })

  document.querySelectorAll('[name="layoutSkinsRadio"]')
      .forEach($control => {
        if ($control.value === settings.skin) {
          $control.checked = true
        }
      })

  const $builderFluidSwitch = document.querySelector('#builderFluidSwitch')
  $builderFluidSwitch.checked = settings.fluid === 'true'

  let $sidebarNavOptions = document.querySelectorAll('[name="sidebarNavOptions"]')

  // Set layout
  if (settings.layout === 'default') {
    $builderFluidSwitch.disabled = true
    $sidebarNavOptions.forEach(option => option.disabled = false)
    const $header = cutElement(document.querySelector('.js-build-layout-header-double'))
  } else if (settings.layout === 'navbar-dark') {
    $builderFluidSwitch.disabled = true
    const $aside = document.querySelector('.navbar-vertical-aside')
    $aside.classList.remove('bg-white')
    $aside.classList.add('bg-dark', 'navbar-dark')
  } else if (settings.layout === 'double-header') {
    document.body.className = 'footer-offset'
    document.querySelectorAll('aside').forEach(function (aside) {
      aside.remove()
    })

    document.querySelector('header').remove()
    const $header = cutElement(document.querySelector('.js-build-layout-header-double'))
    document.body.prepend($header)

    initHeader()
    checkFluid()
    $sidebarNavOptions.forEach(option => {
      option.disabled = true
      option.checked = false
    })
  } else if (settings.layout === 'single-header') {
    document.body.className = 'footer-offset'
    document.querySelectorAll('aside').forEach(function (aside) {
      aside.remove()
    })

    document.querySelector('header').remove()
    const $header = cutElement(document.querySelector('.js-build-layout-header-default'))
    document.body.prepend($header)

    initHeader()
    checkFluid()
    $sidebarNavOptions.forEach(option => {
      option.disabled = true
      option.checked = false
    })
  }

  // Set vartical navar pills/tab style
  if (settings.sidebarNavOptions === 'tabs') {
    $navPills = document.querySelector('.nav-pills')
    if ($navPills) {
      $navPills.classList.remove('nav-pills')
      $navPills.classList.add('nav-tabs')
    }
  }

  // Remove mockups
  document.querySelector('.js-build-layouts').remove()

  // Event listener to disable/enable fluid checkbox
  document.querySelectorAll('[name="layout"]').forEach(function ($control) {
    $control.addEventListener('change', event => {
      if (event.target.value !== 'default' && event.target.value !== 'navbar-dark') {
        $sidebarNavOptions.forEach(option => option.disabled = true)
        return $builderFluidSwitch.disabled = false
      }

      $sidebarNavOptions.forEach(option => option.disabled = false)
      $builderFluidSwitch.disabled = true
    })
  })

  return resolve(true)
}).then(function () {
  // Show body after build
  document.body.style.opacity = 1

  // Submit
  document.querySelector('#js-builder-preview').addEventListener('click', function () {
    $controlSkin = document.querySelector('[name="layoutSkinsRadio"]:checked').value
    $sidebarNavOptions = document.querySelector('[name="sidebarNavOptions"]:checked')
    $sidebarNavOptions = $sidebarNavOptions ? $sidebarNavOptions.value : null
    $controlLayout = document.querySelector('[name="layout"]:checked').value
    $fluid = document.querySelector('#builderFluidSwitch').checked
    HSThemeAppearance.setAppearance($controlSkin)
    window.localStorage.setItem('layout', $controlLayout)
    window.localStorage.setItem('builderFluidSwitch', $fluid)
    window.localStorage.setItem('sidebarNavOptions', $sidebarNavOptions)
    location.reload()
  })

  // Reset
  document.querySelector('#js-builder-reset').addEventListener('click', function () {
    HSThemeAppearance.setAppearance('default')
    window.localStorage.setItem('layout', 'default')
    window.localStorage.setItem('builderFluidSwitch', false)
    window.localStorage.setItem('sidebarNavOptions', 'pills')
    location.reload()
  })
})
