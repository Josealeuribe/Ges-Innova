Necesito ampliar y reorganizar varios módulos de mi aplicación web, principalmente el comportamiento del sidebar y los módulos de Activos, Contadores y Ocupación.

La implementación debe conservar la arquitectura, diseño y tecnologías actuales del proyecto. Antes de escribir código, analiza la estructura existente, incluyendo modelos, rutas, controladores, servicios, formularios, permisos, templates, estilos y base de datos.

No elimines funcionalidades existentes ni dupliques módulos que ya estén implementados.

# Objetivo general

Implementar los siguientes cambios:

1. Controlar la apertura de los menús desplegables del sidebar.
2. Crear el módulo de Inventario de activos.
3. Crear el módulo de Máquinas.
4. Crear el módulo de carga y listado de formularios F.18.
5. Crear el módulo de Ocupación.
6. Implementar un panel de análisis de ocupación.
7. Implementar el registro de tomas de asistencia de jugadores.

Todos los módulos deben conservar:

* El diseño visual actual de la aplicación.
* Modo claro y oscuro.
* Diseño responsivo.
* Tailwind CSS.
* Bootstrap Icons, si ya se utilizan.
* Protección CSRF.
* Validaciones en frontend y backend.
* Mensajes de éxito y error.
* Control de permisos por usuario y rol.
* Filtros mediante parámetros GET.
* Paginación en los listados.
* Consultas filtradas por razón social y casino cuando corresponda.

---

# 1. Comportamiento del sidebar

Modificar el sidebar para controlar la apertura de los menús desplegables.

## Regla principal

El sidebar no puede tener más de dos módulos desplegables abiertos al mismo tiempo.

Por ejemplo:

* Puede estar abierto “Activos” y “Configuración”.
* Si el usuario abre un tercer módulo, debe cerrarse automáticamente el módulo que lleve más tiempo abierto.
* Los enlaces simples que no tienen submenú no cuentan como módulos desplegados.

## Requisitos de funcionamiento

* Cada módulo desplegable debe tener una animación suave.
* El módulo activo debe permanecer visualmente resaltado.
* La opción interna seleccionada también debe quedar resaltada.
* Al recargar la página, debe mantenerse abierto el módulo al que pertenece la ruta actual.
* Si existe otro módulo abierto manualmente, puede conservarse siempre que no se supere el máximo de dos.
* El comportamiento debe funcionar correctamente tanto en escritorio como en dispositivos móviles.
* En dispositivos móviles, al seleccionar una opción, el sidebar puede cerrarse automáticamente.
* Debe evitarse que los submenús se superpongan visualmente.
* Debe respetarse la accesibilidad mediante atributos como `aria-expanded` y `aria-controls`.

---

# 2. Menú desplegable de Activos

La opción “Activos” del sidebar debe convertirse en un menú desplegable.

Debe contener:

* Inventario.
* Máquinas.

Cada opción debe tener su propia ruta, permisos, controlador, servicio, formularios y vistas.

---

# 3. Módulo de Inventario

Crear un módulo para gestionar el inventario general de activos.

## Vista de listado

El módulo debe tener una vista principal con el listado de activos registrados.

La vista debe incluir:

* Campo de búsqueda.
* Filtros avanzados.
* Botón “Nuevo activo”.
* Tabla de activos.
* Paginación.
* Botón para limpiar filtros.
* Acciones para ver, editar, cambiar estado y eliminar o desactivar.
* Vista previa de las fotografías.
* Exportación a Excel, si la arquitectura actual ya contempla exportaciones.

## Opciones de búsqueda

La búsqueda debe permitir consultar por:

* Código.
* Nombre.
* Referencia.
* Serial.
* Responsable.
* Casino.
* Clasificación.
* Estado.

## Filtros

Debe permitir filtrar por:

* Razón social.
* Casino.
* Clasificación.
* Estado.
* Responsable.
* Rango de fechas de adquisición.
* Rango de valores.

Los filtros deben mantenerse después de realizar la búsqueda y deben funcionar junto con la paginación.

## Crear nuevo activo

La opción “Nuevo activo” debe abrir un formulario de creación.

El formulario puede estar en una vista independiente.

Debe contener los siguientes campos:

* Foto del serial.
* Foto del estado actual.
* Código.
* Nombre.
* Referencia o serial.
* Clasificación.
* Estado.
* Valor.
* Casino.
* Responsable.
* Fecha de adquisición.
* Observaciones.

## Detalle de los campos

### Foto del serial

* Permitir adjuntar una imagen.
* Validar extensiones permitidas.
* Validar tamaño máximo.
* Mostrar vista previa antes de guardar.
* Guardar la ruta o identificador de la imagen.

### Foto del estado actual

* Permitir adjuntar una imagen.
* Validar formato y tamaño.
* Mostrar vista previa.
* Debe representar la condición física actual del activo.

### Código

* Debe ser obligatorio.
* Debe ser único.
* No debe permitir duplicados.

### Nombre

* Debe ser obligatorio.

### Referencia o serial

* Debe permitir registrar el serial, referencia o identificador del fabricante.
* Validar duplicados cuando corresponda.

### Clasificación

Debe implementarse como un select o catálogo administrable.

Ejemplos de clasificación:

* Equipo tecnológico.
* Mueble.
* Herramienta.
* Equipo de seguridad.
* Máquina.
* Elemento locativo.
* Otro.

No limitarse únicamente a estos ejemplos si el proyecto ya tiene un catálogo de clasificaciones.

### Estado

Debe ser un select con estados administrables o previamente definidos.

Estados iniciales sugeridos:

* Nuevo.
* Bueno.
* Regular.
* Malo.
* En mantenimiento.
* Fuera de servicio.
* Dado de baja.

### Valor

* Debe ser un campo numérico.
* No debe aceptar valores negativos.
* Debe mostrarse con formato de moneda.

### Casino

* Debe ser un select.
* Debe mostrar los casinos disponibles según la razón social activa.
* No debe permitir seleccionar casinos de una razón social diferente.

### Responsable

* Debe permitir seleccionar un usuario o registrar el nombre del responsable, según la estructura actual del proyecto.
* Preferiblemente debe relacionarse con un usuario existente.

### Fecha de adquisición

* Debe ser una fecha válida.
* No debe permitir fechas futuras, salvo que exista una necesidad funcional específica.

### Observaciones

* Campo de texto amplio.
* Debe permitir registrar información sobre estado físico, ubicación, garantía o mantenimiento.

## Comportamiento al crear

Al guardar el activo:

* Validar todos los campos obligatorios.
* Validar el código único.
* Guardar las imágenes.
* Guardar la relación con el casino.
* Guardar la relación con la razón social.
* Guardar el usuario que creó el registro.
* Redirigir al listado de inventario.
* Mostrar el activo recién creado.
* Mostrar un mensaje de creación exitosa.

---

# 4. Módulo de Máquinas

Crear un módulo especializado para gestionar máquinas de juego o equipos asociados a la operación de los casinos.

## Relación con Inventario

Cada máquina debe estar relacionada con un activo previamente creado en el módulo de Inventario.

Una máquina no debe existir sin un activo relacionado.

El activo relacionado debe permitir identificar información general como:

* Código.
* Nombre.
* Estado.
* Valor.
* Responsable.
* Fotografías.
* Fecha de adquisición.

La información específica de la máquina debe almacenarse en el módulo de Máquinas.

## Vista de listado

Crear una vista con el listado de máquinas.

Debe incluir:

* Campo de búsqueda.
* Filtros.
* Botón “Nueva máquina”.
* Tabla de máquinas.
* Paginación.
* Acciones para ver, editar, activar, desactivar o eliminar.
* Acceso al documento legal adjunto.
* Enlace al activo relacionado.

## Opciones de búsqueda

Permitir buscar por:

* Código del activo.
* Nombre del activo.
* Serial.
* Número interno.
* NUC.
* NUID.
* Marca.
* Modelo.
* Código de apuesta.
* Casino.
* Proveedor.
* Laboratorio.

## Filtros

Debe permitir filtrar por:

* Razón social.
* Casino.
* Estado del activo.
* Marca.
* Modelo.
* País de origen.
* Tipo de máquina.
* Proveedor.
* Laboratorio.
* Protocolo.
* Rango de fechas de fabricación.

## Crear nueva máquina

La opción “Nueva máquina” debe abrir un formulario independiente.

Debe contener los siguientes campos:

* Activo relacionado.
* Casino.
* Serial.
* Número interno.
* NUC.
* NUID.
* Marca.
* Modelo.
* País de origen.
* Fecha de fabricación.
* Tipo de máquina.
* Código de apuesta.
* Juego misterioso.
* Proveedor SCLM.
* Laboratorio.
* SCLM.
* Protocolo.
* Tope rollover.
* Documento legal.

## Detalle de los campos

### Activo relacionado

* Debe ser un select obligatorio.
* Solo debe mostrar activos disponibles que puedan asociarse a una máquina.
* Debe mostrar al menos el código, nombre, serial y casino del activo.
* Un activo no debe quedar asociado a más de una máquina, salvo que el modelo del negocio lo permita explícitamente.

### Casino

* Debe ser un select obligatorio.
* Debe pertenecer a la razón social activa.
* Debe coincidir con el casino del activo relacionado.
* Si el activo ya tiene casino, el formulario debe completarlo automáticamente.
* No debe permitir inconsistencias entre el casino del activo y el casino de la máquina.

### Serial

* Debe ser obligatorio.
* Debe validar duplicados.

### Número interno

* Debe permitir identificar la máquina dentro de la organización.
* Debe validarse su unicidad dentro del casino o razón social, según la regla del negocio.

### NUC

* Debe ser un campo de texto.
* Validar longitud y formato si existe una regla definida.

### NUID

* Debe ser un campo de texto.
* Validar longitud y formato si existe una regla definida.

### Marca

* Campo de texto o catálogo administrable.

### Modelo

* Campo de texto.
* Puede depender de la marca si existe un catálogo.

### País de origen

* Debe implementarse como select de países o campo controlado.

### Fecha de fabricación

* Debe ser una fecha válida.
* No debe ser posterior a la fecha actual.

### Tipo de máquina

Debe ser un select.

Debe permitir utilizar los tipos definidos en el negocio. Si no existe un catálogo, crear uno administrable.

### Código de apuesta

* Campo alfanumérico.
* Validar duplicados cuando corresponda.

### Juego misterioso

* Debe definirse como un campo booleano o select.
* Opciones sugeridas:

  * Sí.
  * No.

Si requiere información adicional, permitir registrar el nombre o identificador del juego misterioso.

### Proveedor SCLM

* Debe ser un select o catálogo de proveedores.
* Debe permitir relacionar la máquina con su proveedor tecnológico.

### Laboratorio

* Debe ser un select o catálogo.
* Debe permitir registrar el laboratorio certificador.

### SCLM

* Debe permitir registrar el sistema de conexión o monitoreo asociado.
* Determinar si debe ser texto, select o relación con otro catálogo según la estructura actual.

### Protocolo

* Debe ser un select o catálogo administrable.
* Ejemplos:

  * SAS.
  * G2S.
  * Otro.

No limitarse a estos ejemplos si el proyecto ya maneja protocolos específicos.

### Tope rollover

* Campo numérico o monetario.
* No debe aceptar valores negativos.
* Debe respetar la precisión necesaria.

### Documento legal

* Permitir adjuntar un documento.
* Formatos permitidos sugeridos:

  * PDF.
  * DOC.
  * DOCX.
  * Imagen.
* Validar tamaño máximo.
* Guardar el archivo de forma segura.
* Permitir visualizarlo o descargarlo desde el detalle de la máquina.
* Registrar fecha de carga y usuario que lo adjuntó.

## Comportamiento al crear

Al guardar una máquina:

* Validar el activo relacionado.
* Validar que el activo no esté asociado a otra máquina.
* Validar que activo y máquina pertenezcan al mismo casino.
* Validar serial, número interno y códigos únicos.
* Guardar el documento legal.
* Registrar el usuario creador.
* Redirigir al listado de máquinas.
* Mostrar la máquina recién creada.
* Mostrar un mensaje de creación exitosa.

---

# 5. Menú desplegable de Contadores

La opción “Contadores” del sidebar debe ser un menú desplegable.

Debe contener:

* Cargar F.18.
* Listado F.18.

También puede mostrarse como una sola opción llamada “F.18”, siempre que dentro de la vista existan claramente el listado y la opción de carga.

---

# 6. Módulo F.18

Crear un módulo para cargar y consultar formularios o archivos F.18.

## Vista principal

La vista debe incluir:

* Listado de archivos F.18 cargados.
* Campo de búsqueda.
* Filtros.
* Botón “Cargar F.18”.
* Paginación.
* Acciones para ver detalle, descargar, procesar, corregir o eliminar.
* Indicador de estado del procesamiento.

## Campos del listado

La tabla debe mostrar al menos:

* Nombre del archivo.
* Razón social.
* Casino.
* Periodo.
* Fecha de carga.
* Usuario que realizó la carga.
* Estado.
* Cantidad de registros.
* Registros correctos.
* Registros con errores.
* Acciones.

## Estados sugeridos

* Pendiente.
* Cargando.
* Procesando.
* Procesado.
* Procesado con errores.
* Rechazado.

## Búsqueda y filtros

Permitir buscar o filtrar por:

* Nombre del archivo.
* Razón social.
* Casino.
* Periodo.
* Estado.
* Usuario que cargó el archivo.
* Rango de fechas de carga.

## Carga de F.18

La opción “Cargar F.18” debe abrir un formulario o modal.

Debe contener:

* Razón social.
* Casino.
* Periodo.
* Archivo F.18.
* Observaciones.

## Validaciones

* Validar el tipo de archivo permitido.
* Validar tamaño máximo.
* Validar que el casino pertenezca a la razón social seleccionada.
* Validar estructura y columnas requeridas.
* Evitar cargas duplicadas del mismo periodo y casino, salvo que se trate de una corrección autorizada.
* Informar errores de estructura.
* Mostrar resumen de registros correctos e incorrectos.
* Guardar un historial de cargas.

## Resultado de la carga

Después de cargar:

* Guardar el archivo.
* Procesar la información.
* Registrar errores encontrados.
* Redirigir al listado.
* Mostrar el archivo cargado.
* Mostrar el estado del procesamiento.
* Permitir consultar los errores de la carga.

---

# 7. Menú desplegable de Ocupación

La opción “Ocupación” del sidebar debe convertirse en un menú desplegable.

Debe contener:

* Panel de análisis.
* Registro de tomas.

La ocupación corresponde a la asistencia o presencia de jugadores en los casinos.

---

# 8. Registro de tomas

Crear un módulo para registrar tomas de asistencia u ocupación de jugadores.

Una toma representa un conteo realizado en un casino en una fecha y hora determinada.

## Vista de listado

Debe incluir:

* Campo de búsqueda.
* Filtros.
* Botón “Nueva toma”.
* Tabla de registros.
* Paginación.
* Acciones para ver, editar, anular o eliminar, según permisos.
* Indicador del usuario que realizó la toma.

## Datos de una toma

El formulario debe incluir al menos:

* Razón social.
* Casino.
* Fecha.
* Hora.
* Cantidad de jugadores.
* Zona o área.
* Tipo de toma.
* Responsable de la toma.
* Observaciones.

Si el negocio necesita registrar ocupación por máquina, mesa, zona o sala, dejar el modelo preparado para guardar el detalle.

## Tipos de toma sugeridos

* Manual.
* Automática.
* Apertura.
* Control periódico.
* Cierre.
* Extraordinaria.

## Reglas de negocio

* El casino debe pertenecer a la razón social seleccionada.
* La cantidad de jugadores no puede ser negativa.
* La fecha y hora no pueden ser futuras, salvo que se permita programar tomas.
* Debe registrarse el usuario que creó la toma.
* Debe evitarse duplicar una toma del mismo casino, fecha, hora y zona.
* Las tomas anuladas no deben eliminarse físicamente si son necesarias para auditoría.
* Al editar una toma, guardar historial de cambios.
* Debe ser posible registrar varias tomas durante el mismo día.

## Comportamiento al guardar

Después de crear una toma:

* Validar la información.
* Guardar el registro.
* Registrar usuario, fecha y hora de creación.
* Redirigir al listado.
* Mostrar la toma recién creada.
* Actualizar la información del panel de análisis.
* Mostrar un mensaje de creación exitosa.

---

# 9. Panel de análisis de ocupación

Crear un panel visual para analizar la asistencia y ocupación de jugadores.

## Indicadores principales

El panel debe mostrar al menos:

* Total de jugadores registrados hoy.
* Promedio de ocupación diaria.
* Casino con mayor ocupación.
* Casino con menor ocupación.
* Hora con mayor número de jugadores.
* Variación frente al día anterior.
* Variación frente a la semana anterior.
* Número de tomas realizadas.
* Última toma registrada.

## Filtros del panel

Debe permitir filtrar por:

* Razón social.
* Casino.
* Fecha.
* Rango de fechas.
* Zona.
* Tipo de toma.
* Responsable.

## Gráficas sugeridas

Implementar gráficas para:

* Ocupación por hora.
* Ocupación por día.
* Ocupación por casino.
* Comparación entre casinos.
* Tendencia semanal.
* Tendencia mensual.
* Distribución por zonas.
* Horarios con mayor asistencia.

## Tablas del panel

Incluir una tabla de resumen con:

* Casino.
* Fecha.
* Cantidad de tomas.
* Total de jugadores.
* Promedio de jugadores.
* Máximo registrado.
* Mínimo registrado.
* Hora de mayor ocupación.

## Requisitos de las gráficas

* Deben actualizarse según los filtros.
* Deben funcionar en modo claro y oscuro.
* Deben ser responsivas.
* Deben incluir etiquetas y tooltips.
* No deben cargar datos de casinos que el usuario no tenga permiso de consultar.
* Deben mostrar un estado vacío cuando no existan registros.

---

# 10. Modelos y relaciones sugeridas

Analiza los modelos actuales antes de crear nuevas tablas.

Las relaciones principales deben contemplar:

## Activo

Un activo debe poder tener:

* Una razón social.
* Un casino.
* Un responsable.
* Una clasificación.
* Un estado.
* Fotografías.
* Una máquina relacionada, si aplica.

## Máquina

Una máquina debe:

* Pertenecer a un activo.
* Pertenecer a un casino.
* Pertenecer indirectamente a una razón social.
* Tener información técnica.
* Tener documentos legales asociados.

## Archivo F.18

Un archivo F.18 debe:

* Pertenecer a una razón social.
* Pertenecer a un casino.
* Tener un periodo.
* Tener un estado de procesamiento.
* Registrar el usuario que realizó la carga.
* Tener detalle de errores y resultados.

## Toma de ocupación

Una toma debe:

* Pertenecer a una razón social.
* Pertenecer a un casino.
* Registrar fecha y hora.
* Registrar cantidad de jugadores.
* Registrar usuario creador.
* Permitir detalle por zona o área.

---

# 11. Auditoría

Los registros principales deben incluir campos de auditoría:

* Fecha de creación.
* Fecha de actualización.
* Usuario creador.
* Usuario que realizó la última modificación.
* Estado activo o inactivo.
* Fecha de eliminación lógica, si aplica.

Aplicar auditoría especialmente en:

* Activos.
* Máquinas.
* Documentos legales.
* Cargas F.18.
* Tomas de ocupación.

---

# 12. Seguridad y permisos

Crear permisos independientes para:

* Ver inventario.
* Crear activos.
* Editar activos.
* Eliminar o desactivar activos.
* Ver máquinas.
* Crear máquinas.
* Editar máquinas.
* Adjuntar documentos legales.
* Descargar documentos legales.
* Ver F.18.
* Cargar F.18.
* Procesar F.18.
* Eliminar cargas F.18.
* Ver panel de ocupación.
* Registrar tomas.
* Editar tomas.
* Anular tomas.

El sidebar solo debe mostrar opciones para las cuales el usuario tenga permiso.

Las rutas también deben validar permisos en backend. No es suficiente con ocultar la opción visualmente.

---

# 13. Requisitos técnicos generales

Implementar de forma completa:

* Modelos.
* Migraciones.
* Relaciones de base de datos.
* Rutas.
* Controladores.
* Servicios.
* Formularios.
* Validadores.
* Templates.
* JavaScript.
* Manejo de imágenes.
* Manejo de documentos.
* Paginación.
* Filtros.
* Permisos.
* Auditoría.
* Mensajes flash.
* Protección CSRF.
* Manejo de errores.
* Diseño responsivo.
* Modo oscuro.

No uses pseudocódigo.

No entregues solamente fragmentos aislados.

No reemplaces archivos completos sin revisar primero el contenido existente.

No elimines funciones actuales que no estén relacionadas con estos cambios.

---

# 14. Resultado esperado

Entrega el código completo de todos los archivos creados o modificados.

Para cada archivo, indica:

1. Ruta exacta del archivo.
2. Código completo.
3. Explicación breve de su función.
4. Cambios realizados.
5. Dependencias necesarias.
6. Migraciones que deben ejecutarse.
7. Comandos necesarios.
8. Orden recomendado de implementación.

Antes de generar el código:

1. Revisa la estructura actual del proyecto.
2. Identifica tecnologías y patrones existentes.
3. Revisa cómo se manejan actualmente los permisos.
4. Revisa cómo se gestionan los archivos e imágenes.
5. Revisa las relaciones de razón social y casino.
6. Reutiliza componentes visuales y servicios existentes.
7. Evita duplicar modelos, rutas o funcionalidades.
8. Informa cualquier conflicto o inconsistencia encontrada.
