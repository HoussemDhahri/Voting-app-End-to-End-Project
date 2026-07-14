const express = require('express');
const async = require('async');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const client = require('prom-client');


const app = express();

const server = http.Server(app);

const io = socketIo(server);


const port = process.env.PORT || 4000;


// ==========================
// Prometheus Metrics
// ==========================

const register = new client.Registry();

client.collectDefaultMetrics({
  register
});


const resultRequestsCounter = new client.Counter({
  name: 'result_requests_total',
  help: 'Total number of result page requests'
});


const resultErrorsCounter = new client.Counter({
  name: 'result_errors_total',
  help: 'Total number of result processing errors'
});


const resultQueryDuration = new client.Histogram({
  name: 'result_query_duration_seconds',
  help: 'Time spent querying PostgreSQL'
});


register.registerMetric(resultRequestsCounter);
register.registerMetric(resultErrorsCounter);
register.registerMetric(resultQueryDuration);



// ==========================
// Socket.IO
// ==========================

io.on('connection', (socket) => {

  console.log('Client connected');


  socket.emit('message', {
    text: 'Welcome!'
  });


  socket.on('subscribe', (data) => {

    socket.join(data.channel);

  });


});



// ==========================
// PostgreSQL Connection
// ==========================

const pool = new Pool({

  host: process.env.POSTGRES_HOST,

  user: process.env.POSTGRES_USER,

  password: process.env.POSTGRES_PASSWORD,

  database: process.env.POSTGRES_DB,

  port: 5432

});



// ==========================
// Wait For Database
// ==========================

async.retry(

  {
    times: 1000,
    interval: 1000
  },


  function(callback){


    pool.connect()

      .then((client)=>{

        client.release();

        callback(null);

      })


      .catch((err)=>{

        console.log('Waiting for db');

        callback(err);

      });


  },


  function(err){


    if(err){

      console.error('Giving up');

      process.exit(1);

    }


    console.log('Connected to db');


    getVotes();


  }

);




// ==========================
// Get Votes
// ==========================

async function getVotes(){


  const endTimer = resultQueryDuration.startTimer();


  try{


    const result = await pool.query(

      'SELECT vote, COUNT(id) AS count FROM votes GROUP BY vote'

    );


    endTimer();


    const votes = collectVotesFromResult(result);


    console.log('Votes:', votes);


    io.sockets.emit(

      'scores',

      JSON.stringify(votes)

    );


  }


  catch(err){


    endTimer();


    resultErrorsCounter.inc();


    console.error(

      'Error performing query:',
      err

    );


  }


  finally{


    setTimeout(

      getVotes,

      1000

    );


  }


}




function collectVotesFromResult(result){


  const votes = {

    a:0,

    b:0

  };


  result.rows.forEach((row)=>{


    votes[row.vote] = parseInt(row.count);


  });


  return votes;


}



// ==========================
// Middleware
// ==========================

app.use(cookieParser());


app.use(express.urlencoded({

  extended:true

}));


app.use(express.static(

  path.join(__dirname,'views')

));




// ==========================
// Health Check
// ==========================

app.get('/health',(req,res)=>{


  res.status(200).json({

    status:'UP'

  });


});




// ==========================
// Metrics
// ==========================

app.get('/metrics',async(req,res)=>{


  res.set(

    'Content-Type',

    register.contentType

  );


  res.end(

    await register.metrics()

  );


});




// ==========================
// Result Page
// ==========================

app.get('/',(req,res)=>{


  resultRequestsCounter.inc();


  res.sendFile(

    path.join(

      __dirname,

      'views',

      'index.html'

    )

  );


});




// ==========================
// Start Server
// ==========================

server.listen(port,()=>{


  console.log(

    `Result app running on port ${port}`

  );


});