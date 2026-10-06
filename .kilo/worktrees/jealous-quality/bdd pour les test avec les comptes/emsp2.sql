-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mar. 06 oct. 2026 à 14:40
-- Version du serveur : 8.4.7
-- Version de PHP : 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `emsp2`
--

-- --------------------------------------------------------

--
-- Structure de la table `admin_user`
--

DROP TABLE IF EXISTS `admin_user`;
CREATE TABLE IF NOT EXISTS `admin_user` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Administrateur EMSP',
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `date_creation` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `admin_user`
--

INSERT INTO `admin_user` (`id`, `email`, `password_hash`, `nom`, `actif`, `date_creation`) VALUES
(1, 'admin@emsp.ci', 'scrypt:32768:8:1$F1Mk2AVIQbrkkSoh$abc02e4cbd90b7636c1b72e198c11dfa8f60381f56459d660724acd79fba128273baaf02bf087ac18d4a6912989ab4d7a4f069f0558268eb01657ce1729bbd3b', 'Administrateur EMSP', 1, '2026-10-01 10:16:16'),
(3, 'assistant.admin@emsp.ci', 'scrypt:32768:8:1$2nqV12YAQwHGQ6hC$df2c7e68615be40232f716148341a0d55b9d5b72d41a3bc21e8ae0dd0158a213317d527fd01cced117d7aaf4dddaef253350bfa6be1edbfd30c5b239786f4e1c', 'Administrateur secondaire EMSP', 1, '2026-10-06 14:34:44');

-- --------------------------------------------------------

--
-- Structure de la table `candidature`
--

DROP TABLE IF EXISTS `candidature`;
CREATE TABLE IF NOT EXISTS `candidature` (
  `numero_dossier` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code_tresor_pay` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MDP` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenoms` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sexe` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_naissance` date NOT NULL,
  `lieu_naissance` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nationalite` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Ivoirienne',
  `telephone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nature_piece` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_piece` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commune` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ville` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `annee_bac` year DEFAULT NULL,
  `serie_bac` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_bac` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_table` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mention` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `moyenne_bac` decimal(5,2) DEFAULT NULL,
  `note_math_bac` decimal(5,2) DEFAULT NULL,
  `note_physique_bac` decimal(5,2) DEFAULT NULL,
  `note_francais_bac` decimal(5,2) DEFAULT NULL,
  `note_anglais_bac` decimal(5,2) DEFAULT NULL,
  `choix_1_filiere` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `choix_2_filiere` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tuteur1_nom` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tuteur1_contact` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tuteur1_lien` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tuteur1_residence` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tuteur2_nom` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tuteur2_contact` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tuteur2_lien` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tuteur2_residence` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dossier_valide` tinyint(1) DEFAULT '0',
  `statut_candidature` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en_traitement',
  `date_compo` date DEFAULT NULL,
  `centre_compo` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note_francais_compo` decimal(5,2) DEFAULT NULL,
  `note_math_compo` decimal(5,2) DEFAULT NULL,
  `note_anglais_compo` decimal(5,2) DEFAULT NULL,
  `note_psycho_compo` decimal(5,2) DEFAULT NULL,
  `admis_concours` tinyint(1) DEFAULT '0',
  `filiere_formation` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`numero_dossier`),
  UNIQUE KEY `uq_code_tresor_pay` (`code_tresor_pay`),
  UNIQUE KEY `uq_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `candidature`
--

INSERT INTO `candidature` (`numero_dossier`, `code_tresor_pay`, `email`, `MDP`, `nom`, `prenoms`, `sexe`, `date_naissance`, `lieu_naissance`, `nationalite`, `telephone`, `nature_piece`, `numero_piece`, `commune`, `ville`, `adresse`, `annee_bac`, `serie_bac`, `numero_bac`, `numero_table`, `mention`, `moyenne_bac`, `note_math_bac`, `note_physique_bac`, `note_francais_bac`, `note_anglais_bac`, `choix_1_filiere`, `choix_2_filiere`, `tuteur1_nom`, `tuteur1_contact`, `tuteur1_lien`, `tuteur1_residence`, `tuteur2_nom`, `tuteur2_contact`, `tuteur2_lien`, `tuteur2_residence`, `dossier_valide`, `statut_candidature`, `date_compo`, `centre_compo`, `note_francais_compo`, `note_math_compo`, `note_anglais_compo`, `note_psycho_compo`, `admis_concours`, `filiere_formation`) VALUES
('CDT_14B8DCC865C1', 'PR23459876', 'test@gmail.com', 'scrypt:32768:8:1$jG61EXSJIoV0SVgE$6da17f3b84dd767295ac36bc5b38c681c677e170c609a41bb7fe7844e695b61274e86a7e7baa543bb55a5a9e2b6786e7af8c0ab2b3984a2540ba8972cd387653', 'Kabano', 'Paul', 'M', '2005-02-01', 'ANGRE', 'Ivoirienne', '0501400036', 'CNI', 'CI23456789', 'ANGRE', 'ABIDJAN', 'Chateau', '2020', 'A', 'BAC2345678', 'T234', 'Très Bien', 18.00, 18.00, 18.00, 18.00, 19.00, 'MDIG (Marketing Digital)', 'GARE (Gestion des Activités Réglementées de l’Économie)', 'Karidioula Lamine', '0709211203', 'Père', 'AZERTYUIOP', 'Koffie Alice', '234567890', 'Mère', 'ËTYUIO', 1, 'valide', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL),
('CDT_4B5BF252C0EC', 'PR23459876456', 'azerty@gmail.com', 'scrypt:32768:8:1$B3JEDYggsFdE9GBi$def4f5d889537cb6820e08c9e2dac322013a765a62180da7612f76a644a028f6bf90e1ec7b7eb7f849741f206db60a02ac6f673a32a3dfaab9f696ae888f4f5d', 'Toure', 'Hamed', 'M', '2008-05-04', 'Cocody', 'Ivoirienne', '23456789', 'PASSEPORT', 'P345678', 'ANGRE', 'ABIDJAN', 'Chateau', '2026', 'D', 'BAC2345678', 'T23478', 'Assez Bien', 13.70, 13.00, 13.00, 12.00, 14.00, 'FDIG (Finance Digitale)', 'MDIG (Marketing Digital)', 'Sié Ilyass Youssef Karidioula', '5687790', 'Père', 'BOUAKE', 'Cissé', '23456578', 'Mère', 'BOUAKE', 0, 'rejete', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL),
('CDT_9E038873D1B7', 'TR123456', 'sieilyassyoussefkaridioula@gmail.com', 'scrypt:32768:8:1$NvyOVQAEZRHFDY8E$5f46b742b06d52f0724eca5998b2498a0a20ea401cdae2de94e24ff333d352bc6959925e97e57c545c8b57c9da50cda89bcc7f639d477a5bb17977e784fdfa8e', 'Karidioula', 'Sié Ilyass Youssef', 'M', '2006-11-01', 'ABOBO', 'Ivoirienne', '0501400036', 'CNI', 'CI 0899 084 586 685', 'Bingerville', 'Bingerville', 'Gbagba', '2023', 'C', '23456', '34567', 'Bien', 15.00, 15.00, 15.00, 14.00, 14.00, 'DSER (Digitalisation des Services)', 'FDIG (Finance Digitale)', 'Karidioula Lamine', '0709211203', 'Père', 'BINGERVILLE', 'Koffie Alice', '010155005', 'Mère', 'Angre', 1, 'valide', NULL, NULL, 13.00, 17.00, 15.00, 12.00, 1, 'DSER'),
('CDT_D31FA759A872', 'PR2746590', 'tout@gmail.com', 'scrypt:32768:8:1$jT84mb431RaL3EGR$df583437ae31435bf54be4964c45e22f89afad70805438e686fc2846f35ca0334b339dc824911c53f65213b5f2920c294f76e1db4f955489819760c67d29ee1f', 'Abou', 'Paul Emmanuel', 'M', '2008-05-01', 'Cocody', 'Ivoirienne', '2345678945', 'ATTESTATION', 'P345678', 'ANGRE', 'ABIDJAN', 'Chateau', '2025', 'E', 'BAC23456745', 'TR345678', 'Passable', 12.00, 8.00, 14.00, 12.00, 10.00, 'DSER (Digitalisation des Services)', 'FDIG (Finance Digitale)', 'Dupont Paul', '2345678', 'Père', 'COCODY', 'Cissé Djénin', '8765E', 'Tuteur', 'BINGERVILLE', 1, 'valide', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL),
('TEST_CDT_01', 'TEST-PAY-01', 'test.candidat01@emsp.ci', 'scrypt:32768:8:1$lG34cB00HQDDU17j$aa76c1b4d23a8c73dd579913c47badd5ab48b5c03e393c163fb04fc70daddeeac99827638fbef9b1e80cb0396cf120426b6e7c3db4d56e329e6f7691410c62d9', 'Kouassi', 'Alice', 'F', '2005-03-06', 'Abidjan', 'Ivoirienne', '+2250700000001', NULL, NULL, 'Cocody', 'Abidjan', 'TEST_CDT_01 - Abidjan', '2024', 'D', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DSER (Digitalisation des Services)', 'FDIG (Finance Digitale)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'valide', '2026-11-15', 'EMSP - Abidjan', NULL, NULL, NULL, NULL, NULL, NULL),
('TEST_CDT_02', 'TEST-PAY-02', 'test.candidat02@emsp.ci', 'scrypt:32768:8:1$WR8k3TpaBTqPszxm$84545c66e7baa8833588b8068ece7d0da4492deb8788652a94e6957f8018fa43bc3fdd3b487dd6da9c76d59ec2985aefc616a85c6cf47ceec6a7e307e58efcb4', 'Yao', 'Boris', 'M', '2006-04-07', 'Abidjan', 'Ivoirienne', '+2250700000002', NULL, NULL, 'Cocody', 'Abidjan', 'TEST_CDT_02 - Abidjan', '2025', 'D', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DSER (Digitalisation des Services)', 'FDIG (Finance Digitale)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'valide', '2026-11-15', 'EMSP - Abidjan', NULL, NULL, NULL, NULL, NULL, NULL),
('TEST_CDT_03', 'TEST-PAY-03', 'test.candidat03@emsp.ci', 'scrypt:32768:8:1$uCjMjqTMRUVc8JJX$e0133cd46294672d2963394ea21c4746b61cfc6b2e16b1604162ac9fd755adc1ffb157256c60af7d4104cd2709f0ff457051484a10ae60e4426cc17d7764d634', 'NGuessan', 'Chantal', 'F', '2004-05-08', 'Abidjan', 'Ivoirienne', '+2250700000003', NULL, NULL, 'Cocody', 'Abidjan', 'TEST_CDT_03 - Abidjan', '2023', 'D', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DSER (Digitalisation des Services)', 'FDIG (Finance Digitale)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'valide', '2026-11-15', 'EMSP - Abidjan', 15.50, 14.00, 16.00, 13.50, 1, 'DSER (Digitalisation des Services)'),
('TEST_CDT_04', 'TEST-PAY-04', 'test.candidat04@emsp.ci', 'scrypt:32768:8:1$G4kj6kTgTIttKzpO$eb70a1dbfc024dc45675887bc60b2a92376785588a0d5cb5a8682bf892bc9d881d3a307396ae665252bd3e679922a753335f17c4faabe17d2074da1dd60509cd', 'Kone', 'Didier', 'M', '2005-06-09', 'Abidjan', 'Ivoirienne', '+2250700000004', NULL, NULL, 'Cocody', 'Abidjan', 'TEST_CDT_04 - Abidjan', '2024', 'D', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DSER (Digitalisation des Services)', 'FDIG (Finance Digitale)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'valide', '2026-11-15', 'EMSP - Abidjan', 8.00, 7.50, 9.00, 10.00, 0, NULL),
('TEST_CDT_05', 'TEST-PAY-05', 'test.candidat05@emsp.ci', 'scrypt:32768:8:1$CPTiu2vi4B5y0HqF$85b1662f4193167e6cb1a4ba66f20073d97830cc75fbba94ef90aa292550e2a817ff72f11dfe7f93df6fc8d50bc14c90057dc751ee21a72d7460dfbfc24760c6', 'Traore', 'Esther', 'F', '2006-07-10', 'Abidjan', 'Ivoirienne', '+2250700000005', NULL, NULL, 'Cocody', 'Abidjan', 'TEST_CDT_05 - Abidjan', '2025', 'D', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DSER (Digitalisation des Services)', 'FDIG (Finance Digitale)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'en_traitement', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('TEST_CDT_06', 'TEST-PAY-06', 'test.candidat06@emsp.ci', 'scrypt:32768:8:1$yoHdj7LUjU4R5Oko$d4a1d06d3dc9805a6a20ded1f080f113a62df7964384cd874948af7eff7d96b904019f9e049f05a367f60107d4ca16c659217e8f66e50136d17fe8bdd20e4629', 'Bamba', 'Fabrice', 'M', '2004-02-11', 'Abidjan', 'Ivoirienne', '+2250700000006', NULL, NULL, 'Cocody', 'Abidjan', 'TEST_CDT_06 - Abidjan', '2023', 'D', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DSER (Digitalisation des Services)', 'FDIG (Finance Digitale)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'en_traitement', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `candidature_document`
--

DROP TABLE IF EXISTS `candidature_document`;
CREATE TABLE IF NOT EXISTS `candidature_document` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `numero_dossier` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_document` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom_fichier` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `chemin_fichier` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_ajout` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_candidature_document` (`numero_dossier`,`type_document`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `candidature_document`
--

INSERT INTO `candidature_document` (`id`, `numero_dossier`, `type_document`, `nom_fichier`, `chemin_fichier`, `date_ajout`) VALUES
(2, 'CDT_9E038873D1B7', 'attestation', 'DROIT_DES_AFFAIRES.pdf', 'CDT_9E038873D1B7/attestation_e8a2db7bae7f2e80f9e5feed644f7728.pdf', '2026-09-29 16:07:52'),
(3, 'CDT_9E038873D1B7', 'releve_bac', 'Algorithmes_et_structures_de_donnees_-_Notes_de_cours__Michael_Blondin.pdf', 'CDT_9E038873D1B7/releve_bac_b97ceda503fb8f5a83a8fd8176e1ce8f.pdf', '2026-09-29 16:07:52'),
(4, 'CDT_9E038873D1B7', 'cni', 'Devoir_maison_.pdf', 'CDT_9E038873D1B7/cni_f6b4f50646dc6465bd8014462c2faacc.pdf', '2026-09-29 16:07:52'),
(5, 'CDT_9E038873D1B7', 'bulletins_seconde', 'Examens_avec_Solutions_Recherche_operationnelle.pdf', 'CDT_9E038873D1B7/bulletins_seconde_14309adfb61fa5cebf485d8e0b8c531c.pdf', '2026-09-29 16:07:52'),
(6, 'CDT_9E038873D1B7', 'bulletins_premiere', 'TRAVAUX_DIRIGES.pdf', 'CDT_9E038873D1B7/bulletins_premiere_1c1cf21f28e4b8722ea3da85df2e8730.pdf', '2026-09-29 16:07:52'),
(7, 'CDT_9E038873D1B7', 'bulletins_terminale', 'CamScanner_03-01-2026_15.11_2.pdf', 'CDT_9E038873D1B7/bulletins_terminale_6ba6e1c0a62f788d8debd158220a3e64.pdf', '2026-09-29 16:07:52'),
(8, 'CDT_9E038873D1B7', 'photo', 'WhatsApp_Image_2025-12-11_at_12.06.54.jpeg', 'CDT_9E038873D1B7/photo_726d7d8a7aa39c8643a1c33a83de8ea9.jpeg', '2026-09-29 16:07:52'),
(9, 'CDT_9E038873D1B7', 'lettre_motivation', 'Annee_de_Formation_2025-2026.pdf', 'CDT_9E038873D1B7/lettre_motivation_754d73cd285b9ad421b6ed17f8220e9f.pdf', '2026-09-29 16:07:52'),
(10, 'CDT_9E038873D1B7', 'acte_naissance', 'Recherche_Operationnelle_Programmation_dynamique_chaines_de_Markov_files_dattente.pdf', 'CDT_9E038873D1B7/acte_naissance_67040fad5c0523e2cbfeb1b0c2c2ef9c.pdf', '2026-09-29 16:07:52'),
(11, 'CDT_9E038873D1B7', 'cv', 'CamScanner_03-01-2026_15.11_1.pdf', 'CDT_9E038873D1B7/cv_4dcbd44d87bfc808f5f4e1fff9f999ef.pdf', '2026-09-29 16:07:52'),
(12, 'CDT_9E038873D1B7', 'convocation', 'convocation_admission_2026.pdf', 'CDT_9E038873D1B7/convocation_admission_2026.pdf', '2026-10-01 12:00:44'),
(18, 'CDT_14B8DCC865C1', 'attestation', 'Aide_memoire_algo_de_tri_et_recherche.pdf', 'CDT_14B8DCC865C1/attestation_70bb4ce1b954b504e034ceafe4a83755.pdf', '2026-10-01 15:38:50'),
(19, 'CDT_14B8DCC865C1', 'releve_bac', 'HAL-_Algorithmes_et_Structures_de_donnees-_Algorithmique_II.pdf', 'CDT_14B8DCC865C1/releve_bac_7f68d266aefd44401d1a697743bff63c.pdf', '2026-10-01 15:38:50'),
(20, 'CDT_14B8DCC865C1', 'cni', 'COURS_DE_SQL_DSER2.pdf', 'CDT_14B8DCC865C1/cni_8318fb5d3ac14dc4f4b3aa09643e9c0a.pdf', '2026-10-01 15:38:50'),
(21, 'CDT_14B8DCC865C1', 'bulletins_seconde', 'AlgebreRelationnelle.pdf', 'CDT_14B8DCC865C1/bulletins_seconde_20af7179c17bba352f9d55b29493db7f.pdf', '2026-10-01 15:38:50'),
(22, 'CDT_14B8DCC865C1', 'bulletins_premiere', 'TD_SQL.pdf', 'CDT_14B8DCC865C1/bulletins_premiere_0dd8a618f719d0d96112cd2c93e588af.pdf', '2026-10-01 15:38:50'),
(23, 'CDT_14B8DCC865C1', 'bulletins_terminale', 'Liste_des_Tables_Champs.pdf', 'CDT_14B8DCC865C1/bulletins_terminale_863dade6ff3e40ab6122a02a1baead30.pdf', '2026-10-01 15:38:50'),
(24, 'CDT_14B8DCC865C1', 'photo', 'WhatsApp_Image_2026-01-15_at_08.10.20.jpeg', 'CDT_14B8DCC865C1/photo_0b9bdd50920f0f3773796e4118c4881f.jpeg', '2026-10-01 15:38:50'),
(25, 'CDT_14B8DCC865C1', 'lettre_motivation', 'COURS_DE_SQL_DSER2.pdf', 'CDT_14B8DCC865C1/lettre_motivation_6ab83f5c551e9d60812f2f86ed83bb61.pdf', '2026-10-01 15:38:50'),
(26, 'CDT_14B8DCC865C1', 'acte_naissance', 'Evaluation_1_-_SQL.pdf', 'CDT_14B8DCC865C1/acte_naissance_4254273776da5e44074f5cb37600e3de.pdf', '2026-10-01 15:38:50'),
(27, 'CDT_14B8DCC865C1', 'cv', 'DEVOIR_DE_CLASSE_SQL.pdf', 'CDT_14B8DCC865C1/cv_b6afb4f1a4d5fddfaa2f5aae670a25ca.pdf', '2026-10-01 15:38:50'),
(28, 'CDT_14B8DCC865C1', 'convocation', 'convocation_admission_2026.pdf', 'CDT_14B8DCC865C1/convocation_admission_2026.pdf', '2026-10-01 15:53:24'),
(46, 'CDT_4B5BF252C0EC', 'attestation', 'AI_for_all_Certificate.pdf', 'CDT_4B5BF252C0EC/attestation_9046f40406f822ee56d45f24a616b6cc.pdf', '2026-10-04 07:21:23'),
(47, 'CDT_4B5BF252C0EC', 'releve_bac', 'Generative_AI__Certificate_1.pdf', 'CDT_4B5BF252C0EC/releve_bac_b9716f563f15d71ecbbfa45551575a3d.pdf', '2026-10-04 07:21:23'),
(48, 'CDT_4B5BF252C0EC', 'cni', 'Generative_AI__Certificate.pdf', 'CDT_4B5BF252C0EC/cni_c96506eada1dc3aece3cfdae02430d26.pdf', '2026-10-04 07:21:23'),
(49, 'CDT_4B5BF252C0EC', 'bulletins_seconde', 'Glossaire_Accessible.pdf', 'CDT_4B5BF252C0EC/bulletins_seconde_3fb3854ef47696fea04c8a3fb5ac089d.pdf', '2026-10-04 07:21:23'),
(50, 'CDT_4B5BF252C0EC', 'bulletins_premiere', 'Introduction___Competences_en_affaires_numeriques.pdf', 'CDT_4B5BF252C0EC/bulletins_premiere_d018da0bcc4834f0750306906d4d1647.pdf', '2026-10-04 07:21:23'),
(51, 'CDT_4B5BF252C0EC', 'bulletins_terminale', 'Responsible_AI_Certificate.pdf', 'CDT_4B5BF252C0EC/bulletins_terminale_f6ee7d5f8e42c0bff8359b9a9f2d7ecc.pdf', '2026-10-04 07:21:23'),
(52, 'CDT_4B5BF252C0EC', 'photo', 'Zenless_Zone_Zero_curved_box_logo.svg.png', 'CDT_4B5BF252C0EC/photo_d5d8fdca88da96b90fe282c637542244.png', '2026-10-04 07:21:23'),
(53, 'CDT_4B5BF252C0EC', 'lettre_motivation', 'Introduction___Competences_en_affaires_numeriques.pdf', 'CDT_4B5BF252C0EC/lettre_motivation_87b12b520e401261c08ebf6b289c51ec.pdf', '2026-10-04 07:21:23'),
(54, 'CDT_4B5BF252C0EC', 'acte_naissance', 'L_IA_pour_tous_Certificate.pdf', 'CDT_4B5BF252C0EC/acte_naissance_7a35e3340bd1f37abe618be58b14ca47.pdf', '2026-10-04 07:21:23'),
(55, 'CDT_4B5BF252C0EC', 'cv', 'AI_for_all_Certificate.pdf', 'CDT_4B5BF252C0EC/cv_5b647eed3964e2c5e41f29f81189aa1d.pdf', '2026-10-04 07:21:23'),
(56, 'CDT_D31FA759A872', 'attestation', 'Convocation_EMSP_Composition_Admission_2026.pdf', 'CDT_D31FA759A872/attestation_78d68f6123918a30b20f424bcf5269af.pdf', '2026-10-06 13:37:10'),
(57, 'CDT_D31FA759A872', 'releve_bac', 'DROIT_2eme_ANNEE.pdf', 'CDT_D31FA759A872/releve_bac_7bada837148573e9d879c14c8fe9a9ea.pdf', '2026-10-06 13:37:10'),
(58, 'CDT_D31FA759A872', 'cni', 'Cours_de_Droit_de_la_securite_et_de_la_prevoyance_sociale_EMSP.pdf', 'CDT_D31FA759A872/cni_5d9d60cd9fd66bd14df8ca575acf44bc.pdf', '2026-10-06 13:37:10'),
(59, 'CDT_D31FA759A872', 'bulletins_seconde', 'Convocation_EMSP_Composition_Admission_2026.pdf', 'CDT_D31FA759A872/bulletins_seconde_1825163730ad2429dc4a60626d8b7149.pdf', '2026-10-06 13:37:10'),
(60, 'CDT_D31FA759A872', 'bulletins_premiere', 'WhatsApp_Image_2026-09-30_at_11.16.22.jpeg', 'CDT_D31FA759A872/bulletins_premiere_93945d4c442c43108a1fe95955501230.jpeg', '2026-10-06 13:37:10'),
(61, 'CDT_D31FA759A872', 'bulletins_terminale', 'Evaluation_N2.pdf', 'CDT_D31FA759A872/bulletins_terminale_1b2c33f7548f242c6b5f9451568b0f87.pdf', '2026-10-06 13:37:10'),
(62, 'CDT_D31FA759A872', 'photo', 'Zenless_Zone_Zero_curved_box_logo.svg.png', 'CDT_D31FA759A872/photo_b0278131401fc8bcd69633b209e2c74b.png', '2026-10-06 13:37:10'),
(63, 'CDT_D31FA759A872', 'lettre_motivation', 'Convocation_EMSP_Composition_Admission_2026.pdf', 'CDT_D31FA759A872/lettre_motivation_dad1cec9c1765666a5c716da3094c674.pdf', '2026-10-06 13:37:10'),
(64, 'CDT_D31FA759A872', 'acte_naissance', 'WhatsApp_Image_2026-09-30_at_11.16.22.jpeg', 'CDT_D31FA759A872/acte_naissance_086f9a20c938bcb09add7888d30f9d5f.jpeg', '2026-10-06 13:37:10'),
(65, 'CDT_D31FA759A872', 'cv', 'modele_Convocation_EMSP_Composition_Admission_2026_1page.docx', 'CDT_D31FA759A872/cv_bfec3fca566ecd148d966756ebea0836.docx', '2026-10-06 13:37:10'),
(68, 'CDT_D31FA759A872', 'convocation', 'convocation_admission_2026.pdf', 'CDT_D31FA759A872/convocation_admission_2026.pdf', '2026-10-06 14:01:58');

-- --------------------------------------------------------

--
-- Structure de la table `message_contact`
--

DROP TABLE IF EXISTS `message_contact`;
CREATE TABLE IF NOT EXISTS `message_contact` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nom` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `objet` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_reception` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `platform_setting`
--

DROP TABLE IF EXISTS `platform_setting`;
CREATE TABLE IF NOT EXISTS `platform_setting` (
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `platform_setting`
--

INSERT INTO `platform_setting` (`setting_key`, `setting_value`, `updated_at`) VALUES
('candidate_edits_open', 'true', '2026-10-01 11:41:19'),
('candidate_registrations_open', 'true', '2026-10-04 09:49:34'),
('composition_centre', 'EMSP - Abidjan', '2026-10-04 08:17:54'),
('composition_date', '2026-11-15', '2026-10-06 13:38:00');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `candidature_document`
--
ALTER TABLE `candidature_document`
  ADD CONSTRAINT `fk_document_candidature` FOREIGN KEY (`numero_dossier`) REFERENCES `candidature` (`numero_dossier`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
