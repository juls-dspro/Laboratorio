// Copyright (c) 2026, Laboratorio and contributors
// For license information, please see license.txt

frappe.ui.form.on('Nota de Estudio', {
	refresh(frm) {
		// Mostrar un mensaje de bienvenida cuando se cargue el formulario
		frappe.msgprint(__('¡Bienvenido a tu primer DocType en Frappe!'));
	}
});
