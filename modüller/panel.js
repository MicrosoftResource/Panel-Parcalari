const url = require("url");
const path = require("path");

const Discord = require("discord.js");

var express = require('express');
var app = express();

const passport = require("passport");
const session = require("express-session");
const LevelStore = require("level-session-store")(session);
const Strategy = require("passport-discord").Strategy;
//const pas = require("password-generator")
const helmet = require("helmet");

const client = new Discord.Client();

const md = require("marked");
const db = require('quick.db');
const ayarlar = client.ayarlar

module.exports = (client) => {
  
  const bilgiler = {
    oauthSecret: "lNYupwJAzgSjqLSgnf8z5zZITsalw2K4",
    callbackURL: `https://anloxbot-gecilcek.glitch.me/callback`,
    domain: `https://anloxbot-gecilcek.glitch.me/`
  };
    
  const dataDir = path.resolve(`${process.cwd()}${path.sep}panel`);

  const templateDir = path.resolve(`${dataDir}${path.sep}html${path.sep}`);

  app.use("/css", express.static(path.resolve(`${dataDir}${path.sep}css`)));
  
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  passport.use(new Strategy({
    clientID: client.user.id,
    clientSecret: bilgiler.oauthSecret,
    callbackURL: bilgiler.callbackURL,
    scope: ["identify", "guilds" , "email"]
  },
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
  }));

  app.use(session({
    secret: 'djrjrj',
    resave: false,
    saveUninitialized: false,
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(helmet());

  app.locals.domain = bilgiler.domain;
  
  app.engine("html", require("ejs").renderFile);
  app.set("view engine", "html");

  var bodyParser = require("body-parser");
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  })); 
  
  function girisGerekli(req, res, next) {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/giris");
  }
  
  const yukle = (res, req, template, data = {}) => {
    const baseData = {
      bot: client,
      path: req.path,
      user: req.isAuthenticated() ? req.user : null
    };
    res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
  };
  
  let dil = ""
  
  app.get("/", (req, res) => {
    yukle(res, req, "anasayfa.ejs")
  });
  app.get("/liderlik/:sunucuID",(req,res)=>{
/*    
    let msg = req.params.sunucuID
    let members = req.params.kullaniciID
        let sorted = (u => !u.user.client)//.array().sort((a, b) => { return (db.fetch(`seviye_${b.user.id + msg}`) ? db.fetch(`seviye_${b.user.id + msg}`) : 0) - (db.fetch(`seviye_${a.user.id + msg}`) ? db.fetch(`seviye_${a.user.id + msg}`) : 0) });
               const top10 = sorted(0, 10)
                const mappedXp = top10.filter(o => !o.client).map(s => db.fetch(`puancik_${s.user.id + msg}`))
                const mappedLevel = top10.filter(o => !o.client).map(s => db.fetch(`seviye_${s.user.id + msg}`) || 0)
                const mappedName = top10.filter(o => !o.client).map(s => s.user.tag);
                const mappedID = top10.filter(o => !o.client).map(s => s.user.id);
   let sayi = 1
   const map = top10.map(s => `[${sayi++}]: ${s.user.tag}\n # Seviye: ${db.fetch(`seviye_${s.user.id + msg}`) || 0} | XP: ${db.fetch(`puancik_${s.user.id + msg}`) || 0}`.replace(msg, `> ${msg}`)).join('\n\n')
*/
    yukle(res,req,"lider.ejs")
  });/*
    function girisGerekli2(req, res, next) {
    if (req.isAuthenticated()) {
      yukle(res, req, "dogru.ejs")
      let rol = db.fetch(`dogrurol.${req.params.sunucuID}`)
      let user = db.fetch(`dogrukullanıcı.${req.params.sunucuID}`)
      client.guilds.get(req.params.sunucuID).members.get(user).addRole(rol)
    }
    res.redirect("/giris2");
  }*/
  //lan oldu dcye gir
    app.get("/dogrula/:kod" , (req, res) => {
    yukle(res, req, "dogru.ejs")
    let rol = db.fetch(`dogrurol.${req.params.sunucuID}`)
    let user = db.fetch(`dogrukullanıcı.${req.params.sunucuID}`)
    client.guilds.get(db.fetch(`sckod.${req.params.kod}`)).members.get(db.fetch(`koduser.${req.params.kod}`)).addRole(db.fetch(`kodlarol.${req.params.kod}`)) 
     // console.log(req.params.sunucuID)
  });// elleme yaptim

  // sizin yapmanız gereken google doğrula yapılınca doğrulama butonunu çıkartmak , beyler girince anasayfaya yönlendiriyor

  app.post("/dogrula/:sunucuID/:kod", function(req, res) {
    if(db.fetch(`dogrukod.${req.user.id}.${req.params.sunucuID}`) === req.params.kod) {
    //let rol = db.fetch(`dogrurol.${req.params.sunucuID}`)
      client.guilds.get(db.fetch(`sckod.${req.params.kod}`)).members.get(db.fetch(`koduser.${req.params.kod}`)).addRole(db.fetch(`kodlarol.${req.params.kod}`))
      // kullanıcı kodu doğru girince olacak şeyler
  //  res.redirect("/doğruladi")
  
    } else {
      res.send("hata!")
    }
  })

   /*app.get("/", (req, res) => {
    yukle(res, req, "deneme.ejs")
  });*/
 

  app.get("/giris", (req, res, next) => {
    if (req.session.backURL) {
      req.session.backURL = req.session.backURL;
    } else if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname === app.locals.domain) {
        req.session.backURL = parsed.path;
      }
    } else {
      req.session.backURL = "";
    }
    next();
    

  },
  passport.authenticate("discord"));

  app.get("/giris", (req, res, next) => {
    if (req.session.backURL) {
      req.session.backURL = req.session.backURL;
    } else if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname === app.locals.domain) {
        req.session.backURL = parsed.path;
      }
    } else {
      req.session.backURL = "/en";
    }
    next();
  },
  passport.authenticate("discord"));
  
  app.get("/autherror", (req, res) => {
    res.json({"hata":"Bir hata sonucunda Discord'da bağlanamadım! Lütfen tekrar deneyiniz."})
    client.channels.get("616044609604419634").send(`\`${client.users.get(req.user.id).tag}\` adlı kullanıcı Yönetim Paneline Giriş Yapamadı!`)
  });
  
  app.get("/callback", passport.authenticate("discord", { failureRedirect: "/autherror" }), async (req, res) => {
    if (client.ayarlar.sahip.includes(req.user.id)) {
      req.session.isAdmin = true;
    } else {
      req.session.isAdmin = false;
    }
    if (req.session.backURL) {
      const url = req.session.backURL;
      req.session.backURL = null;
      res.redirect(url);

    } else {
      res.redirect(`anasayfa`);
    }
  client.channels.get("616044609604419634").send(`\`${client.users.get(req.user.id).tag} (${client.users.get(req.user.id).id})\` adlı kullanıcı Yönetim Paneline Discord hesabıyla giriş yaptı!`)

  });
  

  app.get("/cikis", function(req, res) {
    req.session.destroy(() => {
      req.logout();
      res.redirect("/anasayfa");
    });

    
  });
  


  app.get("/anasayfa", (req, res) => {
    yukle(res, req, "anasayfa.ejs");
  });
  
app.get("/dorulandi", (req, res) => {
    yukle(res, req, "dogrula.ejs");
  });
  app.get("/komutlar", (req, res) => {
    yukle(res, req, "komutlar.ejs");
  });
  //Bura hata verir Shard açınca
  app.get("/istatistikler", (req, res) => {
    var istatistik = {
      sunucu: client.guilds.size+" sunucu",
      kanal: client.channels.size+" kanal",
      kullanıcı: client.users.size+" kullanıcı"
    };
    yukle(res, req, "istatistikler.ejs", {istatistik});
  });
  
  app.get("/kullaniciler", (req, res) => {
    yukle(res, req, "kullanıcılar.ejs");
  });
  //Buralar hata verir Shard açınca agab düzeltilmezde o zmn bot yüksek olunca sçtk / düzeltilirde Burası sıfırdan yazılması lazım olr biz üşengeç adamlarız olm / :Djtjfjf
  app.get("/kullaniciler/:kullaniciID", (req, res) => {
    const kullanici = client.users.get(req.params.kullaniciID);
    if (!kullanici) return res.json({"hata":"Bot "+req.params.kullaniciID+" ID adresine sahip bir kullanıcıyı göremiyor."});
    yukle(res, req, "kullanıcı.ejs", {kullanici});
  });
  
  app.get("/kullaniciler/:kullaniciID/yonet", girisGerekli, (req, res) => {
    const kullanici = client.users.get(req.params.kullaniciID);
       const member = client.users.get(req.params.kullaniciID);

    if (!kullanici) return res.json({"hata":"Bot "+req.params.kullaniciID+" ID adresine sahip bir kullanıcıyı göremiyor."});
    if (req.user.id !== req.params.kullaniciID) return res.json({"hata":"Başkasının kullanıcı ayarlarına dokunamazsın."});
    yukle(res, req, "k-panel.ejs", {kullanici});
  });
  
  app.post("/kullaniciler/:kullaniciID/yonet", girisGerekli, (req, res) => {
    const kullanici = client.users.get (req.params.kullaniciID);
    if (!kullanici) return res.json({"hata":"Bot "+req.params.kullaniciID+" ID adresine sahip bir kullanıcıyı göremiyor."});
    if (req.user.id !== req.params.kullaniciID) return res.json({"hata":"Başkasının kullanıcı ayarlarına dokunamazsın."});
  //  if (db.set(`${req.params.kullaniciID}.renk`,req.params.ayarID === "renk"))
    client.panel.ayarlarKaydetKullanici(kullanici.id, kullanici, req.body, req, res);
    res.redirect(`/kullaniciler/${req.params.kullaniciID}/yonet`);
  });
/*
  app.get("/dogrula/:kod", girisGerekli ,(req,res) => {

    yukle(res, req, "dogru.ejs")
  });

  // sizin yapmanız gereken google doğrula yapılınca doğrulama butonunu çıkartmak , beyler girince anasayfaya yönlendiriyor

  app.post("/dogrula/:sunucuID/:kod", function(req, res) {
    if(db.fetch(`dogrukod.${req.user.id}.${req.params.sunucuID}`) === req.params.kod) {
    let rol = db.fetch(`dogrurol.${req.params.sunucuID}`)
      client.guilds.get(req.params.sunucuID).members.get(req.user.id).addRole(rol)
      // kullanıcı kodu doğru girince olacak şeyler
    res.redirect("/doğruladi")
  
    } else {
      res.send("hata!")
    }
  })*/
  app.get("/kullaniciler/:kullaniciID/yonet/:ayarID/sifirla", girisGerekli, (req, res) => {
    if (db.has(`${req.params.kullaniciID}.${req.params.ayarID}`) ===  false || req.params.ayarID === "resim" && db.fetch(`${req.params.kullaniciID}.${req.params.ayarID}`) === "https://img.revabot.tk/99kd63vy.png") return res.json({"hata":req.params.ayarID.charAt(0).toUpperCase()+req.params.ayarID.slice(1)+" ayarı "+client.users.get(req.params.kullaniciID).tag+" adlı kullanıcıda ayarlı olmadığı için sıfırlanamaz."});
    db.delete(`${req.params.kullaniciID}.${req.params.ayarID}`)
    res.redirect(`/kullaniciler/${req.params.kullaniciID}/yonet`);
  });
  
  app.get("/sunucular", (req, res) => {
    yukle(res, req, "sunucular.ejs"); //sunucu bilgi gösterme sistemi xd
  });
  
  app.get("/sunucular/:sunucuID", (req, res) => {
    const sunucu = client.guilds.get(req.params.sunucuID);
    if (!sunucu) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    yukle(res, req, "sunucu.ejs", {sunucu});
  });
  
  app.get("/sunucular/:sunucuID/uyeler", (req, res) => {
    const sunucu = client.guilds.get(req.params.sunucuID);
    if (!sunucu) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    yukle(res, req, "üyeler.ejs", {sunucu});
  });
  
  app.get("/sunucular/:sunucuID/roller", (req, res) => {
    const sunucu = client.guilds.get(req.params.sunucuID);
    if (!sunucu) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    yukle(res, req, "roller.ejs", {sunucu});
  });
  
  app.get("/sunucular/:sunucuID/kanallar", (req, res) => {
    const sunucu = client.guilds.get(req.params.sunucuID);
    if (!sunucu) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    yukle(res, req, "kanallar.ejs", {sunucu});
  });
  
  app.get("/panel", girisGerekli, (req, res) => {
    const perms = Discord.Permissions;
    yukle(res, req, "panel.ejs", {perms});
  });
  
  app.get("/panel/:sunucuID", girisGerekli, (req, res) => {
    res.redirect(`/panel/${req.params.sunucuID}/yonet`);
  });

  app.get("/panel/:sunucuID/yonet", girisGerekli, (req, res) => {
    const sunucu = client.guilds.get(req.params.sunucuID);
    const guild = client.guilds.get(req.params.guildID);
    if (!sunucu) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = sunucu && !!sunucu.member(req.user.id) ? sunucu.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
    yukle(res, req, "sayfa-ayarlar.ejs", {sunucu, guild});
  });
  

  
  
  // OTO TAG SİTEMİ 
  
  
  
        app.post("/panel/:guildID/ototag", girisGerekli, async(req, res) => {
    const guild = client.guilds.get(req.params.guildID);
      const sunucu = client.guilds.get(req.params.sunucuID);
   if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
   
    client.writeSettings(guild.id, req.body);
       
 
    res.redirect("/panel/"+req.params.guildID+"/ototag");
  });
  
  
  
      app.get("/panel/:guildID/ototag", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    const sunucu = client.guilds.get(req.params.guildID);
if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
    yukle(res, req, "sayfa-ototag.ejs", {guild, sunucu});
  });
  
  
  
  app.get("/panel/:sunucuID/tag/sifirla", girisGerekli, (req, res) => {
    if (client.ayar.has(`tag_${req.params.sunucuID}`) === false) return res.json({"hata": "otomatik tag adlı ayar "+client.guilds.get(req.params.sunucuID).name+" adlı sunucuda ayarlı olmadığı için sıfırlanamaz."});
    client.ayar.delete(`tag_${req.params.sunucuID}`)
    res.redirect(`/panel/${req.params.sunucuID}/ototag`);
  });
  
  
  
  
  // OTOROL
  
  
  
  
      app.post("/panel/:guildID/otorol", girisGerekli, async(req, res) => {
    const guild = client.guilds.get(req.params.guildID);
      const sunucu = client.guilds.get(req.params.sunucuID);
   if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
   
    client.writeSettings(guild.id, req.body);
       
 
    res.redirect("/panel/"+req.params.guildID+"/otorol");
  });
  
  
  
      app.get("/panel/:guildID/otorol", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
            const sunucu = client.guilds.get(req.params.guildID);

if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
    yukle(res, req, "sayfa-otorol.ejs", {guild, sunucu});
  });
  
  
  
  app.get("/panel/:sunucuID/otorol/sifirla", girisGerekli, (req, res) => {
    if (client.ayar.has(`otorol_${req.params.sunucuID}`) === false) return res.json({"hata": "Otorol adlı ayar "+client.guilds.get(req.params.sunucuID).name+" adlı sunucuda ayarlı olmadığı için sıfırlanamaz."});
    client.ayar.delete(`otorol_${req.params.sunucuID}`)
    res.redirect(`/panel/${req.params.sunucuID}/otorol`);
  });
  
   app.get("/panel/:sunucuID/otoRK/sifirla", girisGerekli, (req, res) => {
    if (client.ayar.has(`otoknl_${req.params.sunucuID}`) === false) return res.json({"hata": "Otorol kanalı   "+client.guilds.get(req.params.sunucuID).name+" adlı sunucuda ayarlı olmadığı için sıfırlanamaz."});
    client.ayar.delete(`otoknl_${req.params.sunucuID}`)
    res.redirect(`/panel/${req.params.sunucuID}/otorol`);
  });
  
  // FİLTRE
  
  
  
  
  
    app.get("/panel/:guildID/filtre", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
      const sunucu = client.guilds.get(req.params.guildID);
if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
    yukle(res, req, "sayfa-filtre.ejs", {sunucu, guild});
  });
  
  

  
  
    app.post("/panel/:guildID/filtre", girisGerekli, async(req, res) => {
    const guild = client.guilds.get(req.params.guildID);
      const sunucu = client.guilds.get(req.params.sunucuID);
      
    if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
  
    client.writeSettings(guild.id, req.body);
       
 
    res.redirect("/panel/"+req.params.guildID+"/filtre");
  });
  
  
    app.get("/panel/:guildID/filtre/sil", girisGerekli, async (req, res) => {
res.redirect("/panel/"+req.params.guildID+"/filtre");
});

  
  
 
app.get("/panel/:guildID/filtre/sil/:cmdID", girisGerekli, async (req, res) => {
const guild = client.guilds.get(req.params.guildID);
if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});


var komutf = req.params.cmdID;


if(!db.fetch(`filtre_${req.params.guildID}`).includes(komutf)) {
res.json({"hata":`Filtre bulunamadı veya silinmiş.`});
} else {

let x = komutf
let arr = []
db.fetch(`filtre_${req.params.guildID}`).forEach(v => {
if (v !== x) {
arr.push(v)
}
})
  

db.set(`filtre_${req.params.guildID}`, arr)
  
}

res.redirect("/panel/"+req.params.guildID+"/filtre");
});

  
  // ÖZEL KOMUT
  
  
  
  app.get("/panel/:guildID/ozelkomutlar", girisGerekli, (req, res) => {
  const guild = client.guilds.get(req.params.guildID);
        const sunucu = client.guilds.get(req.params.guildID);

 if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
  const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
  yukle(res, req, "sayfa-ozelkomutlar.ejs", {guild, sunucu});
});

  app.post("/panel/:guildID/ozelkomutlar", girisGerekli, (req, res) => {
  const guild = client.guilds.get(req.params.guildID);
if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
  const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});

  client.customCmds(guild.id, req.body);
  res.redirect("/panel/"+req.params.guildID+"/ozelkomutlar");
});
  
  
  
  app.get("/panel/:guildID/ozelkomutlar", girisGerekli, (req, res) => {
const guild = client.guilds.get(req.params.guildID);
    const sunucu = client.guilds.get(req.params.guildID);
if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
yukle(res, req, "sayfa-ozelkomutlar.ejs", {guild, sunucu});
});

app.post("/panel/:guildID/ozelkomutlar", girisGerekli, (req, res) => {
const guild = client.guilds.get(req.params.guildID);
if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});

  
  
client.customCmds(guild.id, req.body);
res.redirect("/panel/"+req.params.guildID+"/ozelkomutlar");
});
  
  
  app.get("/panel/:guildID/ozelkomutlar/sil", girisGerekli, async (req, res) => {
res.redirect("/panel/"+req.params.guildID+"/ozelkomutlar");
});

  
  
  const fs = require('fs');
app.get("/panel/:guildID/ozelkomutlar/sil/:cmdID", girisGerekli, async (req, res) => {
const guild = client.guilds.get(req.params.guildID);
if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});


var komut = req.params.cmdID;

let komutlar = client.cmdd
if(komutlar[req.params.guildID].length === 1) {
 if(Object.keys(komutlar[req.params.guildID][0])[0].toString() === komut) {
   delete komutlar[req.params.guildID]
   fs.writeFile("./komutlar.json", JSON.stringify(komutlar), (err) => {
     console.log(err)
   })
 }
} else {
for (var i = 0; i < komutlar[req.params.guildID].length; i++) {
 if(Object.keys(komutlar[req.params.guildID][i])[0].toString() === komut) {
   komutlar[req.params.guildID].splice(i, 1);

   fs.writeFile("./komutlar.json", JSON.stringify(komutlar), (err) => {
     console.log(err)
   })
 }
}
}

res.redirect("/panel/"+req.params.guildID+"/ozelkomutlar");
});

  
  //DAVET SİSTEMİ
  
  
        app.post("/panel/:guildID/davetsistemi", girisGerekli, async(req, res) => {
    const guild = client.guilds.get(req.params.guildID);
      const sunucu = client.guilds.get(req.params.sunucuID);
   if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
   
    client.writeSettings(guild.id, req.body);
       
 
    res.redirect("/panel/"+req.params.guildID+"/davetsistemi");
  });
  
  
  
      app.get("/panel/:guildID/davetsistemi", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    const sunucu = client.guilds.get(req.params.guildID);
if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
    yukle(res, req, "sayfa-davet.ejs", {guild, sunucu});
  });
  
  
  
  app.get("/panel/:sunucuID/dkanal/sifirla", girisGerekli, (req, res) => {
    if (client.ayar.has(`davetk_${req.params.sunucuID}`) === false) return res.json({"hata": "Davet kanalı "+client.guilds.get(req.params.sunucuID).name+" adlı sunucuda ayarlı olmadığı için sıfırlanamaz."});
    client.ayar.delete(`davetk_${req.params.sunucuID}`)
    res.redirect(`/panel/${req.params.sunucuID}/davetsistemi`);
  });
  
  //GİRİŞ ÇIKIŞ
  
  
  

  
        app.post("/panel/:guildID/giriscikis", girisGerekli, async(req, res) => {
    const guild = client.guilds.get(req.params.guildID);
      const sunucu = client.guilds.get(req.params.sunucuID);
   if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
   
    client.writeSettings(guild.id, req.body);
       
 
    res.redirect("/panel/"+req.params.guildID+"/giriscikis");
  });
  
  
  
      app.get("/panel/:guildID/giriscikis", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    const sunucu = client.guilds.get(req.params.guildID);
if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
    yukle(res, req, "sayfa-girişçıkış.ejs", {guild, sunucu});
  });
  
  
  
  app.get("/panel/:sunucuID/cikism/sifirla", girisGerekli, (req, res) => {
    if (client.ayar.has(`cmesaj_${req.params.sunucuID}`) === false) return res.json({"hata": "Çıkış mesajı "+client.guilds.get(req.params.sunucuID).name+" adlı sunucuda ayarlı olmadığı için sıfırlanamaz."});
    client.ayar.delete(`cmesaj_${req.params.sunucuID}`)
    res.redirect(`/panel/${req.params.sunucuID}/giriscikis`);
  });
    app.get("/panel/:sunucuID/girisk/sifirla", girisGerekli, (req, res) => {
    if (client.ayar.has(`gc_${req.params.sunucuID}`) === false) return res.json({"hata": "Giriş çıkış kanalı "+client.guilds.get(req.params.sunucuID).name+" adlı sunucuda ayarlı olmadığı için sıfırlanamaz."});
    client.ayar.delete(`gc_${req.params.sunucuID}`)
    res.redirect(`/panel/${req.params.sunucuID}/giriscikis`);
  });
  
   app.get("/panel/:sunucuID/girism/sifirla", girisGerekli, (req, res) => {
    if (client.ayar.has(`gmesaj_${req.params.sunucuID}`) === false) return res.json({"hata": "Giriş mesajı "+client.guilds.get(req.params.sunucuID).name+" adlı sunucuda ayarlı olmadığı için sıfırlanamaz."});
    client.ayar.delete(`gmesaj_${req.params.sunucuID}`)
    res.redirect(`/panel/${req.params.sunucuID}/giriscikis`);
  });
  
  
  
  
  
  
  

  
  
  
  
  
  
  
  
  // DESTEK SİTEM
  
      app.post("/panel/:guildID/desteksistemi", girisGerekli, async(req, res) => {
    const guild = client.guilds.get(req.params.guildID);
      const sunucu = client.guilds.get(req.params.sunucuID);
   if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
   
    client.writeSettings(guild.id, req.body);
       
 
    res.redirect("/panel/"+req.params.guildID+"/desteksistemi");
  });
  
  
  
      app.get("/panel/:guildID/desteksistemi", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    const sunucu = client.guilds.get(req.params.guildID);
if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
    yukle(res, req, "sayfa-destek.ejs", {guild, sunucu});
  });
  
  
  
  app.get("/panel/:sunucuID/destekk/sifirla", girisGerekli, (req, res) => {
    if (client.ayar.has(`destekK_${req.params.sunucuID}`) === false) return res.json({"hata": "Destek kanalı "+client.guilds.get(req.params.sunucuID).name+" adlı sunucuda ayarlı olmadığı için sıfırlanamaz."});
    client.ayar.delete(`destekK_${req.params.sunucuID}`)
    res.redirect(`/panel/${req.params.sunucuID}/desteksistemi`);
  });
  
   app.get("/panel/:sunucuID/destekr/sifirla", girisGerekli, (req, res) => {
    if (client.ayar.has(`destekR_${req.params.sunucuID}`) === false) return res.json({"hata": "Destek Rolü "+client.guilds.get(req.params.sunucuID).name+" adlı sunucuda ayarlı olmadığı için sıfırlanamaz."});
    client.ayar.delete(`destekR_${req.params.sunucuID}`)
    res.redirect(`/panel/${req.params.sunucuID}/desteksistemi`);
  });
  
  
  
// SAYAÇ SİSTEMİ
          app.post("/panel/:guildID/sayac", girisGerekli, async(req, res) => {
    const guild = client.guilds.get(req.params.guildID);
      const sunucu = client.guilds.get(req.params.sunucuID);
   if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
   
    client.writeSettings(guild.id, req.body);
       
 
    res.redirect("/panel/"+req.params.guildID+"/sayac");
  });
  
  
  
      app.get("/panel/:guildID/sayac", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    const sunucu = client.guilds.get(req.params.guildID);
if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
    yukle(res, req, "sayfa-sayaç.ejs", {guild, sunucu});
  });
  
  
  
  app.get("/panel/:sunucuID/skanal/sifirla", girisGerekli, (req, res) => {
    if (client.ayar.has(`sayac_${req.params.sunucuID}`) === false) return res.json({"hata": "Çıkış mesajı "+client.guilds.get(req.params.sunucuID).name+" adlı sunucuda ayarlı olmadığı için sıfırlanamaz."});
    client.ayar.delete(`sayac_${req.params.sunucuID}`)
    res.redirect(`/panel/${req.params.sunucuID}/sayac`);
  });
    app.get("/panel/:sunucuID/sayac/sifirla", girisGerekli, (req, res) => {
    if (client.ayar.has(`sayacs_${req.params.sunucuID}`) === false) return res.json({"hata": "Giriş çıkış kanalı "+client.guilds.get(req.params.sunucuID).name+" adlı sunucuda ayarlı olmadığı için sıfırlanamaz."});
    client.ayar.delete(`sayacs_${req.params.sunucuID}`)
    res.redirect(`/panel/${req.params.sunucuID}/sayac`);
  });


// GENEL AYARLAR
 

         app.post("/panel/:guildID/genel", girisGerekli, async(req, res) => {
    const guild = client.guilds.get(req.params.guildID);
      const sunucu = client.guilds.get(req.params.sunucuID);
   if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
   
    client.writeSettings(guild.id, req.body);
       
 
    res.redirect("/panel/"+req.params.guildID+"/genel");
  });
  
  
  
      app.get("/panel/:guildID/genel", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    const sunucu = client.guilds.get(req.params.guildID);
if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
    yukle(res, req, "sayfa-genel.ejs", {guild, sunucu});
  });
  
  
  
  app.get("/panel/:sunucuID/srol/sifirla", girisGerekli, (req, res) => {
    if (client.ayar.has(`sRol_${req.params.sunucuID}`) === false) return res.json({"hata": "Susturma rolü "+client.guilds.get(req.params.sunucuID).name+" adlı sunucuda ayarlı olmadığı için sıfırlanamaz."});
    client.ayar.delete(`sRol_${req.params.sunucuID}`)
    res.redirect(`/panel/${req.params.sunucuID}/genel`);
  });
  
   app.get("/panel/:sunucuID/prefix/sifirla", girisGerekli, (req, res) => {
    if (client.ayar.has(`prefix_${req.params.sunucuID}`) === false) return res.json({"hata": "Prefix   "+client.guilds.get(req.params.sunucuID).name+" adlı sunucuda ayarlı olmadığı için sıfırlanamaz."});
    client.ayar.delete(`prefix_${req.params.sunucuID}`)
    res.redirect(`/panel/${req.params.sunucuID}/genel`);
  });
  
  
  
  
    app.get("/panel/:guildID/komut-yasak/sil", girisGerekli, async (req, res) => {
res.redirect("/panel/"+req.params.guildID+"/genel");
});

  
  
 
app.get("/panel/:guildID/komut-yasak/sil/:cmdID", girisGerekli, async (req, res) => {
const guild = client.guilds.get(req.params.guildID);
if (!guild) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});


var komutf = req.params.cmdID;


if(!db.fetch(`yasakK_${req.params.guildID}`).includes(komutf)) {
res.json({"hata":`Yasaklanan komut bulunamadı veya silinmiş.`});
} else {

let x = komutf
let arr = []
db.fetch(`yasakK_${req.params.guildID}`).forEach(v => {
if (v !== x) {
arr.push(v)
}
})
  

db.set(`yasakK_${req.params.guildID}`, arr)
  
}

res.redirect("/panel/"+req.params.guildID+"/genel");
});


  
  
  

  
  
  app.post("/panel/:sunucuID/yonet", girisGerekli, (req, res) => {
    const sunucu = client.guilds.get(req.params.sunucuID);
    const g = client.guilds.get(req.params.sunucuID);
    if (!sunucu) return res.json({"hata":"Bot "+req.params.sunucuID+" ID adresine sahip bir sunucuda bulunmuyor."});
    const isManaged = sunucu && !!sunucu.member(req.user.id) ? sunucu.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) return res.json({"hata":"Bu sunucuda Sunucuyu Yönet iznin bulunmuyor. Bu yüzden bu sayfaya erişim sağlayamazsın."});
    
    if (req.body['komut'] && req.body['aciklama']) {
      if (client.kayıt.komutlar.has(req.body['komut']) === true || client.kayıt.alternatifler.has(req.body['komut'])) return res.json({"hata":"Botun zaten var olan bir komutu özel komut olarak eklenemez."});
      if (db.has(`${sunucu.id}.özelKomutlar`) === true) {
        for (var i = 0; i < db.fetch(`${sunucu.id}.özelKomutlar`).length; i++) {
          if (Object.keys(db.fetch(`${sunucu.id}.özelKomutlar`)[i])[0] === req.body['komut']) return res.json({"hata":"Sunucuda "+req.body['komut']+" adlı bir özel komut zaten bulunduğu için tekrar eklenemez."});
        }  
      }
    }
    

  
    if (req.body['ban']) {
      if (sunucu.members.get(client.user.id).permissions.has("BAN_MEMBERS") === false) return res.json({"hata":"Botun "+sunucu.name+" adlı sunucuda Üyeleri Yasakla (BAN_MEMBERS) izni olmadığı için "+client.users.get(req.body['ban']).tag+" adlı üye yasaklanamıyor."});
    }
    if (req.body['unban']) {
      require('request')({
        url: `https://discordapp.com/api/v7/users/${req.body['unban']}`,
        headers: {
          "Authorization": `Bot ${client.token}`
        }
      }, async function(error, response, body) {
        if (JSON.parse(body).message && JSON.parse(body).message === "Invalid Form Body") return res.json({"hata":"Discord'da "+req.body['unban']+" ID adresine sahip bir kullanıcı bulunmuyor."});
        let bans = await sunucu.fetchBans();
        if (bans.has(req.body['unban']) === false) return res.json({"hata":sunucu.name+" sunucusunda "+JSON.parse(body).username+"#"+JSON.parse(body).discriminator+" adlı kullanıcı yasaklı olmadığı için yasağını kaldıramam."});
        res.redirect(`/panel/${req.params.sunucuID}/yonet`);
      });
      return
    }
    if (req.body['kick']) {
      if (sunucu.members.get(client.user.id).permissions.has("KICK_MEMBERS") === false) return res.json({"hata":"Botun "+sunucu.name+" adlı sunucuda Üyeleri At (KICK_MEMBERS) izni olmadığı için "+client.users.get(req.body['kick']).tag+" adlı üye atılamıyor."}); 
    }
    
    client.panel.ayarlarKaydet(sunucu.id, sunucu, req.body, req, res);
    res.redirect(`/panel/${req.params.sunucuID}/yonet`);
  });
  


  
  app.get("/yonetici", girisGerekli, (req, res) => {
    yukle(res, req, "yönetici.ejs");
  });
  
  app.get("/botuekle", (req, res) => {
    res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`);
  });
  
  app.get("/sunucular/:sunucuID/botuat", girisGerekli, (req, res) => {
    client.guilds.get(req.params.sunucuID).leave();
    res.redirect("/sunucular");
  });
  
 
  //İngilizce Bölümler

  app.listen(process.env.PORT);
};