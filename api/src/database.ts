import Sqlite3 from "better-sqlite3";

export const db = Sqlite3("database/db.sqlite");

export function initDatabase() {
  // Création de la table cours
  db.exec(`
    CREATE TABLE IF NOT EXISTS cours (
      id_cours INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      description TEXT,
      niveau TEXT NOT NULL,
      max_participants INTEGER NOT NULL
    )
  `);
  // Création de la table adherents
  db.exec(`
    CREATE TABLE IF NOT EXISTS adherents (
      id_adherent INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    )
  `);
  // Création de la table inscriptions
  db.exec(`
    CREATE TABLE IF NOT EXISTS inscriptions (
      id_cours INTEGER NOT NULL,
      id_adherent INTEGER NOT NULL,
      PRIMARY KEY (id_cours, id_adherent),
      FOREIGN KEY (id_cours) REFERENCES cours(id_cours),
      FOREIGN KEY (id_adherent) REFERENCES adherents(id_adherent)
    )
  `);
}