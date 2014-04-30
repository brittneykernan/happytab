/*
	Happy Tab!
	WIP April 2014
	Jeanelle Mak X Brittney Kernan
*/

// Collection of Cutie Models
// Models are just urls for now
// not really used right now since the model is so simple
var CutieCollection = [];

// Controller for Collection of URLs
var CutieCollectionController = {
	storageKey : 'URLs',
	// get from localstorage
	// params
	// ----
	// callback {function} *optional what to do collection gotten
	get: function(callback) {
		var self = this;
		chrome.storage.local.get(self.storageKey,function(storage) {
		  // if not, get from server
		  if( self.empty(storage[self.storageKey]) ) 
		  	return self.fetch(callback); // only get's here on first load of extension, otherwise reloads after image is shown
		  else {
		  	if(typeof(callback) == 'function')	
			  	return callback(storage[self.storageKey]);
		  }
		});
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
		chrome.storage.local.set({'URLs': collection}, function() {
			// set local reference
			CutieCollection = collection;

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
		xhr.open("GET", chrome.extension.getURL('/scripts/todays-cuties.json'), true);
		xhr.send();
	},

	// check if collection empty
	// params
	// ----
	// obj {Object} empty localstorage set, or array
	empty: function(obj) {
		return obj == undefined || obj == '' || obj.length == 0;
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
	}
}

HappyTab.init()