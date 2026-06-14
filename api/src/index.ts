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

fastify.get("/cours", (request, reply) => {
    const query = db.prepare("SELECT * FROM cours");
    const cours = query.all();

    reply.send(cours);
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