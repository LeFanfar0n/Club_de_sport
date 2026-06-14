import Fastify from "fastify";
import cors from "@fastify/cors";
import { db, initDatabase } from "./database"


const fastify = Fastify();

fastify.register(cors);

initDatabase();

type CoursBody = {
    nom: string;
    description: string;
    niveau: string;
    max_participants: number;
};

fastify.get("/cours", (r, reply) => {
    const query = db.prepare(`
    SELECT 
      cours.id_cours,
      cours.nom,
      cours.description,
      cours.niveau,
      cours.max_participants,
      COUNT(inscriptions.id_adherent) AS nb_inscrits
    FROM cours
    LEFT JOIN inscriptions 
      ON cours.id_cours = inscriptions.id_cours
    GROUP BY cours.id_cours
  `);

  reply.send(query.all());
});


fastify.get("/cours/:id/adherents", (request, reply) => {
  const { id } = request.params as { id: string };

  const query = db.prepare(`
    SELECT adherents.*
    FROM adherents
    INNER JOIN inscriptions
      ON adherents.id_adherent = inscriptions.id_adherent
    WHERE inscriptions.id_cours = ?
  `);

  const adherents = query.all(id);

  reply.send(adherents);
});

fastify.post("/cours", (request, reply) => {
    const {
        nom,
        description,
        niveau,
        max_participants
    } = request.body as CoursBody;

    const query = db.prepare(`
        INSERT INTO cours (nom, description, niveau, max_participants) VALUES (?,?,?,?)
        `);

    const result = query.run(nom, description, niveau, max_participants);

    reply.code(201).send({ id_cours: result.lastInsertRowid });

});

type AdherentBody = {
  nom: string;
  prenom: string;
  email: string;
};

fastify.post("/adherents", (request, reply) => {
  const { nom, prenom, email } = request.body as AdherentBody;

  try {
    const query = db.prepare(`
      INSERT INTO adherents (nom, prenom, email)
      VALUES (?, ?, ?)
    `);

    const result = query.run(nom, prenom, email);

    reply.code(201).send({ id_adherent: result.lastInsertRowid });
  } catch (error) {
    reply.code(409).send({ error: "Email déjà utilisé" });
  }
});

type InscriptionBody = {
  id_cours: number;
  id_adherent: number;
};

fastify.post("/inscriptions", (request, reply) => {
  const { id_cours, id_adherent } = request.body as InscriptionBody;

  try {
    const query = db.prepare(`
      INSERT INTO inscriptions (id_cours, id_adherent)
      VALUES (?, ?)
    `);

    query.run(id_cours, id_adherent);

    reply.code(201).send({ message: "Inscription créée" });
  } catch (error) {
    reply.code(409).send({ error: "Déjà inscrit ou id invalide" });
  }
});

fastify.put("/cours/:id", (request, reply) => {
    const { id } = request.params as { id: string };
    const { nom, description, niveau, max_participants } = request.body as CoursBody;

    const query = db.prepare(`
        UPDATE cours
        SET nom = ?, description = ?, niveau = ?, max_participants = ?
        WHERE id_cours = ?
        `);
    const result = query.run(nom, description, niveau, max_participants, id);

    reply.send({ updated: result.changes });
});

fastify.delete("/cours/:id", (request, reply) => {
    const { id } = request.params as { id: string };

    const query = db.prepare(`DELETE FROM cours WHERE id_cours = ?`)
    const result = query.run(id);

    reply.send({ deleted: result.changes });
})

fastify.listen({ port: 8080 }, () => {
    console.log("API lancée sur http://localhost:8080");
})