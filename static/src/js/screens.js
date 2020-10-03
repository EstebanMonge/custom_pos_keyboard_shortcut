odoo.define('custom_pos.screens', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');
    var PopupWidget = require('point_of_sale.popups');
    var core = require('web.core');
    var gui = require('point_of_sale.gui');

    /* customizing product list widget search option */
    var ProductListWidget = screens.ProductListWidget.include({
        template: 'ProductListWidget',
        init: function(parent, options) {
            parent.t = this.template;
            var self = this;
            this._super(parent,options);

            this.keypress_product_handler = function(ev){
                // React only to SPACE to avoid interfering with warcode scanner which sends ENTER
                if (ev.which != 13) {
                    return;
                }
                ev.preventDefault();
                var product = self.pos.db.get_product_by_id(this.dataset.productId);
                options.click_product_action(product);
                // $(".selected-mode").focus();
                // $(".numpad").focus();
            };
        },
    });

    /* customizing product screen widget for shortcut */
    var ShortcutTipsWidget = PopupWidget.extend({
        template: 'ShortcutTipsWidget',
        show: function () {
            this._super();
        }
    });
    gui.define_popup({name: 'shortcuttips', widget: ShortcutTipsWidget});

    var ProductScreenWidget = screens.ProductScreenWidget.include({
        init: function(parent, options){
            this._super(parent,options);

            var self = this;

            this.actionpad = new screens.ActionpadWidget(this,{});
            this.actionpad.replace(this.$('.placeholder-ActionpadWidget'));

            this.numpad = new screens.NumpadWidget(this,{});
            this.numpad.replace(this.$('.placeholder-NumpadWidget'));

            this.product_screen_keydown_event_handler = function(event){
                /* product screen key down events */
                if(!$($(document).find(".product-screen")[0]).hasClass('oe_hidden')){
                    if(event.shiftKey && event.which == 57 ) {      // Ctrl+9 Help
                        $(document).find("span#shortcut_tips_btn").trigger("click");
                    }
            if(event.ctrlKey ) {      // Ctrl Generic Product 
		var product = self.pos.db.get_product_by_id(self.pos.config.iface_generic_product[0]);
		self.pos.get_order().add_product(product);
                self.numpad.state.changeMode('price');
            }
               if(event.which == 114){  // F3 Create Product if module installed
                        $(document).find("div.product-screen div.rightpane div.searchbox input").blur();
			self.gui.show_popup('update_price');
               }
               if(event.which == 113){  // F2 Create Product if module installed
			var categ = [];
			var unit = [];
			for (var i in self.pos.categories){
				categ.push(self.pos.categories[i].name);
			}
			for (var i in self.pos.units){
				unit.push(self.pos.units[i].name);
			}
                        $(document).find("div.product-screen div.rightpane div.searchbox input").blur();
			self.gui.show_popup('product_create',{
				'category': categ,
                		'units':unit,
            		});
               }
               if(event.shiftKey && event.which == 49){  // Shift+1 Product Quantity
                        $(document).find("div.product-screen div.rightpane div.searchbox input").blur();
                        self.numpad.state.changeMode('quantity');
               }
               if(event.shiftKey && event.which == 51){  // Shift+3 Tare
                        $(document).find("div.product-screen div.rightpane div.searchbox input").blur();
                        self.numpad.state.changeMode('tare');
               }
               if(event.shiftKey && event.which == 52){  // Shift+4 Product Quantity
                        $(document).find("div.product-screen div.rightpane div.searchbox input").blur();
                        self.numpad.state.changeMode('discount');
               }
               if(event.shiftKey && event.which == 53){   // Shift+5 Product Value 
                        $(document).find("div.product-screen div.rightpane div.searchbox input").blur();
                        self.numpad.state.changeMode('price');
               }

               if( event.which == 112) {      // F1 Search
                        $(document).find("div.product-screen div.rightpane div.searchbox input").focus();
                        event.preventDefault();
               }
               if(event.which == 46) {      // Delete remove line 
                        self.pos.get_order().remove_orderline(self.pos.get_order().get_selected_orderline());
               }
               if(event.which == 107) {      // + NumPad increment quantity
			var quantity = self.pos.get_order().get_selected_orderline().get_quantity();
			quantity = quantity+1;
			self.pos.get_order().get_selected_orderline().set_quantity(quantity);
               }
               if(event.which == 109) {      // - NumPad decrement quantity if 0 remove product line 
			var quantity = self.pos.get_order().get_selected_orderline().get_quantity();
                        if (quantity != 1) {
				quantity = quantity-1;
				self.pos.get_order().get_selected_orderline().set_quantity(quantity);
			}
               }
               if(event.which == 32 && $($(document).find(".modal-dialog-product-creation")[0]).hasClass('oe_hidden')) {      // Space go to payment
                        self.actionpad.gui.show_screen('payment');
                        var payMethodLength = $($(document).find("div.payment-screen")[0]).find("div.paymentmethods div.paymentmethod").length;
                        if(payMethodLength > 0){
                                $($($(document).find("div.payment-screen")[0]).find("div.paymentmethods div.paymentmethod")[payMethodLength-2]).addClass('highlight');
                        }
               }

               if(event.which >= 96 && event.which <= 105) {    // click on numpad 1-9 and 0 button
                        var newChar = String.fromCharCode(event.which - 48 );
                        self.numpad.state.appendNewChar(newChar);
               }
               if(event.which == 8){    // Backspace to delete price, quantity, discount if not delete line
                        self.numpad.state.deleteLastChar();
               }
               if(event.which == 38) {      // Up arrow to select upper lines
                        $(document).find("div.product-screen ul.orderlines li.selected").prev('li.orderline').trigger('click');
               }
               if(event.which == 40) {      // Down arrow to select lower lines
                        $(document).find("div.product-screen ul.orderlines li.selected").next('li.orderline').trigger('click');
               }
               if(event.shiftKey && event.which == 55) {      // Shift+7 client list 
			self.gui.show_popup('product_create');
                        self.actionpad.gui.show_screen('clientlist');
               }

            }
                /* payment screen key down events */
                if(!$($(document).find("div.payment-screen")[0]).hasClass('oe_hidden')){
                    if (event.which == 27) {     // click on "Esc" button
                        $($(document).find("div.payment-screen")[0]).find("div.top-content span.back").trigger('click');
                    } else if(event.which == 67) {             // click on "c" button
                        $($(document).find("div.payment-screen")[0]).find("div.js_set_customer").trigger('click');
                    } else if (event.which == 73) {     // click on "i" button
                        $($(document).find("div.payment-screen")[0]).find("div.payment-buttons div.js_invoice").trigger('click');
                    } else if(event.which == 33) {      // click on "Page Up" button
                        if($($(document).find("div.payment-screen")[0]).find("div.paymentmethods div.highlight").length > 0){
                            var elem = $($(document).find("div.payment-screen")[0]).find("div.paymentmethods div.highlight");
                            elem.removeClass("highlight");
                            elem.prev("div.paymentmethod").addClass("highlight");
                        }else{
                            var payMethodLength = $($(document).find("div.payment-screen")[0]).find("div.paymentmethods div.paymentmethod").length;
                            if(payMethodLength > 0){
                                $($($(document).find("div.payment-screen")[0]).find("div.paymentmethods div.paymentmethod")[payMethodLength-1]).addClass('highlight');
                            }
                        }
                    } else if(event.which == 34) {      // click on "Page Down" button
                        if($($(document).find("div.payment-screen")[0]).find("div.paymentmethods div.highlight").length > 0){
                            var elem = $($(document).find("div.payment-screen")[0]).find("div.paymentmethods div.highlight");
                            elem.removeClass("highlight");
                            elem.next("div.paymentmethod").addClass("highlight");
                        }else{
                            var payMethodLength = $($(document).find("div.payment-screen")[0]).find("div.paymentmethods div.paymentmethod").length;
                            if(payMethodLength > 0){
                                $($($(document).find("div.payment-screen")[0]).find("div.paymentmethods div.paymentmethod")[0]).addClass('highlight');
                            }
                        }
                    } else if(event.which == 32) {      // click on "space" button
                        event.preventDefault();
                        $($(document).find("div.payment-screen")[0]).find("div.paymentmethods div.highlight").trigger("click");
                        $($(document).find("div.payment-screen")[0]).find("div.paymentmethods div.paymentmethod").removeClass("highlight");
                    } else if(event.which == 38) {      // click on "Arrow Up" button
                        if($($(document).find("div.payment-screen")[0]).find("table.paymentlines tbody tr.selected").length > 0){
                            $($(document).find("div.payment-screen")[0]).find("table.paymentlines tbody tr.selected").prev("tr.paymentline").trigger("click");
                        }else{
                            var payLineLength = $($(document).find("div.payment-screen")[0]).find("table.paymentlines tbody tr.paymentline").length;
                            if(payLineLength > 0){
                                $($($(document).find("div.payment-screen")[0]).find("table.paymentlines tbody tr.paymentline")[payLineLength-1]).trigger('click');
                            }
                        }
                    } else if(event.which == 40) {      // click on "Arrow Down" button
                        if($($(document).find("div.payment-screen")[0]).find("table.paymentlines tbody tr.selected").length > 0){
                            var elem = $($(document).find("div.payment-screen")[0]).find("table.paymentlines tbody tr.selected").next("tr.paymentline").trigger("click");
                            elem.removeClass("highlight");
                            elem.next("div.paymentmethod").addClass("highlight");
                        }else{
                            var payLineLength = $($(document).find("div.payment-screen")[0]).find("table.paymentlines tbody tr.paymentline").length;
                            if(payLineLength > 0){
                                $($($(document).find("div.payment-screen")[0]).find("table.paymentlines tbody tr.paymentline")[0]).trigger('click');
                            }
                        }
                    } else if(event.which == 46) {      // click on "Delete" button
                        event.preventDefault();
                        $($(document).find("div.payment-screen")[0]).find("table.paymentlines tbody tr.selected td.delete-button").trigger("click");
                    }
                }

                /* clientlist screen key down events */
                if(!$($(document).find("div.clientlist-screen")[0]).hasClass('oe_hidden')){
                    if (event.which == 27) {            // click on "Esc" button
                        $($(document).find("div.clientlist-screen")[0]).find("span.back").trigger('click');
                    } else if(event.which == 83) {      // click on "s" button
                        $(document).find("div.clientlist-screen span.searchbox input").focus();
                        event.preventDefault();
                    } else if(event.which == 38) {      // click on "Arrow Up" button
                        if($(document).find("div.clientlist-screen table.client-list tbody.client-list-contents tr.highlight").length > 0){
                            $(document).find("div.clientlist-screen table.client-list tbody.client-list-contents tr.highlight").prev("tr.client-line").click();
                        }else{
                            var clientLineLength = $(document).find("div.clientlist-screen table.client-list tbody.client-list-contents tr.client-line").length;
                            if(clientLineLength > 0){
                                $($(document).find("div.clientlist-screen table.client-list tbody.client-list-contents tr.client-line")[clientLineLength-1]).click();
                            }
                        }
                    } else if(event.which == 40) {      // click on "Arrow Down" button
                        if($(document).find("div.clientlist-screen table.client-list tbody.client-list-contents tr.highlight").length > 0){
                            $(document).find("div.clientlist-screen table.client-list tbody.client-list-contents tr.highlight").next("tr.client-line").click();
                        }else{
                            var clientLineLength = $(document).find("div.clientlist-screen table.client-list tbody.client-list-contents tr.client-line").length;
                            if(clientLineLength > 0){
                                $($(document).find("div.clientlist-screen table.client-list tbody.client-list-contents tr.client-line")[0]).click();
                            }
                        }
                    } else if(event.which == 13) {      // click on "Enter" button
                        if(!$(document).find("div.clientlist-screen section.top-content span.next").hasClass('oe_hidden')){
                            $(document).find("div.clientlist-screen section.top-content span.next").click();
                        }
                    } else if(event.which == 107) {     // click on numpad "+" button
                        $(document).find("div.clientlist-screen section.top-content span.new-customer").click();
                        $(document).find("div.clientlist-screen section.full-content section.client-details input.client-name").focus();
                        event.preventDefault();
                    }
                }

                /* receipt screen key down events */
                if(!$($(document).find("div.receipt-screen")[0]).hasClass('oe_hidden')){
                    if(event.which == 73){   // click on "i" button
                        $($(document).find("div.receipt-screen")[0]).find("div.print_invoice").trigger("click");
                    } else if(event.which == 82){   // click on "r" button
                        $($(document).find("div.receipt-screen")[0]).find("div.print").trigger("click");
                    } else if(event.which == 13){   // click on "Enter" button
                        $($(document).find("div.receipt-screen")[0]).find("div.top-content span.next").trigger("click");
                    }
                }

                /* shortcut tips modal key down events */
                if(!$($(document).find("div.modal-dialog-shortcut-tips")[0]).hasClass('oe_hidden')){
                    if(event.which == 27) {   // click on "Esc" button
                        $($(document).find("div.modal-dialog-shortcut-tips")[0]).find("footer.footer div.cancel").trigger("click");
                    }
                }
            };
            $(document).find("body").on('keydown', this.product_screen_keydown_event_handler);
        },
        show: function () {
            this._super();
            var self = this;
            $("#shortcut_tips_btn").on("click", function (event) {
                self.gui.show_popup("shortcuttips");
            });
        }
    });

    // return {
    //     'ShortcutTipsWidget': ShortcutTipsWidget
    // };
});
