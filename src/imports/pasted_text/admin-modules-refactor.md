Necesito realizar una reorganización del navbar y crear nuevos módulos administrativos dentro de mi aplicación web.

La aplicación utiliza un sistema de múltiples empresas o razones sociales, por lo que todas las vistas y funcionalidades deben respetar la razón social seleccionada.

## Objetivo general

Implementar los siguientes cambios:

1. Reorganizar el navbar.
2. Mover la búsqueda general a las vistas que realmente la necesiten.
3. Agregar un selector de razón social en el navbar.
4. Crear menús desplegables para Configuración y Recepción.
5. Implementar los módulos de:

   * Usuarios.
   * Roles.
   * Razones sociales.
   * Casinos.
   * Reglas PUC.
   * Portal DIAN.

Todos los módulos deben conservar el mismo diseño visual actual de la aplicación, incluyendo:

* Modo claro y oscuro.
* Componentes responsivos.
* Estilos con Tailwind CSS.
* Iconos Bootstrap Icons.
* Tarjetas, tablas, botones y modales con el mismo estilo visual del proyecto.
* Protección CSRF en todos los formularios.
* Mensajes de éxito o error después de cada operación.
* Validaciones tanto en frontend como en backend.

---

# 1. Cambios en el navbar

Eliminar la opción de búsqueda global que actualmente se encuentra en el navbar.

En su lugar, agregar un selector desplegable para cambiar rápidamente entre las diferentes razones sociales registradas.

El selector debe:

* Mostrar la razón social actualmente activa.
* Listar todas las razones sociales disponibles para el usuario.
* Permitir cambiar de razón social sin cerrar sesión.
* Mantener la razón social seleccionada durante la navegación.
* Actualizar la información de las vistas según la razón social seleccionada.
* Mostrar un mensaje cuando no existan razones sociales registradas.

La barra de búsqueda debe trasladarse a cada listado, junto con sus respectivos filtros.

---

# 2. Menú desplegable de Configuración

Convertir la opción “Configuración” del navbar o sidebar en un menú desplegable.

Debe contener las siguientes opciones:

* Usuarios.
* Roles.
* Razones sociales.
* Casinos.

Cada opción debe tener su propia ruta, vista, permisos y controlador.

---

# 3. Módulo de Usuarios

Crear una vista de listado de usuarios.

## Funcionalidades del listado

La vista debe incluir:

* Campo de búsqueda.
* Filtros de búsqueda.
* Botón “Nuevo usuario”.
* Botón “Exportar Excel”.
* Botón “Importar Excel”.
* Tabla con los usuarios registrados.
* Paginación si el número de registros es alto.
* Acciones para ver, editar, activar, desactivar o eliminar usuarios, según las reglas actuales del proyecto.

La búsqueda debe permitir filtrar al menos por:

* Nombre.
* Cédula.
* Correo.
* Teléfono.
* Cargo.
* Ciudad.
* Rol.
* Estado.

## Crear usuario

El formulario de creación debe abrirse dentro de un modal en la misma vista del listado.

El formulario debe contener:

* Nombre completo.
* Cédula.
* Correo electrónico.
* Teléfono.
* Contraseña.
* Confirmación de contraseña.
* Cargo.
* Ciudad.
* Select de rol.
* Estado activo o inactivo, si aplica.

Al crear el usuario:

* Validar que la cédula no esté repetida.
* Validar que el correo no esté repetido.
* Validar el formato del correo.
* Validar la seguridad y confirmación de la contraseña.
* Guardar la contraseña cifrada.
* Cerrar el modal.
* Redirigir o regresar al listado.
* Mostrar el usuario recién creado en la tabla.
* Mostrar un mensaje de creación exitosa.

## Importar usuarios desde Excel

La opción de importar Excel debe:

* Permitir seleccionar un archivo `.xlsx`.
* Validar las columnas requeridas.
* Informar registros correctos y registros con errores.
* Evitar duplicados de cédula o correo.
* Permitir descargar una plantilla de ejemplo.
* Mostrar un resumen final de la importación.

## Exportar usuarios a Excel

La exportación debe incluir los usuarios que correspondan a los filtros aplicados en la vista.

No se debe exportar la contraseña ni información sensible.

---

# 4. Módulo de Roles

Crear una vista de listado de roles.

## Funcionalidades del listado

Debe incluir:

* Campo de búsqueda.
* Botón “Nuevo rol”.
* Tabla de roles.
* Cantidad de usuarios asociados a cada rol.
* Estado del rol, si aplica.
* Acciones de editar, activar, desactivar o eliminar.

La búsqueda debe filtrar por:

* Nombre.
* Descripción.

## Crear rol

El formulario debe abrirse en un modal dentro del listado.

Debe contener:

* Nombre del rol.
* Descripción.

Al crear el rol:

* Validar que el nombre no esté repetido.
* Guardar el registro.
* Cerrar el modal.
* Regresar o permanecer en el listado.
* Mostrar el nuevo rol en la tabla.
* Mostrar un mensaje de creación exitosa.

No se debe permitir eliminar un rol que tenga usuarios asociados, a menos que primero se reasignen esos usuarios.

---

# 5. Módulo de Razones Sociales

Crear una vista de listado de razones sociales.

## Funcionalidades del listado

Debe incluir:

* Campo de búsqueda.
* Botón “Nueva razón social”.
* Tabla de razones sociales.
* Estado activo o inactivo.
* Acciones de editar, activar, desactivar o eliminar.

La búsqueda debe filtrar por:

* Nombre.
* Dirección.
* Correo.
* Teléfono.

## Crear razón social

El formulario debe abrirse en un modal dentro del listado.

Debe contener:

* Nombre.
* Dirección.
* Correo electrónico.
* Teléfono.

Al crear la razón social:

* Validar los campos obligatorios.
* Validar el formato del correo.
* Guardar el registro.
* Cerrar el modal.
* Regresar o permanecer en el listado.
* Mostrar la nueva razón social en la tabla.
* Actualizar el selector de razones sociales del navbar.
* Mostrar un mensaje de creación exitosa.

No se debe eliminar una razón social si tiene casinos, usuarios, documentos o configuraciones asociadas. En ese caso, debe ofrecerse la opción de desactivarla.

---

# 6. Módulo de Casinos

Crear una vista de listado de casinos.

## Funcionalidades del listado

Debe incluir:

* Campo de búsqueda.
* Filtros.
* Botón “Nuevo casino”.
* Tabla de casinos.
* Acciones de editar, activar, desactivar o eliminar.

La búsqueda debe permitir filtrar por:

* Nombre.
* Dirección.
* Código DANE.
* Razón social.
* Código del establecimiento.

## Crear casino

El formulario debe abrirse en un modal dentro del listado.

Debe contener:

* Nombre del casino.
* Dirección.
* Código DANE.
* Select de razón social a la que pertenece.
* Código del establecimiento.

Al crear el casino:

* Validar que la razón social seleccionada exista.
* Validar los campos obligatorios.
* Validar si el código del establecimiento debe ser único.
* Guardar el registro.
* Cerrar el modal.
* Regresar o permanecer en el listado.
* Mostrar el nuevo casino en la tabla.
* Mostrar un mensaje de creación exitosa.

El listado debe mostrar claramente la razón social a la que pertenece cada casino.

---

# 7. Menú desplegable de Recepción

Convertir la opción “Recepción” en un menú desplegable.

Debe contener:

* Portal DIAN.
* Reglas PUC.

Mantener dentro de Recepción cualquier funcionalidad existente que continúe siendo necesaria, sin eliminar rutas o procesos actuales.

---

# 8. Módulo de Reglas PUC

Crear una vista de listado de reglas PUC.

## Funcionalidades del listado

Debe incluir:

* Campo de búsqueda.
* Filtros.
* Botón “Nueva regla PUC”.
* Tabla con las reglas existentes.
* Filtro por razón social.
* Estado activo o inactivo.
* Acciones para ver, editar, activar, desactivar o eliminar.

La búsqueda debe permitir filtrar por los principales datos de la regla, por ejemplo:

* Nombre o descripción.
* Concepto.
* Cuenta contable.
* Tipo de documento.
* Proveedor.
* NIT.
* Razón social.
* Estado.

## Crear regla PUC

Crear un formulario independiente para registrar una nueva regla PUC.

A diferencia de los módulos anteriores, este formulario puede abrirse en una nueva vista.

Al guardar:

* Validar los campos obligatorios.
* Validar que la razón social exista.
* Guardar la regla.
* Redirigir al listado de Reglas PUC.
* Mostrar la nueva regla en la tabla.
* Mostrar un mensaje de creación exitosa.

El formulario debe incluir los campos necesarios de acuerdo con el modelo actual de reglas PUC del proyecto. No se deben eliminar campos o funcionalidades existentes.

---

# 9. Módulo Portal DIAN

Crear una vista llamada “Portal DIAN”.

En este módulo se implementará posteriormente una automatización relacionada con la recepción y consulta de documentos de la DIAN.

Por ahora, la interfaz debe construirse tomando como referencia exacta la imagen adjunta.

La vista debe respetar:

* Distribución visual.
* Tarjetas.
* Botones.
* Colores.
* Espaciados.
* Tabla o listado.
* Indicadores de estado.
* Filtros.
* Diseño responsivo.
* Modo oscuro.

Aunque inicialmente algunos botones puedan quedar preparados sin toda la automatización final, la estructura debe quedar lista para conectar posteriormente:

* Consulta de documentos.
* Descarga de documentos.
* Sincronización.
* Procesamiento de facturas.
* Estados del proceso.
* Registro de errores.
* Historial de ejecuciones.

No inventes una interfaz diferente: usa la imagen adjunta como referencia principal para diseñar la vista.

---

# 10. Requisitos técnicos generales

Implementar todos los cambios de forma completa, incluyendo:

* Modelos de base de datos.
* Relaciones entre entidades.
* Migraciones.
* Formularios.
* Validadores.
* Rutas.
* Controladores.
* Servicios.
* Templates HTML/Jinja.
* JavaScript necesario para modales, filtros e importaciones.
* Permisos por módulo.
* Manejo de errores.
* Mensajes flash.
* Protección CSRF.
* Consultas filtradas por razón social.
* Paginación.
* Diseño responsivo.

Las relaciones principales deben contemplar:

* Una razón social puede tener muchos casinos.
* Un casino pertenece a una razón social.
* Un usuario tiene un rol.
* Un rol puede tener muchos usuarios.
* Las reglas PUC pueden pertenecer a una razón social.
* Los documentos del Portal DIAN deben quedar asociados a una razón social y, cuando corresponda, a un casino.

---

# 11. Comportamiento de búsqueda y filtros

Cada vista de listado debe tener su propia búsqueda.

No debe existir una búsqueda general en el navbar.

Los filtros deben:

* Trabajar mediante parámetros GET.
* Mantener los valores seleccionados después de realizar la búsqueda.
* Incluir un botón para limpiar filtros.
* Funcionar junto con la paginación.
* Ser compatibles con la exportación a Excel.
* Filtrar los registros según la razón social activa cuando corresponda.

---

# 12. Resultado esperado

Entrega el código completo de todos los archivos creados o modificados.

Para cada archivo, indica claramente:

1. Ruta del archivo.
2. Código completo.
3. Explicación breve de su función.
4. Dependencias o migraciones que deben ejecutarse.
5. Orden recomendado para implementar los cambios.

No entregues únicamente fragmentos de código.

No uses pseudocódigo.

No elimines funciones que ya estén operativas en el proyecto.

Antes de escribir el código, analiza la estructura actual del proyecto, los modelos, las rutas, los permisos, los templates y la base de datos para integrar los cambios sin duplicar funcionalidades ni romper los módulos existentes.
