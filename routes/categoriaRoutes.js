const express = require('express');
const db = require('../config/database');

const router = express.Router();

router.get('/', (req, res) => {
	const categorias = db.prepare(
		'SELECT * FROM categoria'
	).all();

	res.json(categorias);
});

router.get('/:id', (req, res) => {
	const id = Number(req.params.id);

	if (!Number.isInteger(id) || id <= 0) {
		return res.status(400).json({
			erro: 'ID inválido.'
		});
	}

	const categoria = db.prepare(
		'SELECT * FROM categoria WHERE id_categoria = ?'
	).get(id);

	if (!categoria) {
		return res.status(404).json({
			erro: 'Categoria não encontrada.'
		});
	}

	res.json(categoria);
});

router.post('/', (req, res) => {
	const { nome, descricao } = req.body;

	if (
		typeof nome !== 'string' ||
		!nome.trim() ||
		(descricao !== undefined && descricao !== null && typeof descricao !== 'string')
	) {
		return res.status(400).json({
			erro: 'Informe um nome válido e uma descrição textual para a categoria.'
		});
	}

	const resultado = db.prepare(`
		INSERT INTO categoria (nome, descricao)
		VALUES (?, ?)
	`).run(nome.trim(), descricao ?? null);

	const categoria = db.prepare(
		'SELECT * FROM categoria WHERE id_categoria = ?'
	).get(resultado.lastInsertRowid);

	res.status(201).json(categoria);
});

router.put('/:id', (req, res) => {
	const id = Number(req.params.id);

	if (!Number.isInteger(id) || id <= 0) {
		return res.status(400).json({
			erro: 'ID inválido.'
		});
	}

	const existente = db.prepare(
		'SELECT * FROM categoria WHERE id_categoria = ?'
	).get(id);

	if (!existente) {
		return res.status(404).json({
			erro: 'Categoria não encontrada.'
		});
	}

	const { nome, descricao } = req.body;

	if (
		typeof nome !== 'string' ||
		!nome.trim() ||
		(descricao !== undefined && descricao !== null && typeof descricao !== 'string')
	) {
		return res.status(400).json({
			erro: 'Informe um nome válido e uma descrição textual para a categoria.'
		});
	}

	db.prepare(`
		UPDATE categoria
		SET nome = ?, descricao = ?
		WHERE id_categoria = ?
	`).run(nome.trim(), descricao ?? null, id);

	const categoriaAtualizada = db.prepare(
		'SELECT * FROM categoria WHERE id_categoria = ?'
	).get(id);

	res.json(categoriaAtualizada);
});

router.delete('/:id', (req, res) => {
	const id = Number(req.params.id);

	if (!Number.isInteger(id) || id <= 0) {
		return res.status(400).json({
			erro: 'ID inválido.'
		});
	}

	let resultado;

	try {
		resultado = db.prepare(
			'DELETE FROM categoria WHERE id_categoria = ?'
		).run(id);
	} catch (erro) {
		return res.status(409).json({
			erro: 'Não é possível excluir uma categoria que possui produtos vinculados.'
		});
	}

	if (resultado.changes === 0) {
		return res.status(404).json({
			erro: 'Categoria não encontrada.'
		});
	}

	res.json({
		mensagem: 'Categoria excluída com sucesso.'
	});
});

module.exports = router;
