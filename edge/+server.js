/*! ander <anderpang@qq.com> 2016/3/15 */
"use strict";
var path=require("path"),
    spawn=require("child_process").spawn,
    child;

function _start(){
    child=spawn("node",[path.join(__dirname,"lib","child.js")]);

    child.stdout.setEncoding('utf8'); 
    child.stderr.setEncoding('utf8');

    child.stdout.on("data",function(data){ 
      console.log(data); 
    }); 

    child.stderr.on("data",function(data) { 
       console.log("\x1b[31mERROR\x1b[0m:\n"+data); 
       restart();
    }); 

    child.on("exit",function(code, signal) {
      if(code===99)
      {
        process.nextTick(_start);
        console.log("\x1b[44m Ready to restart... \x1b[0m ");
      }
      else
      {
       console.log("\x1b[44m Server was closed! \x1b[0m");
      }
   });

    console.log("\x1b[44m Listening... \x1b[0m");
}

function restart(){
  child.kill();  
}

function start(){
  _start();

  process.on("uncaughtException",function(err){
    console.log("\x1b[31Main process\x1b[0m:\n",err);
    restart();
  });
}

start();