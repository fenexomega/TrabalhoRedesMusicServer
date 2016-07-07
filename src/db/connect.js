var Sequelize = require('sequelize');
var sequelize = new Sequelize('mysql://root:root@localhost:3306/dbApp');

function generateDAO()
{
  testConenction();
  var Song = sequelize.define('song',
  {
    number:{
      type: Sequelize.STRING
    },
    title:{
        type: Sequelize.STRING
    },
    artist:{
      type: Sequelize.STRING
    }
  },
  {
    freezeTableName: true
  });

  var Album = sequelize.define('album',{
      title:{
        type: Sequelize.STRING,
      },
      artist:{
        type: Sequelize.STRING
      },
      year:{
        type: Sequelize.STRING
      }
  },
  {
    freezeTableName: true
  });

  Song.belongsTo(Album);



  return [Song,Album];

}

function sync(func)
{
  sequelize.sync().then(function(err){
    func();
  });
}

function testConenction()
{
  sequelize.authenticate()
  .then(function(err){
    console.log("Conexão esbelecida com sucesso");
  })
  .catch(function(err){
    console.log('Unable to connect to databse',err);
  });
}
generateDAO();
// testConenction()

exports.generateDAO = generateDAO;
exports.sync =  sync;
