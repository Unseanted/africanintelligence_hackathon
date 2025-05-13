const { clg,mrgarrays,cloneo,clonea } = require('../routes/basics');
const { Bar } = require('./globalServices');

let cloud=require('@google-cloud/storage'),store=new cloud.Storage({keyFilename:'./configs/ros-docs-f0eefa8215b2.json'}),bkl={};


async function publicbucket(o,fnc){
    if(!bkl[o.b])return;
    await store.bucket(o.b).makePublic().then(ob=>{if(fnc)fnc(ob);});
    clg(o.b+" was made public successfully!!")
}
async function mountbucket(b,fnc){
    if(bkl[b])return;
    newbucket(b,fnc);
    
}
async function uploadfile(o,cb){clg(o);
    if(!bkl[o.b])return;
    try{var lnk=await store.bucket(o.b).upload(o.pth,{destination:o.f}).then(ob=>{if(cb)cb(ob);});clg('file uploaded!!');}catch(err){clg(err);cb();}
    
}
async function writesignedurl(o,fnc){
    if(!bkl[o.b])return;
    var op={version:'v4',action:'write',contentType:'application/octet-stream',expires:Date.now()+((1000*365)*60*60)},lnk=await store.bucket(o.b).file(o.f).getSignedUrl(op).then(ob=>{if(fnc)fnc(lnk)});
    
}
async function readsignedurl(o,fnc){
    if(!bkl[o.b])return;
    var op={version:'v4',action:'read',expires:Date.now()+(1000*60*60)},lnk=await store.bucket(o.b).file(o.f).getSignedUrl(op).then(ob=>{if(fnc)fnc(lnk);});
    
}
async function addbucketlife(o){
    if(!bkl[o.b])return;
    var mg=await store.bucket(o.b).addLifecycleRule({action:o.a,condition:o.c});
    
    clg(mg.lifecycle.rule)
}
async function downbucketfile(o,fn){
    if(!bkl[o.b]){if(fn)fn('',true);return;}
    var ov={destination:o.d};try{await store.bucket(o.b).file(o.f).download(ov);if(fn)fn(o);clg(o.f+' downloaded to '+o.d+' successfully!!');}catch(err){clg(err);if(fn)fn('',true);};
}
async function filelist(cb,bc){
    if(!bkl[bc.b])return;
    var a=[],ba=await store.bucket(bc.b).getFiles();
    if(ba[0])for(var i in ba[0]){a.push(ba[0][i].name);}
    if(cb)cb(a,bc);
}
async function bucketlist(cb,bc){
    try {var a=[],ba=await store.getBuckets();if(ba[0])for(var i in ba[0]){a.push(ba[0][i].name);};bkl=mrgarrays(a,a);if(cb)cb(a,bc);clg('bucket list called successfully...');}catch(err){clg('bucket list error!!!');};
}
async function removebucket(b,fnc){
    if(!store||typeof b!='string')return;
    var bk=await store.bucket(b).delete();
    if(fnc)fnc();
    clg('bucket removed!!')
}
async function newbucket(b,fnc){
    if(!store||typeof b!='string'||bkl[b])return;
    var bk=await store.createBucket(b).then(ob=>{});
    bkl[b]=b;
    publicbucket({b:b});
    clg(b+' bucket was created successfully!!');
    if(fnc)fnc();
}
function bucketdey(a,b){
    var k=mrgarrays(a,a);
    if(k[b.n]){if(b.f)b.f(b.n);}else{b.f()}
    
}
function chkbar(){
    var ba,ar,ct=0,x;
    bucketlist(doam);
    async function doam(a){
        ar=mrgarrays(a,a);ba=clonea(Bar);x=mrgarrays(ba,ba);
        for(var i in x){
            if(ar[i])continue;
            await newbucket(i);
            
        }
    }
}
function pubbuckets(){
    if(!ocn(bkl))return;
    for(var i in bkl)publicbucket({b:i});
    
}
function deletefile(o,fnc){
    filelist(conti,o);
    async function conti(v){
        var a=mrgarrays(v,v);if(!a[o.f]){clg(o.f+' is not available');if(fnc)fnc();return;}
        await store.bucket(o.b).file(o.f).delete();
        clg(o.f+' deleted successfully!!');
        
    }
}
function publicfile(o,fnc){
    if(!bkl[o.b])return;
    filelist(conti,o);
    async function conti(v){
        var a=mrgarrays(v,v);if(!a[o.f]){clg(o.f+' is not available');return;}
        await store.bucket(o.b).file(o.f).makePublic().then(ob=>{if(fnc)fnc(ob);});
        clg(o.f+' made public!!');
    }
    
}


function init(){
    chkbar();
}


module.exports={
    init,downbucketfile,uploadfile,publicfile,deletefile
}