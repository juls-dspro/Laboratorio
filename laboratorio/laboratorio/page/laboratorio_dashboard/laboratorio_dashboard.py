import frappe

@frappe.whitelist()
def get_notes_stats():
    """
    Retorna estadísticas y registros de 'Nota de Estudio' para el Dashboard.
    Esto demuestra cómo conectar el Backend (Python) con el Frontend (JS/HTML).
    """
    total_notes = frappe.db.count('Nota de Estudio')
    recent_notes = frappe.db.get_list(
        'Nota de Estudio', 
        fields=['name', 'titulo', 'fecha_de_estudio', 'owner'], 
        limit=6, 
        order_by='creation desc'
    )
    return {
        "total_notes": total_notes,
        "recent_notes": recent_notes
    }
