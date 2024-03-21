const root_controller = require('../controllers/root');

module.exports = (app) => {
    app.route('/').get(root_controller.index)
}
