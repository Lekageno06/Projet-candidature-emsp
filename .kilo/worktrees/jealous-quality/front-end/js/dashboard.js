document.addEventListener('DOMContentLoaded', function () {
  const alertBox = document.getElementById('dashboardAlert')
  const rows = document.getElementById('candidateRows')
  const modal = document.getElementById('candidateModal')
  const details = document.getElementById('candidateDetails')
  const documents = document.getElementById('candidateDocuments')
  const validateButton = document.getElementById('validateCandidate')
  const rejectButton = document.getElementById('rejectCandidate')
  const resultsForm = document.getElementById('candidateResultsForm')
  const searchInput = document.getElementById('candidateSearch')
  const statusFilter = document.getElementById('candidateStatusFilter')
  let selectedDossier = null
  let modificationsOpen = true
  let registrationsOpen = true

  function renderModificationSetting() {
    const status = document.getElementById('modificationStatus')
    const help = document.getElementById('modificationHelp')
    const button = document.getElementById('toggleModifications')
    status.textContent = modificationsOpen ? 'Modifications ouvertes' : 'Modifications clôturées'
    help.textContent = modificationsOpen
      ? 'Les candidats peuvent encore modifier leurs informations.'
      : 'Les candidats peuvent consulter leur dossier, mais ne peuvent plus le modifier.'
    button.innerHTML = modificationsOpen
      ? '<i class="bi bi-lock"></i> Clôturer les modifications'
      : '<i class="bi bi-unlock"></i> Rouvrir les modifications'
  }

  function renderRegistrationSetting() {
    const status = document.getElementById('registrationStatus')
    const help = document.getElementById('registrationHelp')
    const button = document.getElementById('toggleRegistrations')
    status.textContent = registrationsOpen ? 'Inscriptions ouvertes' : 'Inscriptions clôturées'
    help.textContent = registrationsOpen
      ? 'Les nouveaux candidats peuvent créer un dossier.'
      : 'Les nouvelles candidatures sont bloquées jusqu’à réouverture.'
    button.innerHTML = registrationsOpen
      ? '<i class="bi bi-door-closed"></i> Clôturer les inscriptions'
      : '<i class="bi bi-door-open"></i> Rouvrir les inscriptions'
  }

  function showError(message) {
    alertBox.hidden = false
    alertBox.textContent = message
  }

  function renderRows(candidates) {
    rows.innerHTML = ''
    if (!candidates.length) {
      rows.innerHTML = '<tr><td colspan="5" class="table-empty">Aucune candidature enregistrée.</td></tr>'
      return
    }
    candidates.forEach(function (candidate) {
      const row = document.createElement('tr')
      const values = [
        candidate.numero_dossier || '—',
        `${candidate.prenoms || ''} ${candidate.nom || ''}`.trim() || '—',
        candidate.choix_1_filiere || '—',
      ]
      values.forEach(function (value) {
        const cell = document.createElement('td')
        cell.textContent = value
        row.appendChild(cell)
      })
      const statusCell = document.createElement('td')
      const status = document.createElement('span')
      const candidateStatus = candidate.statut_candidature || (candidate.dossier_valide ? 'valide' : 'en_traitement')
      status.className = candidateStatus === 'valide' || candidate.admis_concours
        ? 'status-pill'
        : candidateStatus === 'rejete' ? 'status-pill rejected' : 'status-pill pending'
      status.textContent = candidate.admis_concours
        ? 'Admis'
        : candidateStatus === 'rejete'
          ? 'Refusé'
          : candidateStatus === 'valide'
          ? 'Validé'
          : 'En attente'
      statusCell.appendChild(status)
      row.appendChild(statusCell)
      const actionCell = document.createElement('td')
      const openButton = document.createElement('button')
      openButton.type = 'button'
      openButton.className = 'table-action'
      openButton.textContent = 'Consulter'
      openButton.addEventListener('click', function () {
        openCandidate(candidate.numero_dossier)
      })
      actionCell.appendChild(openButton)
      row.appendChild(actionCell)
      rows.appendChild(row)
    })
  }

  function addDetail(label, value) {
    const item = document.createElement('div')
    item.className = 'detail-item'
    const title = document.createElement('span')
    title.textContent = label
    const content = document.createElement('strong')
    content.textContent = value || '—'
    item.append(title, content)
    details.appendChild(item)
  }

  async function openCandidate(dossier) {
    selectedDossier = dossier
    modal.hidden = false
    document.body.classList.add('modal-open')
    details.textContent = 'Chargement…'
    documents.textContent = 'Chargement…'
    try {
      const response = await fetch(`/api/admin/candidates/${encodeURIComponent(dossier)}`)
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Dossier indisponible.')
      details.innerHTML = ''
      addDetail('Numéro de dossier', result.candidate.numero_dossier)
      addDetail('Nom complet', `${result.candidate.prenoms || ''} ${result.candidate.nom || ''}`.trim())
      addDetail('Email', result.candidate.email)
      addDetail('Téléphone', result.candidate.telephone)
      addDetail('Choix 1', result.candidate.choix_1_filiere)
      addDetail('Choix 2', result.candidate.choix_2_filiere)
      addDetail('Dossier validé', result.candidate.dossier_valide ? 'Oui' : 'Non')
      addDetail('Statut', result.candidate.statut_candidature === 'rejete' ? 'Refusé' : result.candidate.statut_candidature === 'valide' ? 'Validé' : 'En traitement')
      addDetail('Admis au concours', result.candidate.admis_concours ? 'Oui' : 'Non')
      if (resultsForm) {
        resultsForm.note_francais_compo.value = result.candidate.note_francais_compo ?? ''
        resultsForm.note_math_compo.value = result.candidate.note_math_compo ?? ''
        resultsForm.note_anglais_compo.value = result.candidate.note_anglais_compo ?? ''
        resultsForm.note_psycho_compo.value = result.candidate.note_psycho_compo ?? ''
        resultsForm.filiere_formation.value = result.candidate.filiere_formation ?? ''
        resultsForm.admis_concours.checked = Boolean(result.candidate.admis_concours)
      }

      documents.innerHTML = ''
      if (!result.documents.length) {
        documents.textContent = 'Aucun document déposé.'
      } else {
        result.documents.forEach(function (documentItem) {
          const link = document.createElement('a')
          link.className = 'document-link'
          link.href = documentItem.download_url
          const icon = document.createElement('i')
          icon.className = 'bi bi-download'
          link.append(icon, document.createTextNode(` ${documentItem.nom_fichier || documentItem.type_document}`))
          documents.appendChild(link)
        })
      }
      const rejected = result.candidate.statut_candidature === 'rejete'
      const validated = result.candidate.statut_candidature === 'valide' || result.candidate.dossier_valide
      validateButton.disabled = validated
      validateButton.innerHTML = validated
        ? '<i class="bi bi-check-circle-fill"></i> Dossier déjà validé'
        : '<i class="bi bi-check-circle"></i> Valider le dossier'
      rejectButton.disabled = rejected || validated
      rejectButton.innerHTML = rejected
        ? '<i class="bi bi-x-circle-fill"></i> Candidature refusée'
        : '<i class="bi bi-x-circle"></i> Refuser la candidature'
    } catch (error) {
      details.textContent = error.message
      documents.textContent = ''
    }
  }

  function closeModal() {
    modal.hidden = true
    document.body.classList.remove('modal-open')
    selectedDossier = null
  }

  async function loadDashboard() {
    try {
      const params = new URLSearchParams()
      if (searchInput && searchInput.value.trim()) params.set('q', searchInput.value.trim())
      if (statusFilter && statusFilter.value) params.set('status', statusFilter.value)
      const query = params.toString() ? `?${params.toString()}` : ''
      const response = await fetch(`/api/admin/dashboard${query}`)
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Impossible de charger le dashboard.')
      document.getElementById('totalCount').textContent = result.counts.total
      document.getElementById('validCount').textContent = result.counts.valides
      document.getElementById('admittedCount').textContent = result.counts.admis
      document.getElementById('rejectedCount').textContent = result.counts.rejetes
      modificationsOpen = result.modifications_ouvertes !== false
      renderModificationSetting()
      registrationsOpen = result.inscriptions_ouvertes !== false
      renderRegistrationSetting()
      if (result.composition) {
        document.getElementById('compositionDate').value = result.composition.date || ''
        document.getElementById('compositionCentre').value = result.composition.centre || ''
      }
      renderRows(result.recent)
      loadAdminManagement()
    } catch (error) {
      showError(error.message)
      rows.innerHTML = '<tr><td colspan="5" class="table-empty">Données indisponibles.</td></tr>'
    }
  }

  async function loadAdminManagement() {
    const section = document.getElementById('adminManagement')
    const list = document.getElementById('adminList')
    const rows = document.getElementById('adminListRows')
    const response = await fetch('/api/admin/admins')
    if (!response.ok) {
      section.hidden = true
      return
    }
    const result = await response.json()
    list.hidden = false
    rows.innerHTML = ''
    result.admins.forEach(function (admin) {
      const item = document.createElement('div')
      item.className = 'admin-list-row'
      const identity = document.createElement('span')
      identity.textContent = `${admin.nom} · ${admin.email}`
      item.appendChild(identity)
      const form = document.createElement('form')
      form.className = 'admin-password-form'
      form.innerHTML = `<input type="password" minlength="8" placeholder="Nouveau mot de passe" required /><button class="refresh-button" type="submit">Fournir le mot de passe</button>`
      form.addEventListener('submit', async function (event) {
        event.preventDefault()
        const response = await fetch(`/api/admin/admins/${admin.id}/password`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: form.querySelector('input').value }),
        })
        const result = await response.json()
        alert(result.message || result.error)
        if (response.ok) form.reset()
      })
      item.appendChild(form)
      rows.appendChild(item)
    })
  }

  document.getElementById('refreshButton').addEventListener('click', loadDashboard)
  if (searchInput) {
    let searchTimer
    searchInput.addEventListener('input', function () {
      clearTimeout(searchTimer)
      searchTimer = setTimeout(loadDashboard, 250)
    })
  }
  if (statusFilter) statusFilter.addEventListener('change', loadDashboard)
  document.getElementById('compositionForm').addEventListener('submit', async function (event) {
    event.preventDefault()
    const message = document.getElementById('compositionMessage')
    const response = await fetch('/api/admin/settings/composition', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: document.getElementById('compositionDate').value,
        centre: document.getElementById('compositionCentre').value,
      }),
    })
    const result = await response.json()
    message.hidden = false
    message.className = `form-message ${response.ok ? 'success' : 'error'}`
    message.textContent = result.message || result.error
  })
  document.getElementById('resultsImportForm').addEventListener('submit', async function (event) {
    event.preventDefault()
    const message = document.getElementById('resultsImportMessage')
    const response = await fetch('/api/admin/results/import', {
      method: 'POST', body: new FormData(event.currentTarget),
    })
    const result = await response.json()
    message.hidden = false
    message.className = `form-message ${response.ok ? 'success' : 'error'}`
    message.textContent = response.ok
      ? `${result.updated.length} résultat(s) publié(s).${result.errors.length ? ` ${result.errors.length} ligne(s) ignorée(s).` : ''}`
      : result.error
    if (response.ok) event.currentTarget.reset()
  })
  document.getElementById('toggleModifications').addEventListener('click', async function () {
    const response = await fetch('/api/admin/settings/modifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ open: !modificationsOpen }),
    })
    if (!response.ok) return
    modificationsOpen = !modificationsOpen
    renderModificationSetting()
  })
  document.getElementById('toggleRegistrations').addEventListener('click', async function () {
    const response = await fetch('/api/admin/settings/registrations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ open: !registrationsOpen }),
    })
    if (!response.ok) return
    registrationsOpen = !registrationsOpen
    renderRegistrationSetting()
  })
  document.getElementById('generateConvocations').addEventListener('click', async function () {
    const button = this
    const message = document.getElementById('convocationMessage')
    button.disabled = true
    message.hidden = false
    message.className = 'form-message'
    message.textContent = 'Génération en cours…'
    try {
      const response = await fetch('/api/admin/convocations/generate', { method: 'POST' })
      const responseText = await response.text()
      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error(
          response.ok
            ? 'La réponse du serveur est invalide.'
            : `Le serveur a retourné une erreur (${response.status}). Vérifiez que le serveur a été redémarré.`,
        )
      }
      if (!response.ok) throw new Error(result.error || 'Génération impossible.')
      message.className = 'form-message success'
      message.textContent = `${result.generated.length} convocation(s) générée(s) sur ${result.total_valides} dossier(s) validé(s).`
    } catch (error) {
      message.className = 'form-message error'
      message.textContent = error.message
    } finally {
      button.disabled = false
    }
  })
  modal.querySelectorAll('[data-close-modal]').forEach(function (element) {
    element.addEventListener('click', closeModal)
  })
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.hidden) closeModal()
  })
  validateButton.addEventListener('click', async function () {
    if (!selectedDossier) return
    const response = await fetch(`/api/admin/candidates/${encodeURIComponent(selectedDossier)}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ validated: true }),
    })
    if (!response.ok) return
    await loadDashboard()
    await openCandidate(selectedDossier)
  })
  rejectButton.addEventListener('click', async function () {
    if (!selectedDossier || !window.confirm('Refuser définitivement cette candidature ?')) return
    const response = await fetch(`/api/admin/candidates/${encodeURIComponent(selectedDossier)}/validate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejete' }),
    })
    if (!response.ok) return
    await loadDashboard()
    await openCandidate(selectedDossier)
  })
  resultsForm.addEventListener('submit', async function (event) {
    event.preventDefault()
    if (!selectedDossier) return
    const response = await fetch(`/api/admin/candidates/${encodeURIComponent(selectedDossier)}/results`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(resultsForm))),
    })
    const result = await response.json()
    if (!response.ok) return showError(result.error || 'Impossible d’enregistrer les résultats.')
    await loadDashboard()
    await openCandidate(selectedDossier)
  })
  document.getElementById('adminForm').addEventListener('submit', async function (event) {
    event.preventDefault()
    const message = document.getElementById('adminFormMessage')
    const response = await fetch('/api/admin/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
    })
    const result = await response.json()
    message.hidden = false
    message.textContent = result.message || result.error
    message.className = `form-message ${response.ok ? 'success' : 'error'}`
    if (response.ok) event.currentTarget.reset()
  })
  document.getElementById('logoutButton').addEventListener('click', async function () {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.assign('/connexion')
  })
  loadDashboard()
})
