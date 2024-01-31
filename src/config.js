//Database connection file
const { MongoClient } = require ('mongodb');
//The cluster name is test, and the three colletions are called users, cards, and notes
/*To run this code on your localhost server, make a database cluster with the following names,
 and replace the uri below with your own database's connection string.
*/ 
const uri = "mongodb+srv://uwuzuu_:76545678293045659487@clusterproject.aiqjysy.mongodb.net/?retryWrites=true&w=majority";
let dbConnection;
module.exports = {
    //Establishes connection to the database.
    connectToDb: (cb) => {
        MongoClient.connect(uri)
        .then((client) =>{
            dbConnection = client.db()
            return cb()
        })
        .catch((err) =>{
            console.log(err)
            return cb(err)
        })
    },
    //Returns connection to the database.
    getDb: () => dbConnection
}
//The logic of this system is from Youtube: NetNinja MongoDB series.
/* Credits: https://www.youtube.com/playlist?list=PL4cUxeGkcC9h77dJ-QJlwGlZlTd4ecZOA 
https://www.youtube.com/watch?v=C_vv1D5oDZ0
*/
