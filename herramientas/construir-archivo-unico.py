#!/usr/bin/env python3
"""
Genera la web entera en un único archivo HTML, con la tipografía, los estilos
y el JavaScript metidos dentro.

Para qué sirve: poder enseñar la web sin depender de ningún alojamiento.
Se abre con doble clic, funciona sin internet, se manda por WhatsApp o por
correo, y se puede arrastrar a Netlify Drop para tener una dirección en
treinta segundos.

    python3 herramientas/construir-archivo-unico.py            # Hidrocar
    python3 herramientas/construir-archivo-unico.py che-bolu   # Che Bolú

Para añadir otro sitio basta con una línea más en SITIOS: la carpeta donde
está su index.html y el nombre del archivo que se quiere generar.
"""
import base64
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent

# clave de la línea de comandos -> (carpeta del sitio, archivo de salida)
SITIOS = {
    'hidrocar': ('.',        'hidrocar-una-sola-pagina.html'),
    'che-bolu': ('che-bolu', 'che-bolu-una-sola-pagina.html'),
}


def main(clave='hidrocar'):
    if clave not in SITIOS:
        sys.exit('Sitio desconocido: %s. Opciones: %s'
                 % (clave, ', '.join(SITIOS)))

    carpeta, nombre = SITIOS[clave]
    base = (RAIZ / carpeta).resolve()
    salida = base / nombre

    def leer(rel):
        return (base / rel).read_text(encoding='utf-8')

    def datauri(rel, mime):
        b = (base / rel).read_bytes()
        return 'data:%s;base64,%s' % (mime, base64.b64encode(b).decode('ascii'))

    html = leer('index.html')
    css = leer('assets/css/style.css')
    js = leer('assets/js/main.js')

    # Las tipografías entran como data URI. El bloque latin-ext de Archivo no
    # viaja: no hace falta para escribir en español y pesa de más.
    css = re.sub(
        r"@font-face \{[^}]*archivo-latin-ext\.woff2[^}]*\}\n?", '', css, flags=re.S)
    # Se incrusta cualquier woff2 de assets/fonts/ que la hoja siga referenciando.
    for ref in sorted(set(re.findall(r"\.\./fonts/([\w-]+\.woff2)", css))):
        if (base / 'assets' / 'fonts' / ref).exists():
            css = css.replace("url('../fonts/%s')" % ref,
                              "url(%s)" % datauri('assets/fonts/%s' % ref, 'font/woff2'))

    # Fuera el precargado y la hoja externa: los estilos van incrustados.
    html = re.sub(r'<link rel="preload"[^>]*>\n?', '', html)
    html = html.replace(
        '<link rel="stylesheet" href="assets/css/style.css">',
        '<style>\n%s\n</style>' % css)

    # El icono, también incrustado.
    html = html.replace(
        'href="assets/img/favicon.svg"',
        'href="%s"' % datauri('assets/img/favicon.svg', 'image/svg+xml'))

    # Y el script.
    html = html.replace(
        '<script src="assets/js/main.js" defer></script>',
        '<script>\n%s\n</script>' % js)

    # El aviso legal no viaja en este archivo: el enlace no llevaría a ninguna
    # parte, así que se queda como texto.
    html = html.replace(
        '<p><a href="aviso-legal.html">Aviso legal y privacidad</a></p>',
        '<p>Aviso legal y privacidad</p>')
    html = html.replace('<a href="aviso-legal.html">Aviso legal</a>', '')

    salida.write_text(html, encoding='utf-8')
    print('%s — %.0f KB' % (salida.name, salida.stat().st_size / 1024))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'hidrocar')
