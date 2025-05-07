const { LOGOUT_LINKS } = require('../constants/navigation');
const logger = require('../utils/logger');

const cartController = require('./cartController');

exports.getLogoutView = (request, response) => {
  const cartCount = cartController.getProductsCount();

  response.render('logout.ejs', {
    headTitle: 'Shop - Logout',
    path: '/logout',
    activeLinkPath: '/logout',
    menuLinks: LOGOUT_LINKS,
    cartCount,
  });
};

exports.killApplication = (request, response) => {
  logger.getProcessLog();

  if (process.env.ELECTRON_RUN_AS_NODE) {
    response.send('Application will be closed.');

    setTimeout(() => {
      process.exit();
    }, 300);
  } else {
    process.exit();
  }
};
