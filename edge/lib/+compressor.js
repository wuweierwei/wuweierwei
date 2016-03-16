/*! ander <anderpang@qq.com> 2016/3/15 */
"use strict";
var spawn=require("child_process").spawn,
    fs=require("fs"),
    path=require("path"),
    cssRule=require(__dirname+"/cssRule"),
    jar;
 
 fs.readdirSync(__dirname).some(function(file){
   if(path.extname(file)===".jar"){
     jar=path.join(__dirname,file);
     return true;
   }
 });
function compress(src,out,charset,type){
  
   var args=["-jar",jar,"--charset",charset,"--type",type,"-o",out],cp,txt;
    if(type==="css")
    {
       var keyframes=[];
          
       txt=fs.readFileSync(src,charset);
       cp=spawn("java",args);

       txt=cssRule.keyframes.out(txt,keyframes); //先把@keyframes给提出来
       
       cssRule.rules.forEach(function(rule){
         txt=txt.replace(rule.reg,rule.fn);
       });
       
       txt=cssRule.keyframes.put(txt,keyframes); //先把@keyframes填进去
       
       keyframes=null;

       cp.stdin.write(txt);         
    }
    else
    {
      args.push(src);
      cp=spawn("java",args);
    }

    cp.stdout.on('data', function(data){
      cp.stdin.write(data);
    });

    cp.stderr.on('data',function(data){
      console.log("process stderr:", data);
    });

    cp.on("end",function(){       
       cp.exit();
    });
    cp.on("exit",function(){
      console.log("\x1b[32m Success\x1b[0m :",src,"->",out);
    });

    cp.stdin.end();  
    
}
module.exports=compress;