/*! ander <anderpang@qq.com> 2016/3/15 */
"use strict";
var _WEBKIT_="-webkit-",
    _MOZ_="-moz-",
   _O_="-o-";

var transformReg=/\btransform(?:-[^:]+?)*:[^;\}]+?(?=;|\})/mg;

//通用的，直接在前面加前缀
function _usually(a){
  var out=`${_WEBKIT_}${a};
    ${_MOZ_}${a};
    ${_O_}${a};
    ${a}`;
  
  return out;
}

//处理css transition:transform 1s;
function _transition(transition){
   var reg=/\btransform\b/,left,right,out;
   
   if(reg.exec(transition))
   {
        left=RegExp["$`"];
        right=RegExp["$'"];

       out=`${_WEBKIT_}${left}${_WEBKIT_}transform${right};
           ${_MOZ_}${left}${_MOZ_}transform${right};
           ${_O_}${left}${_O_}transform${right};
           ${transition}`;
   }
   else
   {
       out=`${_WEBKIT_}${transition};
            ${_MOZ_}${transition};
            ${_O_}${transition};
            ${transition}`;
       
   }
    return out;
}

//处理背景渐变
function _gradient(a,b,c){
     var out=`${b}${_WEBKIT_}${c};
                 ${b}${_MOZ_}${c};
                 ${b}${_O_}${c};
                 ${a}`;
       return out;
}


var css={};

  css.rules=[
  {
    reg:/\btransition(?:-[^:]+?)*:[^;\}]+?(?=;|\})/mg,  //transition
    fn:_transition
  },
  {
    reg:regCompile(/\banimation(?:-[^:]+?)*:[^;\}]+?(?=;|\})/mg),  //animation
    fn:_usually
  },
  {
      reg:transformReg,                         //transform
      fn:_usually
  },
  {
    reg:/\b(background(?:-image)*\s*:)\s*(linear-gradient\s*\([\s\S]*?)(?=;|\})/mg,  //linear-gradient
    fn:_gradient
  },
  {
    reg:/\b(background(?:-image)*\s*:)\s*(radial-gradient\s*\([\s\S]*?)(?=;|\})/mg,  //radial-gradient
    fn:_gradient
  },
  {
      reg:/\buser-select\s*:[^;\}]+?(?=;|\})/mg,      //user-select
      fn:_usually
  }
];

//处理 @keyframes
css.keyframes={
    reg:/@keyframes\s+[^{]+?\{(?:\{[^}]*?\}|[^}])*\}/mg,
    _dispose:function(a){
      var out=[],a1=a.substr(1);
      out.push(this._tmpl(_WEBKIT_,a1));
      out.push(this._tmpl(_MOZ_,a1));
      out.push(this._tmpl(_O_,a1));
      out.push(a);
      return out.join("");
    },
    _tmpl:function(prefix,a1){
        a1=a1.replace(transformReg,function(a){
            return prefix+a;
        });
       return `@${prefix}${a1}`;
    },
    out:function(txt,arr){
       var that=this;
       return txt.replace(that.reg,function(a){
           var idx=arr.length;
            arr.push(that._dispose(a));

           return "${keyframes__"+idx+"}";
       });
    },
    put:function(txt,arr){
       return txt.replace(/\$\{keyframes__(\d+)\}/mg,function(a,idx){
            return arr[idx];
        });
    }
};

module.exports=css;
