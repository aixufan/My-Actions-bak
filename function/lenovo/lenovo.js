 // const exec = require('child_process').execSync
 // const fs = require('fs')

 // const $ = new Env('联想智选签到');
 // const notify = $.isNode() ? require('../sendNotify') : '';
 const notify =  require('../sendNotify') 

 //let result = "【联想延保每日签到】：\n"
 result = ""
 const accounts = process.env.accounts
 // const password =process.env.password
 // const SEND_KEY = process.env.SEND_KEY
 const SEND_KEY = 1

 const CryptoJS= require('crypto-js');
 const baseinfo =process.env.baseinfo?process.env.baseinfo:"eyJpbWVpIjoiODY1MzE1MDMxOTg1ODc4IiwicGhvbmVicmFuZCI6Imhvbm9yIiwicGhvbmVNb2RlbCI6IkZSRC1BTDEwIiwiYXBwVmVyc2lvbiI6IlY0LjIuNSIsInBob25laW5jcmVtZW50YWwiOiI1NTYoQzAwKSIsIlBhZ2VJbmZvIjoiTXlJbmZvcm1hdGlvbkFjdGlvbkltcGwiLCJwaG9uZWRpc3BsYXkiOiJGUkQtQUwxMCA4LjAuMC41NTYoQzAwKSIsInBob25lTWFudWZhY3R1cmVyIjoiSFVBV0VJIiwibGVub3ZvQ2x1YkNoYW5uZWwiOiJ5aW5neW9uZ2JhbyIsImxvZ2luTmFtZSI6IjE3NjQwNDA4NTM3IiwicGhvbmVwcm9kdWN0IjoiRlJELUFMMTAiLCJzeXN0ZW1WZXJzaW9uIjoiOC4wLjAiLCJhbmRyb2lkc2RrdmVyc2lvbiI6IjI2In0="
 const $http=require("axios")
 const parsedWordArray = CryptoJS.enc.Base64.parse(baseinfo);
 const info=JSON.parse(parsedWordArray.toString(CryptoJS.enc.Utf8))
 let deviceid = info.imei
 const url = {
     "login": `https://uss.lenovomm.com/authen/1.2/tgt/user/get?msisdn=`,
     "session": "https://api.club.lenovo.cn/users/getSessionID?s=8091b7729079682e9a58f609035619625b984e3a2d2b229caf45c7108b37221864b1cd92353716a721f8a240b455740951002d5cdfe3bd723c6e5a35f7bd6f2ffa955e1edf92d0a82274805efb604d602ac2900470589637e65903b9c136e458d6e6c581433bdc857f10fba9e615e3fea1ddb98a2cd86f1a828c03630c96155f3bda0b12c963868f80fc791fab1edcc1dda8a25c5722e5ec521b6050605e0da191edcfabf3d3d5412391dc77cd7ddbda89cb1abf4a0e6da165394d96b546a578c2577df88d04f6cb55d37ed4bcda03c9844a728dedc1c09558e3d08a4c2c89281ca2500ee5d9a67bd66edc6866e86114d6f2e447efbfad104461c0f75be2d9461047434315e57febbae78a30500f27ae25b3ea33a7dc50c16a50fa7fa900ca0a",
     "sign1": "https://api.club.lenovo.cn/common/signin/add",
     "sign2": "https://api.club.lenovo.cn/signin/v2/add"
 }
 let lpsutgt = ""
 headers = {
     baseinfo: baseinfo,
     unique: deviceid,
     "User-Agent": "LenovoClub/4.1.2 (iPad; iOS 13.6; Scale/2.00)",
     token: "",
     //"User-Agent":"Apache-HttpClient/UNAVAILABLE (java 1.5)",
     Authorization: ""
 }

 function lxlogin(uname,pwd) {
     return new Promise(async (resolve) => {
         try {
             let data = `lang=zh-CN-%23Hans&source=android%3Acom.lenovo.club.app-V4.2.5&deviceidtype=mac&deviceid=${deviceid}&devicecategory=unknown&devicevendor=${info.phoneManufacturer}&devicefamily=unknown&devicemodel=${info.phoneModel}&osversion=${info.systemVersion}&osname=Android&password=${pwd}`
             let loginurl = url["login"] + uname
             let res = await $http.post(loginurl, data);
             let lpsutgt = res.data.match(/<Value>(.+?)<\/Value>/)
             if (lpsutgt) {
                 let res2 = await $http.get(`https://uss.lenovomm.com/authen/1.2/st/get?lpsutgt=${lpsutgt[1]}&source=ios%3Alenovo%3Aclub%3A4.1.0&lang=zh-CN&realm=club.lenovo.com.cn`)
                 let lpsutgt2 = res2.data.match(/<Value>(.+?)<\/Value>/)
                 lpsutgt = lpsutgt2 ? lpsutgt2[1] : null
             }
             //预约游戏id
             result += "登陆成功！||"
             //console.log("login：" + lpsutgt)
             resolve(lpsutgt);
         } catch (err) {
             console.log("登录失败，错误信息：")
             console.log(err.response);
             lpsutgt = null
             result += "登陆失败！||"
         }
         resolve();
     });
 }

 function getsession(lpsutgt) {
     return new Promise(async (resolve) => {
         //  let json =""
         try {
             headers.Authorization = "Lenovosso " + lpsutgt
             headers["token"] = headers.Authorization + "=="
             let res3 = await $http.get(url["session"], {
                 headers
             })
             let json = {
                 lenovoid: res3.data.res.lenovoid,
                 sessionid: res3.data.res.sessionid,
                 token: res3.data.res.token
             }
             resolve(json)
         } catch (err) {
             console.log("获取token失败，错误信息：")
             console.log(err)
             console.log(decodeURI(err.response.data.res.error_CN))
             result += "获取token失败" + decodeURI(err.response.data.res.error_CN) + "\n"
         }
         resolve();
     });
 }

 function addsign(session) {
     return new Promise(async (resolve) => {
         try {
             headers.Authorization = "Lenovo " + session.sessionid
             headers["token"] = session.token + "=="
             headers["User-Agent"] = "Apache-HttpClient/UNAVAILABLE (java 1.5)"
             data = `imei=${deviceid}&uid=${session.lenovoid}`
             let res = await $http.post(url["sign2"], data, {
                 headers
             })
          // console.log(res.data)

             if (typeof(res.data) === "object" & res.data.status == 0) {
                 //  msg+=res.data.res.add_yb_tip
                 if (!res.data.res.success) {
                     result += "今天已经签到过啦！  \n"
                     console.log("\t今天已经签到过啦")
                 } else {
                     result += "签到成功||" + res.data.res.rewardTips.replace(/\n/g," || ") + " || 连续签到" + res.data.res.continueCount + "天\n\n"
                     console.log("\t签到成功    " + res.data.res.rewardTips.replace(/\n/g,"    ") + "    连续签到" + res.data.res.continueCount + "天")

                 }

             }
           //  console.log(res.data)
             // console.log(typeof(res.data)=="object"&&res.data.status==0)
         } catch (err) {
         //    console.log(err)
         //    console.log(decodeURI(err.response.data.res.error_CN))
             result += "签到失败" + decodeURI(err.response.data.res.error_CN) + "\n"
         }
         resolve();
     });
 }

 function hide_str(source_str,start_length=3,end_length=4,char="*"){
    if (source_str.length<=(start_length+end_length))
        return source_str

    start_length=start_length<0?0:start_length
    end_length=end_length<0?0:end_length

    newstr=source_str.substr(0,start_length)
    for(var i=0;i<source_str.length-start_length-end_length;i++)
        newstr += char
    newstr += source_str.substr(source_str.length-end_length,end_length)
    return newstr
 }


 async function lxyb() {
     if (!accounts) {
        console.log('请填写联想登录账号后再继续')
        return
    }
     console.log("任务开始")
     var acc_arr = accounts.toString().replace(/\r/g,"").split("\n")
     //多账号循环执行
    if (acc_arr.length == 0)
    {
        console.log('账号信息不正确')
        return
    }
    for (var i=0;i<acc_arr.length;i++){
        var account = acc_arr[i].toString().split("|")
        if (account.length < 2)
        {
            console.log(`第 ${i+1} 个账号信息不正确，跳过执行`)
            result += `第 ${i+1} 个账号信息不正确` + "\n"
            continue
        }
        result += `账号:${account[0]} 进度:${i+1}/${acc_arr.length} ||`
        console.log(`账号:${hide_str(account[0])} -进度:${i+1}/${acc_arr.length} `)
        lpsutgt = await lxlogin(account[0],account[1])
        for (var k=0;k<5;k++)
        {
            if (lpsutgt == null || lpsutgt == undefined)
            {
                console.log(`登录失败，尝试重新登录（${k+1}/5）`)
                lpsutgt = await lxlogin(account[0],account[1])
            }
            else
            {
                break
            }
        }
        let session = await getsession(lpsutgt)     
        if (session) {
            //console.log(session)
            await addsign(session)
        } 
    }
    let sendmsg = result.replace(/\|\| /g,"||").replace(/\|\|/g,"\n    ")
    // 如果失败了则推送     
    if (result.includes("获取token失败") || result.includes("签到失败")) {      
        await notify.sendNotify("联想智选签到-" + new Date().toLocaleDateString(), sendmsg);
    }
    else if (SEND_KEY && result.includes("今天已经签到过") == false)//非重复签到的签到成功也推送
    {
        await notify.sendNotify("联想智选签到-" + new Date().toLocaleDateString(), sendmsg);
    }
  
     // return result
 }

 lxyb()
 //module.exports=lxyb
