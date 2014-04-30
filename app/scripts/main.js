/*
	Happy Tab!
	WIP April 2014
	Jeanelle Mak X Brittney Kernan
*/

// Collection of Cutie Models
// interfaces with local storage
// Models are just urls for now
var CutieCollection = {
	get: function(key,callback) {
		if( HappyTab.isExtension() )
			chrome.storage.local.get( key, callback )
		else {
			var val = localStorage.getItem(key);
			callback(this.format(key,val));
		}
	},
	set: function(key,val,callback) {
		if( HappyTab.isExtension() ) 
			chrome.storage.local.set({ key:val }, callback)
		else {
			localStorage.setItem(key,val);
			callback()
		}
	},
	// ensure get returns right format
	format: function( key,val ) {		
		var value = {key:''}
		if( val != null )
			 value[key] = val.split(',');
		return value;
	}
}

// Controller for Collection of URLs
var CutieCollectionController = {
	storageKey : 'URLs',
	// get from localstorage
	// params
	// ----
	// callback {function} *optional what to do collection gotten
	get: function(callback) {
		var self = this;
		CutieCollection.get(self.storageKey,function(store) {
		  // if not, get from server
		  if( self.empty(store[self.storageKey]) ) 
		  	return self.fetch(callback); // only get's here on first load of extension, otherwise reloads after image is shown
		  else {
		  	if(typeof(callback) == 'function')	
			  	return callback(store[self.storageKey]);
		  }
		})
	},

	// return one collection model
	// popped from the collection (marked as used)
	// also make sure more are loaded for next time
	// params
	// ----
	// callback {function} *required what to do model gotten
	// returns
	// ----
	// one model
	getOne: function(callback) {
		var self = this;
		// get collection from storage
		this.get(function(collection) {
			var model = collection.pop();
			
			// check for more if array 0 or update array with 1 less item
			if( self.empty(collection) ) 
		  	self.fetch(); // only get's here on first load of extension, otherwise reloads after image is shown
		  else 
		  	self.set(collection);	

		  if(typeof(callback) != 'function')
		  	return console.error('CutieCollectionController.getOne requires a callback argument');

		  return callback(model);
		});
	},

	// set to localstorage
	// params
	// ----
	// collection {array} updated collection
	// callback {function} *optional what to do when collection is set
	set: function(collection, callback) {
		CutieCollection.set(this.storageKey, collection, function() {
		  // Notify that we saved.
		  //message('HappyTab URL array updated, new length: ' + collection.length);
		  
		  // when storage is set
		  if( typeof(callback) == 'function' )
		  	callback(collection);
		});
	},

	// get from server
	// params
	// ----
	// callback {function} what to do collection gotten
	fetch: function(callback) {
		var self = this;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
		  if (xhr.readyState == 4) {
		    // string to json/array
		    // coule use collection model to create a new one
		    var array = JSON.parse(xhr.responseText);
		    // save as array to storage	    
		    self.set(array, callback);
		  }
		} 
		var path = 'scripts/todays-cuties.json',
		    url = (chrome.extension) ? chrome.extension.getURL(path) : 'app/'+path;
		xhr.open("GET", url, true);
		xhr.send();
	},

	// check if collection empty
	// params
	// ----
	// obj {Object} empty localstorage set, or array
	empty: function(obj) {
		return obj == null ||  obj == undefined || obj == '' || obj.length == 0;
	}
}

// App Controller
var HappyTab = {
	init: function() {
		var self = this;
		CutieCollectionController.getOne(self.showCutie);
	},
	showCutie: function(cutie) {
		document.body.style.backgroundImage = 'url(' + cutie + ')';
	},
	isExtension: function() {
		return chrome.storage != undefined;
	}
}

HappyTab.init()