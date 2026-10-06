document.addEventListener('DOMContentLoaded', function () {
  const registrationMessage = document.getElementById('registrationClosedMessage')
  if (registrationMessage && new URLSearchParams(window.location.search).get('inscriptions') === 'ferme') {
    registrationMessage.hidden = false
  }
  const passwordInput = document.getElementById('password')
  const togglePassword = document.getElementById('togglePassword')

  if (passwordInput && togglePassword) {
    togglePassword.addEventListener('click', function () {
      const isPassword = passwordInput.getAttribute('type') === 'password'

      passwordInput.setAttribute('type', isPassword ? 'text' : 'password')

      const icon = togglePassword.querySelector('i')

      if (isPassword) {
        icon.classList.remove('bi-eye')
        icon.classList.add('bi-eye-slash')

        togglePassword.setAttribute('aria-label', 'Masquer le mot de passe')
      } else {
        icon.classList.remove('bi-eye-slash')
        icon.classList.add('bi-eye')

        togglePassword.setAttribute('aria-label', 'Afficher le mot de passe')
      }
    })
  }

  /* =====================================================
       SOUMISSION DU FORMULAIRE
    ====================================================== */

  const loginForm = document.getElementById('loginForm')
  const forgotLink = document.getElementById('forgotPasswordLink')
  const forgotModal = document.getElementById('forgotPasswordModal')
  const resetForm = document.getElementById('resetPasswordForm')

  function closeForgotModal() {
    forgotModal.hidden = true
  }

  if (forgotLink && forgotModal) {
    forgotLink.addEventListener('click', function (event) {
      event.preventDefault()
      forgotModal.hidden = false
      document.getElementById('resetIdentifiant').focus()
    })
    forgotModal.querySelectorAll('[data-close-forgot]').forEach(function (element) {
      element.addEventListener('click', closeForgotModal)
    })
  }

  if (resetForm) {
    resetForm.addEventListener('submit', async function (event) {
      event.preventDefault()
      const message = document.getElementById('resetMessage')
      const button = resetForm.querySelector('button[type="submit"]')
      button.disabled = true
      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(resetForm))),
        })
        const result = await response.json()
        message.hidden = false
        message.textContent = result.message || result.error
        message.className = `reset-message ${response.ok ? 'success' : 'error'}`
        if (response.ok) {
          resetForm.reset()
          setTimeout(closeForgotModal, 1200)
        }
      } catch (error) {
        message.hidden = false
        message.className = 'reset-message error'
        message.textContent = 'Serveur inaccessible.'
      } finally {
        button.disabled = false
      }
    })
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async function (event) {
      event.preventDefault()

      const identifiant = document.getElementById('identifiant').value.trim()

      const password = document.getElementById('password').value

      const submitButton = loginForm.querySelector("[type='submit']")
      const originalHTML = submitButton.innerHTML
      submitButton.disabled = true

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifiant, password }),
        })
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.error || 'Échec de la connexion.')
        }
        sessionStorage.setItem('emsp_authenticated', 'true')
        window.location.assign(result.role === 'admin' ? '/dashboard' : '/candidature')
      } catch (error) {
        let errorMessage = loginForm.querySelector("[role='alert']")
        if (!errorMessage) {
          errorMessage = document.createElement('p')
          errorMessage.setAttribute('role', 'alert')
          errorMessage.className = 'text-danger mt-3'
          loginForm.append(errorMessage)
        }
        errorMessage.textContent = error.message || 'Serveur inaccessible.'
        submitButton.disabled = false
        submitButton.innerHTML = originalHTML
      }
    })
  }
})
