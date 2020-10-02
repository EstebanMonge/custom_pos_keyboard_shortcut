# Copyright (C) 2020: Esteban Monge (https://www.sempai.space)
# @author: Esteban Monge (https://www.sempai.space)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_generic_product = fields.Many2one(
        'product.product', 'Generic Product',
        #change_default=True, default=_get_default_category_id,
        required=True,
        help="Select generic product")
