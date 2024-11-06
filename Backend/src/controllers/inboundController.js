
const InboundService = require('../services/inboundService');

class InboundController {
    async createDraft(req, res) {
        try {
            const draft = await InboundService.createDraft(req.body, req.user._id);
            res.status(201).json({ status: true, data: draft, err: {} });
        } catch (error) {
            console.log(error)
            res.status(400).json({ status: false, data: {}, err: error.message });
        }
    }

    async getAllInbound(req, res) {
        try {
            const { page, limit, filters } = req.body;
            const result = await InboundService.getAllInbound(page, limit, filters);
            res.status(201).json({ status: true, data: result, err: {} });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getDraftById(req, res) {
        try {
            const draft = await InboundService.getDraftById(req.params.id);
            if (draft) {
                res.json({ status: true, data: draft, err: {} });
            } else {
                res.status(404).json({ status: false, data: {}, err: 'Draft not found' });
            }
        } catch (error) {
            res.status(400).json({ status: false, data: {}, err: error.message });
        }
    }

    async updateDraft(req, res) {
        try {
            const draft = await InboundService.updateDraft(req.params.id, req.body, req.user._id);
            if (draft) {
                res.json({ status: true, data: draft, err: {} });
            } else {
                res.status(404).json({ status: false, data: {}, err: 'Draft not found' });
            }
        } catch (error) {
            res.status(400).json({ status: false, data: {}, err: error.message });
        }
    }

    async completeDraft(req, res) {
        try {
            const result = await InboundService.completeDraft(req.params.id, req.user._id);
            if (result) {
                res.json({ status: true, data: result, err: {} });
            } else {
                res.status(404).json({ status: false, data: {}, err: 'Draft not found' });
            }
        } catch (error) {
            console.log(error)
            res.status(400).json({ status: false, data: {}, err: error.message });
        }
    }

    async cancelDraft(req, res) {
        try {
            const result = await InboundService.cancelDraft(req.params.id, req.user._id);
            if (result) {
                res.json({ status: true, data: result, err: {} });
            } else {
                res.status(404).json({ status: false, data: {}, err: 'Draft not found' });
            }
        } catch (error) {
            res.status(400).json({ status: false, data: {}, err: error.message });
        }
    }
}

module.exports = new InboundController();