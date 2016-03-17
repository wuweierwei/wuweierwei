/*! ander <anderpang@qq.com> 2016/3/15 */
"use strict";
var fs=require("fs"),
    path=require("path"),
    config=require("../config"),
    compress=require("./compressor"),
    charset=config.charset||"utf8";

  function watch(realpath,outpath){
     var files=fs.readdirSync(realpath),changeList={},timer=0;
     if(!outpath)outpath=path.dirname(realpath);
     
     var watcher=fs.watch(realpath,function(type,name){
       if(!name)return; 

       if(type==="rename")
       {
           //文件夹改名
           var cpath=path.join(realpath,name);
           if(fs.existsSync(cpath)&&fs.lstatSync(cpath))
           {
               process.exit(99);
               return;
           }
       }

       if(type==="change")
       {
         //判断是否新建文件夹或改文件夹名
         var child_realpath=path.join(realpath,name);
         if(fs.lstatSync(child_realpath).isDirectory())
         {
            process.exit(99);
            return;
         }
         var ext=path.extname(name),src,out;
         clearTimeout(timer);  //禁止触发两次
         if(ext===".js")
         {
           if(!changeList.hasOwnProperty(name))
           {
             if(checkOutPath(outpath))
             {
               changeList[name]=[                
                  path.join(realpath,name),
                  path.join(outpath,name),
                  charset,
                  "js"               
               ];
             }
             else
             {
                console.log("Not found the path:\x1b[41m",outpath,"\x1b[0m");
             }
           }          
         }
         else if(ext===".css")
         {
           if(!changeList.hasOwnProperty(name))
           {
             if(checkOutPath(outpath))
             {
               changeList[name]=[                
                  path.join(realpath,name),
                  path.join(outpath,name),
                  charset,
                  "css"               
               ];
             }
             else
             {
               console.log("Not found the path:\x1b[41m",outpath,"\x1b[0m");
             }
           }              
         }
         timer=setTimeout(function(){
             Object.keys(changeList).forEach(function(name){
                 compress.apply(null,changeList[name]);
             });             
             changeList={};
         },100);
       }
     });
     files.forEach(function(file){
       var child_realpath=path.join(realpath,file);
       fs.lstatSync(child_realpath).isDirectory()&&watch(child_realpath,path.join(outpath,file));
     });  
  }

  function checkOutPath(outpath){
    if(fs.existsSync(outpath))return true;

    var paths=[outpath],dirname,i;
    dirname=path.dirname(outpath);
    while(!fs.existsSync(dirname))
    {
      paths.push(dirname);
      dirname=path.dirname(outpath);
    }
    i=paths.length;

    try
    {
      while(i--)
      {      
        fs.mkdirSync(paths[i]);  //window返回值为undefined
      }
    }
    catch(e)
    {
      return false;
    }
    
    return true;
  }

  fs.lstat(config.path,function(err,stat){
    if(err)
    {
      console.log("\x1b[41m 未能找到config.js文件中配置的path路径！\x1b[0m");
    }
    else
    {
      if(stat.isDirectory())
      {
        fs.realpath(config.path,function(err,realpath){
           watch(realpath);
        });
      }
      else
      {
        console.log("\x1b[41m config.js文件中,path配置必须是文件夹！\x1b[0m");
      }
    }
  });
