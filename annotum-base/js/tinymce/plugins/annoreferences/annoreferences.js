var annoReferences;

(function($){
	var inputs = {}, ed;

	annoReferences = {	
		keySensitivity: 100,
		textarea : function() { return edCanvas; },

		init : function() {
			inputs.dialog = $('#anno-popup-references');
			inputs.submit = $('#anno-references-submit');
			
			inputs.checkboxes = $('#anno-popup-references input');
			
			// Bind event handlers
			inputs.dialog.keyup( annoReferences.keyup );
			
			inputs.submit.click( function(e){
				annoReferences.update();
				e.preventDefault();
			});
			$('#anno-references-cancel').click( annoReferences.close);

			inputs.dialog.bind('wpdialogrefresh', annoReferences.refresh);
			inputs.dialog.bind('wpdialogclose', annoReferences.onClose);
		},

		onClose : function() {
			//Lets collapse the edit screens
			$('.anno-reference-edit').hide();
		},

		open : function() {
			// Initialize the dialog if necessary (html mode).
			if ( ! inputs.dialog.data('wpdialog') ) {
				inputs.dialog.wpdialog({
					title: annoLinkL10n.title,
					width: 480,
					height: 'auto',
					modal: true,
					dialogClass: 'wp-dialog',
					zIndex: 300000
				});
			}

			inputs.dialog.wpdialog('open');
		},
		
		getCheckboxes : function() {
			return $('#anno-popup-references input[type=checkbox]:checked');
		},
		
		isMCE : function() {
			return tinyMCEPopup && ( ed = tinyMCEPopup.editor ) && ! ed.isHidden();
		},

		close : function() {
			if ( annoReferences.isMCE() )
				tinyMCEPopup.close();
			else
				inputs.dialog.wpdialog('close');
		},
		
		update : function() {
			if ( annoReferences.isMCE() )
				annoReferences.mceUpdate();
			else
				annoReferences.htmlUpdate();
		},
				
		//TODO look into removeing
		htmlUpdate : function() {
			var attrs, xml, start, end, cursor,
				textarea = annoReference.textarea();
				
			if ( ! textarea )
				return;

			xml = '';
			checkboxes = inputs.checkboxes;
			if (checkboxes) {
				for (checkbox in checkboxes) {
					xml += '<xref ref-type="bibr" rid="B1">xref text</xref>';
				}
			}
			
			// Insert HTML
			if ( typeof textarea.selectionStart !== 'undefined' ) {
				start       = textarea.selectionStart;
				end         = textarea.selectionEnd;
				selection   = textarea.value.substring( start, end );
				cursor      = start + xml.length;

				textarea.value = textarea.value.substring( 0, start )
				               + html
				               + textarea.value.substring( end, textarea.value.length );

				// Update cursor position
				textarea.selectionStart = textarea.selectionEnd = cursor;
			}
			annoReferences.close();
			textarea.focus();
		},

		mceUpdate : function() {
			var ed = tinyMCEPopup.editor
			var xml, checkboxes;
			xml = '';

			var node = ed.selection.getNode();
			
			// If we're in the middle of a link or something similar, we want to insert the references after the element
			if (node.nodeName != 'BODY' && node.nodeName != 'SEC' && node.nodeName != 'P') {
				ed.selection.select(node);
			}
			checkboxes = annoReferences.getCheckboxes();
			checkboxes.each(function(i, checkbox) {
				
				//TODO proper reference (text)
				id = $(checkbox).attr('id').replace('reference-checkbox-', '');
				id = parseInt(id) + 1;
				xml += '<xref ref-type="bibr" rid="' + id + '">' + id + '</xref>';
			});
			ed.selection.collapse(0);
			ed.execCommand('mceinsertContent', null, xml);
			
			annoReferences.close();
		},

		keyup: function( event ) {
			var key = $.ui.keyCode;

			switch( event.which ) {
				case key.ESCAPE:
					event.stopImmediatePropagation();
					if ( ! $(document).triggerHandler( 'wp_CloseOnEscape', [{ event: event, what: 'annoreferences', cb: annoReferences.close }] ) )
						annoReferences.close();
					return false;
					break;
				default:
					return;
			}
			event.preventDefault();
		},
	}
	$(document).ready( annoReferences.init );	
})(jQuery);