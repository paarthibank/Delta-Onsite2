var exp=require("express");
var mysql=require("mysql");
var multer=require("multer");
var sharp=require("sharp");
var fs=require("fs");
var bodyparser=require("body-parser");
con=exp();
con.use(bodyparser.json());
con.use(bodyparser.urlencoded({extended: true}));
con.use(exp.static("public"));
var sql=mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "Arizona"
})
sql.connect(function(err) {
  if (err) {
  	console.log(err);

  }
  console.log("Connected!");
});
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public')
  },
  filename: function (req, file, cb) {
     cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage });
sql.query("CREATE DATABASE IF NOT EXISTS pic");
sql.query("USE pic");
sql.query("CREATE TABLE IF NOT EXISTS pic(width int not null,height int null)")
var n1=0;
con.post("/img",upload.single("pic"),function(req,res){
	const img=sharp(req.file.path);
	img.metadata()
		.then(function(metadata){
			var ab=metadata.width;
			var cd=metadata.height;
			console.log(ab);
			sql.query("INSERT INTO pic(width,height) VALUES (?,?)",[ab,cd],function(err){if(err) throw err;})
			return img
			.resize(200)		
			.jpeg({quality:100})
			.toFile(__dirname+"/public/pic"+n1+".jpg")

		})
		
		.then(success);
	function success(result){
		fs.unlink(req.file.path,function(err){ if(err) throw err;});
		n1++;
		
	}
	
	res.redirect("/");
	res.end();

})
con.get("/",function(req,res){
	res.render("on.ejs");
	res.end();
})
con.get("/add",function(req,res){
	res.render("pic.ejs");
	res.end();
})
con.post("/ind",function(req,res){
	var p={
		n1:n1
	}
	res.render("dis.ejs",p);
	res.end();
})
con.post("/disp",function(req,res){
	var nw=parseInt(req.body.pic);
	var h;
	console.log(nw);
	var w;
	sql.query("SELECT * FROM pic",function(err,result,fields){
		if(err) throw err;
		w=result[nw].width;
		h=result[nw].height;
		var a={
		n:nw,
		w:w,
		h:h
		};
		console.log(a);
		res.render("disp.ejs",a);
		res.end();

	})
	
})


con.listen(3000);