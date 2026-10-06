document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contactForm')
  if (!form) return

  form.addEventListener('submit', async function (event) {
    event.preventDefault()
    const button = form.querySelector("[type='submit']")
    const originalHTML = button.innerHTML
    button.disabled = true

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Envoi impossible.')
      alert(result.message)
      form.reset()
    } catch (error) {
      alert(error.message || 'Serveur inaccessible.')
    } finally {
      button.disabled = false
      button.innerHTML = originalHTML
    }
  })
})
