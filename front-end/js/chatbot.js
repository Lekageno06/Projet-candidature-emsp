(function () {
  function createChatbot() {
    const toggle = document.createElement('button')
    toggle.type = 'button'
    toggle.className = 'chatbot-toggle'
    toggle.setAttribute('aria-expanded', 'false')
    toggle.setAttribute('aria-controls', 'emspChatbot')
    toggle.innerHTML = '<i class="bi bi-chat-dots" aria-hidden="true"></i><span>Assistant EMSP</span>'

    const panel = document.createElement('section')
    panel.id = 'emspChatbot'
    panel.className = 'chatbot-panel'
    panel.setAttribute('aria-label', 'Assistant EMSP')
    panel.innerHTML = `
      <div class="chatbot-header">
        <div class="chatbot-heading">
          <i class="bi bi-stars" aria-hidden="true"></i>
          <div><strong>Assistant EMSP</strong><small>Orientation plateforme</small></div>
        </div>
        <button type="button" class="chatbot-close" aria-label="Fermer l'assistant">&times;</button>
      </div>
      <div class="chatbot-messages" aria-live="polite">
        <div class="chatbot-message">Bonjour ! Je peux vous guider dans les formations, la candidature, les documents et la convocation. Que souhaitez-vous savoir ?</div>
      </div>
      <form class="chatbot-form">
        <input class="chatbot-input" type="text" placeholder="Écrivez votre question..." autocomplete="off" required />
        <button class="chatbot-send" type="submit" aria-label="Envoyer"><i class="bi bi-arrow-up" aria-hidden="true"></i></button>
      </form>`

    document.body.append(toggle, panel)
    const messages = panel.querySelector('.chatbot-messages')
    const input = panel.querySelector('.chatbot-input')

    function addMessage(text, type, links) {
      const message = document.createElement('div')
      message.className = `chatbot-message ${type || ''}`
      const content = document.createElement('div')
      content.textContent = text
      message.appendChild(content)

      if (Array.isArray(links)) {
        links.slice(0, 3).forEach(function (link) {
          if (!link || typeof link.url !== 'string' || !link.url.startsWith('/')) return
          const anchor = document.createElement('a')
          anchor.className = 'chatbot-link'
          anchor.href = link.url
          anchor.textContent = link.label || link.url
          message.appendChild(anchor)
        })
      }
      messages.appendChild(message)
      messages.scrollTop = messages.scrollHeight
    }

    function setOpen(open) {
      panel.classList.toggle('is-open', open)
      toggle.setAttribute('aria-expanded', String(open))
      if (open) input.focus()
    }

    toggle.addEventListener('click', function () {
      setOpen(!panel.classList.contains('is-open'))
    })
    panel.querySelector('.chatbot-close').addEventListener('click', function () {
      setOpen(false)
    })
    panel.querySelector('.chatbot-form').addEventListener('submit', async function (event) {
      event.preventDefault()
      const question = input.value.trim()
      if (!question) return
      addMessage(question, 'user')
      input.value = ''
      input.disabled = true
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: question }),
        })
        const result = await response.json()
        addMessage(
          response.ok ? result.answer : (result.error || 'Je ne peux pas répondre pour le moment.'),
          '',
          response.ok ? result.links : [],
        )
      } catch (error) {
        addMessage('Le service est momentanément indisponible. Vous pouvez utiliser la page Contact.', '')
      } finally {
        input.disabled = false
        input.focus()
      }
    })
  }

  document.addEventListener('DOMContentLoaded', createChatbot)
})()
