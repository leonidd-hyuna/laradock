'use strict';


const mysql = require('mysql');

var os = require("os");
var async = require('async');
var spawn = require('child_process').spawn;
const config = Object.freeze(require('plain-config')());
const bunyan = require('bunyan');
const sleep = require('sleep');
global.logger = bunyan.createLogger(config.getBunyanConf('server'));

const jobList = [
  [ // Main medias
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=game', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=movie', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=audiobook', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=book', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=album', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=song', '--conf=' + config.globalPath]
  ],
  [ // Genres
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=genre.album', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=genre.audiobook', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=genre.book', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=genre.game', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=genre.movie', '--conf=' + config.globalPath]
  ],
  [ // People
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=people.game_developer', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=people.movie_actor', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=people.movie_director', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=people.movie_producer', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=people.movie_writer', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=people.album_artist', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=people.audiobook_author', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=people.audiobook_narrator', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=people.book_artist', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=people.book_author', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=people.song_artist', '--conf=' + config.globalPath]
  ],
  [ // Playlists. they have to run last, since they base themselves on the data from the main media
    // [config.globalBasePath + 'task_master_playlist.js', '--strict', '--indexType=playlist.movie', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master_playlist.js', '--strict', '--indexType=playlist.audiobook', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master_playlist.js', '--strict', '--indexType=playlist.book', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master_playlist.js', '--strict', '--indexType=playlist.song', '--conf=' + config.globalPath]
  ],
  [ // Basic indexes
    [config.globalBasePath + 'task_master.js', '--strict', '--indexType=language', '--conf=' + config.globalPath],
    [config.globalBasePath + 'task_master.js', '--strict', '--indexType=sites', '--conf=' + config.globalPath]
  ],
  [ // Tags
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=tag.album', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=tag.song', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=tag.audiobook', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=tag.book', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=tag.game', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=tag.movie', '--conf=' + config.globalPath]
  ],
  [ // Keywords
    [config.globalBasePath + 'task_master.js', '--strict', '--indexType=keyword.albums', '--conf=' + config.globalPath],
    [config.globalBasePath + 'task_master.js', '--strict', '--indexType=keyword.songs', '--conf=' + config.globalPath],
    [config.globalBasePath + 'task_master.js', '--strict', '--indexType=keyword.movies', '--conf=' + config.globalPath],
    [config.globalBasePath + 'task_master.js', '--strict', '--indexType=keyword.books', '--conf=' + config.globalPath],
    // [config.globalBasePath + 'task_master.js', '--strict', '--indexType=keyword.audiobooks', '--conf=' + config.globalPath],
    [config.globalBasePath + 'task_master.js', '--strict', '--indexType=keyword.games', '--conf=' + config.globalPath]
  ]
];

var connection;

// Flag to tell if a given database is a slave or not.
var isSlave = true;


// Example of extending standard Errors in JS.
// Similar to PHP.You can check for the error type using instanceof

class SlaveDelay extends Error {
  constructor(numberOfSeconds) {
    super('Slave is delayed:' + numberOfSeconds);
  }
}

// The main controller

const SBM_max = 0; // Max delay allowed in seconds
const RunDelay = 4 * 60 * 60 * 1000; // How often should it loop as daemon

var lastRun = 0; // Holds the timestamp of last run
var running = 0; // Semaphore to show running state.

setInterval(function() {
  var d = Date.now();
  if((d > lastRun + RunDelay) && running === 0) {	// Are we ready to run ?
    logger.info('Starting');
    running = 1;
    main(function(err, result) {
      if(err) {
        logger.error(err); // If we've got an error, print it
      }

      running = 0;
      if(err instanceof SlaveDelay === false) {
        lastRun = Date.now();
      } else if (err) {
        logger.error(err); // If we've got an error, print it
      }

      logger.info('Done...');
    });
  }
}, 30 * 1000); // Loops every 30 seconds. Could run more often if needed.s


function main(callback_top) {
  // Runs a single loop
  async.waterfall([	// **** First level, manages connection and status check
    function(callback) {
      connection = mysql.createConnection(config.mysql);
      // Establish connection and continue only if successful
      connection.connect(function(err) {
        callback(err);
      });
    },
    function(callback) {
      // Wait 30s before reading slave delay (it remains at 0 for a bit when the replication is restarted)
      logger.info('Going to sleep, waiting for replication lag');
      sleep.sleep(30);
      logger.info('Ready to read replication lag');
      // Show slave status
      connection.query('SHOW SLAVE STATUS', function(err, result) {
        if (err) {
          // Bail out if failed
          return callback(err);
        }

        if(result.length === 0) {
          // Bail out if result is empty. Master returns nothing for this query
          logger.warn('Database is not a slave. Continue');
          isSlave = false;
          return callback(null);
        }

        if (result[0]['Seconds_Behind_Master'] <= SBM_max) {
          // Cool
          return callback(null);
        } else {
          // Not Cool. SBM too high
          return callback(new SlaveDelay(result[0]['Seconds_Behind_Master']));
        }
      });
    },
    function(callback) {
      doTasks(function(err, result) {
        return callback(err, result);
      });
    }
  ], function(err, result) {
    // Closing connection like a good boy scout
    connection.end();
    callback_top(err, result);
  });
}

// Executes the block of tasks
function doTasks(cb) {
  var tasks = [];
  jobList.forEach(function(list) {
    list.forEach(function(param) {
      tasks.push(function(callback) {
        var child = spawn('node', param);
        var err;
        child.stdout.on('data', function(data) {
          logger.info(data);
        });
        child.stderr.on('data', function(data) {
          logger.error(data);
          err = new Error(data);
        });
        child.on('close', function(code) {
          return callback(err, code);
        });
      });
    });
  });

  async.series(tasks, function(err, results) {	// **** Third level, actual logic
    if (err) {
      logger.error(err);
    }

    logger.info('Tasks Done');
    cb(err, results);
  });
}

/**
 * simple function to manage the replication command
 * @param  boolean  start Flag to tell if we have to start or stop the replication
 * @param  callback cb    Callback
 */
function manageMysqlReplication(start, cb)
{
  if (isSlave === false) {
    // If we don't have a slave, there is nothing to do
    return cb(null);
  }

  var reg = new RegExp('^.*\-(us|eu)\-.*$');
  // var matchPath = os.hostname().match(reg);
  var matchPath = config.mysql.host.match(reg);
  var cmd = '';
  if (matchPath === null) {
    // If it's null, it means the regexp was not found, meaning it's a regular mysql, not a rds one.
    if (start === true) {
      cmd = config.mysqlReplication.start.ec2;
    } else {
      cmd = config.mysqlReplication.stop.ec2;
    }
  } else {
    if (start === true) {
      cmd = config.mysqlReplication.start.rds;
    } else {
      cmd = config.mysqlReplication.stop.rds;
    }
  }

  var connection = mysql.createConnection(config.mysql);
  connection.query(cmd, function(e, result) {
    if (e) {
      logger.error(e); // Only displaying error if starting replication failed.
      return cb(e);
    }

    logger.info('successfully called the command ' + cmd + ' for the replication.');
    return cb(null);
  });
  connection.end();
}

process.on('SIGINT', function() {
    logger.info("Caught interrupt signal");

    manageMysqlReplication(true, function(err) {
      if (err) {
        logger.error(err); // Only displaying error if starting replication failed.
        process.exit(666);
      } else {
        logger.info('successfully restarted the replication.');
        process.exit(0);
      }
    });
});
