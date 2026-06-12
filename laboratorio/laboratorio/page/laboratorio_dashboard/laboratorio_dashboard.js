frappe.pages['laboratorio_dashboard'].on_page_load = function(wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: __('Dashboard Laboratorio'),
        single_column: true
    });

    // Añadir botón primario en la barra de herramientas para crear un registro
    page.set_primary_action(__('Nueva Nota'), function() {
        frappe.new_doc('Nota de Estudio', {
            fecha_de_estudio: frappe.datetime.get_today()
        });
    }, 'octicon octicon-plus');

    // Añadir botón secundario para recargar
    page.add_inner_button(__('Recargar'), function() {
        refresh_dashboard(page, wrapper);
    });

    // Contenedor principal del dashboard
    let container = $(`<div class="laboratorio-container">
        <!-- Tarjetas de Estadísticas -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value" id="total-notes-count">0</div>
                <div class="stat-label">${__('Notas Creadas')}</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);">
                <div class="stat-value" id="app-status">${__('Activo')}</div>
                <div class="stat-label">${__('Estado del Módulo')}</div>
            </div>
        </div>

        <!-- Sección de Notas Recientes -->
        <h3 class="dashboard-section-title">${__('Notas de Estudio Recientes')}</h3>
        <div class="notes-grid" id="notes-list-container">
            <div class="empty-state">
                <p>${__('Cargando datos...')}</p>
            </div>
        </div>
    </div>`).appendTo(page.main);

    // Ejecutar la primera carga de datos
    refresh_dashboard(page, wrapper);

    // Cuando el usuario regresa a la página (por ejemplo, después de crear un registro y cerrar el form), refrescar
    $(wrapper).bind('show', function() {
        refresh_dashboard(page, wrapper);
    });
};

function refresh_dashboard(page, wrapper) {
    // Llamada al backend de Python para traer estadísticas frescas
    frappe.call({
        method: 'laboratorio.laboratorio.page.laboratorio_dashboard.laboratorio_dashboard.get_notes_stats',
        callback: function(r) {
            if (r.message) {
                let data = r.message;
                
                // Actualizar contador
                $(wrapper).find('#total-notes-count').text(data.total_notes);

                // Renderizar lista de notas
                let notes_container = $(wrapper).find('#notes-list-container');
                notes_container.empty();

                if (data.recent_notes && data.recent_notes.length > 0) {
                    data.recent_notes.forEach(note => {
                        let date_formatted = frappe.datetime.str_to_user(note.fecha_de_estudio);
                        let card = $(`<div class="note-card" data-name="${note.name}">
                            <div>
                                <div class="note-title">${note.titulo || __('Sin Título')}</div>
                            </div>
                            <div class="note-footer">
                                <span class="note-badge">${note.name}</span>
                                <span>${date_formatted}</span>
                            </div>
                        </div>`);

                        // Hacer que la tarjeta redirija al formulario del DocType al hacer clic
                        card.on('click', function() {
                            frappe.set_route('Form', 'Nota de Estudio', $(this).attr('data-name'));
                        });

                        notes_container.append(card);
                    });
                } else {
                    // Estado vacío
                    notes_container.append(`
                        <div class="empty-state">
                            <h4>${__('No hay notas registradas')}</h4>
                            <p>${__('Crea tu primera nota para verla en este dashboard personalizado.')}</p>
                            <button class="empty-state-btn" id="create-first-note-btn">${__('Crear Nota')}</button>
                        </div>
                    `);

                    $(wrapper).find('#create-first-note-btn').on('click', function() {
                        frappe.new_doc('Nota de Estudio');
                    });
                }
            }
        }
    });
}
