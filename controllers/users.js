const User = require('../models/user');
const logger = require('../utils/logger');

const list_user = (req, res) => {
    User
        .find({})
        .select('username')
        .then(users => {
            res.json(users);
        })
        .catch(err => {
            logger.error(err);
            res.status(400).send(err.errors);
        });
}

const get_user = (req, res) => {
    User.findById(req.params.userId)
        .then(user => {
            res.json(user);
        })
        .catch(err => {
            logger.error(err);
            res.status(400).send(err.errors);
        });
}