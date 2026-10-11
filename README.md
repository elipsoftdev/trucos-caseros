# Trucos Caseros — restauración estática

Restauración estática basada en el ZIP compartido. Conserva el contenido publicado y los recursos gráficos necesarios para navegarlo como sitio estático. No requiere PHP, Joomla, base de datos, compilación ni servicios externos.

## Publicar en GitHub Pages

1. Crea un repositorio público dedicado en GitHub y sube el contenido de este repositorio a la rama `main`. `index.html`, `app.js`, `styles.css`, `data/` y `assets/` deben quedar en la raíz.
2. En GitHub, abre **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**, elige `main` y la carpeta `/(root)`, y guarda.
4. Espera a que finalice el despliegue de Pages. La dirección se mostrará en **Settings → Pages**; para un repositorio de proyecto suele ser `https://<usuario>.github.io/<repositorio>/`.

El sitio carga el JSON mediante una ruta relativa y usa fragmentos (`#/categoria/...`, `#/articulo/...`) para funcionar bajo la ruta base de un repositorio de proyecto.

## Contenido y alcance

- Se conservan 1.443 artículos publicados presentes en el respaldo, organizados en 18 categorías y 5 secciones.
- Los textos HTML y las imágenes disponibles se sirven desde archivos estáticos locales.
- Los enlaces Joomla a artículos y categorías se convierten a navegación interna; la búsqueda opera localmente sobre el archivo.
- Registro, envío de trucos, foro, comentarios dinámicos, búsquedas del servidor, widgets/ads y administración dependían de Joomla y no forman parte de esta restauración.
- Los archivos corresponden al material histórico disponible; no prueban que fuera la última publicación del dominio original.

## Archivos excluidos

La publicación contiene únicamente la restauración estática. No incluye respaldos SQL/Joomla, configuración del servidor, instaladores, ejecutables, plugins, datos de usuarios/administración ni archivos de credenciales.

## Vista local

Abre `index.html` en un navegador o sirve la carpeta con un servidor HTTP estático. No hay pasos de instalación.
