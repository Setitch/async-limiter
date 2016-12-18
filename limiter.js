/**
 * Created by Seti the Dragon on 2016-12-17.
 */
"use strict";

var q = require('q');

/**
 * @param func function
 * @param tasks array of parameters for each tast to be executed
 * @param limit number of parallel executions
 * @returns {*|promise}
 */
function limiter (func, tasks, limit) {
    var deferred = q.defer();
    
    // fix limit to be 1 or more
    if (limit === undefined || limit === null || limit <= 0) limit = 1;
    // actual running functions
    var running = 0;
    // queue count
    var queue = tasks.length;
    // finished tasks
    var finished = 0;
    // errored tasks
    var errors = 0;
    
    
    var _errors = [];
    var _rets = [];
    
    // keep all running or finish the promise
    function run() {
        if (running > limit) return;
        
        if (tasks.length > 0) {
            var task = tasks.splice(0,1);
            ++running;
            func(task, doDone, doError);
        } else {
            if (inv) clearInterval(inv);
            if (_errors.length > 0) {
                deferred.reject(_errors);
            }
            deferred.resolve(_rets);
        }
    }
    
    // react on error in task
    function doError(err) {
        --running;
        ++errors;
        ++finished;
        _errors.push(err);
        deferred.notify([finished, errors, queue]);
    }
    
    // react on finished task
    function doDone(ret) {
        --running;
        ++finished;
        _rets.push(ret);
        deferred.notify([finished, errors, queue]);
    }
    
    // run tasks
    var inv = setInterval(run, 100);
    
    // return promise
    return deferred.promise;
}

// register limiter
module.exports = limiter;
