
/***
* made by cHLeB@ & Lukas:(+2015 R.I.P)
*/

if (!Function.prototype.bind) {
	Function.prototype.bind = function(thisObj) {
		var fn = this;
		var args = Array.prototype.slice.call(arguments, 1);
		return function() {
			return fn.apply(thisObj, args.concat(Array.prototype.slice.call(arguments)));
		}
	}
};

var fs = require('fs');
var exec = require('child_process').exec;

var ConnectSoundFiles = function(path, fileName){
	this.path = path || './';
	this.templateFileName = fileName;
	this.soundTypes = ['wav', 'ogg', 'mp3'];
	this.soundFiles = [];
	this.gameSounds = {};
	this.gameSounds.clips = [];
	this.soundLength = 0;
	this.soundDescIndex = 0;

	this.getFiles();
};

ConnectSoundFiles.prototype.getFiles = function(){
	fs.readdir(this.path, this.filesGet.bind(this));
};

ConnectSoundFiles.prototype.filesGet = function(error, files){
	if (!!error) {
		console.log('error dir');
	} else {
		if (files instanceof Array) {
			var i, f, ft, t;
			for(i=0;i<files.length;i++){
				f = files[i];
				ft = f.split('.');
				t = ft[ft.length-1];
				if (this.soundTypes.indexOf(t) > -1) {
					this.soundFiles.push(f);
				}
			}
		}
		// call sox
		this.makeSoxArguments();
	}
};

/**
* this parameters is for mp3 format but sox need mp3 handler. Work with wav also but badly.
*/
ConnectSoundFiles.prototype.makeSoxArguments = function(){
	var mainCall = './sox ';
	for(var i=0;i<this.soundFiles.length;i++){
		var file = this.soundFiles[i];
		var call = '"| ./sox '+file+' -c 1 -r 4410 -p pad 0 0.1" '
		mainCall += call;
	}
	mainCall += '-t mp3 -C 32 '+this.path+''+this.templateFileName+'.mp3';
	console.log(mainCall);
	exec(mainCall, this.soxExec.bind(this));
};

ConnectSoundFiles.prototype.soxExec = function(error, args){
	if (!!error) {
		console.log('sox error');
	} else {
		this.makeSoundDescription();
	}
};

ConnectSoundFiles.prototype.makeSoundDescription = function(){
	if (this.soundDescIndex < this.soundFiles.length) {
		var file = this.soundFiles[this.soundDescIndex];
		var call = './sox --i -D '+file;
		exec(call, this.addSoundDesc.bind(this, file));
		this.soundDescIndex++;
	} else {
		this.makeDescFile();
	}
};

ConnectSoundFiles.prototype.addSoundDesc = function(file, error, out){
	if(!!error){
		console.log('error desc');
	} else {
		var fts = file.split('.');
		fts.pop();
		var f = fts.join('.');
		var dur = parseFloat(out)+0.1;

		var obj = {
			name : f,
			startTime : this.soundLength,
			duration : dur,
			volume : 0.5,
		};
		this.soundLength += dur;

		this.gameSounds.clips.push(obj);
		this.makeSoundDescription();
	}
};

ConnectSoundFiles.prototype.makeDescFile = function(){
	var descFile = this.path+''+this.templateFileName+'.js';
	fs.open(descFile, 'w', function(){});
	fs.writeFile(descFile, 'var GameSounds = '+JSON.stringify(this.gameSounds), function(err){
		if (!err) { console.log(err); }
	});
	console.log(this.gameSounds);
};

var csf = new ConnectSoundFiles('./', 'gameSounds');
