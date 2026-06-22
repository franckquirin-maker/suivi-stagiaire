-- =====================================================================
-- Base de données : suivi des absences et retards de stagiaires
-- SGBD cible : MySQL 8.0+
-- =====================================================================

CREATE DATABASE IF NOT EXISTS suivi_absences
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE suivi_absences;

-- ---------------------------------------------------------------------
-- USERS : personnel qui déclare les événements et gère les promos
-- (un seul rôle pour l'instant, pas de distinction admin/formateur)
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id_users      INT UNSIGNED AUTO_INCREMENT,
    nom           VARCHAR(50)  NOT NULL,
    prenom        VARCHAR(50)  NOT NULL,
    email         VARCHAR(100) NOT NULL,
    hashpassword  VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_users),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- PROMO : promotions de stagiaires
-- ---------------------------------------------------------------------
CREATE TABLE promo (
    id_promo                 INT UNSIGNED AUTO_INCREMENT,
    lib_promo                VARCHAR(50) NOT NULL,
    annee                    SMALLINT UNSIGNED NOT NULL,
    duree_formation_heure    INT UNSIGNED NOT NULL,
    pourcentage_max_absence  DECIMAL(5,2) NOT NULL,
    id_users                 INT UNSIGNED NOT NULL,
    created_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_promo),
    KEY idx_promo_users (id_users),
    CONSTRAINT fk_promo_users FOREIGN KEY (id_users)
        REFERENCES users (id_users)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- STAGIAIRE
-- ---------------------------------------------------------------------
CREATE TABLE stagiaire (
    id_stagiaire  INT UNSIGNED AUTO_INCREMENT,
    nom           VARCHAR(50)  NOT NULL,
    prenom        VARCHAR(50)  NOT NULL,
    email         VARCHAR(100) NOT NULL,
    id_promo      INT UNSIGNED NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_stagiaire),
    UNIQUE KEY uq_stagiaire_email (email),
    KEY idx_stagiaire_promo (id_promo),
    CONSTRAINT fk_stagiaire_promo FOREIGN KEY (id_promo)
        REFERENCES promo (id_promo)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- TYPE_EV : sous-catégories d'événements
-- (ex : "Retard transport", "Absence maladie", "Absence injustifiée"...)
-- ---------------------------------------------------------------------
CREATE TABLE type_ev (
    id_type   INT UNSIGNED AUTO_INCREMENT,
    lib_type  VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_type),
    UNIQUE KEY uq_type_lib (lib_type)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- EVENEMENTS : table mère, un événement déclaré pour un stagiaire
-- ---------------------------------------------------------------------
CREATE TABLE evenements (
    id_evenement      INT UNSIGNED AUTO_INCREMENT,
    date_declaration  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_evenement    DATE NOT NULL,
    id_users          INT UNSIGNED NOT NULL,
    id_stagiaire      INT UNSIGNED NOT NULL,
    id_type           INT UNSIGNED NOT NULL,
    PRIMARY KEY (id_evenement),
    KEY idx_evenements_users (id_users),
    KEY idx_evenements_stagiaire (id_stagiaire),
    KEY idx_evenements_type (id_type),
    CONSTRAINT fk_evenements_users FOREIGN KEY (id_users)
        REFERENCES users (id_users)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_evenements_stagiaire FOREIGN KEY (id_stagiaire)
        REFERENCES stagiaire (id_stagiaire)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_evenements_type FOREIGN KEY (id_type)
        REFERENCES type_ev (id_type)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- RETARD : table fille (héritage 1-1 sur evenements)
-- ---------------------------------------------------------------------
CREATE TABLE retard (
    id_evenement  INT UNSIGNED NOT NULL,
    duree         INT UNSIGNED NOT NULL COMMENT 'durée en minutes',
    PRIMARY KEY (id_evenement),
    CONSTRAINT fk_retard_evenement FOREIGN KEY (id_evenement)
        REFERENCES evenements (id_evenement)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ABSENCE : table fille (héritage 1-1 sur evenements)
-- ---------------------------------------------------------------------
CREATE TABLE absence (
    id_evenement  INT UNSIGNED NOT NULL,
    date_fin      DATE NOT NULL,
    PRIMARY KEY (id_evenement),
    CONSTRAINT fk_absence_evenement FOREIGN KEY (id_evenement)
        REFERENCES evenements (id_evenement)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
