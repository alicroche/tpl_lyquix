/**
 * lyquix.mutation.js - Mutation observer and handler
 *
 * @version     2.0.0
 * @package     tpl_lyquix
 * @author      Lyquix
 * @copyright   Copyright (C) 2015 - 2018 Lyquix
 * @license     GNU General Public License version 2 or later
 * @link        https://github.com/Lyquix/tpl_lyquix
 */

if(lqx && typeof lqx.mutation == 'undefined') {
	lqx.mutation = (function(){
		var vars = {
			observer: null,
			addNode: [],
			removeNode: [],
			modAttrib: []
		};

		var init = function(){
			// Initialize only if enabled
			if(lqx.opts.mutation.enabled) {
				lqx.log('Initializing `mutation`');

				// Copy default opts and vars
				jQuery.extend(lqx.vars.mutation, vars);
				vars = lqx.vars.mutation;

				// Trigger functions on lqxready
				lqx.vars.window.on('lqxready', function() {
					// Create observer
					observer();
				});
			}

			return lqx.mutation.init = true;
		};

		// create a custom mutation observer that will trigger any needed functions
		var observer = function(){
			// handle videos that may be loaded dynamically
			var mo = window.MutationObserver || window.WebKitMutationObserver;

			// check for mutationObserver support , if exists, user the mutation observer object, if not use the listener method.
			if (typeof mo !== 'undefined'){
				vars.observer = new mo(handler);
				vars.observer.observe(document, {childList: true, subtree: true, attributes: true});
			}
			else {
				jQuery(document).on('DOMNodeInserted DOMNodeRemoved DOMAttrModified', function(e) {
					handler(e);
				});
			}
		};

		var addHandler = function(type, selector, callback) {
			// type can be addNode, removeNode, and modAttrib
			switch(type) {
				case 'addNode':
					vars.addNode.push({'selector': selector, 'callback': callback});
					break;
				case 'removeNode':
					vars.removeNode.push({'selector': selector, 'callback': callback});
					break;
				case 'modAttrib':
					vars.modAttrib.push({'selector': selector, 'callback': callback});
					break;
			}
			lqx.log('Observe mutation type: ' + type + ' for selector: ' + selector);
		};

		// Mutation observer handler
		var handler = function(mutRecs) {
			if(!(mutRecs instanceof Array)) {
				// Not an array, convert to an array
				mutRecs = [mutRecs];
			}
			mutRecs.forEach(function(mutRec){
				switch(mutRec.type) {
					case 'childList':
						// Handle nodes added
						if (mutRec.addedNodes.length > 0) {
							mutRec.addedNodes.forEach(function(e){
								if(e.nodeType == Node.ELEMENT_NODE) {
									vars.addNode.forEach(function(h){
										if(e.matches(h.selector)) h.callback(e);
									});
								}
							});
						}

						// Handle nodes removed
						if (mutRec.removedNodes.length > 0) {
							mutRec.removedNodes.forEach(function(e){
								if(e.nodeType == Node.ELEMENT_NODE) {
									vars.removeNode.forEach(function(h){
										if(e.matches(h.selector)) h.callback(e);
									});
								}
							});
						}
						break;

					case 'DOMNodeInserted':
						mutRec.addedNodes.forEach(function(e){
							if(e.nodeType == Node.ELEMENT_NODE) {
								vars.addNode.forEach(function(h){
									if(e.matches(h.selector)) h.callback(e);
								});
							}
						});
						break;

					case 'DOMNodeRemoved':
						mutRec.removedNodes.forEach(function(e){
							if(e.nodeType == Node.ELEMENT_NODE) {
								vars.removeNode.forEach(function(h){
									if(e.matches(h.selector)) h.callback(e);
								});
							}
						});
						break;

					case 'attributes':
					case 'DOMAttrModified':
						vars.modAttrib.forEach(function(h){
							if(mutRec.target.matches(h.selector)) h.callback(mutRec.target);
						});
						break;
				}
			});
		};

		return {
			init: init,
			addHandler: addHandler
		};
	})();
	lqx.mutation.init();
}