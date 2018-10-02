module.exports = function (app) {
  
  let base_url = '/api';

  app.use(base_url+'/patients', require('./patients'));
  app.use(base_url+'/users', require('./users'));

}