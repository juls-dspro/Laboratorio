# Guía de Creación y Configuración de Custom Apps en Frappe

Esta guía explica detalladamente la estructura de una **Aplicación Personalizada (Custom App)** en Frappe Framework y cómo gestionarla para desarrollar módulos a la medida de un cliente.

---

## 📂 Estructura de Directorios de una Custom App

Cuando creas una aplicación con `bench new-app laboratorio`, se genera la siguiente estructura de archivos dentro de `apps/laboratorio/`:

```text
apps/laboratorio/
├── pyproject.toml              # Definición de dependencias de Python de tu app.
├── package.json                # Definición de dependencias de Node.js (JavaScript).
├── license.txt                 # Licencia de distribución de tu aplicación.
└── laboratorio/                # Carpeta principal de tu código fuente
    ├── __init__.py
    ├── hooks.py                # CONFIGURACIÓN CLAVE: Enlaza tu app con el resto de ERPNext.
    ├── modules.txt             # Lista de módulos incluidos en tu app (e.g. Laboratorio).
    ├── patches.txt             # Historial de parches internos de migración.
    ├── templates/              # Plantillas para vistas web (HTML/Jinja).
    ├── www/                    # Páginas web públicas servidas directamente.
    └── laboratorio/            # Módulo por defecto de la aplicación (creado por modules.txt)
        ├── __init__.py
        └── doctype/            # Directorio donde se almacenarán tus DocTypes personalizados.
```

---

## 🔗 El Archivo `hooks.py` (La Llave de Integración)

El archivo `hooks.py` le indica a Frappe cómo debe interactuar tu aplicación personalizada con otras aplicaciones instaladas (como `erpnext`). Aquí se configuran las extensiones más comunes:

### 1. Inyección de JavaScript/CSS en vistas existentes
Si deseas agregar comportamientos visuales o validaciones a pantallas nativas de ERPNext (por ejemplo, al formulario de *Customer* o *Sales Invoice*):

```python
# Carga un script JavaScript cada vez que se abre la vista del DocType "Customer"
doctype_js = {
    "Customer": "public/js/customer_customization.js"
}
```

### 2. Eventos de Base de Datos (Doc Events)
Puedes ejecutar funciones en segundo plano en Python cuando ocurran acciones sobre registros nativos de ERPNext (antes de guardar, al confirmar, al cancelar):

```python
doc_events = {
    "Sales Invoice": {
        "validate": "laboratorio.laboratorio.api.validar_factura",
        "on_submit": "laboratorio.laboratorio.api.notificar_pago"
    }
}
```
*En este ejemplo, cuando alguien intente guardar una factura de venta, Frappe llamará primero a la función `validar_factura` dentro de tu código.*

---

## 📦 Exportar Personalizaciones (Fixtures)

Cuando personalizas campos de un DocType existente de ERPNext usando la interfaz web (*Customize Form*), estos cambios se guardan por defecto en la base de datos de tu máquina. 

Para empaquetar estas modificaciones en tu Custom App y que tus compañeros desarrolladores las obtengan al clonar el repositorio, debes usar **Fixtures**:

1. Ve a `apps/laboratorio/laboratorio/hooks.py`.
2. Agrega al final del archivo lo que quieres exportar:
   ```python
   fixtures = [
       # Exporta todos los campos personalizados que agregaste a DocTypes existentes
       "Custom Field", 
       # Exporta cambios de propiedades de campos (ej. hacer obligatorio un campo)
       "Property Setter"
   ]
   ```
3. Ejecuta en la terminal de tu bench:
   ```bash
   bench --site erp.local export-fixtures
   ```
4. Frappe creará una carpeta llamada `fixtures/` dentro de tu aplicación con archivos JSON. Añade estos archivos a tu control de versiones con Git.

---

## 🚀 Ciclo de Distribución en Equipo

Para compartir tu Custom App con otros desarrolladores a través de GitHub:

1. **Subir cambios**:
   ```bash
   cd apps/laboratorio
   git init (si no está inicializado)
   git add .
   git commit -m "feat: Agregar modulo de notas"
   git push origin main
   ```

2. **Descargar cambios en otra computadora**:
   Otro desarrollador en su propio bench ejecutará:
   ```bash
   bench get-app https://github.com/tu-usuario/laboratorio.git
   bench --site erp.local install-app laboratorio
   bench --site erp.local migrate
   ```
   *(El comando `migrate` leerá automáticamente tus DocTypes y fixtures de la carpeta de código y los creará en su base de datos local).*
