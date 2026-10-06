/* =========================================================
   EMSP - SCRIPT PRINCIPAL
========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  /* =====================================================
       ELEMENTS
    ====================================================== */

  const sections = document.querySelectorAll('.form-section')

  const sidebarLinks = document.querySelectorAll('.sidebar-link')

  const nextButtons = document.querySelectorAll('.next-btn')

  const prevButtons = document.querySelectorAll('.prev-btn')

  const sidebar = document.getElementById('sidebar')

  const sidebarToggle = document.getElementById('sidebarToggle')

  const form = document.getElementById('inscriptionForm')

  const dossierInput = document.getElementById('numeroDossier')

  const anneeBac = document.getElementById('anneeBac')

  /* =====================================================
       ANNEES DU BAC
    ====================================================== */

  const logoutButton = document.getElementById('logoutButton')

  const userName = document.getElementById('userName')

  const userEmail = document.getElementById('userEmail')
  let currentCandidate = null

  function showEditNotice(message, locked) {
    let notice = document.getElementById('candidateEditNotice')
    if (!notice) {
      notice = document.createElement('div')
      notice.id = 'candidateEditNotice'
      notice.setAttribute('role', 'status')
      form.insertBefore(notice, form.firstChild)
    }
    notice.className = `candidate-edit-notice ${locked ? 'locked' : 'editable'}`
    notice.innerHTML = `<i class="bi ${locked ? 'bi-lock-fill' : 'bi-pencil-square'}"></i><span>${message}</span>`
  }

  function populateCandidate(candidate) {
    if (!form) return
    const savedDocuments = new Set(candidate.documents_deposes || [])
    form.querySelectorAll(".document-upload input[type='file']").forEach(function (input) {
      const label = input.closest('.document-upload')
      if (!label || !savedDocuments.has(input.name)) return
      setFileState(input, label, 'Document déjà envoyé — cliquer pour remplacer')
    })
    form.querySelectorAll('[name]').forEach(function (field) {
      if (field.name === 'password' || field.name === 'confirmation') return
      if (!(field.name in candidate) || candidate[field.name] === null) return
      if (field.type === 'file') return
      field.value = candidate[field.name]
    })
    const convocationLink = document.getElementById('downloadConvocation')
    const statusTitle = document.getElementById('convocationStatusTitle')
    const statusMessage = document.getElementById('convocationStatusMessage')
    const convocationNotice = document.getElementById('convocationNotice')
    const downloadLabel = document.getElementById('convocationDownloadLabel')
    const downloadBox = document.getElementById('convocationDownloadBox')
    const rejected = candidate.statut_candidature === 'rejete'
    const validated = !rejected && Boolean(candidate.dossier_valide)
    const convocationReady = validated && Boolean(candidate.convocation_disponible)

    if (statusTitle && statusMessage) {
      statusTitle.textContent = rejected
        ? 'Votre candidature a été rejetée'
        : validated ? 'Votre dossier a été retenu' : 'Votre dossier est en cours de traitement'
      statusMessage.textContent = rejected
        ? 'Votre candidature ne peut pas être acceptée et vous ne pouvez plus déposer un nouveau dossier.'
        : validated
          ? 'Vous êtes autorisé(e) à participer à la composition d’admission.'
          : 'Votre dossier est en cours d’examen par l’administration.'
    }
    if (convocationNotice) {
      convocationNotice.hidden = !validated && !rejected
      convocationNotice.textContent = rejected
        ? 'Cette décision est définitive. Votre accès candidat est restreint.'
        : convocationReady
        ? 'Votre convocation est prête. Vous pouvez la télécharger ci-dessous.'
        : 'Votre dossier est validé, mais votre convocation n’est pas encore prête. Vous serez informé(e) dès sa disponibilité.'
    }
    if (convocationLink) {
      convocationLink.href = '/api/candidatures/me/convocation'
      convocationLink.classList.toggle('disabled', !convocationReady)
      convocationLink.setAttribute('aria-disabled', String(!convocationReady))
      convocationLink.tabIndex = convocationReady ? 0 : -1
      convocationLink.onclick = function (event) {
        if (!convocationReady) event.preventDefault()
      }
      if (!convocationReady) convocationLink.removeAttribute('download')
      else convocationLink.setAttribute('download', '')
    }
    if (downloadLabel) {
      downloadLabel.textContent = !validated
        ? rejected ? 'Candidature rejetée' : 'Disponible après validation du dossier'
        : convocationReady ? 'Document PDF' : 'Convocation en préparation'
    }
    if (downloadBox) {
      downloadBox.classList.toggle('is-pending', !convocationReady)
    }
    const resultFields = {
      resultFrancais: candidate.note_francais_compo,
      resultMath: candidate.note_math_compo,
      resultAnglais: candidate.note_anglais_compo,
      resultPsycho: candidate.note_psycho_compo,
      resultFiliere: candidate.filiere_formation,
    }
    const hasResults = Boolean(candidate.admis_concours) || Object.values(resultFields).some((value) => value !== null && value !== undefined && value !== '')
    const resultsPending = document.getElementById('resultsPending')
    const resultsPublished = document.getElementById('resultsPublished')
    if (resultsPending && resultsPublished) {
      resultsPending.hidden = hasResults
      resultsPublished.hidden = !hasResults
      Object.entries(resultFields).forEach(([id, value]) => {
        const element = document.getElementById(id)
        if (element) element.textContent = value ?? '—'
      })
      const admitted = Boolean(candidate.admis_concours)
      document.getElementById('resultsTitle').textContent = admitted ? 'Vous êtes admis(e)' : 'Résultats publiés'
      document.getElementById('resultsMessage').textContent = admitted
        ? 'Félicitations, votre admission est confirmée.'
        : 'Votre candidature n’a pas été retenue après la composition.'
    }
  }

  function applyCandidatePermissions(candidate) {
    if (!form) return
    const rejected = candidate.statut_candidature === 'rejete'
    const locked = rejected || Boolean(candidate.dossier_valide) || !candidate.modifications_ouvertes
    const reason = rejected
      ? 'Votre candidature a été rejetée : cet accès ne permet plus de déposer un nouveau dossier.'
      : candidate.dossier_valide
      ? 'Votre dossier est validé : les modifications sont définitivement verrouillées.'
      : 'Les modifications de dossiers sont momentanément clôturées par l’administration.'
    form.querySelectorAll('input, select, textarea, button').forEach(function (field) {
      if (field.id === 'logoutButton' || field.classList.contains('sidebar-toggle')) return
      if (field.name === 'numero_dossier') {
        field.disabled = false
        return
      }
      field.disabled = locked
    })
    const password = form.querySelector('[name="password"]')
    if (password) password.required = false
    showEditNotice(
      locked ? reason : 'Vous pouvez consulter et modifier vos informations tant que votre dossier reste ouvert.',
      locked,
    )
  }

  if (sessionStorage.getItem('emsp_authenticated') === 'true') {
    fetch('/api/auth/me')
      .then((response) => {
        if (!response.ok) {
          sessionStorage.removeItem('emsp_authenticated')
          return null
        }
        return response.json()
      })
      .then((candidate) => {
        if (!candidate) return
        currentCandidate = candidate
        populateCandidate(candidate)
        applyCandidatePermissions(candidate)
        if (userName) {
          userName.textContent = `${candidate.prenoms} ${candidate.nom}`
        }
        if (userEmail) {
          userEmail.textContent = candidate.email
        }
      })
      .catch(() => {})
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', async function (event) {
      event.preventDefault()
      await fetch('/api/auth/logout', { method: 'POST' })
      sessionStorage.removeItem('emsp_authenticated')
      window.location.assign('/')
    })
  }
  if (anneeBac) {
    const anneeActuelle = new Date().getFullYear()

    for (let annee = anneeActuelle; annee >= anneeActuelle - 10; annee--) {
      const option = document.createElement('option')

      option.value = annee

      option.textContent = annee

      anneeBac.appendChild(option)
    }
  }

  /* =====================================================
       AFFICHER UNE SECTION
    ====================================================== */

  function afficherSection(id) {
    sections.forEach((section) => {
      section.classList.remove('active-section')
    })

    const section = document.getElementById(id)

    if (section) {
      section.classList.add('active-section')
    }

    /* Sidebar */

    sidebarLinks.forEach((link) => {
      link.classList.remove('active')

      if (link.dataset.section === id) {
        link.classList.add('active')
      }
    })

    /* Scroll */

    window.scrollTo({
      top: 0,

      behavior: 'smooth',
    })

    /* Fermer sidebar mobile */

    if (window.innerWidth <= 768) {
      sidebar.classList.remove('show')
    }

    /* Progression */

    mettreAJourProgression(id)
  }

  /* =====================================================
       PROGRESSION
    ====================================================== */

  function mettreAJourProgression(sectionId) {
    const progression = {
      'section-generale': 25,

      'section-bac': 50,

      'section-tuteurs': 75,

      'section-documents': 100,

      'section-convocation': 100,
    }

    const valeur = progression[sectionId] || 25

    document.querySelectorAll('.progress-card').forEach((card) => {
      const progressBar = card.querySelector('.progress-bar')

      const percentage = card.querySelector('.progress-card-header strong')

      if (progressBar) {
        progressBar.style.width = valeur + '%'
      }

      if (percentage) {
        percentage.textContent = valeur + '%'
      }
    })
  }

  /* =====================================================
       SIDEBAR
    ====================================================== */

  sidebarLinks.forEach((link) => {
    link.addEventListener('click', function (event) {
      event.preventDefault()

      const section = this.dataset.section

      afficherSection(section)
    })
  })

  /* =====================================================
       BOUTON SUIVANT
    ====================================================== */

  nextButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const sectionId = this.dataset.next

      afficherSection(sectionId)
    })
  })

  /* =====================================================
       BOUTON PRECEDENT
    ====================================================== */

  prevButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const sectionId = this.dataset.prev

      afficherSection(sectionId)
    })
  })

  /* =====================================================
       SIDEBAR MOBILE
    ====================================================== */

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
      sidebar.classList.toggle('show')
    })
  }

  /* =====================================================
       VALIDATION D'UNE SECTION
    ====================================================== */

  function validerSection(sectionId, bouton) {
    const section = document.getElementById(sectionId)

    if (!section) {
      return false
    }

    const champs = section.querySelectorAll('input, select, textarea')

    let valide = true

    champs.forEach((champ) => {
      if (champ.hasAttribute('required') && !champ.checkValidity()) {
        champ.classList.add('is-invalid')

        valide = false
      } else {
        champ.classList.remove('is-invalid')
      }
    })

    if (!valide) {
      section.querySelector(':invalid')?.focus()

      return false
    }

    if (bouton) {
      const ancienHTML = bouton.innerHTML

      bouton.innerHTML = '<i class="bi bi-check-circle me-1"></i> Validé'

      bouton.classList.remove('btn-success')

      bouton.classList.add('btn-outline-success')

      setTimeout(() => {
        bouton.innerHTML = ancienHTML

        bouton.classList.remove('btn-outline-success')

        bouton.classList.add('btn-success')
      }, 2000)
    }

    return true
  }

  /* =====================================================
       VALIDATION GENERAL
    ====================================================== */

  const validateGeneral = document.getElementById('validateGeneral')

  if (validateGeneral) {
    validateGeneral.addEventListener('click', function () {
      validerSection('section-generale', this)
    })
  }

  /* =====================================================
       VALIDATION BAC
    ====================================================== */

  const validateBac = document.getElementById('validateBac')

  if (validateBac) {
    validateBac.addEventListener('click', function () {
      validerSection('section-bac', this)
    })
  }

  /* =====================================================
       VALIDATION TUTEURS
    ====================================================== */

  const validateTuteurs = document.getElementById('validateTuteurs')

  if (validateTuteurs) {
    validateTuteurs.addEventListener('click', function () {
      validerSection('section-tuteurs', this)
    })
  }

  /* =====================================================
       VALIDATION DOCUMENTS
    ====================================================== */

  const validateDocuments = document.getElementById('validateDocuments')

  if (validateDocuments) {
    validateDocuments.addEventListener('click', function () {
      validerSection('section-documents', this)
    })
  }

  /* =====================================================
       FICHIERS
    ====================================================== */

  const fileInputs = document.querySelectorAll(
    ".document-upload input[type='file']",
  )

  function setFileState(input, label, message) {
    let small = label.querySelector('small')
    if (!small) {
      small = document.createElement('small')
      label.querySelector('.document-content').appendChild(small)
    }
    small.textContent = message
    label.classList.add('file-selected')
    const icon = label.querySelector('.document-icon i')
    if (icon) icon.className = 'bi bi-check-circle-fill'
  }

  fileInputs.forEach((input) => {
    input.addEventListener('change', function () {
      const label = this.closest('.document-upload')

      if (!label) {
        return
      }

      if (this.files && this.files.length > 0) {
        const fichier = this.files[0]
        setFileState(this, label, `Document prêt : ${fichier.name}`)
      } else {
        const small = label.querySelector('small')
        if (small) small.textContent = 'Aucun fichier sélectionné'
        label.classList.remove('file-selected')
      }
    })
  })

  /* =====================================================
       VALIDATION FINALE
    ====================================================== */

  if (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault()

      /* Confirmation */

      const confirmation = document.getElementById('confirmation')

      if (confirmation && !confirmation.checked) {
        alert("Veuillez confirmer l'exactitude des informations fournies.")

        confirmation.focus()

        afficherSection('section-documents')

        return
      }

      /* Validation HTML */

      if (!form.checkValidity()) {
        form.reportValidity()

        return
      }

      const bouton = document.getElementById('submitInscription')

      bouton.disabled = true
      bouton.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span> Traitement...'

      try {
        const response = await fetch(
          currentCandidate ? '/api/candidatures/me' : '/api/candidatures',
          {
          method: currentCandidate ? 'PUT' : 'POST',
          body: new FormData(form),
          },
        )
        const result = await response.json()

        if (!response.ok) {
          const details = result.fields?.length
            ? ` (${result.fields.join(', ')})`
            : ''
          throw new Error((result.error || "Échec de l'inscription") + details)
        }

        if (!currentCandidate && dossierInput) {
          dossierInput.value = result.numero_dossier
        }
        alert(
          currentCandidate
            ? 'Vos informations ont été mises à jour avec succès.'
            : 'Votre candidature a été enregistrée avec succès.\n\nNuméro de dossier : ' + result.numero_dossier,
        )
        bouton.innerHTML = currentCandidate
          ? '<i class="bi bi-check-circle me-1"></i> Modifications enregistrées'
          : '<i class="bi bi-check-circle me-1"></i> Inscription enregistrée'
      } catch (error) {
        alert(error.message || 'Impossible de contacter le serveur.')
        bouton.disabled = false
        bouton.innerHTML =
          '<i class="bi bi-send me-1"></i> Valider l\'inscription'
      }
    })
  }

  /* =====================================================
       INITIALISATION
    ====================================================== */

  afficherSection('section-generale')
})
